# Notes for coding agents

Deliberately short: this file is loaded into context on every session, so it
carries only attribution and the rules whose cost is unrecoverable if missed.
Anything a test already enforces is left to [CONTRIBUTING.md](CONTRIBUTING.md).
Read CONTRIBUTING.md before changing code.

Eusebius's personal site and blog at <https://eusebius.tech>: Jekyll 4 with the
Chirpy theme, a little TypeScript, all run through Docker and deployed to GitHub
Pages by GitHub Actions.

## Before every commit

```bash
make check
```

## Before every push

Strongly recommended: run `/code-review --fix` (or your tool's equivalent
review-and-fix pass) over the branch's changes, using Claude Sonnet or a model of
similar strength, then run the pre-commit check above on its fixes and commit
them. It catches mistakes, duplication and needless complexity that the checks don't.

## Attribution

End every commit message with:

```
Co-Authored-By: <the model that actually did the work> <noreply@anthropic.com>
```

Commit messages themselves are prose explaining the reasoning and what went
wrong — not a changelog line.

## Never change or remove a published URL without a redirect

Disqus threads and inbound links follow URLs. Moving or renaming a post or page
needs `redirect_from` in its front matter for the old address (or a
`layout: my-redirect` file, as in `go/`). `make check` only catches this for the
addresses in `scripts/urls.txt`, which the site served before the move to Jekyll
4; anything newer is on you. Never delete a line from it to make the check pass.
