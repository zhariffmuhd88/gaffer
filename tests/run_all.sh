#!/usr/bin/env bash
# Runs the whole test suite: node logic tests, old-save migrations and Playwright browser checks.
# Usage: tests/run_all.sh [OUT_DIR] [JOBS]   (screenshots go to OUT_DIR; default ./test-out, 4 parallel jobs)
cd "$(dirname "$0")/.." || exit 1
OUT=${1:-test-out}; JOBS=${2:-4}; mkdir -p "$OUT/logs"
python3 build.py >/dev/null && python3 build_pwa.py >/dev/null; rm -f bundle.js
NODE_TESTS="sa_test ll_test rep_test clublife_test sel_test ch_test club_test cmp_test so_test xl_test intl_test youth_test social_test clinch_test xlcup_test rv_quick ps_test asia_test asia2_test sa_old_save ll_old_save xl_old_save intl_old_save cwc_old_save"
PY_TESTS="smoke ll_browser sa_browser xl_browser rep_browser cmp_browser so_browser rv_browser ps_browser polish_browser sel_browser club_browser intl_browser youth_browser"
run() { # name cmd...
  local n=$1; shift; local log="$OUT/logs/$n.log"
  timeout 900 "$@" >"$log" 2>&1; local rc=$?
  if [ $rc -ne 0 ] || grep -qE "^ERR |Uncaught|TypeError|ReferenceError|SyntaxError|errors \[['\"]|page ?errors?: *\[['\"]" "$log"; then echo "FAIL $n (exit $rc)"; else echo "ok   $n"; fi
}
export -f run; export OUT
{ for t in $NODE_TESTS; do [ -f "tests/$t.js" ] && echo "$t node tests/$t.js $( [ $t = intl_test ] && echo dual ARS 2 )"; done
  for t in $PY_TESTS; do [ -f "tests/$t.py" ] && echo "$t python3 tests/$t.py $OUT"; done; } |
  xargs -P "$JOBS" -I{} bash -c 'run {}' | sort | tee "$OUT/summary.txt"
FAILS=$(grep -c '^FAIL' "$OUT/summary.txt"); echo "---- $(grep -c '^ok' "$OUT/summary.txt") passed, $FAILS failed (logs in $OUT/logs)"
exit $((FAILS > 0))
