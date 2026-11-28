// 部隊シミュレーション層（描画から独立。Node でもそのまま動く）
// 時刻は「0時からの秒」。1ステップ = SIM_DT 秒。決定論（乱数なし）。

export const T_START = 7.5 * 3600;   // 7:30
export const T_END = 17 * 3600;      // 17:00 日没
export const SIM_DT = 2;
const K_FIRE = 0.0011;
export let PATH_EXPOSE = 2;               // 戦闘力係数（人/秒/√人）

export function hhmm(t) {
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}
export function koku(t) {
  const h = t / 3600;
  if (h < 7) return '卯の刻'; if (h < 9) return '辰の刻'; if (h < 11) return '巳の刻';
  if (h < 13) return '午の刻'; if (h < 15) return '未の刻'; if (h < 17) return '申の刻'; return '酉の刻';
}

// units: units.js の定義, xz: (lon,lat)=>[x,z], params: 部隊ごとの能力, bounds: {hx, hz} 地図の半幅
export function createSim(units, xz, params, bounds) {
  const S = { t: T_START, units: [], byId: {}, flags: {}, fired: new Set(), log: [], listeners: [], result: null, over: false, xz, bounds, contacts: [] };
  for (const d of units) {
    const p = params[d.id] || {};
    const [x, z] = xz(d.lon, d.lat);
    const u = {
      id: d.id, def: d, name: d.name, side: d.side, origSide: d.side,
      n: d.n, n0: d.n, killed: 0, morale: p.morale ?? 0.9, morale0: p.morale ?? 0.9, msens: p.msens ?? 1.6,
      q: p.q ?? 1, fort: p.fort ?? 1, x, z, hx: x, hz: z, face: d.face, homeFace: d.face,
      r: Math.min(190, Math.max(25, Math.sqrt(d.n) * 1.4)),
      order: { type: d.idle ? 'idle' : 'hold' }, status: d.hidden ? 'gone' : 'hold', hidden: !!d.hidden, contacts: [],
      moving: 0, fighting: 0, fire: 0, retreat: p.retreat ? xz(...p.retreat) : null, speed: p.speed ?? 0.9, noRout: !!p.noRout, homeR: p.homeR ?? 150,
    };
    S.units.push(u); S.byId[d.id] = u;
  }
  S.emit = (id, data = {}) => {
    if (S.fired.has(id)) return false;
    S.fired.add(id);
    const e = { id, t: S.t, ...data };
    S.log.push(e);
    for (const f of S.listeners) f(e);
    return true;
  };
  return S;
}

const alive = (u) => u.status !== 'gone';
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export const isBroken = (u) => u.status === 'rout' || u.status === 'gone';

export function setOrder(S, id, order) {
  const u = S.byId[id];
  if (!u || isBroken(u)) return;
  u.order = order;
  if (order.type === 'hold') { u.hx = u.x; u.hz = u.z; }
}

function hostile(a, b) {
  if (a.side !== b.side) return true;
  // 島津は陣を乱して逃げ込む味方にも鉄砲を向けた
  return (a.order.type === 'aloof' && b.status === 'rout') || (b.order.type === 'aloof' && a.status === 'rout');
}

export function rout(S, u, why) {
  if (isBroken(u)) return;
  u.status = 'rout';
  let to = u.retreat;
  if (!to) to = u.side === 'E' ? S.xz(136.545, 35.370) : S.xz(136.432, 35.378);
  u.order = { type: 'flee', x: to[0], z: to[1] };
  u.speed = 1.5;
  S.emit('rout:' + u.id, { unit: u.id, why, by: u.contacts.filter((c) => c.side !== u.side).map((c) => c.name) });
  // 周囲の味方の動揺
  for (const f of S.units) {
    if (f === u || f.side !== u.side || isBroken(f)) continue;
    const d = dist(f, u);
    if (d < 1100) f.morale -= 0.1 * Math.min(1.5, Math.max(0.3, u.n0 / 5000)) * (1 - d / 1400);
  }
}

function nearestEnemy(S, u, maxD, filter) {
  let best = null, bd = maxD;
  for (const e of S.units) {
    if (!alive(e) || e.side === u.side || e.status === 'rout') continue;
    if (e.order.type === 'aloof' || e.order.type === 'idle') continue;
    if (filter && !filter(e)) continue;
    const d = dist(u, e);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function moveToward(u, tx, tz, speed, dt, stopAt = 0) {
  const dx = tx - u.x, dz = tz - u.z, d = Math.hypot(dx, dz);
  if (d <= stopAt + 0.5) return true;
  const s = Math.min(speed * dt, d - stopAt);
  u.x += dx / d * s; u.z += dz / d * s;
  u.moveDir = Math.atan2(dx, -dz) * 180 / Math.PI; // 方位
  u.moved += s;
  return false;
}

export function stepSim(S, brain) {
  const dt = SIM_DT;
  S.t += dt;
  brain(S);
  const U = S.units.filter(alive);
  for (const u of U) { u.contacts = []; u.moved = 0; u.fire = 0; }
  S.contacts = [];
  // 接触判定
  for (let i = 0; i < U.length; i++) for (let j = i + 1; j < U.length; j++) {
    const a = U[i], b = U[j];
    if (!hostile(a, b)) continue;
    if ((a.order.type === 'idle' && b.order.type === 'idle')) continue;
    const reach = a.r + b.r + ((a.order.type === 'aloof' || b.order.type === 'aloof') ? -10 : 25);
    if (dist(a, b) < reach) { a.contacts.push(b); b.contacts.push(a); S.contacts.push([a, b]); }
  }
  // 射撃・白兵（Lanchester 風、正面幅で頭打ちになるよう √n）
  const dmg = new Map();
  for (const a of U) {
    const targets = a.contacts.filter((b) => a.side !== b.side || a.order.type === 'aloof');
    a.fighting = targets.length ? 1 : 0;
    if (!targets.length) continue;
    let F = K_FIRE * a.q * (0.35 + 0.65 * Math.max(0, a.morale)) * Math.sqrt(a.n) * dt;
    if (a.status === 'rout') F *= 0.15;
    a.fire = F;
    const W = targets.reduce((s, b) => s + Math.sqrt(Math.max(0, b.n)), 0);
    if (W <= 0) continue;
    for (const b of targets) {
      let f = F * Math.sqrt(Math.max(0, b.n)) / W;
      // 側面・背後からの攻撃は効く
      const brg = Math.atan2(a.x - b.x, -(a.z - b.z)) * 180 / Math.PI;
      const off = Math.abs(((brg - b.face + 540) % 360) - 180);
      const flank = off > 110 ? 1.8 : off > 65 ? 1.35 : 1;
      f *= flank;
      if (flank > 1) b.flanked = (b.flanked || 0) + 1;
      if (b.status === 'rout') f *= 2.5;
      else if (b.order.type === 'path') f *= PATH_EXPOSE; // 敵中を駆け抜ける隊は四方から撃たれる
      else if (b.atHome) f /= b.fort;
      dmg.set(b, (dmg.get(b) || 0) + f);
    }
  }
  for (const [b, f] of dmg) {
    const real = Math.min(f, b.n);
    b.n -= real; b.killed += real;
    if (b.n < 1 && b.status !== 'gone') { b.n = 0; b.status = 'gone'; S.emit('gone:' + b.id, { unit: b.id }); }
    if (b.status !== 'rout') b.morale -= real / b.n0 * b.msens;
  }
  // 士気の回復・崩壊判定
  for (const u of U) {
    if (!u.fighting && u.status !== 'rout' && u.morale < u.morale0) u.morale = Math.min(u.morale0, u.morale + 0.00008 * dt);
    if (u.status !== 'rout' && !u.noRout && (u.morale < 0.18 || u.n < 0.22 * u.n0)) rout(S, u, u.n < 0.22 * u.n0 ? 'loss' : 'morale');
  }
  // 移動
  for (const u of U) {
    const o = u.order;
    if (o.type === 'attack') {
      let T = S.byId[o.target];
      if (!T || isBroken(T) || T.side === u.side) {
        T = (S.retarget && S.retarget(S, u)) || nearestEnemy(S, u, 1600);
        if (T) o.target = T.id; else { setOrder(S, u.id, { type: 'hold' }); }
      }
      // 目標以外の敵と接していればまずそれと戦う（足止め）
      if (T && !u.contacts.includes(T) && !u.contacts.some((c) => c.side !== u.side && c.status !== 'rout')) moveToward(u, T.x, T.z, u.speed, dt, u.r + T.r + 15);
    } else if (o.type === 'move') {
      if (moveToward(u, o.x, o.z, u.speed, dt)) setOrder(S, u.id, { type: 'hold' });
    } else if (o.type === 'path') {
      const wp = o.pts[o.i];
      if (!wp) { o.done = true; }
      else if (moveToward(u, wp[0], wp[1], o.speed || 1.3, dt)) o.i++;
    } else if (o.type === 'flee') {
      moveToward(u, o.x, o.z, u.speed, dt);
      const out = Math.abs(u.x) > S.bounds.hx - 20 || Math.abs(u.z) > S.bounds.hz - 20;
      if (out || Math.hypot(o.x - u.x, o.z - u.z) < 40 || u.n < 25) { u.status = 'gone'; S.emit('gone:' + u.id, { unit: u.id }); }
    } else if (o.type === 'hold' || o.type === 'aloof' || o.type === 'idle') {
      if (!u.fighting) moveToward(u, u.hx, u.hz, 0.25, dt);
    }
    u.atHome = (o.type === 'hold' || o.type === 'aloof' || o.type === 'idle') && Math.hypot(u.x - u.def0x(), u.z - u.def0z()) < u.homeR;
  }
  // 押し合い（優勢な側へ戦線が動く）
  for (const [a, b] of S.contacts) {
    if (a.side === b.side || isBroken(a) || isBroken(b)) continue;
    if (a.order.type === 'path' || b.order.type === 'path') continue;
    if (a.order.type === 'aloof' || b.order.type === 'aloof') continue; // 島津は押し合いに加わらない
    const fa = a.fire, fb = b.fire;
    if (fa + fb <= 0) continue;
    const p = (fa - fb) / (fa + fb);
    const d = dist(a, b) || 1, ux = (b.x - a.x) / d, uz = (b.z - a.z) / d;
    const s = p * 0.3 * dt;
    for (const u of [a, b]) {
      u.x += ux * s; u.z += uz * s;
      if (u.order.type === 'hold') { // 持ち場から離れすぎない
        const hx = u.x - u.hx, hz = u.z - u.hz, hd = Math.hypot(hx, hz);
        if (hd > 350) { u.x = u.hx + hx / hd * 350; u.z = u.hz + hz / hd * 350; }
      }
    }
  }
  // 重なり回避
  for (let i = 0; i < U.length; i++) for (let j = i + 1; j < U.length; j++) {
    const a = U[i], b = U[j];
    if (a.status === 'gone' || b.status === 'gone') continue;
    if (a.order.type === 'path' || b.order.type === 'path' || a.status === 'rout' || b.status === 'rout') continue;
    const aloof = a.order.type === 'aloof' || b.order.type === 'aloof';
    const k = aloof ? 1.05 : a.side === b.side ? 0.8 : 0.75;
    const d = dist(a, b), min = (a.r + b.r) * k;
    if (d < min && d > 0.01) {
      const push = (min - d) * 0.06, ux = (b.x - a.x) / d, uz = (b.z - a.z) / d;
      // 島津の陣には近づけない（島津側は動かず、相手だけが避ける）
      const ma = b.order.type === 'aloof' ? 2 : a.order.type === 'aloof' ? 0 : 1, mb = a.order.type === 'aloof' ? 2 : b.order.type === 'aloof' ? 0 : 1;
      a.x -= ux * push * ma; a.z -= uz * push * ma; b.x += ux * push * mb; b.z += uz * push * mb;
    }
  }
  // 向き
  for (const u of U) {
    let want = u.homeFace;
    if (u.contacts.length) {
      const e = u.contacts.reduce((m, c) => (dist(u, c) < dist(u, m) ? c : m));
      want = Math.atan2(e.x - u.x, -(e.z - u.z)) * 180 / Math.PI;
    } else if (u.moved > 0.1 * dt && u.moveDir !== undefined) want = u.moveDir;
    let df = ((want - u.face + 540) % 360) - 180;
    u.face += df * Math.min(1, 0.03 * dt);
    u.moving = u.moved > 0.15 * dt ? 1 : 0;
  }
}

// 初期位置（持ち場判定用）
export function prepare(S) {
  for (const u of S.units) { const x0 = u.x, z0 = u.z; u.def0x = () => x0; u.def0z = () => z0; }
  return S;
}

export function sideTotals(S) {
  const r = { W: { n0: 0, killed: 0 }, E: { n0: 0, killed: 0 } };
  for (const u of S.units) { if (!u.hidden) r[u.origSide].n0 += u.n0; r[u.origSide].killed += u.killed; }
  return r;
}
