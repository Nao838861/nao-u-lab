// X.com ログイン & セッション保存スクリプト（Playwright + WebKit/Safari）
// 使い方: node x_login.mjs
// Safari風ブラウザが開くので手動でX.comにログイン → ログイン完了後ターミナルでEnterを押す → セッション保存
// Nao_uのChrome操作とは干渉しない（Safari/WebKitを使用）

import { webkit } from 'playwright';
import readline from 'readline';

const STATE_DIR = './x_session';  // Playwrightのセッション保存先

async function main() {
  const browser = await webkit.launch({
    headless: false,  // ブラウザを表示（手動ログイン用）
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  });

  const page = await context.newPage();
  await page.goto('https://x.com/login', { waitUntil: 'networkidle' });

  console.log('');
  console.log('=== X.com ログインスクリプト (Safari/WebKit) ===');
  console.log('ブラウザが開きました。@eda_u838861 でX.comにログインしてください。');
  console.log('ログインが完了したら、このターミナルに戻ってEnterキーを押してください。');
  console.log('');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise(resolve => rl.question('ログイン完了後にEnterを押してください...', resolve));
  rl.close();

  // セッション保存（Cookie, localStorage含む）
  await context.storageState({ path: `${STATE_DIR}/state.json` });
  console.log(`セッション保存完了: ${STATE_DIR}/state.json`);

  await browser.close();
}

main().catch(console.error);
