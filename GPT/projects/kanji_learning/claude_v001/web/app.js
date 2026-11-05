// カンジ工房（Claude版）
// 中心操作は「部品の名前（ひらがな）で構成を答える → 形を出す（12個から選ぶ／ペンで書く）」。
// 部品の練習は「形 → 名前を6択」「名前 → 形を12択かペン」の順のクイズを基本にする。
import {PARTS, LESSONS, BY_CHAR} from './data.mjs';
import {samplePath, compareInk} from './handwriting.mjs';

const KEY = 'kanji-kobo-claude-v1';
const PART_IDS = Object.keys(PARTS);
const NAME = id => PARTS[id][1];
const LAY_WORDS = {lr: ['ひだり', 'みぎ'], tb: ['うえ', 'した']};
// 構成で左（上）・右（下）に来る部品の集合。誤答候補を「それらしく」するために使う。
const POOL = [new Set(LESSONS.map(l => l.parts[0])), new Set(LESSONS.map(l => l.parts[1]))];

const $app = document.getElementById('app');
let GLYPH = {};          // 漢字 -> [[左(上)の筆画d...], [右(下)の筆画d...]]
const PART_GLYPH = {};   // 部品ID -> {paths, box}
const SAMPLED = new Map();

// ---------- 記録 ----------
const store = loadStore();
function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v === 1) return s;
  } catch {}
  return {v: 1, settings: {mode: 'shape'}, kanji: {}, parts: {}};
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

// ---------- 小道具 ----------
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickWeak = (kind, ids, n) => shuffle(ids).sort((a, b) => weakness(kind, a) - weakness(kind, b)).slice(0, n);
function fillChoices(correct, n, prefer = []) {
  const out = [...correct];
  for (const id of [...shuffle(prefer), ...shuffle(PART_IDS)]) {
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

// ---------- 字形の描画 ----------
// 部品は自分の外接枠に合わせて正方形に収める。正解だけ位置がぴったり合う、といった手がかりを出さないため、
// 候補はすべて同じ規則で表示する。
function partSvg(id, {anim = false, cls = ''} = {}) {
  const {paths, box} = PART_GLYPH[id];
  const s = Math.max(box.w, box.h) + 14, vx = box.x + box.w / 2 - s / 2, vy = box.y + box.h / 2 - s / 2;
  return glyphSvg(paths, `${vx.toFixed(1)} ${vy.toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)}`, s * .055, anim, cls);
}
function kanjiSvg(ch, {anim = false, cls = '', colored = false} = {}) {
  const [a, b] = GLYPH[ch];
  if (!colored) return glyphSvg([...a, ...b], '0 0 109 109', 5, anim, cls);
  return glyphSvg([...a, ...b], '0 0 109 109', 5, anim, cls, i => i < a.length ? 'c0' : 'c1');
}
function glyphSvg(paths, viewBox, sw, anim, cls, colorOf = () => '') {
  const w = sw.toFixed(2);
  if (!anim) return `<svg class="glyph ${cls}" viewBox="${viewBox}" aria-hidden="true"><g stroke-width="${w}">${paths.map((d, i) => `<path class="${colorOf(i)}" d="${d}"/>`).join('')}</g></svg>`;
  // 書き順：薄い全体の上に一画ずつ描く。
  return `<svg class="glyph anim ${cls}" viewBox="${viewBox}" aria-hidden="true"><g stroke-width="${w}">`
    + paths.map(d => `<path class="ghost" d="${d}"/>`).join('')
    + paths.map((d, i) => `<path class="draw ${colorOf(i)}" pathLength="100" style="animation-delay:${(i * .6 + .2).toFixed(2)}s" d="${d}"/>`).join('')
    + `</g></svg>`;
}

// ---------- 状態 ----------
let S = {screen: 'home'};

function startKanji(chars) {
  S = {screen: 'kanji', list: chars, i: 0, q: newKanjiQ(chars[0]), results: []};
}
function newKanjiQ(ch) {
  const L = BY_CHAR[ch];
  return {
    char: ch, phase: 'names', layout: null, names: [null, null], active: 0,
    nameChoices: fillChoices(L.parts, 6, [...POOL[0], ...POOL[1]].filter(id => !L.parts.includes(id)).slice(0, 8)),
    shapes: [null, null], shapeChoices: fillChoices(L.parts, 12, [...POOL[0]]),
    wrong: [false, false], layoutWrong: false, ink: [], msg: null,
    hint: null, hints: [0, 0], nameMiss: 0, shapeMiss: 0, model: false, sawModel: false, usedMode: null,
  };
}
function startParts(ids, ret = null) {
  S = {screen: 'parts', list: ids, i: 0, q: newPartQ(ids[0]), results: [], ret};
}
function newPartQ(id) {
  return {
    id, stage: 'name', nameChoices: fillChoices([id], 6), wrongNames: [],
    shapeChoices: fillChoices([id], 12), wrongShapes: [], ink: [], msg: null,
    nameMiss: 0, shapeMiss: 0, model: false, sawModel: false, usedMode: null,
  };
}

// ---------- 操作 ----------
const L = () => BY_CHAR[S.q.char];
const mode = () => store.settings.mode;
const act = {
  home() { S = {screen: 'home'}; },
  startKanji() { startKanji(pickWeak('kanji', LESSONS.map(l => l.char), 3)); },
  startParts() { startParts(pickWeak('parts', PART_IDS, 3)); },
  zukan() { S = {screen: 'zukan', back: S.screen === 'kanji' || S.screen === 'parts' ? S : null}; },
  back() { S = S.back || {screen: 'home'}; },
  oneKanji(ch) { startKanji([ch]); },
  onePart(id) { startParts([id]); },
  // どこでも切り替え可能な「暗黙のモード」。選んだ形も筆跡も消さない。
  mode(v) { store.settings.mode = v; save(); if (S.q) S.q.msg = null; },
  say(t) { say(t); },

  // --- 漢字：名前で組み立てる ---
  layout(v) { const q = S.q; q.layout = v; q.layoutWrong = false; q.msg = null; },
  slot(k) {
    const q = S.q; k = +k; q.active = k; q.msg = null;
    const arr = q.phase === 'names' ? q.names : q.shapes;
    if (arr[k]) { arr[k] = null; q.wrong[k] = false; }
  },
  pickName(id) {
    const q = S.q; if (q.names.includes(id)) return;
    q.names[q.active] = id; q.wrong[q.active] = false; q.msg = null;
    q.active = q.names.indexOf(null) === -1 ? q.active : q.names.indexOf(null);
  },
  checkNames() {
    const q = S.q, l = L();
    q.layoutWrong = q.layout !== l.layout;
    q.wrong = q.names.map((id, k) => id !== l.parts[k]);
    if (!q.layoutWrong && !q.wrong.includes(true)) {
      mark('kanji', q.char, 'name', true);
      q.phase = 'shape'; q.active = 0; q.wrong = [false, false];
      q.msg = {ok: true, text: `「${compose(l.layout, q.names)}」。こんどは形を出そう。`};
      say(compose(l.layout, q.names));
    } else {
      q.nameMiss++; mark('kanji', q.char, 'name', false);
      q.msg = {ok: false, text: q.layoutWrong ? 'ならび方（左右か上下か）を見なおそう。' : 'ちがうところに×がついているよ。'};
    }
  },
  // --- 漢字：形を出す ---
  pickShape(id) {
    const q = S.q;
    const other = q.shapes.indexOf(id); if (other !== -1) q.shapes[other] = null;
    q.shapes[q.active] = id; q.wrong[q.active] = false; q.msg = null;
    const empty = q.shapes.indexOf(null); if (empty !== -1) q.active = empty;
  },
  checkShapes() {
    const q = S.q, l = L();
    q.wrong = q.shapes.map((id, k) => id !== l.parts[k]);
    if (!q.wrong.includes(true)) finishKanji('shape');
    else { q.shapeMiss++; mark('kanji', q.char, 'shape', false); q.msg = {ok: false, text: '×の場所の形がちがうよ。ヒントも使えるよ。'}; }
  },
  checkPen() {
    const q = S.q, [a, b] = GLYPH[q.char];
    const res = compareInk(q.ink, [...a, ...b].map(pts));
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
    if (q.hint.level === 1) say(NAME(L().parts[k]));
  },
  closeHint() { S.q.hint = null; },
  practicePart(k) { const saved = S; saved.q.hint = null; startParts([L().parts[+k]], saved); },
  model() { S.q.model = true; },
  modelRetry() { const q = S.q; q.model = false; q.sawModel = true; q.ink = []; q.shapes = [null, null]; q.active = 0; q.msg = null; },
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
      q.stage = 'shape'; q.msg = {ok: true, text: `せいかい！ これは「${NAME(q.id)}」。`};
      say(NAME(q.id));
    } else if (!q.wrongNames.includes(id)) {
      q.wrongNames.push(id); q.nameMiss++; mark('parts', q.id, 'name', false);
      q.msg = {ok: false, text: `「${NAME(id)}」ではないよ。`};
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
    const res = compareInk(q.ink, PART_GLYPH[q.id].paths.map(pts));
    if (res.ok) finishPart('pen');
    else { q.shapeMiss++; mark('parts', q.id, 'pen', false); q.msg = {ok: false, text: '形チェックでは、まだちがうところがありそう。'}; }
  },
  partModelNext() { const q = S.q; q.model = false; q.sawModel = true; finishPart(null); },
  nextPart() {
    S.i++;
    if (S.i < S.list.length) S.q = newPartQ(S.list[S.i]);
    else S.q = null;
  },
  moreParts() { startParts(pickWeak('parts', PART_IDS, 3)); },
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
const compose = (lay, ids) => `${LAY_WORDS[lay][0]}に ${ids[0] ? NAME(ids[0]) : '？'}、${LAY_WORDS[lay][1]}に ${ids[1] ? NAME(ids[1]) : '？'}`;
const btn = (a, label, {v = '', cls = '', dis = false, aria = ''} = {}) =>
  `<button type="button" class="${cls}" data-act="${a}" data-v="${v}" ${dis ? 'disabled' : ''} ${aria}>${label}</button>`;
const msgBox = m => m ? `<p class="msg ${m.ok ? 'ok' : 'ng'}" role="status">${m.text}</p>` : '<p class="msg"></p>';
const modeToggle = () => `<div class="mode" role="group" aria-label="形の出し方">
  ${btn('mode', '▦ 12個から選ぶ', {v: 'shape', aria: `aria-pressed="${mode() === 'shape'}"`})}
  ${btn('mode', '✎ ペンで書く', {v: 'pen', aria: `aria-pressed="${mode() === 'pen'}"`})}</div>`;
function bar(title, steps = '') {
  return `<header class="bar">${btn('home', '⌂', {cls: 'icon', aria: 'aria-label="ホーム"'})}<h1>${title}</h1><div class="steps">${steps}</div>${btn('zukan', 'ずかん', {cls: 'small'})}</header>`;
}
const dots = (n, i) => Array.from({length: n}, (_, k) => `<i class="${k < i ? 'fin' : k === i ? 'now' : ''}"></i>`).join('');
const pad = (cls = '') => `<div class="padwrap ${cls}"><svg class="pad" viewBox="0 0 109 109"><line x1="54.5" y1="2" x2="54.5" y2="107"/><line x1="2" y1="54.5" x2="107" y2="54.5"/><g class="ink"></g></svg></div>
  <div class="row">${btn('undo', '↶ ひとつけす', {cls: 'small'})}${btn('clearInk', 'ぜんぶけす', {cls: 'small'})}</div>`;

function render() {
  const v = S.screen === 'home' ? homeView() : S.screen === 'kanji' ? kanjiView() : S.screen === 'parts' ? partsView() : zukanView();
  $app.innerHTML = v;
  bindPad();
  $app.querySelector(".hintpanel")?.scrollIntoView({block: "nearest"});
}

function homeView() {
  const kDone = LESSONS.filter(l => store.kanji[l.char]?.shape.ok || store.kanji[l.char]?.pen.ok).length;
  const pDone = PART_IDS.filter(id => store.parts[id]?.name.ok && (store.parts[id]?.shape.ok || store.parts[id]?.pen.ok)).length;
  return `<main class="home">
    <h1 class="logo">カンジ工房</h1>
    <p class="lead">部品の<b>なまえ</b>で組み立ててから、<b>かたち</b>を出す。</p>
    <div class="menu">
      <button type="button" data-act="startKanji" class="big primary"><span class="em">仲</span>漢字をつくる<small>3文字・${kDone}/${LESSONS.length} できた</small></button>
      <button type="button" data-act="startParts" class="big"><span class="em">亻</span>部品クイズ<small>形→なまえ→形・${pDone}/${PART_IDS.length} できた</small></button>
      <button type="button" data-act="zukan" class="big sub"><span class="em">▦</span>ずかん<small>部品と漢字の一覧</small></button>
    </div>
    <p class="note">形の出し方：<b>${mode() === 'pen' ? 'ペンで書く' : '12個から選ぶ'}</b>（問題の中でいつでも切りかえられます）</p>
  </main>`;
}

function kanjiView() {
  if (!S.q) return kanjiSummary();
  const q = S.q, l = L();
  const prompt = `<section class="prompt">
    <p class="word">${l.wordReading}</p>
    <p class="sentence">${l.sentence.replace(/［(.+?)］/, '<span class="blank">$1</span>')}</p>
    <p class="meaning">${l.meaning}</p></section>`;
  let body;
  if (q.phase === 'done') body = kanjiDone(q, l);
  else if (q.model) body = `<section class="model">
      <p class="lead">見本（書き順）</p>${kanjiSvg(q.char, {anim: true, cls: 'xl', colored: true})}
      <div class="row">${btn('modelRetry', '見本を消して、もう一度自分で', {cls: 'primary'})}${btn('modelNext', '見本を見たので次へ')}</div></section>`;
  else if (q.phase === 'names') body = namesStep(q, l);
  else body = shapeStep(q, l);
  return `${bar('漢字をつくる', dots(S.list.length, S.i))}<main class="kanji">${prompt}${body}</main>`;
}

function frame(q, lay, contentOf) {
  const words = LAY_WORDS[lay];
  return `<div class="frame ${lay}">${[0, 1].map(k => `<button type="button" class="slot s${k} ${q.active === k ? 'active' : ''} ${q.wrong[k] ? 'wrong' : ''}" data-act="slot" data-v="${k}" aria-label="${words[k]}">
      ${contentOf(k)}<span class="pos">${words[k]}</span></button>`).join('')}</div>`;
}
function hintButtons(q, lay) {
  return `<div class="row hints">${[0, 1].map(k => btn('hint', `💡 ${LAY_WORDS[lay][k]}のヒント`, {v: k, cls: 'small'})).join('')}</div>`;
}
function hintPanel(q, l) {
  if (!q.hint) return '';
  const {slot, level} = q.hint, id = l.parts[slot], w = LAY_WORDS[l.layout][slot];
  const lines = [];
  if (level >= 1) lines.push(`<p>${w}の部品は「<b>${NAME(id)}</b>」 ${btn('say', '🔊', {v: NAME(id), cls: 'icon'})}</p>`);
  if (level === 2) lines.push(`<div class="hintglyph">${partSvg(id, {cls: 'm'})}</div>`);
  if (level >= 3) lines.push(`<div class="hintglyph">${partSvg(id, {anim: true, cls: 'm'})}<span>書き順</span></div>`);
  return `<aside class="hintpanel">${lines.join('')}
    <div class="row">${level < 3 ? btn('hint', 'もっとヒント', {v: slot, cls: 'small'}) : ''}${btn('practicePart', `「${NAME(id)}」をクイズで練習`, {v: slot, cls: 'small'})}${btn('closeHint', 'とじる', {cls: 'small'})}</div></aside>`;
}

function namesStep(q, l) {
  const lay = q.layout;
  const frameHtml = lay
    ? frame(q, lay, k => `<span class="nm">${q.names[k] ? NAME(q.names[k]) : '？'}</span>`)
    : `<div class="frame pick"><p>どんなならび方？</p><div class="row">
        ${btn('layout', '<span class="lay lr"><i></i><i></i></span>左と右', {v: 'lr', cls: 'laybtn'})}
        ${btn('layout', '<span class="lay tb"><i></i><i></i></span>上と下', {v: 'tb', cls: 'laybtn'})}</div></div>`;
  const ready = lay && q.names.every(Boolean);
  return `<section class="work">
    <p class="ask">この字は、どんな部品でできている？ <small>部品の<b>なまえ</b>をえらんでね</small></p>
    <div class="target">${frameHtml}
      ${lay ? `<p class="composed">${compose(lay, q.names)}</p><div class="row">${btn('layout', lay === 'lr' ? 'ならび方を上下にする' : 'ならび方を左右にする', {v: lay === 'lr' ? 'tb' : 'lr', cls: `small ${q.layoutWrong ? 'wrongbtn' : ''}`})}</div>` : ''}
    </div>
    ${msgBox(q.msg)}
    <div class="choices names">${q.nameChoices.map(id => btn('pickName', NAME(id), {v: id, cls: 'chip', dis: !lay || q.names.includes(id)})).join('')}</div>
    <div class="row">${btn('checkNames', 'これでOK', {cls: 'primary wide', dis: !ready})}</div>
    ${lay ? hintButtons(q, lay) : ''}${hintPanel(q, l)}
  </section>`;
}

function shapeStep(q, l) {
  const sentence = `<p class="composed lg">${compose(l.layout, l.parts)}</p>`;
  let core;
  if (mode() === 'pen') {
    core = `<p class="ask">この字を書いてみよう <small>見本はなし。上のことばを手がかりに</small></p>${pad()}
      ${msgBox(q.msg)}<div class="row">${btn('checkPen', '書けた！', {cls: 'primary wide', dis: !q.ink.length})}</div>`;
  } else {
    core = `<p class="ask">それぞれの場所に合う形を、12個からえらんでね</p>
      <div class="target">${frame(q, l.layout, k => q.shapes[k] ? partSvg(q.shapes[k]) : `<span class="nm faint">${NAME(l.parts[k])}</span>`)}</div>
      ${msgBox(q.msg)}
      <div class="choices shapes">${q.shapeChoices.map(id => `<button type="button" class="tile ${q.shapes.includes(id) ? 'used' : ''}" data-act="pickShape" data-v="${id}" aria-label="形の候補">${partSvg(id)}</button>`).join('')}</div>
      <div class="row">${btn('checkShapes', 'これでOK', {cls: 'primary wide', dis: !q.shapes.every(Boolean)})}</div>`;
  }
  return `<section class="work shape">${sentence}${modeToggle()}${core}
    <div class="row hints">${[0, 1].map(k => btn('hint', `💡 ${LAY_WORDS[l.layout][k]}のヒント`, {v: k, cls: 'small'})).join('')}${btn('model', '👀 見本を見る', {cls: 'small'})}</div>
    ${hintPanel(q, l)}</section>`;
}

function kanjiDone(q, l) {
  const tag = q.usedMode === 'pen' ? '✎ ペンで書けた' : q.usedMode === 'shape' ? '▦ 形をえらべた' : '👀 見本で確認';
  return `<section class="done">
    ${kanjiSvg(q.char, {anim: true, cls: 'xl', colored: true})}
    <p class="composed lg"><span class="c0">${LAY_WORDS[l.layout][0]}に ${NAME(l.parts[0])}</span>、<span class="c1">${LAY_WORDS[l.layout][1]}に ${NAME(l.parts[1])}</span></p>
    <p class="word">${l.word}（${l.wordReading}）</p>
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
      <div class="choices names six">${q.nameChoices.map(id => btn('answerName', NAME(id), {v: id, cls: `chip ${q.wrongNames.includes(id) ? 'x' : ''}`, dis: q.wrongNames.includes(id)})).join('')}</div></section>`;
  } else if (q.stage === 'shape') {
    const ask = `<p class="ask lg">「<b>${NAME(q.id)}</b>」の形は？ ${btn('say', '🔊', {v: NAME(q.id), cls: 'icon'})}</p>`;
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
    const kanjiWith = LESSONS.filter(l => l.parts.includes(q.id)).map(l => `<span>${l.char}</span>`).join('');
    body = `<section class="pq done">
      <div class="bigglyph">${partSvg(q.id, {anim: true, cls: 'xl'})}</div>
      <p class="composed lg">${NAME(q.id)}</p>
      <p class="tags"><span>${tag}</span>${q.nameMiss + q.shapeMiss ? `<span>まちがい ${q.nameMiss + q.shapeMiss}回</span>` : '<span>ノーミス</span>'}</p>
      <p class="family">この部品が入っている字：${kanjiWith}</p>
      <div class="row">${last && S.ret ? btn('returnToKanji', 'お題にもどる', {cls: 'primary wide'}) : btn('nextPart', last ? 'けっかを見る' : 'つぎの部品へ', {cls: 'primary wide'})}</div></section>`;
  }
  return `${bar('部品クイズ', dots(total, at))}<main class="parts">${body}</main>`;
}

function partsSummary() {
  const rows = S.results.map(r => `<li><span class="ch">${partSvg(r.id, {cls: 's'})}</span><span>${NAME(r.id)}</span>
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
  const parts = PART_IDS.map(id => `<button type="button" class="pcard" data-act="onePart" data-v="${id}">${partSvg(id, {cls: 's'})}<span>${NAME(id)}</span><b class="st">${st('parts', id)}</b></button>`).join('');
  const kanji = LESSONS.map(l => `<button type="button" class="pcard k" data-act="oneKanji" data-v="${l.char}"><span class="kc">${l.wordReading}</span><span class="small">${l.tag}</span><b class="st">${st('kanji', l.char)}</b></button>`).join('');
  return `${bar('ずかん')}<main class="zukan">
    ${S.back ? `<div class="row">${btn('back', '← とちゅうの問題にもどる', {cls: 'primary'})}</div>` : ''}
    <h2>部品 <small>タップでその部品のクイズ（●なまえ ●形）</small></h2><div class="grid">${parts}</div>
    <h2>漢字のお題 <small>答えの字と部品は、問題の中で思い出す</small></h2><div class="grid k">${kanji}</div>
    <p class="note">部品の名前・分け方は、この試作での覚え方です。字源を示すものではありません。字形：KanjiVG (CC BY-SA 3.0)</p>
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
$app.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  act[b.dataset.act](b.dataset.v);
  render();
});

(async () => {
  GLYPH = await (await fetch('./glyphs.json')).json();
  for (const l of LESSONS) l.parts.forEach((id, k) => {
    if (!PART_GLYPH[id]) PART_GLYPH[id] = {paths: GLYPH[l.char][k], box: boxOf(GLYPH[l.char][k])};
  });
  // テスト・確認用の入口
  window.__kobo = {get S() { return S; }, store, act, render, GLYPH, PART_GLYPH, LESSONS};
  render();
})();
