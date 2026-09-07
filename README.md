# Instagram to PDF

Turn any **public Instagram post** — a single photo or a full multi-image carousel — into
a clean, ready-to-share **PDF** or a **folder of full-resolution images**. No app, no login to
Instagram, no browser extension. It runs entirely on GitHub Actions.

<p>
  <img alt="workflow" src="https://img.shields.io/badge/GitHub%20Actions-workflow__dispatch-2ea44f?logo=githubactions&logoColor=white">
  <img alt="node" src="https://img.shields.io/badge/node-20-339933?logo=node.js&logoColor=white">
  <img alt="playwright" src="https://img.shields.io/badge/playwright-chromium-2EAD33?logo=playwright&logoColor=white">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-blue">
</p>

## Why

Free patterns, recipes, tutorials, and other multi-photo posts on Instagram are easy to lose in your
feed and awkward to save. This project fetches every image in a post — Instagram serves carousels one
slide at a time, so a plain "save image" doesn't work — and packages them into a single PDF or a plain
image folder so you can keep them for good.

## Features

- Works with both **single-image posts** and **carousels** (any number of slides)
- Two output formats: a **PDF** (one image per page) or a **zip of the original JPGs**
- No dependency on the Instagram API, no account/session cookies required for public posts
- Runs entirely in GitHub Actions — nothing to install, nothing to keep running on your own machine
- Ships with a small **static web app** (`index.html`) so you can trigger it by pasting a link,
  instead of using the GitHub Actions UI directly

## Try it: the web app

Open **[index.html](./index.html)** (served via GitHub Pages once enabled on this repo, or just open
the file locally) and:

1. Paste the Instagram post URL
2. Click **Download All Images** or **Download as PDF**
3. Wait ~1-2 minutes while it runs in GitHub Actions
4. Your browser opens the finished file for download

The web app is a static page with no backend of its own — it calls the GitHub REST API directly from
your browser to start the workflow, waits for it to finish, then opens the resulting GitHub Actions
artifact (which your browser downloads using your normal, already-logged-in GitHub session).

The first time you use it, you'll be asked for a **GitHub personal access token** scoped only to this
repository's Actions (see the in-page instructions). The token is stored only in your browser's local
storage and is only ever sent to `api.github.com`.

## Try it: GitHub Actions UI (no web app needed)

1. Go to **Actions &rsaquo; Instagram to PDF &rsaquo; Run workflow**
2. Paste the post URL into `post_url`
3. Click **Run workflow** and wait for the green checkmark
4. Open the finished run and download the `instagram-pdf` or `instagram-images` artifact under
   **Artifacts**

This works from literally any device with a browser — Windows, Android, iPad, whatever — since the
actual work happens on GitHub's runners, not on your device.

## How it works

Instagram serves a carousel post as a **virtualized slider**: only a few `<li>` slides exist in the DOM
at any time, each with `transform: translateX(Npx)`, but that offset is a position *within the whole
track*, not the viewport — the parent element is what actually scrolls. So instead of reading each
slide's own transform, the script:

1. Opens the post with a headless Chromium browser (Playwright)
2. Dismisses the cookie banner and the "sign up" nudge dialog
3. Reads each slide's `getBoundingClientRect().left` and picks whichever is closest to `0` — that's
   the slide actually visible on screen
4. Clicks "Next", waits, and repeats until the button disappears or an image repeats (dedup by
   filename, since Instagram's CDN reissues signed URLs but keeps the same filename)
5. Downloads every collected image at full resolution
6. Renders them into an HTML page (one image per full-bleed page) and prints it to PDF with
   Playwright's `page.pdf()`
7. Uploads both the PDF and the raw images as separate workflow artifacts

See [`scripts/instagram-to-pdf.mjs`](./scripts/instagram-to-pdf.mjs) for the full implementation and
[`.github/workflows/instagram-to-pdf.yml`](./.github/workflows/instagram-to-pdf.yml) for the workflow
definition.

## Limitations

- **Public posts only.** Private accounts you don't follow can't be read (Instagram never serves the
  content to a logged-out session).
- **Photos only.** If a carousel slide is a video, its poster/thumbnail frame is captured, not the
  video itself.
- Instagram's markup can change at any time; the DOM-shape detection above is the most fragile part of
  this project and is the first thing to check if it stops finding images.
- No built-in scheduling or "watch this account for new posts" — this is a pull-one-link-at-a-time
  tool by design.

## Running it yourself

1. Fork or clone this repository
2. Enable GitHub Actions on your copy (Settings &rsaquo; Actions &rsaquo; allow)
3. If you want the web app, enable GitHub Pages (Settings &rsaquo; Pages &rsaquo; Deploy from branch
   `main`, folder `/ (root)`) and update `OWNER` / `REPO` at the top of `index.html`'s script to match
   your fork
4. Trigger a run via the Actions tab, or via the web app once Pages is live

No secrets or Instagram credentials are needed to set this up — the workflow only needs the default
`GITHUB_TOKEN` permissions GitHub Actions already provides for uploading its own artifacts.

## Contributing

Issues and pull requests are welcome — especially fixes for Instagram markup changes, since that's the
part most likely to break over time. Please include the post URL (or a description of the post type)
that exposed the issue.

## License

[MIT](./LICENSE)
