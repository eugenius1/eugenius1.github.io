local:
	docker compose up --build

check:
	docker compose run --build --rm site scripts/check.sh
