import { IsometricCamera } from './camera.js';
import { SimulationClock } from './clock.js';
import {
  GOODS_LABELS, JOB_LABELS, PLACEMENT_JOBS, SPEEDS, VERSION,
} from './config.js';
import { createEngineController } from './engine_bridge.js';
import { presentEvent } from './event_view.js';
import { previewBuildingPlacement, previewRoadPlacement, tileKey } from './placement.js';
import { WorldPresentation } from './presentation.js';
import { Renderer } from './renderer.js';

const $ = selector => document.querySelector(selector);
const canvas = $('#world');
const controller = createEngineController({ seed: 11 });
const camera = new IsometricCamera();
const renderer = new Renderer(canvas, camera);
const clock = new SimulationClock({ speedIndex: 1 });
let model = controller.readModel();
const presentation = new WorldPresentation(model);
let displayModel = presentation.reset(model);
let lastEventSequence = 0;
let visibleEventCount = 0;
let selectedCarrierId = null;
let activeTool = null;
let toolDragStart = null;
let dismissedOfferKey = null;
const eventLog = [];
camera.setWorldSize(model.width, model.height);

function formatNumber(value) {
  return Math.round(value).toLocaleString('ja-JP');
}

function formatQuantity(value) {
  return (Math.round(value * 10) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 });
}

function showToast(row) {
  const toast = document.createElement('div');
  toast.className = `toast ${row.tone}`;
  toast.innerHTML = `<b>${row.title}</b><span>${row.details || `${row.day}日目 tick ${row.tick}`}</span>`;
  $('#toast-stack').append(toast);
  while ($('#toast-stack').children.length > 4) $('#toast-stack').firstElementChild.remove();
  setTimeout(() => toast.remove(), 5200);
}

function appendEvents(events, { allowToasts = true } = {}) {
  const rows = events.map(presentEvent);
  eventLog.push(...rows);
  if (eventLog.length > 100) eventLog.splice(0, eventLog.length - 100);
  if (allowToasts) {
    const important = rows.filter(row => row.important).slice(-4);
    for (const row of important) showToast(row);
  } else if (rows.some(row => row.important)) {
    showToast({ title: '早送り中の重要イベント', details: `${rows.filter(row => row.important).length}件を出来事へ記録`, tone: 'warn' });
  }
  if (!$('#event-sheet').hidden) renderEventSheet();
}

function refreshModel({ animate = false, baseSeconds = 0.12 } = {}) {
  const nextModel = controller.readModel();
  const events = controller.events(lastEventSequence);
  if (events.length) {
    lastEventSequence = events.at(-1).sequence;
    visibleEventCount += events.length;
    appendEvents(events, { allowToasts: animate && events.length <= 30 });
  }
  if (animate) presentation.enqueue(nextModel, events, baseSeconds);
  else displayModel = presentation.reset(nextModel);
  model = nextModel;
  return events;
}

function renderHud() {
  $('#funds-value').textContent = formatNumber(model.companyMoney);
  $('#day-value').textContent = `${model.day}日目`;
  $('#tick-value').textContent = `tick ${model.tick}`;
  $('#population-value').textContent = `${formatNumber(model.population)}人`;
  $('#world-size').textContent = `${model.width}×${model.height}`;
  $('#building-count').textContent = `${model.buildings.length}棟`;
  $('#carrier-count').textContent = `${model.carriers.length}`;
  $('#trail-count').textContent = `${model.trailRows.length}区画`;
  $('#stock-count').textContent = formatNumber(model.totalVisibleStock);
  $('#event-count').textContent = formatNumber(visibleEventCount);
  document.querySelectorAll('[data-speed]').forEach(button => {
    button.classList.toggle('on', Number(button.dataset.speed) === clock.speedIndex);
  });
  if (!$('#company-sheet').hidden) renderCompanySheet();
}

function setSpeed(index) {
  const speed = clock.setSpeed(index);
  $('#status span').textContent = speed.ticksPerSecond === 0
    ? '時間を停止しました'
    : `${speed.label}で観測中`;
  renderHud();
}

function tickPresentationSeconds() {
  const ticksPerSecond = SPEEDS[clock.speedIndex].ticksPerSecond;
  if (ticksPerSecond <= 0) return 0.028;
  return Math.max(0.025, Math.min(0.42, 0.84 / ticksPerSecond));
}

function advanceTicks(count, { animate = true, baseSeconds = tickPresentationSeconds() } = {}) {
  if (!Number.isSafeInteger(count) || count < 0) throw new TypeError('tick count must be non-negative');
  if (!animate) {
    controller.advanceTicks(count);
    refreshModel({ animate: false });
    renderHud();
    return model;
  }
  for (let index = 0; index < count; index += 1) {
    controller.advanceTicks(1);
    refreshModel({ animate: true, baseSeconds });
  }
  renderHud();
  return model;
}

function stepOneDay() {
  advanceTicks(30, { animate: true, baseSeconds: 0.028 });
  $('#status span').textContent = '1日進めました';
}

$('#speed-controls').addEventListener('click', event => {
  const button = event.target.closest('[data-speed]');
  if (button) setSpeed(Number(button.dataset.speed));
});

$('#step-day').addEventListener('click', stepOneDay);

for (const job of PLACEMENT_JOBS) {
  const option = document.createElement('option');
  option.value = job;
  option.textContent = JOB_LABELS[job] ?? job;
  $('#building-kind').append(option);
}

function worldTile(screenPoint) {
  const point = camera.unproject(screenPoint.x, screenPoint.y);
  return { x: Math.floor(point.x), y: Math.floor(point.y) };
}

function setToolHint(message, tone = '') {
  const hint = $('#tool-hint');
  hint.hidden = !message;
  hint.textContent = message ?? '';
  hint.className = `panel tool-hint ${tone}`.trim();
}

function toolInstruction(tool) {
  return tool === 'building' ? '建物の入口にする区画を押してください。実寸敷地も同時に表示します。'
    : tool === 'road' ? '始点から終点へドラッグしてください。'
      : tool === 'remove-building' ? '空き建物を押してください。'
        : tool === 'remove-road' ? '撤去する完成道路を押してください。' : '';
}

function buildingAtTile(tile) {
  return model.buildings.find(building => tile.x >= building.x && tile.x < building.x + building.width
    && tile.y >= building.y && tile.y < building.y + building.height) ?? null;
}

function removalPreview(tile) {
  const building = buildingAtTile(tile);
  if (!building) return { kind: 'remove-building', ok: false, reason: '撤去する建物を押してください', cells: [tile] };
  const cells = [];
  for (let y = building.y; y < building.y + building.height; y += 1) {
    for (let x = building.x; x < building.x + building.width; x += 1) cells.push({ x, y });
  }
  const ok = !building.fixed && building.ownerHouseholdId === null && building.shelfAmount <= 1e-9;
  return {
    kind: 'remove-building', building, cells, ok,
    reason: ok ? '' : '固定施設・入居中・在庫ありの建物は撤去できません',
  };
}

function roadRemovalPreview(tile) {
  const ok = model.roadKeys.includes(tileKey(tile.x, tile.y));
  return { kind: 'remove-road', cells: [tile], ok, reason: ok ? '' : '完成道路を押してください', tile };
}

function updateToolPreview(tile, start = toolDragStart) {
  if (!activeTool) {
    renderer.operationPreview = null;
    return null;
  }
  let preview;
  if (activeTool === 'building') {
    preview = previewBuildingPlacement(model, $('#building-kind').value, tile);
  } else if (activeTool === 'road') {
    preview = previewRoadPlacement(model, start ?? tile, tile);
  } else if (activeTool === 'remove-building') preview = removalPreview(tile);
  else preview = roadRemovalPreview(tile);
  renderer.operationPreview = preview;
  setToolHint(preview.ok ? activeTool === 'road' ? 'この線へ道路を敷設します' : 'この位置で確定できます'
    : preview.reason, preview.ok ? 'good' : 'bad');
  return preview;
}

function selectTool(tool) {
  activeTool = activeTool === tool ? null : tool;
  toolDragStart = null;
  renderer.operationPreview = null;
  document.querySelectorAll('[data-tool]').forEach(button => {
    button.classList.toggle('on', button.dataset.tool === activeTool);
  });
  $('#cancel-tool').hidden = !activeTool;
  setToolHint(toolInstruction(activeTool));
}

function applyEngineOperation(operation, successMessage, failureMessage) {
  try {
    const result = controller.operate(operation);
    refreshModel({ animate: false });
    renderHud();
    const ok = result?.ok ?? true;
    $('#status span').textContent = ok ? successMessage : failureMessage;
    showToast({
      title: ok ? '操作を記録しました' : '操作できません',
      details: ok ? successMessage : failureMessage,
      tone: ok ? 'good' : 'bad',
    });
    return result;
  } catch (error) {
    refreshModel({ animate: false });
    renderHud();
    $('#status span').textContent = error.message;
    showToast({ title: '操作できません', details: error.message, tone: 'bad' });
    return { ok: false, error: error.message };
  }
}

function commitTool(tile) {
  const preview = updateToolPreview(tile);
  if (!preview?.ok) return { ok: false };
  let result;
  if (activeTool === 'building') {
    result = applyEngineOperation({
      type: 'place_building', job: preview.job,
      x: preview.entrance.x, y: preview.entrance.y,
      buildingX: preview.x, buildingY: preview.y,
    }, `${JOB_LABELS[preview.job] ?? preview.job}の区画を指定しました`, 'この場所には建てられません');
  } else if (activeTool === 'road') {
    result = applyEngineOperation({ type: 'add_road', start: preview.start, end: preview.end },
      `${preview.newCells.length}区画の道を敷きました`, 'この線には道を敷けません');
  } else if (activeTool === 'remove-building') {
    result = applyEngineOperation({ type: 'remove_building', buildingId: preview.building.id },
      `${JOB_LABELS[preview.building.type] ?? preview.building.type}を撤去しました`, 'この建物は撤去できません');
  } else {
    result = applyEngineOperation({ type: 'remove_road', x: preview.tile.x, y: preview.tile.y },
      '道路を1区画撤去しました', 'この道路は撤去できません');
  }
  renderer.operationPreview = null;
  toolDragStart = null;
  setToolHint(toolInstruction(activeTool));
  return result;
}

document.querySelectorAll('[data-tool]').forEach(button => {
  button.addEventListener('click', () => selectTool(button.dataset.tool));
});
$('#cancel-tool').addEventListener('click', () => selectTool(activeTool));
$('#building-kind').addEventListener('change', () => {
  if (activeTool === 'building') setToolHint('建物の入口にする区画を押してください。実寸敷地も同時に表示します。');
});

const pointers = new Map();
let panLast = null;
let pinchDistance = null;
let tapStart = null;
let tapDistance = 0;

function localPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function clearPointers() {
  pointers.clear();
  panLast = null;
  pinchDistance = null;
  tapStart = null;
  tapDistance = 0;
  canvas.classList.remove('map-dragging');
}

canvas.addEventListener('pointerdown', event => {
  const point = localPoint(event);
  pointers.set(event.pointerId, point);
  canvas.setPointerCapture(event.pointerId);
  if (activeTool) {
    toolDragStart = worldTile(point);
    updateToolPreview(toolDragStart, toolDragStart);
    tapStart = point;
    tapDistance = 0;
    return;
  }
  if (pointers.size === 1) {
    panLast = point;
    tapStart = point;
    tapDistance = 0;
    canvas.classList.add('map-dragging');
  } else if (pointers.size === 2) {
    const [first, second] = [...pointers.values()];
    pinchDistance = Math.hypot(second.x - first.x, second.y - first.y);
  }
});

canvas.addEventListener('pointermove', event => {
  const point = localPoint(event);
  if (activeTool && !pointers.has(event.pointerId)) {
    updateToolPreview(worldTile(point));
    return;
  }
  if (!pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId, point);
  if (tapStart) tapDistance = Math.max(tapDistance, Math.hypot(point.x - tapStart.x, point.y - tapStart.y));
  if (activeTool) {
    updateToolPreview(worldTile(point), toolDragStart);
    return;
  }
  if (pointers.size === 2) {
    const [first, second] = [...pointers.values()];
    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
    if (pinchDistance) camera.zoomAt(distance / Math.max(1, pinchDistance), midpoint.x, midpoint.y);
    pinchDistance = distance;
    return;
  }
  if (panLast) camera.pan(point.x - panLast.x, point.y - panLast.y);
  panLast = point;
});

function endPointer(event) {
  const wasTap = pointers.size === 1 && tapDistance < 7;
  const point = localPoint(event);
  if (activeTool && pointers.has(event.pointerId)) {
    commitTool(worldTile(point));
    clearPointers();
    return;
  }
  pointers.delete(event.pointerId);
  if (pointers.size === 1) panLast = [...pointers.values()][0];
  else if (pointers.size === 0) clearPointers();
  pinchDistance = null;
  if (wasTap) {
    const carrier = renderer.hitTestCarrier(displayModel, point.x, point.y);
    if (carrier) selectCarrier(carrier);
  }
}

canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', () => {
  toolDragStart = null;
  clearPointers();
});
window.addEventListener('blur', clearPointers);

canvas.addEventListener('wheel', event => {
  event.preventDefault();
  const point = localPoint(event);
  camera.zoomAt(event.deltaY < 0 ? 1.1 : 0.9, point.x, point.y);
}, { passive: false });

window.addEventListener('keydown', event => {
  if (event.key === ' ') {
    event.preventDefault();
    setSpeed(clock.speedIndex === 0 ? 1 : 0);
  } else if (['1', '2', '3', '4'].includes(event.key)) {
    setSpeed(Number(event.key) - 1);
  }
});

window.addEventListener('resize', () => renderer.resize());

function orderKey(order) {
  return order ? `${order.g}:${order.qty}:${order.due}` : null;
}

function renderCompanySheet() {
  $('#company-balance').textContent = formatNumber(model.companyMoney);
  const offer = model.orderOffer;
  const active = model.activeOrder;
  if (active) {
    $('#order-panel').innerHTML = `
      <h3>受諾済みの本国注文</h3>
      <p><b>${GOODS_LABELS[active.g] ?? active.g} ${formatQuantity(active.left)} / ${formatQuantity(active.qty)}荷</b></p>
      <p>期限 ${active.due}日目・決済単価 ${formatQuantity(active.price * 10)}デナリ</p>`;
  } else if (offer && dismissedOfferKey === orderKey(offer)) {
    $('#order-panel').innerHTML = `
      <h3>注文状を見送り中</h3>
      <p>${GOODS_LABELS[offer.g] ?? offer.g} ${formatQuantity(offer.qty)}荷。エンジン状態と入力ジャーナルは変更していません。</p>
      <div class="order-actions"><button type="button" data-company-action="reconsider">再検討する</button></div>`;
  } else if (offer) {
    const cheapest = model.marketLowest[offer.g];
    const marketText = Number.isFinite(cheapest)
      ? `${formatQuantity(cheapest * 10)}デナリ`
      : '市場在庫なし';
    $('#order-panel').innerHTML = `
      <h3>本国から注文状</h3>
      <p><b>${GOODS_LABELS[offer.g] ?? offer.g} ${formatQuantity(offer.qty)}荷</b>・期限 ${offer.due}日目</p>
      <p>本国決済単価 ${formatQuantity(offer.price * 10)}デナリ / 市場最安 ${marketText}</p>
      <div class="order-actions">
        <button class="accept" type="button" data-company-action="accept-order">受諾する</button>
        <button class="reject" type="button" data-company-action="reject-order">拒否する</button>
      </div>`;
  } else {
    $('#order-panel').innerHTML = '<h3>本国注文</h3><p>現在届いている注文状はありません。</p>';
  }

  $('#company-goods').innerHTML = Object.keys(GOODS_LABELS).map(goods => `
    <div class="goods-row" data-goods="${goods}">
      <span>${GOODS_LABELS[goods]}<small> 在庫${formatQuantity(model.companyStock[goods] ?? 0)}</small></span>
      <input type="number" min="0" step="1" value="${Math.round(model.stockTargets[goods] ?? 0)}" aria-label="${GOODS_LABELS[goods]}の買上げ目標">
      <button type="button" data-company-action="set-target" data-goods="${goods}">目標設定</button>
      <button type="button" data-company-action="release-stock" data-goods="${goods}">16蔵出し</button>
    </div>`).join('');
  const ledger = model.companyLedger.slice(-24).reverse();
  $('#company-ledger').innerHTML = ledger.length ? ledger.map(row => `
    <div class="ledger-row"><small>${row.day}日</small><span>${row.reason}</span><b class="${row.amount >= 0 ? 'plus' : 'minus'}">${row.amount >= 0 ? '+' : ''}${formatQuantity(row.amount)}</b></div>`).join('')
    : '<p class="sheet-note">まだ記帳はありません。</p>';
}

function renderEventSheet() {
  $('#event-log').innerHTML = eventLog.length ? [...eventLog].reverse().map(row => `
    <button type="button" class="event-row ${row.tone}" data-event-sequence="${row.sequence}">
      <b><span>${row.title}</span><span>${row.day}日 / ${row.tick}</span></b>
      <small>${row.details || `座標 ${formatQuantity(row.x)}, ${formatQuantity(row.y)}`}</small>
    </button>`).join('') : '<p class="sheet-note">まだ出来事はありません。</p>';
}

function openSheet(id) {
  for (const sheet of document.querySelectorAll('.sheet')) sheet.hidden = sheet.id !== id;
  document.body.classList.add('sheet-open');
  if (id === 'company-sheet') renderCompanySheet();
  if (id === 'event-sheet') renderEventSheet();
}

$('#open-company').addEventListener('click', () => openSheet('company-sheet'));
$('#open-events').addEventListener('click', () => openSheet('event-sheet'));
document.querySelectorAll('[data-close-sheet]').forEach(button => {
  button.addEventListener('click', () => {
    $(`#${button.dataset.closeSheet}`).hidden = true;
    document.body.classList.remove('sheet-open');
  });
});

function rejectOrderOffer() {
  dismissedOfferKey = orderKey(model.orderOffer);
  renderCompanySheet();
  $('#status span').textContent = '注文状を見送りました（エンジン状態は不変）';
  return dismissedOfferKey;
}

$('#company-sheet').addEventListener('click', event => {
  const button = event.target.closest('[data-company-action]');
  if (!button) return;
  const action = button.dataset.companyAction;
  if (action === 'reject-order') {
    rejectOrderOffer();
    return;
  }
  if (action === 'reconsider') {
    dismissedOfferKey = null;
    renderCompanySheet();
    return;
  }
  if (action === 'accept-order') {
    dismissedOfferKey = null;
    applyEngineOperation({ type: 'accept_order' }, '本国注文を受諾しました', 'この注文は受諾できません');
    renderCompanySheet();
    return;
  }
  const goods = button.dataset.goods;
  if (action === 'set-target') {
    const input = button.closest('.goods-row').querySelector('input');
    const qty = Math.max(0, Math.round(Number(input.value) || 0));
    applyEngineOperation({ type: 'set_stock_target', goods, qty },
      `${GOODS_LABELS[goods]}の買上げ目標を${qty}にしました`, '目標を設定できません');
  } else if (action === 'release-stock') {
    applyEngineOperation({ type: 'release_stock', goods, qty: 16 },
      `${GOODS_LABELS[goods]}を蔵から市場へ出します`, '蔵出しできる在庫または経路がありません');
  }
  renderCompanySheet();
});

$('#event-log').addEventListener('click', event => {
  const button = event.target.closest('[data-event-sequence]');
  if (!button) return;
  const row = eventLog.find(item => item.sequence === Number(button.dataset.eventSequence));
  if (!row) return;
  camera.focus(row.x + 0.5, row.y + 0.5);
  $('#event-sheet').hidden = true;
  document.body.classList.remove('sheet-open');
  $('#status span').textContent = `${row.title}の場所へ移動しました`;
});

function stopTracking(message = '追跡を終了しました') {
  selectedCarrierId = null;
  renderer.selectedCarrierId = null;
  $('#tracking').hidden = true;
  if (message) $('#status span').textContent = message;
}

function selectCarrier(carrier) {
  if (!carrier) return stopTracking();
  selectedCarrierId = carrier.id;
  renderer.selectedCarrierId = carrier.id;
  const goods = carrier.goods ? (GOODS_LABELS[carrier.goods] ?? carrier.goods) : '人の移動';
  const amount = carrier.goods ? ` ${formatQuantity(carrier.amount)}` : ` ${carrier.members ?? carrier.people ?? 1}人`;
  $('#tracking-label').textContent = `${goods}${amount}`;
  $('#tracking-route').textContent = `${carrier.from?.label ?? '出所不明'} → ${carrier.to?.label ?? '行き先不明'}`;
  $('#tracking-kind').textContent = carrier.kind === 'cart' ? '荷車を追跡中' : '徒歩便を追跡中';
  $('#tracking').hidden = false;
  $('#status span').textContent = `${goods}の行方を地図上で追跡します`;
}

$('#stop-tracking').addEventListener('click', () => stopTracking('追跡を終了しました'));

function updateTracking(currentModel) {
  if (!selectedCarrierId) return;
  const carrier = currentModel.carriers.find(row => row.id === selectedCarrierId);
  if (!carrier) {
    stopTracking('荷が目的地へ到着しました');
    return;
  }
  selectCarrier(carrier);
  camera.focus(carrier.x + 0.5, carrier.y + 0.5);
}

let lastFrame = performance.now();
function frame(now) {
  const elapsedSeconds = Math.min(0.1, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  const ticks = clock.consume(elapsedSeconds);
  if (ticks > 0) {
    advanceTicks(ticks);
  }
  displayModel = presentation.advance(elapsedSeconds);
  updateTracking(displayModel);
  renderer.render(displayModel, elapsedSeconds);
  requestAnimationFrame(frame);
}

window.__SHIOJI_V004__ = Object.freeze({
  version: VERSION,
  camera,
  clock,
  controller,
  renderer,
  get model() { return model; },
  get displayModel() { return displayModel; },
  get selectedCarrierId() { return selectedCarrierId; },
  get activeTool() { return activeTool; },
  get eventLog() { return eventLog.map(row => ({ ...row })); },
  presentation,
  setSpeed,
  stepOneDay,
  advanceTicks,
  selectCarrier,
  stopTracking,
  selectTool,
  openSheet,
  rejectOrderOffer,
  previewBuilding(job, x, y) { return previewBuildingPlacement(model, job, { x, y }); },
  previewRoad(start, end) { return previewRoadPlacement(model, start, end); },
});

renderHud();
renderer.render(displayModel, 0);
requestAnimationFrame(frame);

if (SPEEDS.length !== 4) throw new Error('speed controls and speed definitions must stay aligned');
