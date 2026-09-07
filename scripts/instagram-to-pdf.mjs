import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const postUrl = process.argv[2];
if (!postUrl) {
  console.error('Usage: node instagram-to-pdf.mjs <instagram-post-url>');
  process.exit(1);
}

const shortcodeMatch = postUrl.match(/\/(p|reel)\/([^/?]+)/);
const shortcode = shortcodeMatch ? shortcodeMatch[2] : 'post';

function extractKey(url) {
  return url.split('?')[0].split('/').pop();
}

async function getCurrentSlide(page) {
  return await page.evaluate(() => {
    const uls = Array.from(document.querySelectorAll('ul'))
      .filter((ul) => ul.querySelectorAll('img').length > 0 && ul.children.length >= 2 && ul.children.length <= 30);
    if (uls.length === 0) return null;
    const ul = uls[0];
    let best = null;
    let bestDist = Infinity;
    for (const li of ul.children) {
      const img = li.querySelector('img');
      if (!img) continue;
      const r = li.getBoundingClientRect();
      const dist = Math.abs(r.left);
      if (dist < bestDist) {
        bestDist = dist;
        best = { src: img.src, alt: img.alt };
      }
    }
    return best;
  });
}

async function dismissPopup(page, names) {
  for (const name of names) {
    try {
      const btn = page.getByRole('button', { name, exact: false }).first();
      if (await btn.isVisible({ timeout: 2000 })) {
        await btn.click({ timeout: 2000 });
        await page.waitForTimeout(500);
        return true;
      }
    } catch {
      // ignore and try next
    }
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await context.newPage();

  console.log('Opening', postUrl);
  await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);

  await dismissPopup(page, [/decline optional cookies/i, /allow all cookies/i, /선택 가능 쿠키 거부/, /모든 쿠키 허용/]);
  await dismissPopup(page, [/^close$/i, /닫기/]);

  const images = [];
  const seen = new Set();
  const first = await getCurrentSlide(page);

  if (first) {
    images.push(first);
    seen.add(extractKey(first.src));
    for (let i = 0; i < 20; i++) {
      const nextBtn = page.getByRole('button', { name: /next|다음/i }).first();
      const visible = await nextBtn.isVisible().catch(() => false);
      if (!visible) break;
      await nextBtn.click().catch(() => {});
      await page.waitForTimeout(600);
      const img = await getCurrentSlide(page);
      if (!img) break;
      const key = extractKey(img.src);
      if (seen.has(key)) break;
      seen.add(key);
      images.push(img);
    }
  } else {
    const single = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('main img'))
        .filter((i) => i.naturalWidth >= 400 && /^(Photo|Video) by/.test(i.alt || ''));
      if (imgs.length === 0) return null;
      imgs.sort((a, b) => b.naturalWidth - a.naturalWidth);
      return { src: imgs[0].src, alt: imgs[0].alt };
    });
    if (single) images.push(single);
  }

  console.log(`Collected ${images.length} image(s)`);
  if (images.length === 0) {
    throw new Error('No images found. The post may be private, deleted, or the page layout changed.');
  }

  const tmpDir = path.resolve('tmp_images');
  await fs.mkdir(tmpDir, { recursive: true });
  const files = [];
  for (let i = 0; i < images.length; i++) {
    const res = await fetch(images[i].src);
    const buf = Buffer.from(await res.arrayBuffer());
    const fp = path.join(tmpDir, `img_${String(i + 1).padStart(2, '0')}.jpg`);
    await fs.writeFile(fp, buf);
    files.push(fp);
  }

  let pages = '';
  for (const fp of files) {
    const b64 = (await fs.readFile(fp)).toString('base64');
    pages += `<div class="page"><img src="data:image/jpeg;base64,${b64}" /></div>`;
  }
  const html = `<!DOCTYPE html><html><head><style>
    @page { margin: 0; size: 1080px 1080px; }
    body { margin: 0; }
    .page { width: 1080px; height: 1080px; page-break-after: always; display: flex; align-items: center; justify-content: center; }
    .page:last-child { page-break-after: auto; }
    img { max-width: 100%; max-height: 100%; }
  </style></head><body>${pages}</body></html>`;

  const htmlPath = path.resolve('tmp_pages.html');
  await fs.writeFile(htmlPath, html);

  const pdfPage = await context.newPage();
  await pdfPage.goto('file://' + htmlPath, { waitUntil: 'load' });
  await pdfPage.waitForTimeout(300);

  const outDir = path.resolve('output');
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${shortcode}.pdf`);
  await pdfPage.pdf({
    path: outPath,
    width: '1080px',
    height: '1080px',
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    printBackground: true,
  });

  console.log('Saved PDF to', outPath);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
