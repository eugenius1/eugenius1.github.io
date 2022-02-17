SHELL := bash
.SHELLFLAGS := -euo pipefail -c

local:
	bundle exec jekyll serve --drafts
