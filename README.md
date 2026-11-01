# Eusebius.Tech

Personal website and blog at <https://eusebius.tech>, built with
[Hugo](https://gohugo.io/) and the [Blowfish](https://blowfish.page/) theme and
hosted on GitHub Pages.

## Run it

You need Docker. Clone with `--recurse-submodules`, as the theme is a submodule.

```bash
make local
```

The site, including drafts, is then at <http://localhost:1313>. The `site`
configuration in `.claude/launch.json` starts the same thing for Claude Code.

```bash
make check
```

This type checks, runs the tests and does a production build, the same as CI.
The Dockerfile is the one place the Hugo and Node versions are set.

## Write

- **Posts** are Markdown in `content/blog/`. Set `tags` in the front matter and
  `draft: true` to keep one unpublished.
- **Pages** are Markdown in `content/pages/`, each with its own `url`.
- **Redirects** are files in `content/pages/redirects/` with a `title`, `url` and
  `to` address. `aliases` in front matter adds old URLs to any page.

## Images

Commit only the original, in `raw/img/`. Reference it as `/img/...` in Markdown
and the build publishes resized versions. Originals stay available under
`/raw/img/...`, which is also where PDFs live, under `/raw/docs/...`.

## Change the look

Set `colorScheme` in `config/_default/params.toml`; the options are listed
there. `assets/css/custom.css` holds this site's own styles.

Set `heroStyle: cover` and `featureimage` on a page to show its title over a
cover image. The homepage carousel is in `content/_index.md`. It uses a copy of Blowfish's
shortcode in `layouts/shortcodes/carousel.html`, changed so the build optimises
its images. `tests/theme-overrides.test.ts` fails when a theme update changes a
file copied from Blowfish, so the copy can be brought up to date.

## Scripts

TypeScript lives in `assets/ts/`, with tests beside the code. A page loads a
bundle by setting `bundle` in its front matter, which builds
`assets/ts/<bundle>/main.ts`.

`assets/js/instagram-lists/satellite.js` stays as JavaScript because people paste
it into the browser console on instagram.com. The copy they see is in
`content/pages/instagram-lists.md`. The old login demos in `static/` are also
left as they were.
