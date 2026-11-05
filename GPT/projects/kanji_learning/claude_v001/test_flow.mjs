// 実ブラウザー（Chrome）でクリック・ペン入力を行い、学年選び・学習の順番・記録を確かめる。
// 使い方: node test_flow.mjs  （serve.py で web/ を 8765 番で配信し、shots/ に画面を保存する）
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium} = await import('file:///D:/AI/Nao_u_BOT/Claude/node_modules/playwright/index.mjs');

const here = path.dirname(fileURLToPath(import.meta.url));
const shots = path.join(here, 'shots');
fs.mkdirSync(shots, {recursive: true});
const server = spawn('python', [path.join(here, 'serve.py'), '8765'], {stdio: 'ignore'});
await new Promise(r => setTimeout(r, 1200));

let fails = 0;
const ok = (cond, label) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}`); if (!cond) fails++; };
const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
  const page = await browser.newPage({viewport: {width: 1180, height: 820}});
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto('http://127.0.0.1:8765/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const shot = name => page.screenshot({path: path.join(shots, name)});
  const S = () => page.evaluate(() => { const s = window.__kobo.S; return JSON.parse(JSON.stringify({screen: s.screen, i: s.i, q: s.q, list: s.list})); });
  const click = sel => page.click(sel);
  const go = fn => page.evaluate(fn);
  async function trace(strokes) {
    const box = await page.locator('.pad').boundingBox();
    for (const s of strokes) {
      const P = ([x, y]) => [box.x + x / 109 * box.width, box.y + y / 109 * box.height];
      await page.mouse.move(...P(s[0])); await page.mouse.down();
      for (const p of s.filter((_, i) => i % 3 === 0).concat([s.at(-1)])) await page.mouse.move(...P(p));
      await page.mouse.up();
    }
  }
  const sampled = paths => page.evaluate(async ps => { const h = await import('./handwriting.mjs'); return ps.map(h.samplePath); }, paths);

  // ---- 学年えらび ----
  await page.waitForSelector('.gradebtn');
  ok(await page.locator('.gradebtn').count() === 6, '最初に小1〜小6の学年を選ぶ');
  await shot('00_grade.png');
  await click('[data-act=grade][data-v="4"]');
  await page.waitForSelector('.menu');
  ok((await page.locator('.gradeline').innerText()).includes('4年生'), '4年を選ぶとホームに4年と出る');
  ok(await page.evaluate(() => window.__kobo.GD.kanji.length) === 202, '4年の漢字は202字');
  await shot('01_home.png');
  await page.reload(); await page.waitForSelector('.menu');
  ok((await page.locator('.gradeline').innerText()).includes('4年生'), '選んだ学年は次回起動にも残る');

  // ---- 部品クイズ：形→なまえ（6択）→形（12択）----
  await click('[data-act=startParts]');
  let s = await S();
  ok(s.screen === 'parts' && s.q.stage === 'name', '入口から形→なまえの問題が始まる');
  ok(await page.locator('.choices.names .chip').count() === 6, 'なまえの候補は6つ');
  await shot('02_part_name.png');
  const wrong = s.q.nameChoices.find(id => id !== s.q.id);
  await click(`[data-act=answerName][data-v="${wrong}"]`);
  s = await S();
  ok(s.q.stage === 'name' && s.q.wrongNames.includes(wrong), '誤答では先へ進まず、その候補だけ消える');
  const first = s.q.id;
  await click(`[data-act=answerName][data-v="${first}"]`);
  ok((await S()).q.stage === 'shape', '正解後は同じ部品の なまえ→形 へ');
  ok(await page.locator('.choices.shapes .tile').count() === 12, '形の候補は12個');
  await shot('03_part_shape.png');
  await click(`[data-act=answerShape][data-v="${first}"]`);
  ok((await S()).q.stage === 'done', '形を当てると部品の一組が終わる');
  let rec = await page.evaluate(id => window.__kobo.store.parts[id], first);
  ok(rec.name.ok === 1 && rec.name.miss === 1 && rec.shape.ok === 1, 'なまえ・形を別々に記録');
  await click('[data-act=nextPart]');
  s = await S();
  await click(`[data-act=answerName][data-v="${s.q.id}"]`);
  await click('[data-act=mode][data-v=pen]');
  const partPaths = await page.evaluate(id => window.__kobo.GD.parts[id].d, s.q.id);
  await trace(await sampled(partPaths));
  await click('[data-act=mode][data-v=shape]');
  await click('[data-act=mode][data-v=pen]');
  ok((await S()).q.ink.length === partPaths.length, 'モードを行き来しても筆跡が消えない');
  await shot('04_part_pen.png');
  await click('[data-act=checkPartPen]');
  ok((await S()).q.usedMode === 'pen', '見本どおりの線は部品のペン判定を通る');
  await click('[data-act=nextPart]');
  s = await S();
  await click('[data-act=zukan]');
  await shot('05_zukan.png');
  await click('[data-act=back]');
  ok((await S()).q.id === s.q.id, 'ずかんを見て戻ると同じ問題に戻る');

  // ---- 漢字：お題 → 部品名を書き順に唱える → 形を一つずつ出す ----
  await go(() => { window.__kobo.store.settings.mode = 'shape'; window.__kobo.act.oneKanji('仲'); window.__kobo.render(); });
  const promptText = await page.locator('.prompt').innerText();
  ok(!(await page.locator('main.kanji').innerText()).includes('仲'), 'お題では答えの字を見せない');
  ok(/チュウ/.test(promptText) && promptText.includes('なか'), `お題はミチムラ式の書式（${promptText.split('\n')[0]}）`);
  await shot('07_kanji_prompt.png');
  await click('[data-act=pickName][data-v="なか"]');
  await click('[data-act=pickName][data-v="にんべん"]');
  await click('[data-act=checkNames]');
  s = await S();
  ok(s.q.phase === 'names' && s.q.wrong.every(Boolean), '順番ちがいは×がつき、先へ進まない');
  await click('[data-act=hint][data-v="0"]');
  await shot('08_kanji_hint.png');
  await click('[data-act=practicePart]');
  s = await S();
  ok(s.screen === 'parts' && s.q.id === 'にんべん' && s.q.stage === 'name', 'ヒントから部品クイズへ（形→なまえ から）');
  await click('[data-act=answerName][data-v="にんべん"]');
  await click('[data-act=answerShape][data-v="にんべん"]');
  await click('[data-act=returnToKanji]');
  ok((await S()).q.char === '仲', '部品クイズから元のお題に戻れる');
  await click('[data-act=slot][data-v="0"]');
  await click('[data-act=pickName][data-v="にんべん"]');
  await click('[data-act=pickName][data-v="なか"]');
  await click('[data-act=checkNames]');
  ok((await S()).q.phase === 'shape', '唱えが正しいと形の段階へ');
  ok(await page.locator('.choices.shapes .tile').count() === 12, '形の候補は12個');
  await click('[data-act=pickShape][data-v="なか"]');
  ok((await S()).q.step === 0, '①の形をまちがえると①のまま');
  await click('[data-act=pickShape][data-v="にんべん"]');
  ok((await S()).q.step === 1, '①が正しいと②へ（書き順どおり）');
  await shot('10_kanji_shapes.png');
  await click('[data-act=pickShape][data-v="なか"]');
  ok((await S()).q.phase === 'done', '全部の形を書き順に出すと完成');
  rec = await page.evaluate(() => window.__kobo.store.kanji['仲']);
  ok(rec.name.ok === 1 && rec.name.miss === 1 && rec.shape.ok === 1 && rec.shape.miss === 1 && rec.hinted === 1, '漢字の記録：なまえ・形・ヒントを区別');

  // 働：公式カードどおり（にんべん、おもい、ちから／労ドウ の ドウ　はたら_く）
  await go(() => { window.__kobo.act.oneKanji('働'); window.__kobo.render(); });
  const t = await page.locator('.prompt .title').innerText();
  ok(t.replace(/\s/g, '') === '労ドウのドウはたら_く', `働のお題が公式カードのタイトルと同じ（${t}）`);
  for (const id of ['にんべん', 'おもい', 'ちから']) await click(`[data-act=pickName][data-v="${id}"]`);
  await click('[data-act=checkNames]');
  for (const id of ['にんべん', 'おもい', 'ちから']) await click(`[data-act=pickShape][data-v="${id}"]`);
  ok((await page.locator('.done').innerText()).includes('公式カードと同じ'), '働の完成画面で公式と同じ唱えだと示す');
  await page.waitForTimeout(3000);
  await shot('11_hataraku_done.png');

  // ペンモード（保存され、次回起動でも残る）
  await go(() => window.__kobo.act.mode('pen'));
  await page.reload(); await page.waitForSelector('.menu');
  await go(() => { window.__kobo.act.oneKanji('念'); window.__kobo.render(); });
  const nen = await page.evaluate(() => window.__kobo.BY['念'].u.map(u => u.n));
  for (const id of nen) await click(`[data-act=pickName][data-v="${id}"]`);
  await click('[data-act=checkNames]');
  ok(await page.locator('.pad').count() === 1, '前回のペンモードで形の段階が始まる');
  await trace(await sampled(await page.evaluate(() => window.__kobo.BY['念'].p)));
  await shot('12_kanji_pen.png');
  await click('[data-act=checkPen]');
  ok((await S()).q.usedMode === 'pen', '見本どおりの線で、4年の全202字の中から念と判定される');

  // ---- 全学年：読み込めて、お題を最後まで組める ----
  await go(() => { window.__kobo.store.settings.mode = 'shape'; });
  for (const g of [1, 2, 3, 5, 6]) {
    await go(() => window.__kobo.act.changeGrade()); await go(() => window.__kobo.render());
    await click(`[data-act=grade][data-v="${g}"]`);
    await page.waitForSelector('.menu');
    await click('[data-act=startKanji]');
    s = await S();
    ok(s.screen === 'kanji' && s.list.length === 3 && await page.locator('.chantrows li').count() >= 1, `${g}年：3文字のお題が始まる（${s.list.join('')}）`);
    if (g === 1) await shot('13_grade1_kanji.png');
    const ids = await page.evaluate(() => window.__kobo.BY[window.__kobo.S.q.char].u.map(u => u.n));
    for (const id of ids) await click(`[data-act=pickName][data-v="${id}"]`);
    await click('[data-act=checkNames]');
    for (const id of ids) await click(`[data-act=pickShape][data-v="${id}"]`);
    ok((await S()).q.phase === 'done', `${g}年：${s.q.char}（${ids.join('、')}）を最後まで組める`);
  }
  await go(() => window.__kobo.act.zukan()); await go(() => window.__kobo.render());
  await shot('14_grade6_zukan.png');

  // 小さい画面（縦持ちスマホ相当）
  await page.setViewportSize({width: 390, height: 844});
  await go(() => window.__kobo.act.grade(4));
  await go(() => { window.__kobo.act.oneKanji('働'); window.__kobo.render(); });
  await shot('15_mobile_kanji.png');
  ok(errors.length === 0, `コンソールエラーなし ${errors.join(' | ')}`);
} finally {
  await browser.close();
  server.kill();
}
console.log(fails ? `\n${fails} 件失敗` : '\nすべて通過');
process.exit(fails ? 1 : 0);
