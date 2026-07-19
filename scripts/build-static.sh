#!/bin/sh

set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
DIST="$ROOT/dist"

"$ROOT/scripts/verify-hourglass-policy.sh" "$ROOT"

rm -rf "$DIST"
mkdir -p "$DIST"

for file in app.js hourglass-favicon.svg index.html privacy.html styles.css supabase.js; do
  cp "$ROOT/$file" "$DIST/$file"
done

printf 'Static build ready: %s\n' "$DIST"
