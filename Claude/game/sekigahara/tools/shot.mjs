// 使い方: node tools/shot.mjs <url> <out.png> [w] [h]
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// ローカルサーバを立てずに、http://sekigahara.local/ へのリクエストをこのフォルダのファイルで返す
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png' };
const [url, out, w = 1600, h = 900] = process.argv.slice(2);
const browser = await puppeteer.launch({ headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.setViewport({ width: +w, height: +h });
await page.setRequestInterception(true);
page.on('request', (req) => {
  const u = new URL(req.url());
  if (u.host !== 'sekigahara.local') return req.continue();
  const f = path.join(ROOT, decodeURIComponent(u.pathname === '/' ? '/index.html' : u.pathname));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) return req.respond({ status: 404, body: 'not found' });
  req.respond({ status: 200, contentType: TYPES[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
});
page.on('console', (m) => console.log('[console]', m.type(), m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction('window.__ready === true', { timeout: 120000 });
await new Promise((r) => setTimeout(r, 6000));
console.log(await page.evaluate(() => [document.getElementById('count').textContent, document.getElementById('trees').textContent, document.getElementById('fps').textContent].join(' | ')));
await page.screenshot({ path: out });
await browser.close();
