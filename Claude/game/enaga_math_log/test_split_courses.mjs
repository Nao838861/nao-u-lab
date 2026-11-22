// ★1の分離：出題・記録・ゴースト・称号・幼稚園・画面とショートカットを実ブラウザーで確認。
// node test_split_courses.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';
const {chromium} = await import('file:///D:/AI/Nao_u_BOT/Claude/node_modules/playwright/index.mjs');
const url = pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), 'index.html')).href;
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1280, height: 720}});
const errors = []; page.on('pageerror', e => errors.push(String(e)));
const name = '分離テスト';
const oldMixed = {best: 49500, ghost: Array.from({length: 20}, (_, i) => (i + 1) * 2475), top: [{ms: 49500, miss: 0, combo: 20, d: '2026/11/18'}]};
const fixture = {players: [name], last: name, recs: {[name]: {addsub_1: oldMixed}},
  stats: {[name]: {cl: {n1: 1, n2: 1, n3: 1}, rk: {n1: 'D', n2: 'A', n3: 'A'},
    titles: {alln: '2026-11-18', allnA: '2026-11-18'}, enaga: 40}}};
async function reload() { await page.reload(); await page.waitForFunction(() => !!window.__enaga); }
async function play(course, duration) {
  await page.locator(`.star[data-course="${course}"][data-star="1"]`).click();
  await page.waitForFunction(() => window.__enaga.state === 'play');
  for (let i = 0; i < 20; i++) {
    await page.evaluate(({i, duration}) => {
      const G = window.__enaga.G; G.input = String(G.queue[G.idx].ans);
      if (i === 19) G.t0 = performance.now() - duration;
    }, {i, duration});
    await page.keyboard.press('Enter');
  }
  assert.equal(await page.evaluate(() => window.__enaga.state), 'result');
}
try {
  await page.goto(url);
  await page.evaluate(d => localStorage.setItem('enaga_math_v01', JSON.stringify(d)), fixture); await reload();
  const generation = await page.evaluate(() => {
    const E = window.__enaga, bad = [];
    for (const kid of [false, true]) {
      E.setKid(kid);
      for (const course of ['add', 'sub', 'addsub']) {
        E.setCourse(course);
        for (let i = 0; i < 40; i++) {
          const set = E.makeSet(1), plus = set.filter(p => p.op === '+'), minus = set.filter(p => p.op === '-');
          if (set.length !== 20 || plus.length !== (course === 'sub' ? 0 : course === 'add' ? 20 : 10) ||
              minus.length !== (course === 'add' ? 0 : course === 'sub' ? 20 : 10)) bad.push([kid, course, '問題数・種類']);
          if (set.some(p => p.ans < 1 || p.ans !== (p.op === '+' ? p.a + p.b : p.a - p.b))) bad.push([kid, course, '答え']);
          if (kid && set.some(p => p.ans > 5 || p.a > 5 || p.b > 5)) bad.push([kid, course, '幼稚園の範囲']);
          if (!kid && course === 'add' && plus.filter(p => p.ans >= 10).length !== 10) bad.push([kid, course, 'くり上がり']);
          if (!kid && course === 'sub' && minus.filter(p => p.a >= 11).length !== 10) bad.push([kid, course, 'くり下がり']);
        }
      }
    }
    E.setKid(false); E.setCourse('addsub'); return bad;
  });
  assert.deepEqual(generation, []); console.log('ok  通常・幼稚園の3コース×40セット：20問、演算、難度の範囲');

  const inherited = await page.evaluate(() => {
    const E = window.__enaga, s = E.statsOf(E.player);
    return {old: E.DB.recs[E.player].addsub_1, a: E.DB.recs[E.player].add_1, sub: E.DB.recs[E.player].sub_1,
      bt: s.bt, oldTitle: s.titles.alln, hasNew: !!s.titles.alln5,
      borrowed: E.TITLES.filter(t => /^(LA1_|LS1_)/.test(t.id) && t.test(s)).map(t => t.id)};
  });
  assert.deepEqual(inherited.old, oldMixed); assert.equal(inherited.a, undefined); assert.equal(inherited.sub, undefined);
  assert.equal(inherited.bt.n1, 49500); assert.equal(inherited.bt.a1, undefined); assert.equal(inherited.bt.s1, undefined);
  assert.ok(inherited.oldTitle); assert.equal(inherited.hasNew, false); assert.deepEqual(inherited.borrowed, []);
  console.log('ok  旧★1のタイム・ゴースト・称号を混合へ引き継ぎ、新コースに流用しない');

  await play('add', 48000);
  assert.match(await page.locator('#rtitle').innerText(), /たし算の/);
  let recs = await page.evaluate(() => window.__enaga.DB.recs[window.__enaga.player]);
  assert.ok(recs.add_1.ghost?.length === 20); assert.deepEqual(recs.addsub_1, oldMixed); assert.equal(recs.sub_1, undefined);
  await reload(); await play('sub', 29000);
  assert.match(await page.locator('#rtitle').innerText(), /ひき算の/);
  recs = await page.evaluate(() => window.__enaga.DB.recs[window.__enaga.player]);
  assert.ok(recs.add_1.best > 47000 && recs.add_1.best < 49000);
  assert.ok(recs.sub_1.best > 28000 && recs.sub_1.best < 30000);
  assert.deepEqual(recs.addsub_1, oldMixed);
  await reload(); await play('addsub', 46000);
  assert.doesNotMatch(await page.locator('#rtitle').innerText(), /たし算の|ひき算の/);
  recs = await page.evaluate(() => window.__enaga.DB.recs[window.__enaga.player]);
  assert.ok(recs.addsub_1.best > 45000 && recs.addsub_1.best < 47000);
  assert.ok(recs.add_1.best > 47000); assert.ok(recs.sub_1.best < 30000);
  console.log('ok  3コースのベスト・ゴースト・結果の称号を独立保存し、再起動で保持');

  const titles = await page.evaluate(() => {
    const E = window.__enaga, t = id => E.TITLES.find(x => x.id === id), s = E.statsOf(E.player);
    const sample = {cl: {n1: 1, n2: 1, n3: 1}, rk: {}, bt: {}};
    const before = t('alln5').test(sample); sample.cl.a1 = sample.cl.s1 = 1;
    const after = t('alln5').test(sample), beforeAll = t('allstar8').test(sample);
    sample.cl.m1 = sample.cl.m2 = sample.cl.m3 = 1;
    return {unique: new Set(E.TITLES.map(x => x.id)).size === E.TITLES.length,
      groups: ['LA1_', 'LS1_', 'L1_'].map(p => E.TITLES.filter(x => x.id.startsWith(p)).length),
      before, after, beforeAll, afterAll: t('allstar8').test(sample),
      hasNew: !!s.titles.alln5, old: !!s.titles.alln, legacy: t('alln').legacy,
      add: !!s.titles.ac1, sub: !!s.titles.sc1};
  });
  assert.equal(titles.unique, true); assert.deepEqual(titles.groups, [13, 13, 13]);
  assert.equal(titles.before, false); assert.equal(titles.after, true);
  assert.equal(titles.beforeAll, false); assert.equal(titles.afterAll, true);
  assert.ok(titles.hasNew && titles.old && titles.legacy && titles.add && titles.sub);
  console.log('ok  各13段のタイム称号・デビュー・全5種/全8種の制覇と旧称号を区別');

  const normal = JSON.stringify(recs);
  await page.evaluate(() => window.__enaga.setKid(true)); await reload();
  for (const course of ['add', 'sub', 'addsub']) {
    const before = await page.evaluate(() => window.__enaga.statsOf(window.__enaga.player).enaga);
    await play(course, 4000);
    assert.equal((await page.evaluate(() => window.__enaga.statsOf(window.__enaga.player).enaga)) - before, 40);
    await reload();
  }
  const kid = await page.evaluate(() => {
    const E = window.__enaga, r = E.DB.recs[E.player], s = E.statsOf(E.player);
    return {keys: Object.keys(r), normal: Object.fromEntries(Object.entries(r).filter(([k]) => !k.startsWith('k_'))),
      cl: s.cl, champ: [!!s.titles.kas1, !!s.titles.kss1, !!s.titles.ks1]};
  });
  assert.ok(['k_add_1', 'k_sub_1', 'k_addsub_1'].every(k => kid.keys.includes(k)));
  assert.equal(JSON.stringify(kid.normal), normal); assert.ok(kid.cl.ka1 && kid.cl.ks1 && kid.cl.k1);
  assert.deepEqual(kid.champ, [true, true, true]);
  console.log('ok  幼稚園も独立記録・専用称号。通常記録と混ざらず報酬は40羽まで');

  for (const [key, expected] of [['7', 'add'], ['8', 'sub'], ['1', 'addsub']]) {
    await page.keyboard.press(key); assert.equal(await page.evaluate(() => window.__enaga.course), expected);
  }
  await page.evaluate(() => window.__enaga.setKid(false));
  for (const [w, h, label] of [[1280, 720, 'pc'], [1024, 768, 'ipad']]) {
    await page.setViewportSize({width: w, height: h});
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.star').filter({visible: true}).count(), 8);
    const fit = await page.evaluate(() => {
      const frame = document.querySelector('#frame').getBoundingClientRect(), title = document.querySelector('#sTitle').getBoundingClientRect();
      return frame.left >= -1 && frame.right <= innerWidth + 1 && title.top >= frame.top && title.bottom <= frame.bottom;
    });
    assert.equal(fit, true, label);
    await page.screenshot({path: path.join(os.tmpdir(), `enaga_split_${label}.png`)});
  }
  assert.deepEqual(errors, []); console.log('ok  7/8/1キーで選択でき、PC・iPadに全8ボタンが収まる。ページエラーなし');
} finally { await browser.close(); }
