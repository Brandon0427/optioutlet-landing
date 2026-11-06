#!/bin/sh
# Lazy graphify rebuild — Claude Code PreToolUse hook (Bash).
#
# Instead of rebuilding the graph on every commit or branch switch, rebuild it
# only right before someone reads it (graphify query / path / explain), and only
# if the repo changed since the last build. "Changed" = a fingerprint of HEAD,
# the uncommitted diff and the untracked files, so commits, pulls, branch
# switches and unsaved edits all count.
#
# Rebuilds code only (AST, no LLM). If .md files changed since the last full
# /graphify run (graphify-out/.graphify_semantic_head), tells Claude to suggest
# /graphify --update. Exits 0 on every path: it must never block the command.

INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null)
case "$CMD" in
    *"graphify query"*|*"graphify path"*|*"graphify explain"*) ;;
    *) exit 0 ;;
esac

ROOT=$(git -C "${CLAUDE_PROJECT_DIR:-.}" rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$ROOT" || exit 0
OUT=graphify-out
[ -f "$OUT/graph.json" ] || exit 0

PY=$(cat "$OUT/.graphify_python" 2>/dev/null)
case "$PY" in ""|*[!a-zA-Z0-9/_.@-]*) exit 0 ;; esac
"$PY" -c "import graphify" 2>/dev/null || exit 0

HEAD=$(git rev-parse HEAD 2>/dev/null) || exit 0
DIFF_SHA=$({ git diff HEAD; git ls-files -o --exclude-standard; } 2>/dev/null | shasum | cut -d' ' -f1)
FP="$HEAD $DIFF_SHA"
FP_FILE="$OUT/.graphify_fingerprint"

if [ "$(cat "$FP_FILE" 2>/dev/null)" != "$FP" ]; then
    LOG="${HOME}/.cache/graphify-rebuild.log"
    mkdir -p "$(dirname "$LOG")"
    if GRAPHIFY_NO_BACKUP=1 "$PY" -c "
import sys
from pathlib import Path
from graphify.watch import _rebuild_code
sys.exit(0 if _rebuild_code(Path('.'), block_on_lock=True) else 1)
" >> "$LOG" 2>&1; then
        printf '%s' "$FP" > "$FP_FILE"
    fi
fi

SEM_HEAD=$(cat "$OUT/.graphify_semantic_head" 2>/dev/null)
[ -n "$SEM_HEAD" ] || exit 0
DOCS=$({ git diff --name-only "$SEM_HEAD" -- '*.md'; git ls-files -o --exclude-standard -- '*.md'; } 2>/dev/null | sort -u | grep -c .)
if [ "$DOCS" -gt 0 ]; then
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"graphify: code graph is current, but %s .md file(s) changed since the last full /graphify run, so their concepts may be missing or stale. Mention to the user that /graphify --update would refresh them (uses tokens)."}}' "$DOCS"
fi
exit 0
