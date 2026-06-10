// verify_popup.js — log_autonomous_game v003 視覚 reward feedback (+1 popup / combo HUD) の発火検証
// C295 Phase 4: game.js scorePopups + game.combo 追加に対する自動検証スクリプト。
//
// 検証フロー (puppeteer-core 経由、capture_frames.js 同型の Chrome 接続):
//   1) v003/index.html を開く
//   2) Space 押下で TITLE → PLAYING 遷移
//   3) ArrowRight を 1050ms 保持 → trail に 60F (ECHO_FRAMES) 以上溜める
//   4) Space 押下で castLock 発火
//   5) 1100ms 待機 → echo 再演完了 → resolveLock で hit (再演中に被弾していなければ自動 hit)
//   6) +50ms 後に game state を取得し、scorePopups と combo を確認
//   7) +200ms (popup 表示中) で frame_popup_first.png 保存
//   8) もう一度 trail 蓄積 + castLock → 2 回目 SUCCESS で combo = 2 になることを確認
//   9) +200ms で frame_popup_combo.png 保存
//
// 期待結果 (PASS 条件):
//   - 1 回目 SUCCESS 直後 scorePopups.length >= 1 かつ combo.count == 1
//   - 2 回目 SUCCESS 直後 scorePopups.length >= 2 (+1 と xN) かつ combo.count == 2
//   - frame_popup_first.png に黄/青の「+1」文字が描画
//   - frame_popup_combo.png に「+1」+「x2」+ 上中央 COMBO HUD
//
// 失敗時は process.exit(1)、PASS で 0。stderr に判定行を 1 行ずつ出す。

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const HTML_PATH = path.resolve(__dirname, 'index.html');
const OUT_DIR = path.resolve(__dirname, 'frames');
const FIRST_PNG = path.join(OUT_DIR, 'frame_popup_first.png');
const COMBO_PNG = path.join(OUT_DIR, 'frame_popup_combo.png');

async function holdKey(page, key, ms) {
  await page.keyboard.down(key);
  await new Promise(r => setTimeout(r, ms));
  await page.keyboard.up(key);
}

async function readGameProbe(page) {
  return page.evaluate(() => {
    // game オブジェクトは IIFE 内 closure。__logAutonomousV003 経由で間接観測。
    // scorePopups / combo は当時点では公開 API に未登録なので canvas state で代用観察:
    //   document 内グローバルへ漏れていないため、本検証は描画判定 (PNG inspect) + meta frames でのみ判断する。
    const api = window.__logAutonomousV003;
    return api ? api.getMeta() : null;
  });
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const fileUrl = 'file:///' + HTML_PATH.replace(/\\/g, '/');
  console.log('[verify_popup] url=' + fileUrl);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  let pass = true;
  const reasons = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 1 });
    page.on('pageerror', err => { console.error('[pageerror]', err.message); pass = false; reasons.push('pageerror:' + err.message); });

    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas#stage', { timeout: 5000 });
    await page.focus('canvas#stage').catch(() => {});

    // 1) TITLE → PLAYING
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 200));

    // 2) 1050ms 移動して trail 60F+ 蓄積 (右へ、player x=320 → 約 320 + 3.4*63=534 で画面内)
    await holdKey(page, 'ArrowRight', 1050);

    // 3) castLock 発火
    await page.keyboard.press('Space');

    // 4) 1100ms 待機 (echo 再演 60F=1000ms + バッファ 100ms) → resolveLock
    await new Promise(r => setTimeout(r, 1100));

    // 5) +200ms (popup 表示窓内、寿命 24F=400ms の中盤) でフレーム取得
    await new Promise(r => setTimeout(r, 50));
    const meta1 = await readGameProbe(page);
    console.log('[verify_popup] after 1st castLock meta=' + JSON.stringify(meta1));
    const canvas = await page.$('canvas#stage');
    await canvas.screenshot({ path: FIRST_PNG });
    console.log('[verify_popup] saved ' + FIRST_PNG);

    // 6) すぐに 2 回目: trail 蓄積 (再演中も trail は走るが念のため再蓄積、48F=800ms 内連続で combo=2)
    //    resolveLock 直後はキー入力受付 (echo=null)。trail に 60F 必要。
    //    castLock 直後の trail は echo 再演で path 上書き済 → 別軌道を作る
    await holdKey(page, 'ArrowLeft', 1050);
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 1100));
    await new Promise(r => setTimeout(r, 50));
    const meta2 = await readGameProbe(page);
    console.log('[verify_popup] after 2nd castLock meta=' + JSON.stringify(meta2));
    await canvas.screenshot({ path: COMBO_PNG });
    console.log('[verify_popup] saved ' + COMBO_PNG);

    // 7) PNG ファイルサイズ確認 (空 fail check)
    const f1Size = fs.statSync(FIRST_PNG).size;
    const f2Size = fs.statSync(COMBO_PNG).size;
    console.log('[verify_popup] frame_popup_first.png=' + f1Size + 'B / frame_popup_combo.png=' + f2Size + 'B');
    if (f1Size < 1000 || f2Size < 1000) { pass = false; reasons.push('PNG size too small (render fail?)'); }

    // 注意: scorePopups/combo は closure 内のため Node からは直接読めない。
    // 判定は (a) pageerror なし (b) PNG 出力サイズ正常 (c) 人間が PNG 視認、の 3 段。
    // ここでは (a)(b) のみ自動判定。視認判定は呼出側で Read tool で行う。
  } finally {
    await browser.close();
  }

  if (pass) {
    process.stderr.write('[verify_popup] PASS (auto checks): pageerror=none, PNG output non-empty\n');
    process.stderr.write('[verify_popup] NEXT: visual inspection of frames/frame_popup_first.png and frame_popup_combo.png required\n');
    process.exit(0);
  } else {
    process.stderr.write('[verify_popup] FAIL: ' + reasons.join(' / ') + '\n');
    process.exit(1);
  }
})().catch(err => {
  console.error('[verify_popup] FAIL exception', err);
  process.exit(1);
});
