// 連続正解による森の報酬・保存・800羽上限を実ブラウザーで確認する。
// 実行: node test_rewards.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';
const {chromium} = await import('file:///D:/AI/Nao_u_BOT/Claude/node_modules/playwright/index.mjs');
const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1280, height: 720}});
const errors = [];
page.on('pageerror', e => errors.push(String(e)));

async function start(course = 'addsub', star = 1) {
  await page.evaluate(({course, star}) => {
    const E = window.__enaga;
    E.setCourse(course); E.startGame(star);
  }, {course, star});
  await page.waitForFunction(() => window.__enaga.state === 'play');
}

async function answer(wrong = false) {
  await page.evaluate(wrong => {
    const G = window.__enaga.G;
    G.input = String(G.queue[G.idx].ans + (wrong ? 1 : 0));
  }, wrong);
  await page.keyboard.press('Enter');
}

async function complete() {
  for (let i = 0; i < 30; i++) {
    if (await page.evaluate(() => window.__enaga.state === 'result')) return;
    await answer();
  }
  throw new Error('結果画面に到達しない');
}

async function stats() {
  return page.evaluate(() => ({...window.__enaga.statsOf('報酬テスト')}));
}

async function seedStreak(n) {
  await page.evaluate(n => {
    const E = window.__enaga, s = E.statsOf('報酬テスト');
    s.streakNow = n; s.streakBest = Math.max(n, s.streakBest);
    localStorage.setItem('enaga_math_v01', JSON.stringify(E.DB));
  }, n);
  await page.reload();
}

try {
  await page.goto(pathToFileURL(path.join(here, 'index.html')).href);
  await page.evaluate(() => { localStorage.removeItem('enaga_math_v01'); });
  await page.reload();
  await page.evaluate(() => window.__enaga.selectPlayer('報酬テスト'));

  await start(); await complete();
  assert.equal((await stats()).streakNow, 20);
  assert.equal((await stats()).enaga, 40);
  assert.match(await page.locator('#rgain').innerText(), /\+40羽/);
  console.log('ok  20連続で40羽');

  await page.reload();
  assert.equal((await stats()).streakNow, 20);
  await start(); await complete();
  assert.equal((await stats()).streakNow, 40);
  assert.equal((await stats()).enaga, 120);
  assert.match(await page.locator('#rgain').innerText(), /\+80羽/);
  console.log('ok  再起動後も連続正解を引き継ぎ、次の20問で80羽');

  await seedStreak(0);
  const beforePartial = (await stats()).enaga;
  await start();
  for (let i = 0; i < 7; i++) await answer();
  await page.reload();
  assert.equal((await stats()).streakNow, 7);
  await start(); await complete();
  assert.equal((await stats()).streakNow, 27);
  assert.equal((await stats()).enaga - beforePartial, 54);
  console.log('ok  途中終了した7連続も引き継ぎ、次の20問で54羽');

  for (const [initial, streak, gain] of [[378, 398, 796], [380, 400, 800], [400, 420, 800]]) {
    await seedStreak(initial);
    const before = (await stats()).enaga;
    await start(); await complete();
    const s = await stats();
    assert.equal(s.streakNow, streak);
    assert.equal(s.enaga - before, gain);
    assert.match(await page.locator('#rgain').innerText(), new RegExp(`\\+${gain}羽`));
    console.log(`ok  ${streak}連続で${gain}羽（上限前・境界・上限後）`);
  }

  await page.reload();
  const beforeMiss = (await stats()).enaga;
  await start(); await answer(true);
  assert.equal((await stats()).streakNow, 0);
  await page.reload();
  assert.equal((await stats()).streakNow, 0);
  assert.equal((await stats()).enaga, beforeMiss);
  console.log('ok  ミスは即保存され、再起動しても0。途中終了では報酬を重複加算しない');

  await start(); await answer(true); await complete();
  assert.equal((await stats()).enaga - beforeMiss, 40);
  // 最初のミスの後に20問正解するので連続報酬は40羽。
  await page.reload();
  await start();
  for (let i = 0; i < 19; i++) await answer();
  await answer(true); await complete();
  assert.equal((await stats()).streakNow, 1);
  assert.match(await page.locator('#rgain').innerText(), /\+30羽/);
  console.log('ok  ミス後の連続正解に応じた報酬と、通常の30羽報酬を維持');

  await seedStreak(380);
  const beforeMul = (await stats()).enaga;
  await start('mul', 3); await complete();
  assert.equal((await stats()).streakNow, 400);
  assert.equal((await stats()).enaga - beforeMul, 800);
  console.log('ok  かけ算★3は1問2問分のまま、800羽上限を適用');

  await page.reload();
  const total = (await stats()).enaga;
  assert.ok(total > 800);
  await page.evaluate(() => window.__enaga.openForest('forest'));
  assert.equal((await stats()).seen, total);
  await page.waitForTimeout(4700); // 森のカウントアップが終わった状態を確認用に残す。
  await page.screenshot({path: path.join(os.tmpdir(), 'enaga_math_rewards_forest.png')});
  assert.deepEqual(errors, []);
  console.log('ok  累計は800羽以上を保存でき、森に反映。ページエラーなし');
} finally {
  await browser.close();
}
