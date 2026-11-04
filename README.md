# Eusebius.Tech

Personal website and blog at <https://eusebius.tech>, built with
[Jekyll](https://jekyllrb.com/) and the
[Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) theme and hosted on
GitHub Pages.

## Run it

You need Docker.

```bash
make local
```

The site, including drafts, is then at <http://localhost:4000>. The `site`
configuration in `.claude/launch.json` starts the same thing for Claude Code.

```bash
make preview
```

Runs the production build at <http://localhost:4001>, which is the only way to see
the theme's real CSS and compressed HTML. `make local` loads all of Bootstrap, so a
class can look fine there and be missing in production. The two can run at once.

```bash
make check
```

Builds for production, then fails if an address in `scripts/urls.txt` has gone, a
link between pages or an image is broken, an image has no alt text, or a theme file
this site overrides has changed. This is what CI runs. The Dockerfile is
the one place the Ruby version is set.

## Write

- **Posts** are Markdown in `_posts/`, or `_drafts/` to keep one unpublished. Set
  `description` and `tags`, and `image` for a banner. Its `alt` shows as the caption.
  With `banner: false` under `image`, the image is only in listings and social
  media previews.
- **Sidebar pages** are in `_tabs/`, with an `icon` and `order`. Add a new one's
  lowercase title to `_data/locales/en.yml`, as that sets its browser title;
  `make check` fails if one is missing.
- **Other pages** are in `pages/` and `projects/`. On a page, `image` is only for
  sharing on social media, so put any image to show in the Markdown. Posts always
  have share buttons; `share: true` adds them to a page, and pages in `projects/`
  have them unless set to `false`.
- **Redirects** are `redirect_from` in a page's front matter for old addresses, or a
  file using `layout: my-redirect` with a `to` address, as in `go/`.

Front matter can load extras on one page with `css` and `js`.

## Change the look

`css/site.css` holds this site's own styles, including the Bootstrap 3 classes still
used in posts. The theme only ships the Bootstrap classes it uses itself.

The text size, title fonts and green accent are set at the top of `css/site.css`,
with a shade of green for each of light and dark. The share buttons are in
`_data/share.yml`.

The homepage photos and their captions are `covers` in `index.html`.

`theme_mode` in `_config.yml` fixes the site to light or dark. Left empty, it follows
the visitor's system and shows a toggle in the sidebar.

## Theme overrides

The files in `scripts/theme-overrides.sha256` are copies of the theme's files with
small changes. When a theme update changes one, `make check` fails. Bring the copy
up to date, then update its hash in that file.
