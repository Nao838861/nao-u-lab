// 実ブラウザー2台＋公式Firebase Emulatorで、家族用リンクと保存の流れを確かめる。
// FIREBASE_DATABASE_EMULATOR_HOSTを設定して node test_cloud_flow.mjs
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const {chromium, devices} = await import('file:///D:/AI/Nao_u_BOT/Claude/node_modules/playwright/index.mjs');
const here = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
if (!host) throw new Error('Firebase Emulatorを起動し、FIREBASE_DATABASE_EMULATOR_HOSTを指定してください');
const ns = process.env.FIREBASE_DATABASE_EMULATOR_NAMESPACE || 'demo-enaga-cloud-default-rtdb';
const port = Number(process.env.CLOUD_TEST_PORT || 8769), base = `http://127.0.0.1:${port}/`;
const server = spawn('python', [path.join(here, 'serve.py'), String(port)], {stdio: 'ignore'});
const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors = [];
async function context(options = {}) {
  const c = await browser.newContext({acceptDownloads: true, ...options});
  const state = {offline: false, puts: 0};
  await c.route('https://family-default-rtdb.firebaseio.com/**', async route => {
    if (state.offline) { await route.abort('internetdisconnected'); return; }
    const req = route.request(); if (req.method() === 'PUT') state.puts++;
    const r = await route.fetch({url: `http://${host}${new URL(req.url()).pathname}?ns=${ns}`});
    await route.fulfill({response: r});
  });
  c.on('page', p => p.on('pageerror', e => errors.push(String(e))));
  const page = await c.newPage(); return {c, page, state};
}
const ready = p => p.waitForFunction(() => !!window.__app);
const saved = p => p.waitForFunction(() => document.querySelector('#saveBadge')?.dataset.state === 'saved');
async function change(p, n) {
  await p.evaluate(n => { window.__app.P.s.enaga = n; }, n);
  await p.locator('#muteBtn').click(); // 実際の保存経路を使う。
}
try {
  for (let i = 0; i < 50; i++) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
  const a = await context({viewport: {width: 1280, height: 740}});
  await a.page.goto(base); await ready(a.page);
  await a.page.locator('#nameIn').fill('家族テスト');
  await a.page.locator('[data-act=nameOk]').click();
  await a.page.locator('[data-act=grade][data-v="1"]').click();
  await change(a.page, 50);
  assert.equal(a.state.puts, 0);
  const originalLocal = await a.page.evaluate(() => localStorage.getItem('enaga_kanji_v1'));
  assert.equal(JSON.parse(originalLocal).P['家族テスト'].s.enaga, 50);
  await a.page.locator('[data-act=del]').click();
  await a.page.getByRole('button', {name: 'やめる', exact: true}).click();
  console.log('ok  通常URLの既存記録はローカル保存だけ');

  await a.page.locator('#saveBadge').click();
  await a.page.getByLabel('Firebaseの保存先URL').fill('https://family-default-rtdb.firebaseio.com');
  await a.page.getByRole('button', {name: '家族用リンクを作る', exact: true}).click();
  const linkBox = a.page.getByLabel('家族用リンク', {exact: true}); await linkBox.waitFor();
  const link = await linkBox.inputValue(); assert.ok(link.includes('#save='));
  await a.page.getByRole('button', {name: 'このリンクで はじめる', exact: true}).click();
  await a.page.waitForURL(link); await ready(a.page); await saved(a.page);
  assert.equal(await a.page.evaluate(() => window.__app.P.s.enaga), 50);
  assert.equal(await a.page.evaluate(() => localStorage.getItem('enaga_kanji_v1')), originalLocal);
  console.log('ok  既存記録をコピーし、家族用リンクで開始。元の記録を維持');

  const b = await context({...devices['iPad (gen 7) landscape']});
  await b.page.goto(link); await ready(b.page); await saved(b.page);
  assert.equal(await b.page.evaluate(() => window.__app.P.s.enaga), 50);
  await b.page.locator('#saveBadge').click();
  await b.page.screenshot({path: path.join(os.tmpdir(), 'enaga_cloud_ipad.png')});
  await b.page.getByRole('button', {name: 'とじる', exact: true}).click();
  await change(b.page, 70); await saved(b.page);
  await a.page.reload(); await ready(a.page); await saved(a.page);
  assert.equal(await a.page.evaluate(() => window.__app.P.s.enaga), 70);
  console.log('ok  iPad寸法の別端末で同じ記録を読み、更新をPCへ反映');

  a.state.offline = true; await change(a.page, 80);
  await a.page.waitForFunction(() => document.querySelector('#saveBadge').dataset.state === 'offline');
  await a.page.reload(); await ready(a.page);
  assert.equal(await a.page.evaluate(() => window.__app.P.s.enaga), 80);
  assert.equal(await a.page.locator('#ui').evaluate(e => e.inert), false);
  a.state.offline = false;
  await a.page.locator('#saveBadge').click();
  await a.page.getByRole('button', {name: '今すぐ同期', exact: true}).click(); await saved(a.page);
  await a.page.getByRole('button', {name: 'とじる', exact: true}).click();
  await b.page.reload(); await ready(b.page); await saved(b.page);
  assert.equal(await b.page.evaluate(() => window.__app.P.s.enaga), 80);
  console.log('ok  通信断・再起動でも未送信分が残り、復旧後に同期');

  a.state.offline = true; await change(a.page, 90);
  await a.page.waitForFunction(() => document.querySelector('#saveBadge').dataset.state === 'offline');
  await change(b.page, 100); await saved(b.page);
  a.state.offline = false; await a.page.locator('#saveBadge').click();
  await a.page.getByRole('button', {name: '今すぐ同期', exact: true}).click();
  await a.page.getByRole('heading', {name: '別の端末にも新しい記録があります'}).waitFor();
  assert.equal(await a.page.evaluate(() => window.__app.P.s.enaga), 90);
  const [backup] = await Promise.all([a.page.waitForEvent('download'), a.page.getByRole('button', {name: '書き出して最新を開く', exact: true}).click()]);
  const data = JSON.parse(fs.readFileSync(await backup.path(), 'utf8')); assert.equal(data.P['家族テスト'].s.enaga, 90);
  await ready(a.page); await saved(a.page);
  await a.page.waitForFunction(() => window.__app.P.s.enaga === 100);
  assert.equal(await a.page.evaluate(() => localStorage.getItem('enaga_kanji_v1')), originalLocal);
  console.log('ok  更新競合では両方を保持し、書き出してから共有先の最新を開ける');

  await a.page.goto(base + '#save=short'); await ready(a.page);
  assert.equal(await a.page.locator('#ui').evaluate(e => e.inert), true);
  assert.equal(await a.page.locator('#saveOverlay').isVisible(), true);
  await a.page.getByRole('button', {name: 'この端末の記録を使う', exact: true}).click();
  await a.page.waitForURL(base); await ready(a.page);
  await a.page.waitForFunction(() => document.querySelector('#saveBadge').dataset.state === 'local');
  assert.equal(await a.page.evaluate(() => window.__app.P.s.enaga), 50);
  console.log('ok  不完全な共有リンクでは学習を止め、通常URLに戻ると元の記録');
  assert.deepEqual(errors, []); console.log('ALL OK（ページエラーなし）');
} catch (e) {
  for (const c of browser.contexts()) for (const p of c.pages()) {
    console.error((await p.locator('#saveOverlay').innerText().catch(() => '')).slice(0, 1600));
    await p.screenshot({path: path.join(os.tmpdir(), 'enaga_cloud_failure.png')}).catch(() => {});
  }
  throw e;
} finally { await browser.close(); server.kill(); }
