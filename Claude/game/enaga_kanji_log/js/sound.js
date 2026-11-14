// 音。けいさん団子と同じ系統（Web Audio で合成）。学習中は効果音だけ、BGM は かんじ団子 だけで鳴らす。
let AC = null;
export const snd = {muted: false, bgmOn: true};
export function ac() {
  if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f, dur, type = 'sine', vol = .2, when = 0, to = null) {
  if (snd.muted) return; const a = ac(); if (!a) return;
  const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .03);
}
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
let noiseBuf = null;
function noise(t, dur, vol, hp = 6000, dest) {
  const a = ac(); if (!a) return;
  if (!noiseBuf) { noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = noiseBuf; src.loop = true; f.type = 'highpass'; f.frequency.value = hp;
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(dest || a.destination); src.start(t); src.stop(t + dur + .05);
}
function note(m, t, dur, type, vol, dest, atk = .01) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(); let out = o;
  o.type = type === 'brass' ? 'sawtooth' : type; o.frequency.setValueAtTime(mf(m), t);
  if (type === 'brass') { const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(600, t); f.frequency.linearRampToValueAtTime(3200, t + .08); f.frequency.linearRampToValueAtTime(1800, t + dur); o.connect(f); out = f; }
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + atk);
  g.gain.setValueAtTime(vol, t + Math.max(atk, dur * .6)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  out.connect(g); g.connect(dest || a.destination); o.start(t); o.stop(t + dur + .05);
}
const chord = (ms, t, dur, type, vol) => ms.forEach(m => note(m, t, dur, type, vol));
const live = () => !snd.muted && ac();

export const sfx = {
  tap() { tone(1900, .025, 'square', .03); },
  tick() { tone(2600, .02, 'square', .02); },
  // 正かい：さえずり。れんぞくが のびるほど 高くなる
  chirp(c = 0) { const b = 1150 * Math.pow(2, Math.min(c, 18) / 24); tone(b, .06, 'sine', .17, 0, b * 1.6); tone(b * 1.3, .08, 'sine', .14, .065, b * 2.1); },
  // まちがい：やわらかい「ぽよん」。責める音にしない
  oops() { tone(520, .12, 'sine', .14, 0, 380); tone(420, .14, 'sine', .1, .1, 330); },
  title() { [0, 7, 12, 16].forEach((n, i) => tone(988 * Math.pow(2, n / 12), .18, 'triangle', .12, .1 + i * .09)); },
  dango() { [0, 4, 7, 12].forEach((n, i) => tone(1046 * Math.pow(2, n / 12), .14, 'sine', .14, i * .07)); },
  // 字を おぼえた：短いファンファーレ
  learned() {
    if (!live()) return; const t = AC.currentTime + .03, b = .1;
    [[0, [72, 76, 79]], [1, [74, 77, 81]], [2.5, [79, 84, 88]]].forEach(([k, ms], i) => { chord(ms, t + k * b, i === 2 ? .6 : .1, 'square', .03); note(ms[0] - 24, t + k * b, i === 2 ? .6 : .1, 'triangle', .1); });
    tone(2400, .06, 'sine', .07, .45, 3600);
  },
  count(n) {
    if (!live()) return; const t = AC.currentTime + .02, ms = {3: [67, 72], 2: [69, 74], 1: [71, 76]}[n] || [67, 72];
    note(ms[0], t, .12, 'square', .035); note(ms[1], t + .16, .16, 'square', .04); note(ms[0] - 24, t, .28, 'triangle', .12); noise(t + .16, .03, .02, 7000);
  },
  go() {
    if (!live()) return; const t = AC.currentTime + .02;
    chord([72, 76, 79, 84], t, .42, 'square', .03); note(48, t, .45, 'triangle', .14); noise(t, .25, .04, 6000);
    [84, 88, 91, 96].forEach((m, i) => note(m, t + .05 + i * .05, .1, 'sine', .05));
    tone(2500, .05, 'sine', .07, .3, 3700); tone(3100, .06, 'sine', .06, .37, 4300);
  },
  // クリア：はずむ「タタタ・タッタ・ターン！」
  clear() {
    if (!live()) return 0; const t = AC.currentTime + .05, b = .13;
    [[0, [72, 76, 79]], [1, [72, 76, 79]], [2, [72, 76, 79]], [3.5, [74, 77, 81]], [4.5, [76, 79, 83]], [6, [79, 84, 88]]].forEach(([k, ms], i) => {
      const d = i === 5 ? .9 : .11; chord(ms, t + k * b, d, 'square', .035); note(ms[0] - 24, t + k * b, d, 'triangle', .12);
    });
    [0, 1, 2, 3].forEach(i => note(96 + [0, 4, 7, 12][i], t + 6 * b + .15 + i * .06, .12, 'sine', .05));
    noise(t + 6 * b, .4, .05, 7000);
    return 1.6;
  },
  // ベスト こうしん：ドラムロール → 金管の和音 → 長い和音とキラキラ
  record() {
    if (!live()) return 0; const t = AC.currentTime + .05;
    for (let i = 0; i < 14; i++) noise(t + i * .045, .05, .03 + i * .006, 1500);
    const b = .16, s0 = t + .7;
    const seq = [[0, [67, 72, 76], .14], [1, [67, 72, 76], .14], [2, [67, 72, 76], .14], [3, [72, 76, 79], .45], [6, [68, 72, 75], .42], [9, [70, 74, 77], .42], [12, [72, 76, 79, 84], 1.5]];
    for (const [k, ms, d] of seq) { chord(ms, s0 + k * b, d, 'brass', .035); note(ms[0] - 24, s0 + k * b, d, 'triangle', .13); }
    noise(s0 + 12 * b, 1.2, .07, 5000);
    for (let i = 0; i < 10; i++) note(84 + [0, 4, 7, 12, 16, 19, 24, 19, 16, 24][i], s0 + 12 * b + .1 + i * .07, .18, 'sine', .05);
    return 3.4;
  },
};

// かんじ団子の BGM（小さめ）。れんぞく5で メロディ、10で キラキラ
let bgm = null;
const BPM = 128, STEP = 60 / BPM / 4;
const PROG = [[48, [60, 64, 67]], [45, [60, 64, 69]], [41, [60, 65, 69]], [43, [62, 67, 71]], [48, [60, 64, 67]], [45, [60, 64, 69]], [41, [60, 65, 69]], [43, [62, 65, 71]]];
const MEL = [[[0, 76], [4, 79], [8, 84], [12, 79]], [[0, 81], [6, 79], [8, 76]], [[0, 77], [4, 81], [8, 84], [12, 81]], [[0, 79], [4, 86], [8, 83], [10, 79]],
  [[0, 88], [4, 86], [6, 84], [8, 79]], [[0, 81], [4, 84], [8, 88]], [[0, 89], [4, 88], [6, 86], [8, 84], [12, 81]], [[0, 83], [4, 86], [8, 79]]];
export function bgmStart(level) {
  bgmStop(); if (!snd.bgmOn || snd.muted) return; const a = ac(); if (!a) return;
  const g = a.createGain(); g.gain.value = .55; g.connect(a.destination);
  bgm = {g, step: 0, next: a.currentTime + .08, timer: null, level};
  bgm.timer = setInterval(bgmTick, 25);
}
export function bgmStop(fade = .3) {
  if (!bgm) return; const a = ac(), b = bgm; bgm = null; clearInterval(b.timer);
  if (a) { b.g.gain.setTargetAtTime(.0001, a.currentTime, fade / 3); setTimeout(() => b.g.disconnect(), fade * 1000 + 200); }
}
function bgmTick() {
  const a = ac(); if (!a || !bgm) return;
  while (bgm.next < a.currentTime + .12) {
    const t = bgm.next, st = bgm.step % 16, bar = Math.floor(bgm.step / 16) % 8, [root, tri] = PROG[bar], d = bgm.g;
    const lv = bgm.level ? bgm.level() : 0;
    if (st === 0 || st === 3 || st === 8 || st === 11) note(root + (st === 8 ? 12 : 0), t, STEP * 1.6, 'triangle', .11, d);
    if (st === 6 || st === 14) note(root + 7, t, STEP * 1.4, 'triangle', .08, d);
    if (st === 4 || st === 12) tri.forEach(m => note(m + 12, t, STEP * 1.2, 'sine', .022, d));
    if (st % 4 === 2) noise(t, .03, .012, 8000, d);
    if (lv >= 5) for (const [k, m] of MEL[bar]) if (k === st) { note(m, t, STEP * 3, 'sine', .03, d); note(m + 12, t, STEP * 2, 'sine', .008, d); }
    if (lv >= 10 && st % 2 === 1) note(tri[(st >> 1) % 3] + 24, t, STEP * .9, 'sine', .012, d);
    bgm.next += STEP; bgm.step++;
  }
}
