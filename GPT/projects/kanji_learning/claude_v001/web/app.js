// カンジ工房（Claude版）
// 小1〜小6の学年を選び、その学年の漢字・部品で学ぶ。データは tools/build_grades.py が作る grades/g1〜g6.json。
// 中心操作は「部品の名前（ひらがな）を書き順に唱えて答える → 形を出す（12個から選ぶ／ペンで書く）」。
// 唱え方・お題（「労ドウ の ドウ　はたら_く」）はミチムラ式の書式に合わせる。
// 部品の練習は「形 → 名前を6択」「名前 → 形を12択かペン」の順のクイズを基本にする。
import {judge} from './recognize.js';
import {samplePath} from './handwriting.mjs';

const KEY = 'kanji-kobo-claude-v1';
const NUM = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮'];
const no = i => NUM[i] || `${i + 1}`;
// 公開資料（公式カード画像・公式記事）で唱え方を確かめた字。生成した唱えと一致する時だけ画面で知らせる。
const OFFICIAL = {'働': 'にんべん、おもい、ちから', '温': 'さんずい、にち、さら', '強': 'ゆみへん、ム、むし',
  '教': 'おいかんむり、こ、のぶん', '点': 'たて、よこ、くち、れんが', '照': 'にちへん、かたな、くち、れんが',
  '遊': 'ほうへん、ノ、いち、こ、しんにょう'};

const $app = document.getElementById('app');
const SAMPLED = new Map();
let GD = null;            // 選んだ学年のデータ {grade, kanji: [{c, p, u, t, x}], parts: {名前: {d, k}}}
let BY = {};              // 漢字 -> データ
let QUIZ_PARTS = [];      // 部品クイズに出す部品（画だけの「たて」「よこ」などは除く）
let KANJI_CANDS = {}, PART_CANDS = {};  // 手書き判定で比べる候補：その学年の漢字・部品

// ---------- 記録 ----------
const store = loadStore();
function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v === 1) return {grade: 0, ...s};
  } catch {}
  return {v: 1, grade: 0, settings: {mode: 'shape'}, kanji: {}, parts: {}};
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {} }
function rec(kind, id) {
  return store[kind][id] ||= {name: {ok: 0, miss: 0}, shape: {ok: 0, miss: 0}, pen: {ok: 0, miss: 0}, hinted: 0, model: 0, last: null};
}
// skill: name / shape / pen。ok は「その種類で正解までたどり着いた回数」、miss は誤答の回数。
function mark(kind, id, skill, ok) {
  const r = rec(kind, id);
  r[skill][ok ? 'ok' : 'miss']++;
  r.last = new Date().toISOString().slice(0, 10);
  save();
}
const weakness = (kind, id) => {
  const r = store[kind][id];
  if (!r) return -100;  // 未挑戦を最優先
  const ok = r.name.ok + r.shape.ok + r.pen.ok, miss = r.name.miss + r.shape.miss + r.pen.miss;
  return ok - miss * 1.5 + r.hinted * -.5;
};
const doneKanji = ch => store.kanji[ch]?.shape.ok || store.kanji[ch]?.pen.ok;
const donePart = id => store.parts[id]?.name.ok && (store.parts[id]?.shape.ok || store.parts[id]?.pen.ok);

// ---------- 小道具 ----------
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickWeak = (kind, ids, n) => shuffle(ids).sort((a, b) => weakness(kind, a) - weakness(kind, b)).slice(0, n);
function fillChoices(correct, n, pool) {
  const out = [...new Set(correct)];
  for (const id of shuffle(pool)) {
    if (out.length >= n) break;
    if (!out.includes(id)) out.push(id);
  }
  return shuffle(out);
}
function say(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = .85;
    speechSynthesis.speak(u);
  } catch {}
}
const pts = d => { if (!SAMPLED.has(d)) SAMPLED.set(d, samplePath(d)); return SAMPLED.get(d); };
function boxOf(paths) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const d of paths) for (const [x, y] of pts(d)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return {x: x0, y: y0, w: x1 - x0, h: y1 - y0};
}
const unitPaths = (k, u) => u.s.map(i => k.p[i]);

// ---------- 字形の描画 ----------
// 部品は自分の外接枠に合わせて正方形に収める。正解だけ位置がぴったり合う、といった手がかりを出さないため、
// 候補はすべて同じ規則で表示する。
function pathsSvg(paths, {anim = false, cls = ''} = {}) {
  const box = boxOf(paths);
  const s = Math.max(box.w, box.h, 20) + 14, vx = box.x + box.w / 2 - s / 2, vy = box.y + box.h / 2 - s / 2;
  return glyphSvg(paths, `${vx.toFixed(1)} ${vy.toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)}`, s * .055, anim, cls);
}
const partSvg = (id, opt) => pathsSvg(GD.parts[id].d, opt);
// いまのお題の中の部品は、その字の中の形で見せる（同じ名前でも字によって形が少し違う）。
function shapeOf(id, ch) {
  const k = ch && BY[ch], u = k && k.u.find(u => u.n === id);
  return u ? unitPaths(k, u) : GD.parts[id].d;
}
function kanjiSvg(ch, {anim = false, cls = ''} = {}) {
  return glyphSvg(BY[ch].p, '0 0 109 109', 5, anim, cls);
}
// ミチムラ式カードのおもて面のように、k 番目の部品まで書いた字を、いま足した部品だけ赤で示す。
function buildSvg(ch, k, cls = '') {
  const K = BY[ch], shown = new Set(K.u.slice(0, k + 1).flatMap(u => u.s)), now = new Set(K.u[k].s);
  const idx = K.p.map((_, i) => i).filter(i => shown.has(i));
  return glyphSvg(idx.map(i => K.p[i]), '0 0 109 109', 5.5, false, cls, j => now.has(idx[j]) ? 'red' : 'gray');
}
function glyphSvg(paths, viewBox, sw, anim, cls, colorOf = () => '') {
  const w = sw.toFixed(2);
  if (!anim) return `<svg class="glyph ${cls}" viewBox="${viewBox}" aria-hidden="true"><g stroke-width="${w}">${paths.map((d, i) => `<path class="${colorOf(i)}" d="${d}"/>`).join('')}</g></svg>`;
  // 書き順：薄い全体の上に一画ずつ描く。
  return `<svg class="glyph anim ${cls}" viewBox="${viewBox}" aria-hidden="true"><g stroke-width="${w}">`
    + paths.map(d => `<path class="ghost" d="${d}"/>`).join('')
    + paths.map((d, i) => `<path class="draw ${colorOf(i)}" pathLength="100" style="animation-delay:${(i * .45 + .2).toFixed(2)}s" d="${d}"/>`).join('')
    + `</g></svg>`;
}

// ---------- 学年データ ----------
async function loadGrade(g) {
  const res = await fetch(`./grades/g${g}.json`);
  GD = await res.json();
  BY = Object.fromEntries(GD.kanji.map(k => [k.c, k]));
  QUIZ_PARTS = Object.keys(GD.parts).filter(id => !GD.parts[id].k);
  KANJI_CANDS = Object.fromEntries(GD.kanji.map(k => [k.c, k.p]));
  PART_CANDS = Object.fromEntries(QUIZ_PARTS.map(id => [id, GD.parts[id].d]));
}

// 唱えに公式資料にない画の名前（かぎ・はね など）が入る字は出題しない。
const ASKABLE = () => GD.kanji.filter(k => !k.z).map(k => k.c);

// ---------- 状態 ----------
let S = {screen: 'home'};

function startKanji(chars) {
  S = {screen: 'kanji', list: chars, i: 0, q: newKanjiQ(chars[0]), results: []};
}
function newKanjiQ(ch) {
  const ids = BY[ch].u.map(u => u.n), n = ids.length, kinds = new Set(ids).size;
  // 基本漢字は部品に分けずに形をおぼえる字：唱えの段はなく、ほかの基本漢字の中から形を選ぶ（またはペンで書く）。
  const basic = !!BY[ch].b;
  const pool = basic ? GD.kanji.filter(k => k.b).map(k => k.u[0].n) : Object.keys(GD.parts);
  return {
    char: ch, phase: basic ? 'shape' : 'names', names: basic ? ids.slice() : Array(n).fill(null), active: 0,
    nameChoices: fillChoices(ids, Math.max(6, kinds + 3), pool),
    // 形は唱える順に一つずつ出す（step = 出し終えた部品の数）。
    step: 0, wrongShapes: [], shapeChoices: fillChoices(ids, Math.max(12, kinds + 4), pool),
    wrong: Array(n).fill(false), ink: [], msg: null,
    hint: null, hints: Array(n).fill(0), nameMiss: 0, shapeMiss: 0, model: false, sawModel: false, usedMode: null,
  };
}
function startParts(ids, ret = null) {
  S = {screen: 'parts', list: ids, i: 0, q: newPartQ(ids[0]), results: [], ret};
}
function newPartQ(id) {
  return {
    id, stage: 'name', nameChoices: fillChoices([id], 6, QUIZ_PARTS), wrongNames: [],
    shapeChoices: fillChoices([id], 12, QUIZ_PARTS), wrongShapes: [], ink: [], msg: null,
    nameMiss: 0, shapeMiss: 0, model: false, sawModel: false, usedMode: null,
  };
}

// ---------- 操作 ----------
const K = () => BY[S.q.char];
const IDS = () => K().u.map(u => u.n);
const mode = () => store.settings.mode;
const act = {
  home() { S = {screen: 'home'}; },
  async grade(g) { store.grade = +g; save(); await loadGrade(+g); S = {screen: 'home'}; },
  changeGrade() { S = {screen: 'grade'}; },
  startKanji() { startKanji(pickWeak('kanji', ASKABLE(), 3)); },
  startParts() { startParts(pickWeak('parts', QUIZ_PARTS, 3)); },
  zukan() { S = {screen: 'zukan', back: S.screen === 'kanji' || S.screen === 'parts' ? S : null}; },
  back() { S = S.back || {screen: 'home'}; },
  oneKanji(ch) { startKanji([ch]); },
  onePart(id) { startParts([id]); },
  // どこでも切り替え可能な「暗黙のモード」。選んだ形も筆跡も消さない。
  mode(v) { store.settings.mode = v; save(); if (S.q) S.q.msg = null; },
  say(t) { say(t); },

  // --- 漢字：部品の名前を書き順に唱える ---
  slot(k) {
    const q = S.q; k = +k; q.active = k; q.msg = null;
    if (q.names[k]) { q.names[k] = null; q.wrong[k] = false; }
  },
  // 同じ名前が二度出る字（例：森＝き、はやし…、炎）もあるので、使った名前も選べるままにする。
  pickName(id) {
    const q = S.q;
    q.names[q.active] = id; q.wrong[q.active] = false; q.msg = null;
    // 空きがあればそこへ、なければ次の段へ進む（直し始めた段の続きを順に直せる）。
    const next = q.names.indexOf(null);
    q.active = next !== -1 ? next : Math.min(q.active + 1, q.names.length - 1);
  },
  checkNames() {
    const q = S.q, ids = IDS();
    q.wrong = q.names.map((id, k) => id !== ids[k]);
    if (!q.wrong.includes(true)) {
      mark('kanji', q.char, 'name', true);
      q.phase = 'shape'; q.wrong = q.wrong.map(() => false);
      q.msg = {ok: true, text: `「${chant(q.names)}」。こんどは形を出そう。`};
      say(chant(q.names));
    } else {
      q.nameMiss++; mark('kanji', q.char, 'name', false);
      q.msg = {ok: false, text: 'ちがうところに×がついているよ。書く順番どおりに並んでいるかも見てね。'};
    }
  },
  // --- 漢字：形を唱える順に一つずつ出す ---
  pickShape(id) {
    const q = S.q, ids = IDS();
    if (id === ids[q.step]) {
      q.step++; q.wrongShapes = []; q.msg = null;
      if (q.step === ids.length) finishKanji('shape');
    } else if (!q.wrongShapes.includes(id)) {
      q.wrongShapes.push(id); q.shapeMiss++; mark('kanji', q.char, 'shape', false);
      q.msg = {ok: false, text: `それは「${ids[q.step]}」の形ではないよ。`};
    }
  },
  checkPen() {
    const q = S.q;
    const res = judge(q.ink, q.char, KANJI_CANDS);
    if (res.ok) finishKanji('pen');
    else { q.shapeMiss++; mark('kanji', q.char, 'pen', false); q.msg = {ok: false, text: '形チェックでは、まだちがうところがありそう。もう一度書くか、ヒント・見本を使おう。'}; }
  },
  undo() { S.q.ink.pop(); S.q.msg = null; },
  clearInk() { S.q.ink = []; S.q.msg = null; },
  hint(k) {
    const q = S.q; k = +k;
    const min = q.phase === 'names' ? 1 : 2; // 形の段階では名前は分かっているので、形から見せる
    const cur = q.hint && q.hint.slot === k ? q.hint.level : min - 1;
    q.hint = {slot: k, level: Math.min(3, cur + 1)};
    q.hints[k] = Math.max(q.hints[k], q.hint.level);
    if (q.hint.level === 1) say(IDS()[k]);
  },
  closeHint() { S.q.hint = null; },
  practicePart(k) { const saved = S; saved.q.hint = null; startParts([IDS()[+k]], saved); },
  model() { S.q.model = true; },
  modelRetry() { const q = S.q; q.model = false; q.sawModel = true; q.ink = []; q.step = 0; q.wrongShapes = []; q.msg = null; },
  modelNext() { const q = S.q; q.model = false; q.sawModel = true; finishKanji(null); },
  nextKanji() {
    S.i++;
    if (S.i < S.list.length) S.q = newKanjiQ(S.list[S.i]);
    else S.q = null;
  },

  // --- 部品クイズ ---
  answerName(id) {
    const q = S.q;
    if (id === q.id) {
      mark('parts', q.id, 'name', true);
      q.stage = 'shape'; q.msg = {ok: true, text: `せいかい！ これは「${q.id}」。`};
      say(q.id);
    } else if (!q.wrongNames.includes(id)) {
      q.wrongNames.push(id); q.nameMiss++; mark('parts', q.id, 'name', false);
      q.msg = {ok: false, text: `「${id}」ではないよ。`};
    }
  },
  answerShape(id) {
    const q = S.q;
    if (id === q.id) finishPart('shape');
    else if (!q.wrongShapes.includes(id)) {
      q.wrongShapes.push(id); q.shapeMiss++; mark('parts', q.id, 'shape', false);
      q.msg = {ok: false, text: 'その形ではないよ。'};
    }
  },
  checkPartPen() {
    const q = S.q;
    // 部品は学年全体だと似た形が多いので、この問題の12候補の中で比べる。
    const res = judge(q.ink, q.id, Object.fromEntries(q.shapeChoices.map(id => [id, GD.parts[id].d])));
    if (res.ok) finishPart('pen');
    else { q.shapeMiss++; mark('parts', q.id, 'pen', false); q.msg = {ok: false, text: '形チェックでは、まだちがうところがありそう。'}; }
  },
  partModelNext() { const q = S.q; q.model = false; q.sawModel = true; finishPart(null); },
  nextPart() {
    S.i++;
    if (S.i < S.list.length) S.q = newPartQ(S.list[S.i]);
    else S.q = null;
  },
  moreParts() { startParts(pickWeak('parts', QUIZ_PARTS, 3)); },
  returnToKanji() { const ret = S.ret; S = ret; S.q.msg = {ok: true, text: '部品のれんしゅうから もどったよ。'}; },
};

function finishKanji(how) {
  const q = S.q;
  q.usedMode = how;
  if (how) mark('kanji', q.char, how, true);
  const r = rec('kanji', q.char);
  if (q.hints.some(Boolean)) r.hinted++;
  if (q.sawModel) r.model++;
  save();
  q.phase = 'done'; q.msg = null; q.hint = null;
  S.results.push({char: q.char, nameFirst: q.nameMiss === 0, shapeFirst: how && q.shapeMiss === 0, how, hinted: q.hints.some(Boolean), sawModel: q.sawModel});
}
function finishPart(how) {
  const q = S.q;
  q.usedMode = how;
  if (how) mark('parts', q.id, how, true);
  if (q.sawModel) { rec('parts', q.id).model++; save(); }
  q.stage = 'done'; q.msg = null;
  S.results.push({id: q.id, nameFirst: q.nameMiss === 0, shapeFirst: how && q.shapeMiss === 0, how, sawModel: q.sawModel});
}

// ---------- 画面 ----------
const chant = ids => ids.map(id => id || '？').join('、');
const btn = (a, label, {v = '', cls = '', dis = false, aria = ''} = {}) =>
  `<button type="button" class="${cls}" data-act="${a}" data-v="${v}" ${dis ? 'disabled' : ''} ${aria}>${label}</button>`;
const msgBox = m => m ? `<p class="msg ${m.ok ? 'ok' : 'ng'}" role="status">${m.text}</p>` : '<p class="msg"></p>';
const modeToggle = () => `<div class="mode" role="group" aria-label="形の出し方">
  ${btn('mode', '▦ 12個から選ぶ', {v: 'shape', aria: `aria-pressed="${mode() === 'shape'}"`})}
  ${btn('mode', '✎ ペンで書く', {v: 'pen', aria: `aria-pressed="${mode() === 'pen'}"`})}</div>`;
function bar(title, steps = '') {
  return `<header class="bar">${btn('home', '⌂', {cls: 'icon', aria: 'aria-label="ホーム"'})}<h1>${title}</h1><div class="steps">${steps}</div>${GD ? `<span class="gtag">${GD.grade}年</span>` : ''}${btn('zukan', 'ずかん', {cls: 'small'})}</header>`;
}
const dots = (n, i) => Array.from({length: n}, (_, k) => `<i class="${k < i ? 'fin' : k === i ? 'now' : ''}"></i>`).join('');
const pad = (cls = '') => `<div class="padwrap ${cls}"><svg class="pad" viewBox="0 0 109 109"><line x1="54.5" y1="2" x2="54.5" y2="107"/><line x1="2" y1="54.5" x2="107" y2="54.5"/><g class="ink"></g></svg></div>
  <div class="row">${btn('undo', '↶ ひとつけす', {cls: 'small'})}${btn('clearInk', 'ぜんぶけす', {cls: 'small'})}</div>`;

// 語の表示：答えの字は □（上にふりがな）。学年より上の字はデータ側でひらがなにしてある。
function wordHtml(segs) {
  return `<span class="wd">${segs.map(([t, furi, target]) => target ? `<ruby class="blankbox">□<rt>${furi || ''}</rt></ruby>` : t).join('')}</span>`;
}
// ミチムラ式のタイトルの書式：「労ドウ の ドウ　はたら_く」。答えの字は音読み（カタカナ）で表す。
function titleHtml(t) {
  const parts = [];
  if (t.word && t.on) parts.push(`${t.word.map(([c, furi, target]) => target ? `<b class="on">${t.wr || t.on}</b>` : furi ? `<ruby>${c}<rt>${furi}</rt></ruby>` : c).join('')} の <b class="on">${t.on}</b>`);
  else if (t.on) parts.push(`<b class="on">${t.on}</b>`);
  if (t.kun) parts.push(t.kun.replace(/^([^_]+)/, '<b>$1</b>'));
  return parts.map(x => `<span class="nw">${x}</span>`).join('　');
}

function render() {
  const v = !GD || S.screen === 'grade' ? gradeView() : S.screen === 'home' ? homeView() : S.screen === 'kanji' ? kanjiView() : S.screen === 'parts' ? partsView() : zukanView();
  $app.innerHTML = v;
  bindPad();
  $app.querySelector('.hintpanel')?.scrollIntoView({block: 'nearest'});
}

function gradeView() {
  const counts = {1: 80, 2: 160, 3: 200, 4: 202, 5: 193, 6: 191};
  return `<main class="home">
    <h1 class="logo">カンジ工房</h1>
    <p class="lead">なん年生の漢字を学ぶ？</p>
    <div class="grades">${[1, 2, 3, 4, 5, 6].map(g => `<button type="button" class="gradebtn ${store.grade === g ? 'on' : ''}" data-act="grade" data-v="${g}"><b>${g}</b>年<small>${counts[g]}字</small></button>`).join('')}</div>
    <p class="note">あとからホームで変えられます。</p></main>`;
}

function homeView() {
  const kDone = GD.kanji.filter(k => doneKanji(k.c)).length;
  const pDone = QUIZ_PARTS.filter(donePart).length;
  return `<main class="home">
    <h1 class="logo">カンジ工房</h1>
    <p class="lead">部品の<b>なまえ</b>を書く順に唱えてから、<b>かたち</b>を出す。</p>
    <p class="gradeline"><b>${GD.grade}年生</b>の漢字 ${btn('changeGrade', '学年をかえる', {cls: 'small'})}</p>
    <div class="menu">
      <button type="button" data-act="startKanji" class="big primary"><span class="em">字</span>漢字をつくる<small>3文字・${kDone}/${GD.kanji.length} できた</small></button>
      <button type="button" data-act="startParts" class="big"><span class="em">亻</span>部品クイズ<small>形→なまえ→形・${pDone}/${QUIZ_PARTS.length} できた</small></button>
      <button type="button" data-act="zukan" class="big sub"><span class="em">▦</span>ずかん<small>この学年の部品と漢字</small></button>
    </div>
    <p class="note">形の出し方：<b>${mode() === 'pen' ? 'ペンで書く' : '12個から選ぶ'}</b>（問題の中でいつでも切りかえられます）</p>
  </main>`;
}

function kanjiView() {
  if (!S.q) return kanjiSummary();
  const q = S.q, k = K();
  const ex = k.x.length ? `<p class="examples">${k.x.map(wordHtml).join('')}</p>` : '';
  const basicNote = k.b ? '<p class="note">基本漢字：部品に分けずに、形をそのまま おぼえる字</p>' : '';
  const prompt = `<section class="prompt"><p class="title">${titleHtml(k.t)}</p>${ex}${basicNote}</section>`;
  let body;
  if (q.phase === 'done') body = kanjiDone(q, k);
  else if (q.model) body = `<section class="model">
      <p class="lead">見本（書き順）</p>${kanjiSvg(q.char, {anim: true, cls: 'xl'})}
      <div class="row">${btn('modelRetry', '見本を消して、もう一度自分で', {cls: 'primary'})}${btn('modelNext', '見本を見たので次へ')}</div></section>`;
  else if (q.phase === 'names') body = namesStep(q, k);
  else body = shapeStep(q, k);
  return `${bar('漢字をつくる', dots(S.list.length, S.i))}<main class="kanji">${prompt}${body}</main>`;
}

// 唱えの段（ミチムラ式カードのおもて面）：①部品名 ②部品名 … を書き順に並べる。
function chantRows(q, k, {names, upto, onTap = false}) {
  return `<ol class="chantrows">${k.u.map((u, i) => {
    const shown = names[i];
    const glyph = i < upto ? buildSvg(q.char, i, 'row') : `<span class="rowblank">${i === upto && q.phase === 'shape' ? '？' : ''}</span>`;
    const cls = `${onTap && q.active === i ? 'active' : ''} ${q.wrong[i] ? 'wrong' : ''} ${q.phase === 'shape' && i === upto ? 'now' : ''}`;
    const label = `<span class="no">${no(i)}</span><span class="nm">${shown || '？'}</span>`;
    return `<li class="${cls}">${q.phase === 'names' ? '' : glyph}${onTap ? `<button type="button" class="rowbtn" data-act="slot" data-v="${i}">${label}</button>` : label}</li>`;
  }).join('')}</ol>`;
}
function hintButtons(k) {
  return k.u.map((_, i) => btn('hint', `💡${no(i)}`, {v: i, cls: 'small'})).join('');
}
function hintPanel(q, k) {
  if (!q.hint) return '';
  const {slot, level} = q.hint, id = k.u[slot].n, paths = unitPaths(k, k.u[slot]);
  const lines = [];
  if (level >= 1) lines.push(`<p>${no(slot)}の部品は「<b>${id}</b>」 ${btn('say', '🔊', {v: id, cls: 'icon'})}</p>`);
  if (level === 2) lines.push(`<div class="hintglyph">${pathsSvg(paths, {cls: 'm'})}</div>`);
  if (level >= 3) lines.push(`<div class="hintglyph">${pathsSvg(paths, {anim: true, cls: 'm'})}<span>書き順</span></div>`);
  const quiz = id in PART_CANDS ? btn('practicePart', `「${id}」をクイズで練習`, {v: slot, cls: 'small'}) : '';
  return `<aside class="hintpanel">${lines.join('')}
    <div class="row">${level < 3 ? btn('hint', 'もっとヒント', {v: slot, cls: 'small'}) : ''}${quiz}${btn('closeHint', 'とじる', {cls: 'small'})}</div></aside>`;
}

function namesStep(q, k) {
  const ready = q.names.every(Boolean);
  return `<section class="work">
    <p class="ask">この字の部品を、<b>書く順</b>に唱えよう <small>部品の<b>なまえ</b>をえらんでね（${k.u.length}つ）</small></p>
    ${chantRows(q, k, {names: q.names, upto: 0, onTap: true})}
    <p class="composed">${chant(q.names)}</p>
    ${msgBox(q.msg)}
    <div class="choices names">${q.nameChoices.map(id => btn('pickName', id, {v: id, cls: 'chip'})).join('')}</div>
    <div class="row">${btn('checkNames', 'これでOK', {cls: 'primary wide', dis: !ready})}</div>
    <div class="row hints">${hintButtons(k)}</div>${hintPanel(q, k)}
  </section>`;
}

function shapeStep(q, k) {
  const ids = IDS();
  let core;
  if (mode() === 'pen') {
    core = `${k.b ? '' : `<p class="composed lg">${chant(ids)}</p>`}${modeToggle()}
      <p class="ask">この字を書いてみよう <small>見本はなし。唱えを手がかりに</small></p>${pad()}
      ${msgBox(q.msg)}<div class="row">${btn('checkPen', '書けた！', {cls: 'primary wide', dis: !q.ink.length})}</div>`;
  } else {
    core = `${modeToggle()}
      <div class="shapework">${k.b ? '' : chantRows(q, k, {names: ids, upto: q.step})}
      <div><p class="ask">${k.b ? 'お題の字はどれ？' : `${no(q.step)}「<b>${ids[q.step]}</b>」の形はどれ？`}</p>
      ${msgBox(q.msg)}
      <div class="choices shapes">${q.shapeChoices.map(id => {
        const x = q.wrongShapes.includes(id);
        return `<button type="button" class="tile ${x ? 'x' : ''}" data-act="pickShape" data-v="${id}" ${x ? 'disabled' : ''} aria-label="形の候補">${pathsSvg(shapeOf(id, q.char))}</button>`;
      }).join('')}</div></div></div>`;
  }
  return `<section class="work shape">${core}
    <div class="row hints">${hintButtons(k)}${btn('model', '👀 見本を見る', {cls: 'small'})}</div>
    ${hintPanel(q, k)}</section>`;
}

function kanjiDone(q, k) {
  const tag = q.usedMode === 'pen' ? '✎ ペンで書けた' : q.usedMode === 'shape' ? '▦ 形をえらべた' : '👀 見本で確認';
  const ids = IDS();
  const official = k.b ? '<p class="note">ミチムラ式の基本漢字（書けるように練習する字）です。</p>'
    : OFFICIAL[q.char] === chant(ids) ? '<p class="note">この唱え方は公式カードと同じです。</p>'
    : '<p class="note">唱え方は推定です（公式の部品一覧の名前で、字形データから組み立てたもの。公式カードとはちがうことがあります）。</p>';
  return `<section class="done">
    <div class="donegrid">${kanjiSvg(q.char, {anim: true, cls: 'xl'})}${chantRows({...q, phase: 'done', active: -1, wrong: []}, k, {names: ids, upto: ids.length})}</div>
    <p class="composed lg">${chant(ids)}</p>${official}
    <p class="title">${titleHtml(k.t)}</p>
    <p class="examples">${k.x.map(segs => segs.map(([t, , target]) => target ? `<b>${q.char}</b>` : t).join('')).join('　')}</p>
    <p class="tags"><span>${tag}</span>${q.hints.some(Boolean) ? '<span>💡ヒントあり</span>' : ''}${q.nameMiss + q.shapeMiss ? `<span>まちがい ${q.nameMiss + q.shapeMiss}回</span>` : '<span>ノーミス</span>'}</p>
    <div class="row">${btn('nextKanji', S.i + 1 < S.list.length ? 'つぎの字へ' : 'けっかを見る', {cls: 'primary wide'})}</div></section>`;
}

function kanjiSummary() {
  const rows = S.results.map(r => `<li><span class="ch">${r.char}</span>
    <span>なまえ ${r.nameFirst ? '◎' : '○'}</span><span>${r.how === 'pen' ? '✎ペン' : r.how === 'shape' ? '▦形' : '👀見本'} ${r.shapeFirst ? '◎' : r.how ? '○' : '−'}</span>${r.hinted ? '<span>💡</span>' : ''}</li>`).join('');
  return `${bar('漢字をつくる')}<main class="summary"><h2>おつかれさま！</h2><ul class="results">${rows}</ul>
    <p class="note">◎ 一回で正解 ／ ○ まちがえたけど正解 ／ 見本で確認した字は、次に優先して出ます。</p>
    <div class="row">${btn('startKanji', 'つぎの3文字', {cls: 'primary wide'})}${btn('startParts', '部品クイズへ')}${btn('home', 'ホーム')}</div></main>`;
}

function partsView() {
  if (!S.q) return partsSummary();
  const q = S.q, total = S.list.length * 2, at = S.i * 2 + (q.stage === 'name' ? 0 : q.stage === 'shape' ? 1 : 2);
  let body;
  if (q.stage === 'name') {
    body = `<section class="pq">
      <p class="ask">この部品の<b>なまえ</b>は？</p>
      <div class="bigglyph">${partSvg(q.id, {cls: 'xl'})}</div>
      ${msgBox(q.msg)}
      <div class="choices names six">${q.nameChoices.map(id => btn('answerName', id, {v: id, cls: `chip ${q.wrongNames.includes(id) ? 'x' : ''}`, dis: q.wrongNames.includes(id)})).join('')}</div></section>`;
  } else if (q.stage === 'shape') {
    const ask = `<p class="ask lg">「<b>${q.id}</b>」の形は？ ${btn('say', '🔊', {v: q.id, cls: 'icon'})}</p>`;
    let core;
    if (q.model) core = `<div class="bigglyph">${partSvg(q.id, {anim: true, cls: 'xl'})}</div>
      <div class="row">${btn('modelRetry', '見本を消して、もう一度', {cls: 'primary'})}${btn('partModelNext', '見本を見たので次へ')}</div>`;
    else if (mode() === 'pen') core = `${pad('part')}${msgBox(q.msg)}
      <div class="row">${btn('checkPartPen', '書けた！', {cls: 'primary wide', dis: !q.ink.length})}${btn('model', '👀 見本', {cls: 'small'})}</div>`;
    else core = `${msgBox(q.msg)}<div class="choices shapes">${q.shapeChoices.map(id => `<button type="button" class="tile ${q.wrongShapes.includes(id) ? 'x' : ''}" data-act="answerShape" data-v="${id}" ${q.wrongShapes.includes(id) ? 'disabled' : ''} aria-label="形の候補">${partSvg(id)}</button>`).join('')}</div>
      <div class="row">${btn('model', '👀 見本を見る', {cls: 'small'})}</div>`;
    body = `<section class="pq">${ask}${modeToggle()}${core}</section>`;
  } else {
    const last = S.i + 1 >= S.list.length;
    const tag = q.usedMode === 'pen' ? '✎ ペンで書けた' : q.usedMode === 'shape' ? '▦ 形をえらべた' : '👀 見本で確認';
    const kanjiWith = GD.kanji.filter(k => k.u.some(u => u.n === q.id)).slice(0, 12).map(k => `<span>${k.c}</span>`).join('');
    body = `<section class="pq done">
      <div class="bigglyph">${partSvg(q.id, {anim: true, cls: 'xl'})}</div>
      <p class="composed lg">${q.id}</p>
      <p class="tags"><span>${tag}</span>${q.nameMiss + q.shapeMiss ? `<span>まちがい ${q.nameMiss + q.shapeMiss}回</span>` : '<span>ノーミス</span>'}</p>
      <p class="family">この部品が入っている${GD.grade}年の字：${kanjiWith}</p>
      <div class="row">${last && S.ret ? btn('returnToKanji', 'お題にもどる', {cls: 'primary wide'}) : btn('nextPart', last ? 'けっかを見る' : 'つぎの部品へ', {cls: 'primary wide'})}</div></section>`;
  }
  return `${bar('部品クイズ', dots(total, at))}<main class="parts">${body}</main>`;
}

function partsSummary() {
  const rows = S.results.map(r => `<li><span class="ch">${partSvg(r.id, {cls: 's'})}</span><span>${r.id}</span>
    <span>形→なまえ ${r.nameFirst ? '◎' : '○'}</span><span>なまえ→${r.how === 'pen' ? '✎' : r.how === 'shape' ? '▦' : '👀'} ${r.shapeFirst ? '◎' : r.how ? '○' : '−'}</span></li>`).join('');
  return `${bar('部品クイズ')}<main class="summary"><h2>3つの部品、おわり！</h2><ul class="results">${rows}</ul>
    <div class="row">${btn('moreParts', 'つぎの3部品', {cls: 'primary wide'})}${btn('startKanji', '漢字をつくる')}${btn('home', 'ホーム')}</div></main>`;
}

function zukanView() {
  const st = (kind, id) => {
    const r = store[kind][id];
    if (!r) return '<i></i><i></i>';
    return `<i class="${r.name.ok ? 'on' : ''}"></i><i class="${r.shape.ok || r.pen.ok ? 'on' : ''}"></i>`;
  };
  const parts = QUIZ_PARTS.map(id => `<button type="button" class="pcard" data-act="onePart" data-v="${id}">${partSvg(id, {cls: 's'})}<span>${id}</span><b class="st">${st('parts', id)}</b></button>`).join('');
  const kanji = GD.kanji.filter(k => !k.z).map(k => `<button type="button" class="pcard k" data-act="oneKanji" data-v="${k.c}"><span class="kc">${k.t.on || ''}</span><span class="small">${(k.t.kun || '').replace('_', '')}</span><b class="st">${st('kanji', k.c)}</b></button>`).join('');
  return `${bar('ずかん')}<main class="zukan">
    ${S.back ? `<div class="row">${btn('back', '← とちゅうの問題にもどる', {cls: 'primary'})}</div>` : ''}
    <h2>${GD.grade}年の部品 <small>${QUIZ_PARTS.length}こ・タップでその部品のクイズ（●なまえ ●形）</small></h2><div class="grid">${parts}</div>
    <h2>${GD.grade}年の漢字 <small>${GD.kanji.length}字・答えの字は出さず、読みで並べています</small></h2><div class="grid k">${kanji}</div>
    <p class="note">部品の名前はミチムラ式の公式パンフレットの「部品カード一覧」「基本漢字一覧」にそろえていますが、分け方は字形データからの推定です（公式カードで確認できたのは一部のみ）。唱えに公式資料にない画の名前が入る字（${GD.kanji.filter(k => k.z).length}字）は出していません。字源の説明ではありません。<br>字形：KanjiVG (CC BY-SA 3.0)／読み・語例：KANJIDIC2・JMdict（EDRDG, CC BY-SA 4.0）・JmdictFurigana</p>
  </main>`;
}

// ---------- ペン入力 ----------
function bindPad() {
  const svg = $app.querySelector('.pad');
  if (!svg) return;
  const g = svg.querySelector('.ink');
  const line = s => `<polyline points="${s.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ')}"/>`;
  g.innerHTML = S.q.ink.map(line).join('');
  let cur = null, el = null;
  const toLocal = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 109, (e.clientY - r.top) / r.height * 109]; };
  // iOS Safari や埋め込み表示では touch-action だけではページがスクロールするため、
  // 書く欄の中のタッチは非passiveで止める。
  const stop = e => e.preventDefault();
  for (const t of ['touchstart', 'touchmove', 'touchend']) svg.parentElement.addEventListener(t, stop, {passive: false});
  svg.addEventListener('pointerdown', e => {
    e.preventDefault(); svg.setPointerCapture(e.pointerId);
    cur = [toLocal(e)];
    el = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); g.appendChild(el);
  });
  svg.addEventListener('pointermove', e => {
    if (!cur) return;
    const p = toLocal(e), last = cur.at(-1);
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < .8) return;
    cur.push(p); el.setAttribute('points', cur.map(q => q.join(',')).join(' '));
  });
  const end = () => {
    if (!cur) return;
    if (cur.length === 1) cur.push([cur[0][0] + .5, cur[0][1] + .5]);
    S.q.ink.push(cur); S.q.msg = null; cur = null;
    render();
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
}

// ---------- 起動 ----------
$app.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  await act[b.dataset.act](b.dataset.v);
  render();
});

(async () => {
  if (store.grade) await loadGrade(store.grade);
  // テスト・確認用の入口
  window.__kobo = {get S() { return S; }, get GD() { return GD; }, get BY() { return BY; }, store, act, render, loadGrade};
  render();
})();
