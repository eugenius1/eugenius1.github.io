#!/bin/bash
# Production build, then the checks CI relies on. Run with `make check`, which
# compiles the TypeScript first.
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

# Links between pages, anchors, images and their alt text, and that links use https.
# Whether other sites are up is left to the weekly lychee check
# (.github/workflows/links.yml), as they go down or block bots now and then.
# Anchors with only an id are allowed, as in HTML5. The archive is a frozen copy of
# the old site.
bundle exec htmlproofer _site \
  --disable-external \
  --allow-missing-href \
  --ignore-files '/^_site\/archive\//'

# Each short link in _redirects/, and each old address in a `redirect_from`, is a
# redirect page that sends the visitor where jekyll-redirect-from's own list says,
# not an ordinary page at the same address.
ruby -ryaml -rjson -rcgi -e '
  redirects = JSON.parse(File.read("_site/redirects.json"))
  bad = Dir["_redirects/**/*.md"].filter_map do |file|
    link = YAML.load_file(file)["permalink"]
    "#{file}: #{link} is not a redirect" unless redirects.key?(link)
  end
  redirects.each do |from, to|
    page = from.end_with?("/") ? "_site#{from}index.html" : "_site#{from}"
    unless File.exist?(page) && File.read(page).include?("url=#{CGI.escapeHTML(to)}\"")
      bad << "#{page} does not redirect to #{to}"
    end
  end
  abort(bad.join("\n")) unless bad.empty?
'

# Fails when a theme update changes a file this site overrides, so the copy can
# be brought up to date.
overrides="$PWD/scripts/theme-overrides.sha256"
(cd "$(bundle info --path jekyll-theme-chirpy)" && sha256sum --check --quiet "$overrides")
