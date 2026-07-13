# NOWHERE.ai Agency Persona Pack — aitmpl submission artifact

12 Claude Code **agent** components built from the NOWHERE.ai / Fixfiz `agency_personas`
library, packaged in the [`claude-code-templates`](https://github.com/davila7/claude-code-templates)
(aitmpl) component format. Ready to install into any project's `.claude/` or to submit
upstream to the marketplace.

## What's in here

```
aitmpl-pack/agents/nowhere-agency/
├── marketing-content-creator.md
├── marketing-growth-hacker.md
├── marketing-instagram-curator.md
├── marketing-linkedin-content-creator.md
├── marketing-seo-specialist.md
├── marketing-social-media-strategist.md
├── marketing-tiktok-strategist.md
├── sales-deal-strategist.md
├── sales-discovery-coach.md
├── sales-outbound-strategist.md
├── sales-pipeline-analyst.md
└── sales-proposal-strategist.md
```

Each file is a single agent component:

```yaml
---
name: <kebab-slug>            # matches filename; the install id
description: |                # the auto-invocation trigger — example-rich, Dubai-agency flavored
  Use when ... <example> ... </example>
model: sonnet
tools: WebFetch, WebSearch, Read, Write, Edit
---

<system prompt body — reused verbatim from the source persona>
```

The `description` field is the load-bearing part of the aitmpl agent format: the host
Claude reads it to decide **when to auto-spawn** this agent, so it is written with
`<example>` (Context / user / assistant / `<commentary>`) blocks in the same style the
upstream repo uses (see `davila7/claude-code-templates` `cli-tool/components/agents/`).

The **bodies are the original persona system prompts, byte-for-byte** — the IP that
powers `agency_engine.py`'s `/api/agency/run/<persona>` endpoint. Only the frontmatter
was rewritten to the aitmpl schema (`name` → kebab slug, `description` → trigger text,
`model`/`tools` added); the `color`/`emoji`/`vibe` UI fields from the source were dropped
(aitmpl agents don't use them).

## Install (consume)

Into a project that has Claude Code:

```bash
# one agent
npx claude-code-templates@latest --agent marketing-content-creator
# several
npx claude-code-templates@latest --agent marketing-seo-specialist --agent sales-deal-strategist
```

But these are **not yet in the marketplace** — `npx` will only find them once they're
merged upstream. To use them **locally now**, copy any file into your project's
`.claude/agents/` directly:

```powershell
Copy-Item C:\Users\sahii\Projects\nowhere-ai\aitmpl-pack\agents\nowhere-agency\*.md `
          <your-project>\.claude\agents\
```

## Submit upstream (publish)

To publish to the marketplace at [aitmpl.com](https://www.aitmpl.com):

1. **Fork** `davila7/claude-code-templates` on GitHub.
2. Copy this folder into the fork at `cli-tool/components/agents/nowhere-agency/`
   (mirrors the path exactly — `nowhere-agency` is a new category dir, which the catalog
   generator scans automatically).
3. **Validate every file with the repo's `component-reviewer` agent** (required by their
   CONTRIBUTING/CLAUDE.md):
   ```
   Use the component-reviewer agent to review cli-tool/components/agents/nowhere-agency/
   ```
   It checks: valid YAML frontmatter, kebab-case names, no hardcoded secrets, relative
   paths only, clear descriptions, correct category placement. These files should pass
   (verified locally: names match filenames, no secrets, no absolute paths, descriptions
   are specific and example-rich). Skills also get scanned by SkillSpector — these are
   *agents*, not skills, so that scan does not apply.
4. Regenerate the catalog:
   ```bash
   python scripts/generate_components_json.py
   ```
5. Commit + PR to `davila7/claude-code-templates` with a note that these are the
   NOWHERE.ai Dubai marketing-agency personas.

## ⚠️ The one decision that's yours, not mine

`davila7/claude-code-templates` is **MIT-licensed**. Submitting these personas upstream
means **publishing the persona system prompts — your agency's IP — under MIT**, so
anyone can use them commercially, including competitors. That is a real trade:

- **Publish** → distribution + discoverability + a public portfolio for NOWHERE.ai,
  at the cost of open-sourcing the prompt IP.
- **Keep private** → the personas stay a proprietary edge; install them only into your
  own `.claude/agents/` (the "Install locally now" path above) and skip the upstream PR.

The pack is built so either choice is one step. I did **not** open a PR or push anything —
that call is yours.

## Provenance

- **Source:** `C:\Users\sahii\Projects\Fixfiz\backend\agency_personas\*.md` (the
  `agency_engine.py` persona library — 12 personas).
- **Built by:** `_build_aitmpl_pack.py` (frontmatter rewrite + verbatim body copy;
  bodies never pass through the build script's stdout).
- **Date:** 2026-07-13.