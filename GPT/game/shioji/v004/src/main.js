import { IsometricCamera } from './camera.js';
import { SimulationClock } from './clock.js';
import {
  BUILD_CATEGORIES, BUILDING_ART, BUILDING_SIZES, GOODS_LABELS, JOB_LABELS,
  PLACEMENT_JOBS, SECTION_LABELS, SPEEDS, VERSION,
} from './config.js';
import {
  DISPLAY_BATCH_TICKS, advanceInBatches, displayBatchSizeFor,
} from './display_batch.js';
import { BUILD_COST_DENARI, createEngineController } from './engine_bridge.js';
import { presentEvent } from './event_view.js';
import {
  isEditableTarget, movementKey, panCameraFromKeys, shouldIgnoreShortcut,
} from './keyboard.js';
import { previewBuildingPlacement, previewRoadPlacement, tileKey } from './placement.js';
import { WorldPresentation } from './presentation.js';
import { Renderer } from './renderer.js';
import { START_MODES, parseStartMode, urlForStartMode } from './start_modes.js';
import { createTutorialDirectorForMode } from './tutorial_director.js';
import { objectiveActionFor, secretaryRouteFor } from './ui_guidance.js';

const $ = selector => document.querySelector(selector);
const canvas = $('#world');
const requestedStartMode = parseStartMode(location.search);
const startMode = requestedStartMode ?? 'sandbox';
const controller = createEngineController({ seed: 11, mode: startMode });
const camera = new IsometricCamera();
const renderer = new Renderer(canvas, camera);
const clock = new SimulationClock({ speedIndex: requestedStartMode ? 1 : 0 });
let model = controller.readModel();
const tutorialDirector = createTutorialDirectorForMode(startMode);
tutorialDirector?.observe(model, []);
const presentation = new WorldPresentation(model);
let displayModel = presentation.reset(model);
let lastEventSequence = 0;
let visibleEventCount = 0;
let selectedCarrierId = null;
let selectedBuildingId = null;
let activeTool = null;
let activeBuildCategory = 'logistics';
let recommendedBuildingJob = null;
let currentTutorialAction = null;
let toolDragStart = null;
let dismissedOfferKey = null;
const eventLog = [];
let openTutorialLetterId = null;
let speedBeforeLetter = null;
let lastRunningSpeed = clock.speedIndex || 1;
let currentSecretaryRoute = null;
let highSpeedPendingTicks = 0;
const pressedMovementKeys = new Set();
const companyInteractionPointers = new Set();
let companyInteractionReleasePending = false;
const uiMetrics = { domUpdates: 0, displayBatches: 0, batchedTicks: 0 };
camera.setWorldSize(model.width, model.height);
if (START_MODES[startMode].blank) camera.focus(model.economyMarket.x + 0.5, model.economyMarket.y + 0.5);

function formatNumber(value) {
  return Math.round(value).toLocaleString('ja-JP');
}

function formatQuantity(value) {
  return (Math.round(value * 10) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}

const HOUSEHOLD_STATE_LABELS = Object.freeze({
  home: '在宅', toMarket: '市場へ移動中', atMarket: '市場で取引中',
  fromMarket: '帰宅中', working: '仕事中', toWork: '仕事場へ移動中',
  fromWork: '仕事から帰宅中',
});

const SATISFACTION_LABELS = Object.freeze({
  food1: '食料1種', food2: '食料2種', food3: '食料3種', grain: '穀物',
  saltchar: '塩と燃料', tools: '道具', salt: '塩', char: '燃料', cloth: '布', iron: '鉄材',
});

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
  tutorialDirector?.observe(model, events);
  return events;
}

function renderHud() {
  uiMetrics.domUpdates += 1;
  syncSelectedBuilding();
  $('#build-version').textContent = `Build ${VERSION}`;
  $('#start-mode-label').textContent = START_MODES[startMode].shortLabel;
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
  renderBuildDock();
  if (!$('#company-sheet').hidden && !isEditableTarget(document.activeElement)) renderCompanySheet();
  if (!$('#building-sheet').hidden) renderBuildingSheet();
  if (!$('#island-sheet').hidden) renderIslandSheet();
  renderTutorial();
  renderSecretary();
}

function setSpeed(index) {
  if (clock.speedIndex === 3 && index !== 3) flushHighSpeedPending();
  const speed = clock.setSpeed(index);
  if (index > 0) lastRunningSpeed = index;
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

function advanceTicks(count, {
  animate = true,
  baseSeconds = tickPresentationSeconds(),
  batchSize = 1,
} = {}) {
  if (!Number.isSafeInteger(count) || count < 0) throw new TypeError('tick count must be non-negative');
  if (!animate) {
    controller.advanceTicks(count);
    refreshModel({ animate: false });
    renderHud();
    return model;
  }
  const effectiveBatchSize = tutorialDirector?.isActive() && !tutorialDirector.isComplete()
    ? 1
    : batchSize;
  advanceInBatches(controller, count, {
    batchSize: effectiveBatchSize,
    afterBatch(ticks) {
      uiMetrics.displayBatches += 1;
      uiMetrics.batchedTicks += ticks;
      refreshModel({ animate: true, baseSeconds: baseSeconds * ticks });
    },
  });
  renderHud();
  return model;
}

function flushHighSpeedPending() {
  if (highSpeedPendingTicks <= 0) return model;
  const ticks = highSpeedPendingTicks;
  highSpeedPendingTicks = 0;
  return advanceTicks(ticks, { batchSize: DISPLAY_BATCH_TICKS });
}

function currentDisplayBatchSize() {
  return displayBatchSizeFor({
    speedIndex: clock.speedIndex,
    tutorialActive: Boolean(tutorialDirector?.isActive()),
    tutorialComplete: Boolean(tutorialDirector?.isComplete()),
  });
}

function stepOneDay() {
  flushHighSpeedPending();
  advanceTicks(30, { animate: true, baseSeconds: 0.028, batchSize: currentDisplayBatchSize() });
  $('#status span').textContent = '1日進めました';
}

$('#speed-controls').addEventListener('click', event => {
  const button = event.target.closest('[data-speed]');
  if (button) setSpeed(Number(button.dataset.speed));
});

$('#step-day').addEventListener('click', stepOneDay);

function categoryForJob(job) {
  return BUILD_CATEGORIES.find(category => category.jobs.includes(job)) ?? null;
}

function initializeBuildDock() {
  for (const job of PLACEMENT_JOBS) {
    const option = document.createElement('option');
    option.value = job;
    option.textContent = JOB_LABELS[job] ?? job;
    $('#building-kind').append(option);
  }
  for (const category of BUILD_CATEGORIES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.dataset.buildCategory = category.id;
    button.textContent = category.label;
    $('#build-tabs').append(button);
  }
}

function renderBuildDock() {
  const category = BUILD_CATEGORIES.find(row => row.id === activeBuildCategory) ?? BUILD_CATEGORIES[1];
  document.querySelectorAll('[data-build-category]').forEach(button => {
    const selected = button.dataset.buildCategory === category.id;
    button.classList.toggle('on', selected);
    button.classList.toggle('recommended', Boolean(
      recommendedBuildingJob && categoryForJob(recommendedBuildingJob)?.id === button.dataset.buildCategory,
    ));
    button.setAttribute('aria-selected', String(selected));
  });
  const palette = $('#building-palette');
  const groundTools = $('#ground-tools');
  const infrastructure = category.id === 'infrastructure';
  palette.hidden = infrastructure;
  groundTools.hidden = !infrastructure;
  if (infrastructure) return;
  palette.replaceChildren();
  for (const job of category.jobs) {
    const art = BUILDING_ART[job] ?? BUILDING_ART.market;
    const size = BUILDING_SIZES[job];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'building-choice';
    button.dataset.buildingJob = job;
    button.classList.toggle('on', activeTool === 'building' && $('#building-kind').value === job);
    button.classList.toggle('recommended', recommendedBuildingJob === job);
    button.setAttribute('aria-pressed', String(activeTool === 'building' && $('#building-kind').value === job));
    const icon = document.createElement('i');
    icon.setAttribute('aria-hidden', 'true');
    icon.style.setProperty('--roof', art.roof);
    icon.style.setProperty('--wall', art.wall);
    const name = document.createElement('b');
    name.textContent = JOB_LABELS[job] ?? job;
    const facts = document.createElement('small');
    facts.textContent = `${BUILD_COST_DENARI.toLocaleString('ja-JP')}D・${size.width}×${size.height}`;
    button.append(icon, name, facts);
    palette.append(button);
  }
}

initializeBuildDock();

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
  return tool === 'building' ? `${JOB_LABELS[$('#building-kind').value] ?? '建物'}の入口にする区画を押してください。実寸敷地も同時に表示します。`
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
  const marketBusy = building.roles?.includes('market')
    && model.households.some(household => household.marketTripActive);
  const ok = !building.fixed && building.ownerHouseholdId === null
    && building.shelfAmount <= 1e-9 && !marketBusy;
  return {
    kind: 'remove-building', building, cells, ok,
    reason: ok ? '' : '固定施設・入居中・在庫あり・市場往復中の建物は撤去できません',
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
  canvas.classList.toggle('tool-active', Boolean(activeTool));
  setToolHint(toolInstruction(activeTool));
  renderBuildDock();
}

function activateBuildingJob(job) {
  if (!PLACEMENT_JOBS.includes(job)) return null;
  const same = activeTool === 'building' && $('#building-kind').value === job;
  $('#building-kind').value = job;
  activeBuildCategory = categoryForJob(job)?.id ?? activeBuildCategory;
  if (same) selectTool('building');
  else {
    if (activeTool === 'building') activeTool = null;
    selectTool('building');
  }
  return activeTool;
}

function activateGroundTool(tool) {
  activeBuildCategory = 'infrastructure';
  if (activeTool !== tool) selectTool(tool);
  else renderBuildDock();
  return activeTool;
}

function applyEngineOperation(operation, successMessage, failureMessage) {
  try {
    flushHighSpeedPending();
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
$('#build-tabs').addEventListener('click', event => {
  const button = event.target.closest('[data-build-category]');
  if (!button) return;
  activeBuildCategory = button.dataset.buildCategory;
  const category = BUILD_CATEGORIES.find(row => row.id === activeBuildCategory);
  if (activeTool === 'building' && !category?.jobs.includes($('#building-kind').value)) selectTool('building');
  else renderBuildDock();
});
$('#building-palette').addEventListener('click', event => {
  const button = event.target.closest('[data-building-job]');
  if (button) activateBuildingJob(button.dataset.buildingJob);
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
  pressedMovementKeys.clear();
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
    else {
      const building = renderer.hitTestBuilding(displayModel, point.x, point.y);
      selectBuilding(building);
    }
  }
}

canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', () => {
  toolDragStart = null;
  clearPointers();
});
window.addEventListener('blur', () => {
  clearPointers();
  pressedMovementKeys.clear();
  companyInteractionPointers.clear();
  companyInteractionReleasePending = false;
});
document.addEventListener('visibilitychange', () => pressedMovementKeys.clear());

canvas.addEventListener('wheel', event => {
  event.preventDefault();
  const point = localPoint(event);
  camera.zoomAt(event.deltaY < 0 ? 1.1 : 0.9, point.x, point.y);
}, { passive: false });

window.addEventListener('keydown', event => {
  if (shouldIgnoreShortcut(event)) return;
  const movement = movementKey(event.key);
  if (movement) {
    event.preventDefault();
    pressedMovementKeys.add(movement);
    return;
  }
  if (event.key === 'Escape' && !$('#tutorial-letter-modal').hidden) {
    event.preventDefault();
    closeTutorialLetter();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    const sheet = [...document.querySelectorAll('.sheet')].find(candidate => !candidate.hidden);
    if (sheet) closeSheet(sheet.id);
    else if (activeTool) selectTool(activeTool);
    else if (selectedBuildingId !== null) selectBuilding(null);
  } else if (event.key === ' ') {
    event.preventDefault();
    if (!event.repeat) setSpeed(clock.speedIndex === 0 ? lastRunningSpeed : 0);
  } else if (['1', '2', '3', '4'].includes(event.key)) {
    event.preventDefault();
    setSpeed(Number(event.key) - 1);
  }
});
window.addEventListener('keyup', event => {
  const movement = movementKey(event.key);
  if (movement) pressedMovementKeys.delete(movement);
});

window.addEventListener('resize', () => renderer.resize());

function orderKey(order) {
  return order ? `${order.g}:${order.qty}:${order.due}` : null;
}


function renderAidPanel() {
  const aid = model.mainlandAid ?? { requests: 0, refused: false, nextQty: 240 };
  $('#aid-panel').innerHTML = aid.refused
    ? `<h3>本国の食料支援</h3><p>度重なる要請(${aid.requests}回)に本国の心象は冷え、支援は望めません。</p>`
    : `<h3>本国の食料支援</h3>
       <p>これまでの要請 ${aid.requests}回・次の支援は麦${aid.nextQty}荷。重ねるほど本国の心象を損ね、量は減っていきます。</p>
       <div class="order-actions"><button type="button" data-company-action="request-aid">支援を要請する</button></div>`;
}
function renderCompanySheet() {
  if (companyInteractionPointers.size > 0 || companyInteractionReleasePending) return;
  $('#company-balance').textContent = formatNumber(model.companyMoney);
  renderAidPanel();
  const offer = model.orderOffer;
  const active = model.activeOrder;
  if (active) {
    $('#order-panel').innerHTML = `
      <h3>受諾済みの本国注文</h3>
      <p><b>${GOODS_LABELS[active.g] ?? active.g} ${formatQuantity(active.left)} / ${formatQuantity(active.qty)}荷</b></p>
      <p>期限 ${active.due}日目・完遂決済単価 ${formatQuantity(active.price * 1.25 * 10)}デナリ（注文基準 ${formatQuantity(active.price * 10)}）</p>`;
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
      <p>完遂決済単価 ${formatQuantity(offer.price * 1.25 * 10)}デナリ（注文基準 ${formatQuantity(offer.price * 10)}） / 市場最安 ${marketText}</p>
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

function renderTutorial() {
  const available = Boolean(tutorialDirector);
  const state = tutorialDirector?.readState() ?? null;
  const objective = tutorialDirector?.currentObjective() ?? null;
  const objectivePanel = $('#tutorial-objective');
  const letterButton = $('#open-tutorial-letters');
  objectivePanel.hidden = !objective || Boolean(tutorialDirector?.isComplete());
  objectivePanel.classList.toggle('complete', Boolean(objective?.complete));
  letterButton.hidden = !available || Boolean(state?.skipped);
  currentTutorialAction = objectiveActionFor(objective, model);
  recommendedBuildingJob = currentTutorialAction?.kind === 'building'
    ? currentTutorialAction.job : null;
  const actionButton = $('#tutorial-action');
  actionButton.hidden = !currentTutorialAction;
  actionButton.textContent = currentTutorialAction?.label ?? '次の操作';
  renderBuildDock();
  if (state?.skipped) $('#start-mode-label').textContent = '自由プレイ（案内終了）';
  else if (tutorialDirector?.isComplete()) $('#start-mode-label').textContent = '自由プレイ（教程完了）';
  if (objective) {
    $('#tutorial-chapter').textContent = objective.chapter;
    $('#tutorial-goal').textContent = objective.title;
    $('#tutorial-detail').textContent = objective.detail;
    $('#tutorial-progress').textContent = `${objective.progress.done} / ${objective.progress.total}`;
    $('#tutorial-progress-bar').max = objective.progress.total;
    $('#tutorial-progress-bar').value = objective.progress.done;
  }
  if (!available) return;
  const letters = tutorialDirector.letters();
  const unread = letters.filter(letter => letter.unread).length;
  $('#tutorial-unread').hidden = unread === 0 || Boolean(state?.skipped);
  $('#tutorial-unread').textContent = String(unread);
  if (!$('#tutorial-letter-sheet').hidden) renderTutorialLetterSheet();
}

function secretaryFallback() {
  const selected = selectedBuildingId === null
    ? null : model.buildings.find(building => building.id === selectedBuildingId);
  if (selected) {
    return {
      priority: 'operation-guide',
      target: { kind: 'sheet', sheet: 'building-sheet' },
      kicker: '盤面の選択',
      title: JOB_LABELS[selected.type] ?? selected.type,
      detail: `座標 ${selected.x}, ${selected.y}・建物情報を開きます`,
    };
  }
  return {
    priority: 'operation-guide',
    target: { kind: 'sheet', sheet: 'island-sheet' },
    kicker: '観測の案内',
    title: '島況で現物と相場を見る',
    detail: `所在を確認できる現物 ${formatQuantity(model.totalVisibleStock)}荷`,
  };
}

function renderSecretary() {
  const objective = tutorialDirector?.currentObjective() ?? null;
  currentSecretaryRoute = secretaryRouteFor({
    letters: tutorialDirector?.letters() ?? [],
    objective: tutorialDirector?.isComplete() ? null : objective,
    objectiveAction: currentTutorialAction,
    events: eventLog,
    fallback: secretaryFallback(),
  });
  const button = $('#secretary');
  button.dataset.secretaryPriority = currentSecretaryRoute.priority;
  $('#secretary-kicker').textContent = currentSecretaryRoute.kicker;
  $('#secretary-title').textContent = currentSecretaryRoute.title;
  $('#secretary-detail').textContent = currentSecretaryRoute.detail;
}

function performGuidanceAction(action) {
  if (!action) return false;
  if (action.kind === 'building') activateBuildingJob(action.job);
  else if (action.kind === 'tool') activateGroundTool(action.tool);
  else if (action.kind === 'sheet') openSheet(action.sheet);
  else if (action.kind === 'objective') {
    $('#tutorial-objective').focus();
    $('#status span').textContent = '現在目標を表示しています';
  } else return false;
  return true;
}

function focusEvent(row) {
  if (!row) return false;
  camera.focus(row.x + 0.5, row.y + 0.5);
  closeSheet('event-sheet');
  $('#status span').textContent = `${row.title}の場所へ移動しました`;
  return true;
}

function followSecretaryRoute() {
  const target = currentSecretaryRoute?.target;
  if (!target) return false;
  if (target.kind === 'letter') return openTutorialLetter(target.id);
  if (target.kind === 'event') {
    return focusEvent(eventLog.find(row => row.sequence === target.sequence));
  }
  return performGuidanceAction(target);
}

function renderTutorialLetterSheet() {
  const letters = tutorialDirector?.letters() ?? [];
  const list = $('#tutorial-letter-list');
  list.replaceChildren();
  if (!letters.length) {
    const empty = document.createElement('p');
    empty.className = 'sheet-note';
    empty.textContent = 'まだ書状は届いていません。';
    list.append(empty);
    return;
  }
  for (const letter of [...letters].reverse()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tutorial-letter-row${letter.unread ? ' unread' : ''}`;
    button.dataset.tutorialLetter = letter.id;
    const heading = document.createElement('b');
    heading.textContent = letter.title;
    const summary = document.createElement('small');
    summary.textContent = `${letter.issuedDay}日目・${letter.summary}`;
    button.append(heading, summary);
    list.append(button);
  }
}

function renderBuildingSheet() {
  const building = model.buildings.find(row => row.id === selectedBuildingId);
  if (!building) return false;
  const household = model.households.find(row => row.id === building.ownerHouseholdId) ?? null;
  const connection = model.roadConnection?.buildings?.find(row => row.id === building.id);
  const hasMarket = model.buildings.some(row => row.roles?.includes('market'));
  const status = building.fixed ? '会社の固定施設' : building.occupied ? '世帯が稼働中' : '空き区画';
  const road = !hasMarket ? '市場未設置' : connection?.connected ? '市場へ接続' : '市場へ未接続';
  $('#building-sheet-kicker').textContent = building.roles?.includes('port') ? '港湾物流'
    : building.roles?.includes('market') ? '市場物流'
      : building.roles?.includes('warehouse') ? '会社物流' : '職住一体の区画';
  $('#building-sheet-title').textContent = JOB_LABELS[building.type] ?? building.type;
  $('#building-summary').innerHTML = `
    <div class="building-fact"><small>状態</small><b>${status}</b></div>
    <div class="building-fact"><small>道路</small><b>${road}</b></div>
    <div class="building-fact"><small>敷地</small><b>${building.width}×${building.height}区画</b></div>
    <div class="building-fact"><small>座標 / 入口</small><b>${building.x},${building.y} / ${building.entrance ? `${building.entrance.x},${building.entrance.y}` : 'なし'}</b></div>`;

  const householdPanel = $('#building-household');
  householdPanel.hidden = !household;
  if (household) {
    const family = household.familyName ? `${escapeHtml(household.familyName)}家` : `世帯#${household.id}`;
    const names = household.memberNames.length ? household.memberNames.map(escapeHtml).join('、') : '名前の記録なし';
    const purse = household.purse === null ? '未観測' : `${formatQuantity(household.purse * 10)}デナリ`;
    const income = `${household.recentIncome >= 0 ? '+' : ''}${formatQuantity(household.recentIncome * 10)}デナリ`;
    const satisfaction = household.satisfaction
      ? Object.entries(household.satisfaction).map(([key, met]) => (
        `<span class="${met ? 'met' : ''}">${escapeHtml(SATISFACTION_LABELS[key] ?? GOODS_LABELS[key] ?? key)}</span>`
      )).join('') : '<span>未観測</span>';
    householdPanel.innerHTML = `
      <h3>${family}・${household.members}人</h3>
      <div class="household-vitals">
        <span><small>現在</small><b>${escapeHtml(HOUSEHOLD_STATE_LABELS[household.state] ?? household.state)}</b></span>
        <span><small>財布</small><b>${purse}</b></span>
        <span><small>直近日収</small><b>${income}</b></span>
        <span><small>文化</small><b>Lv${household.cultureLevel}</b></span>
        <span><small>空腹</small><b>${household.hungerWindow ? `${household.hungerDays}/${household.hungerWindow}日` : '記録なし'}</b></span>
        <span><small>生産倍率</small><b>${Math.round(household.productionMultiplier * 100)}%</b></span>
      </div>
      <p>家族: ${names}</p>
      <p>連続空腹 ${household.hungerRun}日・累計歩行 ${formatQuantity(household.walkingDistance)}区画・${household.marketTripActive ? `市場往復 ${household.marketTripTicks}tick` : '市場往復なし'}</p>
      <div class="satisfaction-list" aria-label="直近の暮らしの充足">${satisfaction}</div>`;
  }

  const shelfPanel = $('#building-shelves');
  const boundedCapacity = row => Number.isFinite(row.capacity)
    && row.capacity > 0 && row.capacity < Number.MAX_SAFE_INTEGER / 2;
  const shelves = building.shelves.filter(row => row.amount > 1e-9 || boundedCapacity(row));
  shelfPanel.innerHTML = `<h3>区分棚</h3>${shelves.length ? `<div class="shelf-list">${shelves.map(row => {
    const bounded = boundedCapacity(row);
    const capacity = bounded ? ` / ${formatQuantity(row.capacity)}荷`
      : row.capacity > 0 ? '荷 / 上限なし' : '荷';
    const percent = bounded ? Math.min(100, Math.max(0, row.amount / row.capacity * 100)) : 0;
    const meter = bounded ? `<i class="shelf-meter"><i style="width:${percent}%"></i></i>` : '';
    return `<div class="shelf-row"><small>${escapeHtml(SECTION_LABELS[row.section] ?? row.section)}</small><span>${escapeHtml(GOODS_LABELS[row.goods] ?? row.goods)}${meter}</span><b>${formatQuantity(row.amount)}${capacity}</b></div>`;
  }).join('')}</div>` : '<p>棚に割り当てられた現物はありません。</p>'}`;

  const conversion = model.conversionEconomics.find(row => row.buildingId === building.id) ?? null;
  const conversionPanel = $('#building-conversion');
  conversionPanel.hidden = !conversion;
  if (conversion) {
    conversionPanel.innerHTML = `
      <h3>加工のつながり</h3>
      <div class="conversion-chain">
        <span><small>投入棚</small><b>${escapeHtml(GOODS_LABELS[conversion.inputGoods] ?? conversion.inputGoods)} ${formatQuantity(conversion.inputAmount)}荷</b></span>
        <b>→</b>
        <span><small>産出棚</small><b>${escapeHtml(GOODS_LABELS[conversion.goods] ?? conversion.goods)} ${formatQuantity(conversion.outputAmount)}荷</b></span>
      </div>
      <p>実生産原価 ${formatQuantity(conversion.cost * 10)}デナリ/荷・市場相場 ${formatQuantity(conversion.marketPrice * 10)}デナリ/荷・生産EMA ${formatQuantity(conversion.productionEma)}</p>`;
  }
  return true;
}

function renderIslandSheet() {
  const manifest = $('#island-manifest');
  manifest.replaceChildren();
  if (!model.goodsManifest.length) {
    const empty = document.createElement('p');
    empty.className = 'sheet-note';
    empty.textContent = '島内で所在を確認できる現物はありません。';
    manifest.append(empty);
  }
  for (const goodsRow of model.goodsManifest) {
    const row = document.createElement('article');
    row.className = 'manifest-row';
    const heading = document.createElement('b');
    const name = document.createElement('span');
    name.textContent = GOODS_LABELS[goodsRow.goods] ?? goodsRow.goods;
    const total = document.createElement('span');
    total.textContent = `${formatQuantity(goodsRow.totalAmount)}荷`;
    heading.append(name, total);
    const locations = document.createElement('div');
    locations.className = 'manifest-locations';
    for (const location of goodsRow.locations) {
      const locationIndex = model.stockLocations.indexOf(location);
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.stockLocation = String(locationIndex);
      const source = document.createElement('span');
      source.textContent = location.sourceLabel;
      const amount = document.createElement('b');
      amount.textContent = `${formatQuantity(location.amount)}荷`;
      button.append(source, amount);
      locations.append(button);
    }
    row.append(heading, locations);
    manifest.append(row);
  }

  const formatObserved = value => Number.isFinite(value) ? formatQuantity(value) : '—';
  const rows = Object.keys(GOODS_LABELS).map(goods => {
    const stock = model.goodsManifest.find(row => row.goods === goods)?.totalAmount ?? 0;
    const flow = model.flowEma[goods] ?? null;
    const flowCell = (key) => {
      const value = flow?.[key];
      const className = Number.isFinite(value) && value > 0.005 ? ' class="active-flow"' : '';
      return `<span${className}>${formatObserved(value)}</span>`;
    };
    return `<div class="market-flow-row">
      <span>${escapeHtml(GOODS_LABELS[goods])}</span>
      <span>${Number.isFinite(model.marketPrices[goods]) ? `${formatQuantity(model.marketPrices[goods] * 10)}D` : '—'}</span>
      <span>${formatQuantity(stock)}</span>
      ${flowCell('imp')}${flowCell('prod')}${flowCell('cons')}
    </div>`;
  }).join('');
  $('#market-overview').innerHTML = `
    <div class="market-flow-row header"><span>品目</span><span>相場</span><span>現物</span><span>輸入</span><span>生産</span><span>消費</span></div>
    ${rows}`;
}

function openTutorialLetter(id) {
  const letter = tutorialDirector?.letters().find(row => row.id === id);
  if (!letter) return false;
  if (openTutorialLetterId === null) {
    speedBeforeLetter = clock.speedIndex;
    setSpeed(0);
  }
  openTutorialLetterId = id;
  tutorialDirector.markLetterRead(id);
  $('#tutorial-letter-kicker').textContent = letter.kicker;
  $('#tutorial-letter-title').textContent = letter.title;
  $('#tutorial-letter-summary').textContent = letter.summary;
  const body = $('#tutorial-letter-body');
  body.replaceChildren();
  for (const paragraph of letter.body.split(/\n{2,}/)) {
    const node = document.createElement('p');
    node.textContent = paragraph;
    body.append(node);
  }
  $('#tutorial-letter-signature').textContent = letter.signature;
  $('#tutorial-letter-modal').hidden = false;
  document.body.classList.add('letter-open');
  renderTutorial();
  renderSecretary();
  $('#close-tutorial-letter').focus();
  return true;
}

function closeTutorialLetter() {
  if (openTutorialLetterId === null) return;
  openTutorialLetterId = null;
  $('#tutorial-letter-modal').hidden = true;
  document.body.classList.remove('letter-open');
  const restore = speedBeforeLetter;
  speedBeforeLetter = null;
  if (restore !== null) setSpeed(restore);
}

function skipTutorial() {
  if (!tutorialDirector) return null;
  const state = tutorialDirector.skip();
  renderTutorial();
  renderSecretary();
  $('#status span').textContent = '案内を終了しました。島はそのまま自由に遊べます';
  return state;
}

function tutorialSave() {
  return tutorialDirector?.exportSave(controller.inputJournal()) ?? null;
}

function openSheet(id) {
  for (const sheet of document.querySelectorAll('.sheet')) sheet.hidden = sheet.id !== id;
  document.body.classList.add('sheet-open');
  if (id === 'building-sheet') renderBuildingSheet();
  if (id === 'company-sheet') renderCompanySheet();
  if (id === 'event-sheet') renderEventSheet();
  if (id === 'tutorial-letter-sheet') renderTutorialLetterSheet();
  if (id === 'island-sheet') renderIslandSheet();
}

function closeSheet(id) {
  const sheet = $(`#${id}`);
  if (sheet) sheet.hidden = true;
  if (![...document.querySelectorAll('.sheet')].some(candidate => !candidate.hidden)) {
    document.body.classList.remove('sheet-open');
  }
}

$('#open-company').addEventListener('click', () => openSheet('company-sheet'));
$('#open-island').addEventListener('click', () => openSheet('island-sheet'));
$('#open-events').addEventListener('click', () => openSheet('event-sheet'));
$('#open-tutorial-letters').addEventListener('click', () => openSheet('tutorial-letter-sheet'));
document.querySelectorAll('[data-close-sheet]').forEach(button => {
  button.addEventListener('click', () => closeSheet(button.dataset.closeSheet));
});

function syncSelectedBuilding() {
  if (selectedBuildingId === null) return null;
  const building = model.buildings.find(row => row.id === selectedBuildingId) ?? null;
  if (building) return building;
  selectedBuildingId = null;
  renderer.selectedBuildingId = null;
  closeSheet('building-sheet');
  return null;
}

function selectBuilding(building) {
  if (!building) {
    const hadSelection = selectedBuildingId !== null;
    selectedBuildingId = null;
    renderer.selectedBuildingId = null;
    closeSheet('building-sheet');
    if (hadSelection) $('#status span').textContent = '建物の選択を解除しました';
    return null;
  }
  stopTracking('');
  selectedBuildingId = building.id;
  renderer.selectedBuildingId = building.id;
  openSheet('building-sheet');
  $('#status span').textContent = `${JOB_LABELS[building.type] ?? building.type}の情報を開きました`;
  return building;
}

$('#focus-selected-building').addEventListener('click', () => {
  const building = syncSelectedBuilding();
  if (!building) return;
  camera.focus(building.x + building.width / 2, building.y + building.height / 2);
  closeSheet('building-sheet');
  $('#status span').textContent = `${JOB_LABELS[building.type] ?? building.type}を画面中央へ移しました`;
});

$('#open-island-from-building').addEventListener('click', () => openSheet('island-sheet'));
$('#island-manifest').addEventListener('click', event => {
  const button = event.target.closest('[data-stock-location]');
  if (!button) return;
  const location = model.stockLocations[Number(button.dataset.stockLocation)];
  if (!location) return;
  camera.focus(location.x + 0.5, location.y + 0.5);
  closeSheet('island-sheet');
  $('#status span').textContent = `${location.sourceLabel}の場所へ移動しました`;
});

$('#tutorial-letter-list').addEventListener('click', event => {
  const button = event.target.closest('[data-tutorial-letter]');
  if (button) openTutorialLetter(button.dataset.tutorialLetter);
});
$('#close-tutorial-letter').addEventListener('click', closeTutorialLetter);
$('#skip-tutorial').addEventListener('click', skipTutorial);
$('#tutorial-action').addEventListener('click', () => performGuidanceAction(currentTutorialAction));
$('#secretary').addEventListener('click', followSecretaryRoute);

const companySheet = $('#company-sheet');
companySheet.addEventListener('pointerdown', event => {
  if (!event.target.closest('button, input, select, textarea')) return;
  companyInteractionPointers.add(event.pointerId);
});

function releaseCompanyInteraction(event) {
  if (!companyInteractionPointers.delete(event.pointerId)) return;
  if (companyInteractionPointers.size > 0 || companyInteractionReleasePending) return;
  companyInteractionReleasePending = true;
  requestAnimationFrame(() => {
    if (companyInteractionPointers.size > 0) {
      companyInteractionReleasePending = false;
      return;
    }
    companyInteractionReleasePending = false;
    if (!companySheet.hidden) renderCompanySheet();
  });
}

window.addEventListener('pointerup', releaseCompanyInteraction);
window.addEventListener('pointercancel', releaseCompanyInteraction);

function rejectOrderOffer() {
  dismissedOfferKey = orderKey(model.orderOffer);
  renderCompanySheet();
  $('#status span').textContent = '注文状を見送りました（エンジン状態は不変）';
  return dismissedOfferKey;
}

companySheet.addEventListener('click', event => {
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
  if (action === 'request-aid') {
    applyEngineOperation({ type: 'request_aid' }, '本国へ食料支援を要請しました', '本国は要請に応じません');
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
  focusEvent(row);
});

function stopTracking(message = '追跡を終了しました') {
  selectedCarrierId = null;
  renderer.selectedCarrierId = null;
  $('#tracking').hidden = true;
  if (message) $('#status span').textContent = message;
}

function selectCarrier(carrier) {
  if (!carrier) return stopTracking();
  selectedBuildingId = null;
  renderer.selectedBuildingId = null;
  closeSheet('building-sheet');
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

const gameUiElements = [...document.body.children].filter(element => (
  element.id !== 'start-screen' && !['SCRIPT', 'NOSCRIPT'].includes(element.tagName)
));

function showStartScreen() {
  setSpeed(0);
  $('#start-screen').hidden = false;
  document.body.classList.add('choosing-start');
  for (const element of gameUiElements) element.inert = true;
  $('#start-screen [data-start-mode="tutorial"]').focus();
}

function chooseStartMode(mode) {
  location.assign(urlForStartMode(location.href, mode));
}

$('#start-screen').addEventListener('click', event => {
  const button = event.target.closest('[data-start-mode]');
  if (button) chooseStartMode(button.dataset.startMode);
});
$('#choose-start').addEventListener('click', showStartScreen);

let lastFrame = performance.now();
function frame(now) {
  const elapsedSeconds = Math.max(0, (now - lastFrame) / 1000);
  const visualSeconds = Math.min(0.1, elapsedSeconds);
  lastFrame = now;
  panCameraFromKeys(camera, pressedMovementKeys, visualSeconds);
  const ticks = clock.consume(elapsedSeconds, { maxTicks: clock.speedIndex === 3 ? 3 : 6 });
  const batchSize = currentDisplayBatchSize();
  if (clock.speedIndex === 3 && batchSize === DISPLAY_BATCH_TICKS) {
    highSpeedPendingTicks += ticks;
    const ready = Math.floor(highSpeedPendingTicks / DISPLAY_BATCH_TICKS) * DISPLAY_BATCH_TICKS;
    if (ready > 0) {
      highSpeedPendingTicks -= ready;
      advanceTicks(ready, { batchSize });
    }
  } else if (ticks > 0) {
    advanceTicks(ticks, { batchSize });
  }
  displayModel = presentation.advance(visualSeconds);
  updateTracking(displayModel);
  renderer.render(displayModel, visualSeconds);
  requestAnimationFrame(frame);
}

function performanceMetrics() {
  return Object.freeze({
    ...controller.metrics(),
    ...uiMetrics,
    pendingHighSpeedTicks: highSpeedPendingTicks,
  });
}

function resetPerformanceMetrics() {
  controller.resetMetrics();
  uiMetrics.domUpdates = 0;
  uiMetrics.displayBatches = 0;
  uiMetrics.batchedTicks = 0;
}

window.__SHIOJI_V004__ = Object.freeze({
  version: VERSION,
  startMode,
  camera,
  clock,
  controller,
  renderer,
  get model() { return model; },
  get displayModel() { return displayModel; },
  get selectedCarrierId() { return selectedCarrierId; },
  get selectedBuildingId() { return selectedBuildingId; },
  get activeTool() { return activeTool; },
  get secretaryRoute() { return structuredClone(currentSecretaryRoute); },
  get pressedMovementKeys() { return [...pressedMovementKeys]; },
  get eventLog() { return eventLog.map(row => ({ ...row })); },
  presentation,
  performanceMetrics,
  resetPerformanceMetrics,
  setSpeed,
  stepOneDay,
  advanceTicks,
  selectCarrier,
  selectBuilding,
  stopTracking,
  selectTool,
  openSheet,
  rejectOrderOffer,
  skipTutorial,
  openTutorialLetter,
  closeTutorialLetter,
  tutorialSave,
  get tutorialState() { return tutorialDirector?.readState() ?? null; },
  chooseStartMode,
  previewBuilding(job, x, y) { return previewBuildingPlacement(model, job, { x, y }); },
  previewRoad(start, end) { return previewRoadPlacement(model, start, end); },
});

renderHud();
renderer.render(displayModel, 0);
requestAnimationFrame(frame);

if (requestedStartMode) {
  $('#status span').textContent = startMode === 'tutorial'
    ? 'エレナの案内で未開拓島から開始しました'
    : `${START_MODES[startMode].shortLabel}で開始しました`;
  if (tutorialDirector) {
    const firstUnread = tutorialDirector.letters().find(letter => letter.unread);
    if (firstUnread) openTutorialLetter(firstUnread.id);
  }
} else {
  showStartScreen();
}

if (SPEEDS.length !== 4) throw new Error('speed controls and speed definitions must stay aligned');
