// シマエナガと雪の森を Canvas に描く。けいさん団子（Claude/game/enaga_math_log）の描き方をもとにしている。
export const LINE = '#4b505e';
export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function bodyPath(ctx, r) {
  ctx.beginPath(); ctx.moveTo(0, -r);
  ctx.bezierCurveTo(r * .62, -r, r, -r * .45, r, r * .18);
  ctx.bezierCurveTo(r, r * .72, r * .6, r * .92, 0, r * .92);
  ctx.bezierCurveTo(-r * .6, r * .92, -r, r * .72, -r, r * .18);
  ctx.bezierCurveTo(-r, -r * .45, -r * .62, -r, 0, -r); ctx.closePath();
}
export function star4(ctx, x, y, s) {
  ctx.beginPath(); ctx.moveTo(x, y - s * 2); ctx.quadraticCurveTo(x, y, x + s * 2, y); ctx.quadraticCurveTo(x, y, x, y + s * 2);
  ctx.quadraticCurveTo(x, y, x - s * 2, y); ctx.quadraticCurveTo(x, y, x, y - s * 2); ctx.fill();
}
// x,y = からだの中心。足の先は y+r*1.12。
// o: mood(normal/happy/oops), flap, tilt, squash, alpha, blink, acc(scarf/crown/king/legend), t, label（おなかに書く字）
export function drawEnaga(ctx, x, y, r, o = {}) {
  const mood = o.mood || 'normal', flap = o.flap || 0, lw = Math.max(1, r * .055);
  ctx.save(); ctx.globalAlpha = o.alpha ?? 1; ctx.translate(x, y);
  if (o.tilt) ctx.rotate(o.tilt);
  const sq = o.squash || 1; ctx.scale(2 - sq, sq);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = LINE; ctx.lineWidth = lw;
  if (o.acc === 'legend') {
    const gg = ctx.createRadialGradient(0, 0, r * .6, 0, 0, r * 1.7);
    gg.addColorStop(0, 'rgba(255,225,140,.75)'); gg.addColorStop(1, 'rgba(255,225,140,0)');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2); ctx.fill();
  }
  // しっぽ
  ctx.save(); ctx.translate(r * .5, r * .55); ctx.rotate(.42); ctx.lineWidth = lw * .8;
  ctx.fillStyle = '#45454f'; rr(ctx, 0, -r * .08, r * 1.35, r * .16, r * .08); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffffff'; rr(ctx, r * .25, -r * .08 + lw * .5, r * 1.0, r * .045, r * .02); ctx.fill();
  ctx.restore();
  // あし
  ctx.strokeStyle = '#4a3f3a'; ctx.lineWidth = Math.max(1, r * .06);
  for (const sd of [-1, 1]) {
    const fx = sd * r * .26; ctx.beginPath();
    ctx.moveTo(fx, r * .8); ctx.lineTo(fx, r * 1.08);
    ctx.moveTo(fx, r * 1.08); ctx.lineTo(fx - r * .12, r * 1.12); ctx.moveTo(fx, r * 1.08); ctx.lineTo(fx + r * .12, r * 1.12);
    ctx.moveTo(fx, r * 1.08); ctx.lineTo(fx, r * 1.14); ctx.stroke();
  }
  // からだ
  const g = ctx.createLinearGradient(0, -r, 0, r); g.addColorStop(0, '#ffffff'); g.addColorStop(.6, '#ffffff'); g.addColorStop(1, '#eceff6');
  bodyPath(ctx, r); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = LINE; ctx.lineWidth = lw; ctx.stroke();
  // ふわふわの毛
  ctx.strokeStyle = 'rgba(120,128,145,.55)'; ctx.lineWidth = Math.max(1, r * .035); ctx.beginPath();
  ctx.moveTo(-r * .08, -r * 1.0); ctx.quadraticCurveTo(-r * .02, -r * 1.14, r * .1, -r * 1.1);
  ctx.moveTo(r * .02, -r * 1.0); ctx.quadraticCurveTo(r * .12, -r * 1.08, r * .2, -r * 1.02);
  if (!o.label) for (const [px, py] of [[-.3, .52], [.32, .5], [0, .66]]) { ctx.moveTo(r * (px - .06), r * (py + .05)); ctx.lineTo(r * px, r * py); ctx.lineTo(r * (px + .06), r * (py + .05)); }
  ctx.stroke();
  // はね
  for (const sd of [-1, 1]) {
    ctx.save(); ctx.translate(sd * r * .9, r * .38); ctx.rotate(sd * (.22 + flap * .9));
    ctx.fillStyle = '#a8968c'; ctx.beginPath(); ctx.ellipse(0, 0, r * .18, r * .34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = LINE; ctx.lineWidth = lw; ctx.stroke();
    ctx.fillStyle = '#6e5f59'; ctx.beginPath(); ctx.ellipse(sd * r * .03, r * .15, r * .1, r * .17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  if (o.acc === 'scarf') {
    ctx.fillStyle = '#f07a96'; ctx.strokeStyle = LINE; ctx.lineWidth = lw;
    rr(ctx, r * .25, r * .36, r * .24, r * .5, r * .1); ctx.fill(); ctx.stroke();
    rr(ctx, -r * .84, r * .25, r * 1.68, r * .25, r * .12); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = lw * .9; ctx.beginPath();
    for (const sx of [-.55, -.25, .05, .35, .62]) { ctx.moveTo(r * sx, r * .29); ctx.lineTo(r * sx, r * .46); } ctx.stroke();
  }
  // おなかの字（おぼえた字を持っているシマエナガ）
  if (o.label) {
    ctx.fillStyle = o.labelColor || '#2b3a4a';
    ctx.font = `bold ${(r * .78).toFixed(1)}px "BIZ UDGothic","Hiragino Sans","Meiryo",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.label, 0, r * .47);
  }
  // ほっぺ
  ctx.fillStyle = 'rgba(255,150,168,.55)';
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * r * .58, r * .14, r * .14, r * .085, 0, 0, Math.PI * 2); ctx.fill(); }
  // め
  ctx.fillStyle = '#17171c'; ctx.strokeStyle = '#17171c'; ctx.lineWidth = Math.max(1.2, r * .07);
  const ex = r * .33, ey = -r * .08, er = r * .115;
  if (mood === 'happy') {
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * ex, ey + er * .6, er, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  } else if (mood === 'oops') {
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * (ex + er * .8), ey - er * .8); ctx.lineTo(sd * (ex - er * .6), ey); ctx.lineTo(sd * (ex + er * .8), ey + er * .8); ctx.stroke(); }
    ctx.fillStyle = '#9fd3f5'; ctx.beginPath(); ctx.moveTo(r * .86, -r * .78); ctx.quadraticCurveTo(r * 1.0, -r * .5, r * .86, -r * .46); ctx.quadraticCurveTo(r * .72, -r * .5, r * .86, -r * .78); ctx.fill();
  } else if (o.blink) {
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * ex - er, ey); ctx.lineTo(sd * ex + er, ey); ctx.stroke(); }
  } else {
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * ex, ey, er, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffffff';
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * ex - er * .35, ey - er * .38, er * .33, 0, Math.PI * 2); ctx.fill(); }
  }
  // くちばし
  ctx.fillStyle = '#26262c'; ctx.beginPath(); ctx.moveTo(-r * .085, -r * .03); ctx.lineTo(r * .085, -r * .03); ctx.lineTo(0, r * .08); ctx.closePath(); ctx.fill();
  if (o.acc === 'crown' || o.acc === 'king' || o.acc === 'legend') {
    const cs = o.acc === 'crown' ? 1 : 1.25; ctx.save(); ctx.translate(0, -r * .86); ctx.scale(cs, cs);
    ctx.fillStyle = '#ffd166'; ctx.strokeStyle = '#b8862b'; ctx.lineWidth = lw; ctx.beginPath();
    ctx.moveTo(-r * .34, 0); ctx.lineTo(-r * .36, -r * .3); ctx.lineTo(-r * .17, -r * .14); ctx.lineTo(0, -r * .36); ctx.lineTo(r * .17, -r * .14); ctx.lineTo(r * .36, -r * .3); ctx.lineTo(r * .34, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e0455c'; ctx.beginPath(); ctx.arc(0, -r * .1, r * .055, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  if (o.acc === 'king' || o.acc === 'legend') {
    const t = (o.t || 0) / 500; ctx.fillStyle = o.acc === 'legend' ? '#ffb3c7' : '#ffd166';
    for (let i = 0; i < 4; i++) { const a = t + i * Math.PI / 2; star4(ctx, Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.05 - r * .1, r * (.09 + .04 * Math.sin(t * 3 + i))); }
  }
  if (o.acc === 'legend') { ctx.strokeStyle = '#ffcf4a'; ctx.lineWidth = r * .07; ctx.beginPath(); ctx.ellipse(0, -r * 1.45, r * .42, r * .11, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}
export const blinkNow = (now, ph) => ((now + ph * 997) % 3400) < 130;

// 雪の森の背景
const snow = []; for (let i = 0; i < 70; i++) snow.push({x: Math.random(), y: Math.random(), r: 1 + Math.random() * 2.5, v: .02 + Math.random() * .04, ph: Math.random() * 6});
const trees = []; for (let i = 0; i < 9; i++) trees.push({x: (i + .5) / 9 + (Math.random() - .5) * .05, s: .55 + Math.random() * .6});
function drawTree(c, x, base, h) {
  for (let k = 0; k < 3; k++) {
    const y = base - h * k * .28, wd = h * (.36 - k * .08);
    c.fillStyle = 'rgba(150,185,222,.35)'; c.beginPath(); c.moveTo(x, y - h * .45); c.lineTo(x + wd, y); c.lineTo(x - wd, y); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(x, y - h * .45); c.lineTo(x + wd * .35, y - h * .3); c.lineTo(x - wd * .35, y - h * .3); c.closePath(); c.fill();
  }
}
export function drawBg(c, w, h, t, dt) {
  c.clearRect(0, 0, w, h);
  for (const tr of trees) drawTree(c, tr.x * w, h * .8, h * .3 * tr.s);
  c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(w * .25, h * 1.0, w * .5, h * .2, 0, 0, Math.PI * 2); c.ellipse(w * .8, h * 1.02, w * .45, h * .2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,.85)';
  for (const f of snow) {
    f.y += f.v * dt / 1000; if (f.y > 1.02) { f.y = -.02; f.x = Math.random(); }
    c.beginPath(); c.arc((f.x + Math.sin(t / 1500 + f.ph) * .01) * w, f.y * h, f.r, 0, Math.PI * 2); c.fill();
  }
}
export function snowyBranch(c, x0, x1, y, thick) {
  const sag = thick * .8;
  c.lineCap = 'round'; c.strokeStyle = '#8b6a52'; c.lineWidth = thick; c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo((x0 + x1) / 2, y + sag, x1, y); c.stroke();
  c.strokeStyle = '#ffffff'; c.lineWidth = thick * .5; c.beginPath(); c.moveTo(x0 + thick, y - thick * .42); c.quadraticCurveTo((x0 + x1) / 2, y + sag - thick * .42, x1 - thick, y - thick * .42); c.stroke();
}
export function burst(arr, now, x, y, n) {
  const cols = ['#f07a96', '#ffd166', '#7cc6ff', '#ffffff'];
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 240; arr.push({x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: now, col: cols[i % 4]}); }
}
export function drawSparks(c, arr, now, dt) {
  return arr.filter(p => {
    const a = (now - p.t) / 900; if (a >= 1) return false;
    p.x += p.vx * dt / 1000; p.y += p.vy * dt / 1000; c.globalAlpha = 1 - a; c.fillStyle = p.col;
    c.beginPath(); c.arc(p.x, p.y, 4 * (1 - a) + 1, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; return true;
  });
}
