// log_autonomous_game v003 ヘッドレスフレーム画像化スクリプト
// C265 Phase 4 段階1 (最小1フレーム取得) → C268 Phase 4 段階2 (連続フレーム取得 + Q-D 体感判定本番)
//
// 既設 Chrome を puppeteer-core 経由で headless 起動し、v003/index.html を開いて
// 開始から START_DELAY_MS 経過後に FRAME_COUNT 枚を FRAME_INTERVAL_MS 間隔で
// frames/frame_NNNN.png に連番保存。各フレームで meta も収集して frames/meta.jsonl に書き出す。
//
// 実行: node capture_frames.js
// 出力: frames/frame_0001.png 〜 frame_NNNN.png + frames/meta.jsonl
// 終了: exit 0 / exit 1 (失敗時)

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const HTML_PATH = path.resolve(__dirname, 'index.html');
const START_DELAY_MS = 2000;   // タイトル → PLAYING 遷移待ち
const FRAME_COUNT = 60;        // C268 段階2: 60 枚
const FRAME_INTERVAL_MS = 1000; // 1 秒間隔 = 60 秒分の進行をサンプリング
const OUT_DIR = path.resolve(__dirname, 'frames');
const META_PATH = path.join(OUT_DIR, 'meta.jsonl');

function framePath(idx) {
  return path.join(OUT_DIR, 'frame_' + String(idx).padStart(4, '0') + '.png');
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  // 段階1 で残った frame_0001.png 以外を一旦削除し、連番上書きで段階2 結果に統一
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (/^frame_\d{4}\.png$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
  }
  if (fs.existsSync(META_PATH)) fs.unlinkSync(META_PATH);

  const fileUrl = 'file:///' + HTML_PATH.replace(/\\/g, '/');
  console.log('[capture_frames] url=' + fileUrl);
  console.log('[capture_frames] mode=stage2 count=' + FRAME_COUNT + ' interval_ms=' + FRAME_INTERVAL_MS);

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

    await page.focus('canvas#stage').catch(() => {});
    await page.keyboard.press('Space').catch(() => {});

    await new Promise(r => setTimeout(r, START_DELAY_MS));

    const canvas = await page.$('canvas#stage');
    if (!canvas) throw new Error('canvas#stage not found');

    const metaStream = fs.createWriteStream(META_PATH, { flags: 'a' });
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const t0 = Date.now();
      await canvas.screenshot({ path: framePath(i), omitBackground: false });
      const meta = await page.evaluate(() => {
        const api = window.__logAutonomousV003;
        if (!api || !api.getMeta) return null;
        return api.getMeta();
      });
      metaStream.write(JSON.stringify({ idx: i, t_ms_since_start: (i - 1) * FRAME_INTERVAL_MS, meta }) + '\n');
      if (i % 10 === 0 || i === FRAME_COUNT) {
        console.log('[capture_frames] frame=' + i + '/' + FRAME_COUNT + ' meta=' + JSON.stringify(meta));
      }
      const elapsed = Date.now() - t0;
      const wait = Math.max(0, FRAME_INTERVAL_MS - elapsed);
      if (i < FRAME_COUNT) await new Promise(r => setTimeout(r, wait));
    }
    metaStream.end();

    console.log('[capture_frames] done out_dir=' + OUT_DIR);
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('[capture_frames] FAIL', err);
  process.exit(1);
});
