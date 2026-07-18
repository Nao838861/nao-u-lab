import {
  BUILDINGS, BUILD_TOOLS, FIXED, GOODS, GRADE_NAMES, TUTORIAL, VERSION,
} from './config.js';
import { Renderer } from './render.js';
import { World } from './world.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const formatNumber = value => Math.round(value).toLocaleString('ja-JP');
const signed = value => `${value >= 0 ? '＋' : '−'}${formatNumber(Math.abs(value))}`;

const canvas = $('#world');
const world = new World();
const renderer = new Renderer(canvas, world);

const state = {
  category: 'roads',
  tool: null,
  roadAnchor: null,
  roadDragStart: null,
  pointerTile: null,
  pointers: new Map(),
  dragMoved: false,
  panLast: null,
  pinch: null,
  selectedId: null,
  tutorial: 0,
  lastTutorial: -1,
  uiTimer: 0,
  selectionTimer: 0,
  trackedId: null,
  trackingReturn: null,
  modalSavedSpeed: null,
  completedLetterShown: false,
  warehouseViewed: false,
  mail: [
    {
      id: 'charter', day: 1, unread: false, important: true,
      kicker: '勅許会社・第一便指図書', title: '最初の一荷',
      summary: '森から港まで、木製品の流れを一本通す。',
      body: '本国は木製品の出荷を求めています。森で木を伐り、道を通し、工房で仕立て、港へ運ぶ。その一荷を最初から最後まで確認してください。会社は結果だけを見ますが、島を動かすのは途中の流れです。',
      signature: '勅許会社 植民地部',
    },
  ],
};

function toast(title, text = '', tone = '') {
  const item = document.createElement('div');
  item.className = `toast ${tone}`;
  item.innerHTML = `<b>${title}</b>${text}`;
  $('#toast-stack').append(item);
  setTimeout(() => item.remove(), 4300);
}

function toolUnlocked(id) {
  if (id === 'road') return true;
  if (id === 'logger') return state.tutorial >= 1;
  if (id === 'woodshop') return state.tutorial >= 3;
  if (id === 'warehouse') return state.tutorial >= 8;
  return false;
}

function renderBuildTools() {
  const tools = BUILD_TOOLS.filter(tool => tool.category === state.category);
  $('#build-tools').innerHTML = tools.map(tool => {
    const unlocked = toolUnlocked(tool.id);
    const cost = typeof tool.cost === 'number' ? formatNumber(tool.cost) : tool.cost;
    return `<button class="build-tool ${state.tool === tool.id ? 'on' : ''} ${unlocked ? '' : 'locked'}" data-tool="${tool.id}" ${unlocked ? '' : 'disabled'}>
      <span class="icon">${tool.icon}</span><span><b>${tool.name}</b><small>${unlocked ? cost : '第一章で解禁'}</small></span>
    </button>`;
  }).join('');
  $('#cancel-tool').hidden = !state.tool;
  canvas.classList.toggle('tool-active', Boolean(state.tool));
}

function selectTool(tool) {
  if (!toolUnlocked(tool)) return;
  state.tool = state.tool === tool ? null : tool;
  state.roadAnchor = null;
  state.roadDragStart = null;
  renderer.roadPreview = null;
  renderer.preview = null;
  renderBuildTools();
  if (state.tool === 'road') setToolHint('完成した道を一度押し、次に終点を押します。ドラッグでも引けます。', true);
  else if (state.tool) setToolHint(`${BUILDINGS[state.tool].name}は完成道路に接する場所へ置きます。`, true);
  else hideToolHint();
}

function setCategory(category) {
  state.category = category;
  $$('.dock-tabs button').forEach(button => button.classList.toggle('on', button.dataset.category === category));
  if (state.tool && !BUILD_TOOLS.some(tool => tool.id === state.tool && tool.category === category)) {
    state.tool = null;
    state.roadAnchor = null;
    renderer.preview = null;
    renderer.roadPreview = null;
  }
  renderBuildTools();
}

function setToolHint(message, ok = null) {
  const hint = $('#tool-hint');
  hint.hidden = false;
  hint.textContent = message;
  hint.classList.toggle('ok', ok === true);
  hint.classList.toggle('bad', ok === false);
}

function hideToolHint() {
  $('#tool-hint').hidden = true;
}

function dynamicObjectiveDetail() {
  const step = state.tutorial;
  const logger = world.getBuildingByType('logger');
  const woodshop = world.getBuildingByType('woodshop');
  const port = world.getBuildingByType('port');
  if (step === 0) {
    const connected = world.connectedRoadSet().has(`${FIXED.forestGate.x},${FIXED.forestGate.y}`);
    return connected ? '森まで道が繋がりました。' : TUTORIAL[step].detail;
  }
  if (step === 2 && logger) {
    const amount = world.sectionAmount(logger, 'output', 'log');
    const capacity = world.sectionCapacity(logger, 'output', 'log');
    return amount > 0 ? `出荷場に丸太${amount}/${capacity}。次は加工先を用意します。` : `伐採中 ${Math.min(99, Math.round(logger.progress / BUILDINGS.logger.interval * 100))}% — 丸太は道路側の出荷場へ積まれます。`;
  }
  if (step === 4) {
    const shipment = world.shipments.find(item => item.good === 'log' && item.targetId === woodshop?.id);
    if (shipment) return `丸太${shipment.amount}を運搬中。荷車は${shipment.path.length}区画の完成道路を走っています。`;
    if (woodshop && world.sectionAmount(woodshop, 'input', 'log') === 0) return '木こりの出荷場から荷車を手配中です。道が途切れている場合は両方の入口を確認してください。';
  }
  if (step === 5 && woodshop) {
    const boards = world.sectionAmount(woodshop, 'output', 'boards');
    if (!woodshop.upgradeRequested) return `木工房の出荷場: 木製品${boards}/4。4以上になったら木工房を選び「増築を予約」します。`;
    const status = world.statusOf(woodshop);
    return `${status.label} — ${status.detail}`;
  }
  if (step === 6) {
    const boards = world.sectionAmount(port, 'outbound', 'boards');
    return boards > 0 ? `港の輸出ヤードに木製品${boards}。次の船がここから積みます。` : '木製品を積んだ荷車が港へ向かいます。市場を経由する必要はありません。';
  }
  if (step === 7) {
    if (world.ship.state === 'away') return `港に木製品${world.sectionAmount(port, 'outbound', 'boards')}。定期船まであと${world.daysToShip()}日です。`;
    if (world.ship.state === 'loading') return `船積み中。輸出ヤードの山が減った分だけ、会社資金が増えます。`;
    return `船は${world.statusOf(port).label}です。木製品は輸出ヤードで待っています。`;
  }
  return TUTORIAL[step]?.detail || '';
}

function renderObjective() {
  const step = TUTORIAL[state.tutorial] || TUTORIAL.at(-1);
  $('#objective-title').textContent = step.title;
  $('#objective-detail').textContent = dynamicObjectiveDetail();
  $('#objective-count').textContent = `${Math.min(11, state.tutorial + 1)} / 11`;
  $('#objective-fill').style.width = `${Math.min(100, state.tutorial / 10 * 100)}%`;
  $('#advisor-line').textContent = step.advisor;

  const actions = [];
  if (state.tutorial === 0) actions.push({ id: 'pick-road', label: '道を選ぶ' });
  if (state.tutorial === 1) actions.push({ id: 'pick-logger', label: '木こりを選ぶ' });
  if (state.tutorial === 3) actions.push({ id: 'pick-woodshop', label: '木工房を選ぶ' });
  if (state.tutorial === 4) {
    const shipment = world.shipments.find(item => item.good === 'log');
    if (shipment) actions.push({ id: 'track-log', label: '丸太の荷を追う' });
    else actions.push({ id: 'focus-logger', label: '木こりを見る' });
  }
  if (state.tutorial === 5) actions.push({ id: 'focus-woodshop', label: '木工房を見る' });
  if (state.tutorial === 6 || state.tutorial === 7) actions.push({ id: 'focus-port', label: '港を見る' });
  if (state.tutorial === 9) actions.push({ id: 'focus-warehouse', label: '倉庫を見る' });
  $('#objective-actions').innerHTML = actions.map(action => `<button data-objective-action="${action.id}">${action.label}</button>`).join('');
}

function updateTutorial() {
  let advanced = false;
  while (state.tutorial < 10 && world.tutorialComplete(state.tutorial, state)) {
    state.tutorial++;
    world.setChapterStage(state.tutorial);
    advanced = true;
  }
  if (!advanced) return;
  const step = TUTORIAL[state.tutorial];
  toast('航海日誌を更新', step.title, 'good');
  if (state.tutorial === 1) setCategory('production');
  if (state.tutorial === 3) setCategory('production');
  if (state.tutorial === 10) completeChapter();
  renderObjective();
  renderBuildTools();
}

function completeChapter() {
  if (state.completedLetterShown) return;
  state.completedLetterShown = true;
  const mail = {
    id: 'chapter-one', day: Math.floor(world.day), unread: true, important: true,
    kicker: '本国回答・第一章達成', title: '会社の数字に、島の道筋を',
    summary: '木製品の初輸出を確認。倉庫と上位増築を許可。',
    body: `木製品の初荷を確認しました。入金額は${formatNumber(world.stats.exported.boards * 12)}。本国は量の増加を求めています。中継倉庫の建設と、工具・切石を用いた上位増築を許可します。なお、費用は当然ながら島側負担です。`,
    signature: '勅許会社 植民地部 監査官',
  };
  state.mail.unshift(mail);
  openLetter(mail, true);
  setCategory('logistics');
}

function renderHud() {
  const recent = world.recentMoney(7);
  $('#funds-value').textContent = formatNumber(world.funds);
  $('#income-value').textContent = `＋${formatNumber(recent.income)}`;
  $('#expense-value').textContent = `−${formatNumber(recent.expense)}`;
  $('#day-value').textContent = `${Math.floor(world.day)}日目`;
  const shipLabels = {
    docked: '停泊中', unloading: '荷揚げ中', loading: '船積み中',
    departing: '出港中', arriving: '入港中', away: `${world.daysToShip()}日`,
  };
  $('#ship-value').textContent = shipLabels[world.ship.state] || '—';
  $('#ship-detail').textContent = world.ship.state === 'away' ? '次の定期便' : world.statusOf(world.getBuildingByType('port')).label;
  $$('#speed-controls button').forEach(button => button.classList.toggle('on', Number(button.dataset.speed) === world.speedIndex));
  const unread = state.mail.filter(mail => mail.unread).length;
  $('#mail-count').hidden = unread === 0;
  $('#mail-count').textContent = unread;
  $('#advisor-wax').hidden = unread === 0;
}

function roleName(section) {
  return {
    input: '入荷棚 — 空なら原料不足',
    output: '出荷場 — 満杯なら搬出停滞',
    storage: '保管枠',
    construction: '増築材置き場',
    inbound: '輸入ヤード — 本国から島へ',
    outbound: '輸出ヤード — 島から本国へ',
  }[section] || section;
}

function inventoryRows(building, section) {
  const caps = building.caps?.[section] || {};
  const goods = Object.keys(caps);
  if (!goods.length) return '';
  const roleClass = section === 'output' || section === 'outbound' ? 'out' : section === 'construction' ? 'construct' : '';
  return `<section class="inventory-section"><h3>${roleName(section)}</h3>${goods.map(good => {
    const amount = world.sectionAmount(building, section, good);
    const incoming = world.incomingAmount(building.id, section, good);
    const cap = world.sectionCapacity(building, section, good);
    const pct = Math.min(100, amount / Math.max(1, cap) * 100);
    return `<div class="inventory-row ${roleClass}"><span>${GOODS[good].name}${incoming ? ` <small>＋${incoming}運搬中</small>` : ''}</span><i class="bar"><i style="width:${pct}%"></i></i><b>${formatNumber(amount)} / ${formatNumber(cap)}</b></div>`;
  }).join('')}</section>`;
}

function renderSelection() {
  if (!state.selectedId || $('#selection').hidden) return;
  const building = world.getBuilding(state.selectedId);
  if (!building) return closeSheet('selection');
  const def = BUILDINGS[building.type];
  const status = world.statusOf(building);
  $('#selection-kicker').textContent = building.fixed ? '島の施設' : `等級${building.grade}・${GRADE_NAMES[building.grade]}`;
  $('#selection-title').textContent = def.name;
  renderer.selectedId = building.id;

  const grade = building.fixed ? '' : `
    <div class="grade-caption"><span>現在 等級${building.grade}・${GRADE_NAMES[building.grade]}</span><span>最高 等級4</span></div>
    <div class="grade-line">${[0,1,2,3,4].map(level => `<i class="${level <= building.grade ? 'on' : ''}"></i>`).join('')}</div>`;
  const inventories = ['input', 'output', 'storage', 'construction', 'inbound', 'outbound'].map(section => inventoryRows(building, section)).join('');
  const requirements = world.nextUpgradeRequirements(building);
  let upgrade = '';
  if (requirements) {
    const requirementRows = Object.entries(requirements).map(([good, need]) => {
      const have = world.sectionAmount(building, 'construction', good);
      const incoming = world.incomingAmount(building.id, 'construction', good);
      return `<span class="requirement ${have >= need ? 'done' : ''}">${GOODS[good].name} ${formatNumber(have)}${incoming ? `＋${incoming}` : ''}/${need}</span>`;
    }).join('');
    upgrade = `<section class="upgrade-box"><h3>次の増築</h3><div class="upgrade-preview"><span class="grade-sketch">⌂</span><span><b>等級${building.grade + 1}・${GRADE_NAMES[building.grade + 1]}</b><small>外見と生産速度、在庫容量が恒久的に向上</small></span></div><div class="requirements">${requirementRows}</div><button class="sheet-action" data-selection-action="upgrade" ${building.upgradeRequested ? 'disabled' : ''}>${building.upgradeRequested ? status.label : '増築を予約'}</button></section>`;
  }
  const shipment = world.shipments.find(item => item.sourceId === building.id || item.targetId === building.id);
  const track = shipment ? `<button class="sheet-action secondary" data-selection-action="track" data-shipment="${shipment.id}">${GOODS[shipment.good].name}${shipment.amount}の荷を追う</button>` : '';
  const portNote = building.type === 'port' ? '<p class="sheet-note">船が輸出ヤードから荷を取るたびに収入が発生します。輸入品は荷揚げされた後で初めて島の在庫になります。</p>' : '';
  $('#selection-body').innerHTML = `
    <div class="building-state"><b class="${status.tone}">${status.label}</b><span>${status.detail}</span></div>
    ${grade}<p class="sheet-note">${def.description}</p>${portNote}${inventories || '<div class="empty-inventory">この施設に固定在庫枠はありません。</div>'}${upgrade}${track}
    <button class="sheet-action secondary" data-selection-action="manifest">島全体の現物台帳を見る</button>`;
}

function selectBuilding(building) {
  if (!building) return;
  state.selectedId = building.id;
  if (building.type === 'warehouse' && state.tutorial === 9) {
    state.warehouseViewed = true;
    updateTutorial();
  }
  renderer.selectedId = building.id;
  $('#selection').hidden = false;
  renderSelection();
}

function closeSheet(id) {
  const sheet = $(`#${id}`);
  if (sheet) sheet.hidden = true;
  if (id === 'selection') {
    state.selectedId = null;
    renderer.selectedId = null;
  }
  if (id === 'letter-view' && state.modalSavedSpeed !== null) {
    world.setSpeed(state.modalSavedSpeed);
    state.modalSavedSpeed = null;
  }
}

function renderLedger() {
  const recent = world.recentMoney(7);
  $('#ledger-funds').textContent = formatNumber(world.funds);
  $('#ledger-income').textContent = `＋${formatNumber(recent.income)}`;
  $('#ledger-expense').textContent = `−${formatNumber(recent.expense)}`;
  $('#ledger-rows').innerHTML = world.ledger.length ? world.ledger.map(row => `
    <div class="ledger-row"><time>${row.day}日</time><span>${row.reason}</span><b class="${row.amount >= 0 ? 'plus' : 'minus'}">${signed(row.amount)}</b></div>`).join('') : '<p class="sheet-note">まだ取引はありません。</p>';
}

function openLedger() {
  renderLedger();
  $('#ledger').hidden = false;
}

function renderManifest() {
  const sections = ['input', 'output', 'storage', 'construction', 'inbound', 'outbound'];
  $('#manifest-body').innerHTML = world.buildings.map(building => {
    const rows = [];
    for (const section of sections) {
      for (const good of Object.keys(building.caps?.[section] || {})) {
        const amount = world.sectionAmount(building, section, good);
        const incoming = world.incomingAmount(building.id, section, good);
        rows.push(`<div><span>${roleName(section)}・${GOODS[good].name}</span><b>${formatNumber(amount)}${incoming ? `（＋${incoming}運搬中）` : ''}</b></div>`);
      }
    }
    return `<section class="manifest-place"><h3>${BUILDINGS[building.type].name}</h3>${rows.join('') || '<div><span>現物在庫なし</span><b>0</b></div>'}</section>`;
  }).join('');
}

function openManifest() {
  renderManifest();
  $('#manifest').hidden = false;
}

function renderDesk() {
  $('#desk-list').innerHTML = state.mail.map(mail => `
    <button class="mail-card ${mail.unread ? 'unread' : ''}" data-mail="${mail.id}"><small>${mail.kicker}・${mail.day}日</small><b>${mail.title}</b><p>${mail.summary}</p></button>`).join('');
}

function openDesk() {
  renderDesk();
  $('#desk').hidden = false;
}

function openLetter(mail, forced = false) {
  if (!mail) return;
  mail.unread = false;
  if (forced && state.modalSavedSpeed === null) {
    state.modalSavedSpeed = world.speedIndex;
    world.setSpeed(0);
  }
  $('#letter-body').innerHTML = `<small>${mail.kicker}</small><h1>${mail.title}</h1><p>${mail.body}</p><p class="signature">${mail.signature}</p>`;
  $('#letter-view').hidden = false;
  renderHud();
  renderDesk();
}

function focusBuilding(type) {
  const building = world.getBuildingByType(type);
  if (!building) return;
  renderer.focus(building.x + building.w / 2, building.y + building.h / 2, true);
  selectBuilding(building);
}

function startTracking(shipment) {
  if (!shipment) return;
  if (state.trackedId) stopTracking(false);
  state.trackedId = shipment.id;
  state.trackingReturn = { panX: renderer.panX, panY: renderer.panY, zoom: renderer.zoom, speed: world.speedIndex };
  renderer.trackedShipmentId = shipment.id;
  renderer.followTracking = true;
  world.setSpeed(1);
  const source = world.getBuilding(shipment.sourceId);
  const target = world.getBuilding(shipment.targetId);
  $('#tracking-label').textContent = `${GOODS[shipment.good].name} ${shipment.amount}`;
  $('#tracking-route').textContent = `${BUILDINGS[source.type].name} → ${BUILDINGS[target.type].name}`;
  $('#tracking').hidden = false;
  renderHud();
}

function stopTracking(arrived = false) {
  if (!state.trackedId) return;
  const saved = state.trackingReturn;
  state.trackedId = null;
  state.trackingReturn = null;
  renderer.trackedShipmentId = null;
  renderer.followTracking = false;
  $('#tracking').hidden = true;
  if (saved) {
    renderer.panX = saved.panX;
    renderer.panY = saved.panY;
    renderer.zoom = saved.zoom;
    world.setSpeed(saved.speed);
  }
  if (arrived) toast('荷が届きました', '元の場所と時間速度へ戻りました。', 'good');
}

function addPortReport() {
  if (state.mail.some(mail => mail.id === `arrival-${Math.floor(world.day)}`)) return;
  const mail = {
    id: `arrival-${Math.floor(world.day)}`, day: Math.floor(world.day), unread: true, important: false,
    kicker: '港湾報告', title: '定期便が入港',
    summary: '輸入品を荷揚げし、輸出ヤードの木製品を積みます。',
    body: '定期便が接岸しました。本国からの食料、工具、切石は、荷揚げされた分から輸入費用が発生します。木製品は港の輸出ヤードにある分だけ船積みされます。通常の入港では島を見る手を止めません。',
    signature: '港湾係・エレナ確認済み',
  };
  state.mail.unshift(mail);
  renderHud();
}

function handleWorldEvents() {
  for (const event of world.drainEvents()) {
    const { type, detail } = event;
    if (type === 'ship_arriving') {
      toast('定期船が見えました', 'カメラは動かしていません。港を見る場合は上の定期船表示を押してください。');
      addPortReport();
    }
    if (type === 'ship_docked') toast('定期船が接岸', '輸入品を先に降ろし、その後で輸出品を積みます。');
    if (type === 'grade_up') {
      const building = world.getBuilding(detail.buildingId);
      toast(`${BUILDINGS[building.type].name}が等級${detail.grade}へ`, `${GRADE_NAMES[detail.grade]}になりました。外見と働き方が恒久的に向上します。`, 'good');
    }
    if (type === 'building_added') {
      const building = world.getBuilding(detail.buildingId);
      toast(`${BUILDINGS[detail.type].name}を開設`, `等級0・${GRADE_NAMES[0]}から仕事を始めます。`, 'good');
      selectBuilding(building);
    }
    if (type === 'shipment_started' && detail.good === 'log' && state.tutorial === 4) {
      toast('丸太の荷車が出発', '「丸太の荷を追う」で、完成道路上の経路を確認できます。', 'good');
    }
    if (type === 'ship_loaded') toast('木製品を輸出', `港の山から${detail.amount}を積み、会社資金へ＋${formatNumber(detail.amount * 12)}。`, 'good');
  }
}

function tryPlaceBuilding(tile) {
  const result = world.addBuilding(state.tool, tile.x, tile.y);
  if (!result.ok) {
    setToolHint(result.reason, false);
    toast('ここには置けません', result.reason, 'bad');
    return;
  }
  renderer.preview = null;
  state.tool = null;
  renderBuildTools();
  hideToolHint();
}

function tryBuildRoad(start, end) {
  const result = world.addRoadLine(start, end);
  if (!result.ok) {
    setToolHint(result.reason, false);
    return false;
  }
  renderer.roadPreview = null;
  state.roadAnchor = null;
  setToolHint(`${result.newCells.length}区画の道が完成。支出 −${formatNumber(result.cost)}。`, true);
  return true;
}

function updatePointerPreview(tile) {
  state.pointerTile = tile;
  if (!state.tool) return;
  if (state.tool === 'road') {
    const start = state.roadAnchor || state.roadDragStart;
    if (!start) return;
    const preview = world.roadPreview(start, tile);
    renderer.roadPreview = preview;
    if (start.x === tile.x && start.y === tile.y && !state.roadAnchor) return;
    setToolHint(preview.ok ? `${preview.newCells.length}区画・支出 −${formatNumber(preview.cost)}。終点で確定します。` : preview.reason, preview.ok);
  } else {
    const check = world.canPlace(state.tool, tile.x, tile.y);
    renderer.preview = { tool: state.tool, x: tile.x, y: tile.y, check };
    setToolHint(check.ok ? `${BUILDINGS[state.tool].name}を開設・支出 −${formatNumber(BUILDINGS[state.tool].cost)}。` : check.reason, check.ok);
  }
}

function localPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

canvas.addEventListener('pointerdown', event => {
  const point = localPoint(event);
  state.pointers.set(event.pointerId, point);
  canvas.setPointerCapture(event.pointerId);
  if (state.pointers.size === 2) {
    const points = [...state.pointers.values()];
    state.pinch = { distance: Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y), zoom: renderer.zoom };
    return;
  }
  state.dragMoved = false;
  state.panLast = point;
  if (!state.tool) canvas.classList.add('map-dragging');
  const tile = renderer.tileAt(point.x, point.y);
  if (state.tool === 'road') {
    state.roadDragStart = state.roadAnchor || tile;
    updatePointerPreview(tile);
  }
});

canvas.addEventListener('pointermove', event => {
  // pointerupを取り逃がしても、ボタンを押していないマウス移動で
  // カメラが追従し続けないように押下状態を正本にする。
  if (event.pointerType === 'mouse' && event.buttons === 0) {
    const point = localPoint(event);
    state.pointers.delete(event.pointerId);
    state.panLast = null;
    state.dragMoved = false;
    canvas.classList.remove('map-dragging');
    // 建設モードでは、押していない hover でも設置予定地を更新する。
    if (state.tool) updatePointerPreview(renderer.tileAt(point.x, point.y));
    return;
  }
  const point = localPoint(event);
  const previous = state.pointers.get(event.pointerId);
  state.pointers.set(event.pointerId, point);
  if (state.pointers.size === 2 && state.pinch) {
    const points = [...state.pointers.values()];
    const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    const mid = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
    renderer.zoomAt(distance / Math.max(1, state.pinch.distance), mid.x, mid.y);
    state.pinch.distance = distance;
    return;
  }
  const moveDistance = previous ? Math.hypot(point.x - previous.x, point.y - previous.y) : 0;
  if (moveDistance > 5) state.dragMoved = true;
  if (!state.tool && state.panLast && state.pointers.size === 1 && state.dragMoved) {
    renderer.pan(point.x - state.panLast.x, point.y - state.panLast.y);
  }
  state.panLast = point;
  updatePointerPreview(renderer.tileAt(point.x, point.y));
});

canvas.addEventListener('pointerup', event => {
  const point = localPoint(event);
  const tile = renderer.tileAt(point.x, point.y);
  const hadPinch = state.pointers.size > 1;
  state.pointers.delete(event.pointerId);
  if (hadPinch) {
    state.pinch = null;
    state.panLast = null;
    return;
  }

  if (state.tool === 'road') {
    const dragStart = state.roadDragStart;
    const moved = dragStart && (dragStart.x !== tile.x || dragStart.y !== tile.y);
    if (state.roadAnchor) {
      tryBuildRoad(state.roadAnchor, tile);
    } else if (moved && state.dragMoved) {
      tryBuildRoad(dragStart, tile);
    } else if (world.connectedRoadSet().has(`${tile.x},${tile.y}`)) {
      state.roadAnchor = tile;
      setToolHint('始点を決めました。終点を押すか、そこまでドラッグしてください。', true);
    } else {
      setToolHint('町や港へ繋がる完成道路を始点にしてください。', false);
    }
    state.roadDragStart = null;
    renderer.roadPreview = null;
  } else if (state.tool && !state.dragMoved) {
    tryPlaceBuilding(tile);
  } else if (!state.tool && !state.dragMoved) {
    const building = world.buildingAt(tile.x, tile.y);
    if (building) selectBuilding(building);
  }
  state.panLast = null;
  canvas.classList.remove('map-dragging');
});

canvas.addEventListener('pointercancel', event => {
  state.pointers.delete(event.pointerId);
  state.panLast = null;
  state.pinch = null;
  state.roadDragStart = null;
  canvas.classList.remove('map-dragging');
});

function clearPointerState() {
  state.pointers.clear();
  state.panLast = null;
  state.dragMoved = false;
  state.pinch = null;
  state.roadDragStart = null;
  canvas.classList.remove('map-dragging');
}

window.addEventListener('pointerup', event => {
  if (event.pointerType === 'mouse' && event.buttons === 0) clearPointerState();
});
window.addEventListener('blur', clearPointerState);

canvas.addEventListener('wheel', event => {
  event.preventDefault();
  // Macのトラックパッドの通常スクロールでは島を動かさない。
  if (!event.metaKey && !event.ctrlKey) return;
  const point = localPoint(event);
  renderer.zoomAt(event.deltaY < 0 ? 1.1 : 0.9, point.x, point.y);
}, { passive: false });

$('#build-tools').addEventListener('click', event => {
  const button = event.target.closest('[data-tool]');
  if (button && !button.disabled) selectTool(button.dataset.tool);
});

$('.dock-tabs').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (button) setCategory(button.dataset.category);
});

$('#cancel-tool').addEventListener('click', () => selectTool(state.tool));

$('#objective-actions').addEventListener('click', event => {
  const action = event.target.closest('[data-objective-action]')?.dataset.objectiveAction;
  if (!action) return;
  if (action === 'pick-road') { setCategory('roads'); selectTool('road'); }
  if (action === 'pick-logger') { setCategory('production'); selectTool('logger'); renderer.focus(FIXED.suggestedLogger.x + 1.5, FIXED.suggestedLogger.y + 1.5, true); }
  if (action === 'pick-woodshop') { setCategory('production'); selectTool('woodshop'); renderer.focus(FIXED.suggestedWoodshop.x + 1.5, FIXED.suggestedWoodshop.y + 1.5, true); }
  if (action === 'track-log') startTracking(world.shipments.find(item => item.good === 'log'));
  if (action === 'focus-logger') focusBuilding('logger');
  if (action === 'focus-woodshop') focusBuilding('woodshop');
  if (action === 'focus-port') focusBuilding('port');
  if (action === 'focus-warehouse') focusBuilding('warehouse');
});

$('#selection-body').addEventListener('click', event => {
  const action = event.target.closest('[data-selection-action]')?.dataset.selectionAction;
  if (!action) return;
  const building = world.getBuilding(state.selectedId);
  if (action === 'upgrade') {
    const result = world.requestUpgrade(building.id);
    if (!result.ok) toast('増築できません', result.reason, 'bad');
    else toast('増築材を予約', '島内の実在庫から、完成道路を通って工事置き場へ運びます。');
    renderSelection();
  }
  if (action === 'track') {
    const id = event.target.closest('[data-shipment]')?.dataset.shipment;
    startTracking(world.shipments.find(item => item.id === id));
  }
  if (action === 'manifest') openManifest();
});

$('#desk-list').addEventListener('click', event => {
  const id = event.target.closest('[data-mail]')?.dataset.mail;
  if (id) openLetter(state.mail.find(mail => mail.id === id), false);
});

$$('[data-close]').forEach(button => button.addEventListener('click', () => closeSheet(button.dataset.close)));
$('#open-ledger').addEventListener('click', openLedger);
$('#open-desk').addEventListener('click', openDesk);
$('#open-desk-top').addEventListener('click', openDesk);
$('#focus-port').addEventListener('click', () => focusBuilding('port'));
$('#stop-tracking').addEventListener('click', () => stopTracking(false));

$('#speed-controls').addEventListener('click', event => {
  const button = event.target.closest('[data-speed]');
  if (!button) return;
  if (state.trackedId) stopTracking(false);
  world.setSpeed(Number(button.dataset.speed));
  renderHud();
});

$('#begin-button').addEventListener('click', () => {
  $('#opening').hidden = true;
  world.beginCharter();
  world.setSpeed(1);
  renderObjective();
  renderHud();
  toast('第一便の荷揚げを開始', '港の「本国→島」側へ、食料・工具・切石が実際に積まれます。');
});

window.addEventListener('keydown', event => {
  if (!$('#opening').hidden) return;
  if (event.key === ' ') {
    event.preventDefault();
    if (state.trackedId) stopTracking(false);
    world.setSpeed(world.speedIndex === 0 ? 1 : 0);
    renderHud();
  }
  if (['1', '2', '3', '4'].includes(event.key)) {
    if (state.trackedId) stopTracking(false);
    world.setSpeed(Number(event.key) - 1);
    renderHud();
  }
  if (event.key === 'Escape') {
    if (state.tool) selectTool(state.tool);
    else if (!$('#selection').hidden) closeSheet('selection');
  }
});

window.addEventListener('resize', () => renderer.resize());

let lastTime = performance.now();
function frame(time) {
  const dt = Math.min(0.1, (time - lastTime) / 1000);
  lastTime = time;
  world.update(dt);
  updateTutorial();
  handleWorldEvents();

  if (state.trackedId && !world.shipments.some(shipment => shipment.id === state.trackedId)) stopTracking(true);

  state.uiTimer += dt;
  state.selectionTimer += dt;
  if (state.uiTimer >= 0.18) {
    state.uiTimer = 0;
    renderHud();
    renderObjective();
    if (!$('#ledger').hidden) renderLedger();
    if (!$('#manifest').hidden) renderManifest();
  }
  if (state.selectionTimer >= 0.32) {
    state.selectionTimer = 0;
    renderSelection();
  }
  renderer.render(dt);
  requestAnimationFrame(frame);
}

renderBuildTools();
renderObjective();
renderHud();
requestAnimationFrame(frame);

window.__CHARTER__ = {
  version: VERSION, world, renderer, state,
  selectTool, setCategory, selectBuilding, startTracking, stopTracking,
  renderHud, renderObjective, renderSelection,
};
