// エナガの かんじの森
// 学び方：部品の なまえ（ひらがな）を 書く順に唱える → 形を出す（12個からえらぶ／ペンで書く）。
// ヒントも見本も使わずにできた字だけが「おぼえた」になり、その字を持ったシマエナガが森にあつまる。
// 続ける理由：シマエナガの数・しょうごう・一発れんぞく・あしあと（日ごとの記録）・かんじ団子（おぼえた字のタイムアタック）。
import {judge} from '../lib/recognize.js';
import {samplePath} from '../lib/handwriting.mjs';
import {drawEnaga, drawBg, snowyBranch, blinkNow, burst, drawSparks} from './enaga.js';
import {sfx, snd, ac, bgmStart, bgmStop} from './sound.js';
import {TITLES, RO, RANK_TITLE} from './titles.js';

const KEY = 'enaga_kanji_v1';
const NUM = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫'];
const no = i => NUM[i] || `${i + 1}`;
const $ = s => document.querySelector(s);
const $ui = $('#ui');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
const GRADE_N = {1: 80, 2: 160, 3: 200, 4: 202, 5: 193, 6: 191};

// ---------- 記録 ----------
// DB = {v, players:[最近つかった順], last, P:{なまえ: プレイヤー}, snd:{muted}}
function loadDB() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.v === 1) return d; } catch {}
  return {v: 1, players: [], last: null, P: {}, snd: {muted: false}};
}
const DB = loadDB();
function saveDB() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch {} }
function fresh() {
  return {grade: 0, pos: {}, mode: 'shape', kanji: {}, parts: {},
    s: {enaga: 0, seen: 0, streakNow: 0, streakBest: 0, titles: {}, tSeen: {}, days: {}, order: [], homeSeen: {}, pen: {},
      cleanSets: 0, regained: 0, secDone: {}, termDone: {}, gradeDone: {}, dango: {}, dLast: {}, dClears: 0, dNoMiss: 0, rank: 0, bestUp: 0}};
}
function playerData(name) {
  const p = DB.P[name] ||= fresh(), f = fresh();
  for (const k in f) if (p[k] === undefined) p[k] = f[k];
  for (const k in f.s) if (p.s[k] === undefined) p.s[k] = f.s[k];
  return p;
}
let player = DB.last && DB.players.includes(DB.last) ? DB.last : null;
let P = player ? playerData(player) : null;
snd.muted = !!DB.snd?.muted;

function rec(kind, id) {
  return P[kind][id] ||= {name: {ok: 0, miss: 0}, shape: {ok: 0, miss: 0}, pen: {ok: 0, miss: 0}, hinted: 0, model: 0, clean: 0, weak: false, last: null};
}
function mark(kind, id, skill, ok) {
  const r = rec(kind, id); r[skill][ok ? 'ok' : 'miss']++; r.last = today();
}
const doneKanji = ch => { const r = P?.kanji[ch]; return !!r && r.clean > 0 && !r.weak; };
const donePart = id => { const r = P?.parts[id]; return !!r && r.name.ok > 0 && (r.shape.ok + r.pen.ok) > 0; };
const kState = ch => { const r = P?.kanji[ch]; if (doneKanji(ch)) return 'got'; if (r && r.weak) return 'again'; return r && (r.name.ok || r.shape.ok || r.pen.ok) ? 'mid' : 'new'; };
const weakness = (kind, id) => {
  const r = P[kind][id]; if (!r) return -100;
  return r.name.ok + r.shape.ok + r.pen.ok - (r.name.miss + r.shape.miss + r.pen.miss) * 1.5 - r.hinted * .5;
};
function dayLog(d = today()) { return P.s.days[d] ||= {learned: [], enaga: 0, titles: [], dango: 0, sets: 0, play: 0}; }

// ---------- 学年データ ----------
let GD = null, BY = {}, QUIZ_PARTS = [], KANJI_CANDS = {};
const gradeCache = {};
async function loadGrade(g) {
  if (!gradeCache[g]) gradeCache[g] = await (await fetch(`./data/g${g}.json`)).json();
  GD = gradeCache[g];
  BY = Object.fromEntries(GD.kanji.map(k => [k.c, k]));
  QUIZ_PARTS = Object.keys(GD.parts).filter(id => !GD.parts[id].k);
  KANJI_CANDS = Object.fromEntries(GD.kanji.map(k => [k.c, k.p]));
}
const ASKABLE = () => GD.kanji.filter(k => GD.book || !k.z).map(k => k.c);
const posOf = () => P.pos[GD.grade] || 0;
function nextInOrder(n, from = posOf()) {
  const L = ASKABLE(), out = [];
  for (let k = 0; k < L.length && out.length < n; k++) { const c = L[(from + k) % L.length]; if (!doneKanji(c)) out.push(c); }
  return out.length ? out : L.slice(from).concat(L).slice(0, n);
}
const hereChar = () => GD && P ? nextInOrder(1)[0] : null;
const gradeLearned = () => GD ? GD.kanji.filter(k => doneKanji(k.c)) : [];

// ---------- 小道具 ----------
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickWeak = (kind, ids, n) => shuffle(ids).sort((a, b) => weakness(kind, a) - weakness(kind, b)).slice(0, n);
function fillChoices(correct, n, pool) {
  const out = [...new Set(correct)];
  for (const id of shuffle(pool)) { if (out.length >= n) break; if (!out.includes(id)) out.push(id); }
  return shuffle(out);
}
function say(text) {
  try {
    if (snd.muted || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = .85; speechSynthesis.speak(u);
  } catch {}
}

// ---------- 字形 ----------
const SAMPLED = new Map();
const pts = d => { if (!SAMPLED.has(d)) SAMPLED.set(d, samplePath(d)); return SAMPLED.get(d); };
function boxOf(paths) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const d of paths) for (const [x, y] of pts(d)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return {x: x0, y: y0, w: x1 - x0, h: y1 - y0};
}
const unitPaths = (k, u) => u.s.map(i => k.p[i]);
// 部品は自分の外接枠で正方形に収める（正解だけ位置が合う、という手がかりを出さない）
function pathsSvg(paths, {anim = false, cls = ''} = {}) {
  const b = boxOf(paths), s = Math.max(b.w, b.h, 20) + 14, vx = b.x + b.w / 2 - s / 2, vy = b.y + b.h / 2 - s / 2;
  return glyphSvg(paths, `${vx.toFixed(1)} ${vy.toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)}`, s * .055, anim, cls);
}
const partSvg = (id, opt) => pathsSvg(GD.parts[id].d, opt);
function shapeOf(id, ch) { const k = ch && BY[ch], u = k && k.u.find(u => u.n === id); return u ? unitPaths(k, u) : GD.parts[id].d; }
const kanjiSvg = (ch, opt = {}) => glyphSvg(BY[ch].p, '0 0 109 109', 5, opt.anim, opt.cls || '');
// k 番目の部品まで書いた字。いま足した部品だけ赤
function buildSvg(ch, k) {
  const K = BY[ch];
  if (k < 0) return '';
  const shown = new Set(K.u.slice(0, k + 1).flatMap(u => u.s)), now = new Set(K.u[k].s);
  const idx = K.p.map((_, i) => i).filter(i => shown.has(i));
  return glyphSvg(idx.map(i => K.p[i]), '0 0 109 109', 5.5, false, '', j => now.has(idx[j]) ? 'red' : '');
}
function glyphSvg(paths, viewBox, sw, anim, cls, colorOf = () => '') {
  const w = sw.toFixed(2);
  if (!anim) return `<svg class="glyph ${cls}" viewBox="${viewBox}" aria-hidden="true"><g stroke-width="${w}">${paths.map((d, i) => `<path class="${colorOf(i)}" d="${d}"/>`).join('')}</g></svg>`;
  return `<svg class="glyph anim ${cls}" viewBox="${viewBox}" aria-hidden="true"><g stroke-width="${w}">`
    + paths.map(d => `<path class="ghost" d="${d}"/>`).join('')
    + paths.map((d, i) => `<path class="draw" pathLength="100" style="animation-delay:${(i * .4 + .2).toFixed(2)}s" d="${d}"/>`).join('') + `</g></svg>`;
}

// ---------- ごほうび・しょうごう ----------
function addEnaga(n) { P.s.enaga += n; dayLog().enaga += n; }
function titleCtx() {
  const s = P.s, ds = Object.keys(s.days).sort();
  let dayStreak = 0, cur = 0, prev = null;
  for (const d of ds) { const t = Date.parse(d); cur = prev != null && t - prev === 864e5 ? cur + 1 : 1; dayStreak = Math.max(dayStreak, cur); prev = t; }
  return {
    learned: Object.keys(P.kanji).filter(doneKanji).length, sections: Object.keys(s.secDone).length, terms: Object.keys(s.termDone).length,
    grades: Object.keys(s.gradeDone).map(Number), streakBest: s.streakBest, pen: Object.keys(s.pen).length, cleanSets: s.cleanSets,
    parts: Object.keys(P.parts).filter(donePart).length, days: ds.length, dayStreak, enaga: s.enaga, dClears: s.dClears, dNoMiss: s.dNoMiss,
    rank: s.rank, regained: s.regained, dayMax: Math.max(0, ...Object.values(s.days).map(d => d.learned.length)),
  };
}
const gotCount = () => TITLES.filter(t => P.s.titles[t.id]).length;
const newTitles = () => TITLES.filter(t => P.s.titles[t.id] && !P.s.tSeen[t.id]);
let sessTitles = null;  // いまの まとまり（3文字・かんじ団子1回）で取ったしょうごう
function checkTitles(quiet = false) {
  const c = titleCtx(), got = [];
  for (const t of TITLES) if (!P.s.titles[t.id] && t.test(c)) { P.s.titles[t.id] = today(); dayLog().titles.push(t.id); got.push(t); }
  if (got.length) {
    if (sessTitles) sessTitles.push(...got);
    if (!quiet) { setTimeout(() => sfx.title(), 350); got.slice(0, 3).forEach((t, i) => setTimeout(() => toast(`<span class="nb">しょうごう</span>「${esc(t.name)}」ゲット！`), 300 + i * 500)); }
  }
  saveDB();
  return got;
}
function toast(html, cls = '') {
  const box = $('#toast'); while (box.children.length >= 3) box.firstChild.remove();
  const d = document.createElement('div'); d.className = 't ' + cls; d.innerHTML = html; box.appendChild(d);
  setTimeout(() => d.remove(), 2800);
}
// 一発で正かい（ミスなし・ヒントなし・見本なし）
function stepFirst() {
  const s = P.s; s.streakNow++; if (s.streakNow > s.streakBest) s.streakBest = s.streakNow;
  addEnaga(1); dayLog().play++;
  addFriend(false); setMood('happy', 900); sfx.chirp(s.streakNow);
  if (s.streakNow % 10 === 0) banner(`一発 ${s.streakNow}れんぞく！`);
}
// ヒントを使ってできた：子エナガが とまる（数えない・れんぞくは そのまま）
function stepHelped() { dayLog().play++; addFriend(true); setMood('happy', 700); sfx.chirp(0); }
function stepAfterMiss() { dayLog().play++; setMood('happy', 600); sfx.chirp(0); }
function miss() { P.s.streakNow = 0; setMood('oops', 900, 'おしい！'); sfx.oops(); }

// 字を おぼえた時：+10羽、森に そのシマエナガが くる、教科書の回・学期・学年が そろったら ごほうび
function onLearned(ch, wasWeak) {
  const s = P.s;
  addEnaga(10); dayLog().learned.push(ch);
  s.order = s.order.filter(c => c !== ch).concat(ch);
  if (wasWeak) { s.regained++; toast(`「${ch}」を とりかえした！ +10羽`, 'leaf'); } else toast(`「${ch}」を おぼえた！ +10羽`, 'leaf');
  sfx.learned();
  const g = GD.grade, k = BY[ch];
  if (k.ss && k.ss !== '順番不明') {
    const sec = GD.kanji.filter(x => x.ss === k.ss);
    if (!s.secDone[g + ':' + k.ss] && sec.every(x => doneKanji(x.c))) {
      s.secDone[g + ':' + k.ss] = today(); addEnaga(30);
      setTimeout(() => toast(`${g}年 ${k.ss} を ぜんぶ おぼえた！ +30羽`, 'leaf'), 700);
    }
    const term = k.ss.replace(/[①-⑫]$/, '');
    const tk = GD.kanji.filter(x => x.ss && x.ss.startsWith(term));
    if (!s.termDone[g + ':' + term] && tk.every(x => doneKanji(x.c))) s.termDone[g + ':' + term] = today();
  }
  if (!s.gradeDone[g] && ASKABLE().every(doneKanji)) { s.gradeDone[g] = today(); addEnaga(100); setTimeout(() => toast(`${g}年の 字を ぜんぶ おぼえた！ +100羽`, 'leaf'), 1200); }
}

// ---------- 状態 ----------
let S = {screen: 'home'};
const mode = () => P?.mode || 'shape';
function sessStart() { sessTitles = []; return {enaga0: P.s.enaga, learned0: gradeLearned().length, streak0: P.s.streakNow}; }

function startKanji(chars) { resetFriends(); S = {screen: 'study', list: chars, i: 0, q: newKanjiQ(chars[0]), results: [], sess: sessStart()}; }
function newKanjiQ(ch) {
  const K = BY[ch], ids = K.u.map(u => u.n), n = ids.length, kinds = new Set(ids).size, pool = Object.keys(GD.parts);
  return {
    char: ch, phase: 'names', names: Array(n).fill(null), active: 0,
    nameChoices: K.nd ? [...new Set(ids)] : fillChoices(ids, Math.max(6, kinds + 3), pool),
    step: 0, wrongShapes: [], shapeChoices: K.nd ? [...new Set(ids)] : fillChoices(ids, Math.max(12, kinds + 4), pool),
    wrong: Array(n).fill(false), ink: [], msg: null, hint: null, hints: Array(n).fill(0), hintIn: {names: false, shape: false},
    nameMiss: 0, shapeMiss: 0, model: false, sawModel: false, usedMode: null, gain: null,
  };
}
function startParts(ids, ret = null) { resetFriends(); S = {screen: 'parts', list: ids, i: 0, q: newPartQ(ids[0]), results: [], ret, sess: sessStart()}; }
function newPartQ(id) {
  return {id, stage: 'name', nameChoices: fillChoices([id], 6, QUIZ_PARTS), wrongNames: [], shapeChoices: fillChoices([id], 12, QUIZ_PARTS),
    wrongShapes: [], ink: [], msg: null, nameMiss: 0, shapeMiss: 0, model: false, sawModel: false, usedMode: null, gain: 0};
}
function needName() {
  const w = $('.who'); if (!w) return; w.classList.remove('need'); void w.offsetWidth; w.classList.add('need'); $('#nameIn')?.focus();
}
function ready() {
  if (!player) { needName(); return false; }
  if (!GD) { const g = $('.grades'); g?.classList.remove('need'); void g?.offsetWidth; g?.classList.add('need'); toast('学年を えらんでね'); return false; }
  return true;
}
function selectPlayer(name) {
  name = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 10);
  if (!name) return false;
  DB.players = [name].concat(DB.players.filter(n => n !== name)); DB.last = name; player = name; P = playerData(name);
  saveDB(); return true;
}

const K = () => BY[S.q.char];
const IDS = () => K().u.map(u => u.n);
const act = {
  async home() { if (S.screen === 'dplay' || S.screen === 'dcount') stopDango(); S = {screen: 'home'}; },
  async pick(name) { if (selectPlayer(name)) { if (P.grade) await loadGrade(P.grade); else GD = null; } },
  async nameOk() { if (selectPlayer($('#nameIn').value)) { if (P.grade) await loadGrade(P.grade); else GD = null; } else needName(); },
  async grade(g) { if (!player) return needName(); P.grade = +g; saveDB(); await loadGrade(+g); },
  startKanji() { if (ready()) startKanji(nextInOrder(3)); },
  startParts() { if (ready()) startParts(pickWeak('parts', QUIZ_PARTS, 3)); },
  zukan() { if (!ready()) return; S = {screen: 'zukan', back: S.screen === 'study' || S.screen === 'parts' ? S : null}; },
  back() { S = S.back || {screen: 'home'}; },
  forest(t) { if (!player) return needName(); S = {screen: 'forest', tab: t || 'forest'}; onTab(S.tab); },
  tab(t) { S.tab = t; onTab(t); },
  oneKanji(ch) {
    const L = ASKABLE(), i = Math.max(0, L.indexOf(ch));
    P.pos[GD.grade] = i; saveDB();
    startKanji([ch, ...nextInOrder(2, (i + 1) % L.length).filter(c => c !== ch)]);
  },
  onePart(id) { startParts([id]); },
  mode(v) { P.mode = v; saveDB(); if (S.q) S.q.msg = null; },
  say(t) { say(t); },
  dango() { if (!ready()) return; if (gradeLearned().length < 10) { toast(`あと ${10 - gradeLearned().length}字 おぼえると あそべるよ`); return; } startDango(); },
  del() { openDelete(); },
  mute() {},

  // --- 漢字：部品の なまえを 書く順に唱える ---
  slot(k) { const q = S.q; k = +k; q.active = k; q.msg = null; if (q.names[k]) { q.names[k] = null; q.wrong[k] = false; } },
  pickName(id) {
    const q = S.q; sfx.tap();
    q.names[q.active] = id; q.wrong[q.active] = false; q.msg = null;
    const next = q.names.indexOf(null);
    q.active = next !== -1 ? next : Math.min(q.active + 1, q.names.length - 1);
  },
  checkNames() {
    const q = S.q, ids = IDS();
    q.wrong = q.names.map((id, k) => id !== ids[k]);
    if (!q.wrong.includes(true)) {
      mark('kanji', q.char, 'name', true);
      if (q.nameMiss === 0 && !q.hintIn.names) stepFirst(); else if (q.nameMiss === 0) stepHelped(); else stepAfterMiss();
      q.phase = 'shape'; q.wrong = q.wrong.map(() => false); q.hint = null;
      q.msg = {ok: true, text: `「${chant(q.names)}」。こんどは 形を 出そう。`};
      say(chant(q.names)); checkTitles(); saveDB();
    } else {
      q.nameMiss++; mark('kanji', q.char, 'name', false); miss(); saveDB();
      q.msg = {ok: false, text: '×の ところが ちがうよ。書く じゅんばんも 見てね。'};
    }
  },
  pickShape(id) {
    const q = S.q, ids = IDS();
    if (id === ids[q.step]) {
      q.step++; q.wrongShapes = []; q.msg = null; sfx.chirp(q.step); setMood('happy', 400);
      if (q.step === ids.length) finishKanji('shape');
    } else if (!q.wrongShapes.includes(id)) {
      q.wrongShapes.push(id); q.shapeMiss++; mark('kanji', q.char, 'shape', false); miss(); saveDB();
      q.msg = {ok: false, text: `それは「${ids[q.step]}」の 形では ないよ。`};
    }
  },
  checkPen() {
    const q = S.q, res = judge(q.ink, q.char, KANJI_CANDS);
    if (res.ok) finishKanji('pen');
    else { q.shapeMiss++; mark('kanji', q.char, 'pen', false); miss(); saveDB(); q.msg = {ok: false, text: 'まだ ちがう ところが ありそう。もう一度 書くか、ヒントを 使おう。'}; }
  },
  undo() { S.q.ink.pop(); S.q.msg = null; },
  clearInk() { S.q.ink = []; S.q.msg = null; },
  hint(k) {
    const q = S.q; k = +k;
    const min = q.phase === 'names' ? 1 : 2;
    const cur = q.hint && q.hint.slot === k ? q.hint.level : min - 1;
    q.hint = {slot: k, level: Math.min(3, cur + 1)};
    q.hints[k] = Math.max(q.hints[k], q.hint.level); q.hintIn[q.phase === 'names' ? 'names' : 'shape'] = true;
    if (q.hint.level === 1) say(IDS()[k]);
  },
  closeHint() { S.q.hint = null; },
  practicePart(k) { const saved = S; saved.q.hint = null; const sess = saved.sess, fr = friends, st = sessTitles; startParts([IDS()[+k]], saved); S.sess = sess; friends = fr; sessTitles = st; },
  model() { S.q.model = true; S.q.hint = null; },
  modelRetry() { const q = S.q; q.model = false; q.sawModel = true; q.ink = []; q.step = 0; q.wrongShapes = []; q.msg = null; },
  modelNext() { const q = S.q; q.model = false; q.sawModel = true; finishKanji(null); },
  nextKanji() { S.i++; if (S.i < S.list.length) S.q = newKanjiQ(S.list[S.i]); else finishSet(); },

  // --- 部品れんしゅう ---
  answerName(id) {
    const q = S.q;
    if (id === q.id) {
      mark('parts', q.id, 'name', true);
      if (q.nameMiss === 0) { stepFirst(); q.gain++; } else stepAfterMiss();
      q.stage = 'shape'; q.msg = {ok: true, text: `せいかい！ これは「${q.id}」。`}; say(q.id); checkTitles(); saveDB();
    } else if (!q.wrongNames.includes(id)) {
      q.wrongNames.push(id); q.nameMiss++; mark('parts', q.id, 'name', false); miss(); saveDB();
      q.msg = {ok: false, text: `「${id}」では ないよ。`};
    }
  },
  answerShape(id) {
    const q = S.q;
    if (id === q.id) finishPart('shape');
    else if (!q.wrongShapes.includes(id)) {
      q.wrongShapes.push(id); q.shapeMiss++; mark('parts', q.id, 'shape', false); miss(); saveDB(); q.msg = {ok: false, text: 'その形では ないよ。'};
    }
  },
  checkPartPen() {
    const q = S.q, res = judge(q.ink, q.id, Object.fromEntries(q.shapeChoices.map(id => [id, GD.parts[id].d])));
    if (res.ok) finishPart('pen');
    else { q.shapeMiss++; mark('parts', q.id, 'pen', false); miss(); saveDB(); q.msg = {ok: false, text: 'まだ ちがう ところが ありそう。'}; }
  },
  partModelNext() { const q = S.q; q.model = false; q.sawModel = true; finishPart(null); },
  partModelRetry() { const q = S.q; q.model = false; q.sawModel = true; q.ink = []; q.msg = null; },
  nextPart() { S.i++; if (S.i < S.list.length) S.q = newPartQ(S.list[S.i]); else finishPartSet(); },
  moreParts() { startParts(pickWeak('parts', QUIZ_PARTS, 3)); },
  returnToKanji() { const ret = S.ret, fr = friends; S = ret; friends = fr; S.q.msg = {ok: true, text: 'ぶひんの れんしゅうから もどったよ。'}; },

  // --- かんじ団子 ---
  dTap(id) { dangoTap(id); },
  dAgain() { startDango(); },
  dWeak() { const w = S.weak || []; if (w.length) startKanji(w.slice(0, 3)); else S = {screen: 'home'}; },
};

function finishKanji(how) {
  const q = S.q, L = ASKABLE();
  P.pos[GD.grade] = (L.indexOf(q.char) + 1) % L.length;
  q.usedMode = how;
  const wasDone = doneKanji(q.char), r = rec('kanji', q.char), wasWeak = r.weak;
  if (how) mark('kanji', q.char, how, true);
  const clean = !!how && !q.hints.some(Boolean) && !q.sawModel;
  if (q.hints.some(Boolean)) r.hinted++;
  if (q.sawModel) r.model++;
  // 形の段の一発（ミスなし・ヒントなし・見本なし）
  if (how && q.shapeMiss === 0 && !q.hintIn.shape && !q.sawModel) stepFirst();
  else if (how && q.shapeMiss === 0) stepHelped();
  else if (how) stepAfterMiss();
  let learned = false;
  if (clean) {
    r.clean++; r.weak = false;
    if (how === 'pen') P.s.pen[q.char] = 1;
    if (!wasDone) { onLearned(q.char, wasWeak); learned = true; }
  }
  q.gain = {learned, clean};
  q.phase = 'done'; q.msg = null; q.hint = null;
  S.results.push({char: q.char, how, clean, learned, nameFirst: q.nameMiss === 0 && !q.hintIn.names, shapeFirst: !!how && q.shapeMiss === 0 && !q.hintIn.shape && !q.sawModel});
  checkTitles(); saveDB();
}
function finishSet() {
  S.q = null; dayLog().sets++;
  if (S.results.length >= 3 && S.results.every(r => r.clean)) P.s.cleanSets++;
  checkTitles(); saveDB(); sfx.clear();
}
function finishPart(how) {
  const q = S.q; q.usedMode = how;
  const was = donePart(q.id);
  if (how) mark('parts', q.id, how, true);
  if (q.sawModel) rec('parts', q.id).model++;
  if (how && q.shapeMiss === 0 && !q.sawModel) { stepFirst(); q.gain++; } else if (how) stepAfterMiss();
  if (!was && donePart(q.id)) { addEnaga(3); q.gain += 3; q.newDone = true; }
  q.stage = 'done'; q.msg = null;
  S.results.push({id: q.id, how, nameFirst: q.nameMiss === 0, shapeFirst: !!how && q.shapeMiss === 0 && !q.sawModel, newDone: q.newDone});
  checkTitles(); saveDB();
}
function finishPartSet() { S.q = null; checkTitles(); saveDB(); sfx.clear(); }

// ---------- 画面 ----------
const chant = ids => ids.map(id => id || '？').join('、');
const btn = (a, label, {v = '', cls = '', dis = false, aria = ''} = {}) =>
  `<button type="button" class="btn ${cls}" data-act="${a}" data-v="${esc(v)}" ${dis ? 'disabled' : ''} ${aria}>${label}</button>`;
const msgBox = m => m ? `<p class="msg ${m.ok ? 'ok' : 'ng'}" role="status">${m.text}</p>` : '<p class="msg"></p>';
const modeToggle = () => `<div class="mode" role="group" aria-label="形の出し方">
  <button type="button" data-act="mode" data-v="shape" aria-pressed="${mode() === 'shape'}">▦ えらぶ</button>
  <button type="button" data-act="mode" data-v="pen" aria-pressed="${mode() === 'pen'}">✎ ペンで書く</button></div>`;
const dots = (n, i) => `<div class="dots">${Array.from({length: n}, (_, k) => `<i class="${k < i ? 'fin' : k === i ? 'now' : ''}"></i>`).join('')}</div>`;
function hud(title, extra = '') {
  return `<div class="hud">${btn('home', '⌂ もりへ', {cls: 'small blue'})}<h1>${title}</h1>${extra}<div class="sp"></div>
    ${P ? `<div class="hb combo">一発れんぞく <b>${P.s.streakNow}</b></div><div class="hb">シマエナガ <b>${P.s.enaga.toLocaleString()}</b>羽</div>` : ''}
    ${S.screen === 'study' || S.screen === 'parts' ? btn('zukan', 'ずかん', {cls: 'small'}) : ''}</div>`;
}
function wordHtml(segs) {
  return `<span>${segs.map(([t, furi, target]) => target ? `<ruby class="blankbox">□<rt>${furi || ''}</rt></ruby>` : esc(t)).join('')}</span>`;
}
// ミチムラ式の タイトルの書式：「労ドウ の ドウ　はたら_く」
function titleHtml(t) {
  const parts = [];
  if (t.word && t.on) parts.push(`${t.word.map(([c, furi, target]) => target ? `<b class="on">${t.wr || t.on}</b>` : furi ? `<ruby>${c}<rt>${furi}</rt></ruby>` : c).join('')} の <b class="on">${t.on}</b>`);
  else if (t.on) parts.push(`<b class="on">${t.on}</b>`);
  if (t.kun) parts.push(t.kun.replace(/^([^_]+)/, '<b>$1</b>'));
  return parts.map(x => `<span class="nw">${x}</span>`).join('　');
}
const promptHtml = k => `<div class="panel prompt"><p class="ptitle">${titleHtml(k.t)}</p>${k.x.length ? `<p class="pex">${k.x.slice(0, 2).map(wordHtml).join('')}</p>` : ''}</div>`;

function render() {
  const sc = S.screen;
  document.body.className = 's-' + ({study: 'study', parts: 'parts', dcount: 'dplay', dplay: 'dplay', dresult: 'dresult'}[sc] || sc) + (sc === 'forest' ? ' t-' + S.tab : '');
  const v = sc === 'home' ? homeView() : sc === 'study' ? studyView() : sc === 'parts' ? partsView() : sc === 'zukan' ? zukanView()
    : sc === 'forest' ? forestView() : sc === 'dcount' ? dCountView() : sc === 'dplay' ? dPlayView() : dResultView();
  $ui.innerHTML = `<div class="scr">${v}</div>`;
  bindPad();
  $('#muteBtn').textContent = snd.muted ? 'おと：OFF' : 'おと：ON';
}

function homeView() {
  const names = DB.players.slice(0, 6).map(n => `<button type="button" class="chip ${n === player ? 'sel' : ''}" data-act="pick" data-v="${esc(n)}">${esc(n)}</button>`).join('');
  const who = `<div class="who"><span class="wl">なまえ</span>${names}<input id="nameIn" maxlength="10" placeholder="あたらしい なまえ" autocomplete="off">${btn('nameOk', 'けってい', {cls: 'small blue'})}</div>`;
  const grades = `<div class="grades"><span class="wl">学年</span>${[1, 2, 3, 4, 5, 6].map(g => `<button type="button" class="chip ${P && P.grade === g ? 'sel' : ''}" data-act="grade" data-v="${g}">${g}年</button>`).join('')}</div>`;
  let here = `<p class="hereline">${!player ? 'まず <b>なまえ</b> を 入れてね' : '<b>学年</b> を えらんでね'}</p>`;
  let menu = '', recs = '', meter = '';
  if (P && GD) {
    const h = hereChar(), n = gradeLearned().length, N = ASKABLE().length, locked = n < 10, s = P.s, nt = newTitles().length;
    here = `<p class="hereline">いまここ：<b>${BY[h].ss || ''}</b> の「<b class="ch">${h}</b>」から <small style="color:var(--soft)">（ずかんで えらぶと そこから）</small></p>`;
    menu = `<div class="menu">
      <button type="button" class="big primary" data-act="startKanji"><span class="em">字</span>かんじを つくる<small>3文字・きょうかしょの じゅん</small></button>
      <button type="button" class="big" data-act="startParts"><span class="em">亻</span>ぶひん れんしゅう<small>3つ・なまえ と 形</small></button>
      <button type="button" class="big ${locked ? 'locked' : ''}" data-act="dango">${locked ? `<span class="lock">あと${10 - n}字</span>` : ''}<span class="em">⏱</span>かんじ団子<small>おぼえた字で タイムアタック</small></button></div>`;
    meter = `<div class="meterline">${GD.grade}年 おぼえた <b>${n}</b> / ${N}<div class="meter"><i style="width:${(100 * n / N).toFixed(1)}%"></i></div></div>`;
    const td = s.days[today()];
    recs = `<div class="recs">
      <button type="button" class="recbtn" data-act="forest" data-v="forest"><span>エナガの もり<i>${s.enaga > s.seen ? `あたらしく +${s.enaga - s.seen}` : ''}</i></span><b>${s.enaga.toLocaleString()}羽</b></button>
      <button type="button" class="recbtn" data-act="forest" data-v="titles"><span>しょうごう<i>${nt ? `<em class="newbadge">NEW ${nt}</em>` : ''}</i></span><b>${gotCount()} / ${TITLES.length}</b></button>
      <button type="button" class="recbtn" data-act="forest" data-v="days"><span>あしあと<i>${td && td.learned.length ? `きょう ${td.learned.length}字 おぼえた` : ''}</i></span><b>${Object.keys(s.days).length}日</b></button>
      <button type="button" class="recbtn plain" data-act="zukan"><span>ずかん<i style="color:var(--soft);font-weight:normal">${GD.grade}年の 字と ぶひん</i></span><b style="color:var(--blue)">▦</b></button>
    </div><div class="meterline" style="justify-content:center">一発れんぞく <b style="color:var(--pink)">${s.streakNow}</b>（きろく ${s.streakBest}）</div>`;
  }
  return `<div class="homeL"><h1 class="logo">エナガの かんじの森</h1><p class="lead">字を おぼえると、その字を もった シマエナガが 森に あつまるよ</p>
    ${who}${grades}${here}${menu}${meter}${recs}
    <div class="row" style="margin-top:auto;justify-content:space-between">${player ? '<button type="button" class="delbtn" data-act="del">きろくを けす</button>' : '<span></span>'}
      <p class="credit">字形 KanjiVG／読み・語例 EDRDG（CC BY-SA）<a href="./data/ATTRIBUTION.txt" target="_blank">出典</a></p></div></div>
    <div class="cap">${P && GD ? `おぼえた字の シマエナガ <b>${gradeLearned().length}</b>羽 <small style="color:var(--soft)">（${GD.grade}年）</small>` : ''}</div>`;
}

function studyView() {
  if (!S.q) return studySummary();
  const q = S.q, k = K();
  let left, right;
  if (q.phase === 'done') {
    left = `<div class="panel gbox">${kanjiSvg(q.char, {anim: true})}</div>`;
    right = doneRight(q, k);
  } else if (q.model) {
    left = `<div class="panel gbox"><span class="gl">見本（書き順）</span>${kanjiSvg(q.char, {anim: true})}</div>`;
    right = `<p class="ask">見本を 見たら、もう一度 じぶんで やってみよう</p><p class="msg">見本を 見た字は「おぼえた」には ならないよ。また 出てくるから だいじょうぶ。</p>
      <div class="row">${btn('modelRetry', '見本を けして もう一度', {cls: 'primary'})}${btn('modelNext', '見本を 見たので つぎへ')}</div>`;
  } else if (q.phase === 'names') {
    left = `<div class="panel gbox"><span class="gl">この字を つくろう</span><span class="qmark">？</span></div>`;
    right = namesRight(q, k);
  } else {
    left = `<div class="panel gbox"><span class="gl">${mode() === 'pen' ? '見本なしで 書こう' : `${q.step} / ${k.u.length}`}</span>${mode() === 'pen' || q.step === 0 ? '<span class="qmark">？</span>' : buildSvg(q.char, q.step - 1)}</div>`;
    right = shapeRight(q, k);
  }
  return `${hud('かんじを つくる', dots(S.list.length, S.i))}<div class="stL">${promptHtml(k)}${left}${hintPanel(q, k)}</div><div class="stR">${right}</div>`;
}
const hintButtons = k => k.u.map((_, i) => btn('hint', `💡${no(i)}`, {v: i, cls: 'small'})).join('');
function hintPanel(q, k) {
  if (!q.hint) return '';
  const {slot, level} = q.hint, id = k.u[slot].n, paths = unitPaths(k, k.u[slot]);
  const lines = [`<p>${no(slot)}の ぶひんは「<b>${id}</b>」 ${btn('say', '🔊', {v: id, cls: 'small'})}</p>`];
  if (level === 2) lines.push(`<div class="hg">${pathsSvg(paths)}</div>`);
  if (level >= 3) lines.push(`<div class="hg">${pathsSvg(paths, {anim: true})}</div><p style="text-align:center;font-size:15px">書き順</p>`);
  const quiz = QUIZ_PARTS.includes(id) ? btn('practicePart', `「${id}」を れんしゅう`, {v: slot, cls: 'small'}) : '';
  return `<aside class="panel hintpanel">${lines.join('')}<div class="row">${level < 3 ? btn('hint', 'もっと ヒント', {v: slot, cls: 'small'}) : ''}${quiz}${btn('closeHint', 'とじる', {cls: 'small'})}</div>
    <p style="font-size:14px;color:var(--soft);margin:6px 0 0">ヒントを 使っても 子エナガが きてくれるよ</p></aside>`;
}
function namesRight(q, k) {
  const ready = q.names.every(Boolean);
  const slots = k.u.map((_, i) => `<button type="button" class="slot ${q.active === i ? 'active' : ''} ${q.wrong[i] ? 'wrong' : ''}" data-act="slot" data-v="${i}"><span class="no">${no(i)}</span>${q.names[i] || '？'}</button>`).join('');
  return `<p class="ask">ぶひんの <b>なまえ</b>を、<b>書く じゅん</b>に 唱えよう <small>${k.u.length}つ。みどりの わくに 入るよ</small></p>
    <div class="slots">${slots}</div>${msgBox(q.msg)}
    <div class="choices">${q.nameChoices.map(id => `<button type="button" class="chip" data-act="pickName" data-v="${esc(id)}">${id}</button>`).join('')}</div>
    <div class="row">${btn('checkNames', 'これで OK', {cls: 'primary', dis: !ready})}</div>
    <div class="tools" style="margin-top:auto">${hintButtons(k)}</div>`;
}
function shapeRight(q, k) {
  const ids = IDS();
  const slots = ids.map((id, i) => `<span class="slot ${i < q.step ? 'done' : i === q.step && mode() !== 'pen' ? 'now' : ''}"><span class="no">${no(i)}</span>${id}${i < q.step ? ' ✓' : ''}</span>`).join('');
  let core;
  if (mode() === 'pen') {
    core = `<div class="slots">${slots}</div><div class="row" style="align-items:flex-start;gap:16px">${pad()}<div style="display:flex;flex-direction:column;gap:10px;width:260px">
      ${msgBox(q.msg)}${btn('checkPen', '書けた！', {cls: 'primary', dis: !q.ink.length})}${btn('undo', '↶ ひとつ けす', {cls: 'small'})}${btn('clearInk', 'ぜんぶ けす', {cls: 'small'})}</div></div>`;
  } else {
    core = `<p class="ask">${no(q.step)}「<b>${ids[q.step]}</b>」の 形は どれ？</p><div class="slots">${slots}</div>${msgBox(q.msg)}
      <div class="tiles">${q.shapeChoices.map(id => { const x = q.wrongShapes.includes(id);
        return `<button type="button" class="tile ${x ? 'x' : ''}" data-act="pickShape" data-v="${esc(id)}" ${x ? 'disabled' : ''} aria-label="形の こうほ">${pathsSvg(shapeOf(id, q.char))}</button>`; }).join('')}</div>`;
  }
  return `${core}<div class="tools" style="margin-top:auto">${modeToggle()}${hintButtons(k)}${btn('model', '👀 見本', {cls: 'small'})}</div>`;
}
function doneRight(q, k) {
  const ids = IDS(), last = S.i + 1 >= S.list.length;
  const tag = q.usedMode === 'pen' ? '✎ ペンで 書けた' : q.usedMode === 'shape' ? '▦ 形を えらべた' : '👀 見本で かくにん';
  const gain = q.gain.learned ? '<span class="learned">◎ おぼえた！ この字の シマエナガが 森に きたよ</span>'
    : q.gain.clean ? '<span style="color:var(--green)">◎ ばっちり！（もう おぼえている字）</span>'
    : 'もう一回 じぶんだけで できたら「おぼえた」に なるよ';
  return `<div class="panel donebox"><p class="composed" style="font-size:28px">${chant(ids)}</p><p class="ptitle">${titleHtml(k.t)}</p>
    <p class="exline">${k.x.map(segs => segs.map(([t, , target]) => target ? `<b>${q.char}</b>` : esc(t)).join('')).join('　')}</p>
    <p class="tags"><span>${tag}</span>${q.hints.some(Boolean) ? '<span>💡ヒント</span>' : ''}${q.nameMiss + q.shapeMiss ? `<span>まちがい ${q.nameMiss + q.shapeMiss}回</span>` : '<span class="gold">ノーミス</span>'}</p>
    <div class="gain">${gain}</div>
    <div class="row">${btn('nextKanji', last ? 'けっかを 見る' : 'つぎの 字へ', {cls: 'primary'})}</div></div>`;
}
function newTitleBox() {
  if (!sessTitles || !sessTitles.length) return '';
  return `<div class="newbox"><h3>あたらしい しょうごう！ ${sessTitles.length}こ</h3><div class="tgrid">${sessTitles.slice(0, 8).map(t => `<div class="tcard got new"><b>${esc(t.name)}</b><small>${esc(t.cond)}</small></div>`).join('')}</div></div>`;
}
function studySummary() {
  const n = gradeLearned().length, N = ASKABLE().length, g = S.sess;
  const cards = S.results.map(r => `<div class="rc ${r.learned || r.clean ? 'got' : ''}"><div class="k">${r.char}</div>
    <div class="st">${r.learned ? 'おぼえた！' : r.clean ? 'ばっちり' : 'あとすこし'}</div><small>なまえ ${r.nameFirst ? '◎' : '○'}　形 ${r.shapeFirst ? '◎' : r.how ? '○' : '−'}</small></div>`).join('');
  return `${hud('かんじを つくる')}<div class="panel sum"><h2>おつかれさま！</h2><div class="res">${cards}</div>
    <div class="tags"><span class="gold">シマエナガ +${P.s.enaga - g.enaga0}羽</span><span>${GD.grade}年 おぼえた ${g.learned0} → <b style="color:var(--green)">${n}</b> / ${N}</span><span>一発れんぞく ${P.s.streakNow}</span></div>
    <div class="meterline" style="width:600px"><div class="meter"><i style="width:${(100 * n / N).toFixed(1)}%"></i></div></div>
    ${newTitleBox()}
    <div class="row" style="margin-top:auto">${btn('startKanji', 'つぎの 3文字', {cls: 'primary'})}${btn('startParts', 'ぶひん れんしゅう')}${btn('home', 'もりへ もどる', {cls: 'blue'})}</div></div>`;
}

const pname = id => GD.parts[id]?.r ? `${id}<small class="hen">（${GD.parts[id].r}）</small>` : id;
function pad() {
  return `<div class="padwrap"><svg class="pad" viewBox="0 0 109 109"><line x1="54.5" y1="2" x2="54.5" y2="107"/><line x1="2" y1="54.5" x2="107" y2="54.5"/><g class="ink"></g></svg></div>`;
}
function partsView() {
  if (!S.q) return partsSummary();
  const q = S.q, total = S.list.length * 2, at = S.i * 2 + (q.stage === 'name' ? 0 : q.stage === 'shape' ? 1 : 2);
  let body;
  if (q.stage === 'name') {
    body = `<p class="ask">この ぶひんの <b>なまえ</b>は？</p><div class="bigg">${partSvg(q.id)}</div>${msgBox(q.msg)}
      <div class="choices">${q.nameChoices.map(id => { const x = q.wrongNames.includes(id); return `<button type="button" class="chip ${x ? 'x' : ''}" data-act="answerName" data-v="${esc(id)}" ${x ? 'disabled' : ''}>${id}</button>`; }).join('')}</div>`;
  } else if (q.stage === 'shape') {
    const ask = `<p class="ask">「<b>${pname(q.id)}</b>」の 形は？ ${btn('say', '🔊', {v: q.id, cls: 'small'})}</p>`;
    let core;
    if (q.model) core = `<div class="bigg">${partSvg(q.id, {anim: true})}</div><div class="row">${btn('partModelRetry', '見本を けして もう一度', {cls: 'primary'})}${btn('partModelNext', '見本を 見たので つぎへ')}</div>`;
    else if (mode() === 'pen') core = `<div class="row" style="align-items:flex-start;gap:16px">${pad()}<div style="display:flex;flex-direction:column;gap:10px;width:240px">${msgBox(q.msg)}
      ${btn('checkPartPen', '書けた！', {cls: 'primary', dis: !q.ink.length})}${btn('undo', '↶ ひとつ けす', {cls: 'small'})}${btn('clearInk', 'ぜんぶ けす', {cls: 'small'})}</div></div>`;
    else core = `${msgBox(q.msg)}<div class="tiles">${q.shapeChoices.map(id => { const x = q.wrongShapes.includes(id); return `<button type="button" class="tile ${x ? 'x' : ''}" data-act="answerShape" data-v="${esc(id)}" ${x ? 'disabled' : ''} aria-label="形の こうほ">${partSvg(id)}</button>`; }).join('')}</div>`;
    body = `${ask}${core}<div class="tools" style="margin-top:auto">${modeToggle()}${q.model ? '' : btn('model', '👀 見本', {cls: 'small'})}</div>`;
  } else {
    const last = S.i + 1 >= S.list.length;
    const kanjiWith = GD.kanji.filter(k => k.u.some(u => u.n === q.id)).slice(0, 12).map(k => `<span>${k.c}</span>`).join('');
    body = `<div class="bigg">${partSvg(q.id, {anim: true})}</div><p class="composed" style="font-size:30px">${pname(q.id)}</p>
      <p class="tags"><span>${q.usedMode === 'pen' ? '✎ ペンで 書けた' : q.usedMode === 'shape' ? '▦ 形を えらべた' : '👀 見本で かくにん'}</span>${q.nameMiss + q.shapeMiss ? `<span>まちがい ${q.nameMiss + q.shapeMiss}回</span>` : '<span class="gold">ノーミス</span>'}${q.gain ? `<span class="gold">+${q.gain}羽</span>` : ''}</p>
      ${q.newDone ? '<div class="gain"><span class="learned">◎ この ぶひん、できた！ +3羽</span></div>' : ''}
      <p class="family">この ぶひんが 入っている ${GD.grade}年の 字：${kanjiWith || 'なし'}</p>
      <div class="row">${last && S.ret ? btn('returnToKanji', 'お題に もどる', {cls: 'primary'}) : btn('nextPart', last ? 'けっかを 見る' : 'つぎの ぶひんへ', {cls: 'primary'})}</div>`;
  }
  return `${hud('ぶひん れんしゅう', dots(total, at))}<div class="pq">${body}</div>`;
}
function partsSummary() {
  const rows = S.results.map(r => `<div class="rc ${r.newDone ? 'got' : ''}"><div style="width:90px;height:90px;margin:0 auto">${partSvg(r.id)}</div><div class="st">${r.id}</div>
    <small>形→なまえ ${r.nameFirst ? '◎' : '○'}　なまえ→形 ${r.shapeFirst ? '◎' : r.how ? '○' : '−'}</small></div>`).join('');
  return `${hud('ぶひん れんしゅう')}<div class="panel sum"><h2>3つの ぶひん、おわり！</h2><div class="res">${rows}</div>
    <div class="tags"><span class="gold">シマエナガ +${P.s.enaga - S.sess.enaga0}羽</span><span>一発れんぞく ${P.s.streakNow}</span></div>${newTitleBox()}
    <div class="row" style="margin-top:auto">${btn('moreParts', 'つぎの 3つ', {cls: 'primary'})}${btn('startKanji', 'かんじを つくる')}${btn('home', 'もりへ もどる', {cls: 'blue'})}</div></div>`;
}

function zukanView() {
  const here = hereChar();
  const badge = st => st === 'got' ? '<b class="bd hana">◎おぼえた</b>' : st === 'mid' ? '<b class="bd half">あとすこし</b>' : st === 'again' ? '<b class="bd again">もう一回</b>' : '';
  const L = GD.kanji.filter(k => GD.book || !k.z);
  const kanji = L.map((k, i) => {
    let sec = '';
    if (k.ss && (i === 0 || L[i - 1].ss !== k.ss)) {
      const done = !!P.s.secDone[GD.grade + ':' + k.ss], m = L.filter(x => x.ss === k.ss), got = m.filter(x => doneKanji(x.c)).length;
      sec = `<div class="zsec">${k.ss} <span style="color:var(--soft);font-weight:normal">${got}/${m.length}</span>${done ? '<span class="fam">🐦🐦🐦 ぜんぶ おぼえた！</span>' : ''}</div>`;
    }
    const st = kState(k.c), rd = k.t.on || (k.t.kun || '').replace('_', '');
    return `${sec}<button type="button" class="zcard ${st === 'again' ? 'mid' : st}" data-act="oneKanji" data-v="${k.c}">${k.c === here ? '<b class="bd here">いまここ</b>' : badge(st)}<span class="kc">${k.c}</span><span class="rd">${rd}</span></button>`;
  }).join('');
  const parts = QUIZ_PARTS.map(id => `<button type="button" class="zcard p ${donePart(id) ? 'got' : ''}" data-act="onePart" data-v="${esc(id)}">${donePart(id) ? '<b class="bd hana">◎</b>' : ''}${partSvg(id)}<span class="rd">${id}</span></button>`).join('');
  const n = L.filter(k => doneKanji(k.c)).length, pn = QUIZ_PARTS.filter(donePart).length;
  return `${hud('ずかん')}<div class="scrollbox" style="top:70px">
    ${S.back ? `<div class="row" style="margin-bottom:8px">${btn('back', '← とちゅうの 問題に もどる', {cls: 'primary'})}</div>` : ''}
    <h3 class="tg">${GD.grade}年の 漢字 <small style="color:var(--soft)">${GD.book || ''}の きょうかしょの じゅん・字を えらぶと そこから</small></h3>
    <div class="meterline">おぼえた <b>${n}</b> / ${L.length}<div class="meter"><i style="width:${(100 * n / L.length).toFixed(1)}%"></i></div></div>
    <div class="zgrid">${kanji}</div>
    <h3 class="tg">${GD.grade}年の ぶひん</h3>
    <div class="meterline">できた <b>${pn}</b> / ${QUIZ_PARTS.length}<div class="meter"><i style="width:${(100 * pn / QUIZ_PARTS.length).toFixed(1)}%"></i></div></div>
    <div class="zgrid p">${parts}</div></div>`;
}

// もり・しょうごう・あしあと
function forestView() {
  const tabs = [['forest', 'エナガの もり'], ['titles', 'しょうごう'], ['days', 'あしあと']].map(([t, l]) => `<button type="button" class="tab ${S.tab === t ? 'on' : ''}" data-act="tab" data-v="${t}">${l}</button>`).join('');
  let body = '';
  if (S.tab === 'titles') body = `<div class="scrollbox">${titlesHtml()}</div>`;
  else if (S.tab === 'days') body = `<div class="scrollbox">${daysHtml()}</div>`;
  return `${hud(esc(player) + ' の きろく')}<div class="tabs">${tabs}</div>${body}`;
}
let shownNewTitles = new Set();
function titlesHtml() {
  const card = (t, isNew) => { const has = P.s.titles[t.id];
    return `<div class="tcard ${has ? 'got' : ''} ${isNew ? 'new' : ''}"><b>${has ? esc(t.name) : '？？？'}</b><small>${esc(t.cond)}${has ? `（${+has.slice(5, 7)}/${+has.slice(8, 10)}）` : ''}</small></div>`; };
  let html = `<div class="thead">${esc(player)} の しょうごう　<b>${gotCount()}</b> / ${TITLES.length}</div>`;
  if (shownNewTitles.size) html += `<div class="newbox"><h3>あたらしく とった しょうごう！ ${shownNewTitles.size}こ</h3><div class="tgrid">${TITLES.filter(t => shownNewTitles.has(t.id)).map(t => card(t, true)).join('')}</div></div>`;
  let grp = null;
  for (const t of TITLES) {
    if (t.grp !== grp) { if (grp) html += '</div>'; grp = t.grp; html += `<h3 class="tg">${grp}</h3><div class="tgrid">`; }
    html += card(t, shownNewTitles.has(t.id));
  }
  return html + '</div>';
}
function daysHtml() {
  const s = P.s, ds = Object.keys(s.days).sort().reverse(), c = titleCtx();
  const W = '日月火水木金土';
  const head = `<div class="sumline"><span class="hb">あそんだ日 <b>${ds.length}</b>日</span><span class="hb">つづけて <b>${c.dayStreak}</b>日（さいこう）</span>
    <span class="hb">おぼえた字 <b>${c.learned}</b>字</span><span class="hb">一発れんぞく きろく <b>${s.streakBest}</b></span><span class="hb">かんじ団子 <b>${s.dClears}</b>回</span></div>`;
  if (!ds.length) return head + '<p class="thead">まだ あしあとは ないよ。字を つくると ここに のこるよ。</p>';
  const T = Object.fromEntries(TITLES.map(t => [t.id, t.name]));
  return head + `<div class="days">${ds.map(d => { const L = s.days[d], dt = new Date(d + 'T00:00');
    return `<div class="day"><div class="dt">${dt.getMonth() + 1}月${dt.getDate()}日（${W[dt.getDay()]}）<small>シマエナガ +${L.enaga}羽${L.dango ? `・団子 ${L.dango}回` : ''}</small></div>
      <div><div class="ks">${L.learned.length ? L.learned.join('') : '<span class="meta">（れんしゅう した日）</span>'}</div>
      ${L.learned.length ? `<div class="meta">おぼえた字 <b>${L.learned.length}</b>字</div>` : ''}
      ${L.titles.length ? `<div class="meta">しょうごう：<b>${L.titles.map(id => esc(T[id] || id)).join('、')}</b></div>` : ''}</div></div>`; }).join('')}</div>`;
}
function onTab(t) {
  if (t === 'forest') startForestAnim();
  if (t === 'titles') {
    shownNewTitles = new Set(newTitles().map(x => x.id));
    if (shownNewTitles.size) sfx.title();
    for (const id in P.s.titles) P.s.tSeen[id] = 1; saveDB();
  }
}

// ---------- かんじ団子（タイムアタック） ----------
const DSTEPS = 10, TH = [25, 30, 36, 43, 52, 63, 78, 100];  // 秒。SSS/SS/S/AA/A/B/C/D（仮）。それより遅いと E
const RANKS = ['SSS', 'SS', 'S', 'AA', 'A', 'B', 'C', 'D'];
const RANK_COL = {SSS: '#e0455c', SS: '#d99a10', S: '#f07a96', AA: '#2f6fc0', A: '#4a90d9', B: '#58b37a', C: '#7fae5a', D: '#9a8fb8', E: '#a7a2b5'};
const rankOf = ms => { const s = ms / 1000; for (let i = 0; i < RANKS.length; i++) if (s <= TH[i]) return RANKS[i]; return 'E'; };
const sec = ms => (ms / 1000).toFixed(1);
let D = null, dTimer = null;
function startDango() {
  const L = gradeLearned().map(k => k.c), dl = P.s.dLast;
  const list = shuffle(L).sort((a, b) => (dl[a] || 0) - (dl[b] || 0) + (Math.random() - .5) * 2).slice(0, DSTEPS);
  const recd = P.s.dango[GD.grade] || {};
  D = {list, i: 0, q: null, times: [], qMiss: [], miss: 0, combo: 0, maxCombo: 0, t0: 0, qt: 0, ghost: recd.ghost || null, best: recd.best || null, enaga0: P.s.enaga, done: false, qDur: []};
  resetFriends(); sessTitles = [];
  S = {screen: 'dcount', n: 3}; ac(); render(); sfx.count(3);
  let n = 3;
  clearInterval(dTimer);
  dTimer = setInterval(() => {
    n--;
    if (n > 0) { S.n = n; sfx.count(n); render(); return; }
    clearInterval(dTimer); dTimer = null; sfx.go();
    D.t0 = performance.now(); D.qt = D.t0; D.q = dQ(D.list[0]); S = {screen: 'dplay'}; render();
    bgmStart(() => D ? D.combo : 0);
  }, 700);
}
function stopDango() { clearInterval(dTimer); dTimer = null; bgmStop(); }
function dQ(ch) { const ids = BY[ch].u.map(u => u.n), kinds = new Set(ids).size; return {char: ch, step: 0, wrong: [], choices: BY[ch].nd ? [...new Set(ids)] : fillChoices(ids, Math.max(12, kinds + 4), QUIZ_PARTS.concat(Object.keys(GD.parts)))}; }
function dangoTap(id) {
  if (S.screen !== 'dplay' || !D || D.done) return;
  const q = D.q, ids = BY[q.char].u.map(u => u.n), now = performance.now();
  if (id === ids[q.step]) {
    q.step++; sfx.chirp(D.combo); setMood('happy', 300);
    if (q.step === ids.length) {
      const qm = D.qMiss[D.i] || 0; D.times.push(now - D.t0); D.qMiss[D.i] = qm; P.s.dLast[q.char] = Date.now();
      if (!qm) { D.combo++; D.maxCombo = Math.max(D.maxCombo, D.combo); const s = P.s; s.streakNow++; if (s.streakNow > s.streakBest) s.streakBest = s.streakNow; addEnaga(1); addFriend(false); }
      D.qDur.push(now - D.qt); D.qt = now;
      D.i++;
      if (D.i >= D.list.length) return finishDango(now);
      D.q = dQ(D.list[D.i]);
    }
  } else if (!q.wrong.includes(id)) {
    q.wrong.push(id); D.miss++; D.qMiss[D.i] = (D.qMiss[D.i] || 0) + 1; D.combo = 0; P.s.streakNow = 0;
    scatter(); setMood('oops', 700, 'おしい！'); sfx.oops();
  }
}
function finishDango(now) {
  D.done = true; bgmStop(); const ms = now - D.t0, s = P.s, g = GD.grade, rk = rankOf(ms);
  const recd = s.dango[g] ||= {best: null, ghost: null, plays: 0};
  const first = recd.best == null, better = first || ms < recd.best;
  if (better) { if (!first) s.bestUp++; recd.best = ms; recd.ghost = D.times.slice(); }
  recd.plays++; s.dClears++; if (!D.miss) s.dNoMiss++;
  if (RO[rk] > s.rank) s.rank = RO[rk];
  addEnaga(10); if (!D.miss) addEnaga(10);
  dayLog().dango++; dayLog().play++;
  // まちがえた字・時間が かかった字（15秒より長い）は「もう一回」に もどす（おぼえた を はずす）
  const weak = D.list.filter((c, i) => (D.qMiss[i] || 0) > 0 || (D.qDur[i] || 0) > 15000);
  for (const c of weak) { const r = rec('kanji', c); r.weak = true; }
  S = {screen: 'dresult', ms, rk, first, better, prev: first ? null : (better ? null : recd.best), oldBest: D.best, weak, gain: P.s.enaga - D.enaga0};
  checkTitles(true); saveDB(); render();
  const wait = better && !first ? sfx.record() : sfx.clear();
  if (sessTitles.length) setTimeout(() => { sfx.title(); }, (wait || 0) * 1000 + 200);
  burstAt(640, 40, 60);
}
function dCountView() { return `<div id="count">${S.n}</div>`; }
function dPlayView() {
  const q = D.q, k = BY[q.char], ids = k.u.map(u => u.n);
  return `<div class="hud"><div class="hb">かんじ団子 ${GD.grade}年</div><div class="hb"><b>${D.i + 1}</b> / ${DSTEPS}</div><div class="hb"><b id="dTime">0.0</b> 秒</div>
    <div class="hb">ミス <b>${D.miss}</b></div><div class="hb combo">れんぞく <b>${D.combo}</b></div><div class="sp"></div>${btn('home', 'やめる', {cls: 'small'})}</div>
    <div class="dplay"><div class="dq">${promptHtml(k)}<div class="gbox">${q.step ? buildSvg(q.char, q.step - 1) : '<span class="qmark">？</span>'}</div>
      <div class="slots" style="max-width:260px">${ids.map((_, i) => `<span class="slot ${i < q.step ? 'done' : i === q.step ? 'now' : ''}" style="min-width:56px">${no(i)}${i < q.step ? '✓' : ''}</span>`).join('')}</div></div>
      <div class="tiles">${q.choices.map(id => { const x = q.wrong.includes(id); return `<button type="button" class="tile ${x ? 'x' : ''}" data-act="dTap" data-v="${esc(id)}" ${x ? 'disabled' : ''}>${pathsSvg(shapeOf(id, q.char))}</button>`; }).join('')}</div>
      <p class="msg" style="color:var(--soft)">ぶひんを 書く じゅんに タップ</p></div>`;
}
function dResultView() {
  const r = S, nr = (() => { const i = RANKS.indexOf(r.rk); if (i === 0) return null; const j = i < 0 ? RANKS.length - 1 : i - 1; return {rank: RANKS[j], sec: TH[j]}; })();
  const best = P.s.dango[GD.grade].best;
  const diff = r.first ? 'はじめての きろく！ つぎは この じぶんと きょうそう' : r.better ? `ベスト こうしん！ ${sec(r.oldBest - r.ms)}秒 はやくなった` : `ベストまで あと ${sec(r.ms - best)}秒`;
  return `<div class="panel dres"><div class="row" style="gap:20px"><div class="rank" style="color:${RANK_COL[r.rk]}">${r.rk}</div><div class="rtitle">${RANK_TITLE[r.rk]}</div></div>
    <div class="rtime">タイム <b>${sec(r.ms)}</b> 秒</div><div class="rnew">${diff}</div>
    <div class="rnext">${nr ? `つぎの ${nr.rank}（${nr.sec}秒）まで あと ${Math.max(0, r.ms / 1000 - nr.sec).toFixed(1)}秒` : 'さいこうランク！'}</div>
    <div class="tags" style="margin-top:6px"><span>1問 ${sec(r.ms / DSTEPS)}秒</span><span class="${D.maxCombo === DSTEPS ? 'gold' : ''}">れんぞく ${D.maxCombo}</span><span class="${D.miss ? '' : 'gold'}">ミス ${D.miss}</span></div>
    ${r.weak.length ? `<div class="again">もう一回 つくって みよう：${r.weak.map(c => `<b>${c}</b>`).join('')}<br><small style="color:var(--soft)">（「あとすこし」に もどったよ。また じぶんで つくれたら「おぼえた」に なるよ）</small></div>` : '<div class="again">ぜんぶ ばっちり！</div>'}
    <div class="gainline">シマエナガ <em>+${r.gain}羽</em>${sessTitles.length ? `　あたらしい しょうごう <em>${sessTitles.slice(0, 3).map(t => '「' + esc(t.name) + '」').join('')}${sessTitles.length > 3 ? ` ほか ${sessTitles.length - 3}こ` : ''}</em>` : ''}</div>
    <div class="row" style="margin-top:10px">${btn('dAgain', 'もう一回', {cls: 'primary'})}${r.weak.length ? btn('dWeak', 'もう一回の 字を つくる', {cls: 'blue'}) : ''}${btn('home', 'もりへ もどる')}</div>
    <div class="keys"><kbd>Enter</kbd> もう一回　<kbd>Esc</kbd> もりへ</div></div>`;
}

// ---------- Canvas（背景・森・団子の枝・ゴースト） ----------
const SIZES = {bg: [1280, 720], homeCv: [630, 640], forestCv: [1240, 560], track: [1280, 96], dango: [1280, 120]};
const cv = {}, cx = {};
for (const n in SIZES) { cv[n] = document.getElementById(n); cx[n] = cv[n].getContext('2d'); }
function resize() {
  const k = Math.min(window.innerWidth / 1280, window.innerHeight / 720) * .98;
  document.documentElement.style.setProperty('--k', k);
  const dpr = Math.min((window.devicePixelRatio || 1) * k, 3);
  for (const n in SIZES) { const [w, h] = SIZES[n]; cv[n].width = Math.round(w * dpr); cv[n].height = Math.round(h * dpr); cx[n].setTransform(dpr, 0, 0, dpr, 0, 0); }
}
window.addEventListener('resize', resize);

// 団子の枝：左に「きみ」、右へ なかまが ならぶ
let friends = [], leaving = [], sparks = [], bannerMsg = null;
const me = {mood: 'normal', until: 0, bounce: -1e9, say: null};
function setMood(m, ms, sayText = null) { const now = performance.now(); me.mood = m; me.until = now + ms; me.say = sayText ? {text: sayText, t: now} : null; if (m === 'happy') me.bounce = now; }
function resetFriends() { friends = []; leaving = []; }
function addFriend(chick) { friends.push({t: performance.now(), ph: Math.random() * 6, chick, sy: -30 - Math.random() * 30}); if (friends.length > 26) friends.shift(); }
function scatter() { const now = performance.now(); for (const f of friends) if (f.x != null) leaving.push({x: f.x, y: f.y, vx: 60 + Math.random() * 160, vy: -160 - Math.random() * 100, t: now, r: f.r}); friends = []; }
function banner(text) { bannerMsg = {text, t: performance.now()}; }
function burstAt(x, y, n) { burst(sparks, performance.now(), x, y, n); }
function drawDangoBranch(now, dt) {
  const c = cx.dango, w = 1280, h = 120, by = 96; c.clearRect(0, 0, w, h);
  snowyBranch(c, 20, w - 20, by, 12);
  c.strokeStyle = '#8b6a52'; c.lineWidth = 6; c.beginPath(); c.moveTo(w * .93, by + 4); c.lineTo(w * .97, by + 22); c.stroke();
  c.fillStyle = '#e0455c'; for (const [bx, byy] of [[w * .97, by + 22], [w * .962, by + 15]]) { c.beginPath(); c.arc(bx, byy, 5, 0, Math.PI * 2); c.fill(); }
  const kx = 110, kr = 36;
  let x = kx + kr + 30;
  friends.forEach((f, i) => {
    const r = f.chick ? 15 : 22, tx = x + r, ty = by - r * 1.12 - Math.abs(Math.sin(now / 380 + f.ph)) * 1.5; x += r * 2 + 8;
    const p = Math.max(0, Math.min(1, (now - f.t) / 420)); let fx, fy, flap = 0;
    if (p < 1) { const e = 1 - Math.pow(1 - p, 3), sx = w + 40; fx = sx + (tx - sx) * e; fy = f.sy + (ty - f.sy) * e - Math.sin(Math.PI * p) * 40; flap = (Math.sin(now / 35) + 1) / 2; }
    else { fx = tx; fy = ty; }
    f.x = fx; f.y = fy; f.r = r;
    const cheer = p >= 1 && me.mood === 'happy' && now - me.bounce < 300;
    drawEnaga(c, fx, fy, r, {blink: blinkNow(now, i + f.ph), flap, mood: cheer ? 'happy' : 'normal', squash: 1 - .02 * Math.sin(now / 300 + i)});
  });
  if (me.mood !== 'normal' && now > me.until) me.mood = 'normal';
  const bt = (now - me.bounce) / 260, bounce = bt >= 0 && bt < 1 ? Math.sin(Math.PI * bt) : 0;
  const think = me.mood === 'normal' ? Math.sin(now / 900) * .08 : 0;
  drawEnaga(c, kx, by - kr * 1.12 - bounce * kr * .35, kr, {mood: me.mood, blink: blinkNow(now, 7), flap: bounce, tilt: think, squash: bounce ? 1 - bounce * .06 : 1 + .012 * Math.sin(now / 420)});
  c.textAlign = 'center'; c.textBaseline = 'middle';
  if (me.say && now - me.say.t < 900) {
    c.font = 'bold 22px "BIZ UDPGothic",Meiryo,sans-serif'; c.lineWidth = 6; c.strokeStyle = '#fff';
    c.strokeText(me.say.text, kx + 70, 18); c.fillStyle = '#d0506a'; c.fillText(me.say.text, kx + 70, 18);
  }
  c.font = '14px "BIZ UDPGothic",Meiryo,sans-serif'; c.fillStyle = '#6c7f95'; c.fillText('きみ', kx, by + 14);
  leaving = leaving.filter(f => { const a = (now - f.t) / 900; if (a >= 1) return false; f.x += f.vx * dt / 1000; f.y += f.vy * dt / 1000; f.vy -= 60 * dt / 1000;
    drawEnaga(c, f.x, f.y, f.r, {alpha: 1 - a, flap: (Math.sin(now / 35) + 1) / 2, mood: 'oops'}); return true; });
  if (bannerMsg && now - bannerMsg.t < 1600) {
    const a = Math.min(1, (1600 - (now - bannerMsg.t)) / 300); c.globalAlpha = a;
    c.font = 'bold 28px "BIZ UDPGothic",Meiryo,sans-serif'; c.lineWidth = 7; c.strokeStyle = '#fff'; c.strokeText(bannerMsg.text, w / 2, 20);
    c.fillStyle = '#f07a96'; c.fillText(bannerMsg.text, w / 2, 20); c.globalAlpha = 1;
  } else if (!friends.length && S.screen === 'study') {
    c.font = '17px "BIZ UDPGothic",Meiryo,sans-serif'; c.fillStyle = '#a9b8c8'; c.fillText('一発で 正かいすると なかまが とまりに くるよ', w / 2, 20);
  }
}

// ホームの森：おぼえた字を おなかに持った シマエナガが 枝に ならぶ（あたらしい字は 飛んでくる）
let homeAnim = null;
function startHomeAnim() {
  if (!P || !GD) { homeAnim = {birds: [], arrive: []}; return; }
  const g = GD.grade, set = new Set(GD.kanji.map(k => k.c));
  const list = P.s.order.filter(c => set.has(c) && doneKanji(c));
  const seen = new Set(P.s.homeSeen[g] || []);
  const now = performance.now(), MAX = 48;
  const shown = list.length > MAX ? list.slice(-(MAX - 1)) : list;
  let d = 0;
  const birds = shown.map(c => ({c, t: seen.has(c) ? now - 5000 : now + 500 + (d++) * 260, ph: Math.random() * 6, new: !seen.has(c)}));
  homeAnim = {birds, more: list.length - shown.length, chirped: new Set()};
  P.s.homeSeen[g] = list; saveDB();
}
function drawHome(now, dt) {
  const c = cx.homeCv, w = 630, h = 640; c.clearRect(0, 0, w, h);
  if (!homeAnim) return;
  const rows = 6, perRow = 8, r = 26, sp = 66, top = 76, gap = 94;
  for (let i = 0; i < rows; i++) { const y = top + i * gap; snowyBranch(c, i % 2 ? 50 : 10, i % 2 ? w - 10 : w - 50, y, 9); }
  const B = homeAnim.birds;
  if (!B.length) {
    drawEnaga(c, w / 2, top + 2 * gap - r * 1.8 * 1.12 + 6, r * 1.8, {blink: blinkNow(now, 3), tilt: Math.sin(now / 900) * .08});
    c.textAlign = 'center'; c.fillStyle = '#3b5f86'; c.font = '20px "BIZ UDPGothic",Meiryo,sans-serif';
    c.fillText(P && GD ? '字を おぼえると、その字を もった' : 'なまえと 学年を えらんでね', w / 2, top + 3 * gap + 10);
    if (P && GD) c.fillText('なかまが ここに あつまってくるよ', w / 2, top + 3 * gap + 38);
    return;
  }
  B.forEach((b, i) => {
    const row = Math.floor(i / perRow), col = i % perRow, y = top + row * gap - 3;
    const x = (row % 2 ? 80 : 40) + sp * .5 + col * sp, ty = y - r * 1.12;
    const p = Math.max(0, Math.min(1, (now - b.t) / 600));
    if (now < b.t) return;
    if (b.new && !homeAnim.chirped.has(i)) { homeAnim.chirped.add(i); sfx.chirp(i % 12); burst(sparks, now, x, ty, 10); }
    let fx = x, fy = ty, flap = 0;
    if (p < 1) { const e = 1 - Math.pow(1 - p, 3), sx = w + 30, sy = -40; fx = sx + (x - sx) * e; fy = sy + (ty - sy) * e - Math.sin(Math.PI * p) * 60; flap = (Math.sin(now / 35) + 1) / 2; }
    drawEnaga(c, fx, fy - Math.abs(Math.sin(now / 420 + b.ph)) * 1.2, r, {label: b.c, flap, blink: blinkNow(now, i + b.ph), mood: p < 1 || now - b.t < 1200 && b.new ? 'happy' : 'normal'});
  });
  if (homeAnim.more > 0) { c.textAlign = 'center'; c.fillStyle = '#6c7f95'; c.font = '17px "BIZ UDPGothic",Meiryo,sans-serif'; c.fillText(`ほかにも ${homeAnim.more}羽 いるよ`, w / 2, h - 20); }
  sparksHome = drawSparks(c, sparksHome.concat(sparks.splice(0)), now, dt);
}
let sparksHome = [];

// エナガの もり（くらいごとに 大きな シマエナガ）。けいさん団子と同じ見せ方
const PL = [{r: 25, acc: null, label: '1羽'}, {r: 33, acc: 'scarf', label: '10羽ぶん'}, {r: 41, acc: 'crown', label: '100羽ぶん'}, {r: 50, acc: 'king', label: '1000羽ぶん'}, {r: 60, acc: 'legend', label: '10000羽ぶん'}];
let fA = null, fSparks = [], fLeave = [], fMsg = null;
const digitsOf = n => [0, 1, 2, 3, 4].map(p => p < 4 ? Math.floor(n / 10 ** p) % 10 : Math.floor(n / 10000));
const slotOf9 = i => i < 4 ? {row: 0, j: i, n: 4} : i < 7 ? {row: 1, j: i - 4, n: 3} : {row: 2, j: i - 7, n: 2};
function forestCols(n, W) {
  const dg = digitsOf(n); let top = 0; for (let p = 4; p >= 0; p--) if (dg[p] > 0) { top = p; break; }
  const ps = []; for (let p = top; p >= 0; p--) ps.push(p);
  const ws = ps.map(p => PL[p].r * 7.8 + 40), sum = ws.reduce((a, b) => a + b, 0), k = Math.min(1, (W - 40) / sum);
  let x = (W - sum * k) / 2; const cols = {};
  ps.forEach((p, i) => { cols[p] = {x: x + ws[i] * k / 2, r: PL[p].r * k}; x += ws[i] * k; });
  return {cols, dg};
}
const birdPos = (col, i, feetY) => { const s = slotOf9(i); return {x: col.x + (s.j - (s.n - 1) / 2) * col.r * 1.95, y: feetY - col.r * 1.12 - s.row * col.r * 1.7}; };
function startForestAnim() {
  const s = P.s, now = performance.now();
  fA = {from: s.seen, to: s.enaga, t0: now + 500, dur: Math.min(4000, Math.max(700, (s.enaga - s.seen) * 35)), prev: s.seen, born: PL.map(() => []), tick: 0};
  fSparks = []; fLeave = []; fMsg = null; s.seen = s.enaga; saveDB();
}
function drawForest(now, dt) {
  const c = cx.forestCv, w = 1240, h = 560; c.clearRect(0, 0, w, h);
  if (!fA) return;
  const pr = Math.max(0, Math.min(1, (now - fA.t0) / fA.dur)), e = 1 - Math.pow(1 - pr, 3);
  const n = Math.floor(fA.from + (fA.to - fA.from) * e), L = forestCols(n, w), feetY = h - 70;
  if (n !== fA.prev) {
    const a = digitsOf(fA.prev), b = L.dg, Pc = forestCols(fA.prev, w); let big = false;
    for (let p = 0; p < 5; p++) {
      if (b[p] > a[p]) {
        for (let i = a[p]; i < Math.min(9, b[p]); i++) fA.born[p][i] = now;
        if (p >= 1) { big = true; const col = L.cols[p]; if (col) burst(fSparks, now, col.x, feetY - col.r * 2, 50); fMsg = {text: `${PL[p].label}の シマエナガが きた！`, t: now}; }
      } else if (b[p] < a[p] && Pc.cols[p]) {
        const col = Pc.cols[p], dst = L.cols[p + 1] || col;
        for (let i = b[p]; i < Math.min(9, a[p]); i++) { const q = birdPos(col, i, feetY); fLeave.push({x: q.x, y: q.y, tx: dst.x, ty: feetY - dst.r * 1.2, r: col.r, acc: PL[p].acc, t: now}); }
      }
    }
    if (big) sfx.dango(); else if (now - fA.tick > 45) { sfx.tick(); fA.tick = now; }
    fA.prev = n;
  }
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '22px "BIZ UDPGothic",Meiryo,sans-serif'; c.fillStyle = '#6c7f95'; c.fillText(`${player} が あつめた シマエナガ`, w / 2, 20);
  c.font = 'bold 56px "BIZ UDGothic",Meiryo,monospace'; c.fillStyle = '#3b5f86'; c.fillText(n.toLocaleString() + ' 羽', w / 2, 66);
  snowyBranch(c, 20, w - 20, feetY + 4, 10);
  for (const p of Object.keys(L.cols).map(Number)) {
    const col = L.cols[p];
    c.font = '19px "BIZ UDPGothic",Meiryo,sans-serif'; c.fillStyle = '#6c7f95'; c.fillText(PL[p].label, col.x, 118);
    c.font = 'bold 30px "BIZ UDGothic",Meiryo,monospace'; c.fillStyle = '#3b5f86'; c.fillText('×' + L.dg[p], col.x, 152);
    for (let i = 0; i < Math.min(9, L.dg[p]); i++) {
      const q = birdPos(col, i, feetY), born = fA.born[p][i], k = born ? Math.min(1, (now - born) / 320) : 1;
      const pop = k < 1 ? Math.max(.2, k) * (1 + .7 * Math.sin(Math.PI * k) * (1 - k)) : 1;
      drawEnaga(c, q.x, q.y - (1 - k) * 30, col.r * pop, {acc: PL[p].acc, t: now, blink: blinkNow(now, p * 10 + i), mood: k < 1 || now - (born || -1e9) < 700 ? 'happy' : 'normal', squash: 1 + .015 * Math.sin(now / 400 + i + p)});
    }
  }
  fLeave = fLeave.filter(f => { const a = (now - f.t) / 650; if (a >= 1) return false;
    const x = f.x + (f.tx - f.x) * a, y = f.y + (f.ty - f.y) * a - Math.sin(Math.PI * a) * 70;
    drawEnaga(c, x, y, f.r * (1 - a * .5), {acc: f.acc, alpha: 1 - a * .8, flap: (Math.sin(now / 35) + 1) / 2, mood: 'happy'}); return true; });
  fSparks = drawSparks(c, fSparks, now, dt);
  if (fMsg && now - fMsg.t < 1800) {
    const a = Math.min(1, (1800 - (now - fMsg.t)) / 300); c.globalAlpha = a;
    c.font = 'bold 34px "BIZ UDPGothic",Meiryo,sans-serif'; c.lineWidth = 8; c.strokeStyle = '#fff'; c.strokeText(fMsg.text, w / 2, 200);
    c.fillStyle = '#f07a96'; c.fillText(fMsg.text, w / 2, 200); c.globalAlpha = 1;
  }
  c.font = '16px "BIZ UDPGothic",Meiryo,sans-serif'; c.fillStyle = '#6c7f95';
  c.fillText('一発で 正かい 1羽 ・ 字を おぼえた +10羽 ・ きょうかしょの 回を ぜんぶ +30羽 ・ かんじ団子 クリア +10羽　　10羽で 大きな シマエナガ 1羽に なるよ', w / 2, h - 22);
}

// かんじ団子の ゴースト（上の枝）
const hopP = {from: 0, to: 0, t: 0}, hopG = {from: 0, to: 0, t: 0};
const hopPos = (hp, now) => hp.from + (hp.to - hp.from) * Math.min(1, (now - hp.t) / 200);
const hopLift = (hp, now) => { const k = (now - hp.t) / 200; return k >= 0 && k < 1 ? Math.sin(Math.PI * k) : 0; };
function setHop(hp, to, now) { if (hp.to === to) return; hp.from = hopPos(hp, now); hp.to = to; hp.t = now; }
function drawTrack(now) {
  const c = cx.track, w = 1280, h = 96; c.clearRect(0, 0, w, h);
  if (!D) return;
  const x0 = 110, x1 = w - 70, sp = (x1 - x0) / DSTEPS, r = 15, rows = [{y: 40, name: 'きみ'}, {y: 86, name: 'ベスト'}];
  c.font = '16px "BIZ UDPGothic",Meiryo,sans-serif'; c.textBaseline = 'middle';
  rows.forEach((rw, i) => {
    c.lineCap = 'round'; c.strokeStyle = '#8b6a52'; c.lineWidth = 5; c.beginPath(); c.moveTo(x0 - r, rw.y); c.lineTo(x1 + r, rw.y); c.stroke();
    c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x0 - r, rw.y - 2.5); c.lineTo(x1 + r, rw.y - 2.5); c.stroke();
    c.fillStyle = '#8b6a52'; for (let k = 1; k <= DSTEPS; k++) c.fillRect(x0 + k * sp - 1, rw.y, 2, 6);
    c.fillStyle = i ? '#8aa0b8' : '#3b5f86'; c.textAlign = 'right'; c.fillText(rw.name, x0 - r - 12, rw.y - 8);
  });
  const fx = x1 + 12; c.strokeStyle = '#8b6a52'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(fx, rows[0].y - 36); c.lineTo(fx, rows[0].y); c.stroke();
  c.fillStyle = '#f07a96'; c.beginPath(); c.moveTo(fx, rows[0].y - 36); c.lineTo(fx + 22, rows[0].y - 30); c.lineTo(fx, rows[0].y - 24); c.closePath(); c.fill();
  const el = S.screen === 'dplay' && !D.done ? now - D.t0 : (D.times.at(-1) || 0);
  if (D.ghost) { const gi = D.ghost.filter(t => t <= el).length; setHop(hopG, gi, now); drawEnaga(c, x0 + hopPos(hopG, now) * sp, rows[1].y - r * 1.1 - hopLift(hopG, now) * r, r, {alpha: .4}); }
  else { c.fillStyle = '#a9b8c8'; c.textAlign = 'left'; c.fillText('はじめての きろくが ゴーストに なるよ', x0 + 30, rows[1].y - 12); }
  setHop(hopP, D.i, now);
  drawEnaga(c, x0 + hopPos(hopP, now) * sp, rows[0].y - r * 1.1 - hopLift(hopP, now) * r * 1.2, r, {blink: blinkNow(now, 0), flap: hopLift(hopP, now), mood: me.mood});
}

let lastT = performance.now();
function frame(now) {
  const dt = Math.min(50, now - lastT); lastT = now;
  drawBg(cx.bg, 1280, 720, now, dt);
  const sc = S.screen;
  if (sc === 'home') drawHome(now, dt);
  if (sc === 'study' || sc === 'parts' || sc === 'dplay' || sc === 'dresult' || sc === 'dcount') {
    drawDangoBranch(now, dt);
    sparks = drawSparks(cx.dango, sparks, now, dt);
  }
  if (sc === 'forest' && S.tab === 'forest') drawForest(now, dt);
  if (sc === 'dplay' || sc === 'dcount' || sc === 'dresult') drawTrack(now);
  if (sc === 'dplay' && D && !D.done) { const el = $('#dTime'); if (el) el.textContent = sec(now - D.t0); }
  requestAnimationFrame(frame);
}

// ---------- ペン入力 ----------
function bindPad() {
  const svg = $ui.querySelector('.pad'); if (!svg) return;
  const g = svg.querySelector('.ink');
  const line = s => `<polyline points="${s.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ')}"/>`;
  g.innerHTML = S.q.ink.map(line).join('');
  let cur = null, el = null;
  const toLocal = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 109, (e.clientY - r.top) / r.height * 109]; };
  const stop = e => e.preventDefault();
  for (const t of ['touchstart', 'touchmove', 'touchend']) svg.parentElement.addEventListener(t, stop, {passive: false});
  svg.addEventListener('pointerdown', e => { e.preventDefault(); svg.setPointerCapture(e.pointerId); cur = [toLocal(e)]; el = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); g.appendChild(el); });
  svg.addEventListener('pointermove', e => { if (!cur) return; const p = toLocal(e), last = cur.at(-1); if (Math.hypot(p[0] - last[0], p[1] - last[1]) < .8) return; cur.push(p); el.setAttribute('points', cur.map(q => q.join(',')).join(' ')); });
  const end = () => { if (!cur) return; if (cur.length === 1) cur.push([cur[0][0] + .5, cur[0][1] + .5]); S.q.ink.push(cur); S.q.msg = null; cur = null; render(); };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
}

// ---------- きろくを けす（なまえごと・4だんかい） ----------
function modal(title, body, buttons) {
  $('#mTitle').textContent = title; $('#mBody').innerHTML = body;
  const box = $('#mBtns'); box.textContent = '';
  for (const [label, cls, fn] of buttons) { const b = document.createElement('button'); b.className = 'btn ' + cls; b.textContent = label; b.addEventListener('click', fn); box.appendChild(b); }
  $('#modal').classList.add('on');
  box.querySelector('.safe')?.focus();
}
const closeModal = () => $('#modal').classList.remove('on');
function openDelete() {
  const pick = name => {
    const p = playerData(name), n = Object.keys(p.kanji).filter(c => p.kanji[c].clean > 0 && !p.kanji[c].weak).length;
    modal(`「${name}」の きろくを けす`, `けすと、なくなるもの：<br>おぼえた字 <b>${n}</b>字・シマエナガ <b>${p.s.enaga.toLocaleString()}</b>羽・しょうごう <b>${Object.keys(p.s.titles).length}</b>こ・あしあと <b>${Object.keys(p.s.days).length}</b>日ぶん`,
      [['やめる', 'blue safe', closeModal], ['つぎへ', 'danger', () => modal('ほんとうに けしますか？', '<span class="warn">けした きろくは もとに もどせません。</span><br>おうちの人と いっしょに たしかめてね。',
        [['やめる', 'blue safe', closeModal], ['わかった、つぎへ', 'danger', () => {
          modal('さいごの かくにん', `けすときは、下に なまえ「${esc(name)}」を 入れてね。<br><input id="delIn" autocomplete="off">`, [['やめる', 'blue safe', closeModal], ['けす', 'danger', () => {
            if (($('#delIn').value || '').trim() !== name) { toast('なまえが ちがうよ'); return; }
            delete DB.P[name]; DB.players = DB.players.filter(x => x !== name); if (DB.last === name) DB.last = DB.players[0] || null;
            player = DB.last; P = player ? playerData(player) : null; saveDB(); closeModal(); S = {screen: 'home'};
            (P && P.grade ? loadGrade(P.grade) : Promise.resolve(GD = null)).then(() => { render(); startHomeAnim(); });
          }]]);
        }]])]]);
  };
  modal('どの なまえの きろくを けす？', DB.players.map(n => `<button type="button" class="chip" data-del="${esc(n)}">${esc(n)}</button>`).join(' '), [['やめる', 'blue safe', closeModal]]);
  $('#mBody').querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => pick(b.dataset.del)));
}

// ---------- 起動 ----------
$ui.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  ac();
  const before = S.screen;
  await act[b.dataset.act](b.dataset.v);
  if (S.screen === 'dcount') return;
  render();
  if (S.screen === 'home' && (before !== 'home' || ['pick', 'nameOk', 'grade'].includes(b.dataset.act))) startHomeAnim();
});
$ui.addEventListener('keydown', async e => { if (e.target.id === 'nameIn' && e.key === 'Enter') { await act.nameOk(); render(); startHomeAnim(); } });
document.addEventListener('keydown', async e => {
  if ($('#modal').classList.contains('on')) { if (e.key === 'Escape') closeModal(); return; }
  if (S.screen === 'dresult') {
    if (e.key === 'Enter') { e.preventDefault(); act.dAgain(); }
    else if (e.key === 'Escape') { S = {screen: 'home'}; render(); startHomeAnim(); }
  } else if (S.screen === 'dplay' && e.key === 'Escape') { stopDango(); S = {screen: 'home'}; render(); startHomeAnim(); }
});
$('#muteBtn').addEventListener('click', () => { snd.muted = !snd.muted; DB.snd = {muted: snd.muted}; saveDB(); if (snd.muted) bgmStop(); $('#muteBtn').textContent = snd.muted ? 'おと：OFF' : 'おと：ON'; });

(async () => {
  resize();
  if (P && P.grade) await loadGrade(P.grade);
  if (P) { checkTitles(true); }
  window.__app = {get S() { return S; }, get P() { return P; }, get GD() { return GD; }, get D() { return D; }, BY: () => BY, act, render, DB, TITLES};
  render(); startHomeAnim();
  requestAnimationFrame(frame);
})();
