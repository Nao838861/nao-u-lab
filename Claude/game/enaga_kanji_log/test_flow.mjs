// 実ブラウザー（Chrome + Playwright）で、クリック・ペン入力を行って流れと記録を確かめる。
// 使い方: node test_flow.mjs   （serve.py で 8766 番に配信し、.shots/ に画面を保存する）
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium} = await import('file:///D:/AI/Nao_u_BOT/Claude/node_modules/playwright/index.mjs');

const here = path.dirname(fileURLToPath(import.meta.url));
const shots = path.join(here, '.shots');
fs.mkdirSync(shots, {recursive: true});
const server = spawn('python', [path.join(here, 'serve.py'), '8766'], {stdio: 'ignore'});
await new Promise(r => setTimeout(r, 1200));

let fails = 0;
const ok = (cond, label) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}`); if (!cond) fails++; };
const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
  const page = await browser.newPage({viewport: {width: 1280, height: 740}});
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto('http://127.0.0.1:8766/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const shot = name => page.screenshot({path: path.join(shots, name)});
  const st = () => page.evaluate(() => { const a = window.__app; return {screen: a.S.screen, q: a.S.q && JSON.parse(JSON.stringify(a.S.q)), list: a.S.list, s: a.P && JSON.parse(JSON.stringify(a.P.s))}; });
  const ids = ch => page.evaluate(c => window.__app.BY()[c].u.map(u => u.n), ch);
  const wait = ms => page.waitForTimeout(ms);
  const tap = (act, v) => page.click(v === undefined ? `[data-act=${act}]` : `[data-act=${act}][data-v="${v}"]`);

  // ---- なまえと学年 ----
  await page.waitForSelector('.who');
  await shot('00_first.png');
  await tap('startKanji').catch(() => {});
  ok(await page.locator('[data-act=startKanji]').count() === 0, 'なまえ・学年の前は 学習ボタンが出ない');
  await page.fill('#nameIn', 'たろう'); await page.press('#nameIn', 'Enter');
  ok(await page.locator('.chip.sel', {hasText: 'たろう'}).count() === 1, 'なまえを入れると選ばれる');
  await tap('grade', 4);
  await page.waitForSelector('[data-act=startKanji]');
  ok((await page.locator('.hereline').innerText()).includes('信'), '4年のいまここは 信');
  ok(await page.locator('.big.locked').count() === 1, 'かんじ団子は おぼえた字が10字までは鍵つき');
  await shot('01_home.png');

  // ---- 1字目：一発で ぜんぶ正かい ----
  await tap('startKanji');
  let s = await st();
  ok(JSON.stringify(s.list) === JSON.stringify(['信', '達', '飛']), '教科書の順に 信・達・飛');
  for (const n of await ids('信')) await tap('pickName', n);
  await shot('02_names.png');
  await tap('checkNames');
  s = await st();
  ok(s.q.phase === 'shape' && s.s.enaga === 1 && s.s.streakNow === 1, 'なまえ一発正かいで +1羽・れんぞく1');
  await shot('03_shape.png');
  const shapes = await ids('信');
  await tap('pickShape', shapes[0]);
  await shot('03b_shape_step.png');
  await tap('pickShape', shapes[1]);
  s = await st();
  ok(s.q.phase === 'done' && s.s.enaga === 12 && s.s.streakNow === 2, '形も一発 → +1羽、おぼえた +10羽（計12羽）');
  ok(s.s.order.includes('信') && s.s.days[Object.keys(s.s.days)[0]].learned[0] === '信', 'おぼえた字が あしあとに のこる');
  ok(!!s.s.titles.l1, 'しょうごう「かんじ ぼうけんしゃ」');
  await wait(400);
  ok(await page.locator('#toast .t').count() >= 1, 'おぼえた・しょうごうの通知が出る');
  await wait(900);
  await shot('04_done.png');

  // ---- 2字目：まちがい → ヒント（おぼえた にならない） ----
  await tap('nextKanji');
  const t2 = await ids('達');
  const wrong = (await st()).q.nameChoices.find(n => n !== t2[0]);
  await tap('pickName', wrong); for (const n of t2.slice(1)) await tap('pickName', n);
  await tap('checkNames');
  s = await st();
  ok(s.q.phase === 'names' && s.s.streakNow === 0 && s.q.wrong[0], 'まちがえると ×がつき、れんぞくは0');
  await tap('slot', 0); await tap('pickName', t2[0]); await tap('checkNames');
  s = await st();
  ok(s.q.phase === 'shape' && s.s.enaga === 12, 'まちがえた後の正かいは 数えない');
  await tap('hint', 1); await tap('hint', 1);
  await shot('05_hint.png');
  await tap('closeHint');
  for (const n of t2) await tap('pickShape', n);
  s = await st();
  ok(s.q.phase === 'done' && !s.s.order.includes('達') && s.s.enaga === 12, 'ヒントを使った字は おぼえた にならず、羽も増えない');

  // ---- 3字目：飛 をペンで書く ----
  await tap('nextKanji');
  for (const n of await ids('飛')) await tap('pickName', n);
  await tap('checkNames');
  await tap('mode', 'pen');
  const strokes = await page.evaluate(async () => { const h = await import('./lib/handwriting.mjs'); return window.__app.BY()['飛'].p.map(h.samplePath); });
  const box = await page.locator('.pad').boundingBox();
  for (const sk of strokes) {
    const P = ([x, y]) => [box.x + x / 109 * box.width, box.y + y / 109 * box.height];
    await page.mouse.move(...P(sk[0])); await page.mouse.down();
    for (const p of sk.filter((_, i) => i % 3 === 0).concat([sk.at(-1)])) await page.mouse.move(...P(p));
    await page.mouse.up();
  }
  await shot('06_pen.png');
  await tap('checkPen');
  s = await st();
  ok(s.q.phase === 'done' && s.s.order.includes('飛') && !!s.s.pen['飛'], 'ペンで書けた字は おぼえた・ペンの記録');
  await tap('nextKanji');
  await wait(300);
  await shot('07_summary.png');
  ok((await page.locator('.sum .rc').count()) === 3 && (await page.locator('.sum').innerText()).includes('0 → 2'), 'まとめに3字と「おぼえた 0 → 2」');
  ok(await page.locator('.newbox .tcard').count() >= 1, 'まとめに あたらしい しょうごう');

  // ---- ホームの森 ----
  await tap('home');
  await wait(2200);
  await shot('08_home_birds.png');
  s = await st();
  ok(JSON.stringify(s.s.homeSeen[4]) === JSON.stringify(['信', '飛']), '森に おぼえた字のシマエナガ（信・飛）');

  // ---- もり・しょうごう・あしあと ----
  await tap('forest', 'forest');
  await wait(1800);
  await shot('09_forest.png');
  await tap('tab', 'titles');
  await shot('10_titles.png');
  ok(await page.locator('.tcard.new').count() >= 1, 'しょうごう一覧で NEW が光る');
  await tap('tab', 'days');
  await shot('11_days.png');
  ok((await page.locator('.day .ks').first().innerText()).includes('信飛'), 'あしあとに きょう おぼえた字');
  await tap('home');

  // ---- ずかん → 部品れんしゅう ----
  await tap('zukan');
  await shot('12_zukan.png');
  ok(await page.locator('.zcard.got').count() === 2 && await page.locator('.bd.here').count() === 1, 'ずかん：おぼえた2字・いまここ');
  await tap('onePart', 'にんべん');
  s = await st();
  await tap('answerName', 'にんべん');
  ok(await page.locator('.pad').count() === 1, 'ペンに切りかえた設定は 部品れんしゅうにも 引きつがれる');
  await tap('mode', 'shape');
  await tap('answerShape', 'にんべん');
  s = await st();
  ok(s.q.stage === 'done' && s.q.newDone && s.q.gain === 5, '部品：なまえ・形とも一発 +2羽、できた +3羽');
  await shot('13_part_done.png');
  await tap('nextPart');
  await tap('home');

  // ---- かんじ団子（10字おぼえた状態を作る） ----
  await page.evaluate(() => {
    const a = window.__app, P = a.P;
    for (const k of a.GD.kanji.slice(0, 12)) { const r = P.kanji[k.c] ||= {name: {ok: 1, miss: 0}, shape: {ok: 1, miss: 0}, pen: {ok: 0, miss: 0}, hinted: 0, model: 0, clean: 0, weak: false}; r.clean = 1; r.weak = false; if (!P.s.order.includes(k.c)) P.s.order.push(k.c); }
    a.render();
  });
  await tap('pick', 'たろう'); await wait(300);
  ok(await page.locator('.big.locked').count() === 0, '10字おぼえると かんじ団子が あそべる');
  await tap('dango');
  await wait(300); await shot('14_count.png');
  await page.waitForSelector('.dplay', {timeout: 5000});
  await shot('15_dplay.png');
  let missChar = null;
  for (let i = 0; i < 10; i++) {
    const d = await page.evaluate(() => { const D = window.__app.D; return {ch: D.q.char, choices: D.q.choices}; });
    const L = await ids(d.ch);
    if (i === 2) { missChar = d.ch; await tap('dTap', d.choices.find(c => !L.includes(c))); }
    for (const n of L) await tap('dTap', n);
  }
  await wait(500);
  await shot('16_dresult.png');
  s = await st();
  ok(s.screen === 'dresult' && s.s.dClears === 1 && s.s.dango[4].best > 0 && s.s.dango[4].ghost.length === 10, '団子：クリア・ベスト・ゴーストの記録');
  ok(await page.evaluate(c => window.__app.P.kanji[c].weak, missChar), 'まちがえた字は「もう一回」に もどる');
  ok((await page.locator('.dres .again').innerText()).includes(missChar), '結果に もう一回の字が出る');
  ok(!!s.s.titles.dc1, 'しょうごう「かんじ団子 デビュー」');
  await page.keyboard.press('Escape');
  await page.waitForSelector('.homeL');

  // ---- 再読みこみで記録が残る ----
  const before = (await st()).s.enaga;
  await page.reload(); await page.waitForSelector('.homeL');
  s = await st();
  ok(s.s.enaga === before && s.s.dClears === 1, '再読みこみ後も 記録が残る');

  // ---- 画面の大きさ（iPad 横・縦、スマホ横） ----
  for (const [w, h, name] of [[1180, 820, 'ipad_land'], [820, 1180, 'ipad_port'], [844, 390, 'phone_land']]) {
    await page.setViewportSize({width: w, height: h}); await wait(300);
    await shot(`17_${name}.png`);
    const fr = await page.locator('#frame').boundingBox();
    ok(fr.x >= -1 && fr.y >= -1 && fr.x + fr.width <= w + 1 && fr.y + fr.height <= h + 1, `${name}：枠が画面に収まる`);
  }
  await page.setViewportSize({width: 1280, height: 740});

  // ---- きろくを けす ----
  await tap('del');
  await page.click('[data-del="たろう"]');
  await page.click('#mBtns .danger');
  await page.click('#mBtns .danger');
  await page.fill('#delIn', 'じろう'); await page.click('#mBtns .danger');
  ok(await page.evaluate(() => !!window.__app.DB.P['たろう']), 'なまえが ちがうと けさない');
  await page.fill('#delIn', 'たろう'); await page.click('#mBtns .danger');
  ok(await page.evaluate(() => !window.__app.DB.P['たろう'] && !window.__app.DB.players.length), 'なまえを入れると けせる');

  ok(errors.length === 0, 'コンソールエラーなし' + (errors.length ? '：' + errors.join(' / ') : ''));
} finally {
  await browser.close();
  server.kill();
}
console.log(fails ? `${fails} FAIL` : 'ALL OK');
process.exit(fails ? 1 : 0);
