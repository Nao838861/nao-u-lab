// Web版（FxRacing Web）のオンラインランキング画面を撮影する。
// 公開サイトはログインが必要なので、FxRacingWebのテストと同じ方法で、手元でWeb版を起動し
// ランキングAPIへの問い合わせに、公開APIから取得済みの実データ（rec/replays/ranking_*.json）を返す。
// 事前に: cd D:\HomeBrew\FxRacingWeb && python tools/serve.py --port 8091
// 使い方: node tools/shot_ranking.cjs
const {chromium} = require('D:/HomeBrew/FxRacingWeb/node_modules/playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const data = {drift: fs.readFileSync(path.join(root, 'rec/replays/ranking_drift.json'), 'utf8'), grip: fs.readFileSync(path.join(root, 'rec/replays/ranking_grip.json'), 'utf8')};
(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 1000}, deviceScaleFactor: 2});
    await page.route('https://mmc5racing-ranking.*/**', (r) => {
      const u = new URL(r.request().url());
      if (u.pathname === '/ranking') return r.fulfill({contentType: 'application/json', body: data[u.searchParams.get('mode')] ?? '{"rows":[]}'});
      return r.fulfill({status: 404, contentType: 'application/json', body: '{}'});
    });
    await page.goto('http://127.0.0.1:8091/', {waitUntil: 'networkidle'});
    await page.waitForFunction(() => document.querySelectorAll('#drift-rows tr').length >= 10 && document.querySelectorAll('#grip-rows tr').length >= 10, null, {timeout: 60000});
    await page.waitForTimeout(1500);
    const out = (n) => path.join(root, 'public', 'img', n);
    await page.locator('.board.drift').screenshot({path: out('web_ranking_drift.png')});
    await page.locator('.board.grip').screenshot({path: out('web_ranking_grip.png')});
    console.log('ok');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
