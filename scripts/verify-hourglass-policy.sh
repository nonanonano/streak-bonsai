#!/bin/sh

set -eu

ROOT=${1:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}
FAILED=0

fail() {
  printf 'FORBIDDEN %s\n' "$1" >&2
  FAILED=1
}

MEDIA_FILES=$(find "$ROOT" \
  -path "$ROOT/.git" -prune -o \
  -type f \( -iname '*.mp4' -o -iname '*.mov' -o -iname '*.webm' \) -print)

if [ -n "$MEDIA_FILES" ]; then
  printf '%s\n' "$MEDIA_FILES" >&2
  fail "video files are not allowed in the Sandglass app"
fi

for file in app.js styles.css index.html; do
  path="$ROOT/$file"
  if [ ! -f "$path" ]; then
    fail "missing required UI file: $file"
    continue
  fi
  if grep -En 'timer\.mp4|renderFocusTimerVideo|probeTimerVideo|focus-visual--video|focus-visual__video|<video([[:space:]>])' "$path" >&2; then
    fail "photo/video hourglass code found in $file"
  fi
done

if ! grep -Fq 'function renderFocusSandClock' "$ROOT/app.js"; then
  fail "the approved vector hourglass renderer is missing"
fi

if ! grep -Fq 'return renderFocusSandClock(progressRatio);' "$ROOT/app.js"; then
  fail "the timer is not locked to the approved vector hourglass"
fi

if [ "$FAILED" -ne 0 ]; then
  printf 'Hourglass policy check failed. Do not deploy or submit this build.\n' >&2
  exit 1
fi

printf 'Hourglass policy check passed: vector renderer only.\n'
