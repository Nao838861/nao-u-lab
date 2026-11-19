// タイムしょうごう（ランクと一致）と 古い記録の ひきつぎを 実ブラウザーで たしかめる。
// 使い方: node test_titles.mjs
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const {chromium} = await import('file:///D:/AI/Nao_u_BOT/Claude/node_modules/playwright/index.mjs');
const here = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.join(here, 'index.html')).href;

let fails = 0;
const ok = (c, l) => { console.log(`${c ? 'ok  ' : 'FAIL'} ${l}`); if (!c) fails++; };
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1280, height: 720}});
const errs = []; page.on('pageerror', e => errs.push(String(e)));

// 古い形の記録：★1 ベスト 49.5秒、むかしの ランク B・AA の しょうごうを もっている
const old = {players: ['テスト'], last: 'テスト', recs: {テスト: {addsub_1: {best: 49500, ghost: null, top: [{ms: 49500, miss: 0, combo: 20, d: '2026/11/18'}]}}},
  stats: {テスト: {correct: 20, clears: 1, noMiss: 1, maxCombo: 20, retryOk: 0, fast: 0, bestAvg: 2.4, bestUp: 0, days: {'2026-11-18': 1}, cl: {n1: 1}, rk: {n1: 'B'}, enaga: 40, seen: 40,
    titles: {c1: '2026-11-18', rB: '2026-11-18', rAA: '2026-11-18'}, tSeen: 3, tSeenIds: {c1: 1, rB: 1, rAA: 1}, streakNow: 0, streakBest: 20}}};
await page.goto(url);
await page.evaluate(d => localStorage.setItem('enaga_math_v01', JSON.stringify(d)), old);
await page.reload();
await page.waitForTimeout(500);

const r = await page.evaluate(() => {
  const E = window.__enaga, s = E.statsOf('テスト');
  const L1 = E.TITLES.filter(t => t.id.startsWith('L1_'));
  return {rk: s.rk.n1, bt: s.bt.n1, first: E.TITLES[0].id, L1: L1.map(t => [t.id, t.name, t.cond]), got: L1.filter(t => s.titles[t.id]).map(t => t.name), rAA: !!s.titles.rAA,
    L2: E.TITLES.filter(t => t.id.startsWith('L2_')).map(t => t.cond), L3: E.TITLES.filter(t => t.id.startsWith('L3_')).map(t => t.name)};
});
console.log(r.L1.map(x => x.join(' / ')).join('\n'));
console.log(r.L2.join('\n')); console.log(r.L3.join(' → '));
ok(r.rk === 'D', `古い ランク B を ベスト 49.5秒 から D に つけなおす（${r.rk}）`);
ok(r.bt === 49500, 'ベストタイムを ひきつぐ');
ok(r.first === 'L1_0', 'タイムしょうごうが いちばん上');
ok(r.L1.length === 13, '★1 は 13だん');
ok(JSON.stringify(r.got) === JSON.stringify(['かたつむり エナガ', 'かめ エナガ', 'こいぬ エナガ']), `49.5秒で こいぬ（D）まで とれる: ${r.got}`);
ok(r.L1.map(x => x[2].match(/(\d+)びょう/)[1]).join(',') === '70,60,50,47,45,42,40,37,35,32,30,28,26', '★1 の びょう数');
ok(r.rAA, 'むかしの しょうごうは けさない');

// しょうごう 画面：いちばん上の グループ と 数
await page.evaluate(() => window.__enaga.openForest('titles'));
await page.waitForTimeout(400);
const tl = await page.evaluate(() => ({h: [...document.querySelectorAll('#titleList h3.tg')].map(h => h.textContent).slice(0, 3), head: document.querySelector('#titleList .thead').textContent}));
console.log(tl);
ok(tl.h[0].includes('★1 タイム'), 'しょうごう画面の 一番上が ★1 タイム');
await page.screenshot({path: path.join(here, '.shot_titles.png')});

// 1回 あそぶ：答えを 入れて 結果画面の 文を たしかめる
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
await page.evaluate(() => { window.__enaga.setCourse('addsub'); window.__enaga.startGame(1); });
for (let n = 0; n < 200; n++) {
  const st = await page.evaluate(() => window.__enaga.state);
  if (st === 'result') break;
  if (st !== 'play') { await page.waitForTimeout(100); continue; }
  const a = await page.evaluate(() => { const G = window.__enaga.G; return String(G.queue[G.idx].ans); });
  await page.keyboard.type(a); await page.keyboard.press('Enter'); await page.waitForTimeout(30);
}
await page.waitForTimeout(800);
const res = await page.evaluate(() => ({rank: document.querySelector('#rank').textContent, t: document.querySelector('#rtitle').textContent, n: document.querySelector('#rnext').textContent, sec: document.querySelector('#rsec').textContent}));
console.log(res);
ok(/しょうごう「.+ エナガ」/.test(res.t), '結果に タイムしょうごう');
ok(/^(つぎは「.+ エナガ」|さいこう)/.test(res.n), '結果に つぎの しょうごう まで あと');
await page.screenshot({path: path.join(here, '.shot_result.png')});
// 2回め：48.3秒 くらいで おわらせて「つぎは ねこ」を たしかめる
await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
await page.evaluate(() => { window.__enaga.setCourse('addsub'); window.__enaga.startGame(1); });
for (let n = 0; n < 200; n++) {
  const st = await page.evaluate(() => window.__enaga.state);
  if (st === 'result') break;
  if (st !== 'play') { await page.waitForTimeout(100); continue; }
  const a = await page.evaluate(() => { const G = window.__enaga.G; if (G.idx === G.queue.length - 1) G.t0 = performance.now() - 48300; return String(G.queue[G.idx].ans); });
  await page.keyboard.type(a); await page.keyboard.press('Enter'); await page.waitForTimeout(30);
}
await page.waitForTimeout(800);
const res2 = await page.evaluate(() => ({rank: document.querySelector('#rank').textContent, t: document.querySelector('#rtitle').textContent, n: document.querySelector('#rnext').textContent}));
console.log(res2);
ok(res2.rank === 'D' && res2.t.includes('こいぬ') && res2.n.startsWith('つぎは「ねこ エナガ」（47秒）まで あと 1.'), '48秒台: D・こいぬ・つぎは ねこ');
await page.screenshot({path: path.join(here, '.shot_result48.png')});
ok(errs.length === 0, 'ページの エラーなし ' + errs.join(' | '));
await browser.close();
console.log(fails ? `${fails} FAIL` : 'ALL OK');
process.exit(fails ? 1 : 0);
