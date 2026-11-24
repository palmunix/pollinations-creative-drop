#!/usr/bin/env bash
# Check that the environment can run a creative drop. Never prints credentials.
set -euo pipefail

POLLI=(polli)
if ! command -v polli >/dev/null 2>&1; then
  if command -v npx >/dev/null 2>&1; then
    POLLI=(npx --yes @pollinations/cli)
  else
    echo "ERROR: neither 'polli' nor 'npx' is available. Install Node.js 18+." >&2
    exit 1
  fi
fi

echo "CLI: ${POLLI[*]}"

if ! "${POLLI[@]}" auth status >/dev/null 2>&1; then
  echo "ERROR: not authenticated." >&2
  echo "Ask the user to run: ${POLLI[*]} auth login" >&2
  exit 1
fi
echo "OK: authenticated"

echo "Balance:"
"${POLLI[@]}" usage 2>/dev/null || echo "  (could not read balance)"

echo "Image models (healthy, free):"
"${POLLI[@]}" models --type image --json 2>/dev/null \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      try {
        const list=JSON.parse(s);
        const ok=list.filter(m=>m.paid_only===false && m.health?.status==="healthy").slice(0,5);
        if(!ok.length){console.log("  (none found)");return;}
        ok.forEach(m=>console.log("  "+m.name+" — "+m.title));
      } catch { console.log("  (could not parse model list; see references/api-recipes.md)"); }
    })' \
  || echo "  (could not list models; see references/api-recipes.md)"

echo "NOTE: video models are paid-only. Check paid balance and ask before spending."
echo "Preflight complete."
