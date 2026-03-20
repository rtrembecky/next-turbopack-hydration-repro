#!/usr/bin/env bash
# Runs the Playwright regression test across multiple Next.js versions.
# Usage: ./run-matrix.sh
# Requires: pnpm, Node >= 18

set -euo pipefail

PORT=3001
PASS="✅ PASS"
FAIL="❌ FAIL"
results=()

install_and_test() {
  local label="$1"
  local next_version="$2"
  local react_version="$3"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Testing: next@${next_version}  react@${react_version}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  pnpm add "next@${next_version}" "react@${react_version}" "react-dom@${react_version}" --silent 2>&1 | tail -2

  if pnpm playwright test --reporter=list 2>&1; then
    results+=("${PASS}  ${label}  (next@${next_version})")
  else
    results+=("${FAIL}  ${label}  (next@${next_version})")
  fi
}

# Install Playwright browser if not already present
pnpm playwright install chromium --quiet 2>/dev/null || true

# ── Version matrix ──────────────────────────────────────────────────────────
# Last known-good — should PASS
install_and_test "15.1.6 (last good)" "15.1.6" "^18"

# Bug introduced here — should FAIL
install_and_test "15.2.0 (first bad)" "15.2.0" "^18"

# Our current production version — should FAIL
install_and_test "16.1.7 (current)" "16.1.7" "^19"

# Latest stable — should FAIL (fix not yet released)
install_and_test "16.2.0 (latest stable)" "16.2.0" "^19"

# Latest canary — FAIL until PR #85803 merges
install_and_test "$(npm show next@canary version 2>/dev/null || echo canary)" "canary" "^19"

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo "  Results"
echo "════════════════════════════════════════"
for r in "${results[@]}"; do
  echo "  $r"
done
echo ""
