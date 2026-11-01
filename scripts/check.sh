#!/bin/bash
# Production build, then the checks CI relies on. Run with `make check`.
set -euo pipefail
cd "$(dirname "$0")/.."

JEKYLL_ENV=production bundle exec jekyll build

# Every address the site served before the move to Jekyll 4 must still exist.
missing=$(comm -23 <(sort scripts/urls.txt) <(cd _site && find . -type f | sed 's|^\./||' | sort))
if [ -n "$missing" ]; then
  echo "Missing from _site:" >&2
  echo "$missing" >&2
  exit 1
fi
