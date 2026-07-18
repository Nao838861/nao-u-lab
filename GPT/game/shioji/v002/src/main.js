import { World, P, GOODS, LADDER, JOBCLS, stdTerrain, VERSION } from './engine.js?v=3';
import { Renderer, GOODS_VIEW, JOB_VIEW } from './render.js?v=3';
import { ShipSystem } from './ship.js?v=3';

const $ = id => document.getElementById(id);
const fmt = value => Math.round(value).toLocaleString('ja-JP');
const money = internal => fmt(internal * 10);
const signedMoney = internal => `${internal >= 0 ? '＋' : '－'}${money(Math.abs(internal))}`;
const escapeHtml = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const world = new World(11);
world.market = { x: 25, y: 32 };
world.port = { x: 25, y: 35 };
world.setTerrain(stdTerrain(48, 40));
world.seedRoads([[25, 32], [24, 32], [26, 32], [25, 33], [25, 34], [25, 35]]);

const renderer = new Renderer($('world'), world);
const state = {
  speed: 0,
  category: 'life',
  tool: null,
  hover: null,
  roadAnchor: null,
  roadPreview: null,
  placementOk: true,
  selected: null,
  running: false,
  objective: 0,
  recentAdvisorUntil: 0,
  lastFrame: performance.now(),
  accumulator: 0,
  lastUi: 0,
  lastDay: 0,
  lastEvent: 0,
  lastOrder: null,
  financeSnap: null,
  ledgerRows: [],
  mail: [],
  openedSheets: new Set(),
};

const TOOL_DEFS = [
  { id: 'fisher', category: 'life', name: '漁師', icon: '🐟', cost: P.BUILD_COST, note: '浜の食料' },
  { id: 'veg', category: 'life', name: '菜園', icon: '🥬', cost: P.BUILD_COST, note: '早い収穫' },
  { id: 'wheat', category: 'life', name: '麦畑', icon: '🌾', cost: P.BUILD_COST, note: '冬の備蓄' },
  { id: 'logger', category: 'industry', name: '木こり', icon: '🪓', cost: P.BUILD_COST, note: '森の際' },
  { id: 'woodshop', category: 'industry', name: '木工房', icon: '🪚', cost: P.BUILD_COST, note: '丸太→木製品' },
  { id: 'charburner', category: 'industry', name: '炭焼', icon: '♨', cost: P.BUILD_COST, note: '冬と製塩' },
  { id: 'saltworks', category: 'industry', name: '製塩', icon: '◇', cost: P.BUILD_COST, note: '保存食' },
  { id: 'road', category: 'logistics', name: '道路', icon: '⌁', cost: null, note: '8方向に線引き' },
  { id: 'roadRemove', category: 'logistics', name: '道路撤去', icon: '⌫', cost: null, note: '返金なし' },
  { id: 'manifest', category: 'logistics', name: '現物台帳', icon: '▦', cost: null, note: '在庫と流れ', action: 'manifest' },
];

const OBJECTIVES = [
  {
    title: '漁師の区画を2つ用意する', detail: '浜と既設道路の両方に接する土地を選びます。次の船で家族が渡ってきます。', recommend: 'fisher',
    progress: () => Math.min(1, countJob('fisher') / 2), done: () => countJob('fisher') >= 2,
  },
  {
    title: '菜園と麦畑を道沿いに用意する', detail: '菜園はすぐに、麦は秋に実ります。道路へ接する空き地を使います。', recommend: 'veg',
    progress: () => (Math.min(1, countJob('veg')) + Math.min(1, countJob('wheat'))) / 2, done: () => countJob('veg') >= 1 && countJob('wheat') >= 1,
  },
  {
    title: '市場から雑木林へ道路を伸ばす', detail: '流通タブの道路を選び、既設道から北の雑木林へドラッグします。対角を含む8方向へ吸着します。', recommend: 'road',
    progress: () => Math.min(1, world.connectedPlayerRoadCount() / 5) * (world.roadNearTerrain('forest', 2) ? 1 : .8), done: () => world.connectedPlayerRoadCount() >= 5 && world.roadNearTerrain('forest', 2),
  },
  {
    title: '木こりと木工房を道路へつなぐ', detail: '木こりは森の際、木工房は市場寄りへ。入口が市場道路網につながる場所だけに建てられます。', recommend: 'logger',
    progress: () => (Math.min(1, countConnectedJob('logger')) + Math.min(1, countConnectedJob('woodshop'))) / 2, done: () => countConnectedJob('logger') >= 1 && countConnectedJob('woodshop') >= 1,
  },
  {
    title: '最初の手荷車を市場まで見届ける', detail: '接続した家族は徒歩の4倍を積めます。荷車が完成道路を往復し、丸太か木製品を市場へ運ぶのを見届けます。', recommend: null,
    progress: () => Math.min(1, (world.roadStats.cartTrips ? .6 : 0) + (world.roadStats.delivered > 2 ? .4 : 0)), done: () => world.roadStats.cartTrips > 0 && world.roadStats.delivered > 2,
  },
  {
    title: '食料自給と木製品の流通を育てる', detail: '輸入の赤い行を減らし、島内取引の緑の行を増やします。本国注文はこの後です。', recommend: null,
    progress: () => chapterProgress(), done: () => chapterProgress() >= .999,
  },
  {
    title: '第一章「会社の店から島の市場へ」達成', detail: '島は自分の足で立ち始めました。次は本国注文、鉄、辺境市場へ進めます。', recommend: null,
    progress: () => 1, done: () => false,
  },
];

function countJob(job) {
  return world.zones.filter(z => z.job === job).length;
}

function countConnectedJob(job) {
  return world.zones.filter(z => z.job === job && z.roadConnected).length;
}

function stallTotal() {
  return Object.values(world.stalls).reduce((sum, list) => sum + list.reduce((s, item) => s + item.qty, 0), 0);
}

function chapterProgress() {
  const f = world.f30 || {};
  const foodProd = ['fish', 'veg', 'wheat'].reduce((sum, g) => sum + (f[g]?.prod || 0), 0);
  const foodImp = f.wheat?.imp || 0;
  const tools = (f.tools?.prod || 0) + (world.hhs.reduce((s, h) => s + (h.pantry.tools || 0), 0) > 5 ? .5 : 0);
  const foodPart = Math.min(1, foodProd / Math.max(2, foodImp + 2));
  const toolsPart = Math.min(1, tools / 1.2);
  return foodPart * .65 + toolsPart * .35;
}

function currentToolDef() { return TOOL_DEFS.find(t => t.id === state.tool); }

function toast(message, type = '', duration = 5200) {
  const stack = $('toast-stack');
  const limit = innerWidth < 620 ? 2 : 3;
  while (stack.children.length >= limit) stack.firstElementChild.remove();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = message;
  stack.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

function setAdvisor(text, seconds = 8) {
  $('advisor-line').textContent = text;
  state.recentAdvisorUntil = performance.now() + seconds * 1000;
}

function addLedger(label, amount, day = world.day, detail = '') {
  if (Math.abs(amount) < .001) return;
  state.ledgerRows.unshift({ label, amount, day, detail });
  if (state.ledgerRows.length > 80) state.ledgerRows.length = 80;
}

function addMail({ kind = '本国書状', title, sender = '本国勅許会社・監査局', body, elena, finance = [], day = world.day, unread = true }) {
  const entry = { id: `${day}-${state.mail.length}-${title}`, kind, title, sender, body, elena, finance, day, unread };
  state.mail.unshift(entry);
  updateDesk();
  return entry;
}

const openingMail = addMail({
  kind: '第一便', title: '勅許状と支度金', sender: '本国勅許会社・植民委員会',
  body: '貴殿を本島の支配人に任ずる。会社の信用を毀損せず、入植地を自立させ、相応の見返りを示せ。',
  elena: '「“相応”の中身は書かれていません。あちらにとって便利な言葉です。まず、こちらの人々が食べられる形を作りましょう」',
  finance: [{ label: '会社支度金', value: P.TREASURY0 }, { label: '現在の会社資金', value: P.TREASURY0 }], day: 0, unread: false,
});

state.ledgerRows.push({ label: '会社支度金', amount: P.TREASURY0, day: 0, detail: '第一便・本国より' });

const ship = new ShipSystem(world.port, onShipArrival);

function onShipArrival({ day, cargo }) {
  renderer.focus(world.port.x, world.port.y);
  const cargoText = Object.entries(cargo).map(([g, q]) => `${GOODS_VIEW[g]?.name || g} ${q}荷`).join('・');
  toast(`<b>定期便が入港</b><br>${cargoText}。荷下ろし後、船は出港します。`);
  setAdvisor(day <= 15
    ? '空き区画があれば、今回の便から最大二世帯が上陸します。先に食卓を、次に仕事を。順番は大切です。'
    : '定期便です。積荷と書状を確認します。盤面は止めませんので、そのまま島をご覧ください。');
  const funds = world.treasury;
  if (day === 15) {
    addMail({
      kind: '定期便報告', title: '入植者名簿・第一陣', sender: '港湾係より',
      body: '本便は、島で暮らせる空き区画を確認した家族を上陸させる。渡航費と開拓キットは会社勘定とする。',
      elena: '「人が増えることは、働き手と食べる口が同時に増えることです。建物の数だけを成功と数えませんように」',
      finance: [{ label: '現在の会社資金', value: funds }], day,
    });
  } else if (day % 30 === 0) {
    const debt = Math.max(0, -world.treasury);
    addMail({
      kind: '本国監査', title: debt > 0 ? '帳簿の赤字について' : '進捗は記録された',
      body: debt > 0
        ? `会社は債務 ${money(debt)} を確認した。忍耐を善意と取り違えぬよう、次便までに改善を示せ。`
        : '帳簿は島内取引の増加を記録した。会社は引き続き、相応の見返りを期待する。',
      elena: debt > 0
        ? '「封蝋は立派です。中身は数字しか見ていません。私たちは、赤い輸入の行を一つずつ島の荷車に置き換えましょう」'
        : '「褒めてはいません。ただ、怒ってもいません。本国から得られる最大級の賛辞です」',
      finance: [{ label: '現在の会社資金', value: world.treasury }, { label: '信用限度', value: -world.limit() }], day,
    });
  }
}

function buildToolbar() {
  document.querySelectorAll('.dock-tabs button').forEach(btn => {
    btn.onclick = () => { state.category = btn.dataset.category; state.tool = null; state.roadAnchor = null; state.roadPreview = null; updateToolHint(); renderTools(); };
  });
  renderTools();
}

function renderTools() {
  document.querySelectorAll('.dock-tabs button').forEach(btn => btn.classList.toggle('on', btn.dataset.category === state.category));
  const box = $('build-tools');
  box.innerHTML = '';
  const objective = OBJECTIVES[state.objective] || OBJECTIVES.at(-1);
  for (const tool of TOOL_DEFS.filter(t => t.category === state.category)) {
    const btn = document.createElement('button');
    btn.className = `build-tool${state.tool === tool.id ? ' on' : ''}${objective.recommend === tool.id ? ' rec' : ''}`;
    btn.dataset.tool = tool.id;
    btn.innerHTML = `<span class="tool-icon">${tool.icon}</span><strong>${tool.name}</strong><span>${tool.cost ? `支度金 ${money(tool.cost)}` : tool.note}</span>`;
    btn.onclick = () => {
      if (tool.action) { openSheet(tool.action); return; }
      state.tool = state.tool === tool.id ? null : tool.id;
      state.roadAnchor = null;
      state.roadPreview = null;
      $('world').classList.toggle('tool-active', !!state.tool);
      $('cancel-tool').hidden = !state.tool;
      updateToolHint();
      renderTools();
    };
    box.appendChild(btn);
  }
  $('cancel-tool').hidden = !state.tool;
}

function updateToolHint() {
  const hint = $('tool-hint');
  const def = currentToolDef();
  if (!def) { hint.hidden = true; return; }
  hint.hidden = false;
  if (def.id === 'road') hint.textContent = 'ドラッグ、または始点と終点を順にタップ — 8方向へ吸着します';
  else if (def.id === 'roadRemove') hint.textContent = '撤去する道路をドラッグ、または始点と終点を順にタップ — 返金なし';
  else hint.textContent = `${def.name}を置く場所をタップ — 支度金 －${money(def.cost)}`;
}

function updateRoadHint(preview) {
  const hint = $('tool-hint');
  if (!preview) return updateToolHint();
  hint.hidden = false;
  if (preview.remove) {
    const affected = (preview.disconnectedHomes || 0) + (preview.disconnectedZones || 0);
    hint.textContent = `撤去 ${preview.removable}区画${preview.isolated ? ` — 道${preview.isolated}区画が孤立` : ''}${affected ? `・沿道${affected}件が不通` : ''}`;
    return;
  }
  const cost = world.estimateRoadCost(preview.newCount);
  const status = preview.valid ? (preview.connects ? '市場へ接続' : '孤立した計画') : preview.reason;
  hint.textContent = `${preview.newCount}区画・賃金約${money(cost)}・${preview.workDays}人日 — ${status}`;
}

function cancelTool() {
  state.tool = null;
  state.hover = null;
  state.roadAnchor = null;
  state.roadPreview = null;
  $('world').classList.remove('tool-active');
  $('cancel-tool').hidden = true;
  $('tool-hint').hidden = true;
  renderTools();
}

$('cancel-tool').onclick = cancelTool;

function canPlace(tool, x, y) {
  if (x < 0 || y < 0 || x >= world.MW || y >= world.MH) return [false, '島の外です'];
  if (tool === 'road') {
    if (world.terr[y]?.[x] === 'water') return [false, '水上には道を引けません'];
    if (world.roadTiles.has(`${x},${y}`)) return [false, 'すでに道があります'];
    if (world.zones.some(z => z.x === x && z.y === y) || world.hhs.some(h => Math.round(h.x) === x && Math.round(h.y) === y)) return [false, '建物の上には道を引けません'];
    return [true, ''];
  }
  if (tool === 'roadRemove') {
    const site = world.sites.some(s => s.x === x && s.y === y);
    return [world.roadTiles.has(`${x},${y}`) || site, 'ここに撤去できる道路はありません'];
  }
  return world.canPlace(tool, x, y);
}

function placeBuilding(tool, x, y) {
  const [ok, why] = canPlace(tool, x, y);
  if (!ok) { toast(`<b>配置できません</b><br>${escapeHtml(why)}`, 'expense'); return false; }
  const before = world.treasury;
  if (!world.addZone(tool, x, y)) { toast('<b>支度金を用意できません</b><br>会社帳簿で信用余力を確認してください。', 'expense'); return false; }
  const delta = world.treasury - before;
  showMoneyFloat(delta, x, y);
  toast(`<b>${JOB_VIEW[tool]?.name || tool}の区画</b><br>支度金 ${signedMoney(delta)}。家族が決まれば、港から資材を運んで普請します。`, 'expense');
  if (tool === 'fisher') setAdvisor('区画は招待状です。次の便までに、食料と仕事の釣り合いを考えておきましょう。');
  updateObjective();
  return true;
}

function snapRoadEnd(a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  if (!dx && !dy) return [...a];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  let best = dirs[0], score = -Infinity;
  for (const d of dirs) {
    const s = (dx * d[0] + dy * d[1]) / Math.hypot(d[0], d[1]);
    if (s > score) { score = s; best = d; }
  }
  const len = Math.max(1, Math.round((dx * best[0] + dy * best[1]) / (best[0] * best[0] + best[1] * best[1])));
  return [a[0] + best[0] * len, a[1] + best[1] * len];
}

function lineTiles(x0, y0, x1, y1) {
  const dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0), n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  return Array.from({ length: n + 1 }, (_, i) => [x0 + dx * i, y0 + dy * i]);
}

function plannedConnects(points) {
  const roads = world.roadSet(true);
  for (const [x, y] of points) roads.add(`${x},${y}`);
  const connected = world.connectedRoadSet(roads);
  return points.some(([x, y]) => connected.has(`${x},${y}`));
}

function buildRoadPreview(a, b, remove = false) {
  const end = snapRoadEnd(a, b), points = lineTiles(a[0], a[1], end[0], end[1]);
  if (remove) {
    const removable = points.filter(([x, y]) => world.roadTiles.has(`${x},${y}`) || world.sites.some(s => s.x === x && s.y === y)).length;
    const impact = world.roadRemovalImpact(points);
    return { points, remove: true, valid: removable > 0, removable, isolated: impact.isolatedRoads,
      disconnectedZones: impact.disconnectedZones, disconnectedHomes: impact.disconnectedHomes, end };
  }
  let reason = '', newCount = 0;
  const statuses = points.map(([x, y]) => {
    const k = `${x},${y}`;
    if (world.roadTiles.has(k)) return 'existing';
    if (world.sites.some(s => s.x === x && s.y === y)) return 'planned';
    const [ok, why] = canPlace('road', x, y);
    if (!ok) { reason ||= why; return 'blocked'; }
    newCount++; return 'new';
  });
  const valid = !reason && newCount > 0;
  return { points, statuses, remove: false, valid, reason: reason || (newCount ? '' : '新しく引く区画がありません'), newCount,
    connects: plannedConnects(points), workDays: newCount * P.ROAD_WORK, end };
}

function planRoadLine(a, b) {
  const preview = buildRoadPreview(a, b, false);
  state.roadPreview = preview;
  if (!preview.valid) { toast(`<b>道路を計画できません</b><br>${escapeHtml(preview.reason)}`, 'expense'); return false; }
  const batch = world.beginRoadBatch();let made = 0;
  for (let i = 0; i < preview.points.length; i++) {
    if (preview.statuses[i] !== 'new') continue;
    const [x, y] = preview.points[i];if (world.planRoad(x, y, { batch, player: true })) made++;
  }
  if (made) {
    world.log(`道普請 ${made}区画を計画`);
    toast(`<b>道普請 ${made}区画を計画</b><br>市場側から順に、人夫が約${preview.workDays}人日で通します。`, 'expense');
    setAdvisor(preview.connects ? 'この計画は市場の道へつながっています。完成すれば、沿道の家へ手荷車が入れます。' : 'この道はまだ市場へつながっていません。孤立した道では、荷車は使えません。');
    state.roadAnchor = null;state.roadPreview = null;updateRoadHint(null);updateObjective();return true;
  } else toast('<b>道を計画できません</b><br>水面・建物・既存道路を避けてください。', 'expense');
  return false;
}

function removeRoadLine(a, b) {
  const preview = buildRoadPreview(a, b, true);
  const result = world.removeRoadBatch(preview.points);
  if (result.removed) {
    const affected = result.disconnectedHomes + result.disconnectedZones;
    toast(`<b>道路を${result.removed}区画撤去</b><br>返金はありません。${result.isolatedRoads ? `${result.isolatedRoads}区画が市場から孤立${affected ? `、沿道${affected}件が不通` : ''}。` : '市場への接続は保たれています。'}`, result.isolatedRoads || affected ? 'expense' : '');
    if (result.isolatedRoads || affected) setAdvisor('道が切れ、沿道の区画が市場から孤立しました。再接続するまで、荷車は出ません。');
    state.roadAnchor = null;state.roadPreview = null;updateRoadHint(null);return true;
  }
  toast('<b>撤去できる道路がありません</b>', 'expense');return false;
}

function showMoneyFloat(amount, x = world.port.x, y = world.port.y) {
  const p = renderer.project(x, y, 30);
  const el = document.createElement('div');
  el.className = `money-float ${amount >= 0 ? 'positive' : 'negative'}`;
  el.textContent = signedMoney(amount);
  el.style.left = `${p.x}px`;
  el.style.top = `${p.y}px`;
  $('float-layer').appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

function selectAt(x, y) {
  let best = null, dist = 1.55;
  for (const h of world.hhs) {
    const d = Math.hypot(h.x - x, h.y - y);
    if (d < dist) { best = h; dist = d; }
  }
  if (best) state.selected = best;
  else if (Math.hypot(world.port.x - x, world.port.y - y) < 2.8) state.selected = 'port';
  else if (Math.hypot(world.market.x - x, world.market.y - y) < 2.5) state.selected = 'market';
  else if (world.roadTiles.has(`${x},${y}`)) state.selected = { type: 'road', x, y };
  else state.selected = null;
  updateSelection();
}

function setupInput() {
  const canvas = $('world');
  const pointers = new Map();
  let gesture = null;
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const tile = renderer.screenToTile(e.clientX, e.clientY);
    const roadTool = state.tool === 'road' || state.tool === 'roadRemove';
    if (pointers.size === 1) gesture = { startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY, tile, moved: false, roadStart: roadTool ? (state.roadAnchor || tile) : null };
    else if (pointers.size === 2) {
      const pts = [...pointers.values()];
      gesture = { pinch: true, distance: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) };
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    state.hover = renderer.screenToTile(e.clientX, e.clientY);
    if (state.tool && state.hover) {
      const [hx, hy] = state.hover;
      state.placementOk = canPlace(state.tool, hx, hy)[0]
        || (state.tool === 'road' && (world.roadTiles.has(`${hx},${hy}`) || world.sites.some(s => s.x === hx && s.y === hy)));
    }
    if (gesture?.roadStart && state.hover) {
      state.roadPreview = buildRoadPreview(gesture.roadStart, state.hover, state.tool === 'roadRemove');
      updateRoadHint(state.roadPreview);
    } else if (state.roadAnchor && state.hover && (state.tool === 'road' || state.tool === 'roadRemove')) {
      state.roadPreview = buildRoadPreview(state.roadAnchor, state.hover, state.tool === 'roadRemove');
      updateRoadHint(state.roadPreview);
    }
    if (!gesture) return;
    if (pointers.size >= 2 && gesture.pinch) {
      const pts = [...pointers.values()];
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const cx = (pts[0].x + pts[1].x) / 2, cy = (pts[0].y + pts[1].y) / 2;
      renderer.zoomAt(d / gesture.distance, cx, cy);
      gesture.distance = d;
      return;
    }
    if (gesture.pinch) return;
    const dx = e.clientX - gesture.lastX, dy = e.clientY - gesture.lastY;
    if (Math.hypot(e.clientX - gesture.startX, e.clientY - gesture.startY) > 7) gesture.moved = true;
    if (!state.tool && gesture.moved) renderer.pan(dx, dy);
    gesture.lastX = e.clientX; gesture.lastY = e.clientY;
  });
  const finish = e => {
    const last = pointers.get(e.pointerId) || { x: e.clientX, y: e.clientY };
    pointers.delete(e.pointerId);
    if (!gesture || gesture.pinch) { if (!pointers.size) gesture = null; return; }
    const tile = renderer.screenToTile(last.x, last.y);
    const roadTool = state.tool === 'road' || state.tool === 'roadRemove';
    if (roadTool && gesture.roadStart) {
      if (!gesture.moved && !state.roadAnchor) {
        state.roadAnchor = tile;state.roadPreview = null;
        const def = state.tool === 'roadRemove' ? '撤去の終点' : '道路の終点';
        $('tool-hint').hidden = false;$('tool-hint').textContent = `${def}をタップするか、そこまでドラッグしてください`;
        toast('<b>始点を指定</b><br>終点をタップするか、そのままドラッグしてください。');
      } else {
        const start = state.roadAnchor || gesture.roadStart;
        if (state.tool === 'road') planRoadLine(start, tile); else removeRoadLine(start, tile);
      }
    }
    else if (state.tool && !gesture.moved) placeBuilding(state.tool, tile[0], tile[1]);
    else if (!state.tool && !gesture.moved) selectAt(tile[0], tile[1]);
    gesture = null;
  };
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  canvas.addEventListener('wheel', e => { e.preventDefault(); renderer.zoomAt(e.deltaY < 0 ? 1.1 : .9, e.clientX, e.clientY); }, { passive: false });
  canvas.addEventListener('contextmenu', e => { e.preventDefault(); cancelTool(); });
}

function setupUiActions() {
  document.querySelectorAll('.speed button').forEach(btn => btn.onclick = () => setSpeed(Number(btn.dataset.speed)));
  $('begin-button').onclick = () => {
    $('opening').hidden = true;
    state.running = true;
    ship.begin();
    setSpeed(1);
    toast('<b>第一便が出港します</b><br>次の定期便まで15日。先に区画を用意してください。');
    setAdvisor('支配人、港と市場の脇で光る金茶色の道、その隣の浜へ漁師を二つ。道に接しない家へは、入植船から降りられません。');
  };
  $('focus-port').onclick = () => renderer.focus(world.port.x, world.port.y);
  $('open-ledger').onclick = () => openSheet('ledger');
  $('open-desk').onclick = () => openSheet('desk');
  $('menu-button').onclick = () => $('menu').hidden = false;
  $('menu-ledger').onclick = () => { $('menu').hidden = true; openSheet('ledger'); };
  $('menu-manifest').onclick = () => { $('menu').hidden = true; openSheet('manifest'); };
  $('menu-desk').onclick = () => { $('menu').hidden = true; openSheet('desk'); };
  $('reset-game').onclick = () => { if (confirm('島の進行を破棄して、第一便からやり直しますか？')) location.reload(); };
  $('retry-button').onclick = () => location.reload();
  document.querySelectorAll('[data-close]').forEach(btn => btn.onclick = () => closeLayer(btn.dataset.close));
  addEventListener('keydown', e => {
    if (e.code === 'Space' && !$('opening').hidden) return;
    if (e.code === 'Space') { e.preventDefault(); setSpeed(state.speed ? 0 : 1); }
    if (e.key === 'Escape') { cancelTool(); for (const id of ['ledger', 'desk', 'manifest', 'letter-view', 'menu']) closeLayer(id); }
    if (['1', '2', '3'].includes(e.key)) setSpeed(Number(e.key));
  });
}

function setSpeed(speed) {
  state.speed = speed;
  document.querySelectorAll('.speed button').forEach(btn => btn.classList.toggle('on', Number(btn.dataset.speed) === speed));
}

function openSheet(id) {
  for (const sid of ['ledger', 'desk', 'manifest']) if (sid !== id) $(sid).hidden = true;
  $(id).hidden = false;
  if (id === 'ledger') updateLedger();
  if (id === 'desk') updateDesk();
  if (id === 'manifest') updateManifest();
}

function closeLayer(id) {
  const el = $(id);
  if (el) el.hidden = true;
}

function openLetter(entry) {
  entry.unread = false;
  updateDesk();
  const rows = entry.finance.map(r => {
    const cls = r.value >= 0 ? 'plus' : 'minus';
    return `<div><span>${escapeHtml(r.label)}</span><b class="${cls}">${r.label.includes('限度') ? `－${money(Math.abs(r.value))}` : signedMoney(r.value)}</b></div>`;
  }).join('');
  $('letter-body').innerHTML = `
    <div class="letter-kicker">${escapeHtml(entry.kind)}・${entry.day ? `D${entry.day}` : '着任日'}</div>
    <h2>${escapeHtml(entry.title)}</h2>
    <p><b>${escapeHtml(entry.sender)}</b></p>
    <div class="seal-line">${escapeHtml(entry.body)}</div>
    ${rows ? `<div class="letter-finance">${rows}</div>` : ''}
    <p class="elena-quote">${escapeHtml(entry.elena || '')}</p>`;
  $('letter-view').hidden = false;
}

function updateDesk() {
  const unread = state.mail.filter(m => m.unread).length;
  $('desk-unread').hidden = !unread;
  $('desk-unread').textContent = unread;
  const list = $('desk-list');
  list.innerHTML = '';
  for (const entry of state.mail) {
    const el = document.createElement('button');
    el.className = `desk-item${entry.unread ? ' unread' : ''}`;
    el.innerHTML = `<small>${escapeHtml(entry.kind)}・${entry.day ? `D${entry.day}` : '着任日'}</small><b>${escapeHtml(entry.title)}</b><span>${escapeHtml(entry.sender)}</span>`;
    el.onclick = () => openLetter(entry);
    list.appendChild(el);
  }
}

function updateLedger() {
  $('ledger-total').textContent = money(world.treasury);
  const debt = Math.max(0, -world.treasury), limit = world.limit();
  $('credit-left').textContent = money(Math.max(0, limit - debt));
  $('credit-fill').style.width = `${Math.min(100, debt / limit * 100)}%`;
  $('ledger-rows').innerHTML = state.ledgerRows.map(row => `
    <div class="ledger-row"><small>${row.day ? `D${row.day}` : '着任'}</small><span>${escapeHtml(row.label)}${row.detail ? `<small>${escapeHtml(row.detail)}</small>` : ''}</span><b class="${row.amount >= 0 ? 'positive' : 'negative'}">${signedMoney(row.amount)}</b></div>`).join('');
}

function inventoryTotals() {
  const totals = {};
  for (const g of GOODS) {
    totals[g] = (world.stock[g] || 0) + (world.stalls[g] || []).reduce((s, item) => s + item.qty, 0) + world.hhs.reduce((s, h) => s + (h.pantry[g] || 0), 0);
  }
  return totals;
}

function updateManifest() {
  const totals = inventoryTotals();
  const max = Math.max(10, ...Object.values(totals));
  const cards = Object.entries(GOODS_VIEW).filter(([g]) => totals[g] > .5 || ['fish', 'veg', 'wheat', 'log', 'tools'].includes(g))
    .sort((a, b) => totals[b[0]] - totals[a[0]])
    .map(([g, v]) => {
      const local = world.hhs.reduce((s, h) => s + (h.pantry[g] || 0), 0);
      const market = (world.stalls[g] || []).reduce((s, x) => s + x.qty, 0);
      const port = world.stock[g] || 0;
      return `<div class="manifest-item" style="--good-color:${v.color}"><header><b>${v.name}</b><strong>${fmt(totals[g])}荷</strong></header><small>生産地 ${fmt(local)} / 市場 ${fmt(market)} / 港 ${fmt(port)}</small><div class="pile-meter"><i style="width:${Math.max(3, totals[g] / max * 100)}%"></i></div></div>`;
    }).join('');
  $('manifest-body').innerHTML = `<p>盤上の山は、空・少・中・多・満の段階で同じ在庫を示します。正確な値はこちらです。</p><div class="manifest-grid">${cards}</div>`;
}

function updateSelection() {
  const panel = $('selection');
  const sel = state.selected;
  if (!sel) { panel.hidden = true; return; }
  panel.hidden = false;
  if (sel === 'port') {
    const cargo = Object.entries(ship.cargo || {}).map(([g, q]) => `${GOODS_VIEW[g]?.name || g} ${q}荷`).join('・') || '荷役なし';
    $('selection-body').innerHTML = `<span class="tag">本土との境界</span><h3>商館・港</h3><p>${ship.label(world.day)}</p><div class="cargo-line">${cargo}</div><div class="info-grid"><div><small>会社在庫</small><b>${fmt(Object.values(world.stock).reduce((a, b) => a + b, 0))}荷</b></div><div><small>次便</small><b>${ship.daysUntil(world.day)}日</b></div></div>`;
    return;
  }
  if (sel === 'market') {
    $('selection-body').innerHTML = `<span class="tag">島内取引</span><h3>中央市場</h3><p>住民同士の売買から4%の口銭が会社へ入ります。</p><div class="info-grid"><div><small>店頭在庫</small><b>${fmt(stallTotal())}荷</b></div><div><small>市場価格</small><b>${Object.values(world.prices).reduce((n, a) => n + (a?.length ? 1 : 0), 0)}品目成立</b></div></div>`;
    return;
  }
  if (sel?.type === 'road') {
    const key = `${sel.x},${sel.y}`;
    const connected = world.roadConnected.has(key);
    const traffic = world.traffic?.[key] || 0;
    const served = [...world.hhs, ...world.zones.filter(z => !z.filled)].filter(o => o.roadEntry === key).length;
    $('selection-body').innerHTML = `<span class="tag">${connected ? '市場道路網' : '孤立路'}</span><h3>${world.paved ? '石畳' : '土の道'}</h3><p>${connected ? '中央市場まで連続しています。荷車が通行できます。' : '市場から切れています。荷車は入りません。'}</p><div class="info-grid"><div><small>通行の痕跡</small><b>${fmt(traffic)}</b></div><div><small>接道する家・区画</small><b>${served}件</b></div></div>`;
    return;
  }
  const h = sel;
  if (!world.hhs.includes(h)) { state.selected = null; panel.hidden = true; return; }
  const v = JOB_VIEW[h.job] || { name: h.job, output: null };
  const actions = { home: '仕事と暮らし', toMarket: '市場へ運搬中', atMarket: '市場で商い中', toHome: '市場から帰宅中', arriving: '港から入植地へ移動中', building: '自宅を普請中', toWork: '日傭仕事へ移動中' };
  const cargo = renderer.dominantCargo(h);
  const cargoQty = renderer.cargoQty(h);
  const members = h.members.slice(0, 5).map(m => `${m.name}${m.sex}`).join('・') + (h.members.length > 5 ? `ほか${h.members.length - 5}人` : '');
  const food = ['fish', 'veg', 'wheat', 'pres', 'pick', 'meat'].reduce((s, g) => s + (h.pantry[g] || 0), 0);
  const transport = h.roadConnected ? `手荷車・${h.haul()}荷` : `徒歩・${h.haul()}荷`;
  const distance = h.roadConnected && Number.isFinite(h.roadDistance) ? `${h.roadDistance.toFixed(1)}道程` : `${world.dist(h).toFixed(1)}区画`;
  $('selection-body').innerHTML = `<span class="tag">${escapeHtml(v.name)}</span><span class="tag">${h.roadConnected ? '接道' : '未接続'}</span><h3>${escapeHtml(h.sur)}家</h3><p>${escapeHtml(members)}</p><div class="cargo-line">${cargo ? `${GOODS_VIEW[cargo]?.name || cargo} ${fmt(cargoQty)}荷を積載・${actions[h.state] || h.state}` : actions[h.state] || h.state}</div><div class="info-grid"><div><small>住民の所持金</small><b>${money(h.purse)}</b></div><div><small>食料</small><b>約${Math.floor(food / Math.max(1, h.members.length))}日分</b></div><div><small>運搬手段</small><b>${transport}</b></div><div><small>市場まで</small><b>${distance}</b></div></div>`;
}

function financeSnapshot() {
  return {
    treasury: world.treasury,
    co: { ...world.co },
    imported: { ...world.imported },
    outPass: world.outBy.pass || 0,
  };
}

function captureFinance() {
  const next = financeSnapshot();
  const prev = state.financeSnap;
  state.financeSnap = next;
  if (!prev) return;
  const rows = [];
  const coDiff = key => (next.co[key] || 0) - (prev.co[key] || 0);
  const add = (label, value, detail = '') => { if (Math.abs(value) > .001) rows.push([label, value, detail]); };
  add('市場口銭', coDiff('fee'));
  add('本国注文の払い', coDiff('ordSell'));
  add('蔵出し売上', coDiff('stockSell'));
  add('輸出品の本国売上', coDiff('expSell'));
  add('輸出品の島内買上げ', -coDiff('expBuy'));
  add('商館の島内買上げ', -coDiff('procBuy'));
  add('区画の支度金', -coDiff('build'));
  add('道普請の日傭賃金', -coDiff('pub'));
  for (const g of Object.keys(P.IMP)) {
    const q = (next.imported[g] || 0) - (prev.imported[g] || 0);
    if (q > .001) {
      add(`${GOODS_VIEW[g]?.name || g}の本国仕入`, -q * P.IMP_COST[g], `輸入 ${q.toFixed(1)}荷`);
      add(`${GOODS_VIEW[g]?.name || g}の島内販売`, q * P.IMP[g], `輸入品を住民へ`);
    }
  }
  add('移民の渡航費', -(next.outPass - prev.outPass));
  let accounted = rows.reduce((s, row) => s + row[1], 0);
  const actual = next.treasury - prev.treasury;
  add(actual - accounted < -.001 ? '債務利息・その他支出' : '帳尻調整', actual - accounted);
  for (const [label, amount, detail] of rows) addLedger(label, amount, world.day, detail);
  if (Math.abs(actual) > .01) {
    $('money-delta').textContent = `${actual >= 0 ? '直近 ＋' : '直近 －'}${money(Math.abs(actual))}`;
    $('money-delta').className = actual >= 0 ? 'positive' : 'negative';
  }
}

function processWorldEvents() {
  for (let i = state.lastEvent; i < world.events.length; i++) {
    const [day, msg] = world.events[i];
    const text = localizeEvent(msg);
    if (/☠|破綻|期限切れ/.test(msg)) toast(`<b>島からの報告</b><br>${escapeHtml(text)}`, 'expense');
    else if (/▲Lv|家が建った|道が一区画|注文を納めた/.test(msg)) toast(`<b>島からの報告</b><br>${escapeHtml(text)}`, 'income');
    else if (/入植船|分かれて/.test(msg)) toast(`<b>新しい住民</b><br>${escapeHtml(text)}`);
  }
  state.lastEvent = world.events.length;
  if (world.order && world.order !== state.lastOrder) {
    const g = world.order.g;
    addMail({
      kind: '本国注文状', title: `${GOODS_VIEW[g]?.name || g} ${Math.round(world.order.qty)}荷を求む`,
      body: `期限は90日。単価 ${money(world.order.price)}。商館在庫から納めた分に、本国払いが行われる。`,
      elena: '「これは輸出です。荷を渡せば会社資金は増えます。ただし、島で必要な在庫まで渡すかは別の問題です」',
      finance: [{ label: '全量を納めた場合', value: world.order.qty * world.order.price * 1.25 }, { label: '現在の会社資金', value: world.treasury }],
    });
    toast(`<b>本国注文状が届きました</b><br>${GOODS_VIEW[g]?.name || g}を本国へ渡すと会社資金が増えます。`);
    setAdvisor('本国注文は輸出です。納めれば会社資金が増えます。島の在庫が減ることも、同じ欄で確認してください。', 12);
  }
  state.lastOrder = world.order;
}

function localizeEvent(message) {
  let text = message;
  for (const [job, view] of Object.entries(JOB_VIEW)) text = text.replaceAll(`${job}#`, `${view.name} `).replaceAll(`(${job})`, `（${view.name}）`);
  return text;
}

function updateObjective() {
  while (state.objective < OBJECTIVES.length - 1 && OBJECTIVES[state.objective].done()) {
    state.objective++;
    const next = OBJECTIVES[state.objective];
    toast(`<b>航海日誌を更新</b><br>${escapeHtml(next.title)}`, 'income');
    if (state.objective === OBJECTIVES.length - 1) {
      addMail({
        kind: '島内報告', title: '会社の店から、島の市場へ', sender: 'エレナ・ヴァンス',
        body: '住民同士の取引と地元の生産が、本国から届く品を置き換え始めた。第一章の目標を達成した。',
        elena: '「本国はこれを“採算改善”と呼ぶでしょう。私は、島が自分の足で立ち始めた、と記録します」',
        finance: [{ label: '現在の会社資金', value: world.treasury }],
      });
      setAdvisor('第一章は達成です。船はこれからも来て、帰ります。次は本国注文と鉄の輸入を、島の産業へ置き換えていきましょう。', 20);
    }
    renderTools();
  }
  const obj = OBJECTIVES[state.objective];
  $('objective-title').textContent = obj.title;
  $('objective-detail').textContent = obj.detail;
  $('objective-progress').firstElementChild.style.width = `${Math.round(obj.progress() * 100)}%`;
  const rec = obj.recommend;
  if (rec && !TOOL_DEFS.some(t => t.category === state.category && t.id === rec)) {
    // 推奨が別カテゴリでもタブを強制変更せず、プレイヤーの現在操作を守る。
  }
}

function updateAdvisorDefault() {
  if (performance.now() < state.recentAdvisorUntil) return;
  const obj = OBJECTIVES[state.objective];
  const debt = Math.max(0, -world.treasury), ratio = debt / world.limit();
  if (world.goDay) return setAdvisor('本国は勅許を別の名義へ移すそうです。それでも島は残ります。次の支配人へ、記録を渡しましょう。', 60);
  if (ratio > .55) return setAdvisor('債務が信用限度の半分を越えました。会社帳簿の赤い行を見て、建設の手を少し緩める頃合いです。', 6);
  if (world.hungryN > 0) return setAdvisor(`${world.hungryN}世帯で食卓が足りません。どこに食料が積まれ、どこへ届いていないか、現物台帳と荷車をご覧ください。`, 6);
  const lines = {
    fisher: '浜の近くに漁師の区画を二つ。魚は貯めにくいぶん、毎日の市場を動かします。',
    veg: '菜園は早く、麦は遅く実ります。両方を同時に始めると、待つ時間が仕事に変わります。',
    logger: '木こりは森の際、木工房は市場寄り。丸太を運ぶ距離が、そのまま木製品の重さになります。',
    road: '既設道を始点に、雑木林へ向けて引いてください。接続した家だけが、徒歩の4倍を積む手荷車を使えます。',
  };
  $('advisor-line').textContent = lines[obj.recommend] || '数字だけでなく、消えかけた荷の山と、遠回りする荷車をご覧ください。島は盤面で先に困り始めます。';
}

function updateHud() {
  const monthIndex = Math.floor(Math.max(0, world.day - 1) / 30);
  const month = monthIndex % 12 + 1, year = Math.floor(monthIndex / 12) + 1;
  $('date-value').textContent = `${year}年目 ${month}月`;
  $('money-value').textContent = money(world.treasury);
  $('money-value').style.color = world.treasury < 0 ? '#ff9b86' : '';
  $('pop-value').textContent = fmt(world.pop());
  const totals = inventoryTotals();
  const food = ['fish', 'veg', 'wheat', 'pres', 'pick', 'meat'].reduce((s, g) => s + totals[g], 0);
  const days = world.pop() ? Math.floor(food / world.pop()) : 0;
  $('food-value').textContent = world.pop() ? `${days}日分` : '—';
  $('food-sub').textContent = world.hungryN ? `${world.hungryN}世帯不足` : world.pop() ? '島内合計' : '入植待ち';
  $('ship-value').textContent = ship.state === 'away' ? `${ship.daysUntil(world.day)}日` : ship.state === 'docked' ? '停泊中' : ship.state === 'arriving' ? '入港中' : '出港中';
  $('ship-state').textContent = ship.label(world.day);
  updateObjective();
  updateAdvisorDefault();
  updateSelection();
  if (!$('ledger').hidden) updateLedger();
  if (!$('manifest').hidden) updateManifest();
}

function simulationStep(dt) {
  const rates = [0, 15, 45, 120];
  state.accumulator += dt * rates[state.speed];
  let guard = 0;
  while (state.accumulator >= 1 && guard++ < 16) {
    world.tickOnce();
    state.accumulator--;
  }
  if (guard >= 16) state.accumulator = 0;
  if (world.day !== state.lastDay) {
    captureFinance();
    state.lastDay = world.day;
    processWorldEvents();
    updateObjective();
  }
}

function frame(now) {
  const dt = Math.min(.08, (now - state.lastFrame) / 1000);
  state.lastFrame = now;
  if (state.running) simulationStep(dt);
  ship.update(dt, world.day);
  renderer.draw({
    ship: ship.getPosition(), hover: state.hover, tool: state.tool,
    placementOk: state.placementOk, selected: state.selected, roadPreview: state.roadPreview, roadAnchor: state.roadAnchor,
  });
  if (now - state.lastUi > 240) {
    updateHud();
    state.lastUi = now;
    if (world.goDay && $('failure').hidden) { setSpeed(0); $('failure').hidden = false; }
  }
  requestAnimationFrame(frame);
}

addEventListener('resize', () => renderer.resize());

buildToolbar();
setupInput();
setupUiActions();
state.financeSnap = financeSnapshot();
updateHud();
updateDesk();
requestAnimationFrame(frame);

window.__CHARTER__ = {
  world,
  state,
  renderer,
  ship,
  placeBuilding,
  planRoadLine,
  removeRoadLine,
  buildRoadPreview,
  snapRoadEnd,
  setSpeed,
  updateHud,
};

console.info(`CHARTER ISLE v002 / ${VERSION}`);
