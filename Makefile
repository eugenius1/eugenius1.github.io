# The port to serve on, for example `make local PORT=4002`. Claude Code's preview sets
# PORT to a free one, so each checkout or worktree can run its own site at once.
# Live reload uses the port 31729 up, so 35729 by default.
local: PORT ?= 4000
preview: PORT ?= 4001
LIVERELOAD_PORT = $(shell expr $(PORT) + 31729)

# Docker Compose names a project after its folder, so two checkouts in folders of the
# same name would share containers. A hash of the full path keeps them apart.
export COMPOSE_PROJECT_NAME ?= $(shell printf '%s' '$(notdir $(CURDIR))' | tr 'A-Z' 'a-z' | tr -c 'a-z0-9_-' '-')-$(shell printf '%s' '$(CURDIR)' | cksum | cut -d ' ' -f 1)

# Compiles once first, so Jekyll's first build has the scripts
local:
	@test $(PORT) -le 33806 || { echo "PORT must be 33806 or lower, so live reload's port stays below 65536"; exit 1; }
	docker compose run --build --rm node npm run build
	PORT=$(PORT) LIVERELOAD_PORT=$(LIVERELOAD_PORT) docker compose up --build

# Production CSS and compressed HTML, which `local` does not show. Its own port and
# build folder let it run alongside `local`.
preview:
	docker compose run --build --rm node npm run build
	docker compose run --build --rm -p 127.0.0.1:$(PORT):$(PORT) -e JEKYLL_ENV=production site bundle exec jekyll serve --host 0.0.0.0 --port $(PORT) --destination /tmp/site

# Type check, tests and the compiled JavaScript, then the site.
check:
	docker compose run --build --rm node npm run check
	docker compose run --build --rm site scripts/check.sh
