// X.com 通知取得スクリプト（Playwright + WebKit/Safari）
// 使い方: node x_notifications.mjs
// 事前に node x_login.mjs でセッションを保存しておくこと

import { webkit } from 'playwright';
import fs from 'fs';

const STATE_DIR = './x_session';
const STATE_FILE = `${STATE_DIR}/state.json`;
const OUTPUT_FILE = './x_notifications_latest.txt';

async function main() {
  if (!fs.existsSync(STATE_FILE)) {
    console.error('セッション未保存。先に node x_login.mjs を実行してください。');
    process.exit(1);
  }

  const browser = await webkit.launch({ headless: true });

  const context = await browser.newContext({
    storageState: STATE_FILE,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  });

  const page = await context.newPage();

  // 通知ページへ
  console.log('通知ページを読み込み中...');
  try {
    await page.goto('https://x.com/notifications', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    // タイムアウトしても続行（SPAは完全にidle にならないことがある）
    console.log('ページ読み込み中（タイムアウトしましたが続行）...');
  }

  // 追加の待機（動的コンテンツのロード）
  await page.waitForTimeout(5000);

  // 通知のテキストを抽出
  const notifications = await page.evaluate(() => {
    const items = [];

    // 通知のセル要素を探す
    const cells = document.querySelectorAll('[data-testid="cellInnerDiv"]');
    for (const cell of cells) {
      const text = cell.innerText?.trim();
      if (text && text.length > 0) {
        items.push(text);
      }
    }

    // フォールバック: article要素
    if (items.length === 0) {
      const articles = document.querySelectorAll('article');
      for (const article of articles) {
        const text = article.innerText?.trim();
        if (text && text.length > 0) {
          items.push(text);
        }
      }
    }

    // さらにフォールバック: メインコンテンツ全体
    if (items.length === 0) {
      const main = document.querySelector('main') || document.querySelector('[role="main"]');
      if (main) {
        items.push(main.innerText?.trim() || '(メインコンテンツ取得不可)');
      }
    }

    // 最終フォールバック: body全体のテキスト（デバッグ用）
    if (items.length === 0) {
      const body = document.body?.innerText?.trim();
      if (body) {
        items.push('[DEBUG body全体]\n' + body.substring(0, 2000));
      }
    }

    return items;
  });

  // ページタイトルとURL
  const title = await page.title();
  const url = page.url();

  // 結果を整形
  const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  let output = `=== X.com 通知取得 ${timestamp} ===\n`;
  output += `URL: ${url}\n`;
  output += `タイトル: ${title}\n`;
  output += `取得件数: ${notifications.length}\n`;
  output += `---\n\n`;

  if (notifications.length === 0) {
    output += '(通知が取得できませんでした。Cookieの期限切れの可能性があります。node x_login.mjs を再実行してください。)\n';
  } else {
    for (let i = 0; i < notifications.length; i++) {
      output += `[${i + 1}] ${notifications[i]}\n\n`;
    }
  }

  // ファイルに保存
  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(output);
  console.log(`--- 結果を ${OUTPUT_FILE} に保存しました ---`);

  // スクリーンショットも保存
  await page.screenshot({ path: './x_notifications_screenshot.png', fullPage: false });
  console.log('スクリーンショット: x_notifications_screenshot.png');

  // セッションを更新保存（Cookie更新対応）
  await context.storageState({ path: STATE_FILE });

  await browser.close();
}

main().catch(console.error);
