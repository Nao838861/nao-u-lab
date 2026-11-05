// 実ブラウザー（Chrome）でクリック・ペン入力を行い、学習の順番と記録を確かめる。
// 使い方: node test_flow.mjs  （web/ を 8765 番で配信し、shots/ に画面を保存する）
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
  await page.waitForSelector('.home');
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForSelector('.home');
  await page.screenshot({path: path.join(shots, '01_home.png')});

  const S = () => page.evaluate(() => { const s = window.__kobo.S; return JSON.parse(JSON.stringify({screen: s.screen, i: s.i, q: s.q, list: s.list})); });
  const click = sel => page.click(sel);
  // 字形の筆画をペンの線としてなぞる
  async function trace(strokes) {
    const box = await page.locator('.pad').boundingBox();
    for (const s of strokes) {
      const P = ([x, y]) => [box.x + x / 109 * box.width, box.y + y / 109 * box.height];
      await page.mouse.move(...P(s[0])); await page.mouse.down();
      for (const p of s.filter((_, i) => i % 3 === 0).concat([s.at(-1)])) await page.mouse.move(...P(p));
      await page.mouse.up();
    }
  }
  const sampled = (paths) => page.evaluate(async ps => { const h = await import('./handwriting.mjs'); return ps.map(h.samplePath); }, paths);

  // ---- 部品クイズ：形→なまえ（6択）→形（12択）----
  await click('[data-act=startParts]');
  let s = await S();
  ok(s.screen === 'parts' && s.q.stage === 'name', '入口から形→なまえの問題が始まる');
  ok(await page.locator('.choices.names .chip').count() === 6, 'なまえの候補は6つ');
  ok(await page.locator('.choices.shapes').count() === 0, 'なまえ正解前は形の問題が出ない');
  await page.screenshot({path: path.join(shots, '02_part_name.png')});
  const wrong = s.q.nameChoices.find(id => id !== s.q.id);
  await click(`[data-act=answerName][data-v=${wrong}]`);
  s = await S();
  ok(s.q.stage === 'name' && s.q.wrongNames.includes(wrong), '誤答では先へ進まず、その候補だけ消える');
  const first = s.q.id;
  await click(`[data-act=answerName][data-v=${first}]`);
  s = await S();
  ok(s.q.stage === 'shape' && s.q.id === first, '正解後は同じ部品の なまえ→形 へ');
  ok(await page.locator('.choices.shapes .tile').count() === 12, '形の候補は12個');
  await page.screenshot({path: path.join(shots, '03_part_shape.png')});
  await click(`[data-act=answerShape][data-v=${first}]`);
  s = await S();
  ok(s.q.stage === 'done', '形を当てると部品の一組が終わる');
  let rec = await page.evaluate(id => window.__kobo.store.parts[id], first);
  ok(rec.name.ok === 1 && rec.name.miss === 1 && rec.shape.ok === 1 && rec.pen.ok === 0, 'なまえ・形を別々に記録');
  await click('[data-act=nextPart]');

  // 2つ目：ペンへ切り替え、筆跡はモードを戻しても残る
  s = await S();
  await click(`[data-act=answerName][data-v=${s.q.id}]`);
  await click('[data-act=mode][data-v=pen]');
  ok(await page.locator('.pad').count() === 1, 'その場でペンへ切り替えられる');
  const partPaths = await page.evaluate(id => window.__kobo.PART_GLYPH[id].paths, s.q.id);
  await trace(await sampled(partPaths));
  await click('[data-act=mode][data-v=shape]');
  await click('[data-act=mode][data-v=pen]');
  ok((await S()).q.ink.length === partPaths.length, 'モードを行き来しても筆跡が消えない');
  await page.screenshot({path: path.join(shots, '04_part_pen.png')});
  await click('[data-act=checkPartPen]');
  s = await S();
  ok(s.q.stage === 'done' && s.q.usedMode === 'pen', '見本どおりの線はペン判定を通る');
  await click('[data-act=nextPart]');
  s = await S();
  ok(s.q.stage === 'name', '3部品の順番が保たれる（3つ目も 形→なまえ から）');
  // 途中で一覧を見て戻っても、状態は変わらない
  await click('[data-act=zukan]');
  await page.screenshot({path: path.join(shots, '05_zukan.png'), fullPage: true});
  await click('[data-act=back]');
  ok((await S()).q.id === s.q.id && (await S()).q.stage === 'name', 'ずかんを見て戻ると同じ問題に戻る');
  // 白紙・でたらめな線は通らない
  await click(`[data-act=answerName][data-v=${s.q.id}]`);
  const box = await page.locator('.pad').boundingBox();
  await page.mouse.move(box.x + 20, box.y + 20); await page.mouse.down(); await page.mouse.move(box.x + 200, box.y + 40); await page.mouse.up();
  await click('[data-act=checkPartPen]');
  ok((await S()).q.stage === 'shape', '一本線ではペン判定を通らない');
  await click('[data-act=model]');
  await click('[data-act=partModelNext]');
  ok((await S()).q.usedMode === null, '見本確認で先へ進める（成功とは記録しない）');
  await click('[data-act=nextPart]');
  ok(await page.locator('.results li').count() === 3, '3部品で一区切りのまとめ');
  await page.screenshot({path: path.join(shots, '06_part_summary.png')});

  // ---- 漢字：なまえで組む → 形を出す ----
  await page.evaluate(() => { window.__kobo.store.settings.mode = 'shape'; window.__kobo.act.oneKanji('仲'); window.__kobo.render(); });
  ok(!(await page.locator('main.kanji').innerText()).includes('仲'), '漢字のお題では答えの字を見せない');
  await page.screenshot({path: path.join(shots, '07_kanji_layout.png')});
  await click('[data-act=layout][data-v=lr]');
  await click('[data-act=pickName][data-v=middle]');   // わざと逆に置く
  await click('[data-act=pickName][data-v=person]');
  await click('[data-act=checkNames]');
  s = await S();
  ok(s.q.phase === 'names' && s.q.wrong.every(Boolean), '位置ちがいは×がつき、先へ進まない');
  // ヒント → 部品クイズ → お題に戻る
  await click('[data-act=hint][data-v="0"]');
  await page.screenshot({path: path.join(shots, '08_kanji_hint.png')});
  await click('[data-act=practicePart]');
  s = await S();
  ok(s.screen === 'parts' && s.q.id === 'person' && s.q.stage === 'name', 'ヒントから入る部品練習も 形→なまえ から');
  await click('[data-act=answerName][data-v=person]');
  await click('[data-act=answerShape][data-v=person]');
  await click('[data-act=returnToKanji]');
  s = await S();
  ok(s.screen === 'kanji' && s.q.char === '仲' && s.q.phase === 'names', '部品練習から元のお題に戻れる');
  await click('[data-act=slot][data-v="0"]');
  await click('[data-act=slot][data-v="1"]');
  await click('[data-act=slot][data-v="0"]');
  await click('[data-act=pickName][data-v=person]');
  await click('[data-act=pickName][data-v=middle]');
  await page.screenshot({path: path.join(shots, '09_kanji_names.png')});
  await click('[data-act=checkNames]');
  s = await S();
  ok(s.q.phase === 'shape', 'なまえの構成が正しいと形の段階へ');
  ok((await page.locator('.composed').first().innerText()).includes('ひだりに にんべん、みぎに なか'), '構成文が出る');
  ok(await page.locator('.choices.shapes .tile').count() === 12, '漢字の形の候補は部品12個');
  await click('[data-act=pickShape][data-v=person]');
  await click('[data-act=pickShape][data-v=middle]');
  await page.screenshot({path: path.join(shots, '10_kanji_shapes.png')});
  // ペンへ切り替えて戻っても、選んだ形は残る
  await click('[data-act=mode][data-v=pen]');
  await click('[data-act=mode][data-v=shape]');
  ok((await S()).q.shapes.join() === 'person,middle', 'モードを切り替えても選んだ形が残る');
  await click('[data-act=checkShapes]');
  s = await S();
  ok(s.q.phase === 'done', '形を正しく置くと完成');
  await page.waitForTimeout(3000);
  await page.screenshot({path: path.join(shots, '11_kanji_done.png')});
  rec = await page.evaluate(() => window.__kobo.store.kanji['仲']);
  ok(rec.name.ok === 1 && rec.name.miss === 1 && rec.shape.ok === 1 && rec.hinted === 1, '漢字の記録：なまえ・形・ヒントを区別');

  // ペンモードで漢字を書く（モードは保存され、次回起動でも残る）
  await page.evaluate(() => { window.__kobo.act.mode('pen'); });
  await page.reload(); await page.waitForSelector('.home');
  ok(await page.evaluate(() => window.__kobo.store.settings.mode) === 'pen', '最後のモードが次回起動に引き継がれる');
  await page.evaluate(() => { window.__kobo.act.oneKanji('念'); window.__kobo.render(); });
  await click('[data-act=layout][data-v=tb]');
  await click('[data-act=pickName][data-v=now]');
  await click('[data-act=pickName][data-v=heart]');
  await click('[data-act=checkNames]');
  ok(await page.locator('.pad').count() === 1, '前回のペンモードで形の段階が始まる');
  const g = await page.evaluate(() => window.__kobo.GLYPH['念']);
  await trace(await sampled([...g[0], ...g[1]]));
  await page.screenshot({path: path.join(shots, '12_kanji_pen.png')});
  await click('[data-act=checkPen]');
  ok((await S()).q.phase === 'done' && (await S()).q.usedMode === 'pen', '見本どおりの線で漢字のペン判定を通る');

  // 小さい画面（縦持ちスマホ相当）
  await page.setViewportSize({width: 390, height: 844});
  await page.evaluate(() => { window.__kobo.store.settings.mode = 'shape'; window.__kobo.act.startParts(); window.__kobo.render(); });
  await page.screenshot({path: path.join(shots, '13_mobile_part.png')});
  ok(errors.length === 0, `コンソールエラーなし ${errors.join(' | ')}`);
} finally {
  await browser.close();
  server.kill();
}
console.log(fails ? `\n${fails} 件失敗` : '\nすべて通過');
process.exit(fails ? 1 : 0);
