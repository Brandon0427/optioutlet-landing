## Commits

Use the `commit-conventions` skill (`.claude/skills/commit-conventions/SKILL.md`) for every commit.

## Graphify

This project uses Graphify to maintain a knowledge graph of the codebase. The semantic cache is committed to git (`graphify-out/cache/semantic/`) but the graph itself is generated locally.

### Navigation rule (mandatory)

Before using Grep, Glob, or reading any file to understand the codebase, always check
if `graphify-out/graph.json` exists. If it does, query the graph first:

- Broad questions → `graphify query "<question>"`
- Relationships between two files/modules → `graphify path "<A>" "<B>"`
- Specific concept → `graphify explain "<concept>"`

Only fall back to Grep/Glob if the graph doesn't exist or the query returns no useful result.

### Setup (once per developer)

```bash
pipx install graphifyy         # install graphify
```

Then open Claude Code and run `/graphify` to build the initial graph. The shared semantic cache avoids re-extracting already processed files — you only pay tokens for new or modified files. Semantic extraction uses Claude subagents only; never Gemini, OpenAI or any other external key, even if one is set in the environment.

**Do NOT run `graphify hook install`.** Its git hooks rebuild on every commit and branch switch, and each rebuild of a labeled graph leaves a dated backup folder in `graphify-out/`. This repo rebuilds lazily instead (below). If the hooks were installed, `graphify hook uninstall`.

### When the graph updates automatically vs. manually

| File type | Extraction | Who runs it | Cost |
|---|---|---|---|
| `.ts`, `.tsx`, `.css`, etc. | AST (deterministic) | Automatic, lazy: before `graphify query/path/explain` | 0 tokens |
| `.md`, HTML mockup (`docs/mockup/`) | Semantic (LLM) | Manual: `/graphify --update` | Tokens (cached in git) |

**Lazy rebuild:** `.claude/hooks/graphify-fresh.sh` (PreToolUse hook in `.claude/settings.json`) runs before any `graphify query/path/explain`. It compares a fingerprint of HEAD + uncommitted diff + untracked files against `graphify-out/.graphify_fingerprint` and rebuilds the code graph only if it changed, with `GRAPHIFY_NO_BACKUP=1`. Commits, pulls, branch switches and unsaved edits are all covered. If `.md` files changed since the last full run (`graphify-out/.graphify_semantic_head`), the hook asks Claude to suggest `/graphify --update` — the result is cached in `graphify-out/cache/semantic/` and won't be paid for again.

**`.graphifyignore`** excludes config (`package.json`, `tsconfig*.json`, `vite.config.ts`, `index.html`), `.claude/`, and the local QA scratch folder `.cache/`. Once it exists graphify stops reading `.gitignore`, so the relevant `.gitignore` paths are repeated there.

### Usage rules

- For questions about the codebase, first run `graphify query "<question>"` if `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for specific concepts.
- Read `graphify-out/GRAPH_REPORT.md` only for general architecture review.
- If `graphify-out/graph.json` does not exist, instruct the developer to run `/graphify` (initial setup or machine change).
