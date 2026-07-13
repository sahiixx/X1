# AirLLM ↔ NOWHERE.AI Agency Engine — Integration Design

> Status: **design only** (2026-07-13). No code changed on this box. This is the
> plan for running the agency engine's big models on a **separate GPU host**
> via AirLLM instead of (or alongside) Ollama Cloud.

## TL;DR

`agency_engine.py` speaks the **Ollama HTTP protocol** (`POST /api/chat`,
`GET /api/tags`, optional Bearer auth) and is agnostic to what serves it.
**AirLLM is a pure Python library** (`AutoModel.from_pretrained` →
`model.generate`), with **no HTTP server**. The integration is therefore a
thin **Ollama-compatible bridge** in front of AirLLM, deployed on a real NVIDIA
GPU box. The agency engine then points at it with **one env var** — zero code
changes.

```
┌──────────────────┐   Ollama /api/chat    ┌──────────────────┐  AirLLM   ┌─────────┐
│ Fixfiz backend    │ ───────────────────▶ │ airllm-bridge     │ ───────▶ │ GPU box │
│ agency_engine.py  │ ◀─────────────────── │ (FastAPI on GPU)  │ ◀─────── │  (CUDA) │
│ (this box / Render) │  {message:{content}}│ Ollama-shaped resp │ generate │         │
└──────────────────┘                       └──────────────────┘           └─────────┘
        AGENCY_OLLAMA_URL = http://<gpu-box>:11434
```

## Why a bridge is required (the gap)

AirLLM's entire surface is in-process Python:

```python
from airllm import AutoModel
model = AutoModel.from_pretrained("Qwen/Qwen3-32B", compression='4bit')  # or '8bit' / None
input_ids = model.tokenizer(prompt, return_tensors="pt", return_attention_mask=False)['input_ids'].cuda()
out = model.generate(input_ids, max_new_tokens=512, use_cache=True, return_dict_in_generate=True)
text = model.tokenizer.decode(out.sequences[0])
```

- **No HTTP server, no OpenAI endpoint, no `/api/chat`.** You import it.
- **No streaming** — `generate()` returns a full sequence, decoded to a string.
- **CUDA-only** for GPU (`.cuda()`); CPU path exists but unusably slow for 70B+;
  MLX path for Apple Silicon.

The agency engine only does HTTP. So we wrap AirLLM in a small Ollama-shaped
HTTP server. Nothing about AirLLM changes; nothing about `agency_engine.py`
changes.

## The bridge: `airllm-bridge`

A single-file FastAPI (or aiohttp) app, ~150 LOC, running on the GPU box.

### Endpoints (Ollama-shaped, to match `agency_engine.py`)

**`GET /api/tags`** → list loaded/available models, matching Ollama:
```json
{"models": [{"name": "deepseek-v3:671b"}, {"name": "qwen3:32b"}, ...]}
```
The names are whatever you register in the bridge's model map (see below).

**`POST /api/chat`** body `{"model","messages":[{"role","content"}],"stream":false}`
→ run AirLLM and return Ollama's response shape:
```json
{
  "model": "deepseek-v3:671b",
  "created": 0,
  "message": {"role": "assistant", "content": "<decoded text>"},
  "done": true,
  "eval_count": 312,
  "total_duration": 84500000000
}
```
`agency_engine.py` reads `message.content`, `eval_count`, `total_duration` —
so those three fields are the only ones that must be truthful.

### Request flow

1. Look up `body.model` in the **model map** (`ollama_name → hf_id + compression`).
   404 with a clear message if unknown (mirrors Ollama's "model not found").
2. Build the prompt with the HF tokenizer's **chat template**:
   ```python
   prompt_ids = model.tokenizer.apply_chat_template(
       messages, tokenize=True, add_generation_prompt=True,
       return_tensors="pt").cuda()
   ```
   This handles the `system` + `user` roles the agency engine already sends —
   AirLLM never sees raw role objects, only the templated token ids.
3. **Serialize** through an `asyncio.Lock` (or a 1-slot queue). AirLLM is
   single-GPU serial inference — concurrent requests would OOM or corrupt state.
   Respond `503`/queue if busy (agency engine already tolerates latency + has a
   configurable `_TIMEOUT`).
4. `model.generate(prompt_ids, max_new_tokens=512, use_cache=True, return_dict_in_generate=True)`
5. `model.tokenizer.decode(...)` → content; `len(out.sequences[0]) - len(prompt_ids)` → eval_count;
   monotonic time delta → total_duration (ns).
6. Return the Ollama-shaped dict above.

### Model lifecycle

- Load **lazily on first request** for a given model (first call is slow —
  AirLLM splits/loads layers; `from_pretrained` is the expensive step).
- **Cache the loaded `model` object** in a dict keyed by `ollama_name` so
  subsequent calls skip `from_pretrained`. AirLLM re-reads layers from disk each
  forward pass anyway (that's the whole point), but the split/index stays cached.
- Optional: pre-warm a default model at startup (`AGENCY_OLLAMA_MODEL`).
- **One model resident at a time** is the sane default (VRAM); evict-on-swap if
  you want to juggle more than one. Keep it simple: one resident model.

### Model name map (the one piece of config)

AirLLM uses HuggingFace IDs; the agency engine sends Ollama-style names
(`glm-5.2`, `deepseek-v3.1:671b`). The bridge owns the translation:

```python
MODELS = {
    "qwen3:32b":      {"hf": "Qwen/Qwen3-32B",            "compression": "4bit"},
    "deepseek-v3:671b":{"hf": "deepseek-ai/DeepSeek-V3",  "compression": "4bit"},
    "llama3-405b":    {"hf": "meta-llama/Llama-3.1-405B", "compression": "4bit"},
    "phi4":           {"hf": "microsoft/Phi-4",            "compression": None},
}
```
Set the agency engine's `AGENCY_OLLAMA_MODEL` to one of these keys.

## Agency-engine change: ONE env var, zero code

In `backend/.agency.env` (or PaaS host env):

```bash
# was:  AGENCY_OLLAMA_URL=https://ollama.com
AGENCY_OLLAMA_URL=http://<gpu-box-host>:11434
AGENCY_OLLAMA_API_KEY=<bridge-auth-key-or-empty>
AGENCY_OLLAMA_MODEL=qwen3:32b
```

`agency_engine.py` needs **no edit** — `_ollama_chat`, `_auth_headers`,
`health()`, `run_agent()` all already target `{OLLAMA_URL}/api/chat|tags`
generically. Verify by hitting `/api/agency/health` after the swap: it should
report `reachable: true`, `cloud: false` (no key) or `true` (key set), and the
bridge's model list.

## Deploy target: the GPU box

AirLLM needs an **NVIDIA GPU** (CUDA). This Windows box has none (only a 512 MB
AMD iGPU) — so the bridge runs elsewhere.

| Need | Minimum | Notes |
|---|---|---|
| GPU VRAM | **4 GB** (the whole pitch of AirLLM) | 8–12 GB comfortable for 70B; 671B wants ~12 GB + fast disk |
| GPU compute | CUDA-capable NVIDIA | RTX 3060/4060 8GB up; A100/H100 if you can |
| Disk | **lots, fast NVMe** | 671B in 4bit ≈ **336 GB**; Qwen3-235B 4bit ≈ 118 GB; Llama-405B 4bit ≈ 200 GB. Layer-by-layer reads the weights every pass — slow disk kills throughput. |
| Runtime | Python + PyTorch (CUDA) + airllm + transformers + bitsandbytes | `pip install airllm torch transformers bitsandbytes` |
| Network | Reachable from the Fixfiz backend host | Put behind HTTPS + a Bearer key (the agency engine already sends `Authorization: Bearer`). |

**Host options:** RunPod / Lambda Labs / Vast.ai hourly GPU (cheapest for
experiments), or a home NVIDIA box, or a Cloud GPU always-on instance. Not
Render/Railway (no GPU tiers worth using for this).

## Honest constraints (read before deploying)

1. **Latency is the trade.** AirLLM trades speed for memory. A 70B model on 8 GB
   may be **seconds-to-tens-of-seconds per response** (layer I/O dominates). 671B
   is slower still. Fine for async agent runs (the agency engine has a
   configurable 120 s timeout, bump `AGENCY_OLLAMA_TIMEOUT`). **Not fine for
   interactive chat.** Ollama Cloud stays faster.
2. **No streaming.** AirLLM returns a full sequence. The bridge returns the
   whole thing at once — which is exactly what `agency_engine.py` already does
   (`"stream": false`). ✓ compatible, but the frontend console waits for the
   full response (no token trickle).
3. **Single-flight.** One inference at a time. The bridge serializes. The
   agency engine fires one request per agent run, so this is fine for the
   current UI; it would bottleneck a high-concurrency multi-tenant product.
4. **Disk cost is the real bill.** The models are huge. One 671B model is a
   third of a terabyte. This is why Ollama Cloud (they host the weights) is
   economically rational for prod; AirLLM is rational when you *already have*
   the GPU + disk, or want sovereignty/no-rate-limits.
5. **Not viable on this box.** No CUDA GPU → AirLLM can't run here. This design
   is for a separate GPU host.

## When to use which

| Use case | Backend |
|---|---|
| **Prod agency engine (today, fast, no ops)** | **Ollama Cloud** (current setup) — managed, fast, 34 models ready |
| **Sovereignty / no rate limits / you own a GPU** | **airllm-bridge** on your GPU box |
| **Local dev / experiment with a model Ollama Cloud doesn't offer** | **airllm-bridge** on a rented RunPod GPU |
| **Interactive low-latency chat** | Neither AirLLM — use Ollama Cloud or a real serving stack (vLLM/TGI) |

## Build order (when you have a GPU box)

1. On the GPU box: `pip install airllm torch transformers bitsandbytes fastapi uvicorn`
2. Write `airllm_bridge.py` (~150 LOC) per the endpoints above, with one model
   in the map to start (e.g. `qwen3:32b` 4bit — smallest credible agency model).
3. `uvicorn airllm_bridge:app --host 0.0.0.0 --port 11434`, curl `/api/tags`
   and `/api/chat` locally to confirm Ollama shape.
4. Expose securely (HTTPS + Bearer key) — point `AGENCY_OLLAMA_URL` at it.
5. From the Fixfiz backend: `GET /api/agency/health` → `reachable: true`. Then
   `POST /api/agency/run/<persona>` with `model=qwen3:32b` → real AirLLM output.
6. If a response is slow, bump `AGENCY_OLLAMA_TIMEOUT` in `.agency.env`.

> I (Claude) can write `airllm_bridge.py` now (it's pure design code, runs on
> any Python) — but it can't be *tested* here (no GPU). Tell me when you have
> the GPU box and I'll write + ship the bridge for you to run there.