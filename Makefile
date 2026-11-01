local:
	docker compose up --build

check:
	docker compose run --build --rm site npm run check
