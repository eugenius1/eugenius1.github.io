# Developing Eusebius.Tech

Everything a contributor needs. The [README](README.md) is for people reading the
site; this is for people changing it; [AGENTS.md](AGENTS.md) holds the handful of
rules that bind coding agents specifically.

## Running it

You need Docker and `make`, which macOS has with the Xcode command line tools and
Linux usually has as a `make` package. Nothing else is installed on the host: the
Dockerfile is the one place the Node and Ruby versions are set. There are no secrets; the Google
Analytics id and Disqus shortname in `_config.yml` are public anyway.

```bash
make local
```

The site, including drafts, is then at <http://localhost:4000>. The `site`
configuration in `.claude/launch.json` starts the same thing for Claude Code.

```bash
make preview
```

Runs the production build at <http://localhost:4001>, which is the only way to see
the theme's real CSS and compressed HTML. The two can run at once, and
`production` in `.claude/launch.json` starts this one.

```bash
make check
```

The gate: run it before every commit. It builds for production and fails if:

- the TypeScript has a type error or a test fails
- an address in `scripts/urls.txt` has gone
- a link between pages or an image is broken
- an image has no alt text
- a tab has no browser title
- a theme file this site overrides has changed

CI runs the same command in `.github/workflows/jekyll_pages.yml`, as the `build`
job. On `master`, its `deploy` job then publishes the site to GitHub Pages at
<https://eusebius.tech> (the domain is in `CNAME`). Pull requests build and check
but don't deploy.

### TypeScript

The site's own scripts are TypeScript in `_ts/`, with their tests beside them.
esbuild compiles `_ts/home-cover.ts` to `js/home-cover.js`, which isn't in git.
`make local` recompiles it on each change, and `make preview` and `make check`
compile it first.

Node runs in Docker too. To run the tests or the type check on their own:

```bash
docker compose run --build --rm node npm test
```

```bash
docker compose run --build --rm node npm run typecheck
```

## Layout

| Path | Purpose |
| --- | --- |
| `_config.yml` | Site settings: title, social links, comments, analytics, permalinks, front matter defaults |
| `_posts/`, `_drafts/` | Blog posts, and posts not yet published |
| `_tabs/` | The pages in the sidebar |
| `pages/`, `projects/` | Other pages, at addresses that follow their folder |
| `go/`, `get/` | Short addresses that redirect elsewhere |
| `donate/` | The page shown after a donation |
| `index.html` | The homepage and its cover photos |
| `_layouts/`, `_includes/` | This site's layouts, and copies of the theme's files with small changes |
| `assets/` | The 404 page and the search index, a copy of the theme's |
| `_data/` | Locale strings (`locales/en.yml`), share buttons, contact links |
| `css/site.css` | This site's own styles |
| `_ts/` | TypeScript for the site's scripts, with tests; compiled into `js/` |
| `js/` | Scripts the site loads |
| `img/`, `raw/` | Images and files; `raw/` is served as-is |
| `archive/` | A frozen copy of the old Beautiful Jekyll site, not checked for links |
| `test/` | Pages for trying features out, not linked from the site |
| `scripts/check.sh` | What `make check` runs after the TypeScript |
| `scripts/urls.txt` | Every address the site served before the move to Jekyll 4 |
| `scripts/theme-overrides.sha256` | Hashes of the theme files this site overrides |
| `Dockerfile`, `compose.yaml`, `Makefile` | The Docker setup behind `make` |

## How it works

The site is [Jekyll](https://jekyllrb.com/) 4 with the
[Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) theme, installed as a
gem. Jekyll uses the theme's files unless the site has one at the same path, so
`_layouts/` and `_includes/` hold only the files this site changes. Each change is
marked with a `{% comment %} This site's change: … {% endcomment %}` line.

GitHub Pages doesn't build the site itself: its own Jekyll is version 3 and allows
only a few plugins. The workflow builds it with the Gemfile's versions and uploads
`_site`.

Comments are Disqus, and their threads are found by the page's full address alone
(see `_includes/comments/disqus.html`): the old threads were made that way, with no
identifier. Google Analytics is set in `_config.yml`.

### Writing

- **Posts** are Markdown in `_posts/`, or `_drafts/` to keep one unpublished. Set
  `description` and `tags`, and `image` for a banner. Its `alt` shows as the caption.
  With `banner: false` under `image`, the image is only in listings and social
  media previews.
- **Sidebar pages** are in `_tabs/`, with an `icon` and `order`. Add a new one's
  lowercase title to `_data/locales/en.yml`, as that sets its browser title.
- **Other pages** are in `pages/` and `projects/`. On a page, `image` is only for
  sharing on social media, so put any image to show in the Markdown. Posts always
  have share buttons; `share: true` adds them to a page, and pages in `projects/`
  have them unless set to `false`.
- **Redirects** are `redirect_from` in a page's front matter for old addresses, or a
  file using `layout: my-redirect` with a `to` address, as in `go/`.

Front matter can load extras on one page with `css` and `js`.

### Changing the look

`css/site.css` holds this site's own styles, including the Bootstrap 3 classes still
used in posts.

The text size, title fonts and green accent are set at the top of `css/site.css`,
with a shade of green for each of light and dark. The share buttons are in
`_data/share.yml`.

The homepage photos and their captions are `covers` in `index.html`.

`theme_mode` in `_config.yml` fixes the site to light or dark. Left empty, it follows
the visitor's system and shows a toggle in the sidebar.

## Things that will bite you

**A class that works in `make local` can be missing in production.** The dev build
loads all of Bootstrap, but the theme's production CSS only ships the Bootstrap
classes the theme uses itself. Check styling in `make preview`, and put any class
posts need in `css/site.css`.

**A theme update can silently undo one of this site's changes.** The overrides are
whole copies of the theme's files, so a newer theme file is ignored. When
`make check` fails on `scripts/theme-overrides.sha256`, bring the copy up to date
with the theme's new version, keep this site's change, then update its hash.

**Changing an address loses its Disqus thread and breaks links to it.** Threads are
looked up by URL, and `scripts/urls.txt` lists every address the old site served.
Moving a page needs `redirect_from` for the old address, and even then its comments
stay at the old one.

**A new tab without a locale entry has a blank browser title.** The theme takes it
from `_data/locales/en.yml` by the tab's lowercase title.

**Emptying a locale string doesn't remove the theme's text.** Only `false` does, as
with the theme's CC BY 4.0 notice under `copyright` in `_data/locales/en.yml`, which
would otherwise mislicense every post.

## Conventions

- `make check` must pass before every commit.
- Comments explain why, not what.
- Commit messages are prose explaining the reasoning and what went wrong, not a
  changelog line. Pull requests are squashed, so the PR description is written the
  same way.
- Never commit secrets or anyone's personal data.
- No licence headers in source files: [LICENSE](LICENSE) covers the code and the
  writing.
