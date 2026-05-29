// log_autonomous_game v003 ヘッドレスフレーム画像化スクリプト
// C265 Phase 4: Log 自己視覚判定経路の確保 段階1 (最小1フレーム取得)
//
// 既設 Chrome を puppeteer-core 経由で headless 起動し、v003/index.html を開いて
// 開始から FRAME_DELAY_MS 経過後に canvas を PNG として frames/frame_0001.png に保存。
//
// 実行: node capture_frames.js
// 出力: frames/frame_0001.png (canvas 640x720)
// 終了: exit 0 / exit 1 (失敗時)

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const HTML_PATH = path.resolve(__dirname, 'index.html');
const FRAME_DELAY_MS = 5000;   // タイトル経由でゲーム開始後の弾幕確認用
const OUT_DIR = path.resolve(__dirname, 'frames');
const OUT_PATH = path.join(OUT_DIR, 'frame_0001.png');

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const fileUrl = 'file:///' + HTML_PATH.replace(/\\/g, '/');
  console.log('[capture_frames] url=' + fileUrl);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 1 });

    page.on('console', msg => console.log('[page]', msg.type(), msg.text()));
    page.on('pageerror', err => console.error('[pageerror]', err.message));

    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas#stage', { timeout: 5000 });

    // タイトル → PLAYING へ遷移するため Space キー押下 (v003: castLock 兼開始キー想定)
    // 状態が TITLE 固定なら Space で PLAYING へ進む想定。失敗しても canvas は描画されているので続行。
    await page.focus('canvas#stage').catch(() => {});
    await page.keyboard.press('Space').catch(() => {});

    await new Promise(r => setTimeout(r, FRAME_DELAY_MS));

    const canvas = await page.$('canvas#stage');
    if (!canvas) throw new Error('canvas#stage not found');
    await canvas.screenshot({ path: OUT_PATH, omitBackground: false });

    const meta = await page.evaluate(() => {
      const api = window.__logAutonomousV003;
      if (!api || !api.getMeta) return null;
      return api.getMeta();
    });
    console.log('[capture_frames] meta=' + JSON.stringify(meta));
    console.log('[capture_frames] saved=' + OUT_PATH);
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('[capture_frames] FAIL', err);
  process.exit(1);
});
