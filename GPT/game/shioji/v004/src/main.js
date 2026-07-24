import { IsometricCamera } from './camera.js?v=v004.23.0-readability';
import { SimulationClock } from './clock.js?v=v004.23.0-readability';
import {
  BUILD_CATEGORIES, BUILDING_ART, BUILDING_SIZES, GOODS_LABELS, JOB_ICONS, JOB_LABELS,
  PLACEMENT_JOBS, SECTION_LABELS, SPEEDS, VERSION, toDenari,
} from './config.js?v=v004.23.0-readability';
import {
  DISPLAY_BATCH_TICKS, advanceInBatches, displayBatchSizeFor,
} from './display_batch.js?v=v004.23.0-readability';
import { BUILD_COST_DENARI, createEngineController } from './engine_bridge.js?v=v004.23.0-readability';
import { developmentMapView } from './development_map.js?v=v004.23.0-readability';
import { presentEvent, shouldPresentEvent } from './event_view.js?v=v004.23.0-readability';
import {
  FOOD_GOODS,
  foodHudSummary,
  householdFoodDays,
  islandFoodSummary,
  winterFoodForecast,
} from './food_readability.js?v=v004.23.0-readability';
import {
  isEditableTarget, movementKey, panCameraFromKeys, shouldIgnoreShortcut,
} from './keyboard.js?v=v004.23.0-readability';
import { previewBuildingPlacement, previewRoadPlacement, tileKey } from './placement.js?v=v004.23.0-readability';
import { WorldPresentation } from './presentation.js?v=v004.23.0-readability';
import { Renderer } from './renderer.js?v=v004.23.0-readability';
import { START_MODES, parseStartMode, urlForStartMode } from './start_modes.js?v=v004.23.0-readability';
import { createTutorialDirector, createTutorialDirectorForMode } from './tutorial_director.js?v=v004.23.0-readability';
import {
  guidanceReadingTimeMs, objectiveActionFor, secretaryActionForRoute, secretaryEventsAfter,
  secretaryRouteFor, tutorialHandoffFor,
} from './ui_guidance.js?v=v004.23.0-readability';
import { islandCalendar, islandHealthSummary, recentCompanySummary } from './ui_summary.js?v=v004.23.0-readability';

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
const guidanceDirector = tutorialDirector ?? createTutorialDirector({ goals: [], letters: [] });
guidanceDirector.observe(model, []);
const presentation = new WorldPresentation(model);
let displayModel = presentation.reset(model);
let lastEventSequence = 0;
let selectedCarrierId = null;
let selectedBuildingId = null;
let activeTool = null;
let activeBuildingJob = PLACEMENT_JOBS[0];
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
let lastTutorialObjective = tutorialDirector?.currentObjective() ?? null;
let currentTutorialHandoff = null;
let tutorialHandoffTimer = null;
let tutorialHandoffGapTimer = null;
let tutorialTransitionPending = false;
let tutorialInterludeSpeed = null;
let visibleTutorialObjectiveId = null;
let tutorialObjectiveEnterTimer = null;
let secretaryEnterTimer = null;
let secretaryDeliveryTimer = null;
let secretaryDeliveryKey = null;
let lastDeliveredSecretaryEventSequence = 0;
let highSpeedPendingTicks = 0;
const pressedMovementKeys = new Set();
const companyInteractionPointers = new Set();
let companyMouseInteraction = false;
let companyInteractionReleasePending = false;
let companyEditingInput = null;
const stockTargetDrafts = new Map();
const stockTargetFeedback = new Map();
const stockReleaseDrafts = new Map();
const renderSignatures = new Map();
const economyHistory = [];
const stockReleaseDays = [];
const HISTORY_DAYS = 180;
const TUTORIAL_HANDOFF_GAP_MS = 240;
const GUIDANCE_ENTER_MS = 420;
const FORCED_LETTER_MINIMUM_MS = 5200;
const OPTIONAL_LETTER_MINIMUM_MS = 6500;
const TUTORIAL_MESSAGE_MINIMUM_MS = 5800;
const INFO_ADVICE_MINIMUM_MS = 5800;
const IMPORTANT_EVENT_MINIMUM_MS = 6500;
const CHART_FOOD_GOODS = new Set(FOOD_GOODS);
const uiMetrics = {
  domUpdates: 0,
  domWrites: 0,
  componentRenders: 0,
  componentSkips: 0,
  displayBatches: 0,
  batchedTicks: 0,
};
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

function renderIfChanged(key, signature, render) {
  if (renderSignatures.get(key) === signature) {
    uiMetrics.componentSkips += 1;
    return false;
  }
  renderSignatures.set(key, signature);
  render();
  uiMetrics.componentRenders += 1;
  return true;
}

function setTextIfChanged(target, value) {
  const element = typeof target === 'string' ? $(target) : target;
  const text = String(value);
  if (!element || element.textContent === text) return false;
  element.textContent = text;
  uiMetrics.domWrites += 1;
  return true;
}

function setHiddenIfChanged(target, hidden) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element || element.hidden === Boolean(hidden)) return false;
  element.hidden = Boolean(hidden);
  uiMetrics.domWrites += 1;
  return true;
}

function recordEconomyHistory(currentModel) {
  const food = Object.entries(currentModel.flowEma).reduce((totals, [goods, flow]) => {
    if (!CHART_FOOD_GOODS.has(goods)) return totals;
    totals.imported += flow.imp ?? 0;
    totals.produced += flow.prod ?? 0;
    totals.consumed += flow.cons ?? 0;
    return totals;
  }, { imported: 0, produced: 0, consumed: 0 });
  const foodSummary = islandFoodSummary(currentModel);
  const row = {
    day: currentModel.day,
    foodImported: food.imported,
    foodProduced: food.produced,
    foodConsumed: food.consumed,
    foodStock: foodSummary.available,
    companyFoodStock: foodSummary.companyReserve,
    foodRunwayDays: foodSummary.runwayDays,
    population: currentModel.population,
    cash: toDenari(currentModel.companyMoney),
    net: toDenari(
      currentModel.companyDailyLedger?.find(entry => entry.day === currentModel.day)?.net
      ?? currentModel.companyLedger
        .filter(entry => entry.day === currentModel.day)
        .reduce((total, entry) => total + entry.amount, 0),
    ),
    prices: Object.fromEntries(Object.entries(currentModel.marketPrices).map(([goods, price]) => [goods, toDenari(price)])),
  };
  if (economyHistory.at(-1)?.day === row.day) economyHistory[economyHistory.length - 1] = row;
  else economyHistory.push(row);
  while (economyHistory.length > HISTORY_DAYS) economyHistory.shift();
}

function linePath(rows, accessor, { width = 320, height = 112, minValue = 0, maxValue = null } = {}) {
  if (!rows.length) return '';
  const values = rows.map(accessor).filter(Number.isFinite);
  const min = Math.min(minValue, ...values);
  const max = maxValue ?? Math.max(min + 1, ...values);
  const left = 28;
  const right = width - 7;
  const top = 7;
  const bottom = height - 18;
  return rows.map((row, index) => {
    const value = accessor(row);
    const x = rows.length === 1 ? left : left + (index / (rows.length - 1)) * (right - left);
    const y = bottom - ((value - min) / Math.max(1e-9, max - min)) * (bottom - top);
    return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function chartMarkup(rows, series, { includeZero = true } = {}) {
  if (rows.length < 2) {
    return '<text x="160" y="58" text-anchor="middle" class="chart-axis-label">日が進むと線になります</text>';
  }
  const values = series.flatMap(row => rows.map(row.value)).filter(Number.isFinite);
  const min = includeZero ? Math.min(0, ...values) : Math.min(...values);
  const max = Math.max(min + 1, ...values);
  const grid = '<path d="M28 7V94H313 M28 50.5H313" class="chart-grid"/>';
  const labels = `<text x="2" y="11" class="chart-axis-label">${formatQuantity(max)}</text><text x="2" y="94" class="chart-axis-label">${formatQuantity(min)}</text><text x="28" y="108" class="chart-axis-label">${rows[0].day}日</text><text x="313" y="108" text-anchor="end" class="chart-axis-label">${rows.at(-1).day}日</text>`;
  const paths = series.map(row => `<path d="${linePath(rows, row.value, { minValue: min, maxValue: max })}" class="chart-line ${row.className}"/>`).join('');
  return `${grid}${labels}${paths}`;
}

recordEconomyHistory(model);

const HOUSEHOLD_STATE_LABELS = Object.freeze({
  home: '在宅', toMarket: '市場へ移動中', atMarket: '市場で取引中',
  fromMarket: '帰宅中', working: '仕事中', toWork: '仕事場へ移動中',
  fromWork: '仕事から帰宅中',
});

const SATISFACTION_LABELS = Object.freeze({
  food1: '食料1種', food2: '食料2種', food3: '食料3種', grain: '穀物',
  saltchar: '塩と燃料', tools: '木製品', salt: '塩', char: '燃料', cloth: '布', iron: '鉄材',
});

function showToast(row) {
  const toast = document.createElement('div');
  toast.className = `toast ${row.tone}`;
  toast.innerHTML = `<b>${row.title}</b><span>${row.details || `${row.day}日目の知らせ`}</span>`;
  $('#toast-stack').append(toast);
  while ($('#toast-stack').children.length > 2) $('#toast-stack').firstElementChild.remove();
  setTimeout(() => toast.remove(), 5200);
}

function appendEvents(events, { allowToasts = true, currentModel = model } = {}) {
  const rows = events.filter(shouldPresentEvent).map(event => presentEvent(event, currentModel));
  eventLog.push(...rows);
  if (eventLog.length > 24) eventLog.splice(0, eventLog.length - 24);
  if (allowToasts) {
    const routine = rows.filter(row => !row.important && (
      ['docking', 'birth', 'inheritance'].includes(row.type)
      || (row.type === 'notice' && ['neutral', 'good'].includes(row.tone))
    ));
    const deathNotice = [...rows].reverse().find(row => row.title === '餓死')
      ?? [...rows].reverse().find(row => row.type === 'death');
    const notices = [...routine.slice(-2), deathNotice]
      .filter(Boolean)
      .filter((row, index, all) => all.findIndex(candidate => candidate.sequence === row.sequence) === index)
      .slice(-2);
    for (const row of notices) showToast(row);
  }
  if (!$('#event-sheet').hidden) renderEventSheet();
}

function refreshModel({ animate = false, baseSeconds = 0.12 } = {}) {
  const nextModel = controller.readModel();
  const events = controller.events(lastEventSequence);
  if (events.length) {
    lastEventSequence = events.at(-1).sequence;
    appendEvents(events, { allowToasts: animate && events.length <= 30, currentModel: nextModel });
  }
  if (animate) presentation.enqueue(nextModel, events, baseSeconds);
  else displayModel = presentation.reset(nextModel);
  model = nextModel;
  recordEconomyHistory(model);
  guidanceDirector.observe(model, events);
  return events;
}

function renderHud() {
  uiMetrics.domUpdates += 1;
  syncSelectedBuilding();
  setTextIfChanged('#build-version', VERSION);
  setTextIfChanged('#start-mode-label', START_MODES[startMode].shortLabel);
  setTextIfChanged('#funds-value', formatNumber(toDenari(model.companyMoney)));
  setTextIfChanged('#day-value', `${model.day}日目`);
  const calendar = islandCalendar(model.day);
  setTextIfChanged('#season-value', calendar.label);
  setTextIfChanged('#population-value', `${formatNumber(model.population)}人`);
  const foodHud = foodHudSummary(model, economyHistory);
  setTextIfChanged('#food-days-value', `あと${Math.max(0, Math.floor(foodHud.runwayDays))}日分 ${foodHud.arrow}`);
  setTextIfChanged('#food-reason', foodHud.reason);
  renderIfChanged('hud-food-tone', foodHud.tone, () => {
    $('#food-runway').dataset.tone = foodHud.tone;
    $('#food-runway').title = `食料はあと約${foodHud.runwayDays.toFixed(1)}日分。${foodHud.reason}。押すと食料グラフを開きます`;
    uiMetrics.domWrites += 1;
  });
  const health = islandHealthSummary(model, economyHistory);
  const signal = $('#island-signal');
  const shortHealth = health.tone === 'danger' ? '危険'
    : health.tone === 'warning' ? '注意' : health.tone === 'good' ? '成長' : '平穏';
  setTextIfChanged(signal, shortHealth);
  renderIfChanged('island-signal-tone', health.tone, () => {
    signal.dataset.tone = health.tone;
    $('#open-island').title = `${health.label}。${health.reason}`;
    uiMetrics.domWrites += 1;
  });
  const selected = selectedBuildingId !== null;
  if ($('#open-building').disabled === selected) {
    $('#open-building').disabled = !selected;
    uiMetrics.domWrites += 1;
  }
  renderIfChanged('hud-speed', String(clock.speedIndex), () => {
    document.querySelectorAll('[data-speed]').forEach(button => {
      button.classList.toggle('on', Number(button.dataset.speed) === clock.speedIndex);
    });
    uiMetrics.domWrites += 1;
  });
  renderBuildDock();
  if (!$('#company-sheet').hidden && !isEditableTarget(document.activeElement)) renderCompanySheet();
  if (!$('#building-sheet').hidden) renderBuildingSheet();
  if (!$('#island-sheet').hidden) renderIslandSheet();
  if (!$('#development-sheet').hidden) renderDevelopmentMap();
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
  for (const category of BUILD_CATEGORIES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.dataset.buildCategory = category.id;
    button.textContent = category.label;
    $('#build-tabs').append(button);
  }
}

function initializeHistoryGoods() {
  const select = $('#history-goods');
  for (const [goods, label] of Object.entries(GOODS_LABELS)) {
    const option = document.createElement('option');
    option.value = goods;
    option.textContent = label;
    select.append(option);
  }
  select.value = 'tools';
}

function renderBuildDock() {
  const category = BUILD_CATEGORIES.find(row => row.id === activeBuildCategory) ?? BUILD_CATEGORIES[1];
  const signature = [category.id, activeTool, activeBuildingJob, recommendedBuildingJob].join('|');
  if (!renderIfChanged('build-dock', signature, () => renderBuildDockContents(category))) return;
}

function renderBuildDockContents(category) {
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
    button.classList.toggle('on', activeTool === 'building' && activeBuildingJob === job);
    button.classList.toggle('recommended', recommendedBuildingJob === job);
    button.setAttribute('aria-pressed', String(activeTool === 'building' && activeBuildingJob === job));
    const icon = document.createElement('i');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = JOB_ICONS[job] ?? '建';
    icon.style.setProperty('--roof', art.roof);
    icon.style.setProperty('--wall', art.wall);
    const name = document.createElement('b');
    name.textContent = JOB_LABELS[job] ?? job;
    const facts = document.createElement('small');
    facts.textContent = `${BUILD_COST_DENARI.toLocaleString('ja-JP')}D・${size.width}×${size.height}`;
    button.append(icon, name, facts);
    palette.append(button);
  }
  uiMetrics.domWrites += 1;
}

initializeBuildDock();
initializeHistoryGoods();

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
  return tool === 'building' ? `${JOB_LABELS[activeBuildingJob] ?? '建物'}の入口にする区画を押してください。実寸敷地も同時に表示します。`
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
    preview = previewBuildingPlacement(model, activeBuildingJob, tile);
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
  const same = activeTool === 'building' && activeBuildingJob === job;
  activeBuildingJob = job;
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
    return result;
  } catch (error) {
    refreshModel({ animate: false });
    renderHud();
    $('#status span').textContent = error.message;
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
  if (activeTool === 'building' && !category?.jobs.includes(activeBuildingJob)) selectTool('building');
  else renderBuildDock();
});
$('#building-palette').addEventListener('click', event => {
  const button = event.target.closest('[data-building-job]');
  if (button) activateBuildingJob(button.dataset.buildingJob);
});
$('#cancel-tool').addEventListener('click', () => selectTool(activeTool));
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
  companyMouseInteraction = false;
  companyInteractionReleasePending = false;
  companyEditingInput = null;
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
  renderIfChanged('company-aid', `${aid.requests}|${aid.refused}|${aid.nextQty}`, () => {
    $('#aid-panel').innerHTML = aid.refused
      ? `<h3>本国の食料支援</h3><p>度重なる要請(${aid.requests}回)に本国の心象は冷え、支援は望めません。</p>`
      : `<h3>本国の食料支援</h3>
         <p>これまでの要請 ${aid.requests}回・次の支援は麦${aid.nextQty}荷。重ねるほど本国の心象を損ね、量は減っていきます。</p>
         <div class="order-actions"><button type="button" data-company-action="request-aid">支援を要請する</button></div>`;
    uiMetrics.domWrites += 1;
  });
}

function renderCartPanel() {
  const offers = model.households.flatMap(household => (
    (household.cartStock ?? []).map(cart => ({ ...cart, seller: household }))
  )).sort((left, right) => left.price - right.price);
  const offer = offers[0] ?? null;
  const carts = model.companyCarts ?? [];
  const signature = JSON.stringify([
    offers.map(row => [row.id, row.price]),
    carts.map(row => [row.id, row.durability, row.busyJobId]),
    model.cartStats,
  ]);
  renderIfChanged('company-carts', signature, () => {
    const working = carts.filter(cart => cart.busyJobId).length;
    const offerText = offer
      ? `最安 ${formatQuantity(toDenari(offer.price))}デナリ（${JOB_LABELS[offer.seller.job]}の${offer.seller.familyName}家）`
      : '市場へ出ている荷車はありません';
    $('#cart-panel').innerHTML = `
      <h3>会社の木の荷車</h3>
      <p>所有 ${carts.length}台・運搬中 ${working}台。荷車工房の世帯から会社資金で購入します。</p>
      <p>${offerText}</p>
      <div class="order-actions">
        <button type="button" data-company-action="purchase-cart" ${offer ? '' : 'disabled'}>木の荷車を1台買う</button>
      </div>`;
    uiMetrics.domWrites += 1;
  });
}

function renderCompanyOrder() {
  const offer = model.orderOffer;
  const active = model.activeOrder;
  const signature = JSON.stringify({
    day: model.day, offer, active, dismissedOfferKey, lowest: offer ? model.marketLowest[offer.g] : null,
  });
  renderIfChanged('company-order', signature, () => {
    if (active) {
      const shipped = Math.max(0, active.qty - active.left);
      const daysLeft = Math.max(0, active.due - model.day);
      $('#order-panel').innerHTML = `
        <h3>受諾済みの本国注文</h3>
        <p><b>${GOODS_LABELS[active.g] ?? active.g}・納品済み ${formatQuantity(shipped)} / ${formatQuantity(active.qty)}荷</b></p>
        <p class="order-progress">残り <b>${formatQuantity(active.left)}荷</b>・期限まで <b>あと${daysLeft}日</b>（${active.due}日目まで）</p>
        <p>全量を期限内に納めた時だけ完遂です。船が出ても残りがあれば注文は続きます。</p>
        <p>完遂決済単価 ${formatQuantity(active.price * 1.25 * 10)}デナリ（注文基準 ${formatQuantity(active.price * 10)}）</p>`;
    } else if (offer && dismissedOfferKey === orderKey(offer)) {
      $('#order-panel').innerHTML = `
        <h3>注文状を見送り中</h3>
        <p>${GOODS_LABELS[offer.g] ?? offer.g} ${formatQuantity(offer.qty)}荷。島の状態と操作記録は変えず、期限まで観察できます。</p>
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
    uiMetrics.domWrites += 1;
  });
}

function renderCompanyGoods() {
  const signature = JSON.stringify(Object.keys(GOODS_LABELS).map(goods => [
    goods,
    model.companyStock[goods] ?? 0,
    model.stockTargets[goods] ?? 0,
    model.companyStockAverageCosts[goods] ?? null,
    model.companyStockReleaseQuotes[goods] ?? null,
    stockTargetDrafts.get(goods) ?? null,
    stockReleaseDrafts.get(goods) ?? null,
    stockTargetFeedback.get(goods) ?? null,
  ]));
  renderIfChanged('company-goods', signature, () => {
    $('#company-goods').innerHTML = Object.keys(GOODS_LABELS).map(goods => {
      const stock = model.companyStock[goods] ?? 0;
      const target = Math.round(model.stockTargets[goods] ?? 0);
      const targetValue = stockTargetDrafts.has(goods) ? stockTargetDrafts.get(goods) : target;
      const dirty = stockTargetDrafts.has(goods) && Number(targetValue) !== target;
      const releaseValue = stockReleaseDrafts.has(goods)
        ? stockReleaseDrafts.get(goods) : Math.min(16, Math.floor(stock));
      const averageCost = model.companyStockAverageCosts[goods];
      const releaseQuote = model.companyStockReleaseQuotes[goods];
      const feedback = stockTargetFeedback.get(goods) ?? (dirty ? '未反映' : '');
      return `
        <div class="goods-row${dirty ? ' dirty' : ''}" data-goods="${goods}">
          <span class="goods-identity"><b>${GOODS_LABELS[goods]}</b><small>倉庫 ${formatQuantity(stock)}荷</small></span>
          <label class="target-editor"><span>買上げ目標</span><input data-stock-target type="number" min="0" step="1" value="${escapeHtml(targetValue)}" aria-label="${GOODS_LABELS[goods]}の買上げ目標"><small data-target-feedback>${escapeHtml(feedback)}</small></label>
          <div class="release-quote"><small>平均仕入 ${Number.isFinite(averageCost) ? `${formatQuantity(toDenari(averageCost))}D/荷` : '—'}</small><small>市場へ出す希望単価 ${Number.isFinite(releaseQuote) ? `${formatQuantity(toDenari(releaseQuote))}D/荷` : '—'}</small></div>
          <label class="release-editor"><span>市場へ出す量</span><input data-release-qty type="number" min="1" max="${Math.max(1, Math.floor(stock))}" step="1" value="${escapeHtml(releaseValue)}" aria-label="${GOODS_LABELS[goods]}を市場へ出す量"><small>荷</small></label>
          <button type="button" data-company-action="release-stock" data-goods="${goods}" ${stock < 1 ? 'disabled' : ''}>市場へ出す</button>
        </div>`;
    }).join('');
    uiMetrics.domWrites += 1;
  });
}

function renderCompanySheet() {
  if (companyInteractionPointers.size > 0
    || companyMouseInteraction || companyInteractionReleasePending || companyEditingInput) return;
  setTextIfChanged('#company-balance', formatNumber(toDenari(model.companyMoney)));
  renderAidPanel();
  renderCartPanel();
  renderCompanyOrder();
  renderCompanyGoods();
  const ledger = model.companyLedger.slice(-24).reverse();
  renderIfChanged('company-ledger', JSON.stringify(ledger), () => {
    $('#company-ledger').innerHTML = ledger.length ? ledger.map(row => `
      <div class="ledger-row"><small>${row.day}日</small><span>${row.reason}</span><b class="${row.amount >= 0 ? 'plus' : 'minus'}">${row.amount >= 0 ? '+' : ''}${formatQuantity(toDenari(row.amount))}</b></div>`).join('')
      : '<p class="sheet-note">まだ記帳はありません。</p>';
    uiMetrics.domWrites += 1;
  });
}

function renderEventSheet() {
  const signature = `${eventLog.length}|${eventLog.at(-1)?.sequence ?? 0}`;
  renderIfChanged('event-log', signature, () => {
    $('#event-log').innerHTML = eventLog.length ? [...eventLog].reverse().map(row => `
      <button type="button" class="event-row ${row.tone}" data-event-sequence="${row.sequence}">
        <b><span>${row.title}</span><span>${row.day}日 / ${row.tick}刻</span></b>
        <small>${row.details || `座標 ${formatQuantity(row.x)}, ${formatQuantity(row.y)}`}</small>
      </button>`).join('') : '<p class="sheet-note">まだ出来事はありません。</p>';
    uiMetrics.domWrites += 1;
  });
}

function finishTutorialHandoff() {
  if (!currentTutorialHandoff || tutorialTransitionPending) return false;
  if (tutorialHandoffTimer !== null) {
    clearTimeout(tutorialHandoffTimer);
    tutorialHandoffTimer = null;
  }
  tutorialTransitionPending = true;
  $('#secretary').classList.add('guidance-switching');
  if (tutorialHandoffGapTimer !== null) clearTimeout(tutorialHandoffGapTimer);
  tutorialHandoffGapTimer = setTimeout(() => {
    currentTutorialHandoff = null;
    tutorialTransitionPending = false;
    tutorialHandoffGapTimer = null;
    $('#secretary').classList.remove('guidance-switching');
    renderTutorial();
    renderSecretary();
  }, TUTORIAL_HANDOFF_GAP_MS);
  return true;
}

function holdTutorialHandoff(handoff) {
  if (tutorialHandoffGapTimer !== null) {
    clearTimeout(tutorialHandoffGapTimer);
    tutorialHandoffGapTimer = null;
  }
  tutorialTransitionPending = false;
  pauseForTutorialInterlude();
  $('#secretary').classList.remove('guidance-switching');
  currentTutorialHandoff = handoff;
  if (tutorialHandoffTimer !== null) clearTimeout(tutorialHandoffTimer);
  tutorialHandoffTimer = setTimeout(() => {
    if (currentTutorialHandoff === handoff) finishTutorialHandoff();
  }, guidanceReadingTimeMs(handoff.speech));
}

function renderTutorial() {
  const available = Boolean(tutorialDirector);
  const state = tutorialDirector?.readState() ?? null;
  const objective = tutorialDirector?.currentObjective() ?? null;
  const handoff = tutorialHandoffFor(lastTutorialObjective, objective);
  if (handoff) holdTutorialHandoff(handoff);
  lastTutorialObjective = objective;
  const objectivePanel = $('#tutorial-objective');
  const letterButton = $('#open-tutorial-letters');
  const handoffPending = Boolean(currentTutorialHandoff);
  setHiddenIfChanged(objectivePanel,
    !objective || Boolean(tutorialDirector?.isComplete()) || handoffPending);
  setHiddenIfChanged(letterButton, !available || Boolean(state?.skipped));
  currentTutorialAction = objectiveActionFor(objective, model);
  recommendedBuildingJob = !handoffPending && currentTutorialAction?.kind === 'building'
    ? currentTutorialAction.job : null;
  const actionButton = $('#tutorial-action');
  setHiddenIfChanged(actionButton, !currentTutorialAction || handoffPending);
  setTextIfChanged(actionButton, currentTutorialAction?.label ?? '操作を始める');
  actionButton.title = currentTutorialAction
    ? `押すと「${currentTutorialAction.label}」を実行します` : '';
  actionButton.setAttribute('aria-label',
    currentTutorialAction ? `押すと${currentTutorialAction.label}` : '現在目標の操作を始める');
  renderBuildDock();
  if (state?.skipped) setTextIfChanged('#start-mode-label', '自由プレイ（案内終了）');
  else if (tutorialDirector?.isComplete()) setTextIfChanged('#start-mode-label', '自由プレイ（案内完了）');
  if (objective) {
    const systemInstruction = objective.systemInstruction || objective.title;
    setTextIfChanged('#tutorial-chapter', objective.chapter);
    setTextIfChanged('#tutorial-goal', systemInstruction);
    setTextIfChanged('#tutorial-progress', `${objective.progress.done} / ${objective.progress.total}`);
    const progress = $('#tutorial-progress-bar');
    if (progress.max !== objective.progress.total || progress.value !== objective.progress.done) {
      progress.max = objective.progress.total;
      progress.value = objective.progress.done;
      uiMetrics.domWrites += 1;
    }
  }
  const visibleObjectiveId = objective && !objectivePanel.hidden ? objective.id : null;
  document.body.classList.toggle('tutorial-objective-visible', Boolean(visibleObjectiveId));
  if (visibleObjectiveId && visibleObjectiveId !== visibleTutorialObjectiveId) {
    if (tutorialObjectiveEnterTimer !== null) clearTimeout(tutorialObjectiveEnterTimer);
    objectivePanel.classList.remove('guidance-entering');
    void objectivePanel.offsetWidth;
    objectivePanel.classList.add('guidance-entering');
    tutorialObjectiveEnterTimer = setTimeout(() => {
      objectivePanel.classList.remove('guidance-entering');
      tutorialObjectiveEnterTimer = null;
    }, GUIDANCE_ENTER_MS);
  }
  visibleTutorialObjectiveId = visibleObjectiveId;
  if (!available) return;
  const letters = tutorialDirector.visibleLetters();
  const unread = letters.filter(letter => letter.unread && letter.attention !== 'silent').length;
  setHiddenIfChanged('#tutorial-unread', unread === 0 || Boolean(state?.skipped));
  setTextIfChanged('#tutorial-unread', String(unread));
  if (!$('#tutorial-letter-sheet').hidden) renderTutorialLetterSheet();
}

function secretaryFallback() {
  const selected = selectedBuildingId === null
    ? null : model.buildings.find(building => building.id === selectedBuildingId);
  if (selected) {
    return {
      priority: 'operation-guide',
      tier: 'guidance',
      target: { kind: 'sheet', sheet: 'building-sheet' },
      speech: `${JOB_LABELS[selected.type] ?? selected.type}を見ています。品がどこから届き、どこへ運ばれるのかを追えば、この建物の役目が分かります。`,
      kicker: '盤面の選択',
      title: JOB_LABELS[selected.type] ?? selected.type,
      detail: `座標 ${selected.x}, ${selected.y}・建物情報を開きます`,
    };
  }
  return {
    priority: 'operation-guide',
    tier: 'guidance',
    target: { kind: 'sheet', sheet: 'island-sheet' },
    speech: '島は今日も動いています。荷車が運ぶ品と、家々の食料を見ていれば、次に足りなくなるものが分かります。',
    kicker: '観測の案内',
    title: '統計で現物と相場を見る',
    detail: `所在を確認できる現物 ${formatQuantity(model.totalVisibleStock)}荷`,
  };
}

function renderSecretary() {
  const objective = tutorialDirector?.currentObjective() ?? null;
  currentSecretaryRoute = secretaryRouteFor({
    letters: tutorialDirector?.visibleLetters() ?? [],
    messages: tutorialDirector?.messages() ?? [],
    advice: guidanceDirector.advice(),
    handoff: currentTutorialHandoff,
    objective: tutorialDirector?.isComplete() ? null : objective,
    objectiveAction: currentTutorialAction,
    events: secretaryEventsAfter(eventLog, lastDeliveredSecretaryEventSequence),
    fallback: secretaryFallback(),
  });
  const signature = JSON.stringify(currentSecretaryRoute);
  renderIfChanged('secretary', signature, () => {
    const panel = $('#secretary');
    const letterAction = $('#secretary-letter-action');
    const secretaryAction = secretaryActionForRoute(currentSecretaryRoute);
    const canFollowTarget = Boolean(secretaryAction);
    panel.dataset.secretaryPriority = currentSecretaryRoute.priority;
    panel.dataset.secretaryTier = currentSecretaryRoute.tier ?? 'notice';
    panel.classList.toggle('has-letter-action', canFollowTarget);
    setTextIfChanged('#secretary-speech',
      currentSecretaryRoute.speech ?? '島の様子を、引き続き見ていきましょう。');
    setHiddenIfChanged(letterAction, !canFollowTarget);
    setTextIfChanged(letterAction, secretaryAction?.label ?? '書状を開く');
    letterAction.dataset.letterId = secretaryAction?.kind === 'letter' ? secretaryAction.id : '';
    if (!tutorialTransitionPending) {
      if (secretaryEnterTimer !== null) clearTimeout(secretaryEnterTimer);
      panel.classList.remove('guidance-entering');
      void panel.offsetWidth;
      panel.classList.add('guidance-entering');
      secretaryEnterTimer = setTimeout(() => {
        panel.classList.remove('guidance-entering');
        secretaryEnterTimer = null;
      }, GUIDANCE_ENTER_MS);
    }
  });
  scheduleSecretaryDelivery(currentSecretaryRoute);
}

function scheduleSecretaryDelivery(route) {
  const target = route?.target ?? null;
  const delivery = target?.kind === 'letter' ? target.delivery : target?.kind;
  const transientAdvice = delivery === 'advice' && route?.priority === 'timely-message';
  const delay = delivery === 'forced'
    ? guidanceReadingTimeMs(route.speech, { minimumMs: FORCED_LETTER_MINIMUM_MS })
    : delivery === 'letter'
      ? guidanceReadingTimeMs(route.speech, { minimumMs: OPTIONAL_LETTER_MINIMUM_MS })
      : delivery === 'message'
        ? guidanceReadingTimeMs(route.speech, { minimumMs: TUTORIAL_MESSAGE_MINIMUM_MS })
        : transientAdvice
          ? guidanceReadingTimeMs(route.speech, { minimumMs: INFO_ADVICE_MINIMUM_MS })
        : delivery === 'event'
          ? guidanceReadingTimeMs(route.speech, { minimumMs: IMPORTANT_EVENT_MINIMUM_MS })
          : null;
  const deliveryId = delivery === 'event' ? target.sequence : target?.id;
  const key = delay === null ? null : `${delivery}:${deliveryId}`;
  if (delivery === 'forced' || delivery === 'letter') pauseForTutorialInterlude();
  else if (delivery === 'message') resumeTutorialInterludeIfReady();
  if (key === secretaryDeliveryKey) return;
  if (secretaryDeliveryTimer !== null) clearTimeout(secretaryDeliveryTimer);
  secretaryDeliveryTimer = null;
  secretaryDeliveryKey = key;
  if (key === null) {
    resumeTutorialInterludeIfReady();
    return;
  }
  secretaryDeliveryTimer = setTimeout(() => {
    secretaryDeliveryTimer = null;
    if (secretaryDeliveryKey !== key) return;
    const currentTarget = currentSecretaryRoute?.target;
    if (delivery === 'event') {
      if (currentTarget?.sequence !== target.sequence) return;
    } else if (currentTarget?.id !== target.id) return;
    secretaryDeliveryKey = null;
    if (delivery === 'forced') {
      if (openTutorialLetterId === null) openTutorialLetter(target.id);
      return;
    }
    if (delivery === 'letter') tutorialDirector?.markLetterAnnounced(target.id);
    else if (delivery === 'message') tutorialDirector?.markLetterRead(target.id);
    else if (transientAdvice) guidanceDirector.markAdviceRead(target.id);
    else if (delivery === 'event') {
      lastDeliveredSecretaryEventSequence = Math.max(
        lastDeliveredSecretaryEventSequence,
        Number(target.sequence ?? 0),
      );
    }
    renderTutorial();
    renderSecretary();
  }, delay);
}

function pauseForTutorialInterlude() {
  if (tutorialInterludeSpeed === null && clock.speedIndex > 0) {
    tutorialInterludeSpeed = clock.speedIndex;
  }
  if (clock.speedIndex === 0) return;
  clock.setSpeed(0);
  renderSignatures.delete('hud-speed');
  document.querySelectorAll('[data-speed]').forEach(button => {
    button.classList.toggle('on', Number(button.dataset.speed) === 0);
  });
  $('#status span').textContent = 'エレナの案内を表示しています';
}

function resumeTutorialInterludeIfReady() {
  const target = currentSecretaryRoute?.target ?? null;
  const deliveryPending = target.kind === 'letter'
    && (target.delivery === 'forced' || target.delivery === 'letter');
  if (openTutorialLetterId !== null || currentTutorialHandoff || deliveryPending) return false;
  if (tutorialInterludeSpeed === null) return false;
  const restore = tutorialInterludeSpeed;
  tutorialInterludeSpeed = null;
  if (clock.speedIndex === 0) setSpeed(restore);
  return true;
}

function performGuidanceAction(action) {
  if (!action) return false;
  if (action.kind === 'building') activateBuildingJob(action.job);
  else if (action.kind === 'building-detail') {
    const building = model.buildings.find(row => row.id === action.buildingId);
    if (!building) return false;
    selectBuilding(building);
    camera.focus(building.x + building.width / 2, building.y + building.height / 2);
    renderer.markBuilding(building.id);
  }
  else if (action.kind === 'tool') activateGroundTool(action.tool);
  else if (action.kind === 'sheet') openSheet(action.sheet);
  else if (action.kind === 'speed') {
    const speedIndex = action.speed ?? 3;
    setSpeed(speedIndex);
    $('#status span').textContent = `${SPEEDS[speedIndex].label}で待ちます`;
  }
  else if (action.kind === 'objective') {
    $('#tutorial-objective').focus();
    $('#status span').textContent = '現在目標を表示しています';
  } else return false;
  return true;
}

function focusEvent(row) {
  if (!row) return false;
  const household = row.householdId === undefined
    ? null : model.households.find(item => item.id === row.householdId);
  const buildingId = row.buildingId ?? household?.buildingId ?? null;
  const building = buildingId === null
    ? null : model.buildings.find(item => item.id === buildingId);
  camera.focus(
    building ? building.x + building.width / 2 : row.x + 0.5,
    building ? building.y + building.height / 2 : row.y + 0.5,
  );
  if (building) renderer.markBuilding(building.id);
  closeSheet('event-sheet');
  $('#status span').textContent = `${row.title}の場所へ移動しました`;
  return true;
}

function renderTutorialLetterSheet() {
  const letters = tutorialDirector?.visibleLetters() ?? [];
  const signature = JSON.stringify(letters.map(letter => [
    letter.id, letter.unread, letter.attention, letter.title, letter.summary,
  ]));
  if (!renderIfChanged('tutorial-letter-list', signature, () => renderTutorialLetterSheetContents(letters))) return;
}

function renderTutorialLetterSheetContents(letters) {
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
    if (letter.attention === 'silent') continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tutorial-letter-row ${letter.attention ?? 'action'}${letter.unread ? ' unread' : ''}`;
    button.dataset.tutorialLetter = letter.id;
    const kind = document.createElement('span');
    kind.className = 'tutorial-letter-kind';
    kind.textContent = letter.attention === 'critical' ? '最重要'
      : letter.attention === 'notice' ? '報告' : '要対応';
    const heading = document.createElement('b');
    heading.textContent = letter.title;
    const summary = document.createElement('small');
    summary.textContent = letter.summary;
    button.append(kind, heading, summary);
    list.append(button);
  }
  uiMetrics.domWrites += 1;
}

function renderBuildingSheet() {
  const building = model.buildings.find(row => row.id === selectedBuildingId);
  if (!building) return false;
  const household = model.households.find(row => row.id === building.ownerHouseholdId) ?? null;
  const selectedConversion = model.conversionEconomics.find(row => row.buildingId === building.id) ?? null;
  const signature = JSON.stringify({
    building,
    household,
    conversion: selectedConversion,
    companyStock: building.roles?.includes('warehouse') ? model.companyStock : null,
    companyCosts: building.roles?.includes('warehouse') ? model.companyStockAverageCosts : null,
  });
  if (renderSignatures.get('building-sheet') === signature) {
    uiMetrics.componentSkips += 1;
    return true;
  }
  renderSignatures.set('building-sheet', signature);
  uiMetrics.componentRenders += 1;
  const jobLabel = JOB_LABELS[building.type] ?? building.type;
  const family = household?.familyName ? `${household.familyName}家` : household ? `世帯${household.id}` : null;
  $('#building-sheet-kicker').textContent = household
    ? `${family}・${household.members}人`
    : building.roles?.includes('port') ? '港湾物流'
      : building.roles?.includes('market') ? '市場物流'
        : building.roles?.includes('warehouse') ? '会社物流' : '無人の仕事場';
  $('#building-sheet-title').textContent = household
    ? `${jobLabel}の${family} Lv${household.displayCultureLevel}`
    : jobLabel;
  const householdPanel = $('#building-household');
  householdPanel.hidden = !household;
  if (household) {
    const foodDays = householdFoodDays(household);
    const purse = household.purse === null ? '未観測' : `${formatQuantity(household.purse * 10)}デナリ`;
    const income = `${household.recentIncome >= 0 ? '+' : ''}${formatQuantity(household.recentIncome * 10)}デナリ`;
    const growth = household.cultureGrowth;
    const nextNeed = growth?.nextRequirement
      ? (SATISFACTION_LABELS[growth.nextRequirement] ?? growth.nextRequirement) : null;
    const missingKeep = growth?.missingForCurrent?.map(
      key => SATISFACTION_LABELS[key] ?? key,
    ) ?? [];
    const growthRatio = growth?.requiredDays > 0 ? growth.upDays / growth.requiredDays : 1;
    const filledMarks = nextNeed ? Math.max(0, Math.min(3, Math.floor(growthRatio * 3))) : 3;
    const marks = `${'◆'.repeat(filledMarks)}${'◇'.repeat(3 - filledMarks)}`;
    const headline = household.hungerRun >= 10 || foodDays < 7
      ? `⚠ 食料があと${Math.max(0, Math.floor(foodDays))}日分`
      : !household.roadConnected ? '⚠ 市場へ道がつながっていません'
        : household.insolvencyMonths >= 3 ? '⚠ 暮らしの資金が続いていません'
          : missingKeep.length ? `⚠ ${missingKeep[0]}が足りず、今の暮らしを保てません`
            : '順調';
    const headlineTone = headline.startsWith('⚠') ? 'warning' : 'good';
    $('#building-summary').innerHTML = `
      <div class="building-health" data-tone="${headlineTone}">${escapeHtml(headline)}</div>`;
    const outputRows = building.shelves.filter(row => row.section === 'output' && row.amount > 1e-9);
    const outputNow = outputRows.length
      ? outputRows.map(row => `${GOODS_LABELS[row.goods] ?? row.goods} ${formatQuantity(row.amount)}荷`).join('・')
      : '製品棚は空';
    const conversionMarkup = selectedConversion ? `
      <div class="conversion-chain">
        <span><small>原料棚</small><b>${escapeHtml(GOODS_LABELS[selectedConversion.inputGoods] ?? selectedConversion.inputGoods)} ${formatQuantity(selectedConversion.inputAmount)}荷</b></span>
        <b>→</b>
        <span><small>製品棚</small><b>${escapeHtml(GOODS_LABELS[selectedConversion.goods] ?? selectedConversion.goods)} ${formatQuantity(selectedConversion.outputAmount)}荷</b></span>
      </div>
      <small>1日あたり（30日ならし）${formatQuantity(selectedConversion.productionEma)}荷・実原価 ${formatQuantity(selectedConversion.cost * 10)}デナリ/荷</small>` : '';
    householdPanel.innerHTML = `
      <div class="household-vitals" aria-label="家の数字">
        <span><small>食料</small><b>あと${Math.max(0, Math.floor(foodDays))}日分</b></span>
        <span><small>財布</small><b>${purse}</b></span>
        <span><small>最近の収支</small><b>${income}</b></span>
      </div>
      <section class="next-living">
        <h3>次の暮らし</h3>
        ${nextNeed ? `<div class="living-requirement ${growth.nextSatisfied ? 'met' : 'missing'}"
          title="${growth.upDays}/${growth.requiredDays}日。必要な暮らしが続くとLv${growth.nextDisplayLevel}になります">
          <b>${escapeHtml(nextNeed)}</b><span aria-label="進み具合 ${growth.upDays}/${growth.requiredDays}日">${marks}</span>
          <small>${growth.nextSatisfied ? '今日は満たしています' : '不足しています'}</small>
        </div>` : '<p class="sheet-note">この家は最高の暮らしに達しています。</p>'}
        ${missingKeep.length ? `<small class="living-danger">今のLvを保つには ${escapeHtml(missingKeep.join('・'))} が必要です。</small>` : ''}
      </section>
      <section class="job-now">
        <h3>仕事のいま</h3>
        <p><b>${escapeHtml(HOUSEHOLD_STATE_LABELS[household.state] ?? household.state)}</b>・働きやすさ ${Math.round(household.productionMultiplier * 100)}%</p>
        <p>${escapeHtml(outputNow)}</p>
        ${building.type === 'cartwright' ? `<p>販売待ちの荷車 ${building.cartStock.length}台${building.cartWork ? `・製作 ${Math.floor(building.cartWork.progress)}/${building.cartWork.required}日` : ''}</p>` : ''}
        ${conversionMarkup}
      </section>`;
  } else {
    const headline = building.vacant ? '⚠ 働く家族がいません' : '順調';
    $('#building-summary').innerHTML = `
      <div class="building-health" data-tone="${building.vacant ? 'warning' : 'good'}">${headline}</div>`;
  }

  const shelfPanel = $('#building-shelves');
  const boundedCapacity = row => Number.isFinite(row.capacity)
    && row.capacity > 0 && row.capacity < Number.MAX_SAFE_INTEGER / 2;
  const sectionNames = {
    pantry: '家の食料庫', input: '原料棚', output: '製品棚', storage: '保管棚',
    construction: '建築資材', inbound: '搬入待ち', outbound: '搬出待ち',
    pickup: '引取待ち', stall: '市場の屋台', companyStock: '会社の倉庫',
  };
  const shelves = [
    ...(household?.pantry ?? []),
    ...building.shelves,
  ].filter(row => row.amount > 1e-9 || boundedCapacity(row));
  shelfPanel.innerHTML = `<h3>在庫</h3>${shelves.length ? `<div class="shelf-list">${shelves.map(row => {
    const bounded = boundedCapacity(row);
    const capacity = bounded ? ` / ${formatQuantity(row.capacity)}荷`
      : row.capacity > 0 ? '荷 / 上限なし' : '荷';
    const percent = bounded ? Math.min(100, Math.max(0, row.amount / row.capacity * 100)) : 0;
    const meter = bounded ? `<i class="shelf-meter"><i style="width:${percent}%"></i></i>` : '';
    return `<div class="shelf-row"><small>${escapeHtml(sectionNames[row.section] ?? SECTION_LABELS[row.section] ?? row.section)}</small><span>${escapeHtml(GOODS_LABELS[row.goods] ?? row.goods)}${meter}</span><b>${formatQuantity(row.amount)}${capacity}</b></div>`;
  }).join('')}</div>` : '<p>棚に割り当てられた現物はありません。</p>'}`;

  const companyStockPanel = $('#building-company-stock');
  const isWarehouse = building.roles?.includes('warehouse');
  companyStockPanel.hidden = !isWarehouse;
  if (isWarehouse) {
    const companyRows = Object.entries(model.companyStock)
      .filter(([, amount]) => amount > 1e-9)
      .sort((left, right) => right[1] - left[1]);
    companyStockPanel.innerHTML = `
      <h3>会社の倉庫にある品</h3>
      <p>会社が市場で買い上げた品です。本国注文の船積みと、品薄時の市場へ出すはここから運びます。</p>
      ${companyRows.length ? `<div class="shelf-list">${companyRows.map(([goods, amount]) => {
        const averageCost = model.companyStockAverageCosts[goods];
        const cost = Number.isFinite(averageCost)
          ? `平均仕入 ${formatQuantity(averageCost * 10)}デナリ/荷` : '平均仕入 —';
        return `<div class="company-stock-row"><span><b>${escapeHtml(GOODS_LABELS[goods] ?? goods)}</b><small>${cost}</small></span><b>${formatQuantity(amount)}荷</b></div>`;
      }).join('')}</div>` : '<p>会社在庫はありません。買上げ目標を定めると、市場から届いた品がここに保管されます。</p>'}
      <button class="focus-building" type="button" data-open-company-stock>買上げ目標・市場へ出すを開く</button>`;
  }

  const conversion = selectedConversion;
  const conversionPanel = $('#building-conversion');
  conversionPanel.hidden = !conversion || Boolean(household);
  if (conversion && !household) {
    conversionPanel.innerHTML = `
      <h3>加工のつながり</h3>
      <div class="conversion-chain">
        <span><small>原料棚</small><b>${escapeHtml(GOODS_LABELS[conversion.inputGoods] ?? conversion.inputGoods)} ${formatQuantity(conversion.inputAmount)}荷</b></span>
        <b>→</b>
        <span><small>産出棚</small><b>${escapeHtml(GOODS_LABELS[conversion.goods] ?? conversion.goods)} ${formatQuantity(conversion.outputAmount)}荷</b></span>
      </div>
      <p>実際にかかった原価 ${formatQuantity(conversion.cost * 10)}デナリ/荷・市場相場 ${formatQuantity(conversion.marketPrice * 10)}デナリ/荷・生産量（1日あたり・30日ならし） ${formatQuantity(conversion.productionEma)}</p>`;
  }
  uiMetrics.domWrites += 1;
  return true;
}

function renderDevelopmentMap() {
  const branches = developmentMapView(model);
  const signature = JSON.stringify(branches.map(branch => (
    branch.nodes.map(node => [node.id, node.state, node.count])
  )));
  renderIfChanged('development-map', signature, () => {
    $('#development-map').innerHTML = branches.map(branch => `
      <section class="development-branch" data-branch="${escapeHtml(branch.id)}">
        <header>
          <h3>${escapeHtml(branch.label)}</h3>
          <p>${escapeHtml(branch.note)}</p>
        </header>
        <div class="development-path">
          ${branch.nodes.map((node, index) => `
            ${index ? '<i class="development-link" aria-hidden="true"></i>' : ''}
            <article class="development-node" data-state="${node.state}">
              <small>${node.state === 'active' ? (node.count > 0 ? `島内 ${node.count}軒` : '島の起点') : node.state === 'future' ? '将来案' : '建築可能'}</small>
              <b>${escapeHtml(node.label)}</b>
              <span>${escapeHtml(node.detail)}</span>
            </article>`).join('')}
        </div>
      </section>`).join('');
    uiMetrics.domWrites += 1;
  });
}

function stockReleaseMarkerMarkup(rows) {
  if (rows.length < 2) return '';
  const first = rows[0].day;
  const last = rows.at(-1).day;
  return stockReleaseDays.filter(row => CHART_FOOD_GOODS.has(row.goods)
    && row.day >= first && row.day <= last).map(row => {
    const x = 28 + ((row.day - first) / Math.max(1, last - first)) * 285;
    return `<path d="M${x.toFixed(1)} 7V94" class="chart-release-marker"><title>${row.day}日目 ${GOODS_LABELS[row.goods] ?? row.goods} ${row.qty}荷を市場へ出す</title></path>`;
  }).join('');
}

function renderEconomyCharts() {
  const selectedGoods = $('#history-goods').value || 'tools';
  const signature = JSON.stringify({ history: economyHistory, selectedGoods, stockReleaseDays });
  renderIfChanged('economy-charts', signature, () => {
    const rows = economyHistory;
    setTextIfChanged('#history-status', rows.length < 2
      ? '日が進むと線になります。'
      : `${rows[0].day}日目〜${rows.at(-1).day}日目（このプレイ中の記録）`);
    $('#food-flow-chart').innerHTML = chartMarkup(rows, [
      { value: row => row.foodProduced, className: 'line-food-prod' },
      { value: row => row.foodConsumed, className: 'line-food-cons' },
      { value: row => row.foodImported, className: 'line-food-imp' },
    ]);
    $('#food-stock-chart').innerHTML = chartMarkup(rows, [
      { value: row => row.foodStock, className: 'line-food-stock' },
      { value: row => row.companyFoodStock, className: 'line-reserve' },
    ]) + stockReleaseMarkerMarkup(rows);
    $('#population-chart').innerHTML = chartMarkup(rows, [
      { value: row => row.population, className: 'line-population' },
    ]);
    $('#finance-chart').innerHTML = chartMarkup(rows, [
      { value: row => row.cash, className: 'line-cash' },
      { value: row => row.net, className: 'line-net' },
    ]);
    $('#price-chart').innerHTML = chartMarkup(rows, [
      { value: row => row.prices[selectedGoods] ?? 0, className: 'line-price' },
    ]);
    setTextIfChanged('#price-chart-title', `${GOODS_LABELS[selectedGoods] ?? selectedGoods}の相場`);
    uiMetrics.domWrites += 5;
  });
}

function renderIslandFinance() {
  const health = islandHealthSummary(model, economyHistory);
  renderIfChanged('island-health', JSON.stringify(health), () => {
    $('#island-health').dataset.tone = health.tone;
    setTextIfChanged('#island-health-title', health.label);
    const population = health.populationDelta === 0 ? '人口は横ばい'
      : `人口は直近30日ほどで${health.populationDelta > 0 ? '+' : ''}${health.populationDelta}人`;
    const net = `${health.companyNet >= 0 ? '+' : '−'}${formatQuantity(toDenari(Math.abs(health.companyNet)))}デナリ`;
    setTextIfChanged('#island-health-detail', `${health.reason}。${population}、会社の30日差引は${net}です。`);
  });
  const finance = recentCompanySummary(model);
  const signature = JSON.stringify(finance);
  renderIfChanged('island-finance', signature, () => {
    setTextIfChanged('#island-funds', `${formatNumber(toDenari(finance.funds))} D`);
    setTextIfChanged('#island-income', `+${formatQuantity(toDenari(finance.income))} D`);
    setTextIfChanged('#island-expense', `−${formatQuantity(toDenari(finance.expense))} D`);
    const net = $('#island-net');
    setTextIfChanged(net, `${finance.net >= 0 ? '+' : '−'}${formatQuantity(toDenari(Math.abs(finance.net)))} D`);
    net.classList.toggle('plus', finance.net >= 0);
    net.classList.toggle('minus', finance.net < 0);
  });
  const forecast = winterFoodForecast(model);
  renderIfChanged('winter-forecast', JSON.stringify(forecast), () => {
    setTextIfChanged('#winter-required', `必要 約${formatNumber(forecast.required)}荷`);
    setTextIfChanged('#winter-reserve', `備え ${formatNumber(Math.floor(forecast.reserve))}荷`);
    setTextIfChanged('#winter-shortage', forecast.sufficient
      ? '足りています' : `← 不足 ${formatNumber(Math.ceil(forecast.shortage))}荷`);
    $('#winter-forecast').dataset.tone = forecast.sufficient ? 'steady' : 'danger';
    uiMetrics.domWrites += 1;
  });
}

function renderIslandManifest() {
  const signature = JSON.stringify(model.goodsManifest.map(row => [
    row.goods, row.totalAmount, row.locations.map(location => [location.sourceLabel, location.amount, location.x, location.y]),
  ]));
  renderIfChanged('island-manifest', signature, () => {
    const manifest = $('#island-manifest');
    const scroll = manifest.scrollTop;
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
        button.innerHTML = `<span>${escapeHtml(location.sourceLabel)}</span><b>${formatQuantity(location.amount)}荷</b>`;
        locations.append(button);
      }
      row.append(heading, locations);
      manifest.append(row);
    }
    manifest.scrollTop = scroll;
    uiMetrics.domWrites += 1;
  });
}

function renderIslandMarket() {
  const signature = JSON.stringify(Object.keys(GOODS_LABELS).map(goods => [
    goods, model.marketPrices[goods], model.goodsManifest.find(row => row.goods === goods)?.totalAmount ?? 0,
    model.flowEma[goods]?.imp, model.flowEma[goods]?.prod, model.flowEma[goods]?.cons,
  ]));
  renderIfChanged('island-market', signature, () => {
    const marketOverview = $('#market-overview');
    const scroll = marketOverview.scrollTop;
    const formatObserved = value => Number.isFinite(value) ? formatQuantity(value) : '—';
    const rows = Object.keys(GOODS_LABELS).map(goods => {
      const stock = model.goodsManifest.find(row => row.goods === goods)?.totalAmount ?? 0;
      const flow = model.flowEma[goods] ?? null;
      const flowCell = key => `<span${Number.isFinite(flow?.[key]) && flow[key] > 0.005 ? ' class="active-flow"' : ''}>${formatObserved(flow?.[key])}</span>`;
      return `<div class="market-flow-row"><span>${escapeHtml(GOODS_LABELS[goods])}</span><span>${Number.isFinite(model.marketPrices[goods]) ? `${formatQuantity(toDenari(model.marketPrices[goods]))}D` : '—'}</span><span>${formatQuantity(stock)}</span>${flowCell('imp')}${flowCell('prod')}${flowCell('cons')}</div>`;
    }).join('');
    marketOverview.innerHTML = `<div class="market-flow-row header"><span>品目</span><span>相場</span><span>現物</span><span>仕入/日</span><span>生産/日</span><span>消費/日</span></div>${rows}`;
    marketOverview.scrollTop = scroll;
    uiMetrics.domWrites += 1;
  });
}

function renderIslandSheet() {
  renderIslandFinance();
  renderEconomyCharts();
  renderIslandMarket();
  renderIslandManifest();
}

function openTutorialLetter(id) {
  const letter = tutorialDirector?.visibleLetters().find(row => row.id === id);
  if (!letter) return false;
  const opening = openTutorialLetterId === null;
  if (opening) {
    speedBeforeLetter = clock.speedIndex;
  }
  openTutorialLetterId = id;
  tutorialDirector.markLetterRead(id);
  if (opening) setSpeed(0);
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
  $('#continue-tutorial-letter').focus();
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
  resumeTutorialInterludeIfReady();
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
  document.querySelectorAll('#top-menu button').forEach(button => {
    const target = {
      'open-company': 'company-sheet', 'open-island': 'island-sheet',
      'open-building': 'building-sheet', 'open-events': 'event-sheet',
      'open-development': 'development-sheet',
      'open-tutorial-letters': 'tutorial-letter-sheet',
    }[button.id];
    if (target) button.setAttribute('aria-pressed', String(target === id));
  });
  if (id === 'building-sheet') renderBuildingSheet();
  if (id === 'company-sheet') renderCompanySheet();
  if (id === 'event-sheet') renderEventSheet();
  if (id === 'development-sheet') renderDevelopmentMap();
  if (id === 'tutorial-letter-sheet') renderTutorialLetterSheet();
  if (id === 'island-sheet') renderIslandSheet();
}

function closeSheet(id) {
  const sheet = $(`#${id}`);
  if (sheet) sheet.hidden = true;
  if (![...document.querySelectorAll('.sheet')].some(candidate => !candidate.hidden)) {
    document.body.classList.remove('sheet-open');
  }
  document.querySelectorAll('#top-menu button[aria-pressed="true"]').forEach(button => {
    button.setAttribute('aria-pressed', 'false');
  });
}

$('#open-company').addEventListener('click', () => openSheet('company-sheet'));
$('#open-island').addEventListener('click', () => openSheet('island-sheet'));
$('#food-runway').addEventListener('click', () => {
  openSheet('island-sheet');
  requestAnimationFrame(() => {
    $('[data-chart="food-stock"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
});
$('#open-building').addEventListener('click', () => {
  if (selectedBuildingId !== null) openSheet('building-sheet');
});
$('#open-events').addEventListener('click', () => openSheet('event-sheet'));
$('#open-development').addEventListener('click', () => openSheet('development-sheet'));
$('#open-tutorial-letters').addEventListener('click', () => openSheet('tutorial-letter-sheet'));
$('#history-goods').addEventListener('change', renderEconomyCharts);
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
$('#building-company-stock').addEventListener('click', event => {
  if (event.target.closest('[data-open-company-stock]')) openSheet('company-sheet');
});
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
$('#continue-tutorial-letter').addEventListener('click', closeTutorialLetter);
$('#tutorial-action').addEventListener('click', () => performGuidanceAction(currentTutorialAction));
$('#secretary-letter-action').addEventListener('click', event => {
  const action = secretaryActionForRoute(currentSecretaryRoute);
  if (!action) return;
  if (action.kind === 'letter') {
    const id = event.currentTarget.dataset.letterId;
    if (id) openTutorialLetter(id);
    return;
  }
  if (action.kind === 'advice-building') {
    guidanceDirector.markAdviceRead(action.adviceId);
    performGuidanceAction(action.target);
  } else if (action.kind === 'event') {
    lastDeliveredSecretaryEventSequence = Math.max(
      lastDeliveredSecretaryEventSequence,
      Number(action.sequence ?? 0),
    );
    focusEvent(eventLog.find(row => row.sequence === action.sequence));
    renderSecretary();
  }
  renderSecretary();
});

const companySheet = $('#company-sheet');
companySheet.addEventListener('input', event => {
  if (!(event.target instanceof HTMLInputElement)) return;
  const row = event.target.closest('.goods-row');
  if (!row?.dataset.goods) return;
  if (event.target.matches('[data-stock-target]')) {
    stockTargetDrafts.set(row.dataset.goods, event.target.value);
    stockTargetFeedback.set(row.dataset.goods, '未反映');
    row.classList.add('dirty');
    setTextIfChanged(row.querySelector('[data-target-feedback]'), '未反映');
  } else if (event.target.matches('[data-release-qty]')) {
    stockReleaseDrafts.set(row.dataset.goods, event.target.value);
  }
});

function applyStockTargetInput(input) {
  const row = input?.closest('.goods-row');
  const goods = row?.dataset.goods;
  if (!goods || !input.matches('[data-stock-target]')) return false;
  const parsed = Number(input.value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    stockTargetDrafts.delete(goods);
    stockTargetFeedback.set(goods, '0以上の数字を入力');
    input.value = String(Math.round(model.stockTargets[goods] ?? 0));
    row.classList.remove('dirty');
    setTextIfChanged(row.querySelector('[data-target-feedback]'), '0以上の数字を入力');
    return false;
  }
  const qty = Math.max(0, Math.round(parsed));
  if (!stockTargetDrafts.has(goods) && qty === Math.round(model.stockTargets[goods] ?? 0)) return true;
  const result = applyEngineOperation({ type: 'set_stock_target', goods, qty },
    `${GOODS_LABELS[goods]}の買上げ目標を${qty}荷にしました`, '目標を設定できません');
  if (result?.ok === false) {
    stockTargetFeedback.set(goods, '設定できません');
    setTextIfChanged(row.querySelector('[data-target-feedback]'), '設定できません');
    return false;
  }
  stockTargetDrafts.delete(goods);
  stockTargetFeedback.set(goods, '設定済み');
  input.value = String(qty);
  row.classList.remove('dirty');
  row.classList.add('applied');
  setTextIfChanged(row.querySelector('[data-target-feedback]'), '設定済み');
  return true;
}

companySheet.addEventListener('keydown', event => {
  if (event.key !== 'Enter' || !event.target.matches('[data-stock-target]')) return;
  event.preventDefault();
  applyStockTargetInput(event.target);
  event.target.blur();
});
companySheet.addEventListener('pointerdown', event => {
  const control = event.target.closest('button, input, select, textarea');
  if (!control) return;
  companyEditingInput = isEditableTarget(control) ? control : null;
  companyInteractionPointers.add(event.pointerId);
});
companySheet.addEventListener('mousedown', event => {
  const control = event.target.closest('button, input, select, textarea');
  if (!control) return;
  companyEditingInput = isEditableTarget(control) ? control : null;
  companyMouseInteraction = true;
});
companySheet.addEventListener('focusin', event => {
  if (isEditableTarget(event.target)) companyEditingInput = event.target;
});
companySheet.addEventListener('focusout', event => {
  if (companyEditingInput !== event.target) return;
  if (event.target.matches('[data-stock-target]')) applyStockTargetInput(event.target);
  companyEditingInput = null;
  queueCompanyInteractionRelease();
});

function queueCompanyInteractionRelease() {
  if (companyInteractionPointers.size > 0
    || companyMouseInteraction || companyInteractionReleasePending) return;
  companyInteractionReleasePending = true;
  requestAnimationFrame(() => {
    if (companyInteractionPointers.size > 0 || companyMouseInteraction) {
      companyInteractionReleasePending = false;
      return;
    }
    companyInteractionReleasePending = false;
    if (!companySheet.hidden
      && !companyEditingInput && !isEditableTarget(document.activeElement)) renderCompanySheet();
  });
}

function releaseCompanyInteraction(event) {
  if (!companyInteractionPointers.delete(event.pointerId)) return;
  queueCompanyInteractionRelease();
}

window.addEventListener('pointerup', releaseCompanyInteraction);
window.addEventListener('pointercancel', event => {
  companyInteractionPointers.delete(event.pointerId);
  companyMouseInteraction = false;
  queueCompanyInteractionRelease();
});
window.addEventListener('mouseup', () => {
  if (!companyMouseInteraction) return;
  companyMouseInteraction = false;
  queueCompanyInteractionRelease();
});

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
  if (action === 'purchase-cart') {
    applyEngineOperation(
      { type: 'purchase_company_cart' },
      '会社の木の荷車を1台購入しました',
      '購入できる木の荷車または会社資金がありません',
    );
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
  if (action === 'release-stock') {
    const input = button.closest('.goods-row').querySelector('[data-release-qty]');
    const available = Math.floor(model.companyStock[goods] ?? 0);
    const qty = Math.min(available, Math.max(1, Math.round(Number(input.value) || 0)));
    if (available < 1 || qty < 1) {
      $('#status span').textContent = '市場へ出せる会社在庫がありません';
      return;
    }
    const result = applyEngineOperation({ type: 'release_stock', goods, qty },
      `${GOODS_LABELS[goods]} ${qty}荷を倉庫から市場へ運びます`, '市場へ出せる在庫または経路がありません');
    if (result?.ok !== false) {
      stockReleaseDrafts.delete(goods);
      stockReleaseDays.push({ day: model.day, goods, qty });
    }
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
  setTextIfChanged('#tracking-label', `${goods}${amount}`);
  setTextIfChanged('#tracking-route', `${carrier.from?.label ?? '出所不明'} → ${carrier.to?.label ?? '行き先不明'}`);
  setTextIfChanged('#tracking-kind', carrier.kind === 'cart' ? '荷車を追跡中' : '徒歩便を追跡中');
  setHiddenIfChanged('#tracking', false);
  setTextIfChanged($('#status span'), `${goods}の行方を地図上で追跡します`);
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

function hideStartScreen() {
  $('#start-screen').hidden = true;
  document.body.classList.remove('choosing-start');
  for (const element of gameUiElements) element.inert = false;
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
  uiMetrics.domWrites = 0;
  uiMetrics.componentRenders = 0;
  uiMetrics.componentSkips = 0;
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
  get tutorialHandoff() { return structuredClone(currentTutorialHandoff); },
  get tutorialTransitionPending() { return tutorialTransitionPending; },
  get pressedMovementKeys() { return [...pressedMovementKeys]; },
  get eventLog() { return eventLog.map(row => ({ ...row })); },
  get economyHistory() { return structuredClone(economyHistory); },
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
  hideStartScreen();
  $('#status span').textContent = startMode === 'tutorial'
    ? 'エレナの案内で未開拓島から開始しました'
    : `${START_MODES[startMode].shortLabel}で開始しました`;
} else {
  showStartScreen();
}

if (SPEEDS.length !== 4) throw new Error('speed controls and speed definitions must stay aligned');

window.__SHIOJI_BOOT__?.ready();
