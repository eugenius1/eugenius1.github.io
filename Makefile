# Compiles once first, so Jekyll's first build has the scripts
local:
	docker compose run --build --rm node npm run build
	docker compose up --build

# Production CSS and compressed HTML, which `local` does not show. Its own port and
# build folder let it run alongside `local`.
preview:
	docker compose run --build --rm node npm run build
	docker compose run --build --rm -p 127.0.0.1:4001:4001 -e JEKYLL_ENV=production site bundle exec jekyll serve --host 0.0.0.0 --port 4001 --destination /tmp/site

# Type check, tests and the compiled JavaScript, then the site.
check:
	docker compose run --build --rm node npm run check
	docker compose run --build --rm site scripts/check.sh

# Links to other sites, as the weekly workflow checks them, over the site that
# `check` built. Settings are in lychee.toml.
links:
	docker run --rm -v "$(CURDIR)":/site -w /site lycheeverse/lychee:0.24.2 --config lychee.toml '_site/**/*.html'
