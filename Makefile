local:
	docker compose up --build

# Production CSS and compressed HTML, which `local` does not show
preview:
	docker compose run --build --rm --service-ports -e JEKYLL_ENV=production site bundle exec jekyll serve --host 0.0.0.0

check:
	docker compose run --build --rm site scripts/check.sh
