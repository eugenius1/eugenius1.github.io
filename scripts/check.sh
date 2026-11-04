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

# The theme leaves a tab's browser title blank without an entry in the locale file.
if grep -rlE '<title>\s*(\||</title>)' _site --include='*.html'; then
  echo "Blank browser titles above: add the tabs to _data/locales/en.yml" >&2
  exit 1
fi

# Links between pages, anchors, images and their alt text. Links to other sites are
# left out, as those go down or block bots now and then, and so is upgrading them
# to https, which needs each site checked. Anchors with only an id are allowed, as
# in HTML5. The archive is a frozen copy of the old site, and drafts/ccd is an
# unlisted draft whose charts aren't in the repo yet.
bundle exec htmlproofer _site \
  --disable-external \
  --no-enforce-https \
  --allow-missing-href \
  --ignore-files '/^_site\/(archive|drafts)\//'

# Fails when a theme update changes a file this site overrides, so the copy can
# be brought up to date.
overrides="$PWD/scripts/theme-overrides.sha256"
(cd "$(bundle info --path jekyll-theme-chirpy)" && sha256sum --check --quiet "$overrides")
