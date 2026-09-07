# Instagram to PDF

**English** | [한국어](./README.ko.md)

Turn a **public Instagram post** (one photo or a multi-image carousel) into a **PDF** or a **folder of full-resolution images**. No Instagram login, no app, no browser extension. Conversion runs on GitHub Actions.

This is not a hosted service for the whole internet. To use it, **fork this repo** (or use your own clone) so the workflow runs on *your* GitHub account. Facebook and LinkedIn links are not supported.

<p>
  <img alt="workflow" src="https://img.shields.io/badge/GitHub%20Actions-workflow__dispatch-2ea44f?logo=githubactions&logoColor=white">
  <img alt="node" src="https://img.shields.io/badge/node-20-339933?logo=node.js&logoColor=white">
  <img alt="playwright" src="https://img.shields.io/badge/playwright-chromium-2EAD33?logo=playwright&logoColor=white">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-blue">
</p>

## Why

Carousel posts on Instagram only show one slide at a time, so "save image" misses the rest. This tool walks through every slide, downloads the images, and packs them into a PDF or a zip of JPGs.

## Features

- Single-image posts and **carousels**
- Two outputs: **PDF** (one image per page) or **zip of original JPGs**
- Public posts only; no Instagram API or cookies
- Runs on GitHub Actions, so phone and PC only need a browser
- Optional static web UI (`index.html`) so you can paste a link instead of using the Actions tab

## Use it on your phone or computer

Fork first. Other people cannot start this workflow on someone else's repo.

1. Click **Fork** (keep the fork **public** so GitHub Pages and Actions stay free)
2. On the fork: **Settings → Actions → General** → allow Actions, then Save
3. On the fork: **Settings → Pages** → Source **Deploy from a branch** → branch `main`, folder `/ (root)` → Save
4. In `index.html`, set `OWNER` and `REPO` to *your* GitHub username and fork name
5. After a minute, open `https://<your-username>.github.io/<repo-name>/` on your phone or PC

First visit asks for a **GitHub personal access token** (Actions: Read and write, this repository only). It stays in that browser's local storage and is only sent to `api.github.com`.

Then paste an Instagram post URL (`instagram.com/p/...` or `/reel/...`) and choose images or PDF. A run takes about 1-2 minutes.

### Without the web page

1. On your fork: **Actions → Instagram to PDF → Run workflow**
2. Paste the post URL into `post_url`
3. Wait for the green check, then download `instagram-pdf` or `instagram-images` under **Artifacts**

Same thing works in the GitHub app or mobile browser.

## Limitations

- **Public Instagram posts only.** Private accounts are not readable while logged out.
- **Photos only.** Video slides become a poster/thumbnail frame, not the video.
- Instagram HTML changes often; if image detection breaks, that is the first place to look.
- One URL at a time. No "watch this account" mode.
- Not Facebook, LinkedIn, or other sites.

## How it works

Instagram carousels only keep a few slides in the DOM. The script:

1. Opens the post in headless Chromium (Playwright)
2. Dismisses cookie and signup dialogs
3. Picks the on-screen slide, clicks Next, and repeats (dedupes by filename)
4. Downloads each image at full resolution
5. Prints them to PDF with Playwright `page.pdf()`
6. Uploads the PDF and the images as workflow artifacts

See [`scripts/instagram-to-pdf.mjs`](./scripts/instagram-to-pdf.mjs) and [`.github/workflows/instagram-to-pdf.yml`](./.github/workflows/instagram-to-pdf.yml).

## Contributing

Issues and pull requests are welcome, especially fixes when Instagram changes markup. Include the post URL or post type that failed.

## License

[MIT](./LICENSE)
