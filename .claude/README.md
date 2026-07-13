# .claude/ — Claude Code configuration for NOWHERE.ai

## Installed slash-commands (`commands/`)

Five commands curated from the [`claude-code-templates`](https://github.com/davila7/claude-code-templates)
(aitmpl) community marketplace and **reviewed before install** (2026-07-13). All are
user-invoked markdown commands (`/<name>`) with `allowed-tools` frontmatter — **none are
hooks, none auto-execute, none install MCPs**. Invoked on demand by the user.

| Command | What it does | Tools allowed |
|---|---|---|
| `/code-review [file\|commit\|--full]` | Comprehensive code-quality review (security, perf, architecture, tests, docs) | Read, Bash, Grep, Glob |
| `/secrets-scanner [scope\|--fix]` | Scan the tree for exposed keys, credentials, certs, config leaks | Read, Bash, Grep, Glob |
| `/dependency-audit [scope\|--all]` | `npm audit` / `pip check` / CVE + license + supply-chain audit | Read, Bash, Grep |
| `/generate-tests [file\|component]` | Generate a test file for a source file/component (React Testing Library guidance included) | Read, Write, Edit, Bash |
| `/optimize-bundle-size [--vite]` | Vite-bundle size analysis + code-splitting/tree-shaking/lazy-load recommendations | Read, Bash, Grep, Glob |

### Trust review (done before install)

- No `hooks/` and no `.mcp.json` were installed — those execute code on triggers and are a
  separate per-component trust decision the user must make explicitly.
- Each file's body was read in full: no prompt-injection instructing Claude to take harmful
  action, no exfiltration, no destructive commands, no absolute paths, no hardcoded secrets.
- `generate-tests` is the only one that writes files (creates test files), scoped to its
  argument — expected for a test generator.

### Provenance & re-validation

- Source: `C:\Users\sahii\Projects\aitmpl\cli-tool\components\commands\{utilities,security,testing,performance}\*.md`
- Installed 2026-07-13 by copying the reviewed files here.
- aitmpl upstream is MIT-licensed; these command files are prompt content, not code.

### Notes for this repo

- `/dependency-audit` runs `npm audit` against **this** frontend tree. The backend has its own
  `pip-audit` story in `Fixfiz/backend` — see `DEPLOY.md`.
- `/optimize-bundle-size --vite` is directly relevant — `vite.config.ts` already does
  `manualChunks` splitting; this command analyses further wins.
- `/generate-tests` is useful for bootstrapping a test suite (there is none yet;
  `npm run typecheck` is the only static check today).
- `/secrets-scanner` reinforces the `.env` discipline: `.env`/`.env.*` are gitignored
  (except `.env.example`); never commit real `VITE_API_URL` or backend keys.