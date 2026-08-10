import { IsometricCamera } from './camera.js?v=v004.44.4-export-balance';
import { SimulationClock } from './clock.js?v=v004.44.4-export-balance';
import { createBoundaryEvents } from './boundary_events.js?v=v004.44.4-export-balance';
import {
  BUILD_CATEGORIES, BUILDING_ART, BUILDING_SIZES, GOODS_ART, GOODS_LABELS, JOB_ICONS, JOB_LABELS,
  PLACEMENT_JOBS, SECTION_LABELS, SPEEDS, VERSION, toDenari,
} from './config.js?v=v004.44.4-export-balance';
import {
  DISPLAY_BATCH_TICKS, advanceInBatches, displayBatchSizeFor,
} from './display_batch.js?v=v004.44.4-export-balance';
import { BUILD_COST_DENARI, createEngineController } from './engine_bridge.js?v=v004.44.4-export-balance';
import { developmentMapView } from './development_map.js?v=v004.44.4-export-balance';
import { presentEvent, shouldPresentEvent } from './event_view.js?v=v004.44.4-export-balance';
import { formatElenaSpeech } from './elena_text.js?v=v004.44.4-export-balance';
import {
  FOOD_GOODS,
  foodHudSummary,
  householdFoodDays,
  islandFoodSummary,
  winterFoodForecast,
} from './food_readability.js?v=v004.44.4-export-balance';
import {
  isEditableTarget, movementKey, panCameraFromKeys, shouldIgnoreShortcut,
} from './keyboard.js?v=v004.44.4-export-balance';
import { goodsSpriteSvgMarkup } from './goods_sprites.js?v=v004.44.4-export-balance';
import { createGoodsDiscovery } from './goods_discovery.js?v=v004.44.4-export-balance';
import { goodsDetail } from './goods_detail.js?v=v004.44.4-export-balance';
import { previewBuildingPlacement, previewRoadPlacement, tileKey } from './placement.js?v=v004.44.4-export-balance';
import { WorldPresentation } from './presentation.js?v=v004.44.4-export-balance';
import { Renderer } from './renderer.js?v=v004.44.4-export-balance';
import {
  createSavePayload, parseSaveText, readLocalSave, saveFileName, writeLocalSave,
} from './save_game.js?v=v004.44.4-export-balance';
import { createSeasonalEvents } from './seasonal_events.js?v=v004.44.4-export-balance';
import { START_MODES, parseStartMode, urlForStartMode } from './start_modes.js?v=v004.44.4-export-balance';
import {
  GOODS_GLYPHS, shortageRows, stockWhereabouts, supplyDemandRow, supplyDemandRows,
} from './supply_demand.js?v=v004.44.4-export-balance';
import { createTutorialDirector, createTutorialDirectorForMode } from './tutorial_director.js?v=v004.44.4-export-balance';
import {
  guidanceReadingTimeMs, objectiveActionFor, secretaryActionForRoute, secretaryEventsAfter,
  secretaryRouteFor, tutorialHandoffFor, tutorialSpeedAfterObjectiveChange,
} from './ui_guidance.js?v=v004.44.4-export-balance';
import { islandCalendar, islandHealthSummary, recentCompanySummary } from './ui_summary.js?v=v004.44.4-export-balance';

const $ = selector => document.querySelector(selector);
const canvas = $('#world');
const requestedStartMode = parseStartMode(location.search);
const resumeRequested = new URLSearchParams(location.search).get('resume') === '1';
let storedSave = null;
let storedSaveError = null;
try {
  storedSave = readLocalSave(localStorage);
} catch (error) {
  storedSaveError = error;
}
const startupSave = resumeRequested ? storedSave : null;
const startMode = startupSave?.mode ?? requestedStartMode ?? 'sandbox';
const controller = createEngineController({
  seed: 11,
  mode: startMode,
  stateSnapshot: startupSave?.engineState ?? null,
  inputJournal: startupSave?.inputJournal ?? [],
});
const camera = new IsometricCamera();
const renderer = new Renderer(canvas, camera);
const clock = new SimulationClock({ speedIndex: requestedStartMode || startupSave ? 1 : 0 });
let model = controller.readModel();
const goodsDiscovery = createGoodsDiscovery({
  goodsIds: Object.keys(GOODS_LABELS),
  mode: startMode,
  model,
  state: startupSave?.goodsDiscovery ?? null,
  suppressInitialAnnouncements: Boolean(startupSave && !startupSave.goodsDiscovery),
});
const seasonalEvents = createSeasonalEvents({
  model,
  state: startupSave?.seasonalEvents ?? null,
  suppressInitialAnnouncements: Boolean(startupSave && !startupSave.seasonalEvents),
});
const boundaryEvents = createBoundaryEvents({
  model,
  state: startupSave?.boundaryEvents ?? null,
});
const tutorialDirector = createTutorialDirectorForMode(startMode, {
  state: startupSave?.tutorialState ?? null,
});
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
let selectedSupplyGoods = null;
let focusedSupplyGoods = null;
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
const HISTORY_DAYS = 180;
const economyHistory = (startupSave?.economyHistory ?? []).slice(-HISTORY_DAYS);
let lastAutosaveDay = startupSave?.summary?.day ?? null;
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

function setHtmlIfChanged(target, value) {
  const element = typeof target === 'string' ? $(target) : target;
  const html = String(value);
  if (!element || element.innerHTML === html) return false;
  element.innerHTML = html;
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
  const foodForecast = winterFoodForecast(currentModel);
  const row = {
    day: currentModel.day,
    foodImported: food.imported,
    foodProduced: food.produced,
    foodConsumed: food.consumed,
    foodStock: foodSummary.available,
    companyFoodStock: foodSummary.companyReserve,
    foodRequired: foodForecast.required,
    foodRunwayDays: foodSummary.runwayDays,
    population: currentModel.population,
    productivity: Number.isFinite(currentModel.productivity?.efficiency)
      ? currentModel.productivity.efficiency * 100 : null,
    productivityActual: currentModel.productivity?.actual ?? 0,
    productivityIdeal: currentModel.productivity?.ideal ?? 0,
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
  const paths = series.map(row => {
    const classes = `chart-line ${row.reference ? 'reference' : ''} ${row.className ?? ''}`;
    return `<path d="${linePath(rows, row.value, { minValue: min, maxValue: max })}" class="${classes}" style="stroke:${row.color}"/>`;
  }).join('');
  const endLabels = series.map((row, index) => {
    const value = row.value(rows.at(-1));
    const y = 94 - ((value - min) / Math.max(1e-9, max - min)) * 87;
    const adjustedY = Math.max(9, Math.min(91, y + (index % 2 ? 5 : -2)));
    return `<text x="309" y="${adjustedY.toFixed(1)}" text-anchor="end" class="chart-end-label" style="fill:${row.color}">${escapeHtml(row.label)}</text>`;
  }).join('');
  return `${grid}${labels}${paths}${endLabels}`;
}

function goodsIconMarkup(goods) {
  const art = GOODS_ART[goods] ?? { color: '#a89d84', dark: '#5d574b' };
  return `<i class="goods-icon" aria-hidden="true">${goodsSpriteSvgMarkup(goods, art)}</i>`;
}

function makerIconMarkup(job) {
  return `<span class="maker-icon" title="${escapeHtml(JOB_LABELS[job] ?? job)}"
    aria-label="${escapeHtml(JOB_LABELS[job] ?? job)}">
    <i aria-hidden="true">${escapeHtml(JOB_ICONS[job] ?? '作')}</i>
    <small>${escapeHtml(JOB_LABELS[job] ?? job)}</small>
  </span>`;
}

function goodsFormulaPart(goods) {
  return `<span class="goods-formula-item">${goodsIconMarkup(goods)}<small>${escapeHtml(GOODS_LABELS[goods] ?? goods)}</small></span>`;
}

function goodsRecipeMarkup(detail) {
  const { recipe } = detail;
  const terms = recipe.inputs.map(goodsFormulaPart);
  for (const alternatives of recipe.alternatives) {
    terms.push(`<span class="goods-formula-choice">${alternatives.map(goodsFormulaPart).join('<b aria-hidden="true">/</b>')}</span>`);
  }
  for (const goods of recipe.optional) {
    terms.push(`<span class="goods-formula-optional" title="加えると歩留まりが上がります">(${goodsFormulaPart(goods)})</span>`);
  }
  const inputs = terms.length
    ? terms.join('<b class="goods-formula-plus" aria-hidden="true">＋</b>')
    : recipe.makers.map(makerIconMarkup).join('<b class="goods-formula-plus" aria-hidden="true">/</b>');
  const inputLabels = [
    ...recipe.inputs.map(goods => GOODS_LABELS[goods] ?? goods),
    ...recipe.alternatives.map(group => group.map(goods => GOODS_LABELS[goods] ?? goods).join('または')),
    ...recipe.optional.map(goods => `任意の${GOODS_LABELS[goods] ?? goods}`),
  ];
  const makerLabels = recipe.makers.map(job => JOB_LABELS[job] ?? job).join('または');
  const formulaLabel = `${inputLabels.length ? `${inputLabels.join('と')}を` : ''}${makerLabels}が${GOODS_LABELS[recipe.output] ?? recipe.output}にする`;
  return `<div class="goods-formula" role="img" aria-label="${escapeHtml(formulaLabel)}">
    <div class="goods-formula-equation">${inputs}<b class="goods-formula-arrow" aria-hidden="true">→</b>${goodsFormulaPart(recipe.output)}</div>
    ${recipe.inputs.length || recipe.alternatives.length || recipe.optional.length
    ? `<div class="goods-formula-makers">${recipe.makers.map(makerIconMarkup).join('')}</div>`
    : ''}
  </div>`;
}

function shelfLifeMarkup(detail) {
  if (detail.shelfLifeDays === null) {
    return `<div class="shelf-life-art stable" role="img" aria-label="${escapeHtml(GOODS_LABELS[detail.goods])}は腐らない品">
      <span>${goodsIconMarkup(detail.goods)}</span><b aria-hidden="true">∞</b>
    </div><p><small>日持ち</small><strong>腐りません</strong></p>`;
  }
  return `<div class="shelf-life-art perishable" role="img"
      aria-label="${escapeHtml(GOODS_LABELS[detail.goods])}は約${detail.shelfLifeDays}日で傷む">
    <span class="fresh">${goodsIconMarkup(detail.goods)}</span>
    <i aria-hidden="true"></i>
    <span class="aging">${goodsIconMarkup(detail.goods)}</span>
    <i aria-hidden="true"></i>
    <span class="spoiled">${goodsIconMarkup(detail.goods)}</span>
  </div><p><small>傷むまで</small><strong>約${detail.shelfLifeDays}日</strong></p>`;
}

function currentSupplyRows() {
  return supplyDemandRows(model, economyHistory, goodsDiscovery.knownGoods());
}

function formatSupplyDays(days) {
  if (!Number.isFinite(days)) return '—';
  if (days >= 100) return '99+日';
  return `${Math.max(0, Math.floor(days))}日`;
}

const SUPPLY_SOURCE_LABELS = Object.freeze({
  households: '暮らし', order: '本国注文', winter: '冬支度',
  local_construction: '現地建設', building_repair: '建物修繕', road_paving: '石畳工事',
  work_tools: '作業道具', other: 'その他の利用',
});

function supplySourceLabel(source) {
  return SUPPLY_SOURCE_LABELS[source] ?? JOB_LABELS[source] ?? source;
}

function renderShortageAlerts() {
  const rows = shortageRows(currentSupplyRows());
  const signature = rows.map(row => `${row.goods}:${row.shortage.toFixed(2)}`).join('|');
  renderIfChanged('shortage-alerts', signature, () => {
    const alerts = $('#shortage-alerts');
    alerts.innerHTML = rows.map(row => `
      <button type="button" data-shortage-goods="${row.goods}"
        title="${escapeHtml(GOODS_LABELS[row.goods])}が1日${formatQuantity(row.shortage)}荷不足。押すと需給の該当行を開きます"
        aria-label="${escapeHtml(GOODS_LABELS[row.goods])}、1日${formatQuantity(row.shortage)}荷不足">
        ${goodsIconMarkup(row.goods)}
      </button>`).join('');
    setHiddenIfChanged(alerts, rows.length === 0);
    document.body.classList.toggle('supply-alert-active', rows.length > 0);
    uiMetrics.domWrites += 1;
  });
}

function renderSupplySheet() {
  const rows = currentSupplyRows();
  const network = model.marketNetwork;
  const networkNode = $('#market-network-summary');
  const networkSignature = JSON.stringify({
    summary: network?.summary ?? [],
    receipts: (network?.tradeReceipts ?? []).slice(-3),
  });
  renderIfChanged('market-network-summary', networkSignature, () => {
    if (!network?.summary?.length || network.summary.length < 2) {
      networkNode.hidden = true;
      networkNode.innerHTML = '';
      return;
    }
    networkNode.hidden = false;
    const receipts = (network.tradeReceipts ?? []).slice(-3);
    const receiptText = receipts.length
      ? `<small class="market-trade-receipts">最近の交易: ${receipts.map(receipt => `${escapeHtml(receipt.goods)} ${formatQuantity(receipt.quantity)}荷 / ${receipt.profit >= 0 ? '+' : ''}${formatQuantity(receipt.profit)}D`).join('・')}</small>`
      : '';
    networkNode.innerHTML = `<b>市場圏</b>${network.summary.map(row => `
      <span class="market-network-chip"><strong>${escapeHtml(row.name)}</strong><small>${row.households}世帯・${row.buildings}建物</small><em>平均${formatQuantity(row.averageDistance)}歩</em></span>
    `).join('')}<small class="market-network-note">各世帯は、実際の道のりが最も短い市場に属します。道を整えると市場圏が変わり、相場と不足も市場ごとに変わります。</small>${receiptText}`;
  });
  const signature = JSON.stringify({ rows, focusedSupplyGoods, networkSignature });
  renderIfChanged('supply-grid', signature, () => {
    $('#supply-grid').innerHTML = rows.length ? rows.map(row => {
      const supplyTotal = row.supply;
      const consumedTotal = row.consumed + row.exported;
      const scale = Math.max(supplyTotal, row.demand, 0.02);
      const pct = value => `${Math.min(100, (value / scale) * 100).toFixed(1)}%`;
      const trendClass = row.priceTrend.direction === 'up' ? 'trend-up'
        : row.priceTrend.direction === 'down' ? 'trend-down' : '';
      const whereabouts = stockWhereabouts(model, row.goods)
        .map(place => `${place.label} ${formatQuantity(place.amount)}荷`).join('・');
      const breakdown = `1日あたりの供給は${formatQuantity(supplyTotal)}荷（生産${formatQuantity(row.produced)}、仕入${formatQuantity(row.imported)}）。`
        + `需要は${formatQuantity(row.demand)}荷（消費${formatQuantity(consumedTotal)}、不足${formatQuantity(row.shortage)}）です。`
        + `${whereabouts ? `所在は${whereabouts}です。` : ''}`;
      return `<button type="button" class="supply-row"
        data-supply-goods="${row.goods}" data-status="${row.status}"
        data-focused="${String(row.goods === focusedSupplyGoods)}"
        title="${escapeHtml(breakdown)}"
        aria-label="${escapeHtml(GOODS_LABELS[row.goods])}、${row.statusLabel}。1日あたり供給${formatQuantity(supplyTotal)}荷、需要${formatQuantity(row.demand)}荷、消費${formatQuantity(consumedTotal)}荷、不足${formatQuantity(row.shortage)}荷。品目詳細を開く">
        <span class="supply-head">
          ${goodsIconMarkup(row.goods)}
          <span class="supply-name"><b>${escapeHtml(GOODS_LABELS[row.goods])}</b></span>
          <small class="supply-badge">${row.statusLabel}</small>
          <span class="supply-number supply-days"><small>${row.status === 'no_demand' ? '' : '在庫'}</small><b>${row.status === 'no_demand' ? '需要なし' : `${formatSupplyDays(row.daysRemaining)}分`}</b></span>
        </span>
        <span class="supply-bars" aria-hidden="true">
          <span class="supply-bar"><small>供給</small><span class="bar-track"><i class="seg-prod" style="width:${pct(row.produced)}"></i><i class="seg-imp" style="width:${pct(row.imported)}"></i></span><b>${formatQuantity(supplyTotal)}</b></span>
          <span class="supply-breakdown"><small>生産 ${formatQuantity(row.produced)}</small><small>仕入 ${formatQuantity(row.imported)}</small></span>
          <span class="supply-bar"><small>需要</small><span class="bar-track"><i class="seg-cons" style="width:${pct(consumedTotal)}"></i><i class="seg-shortage" style="width:${pct(row.shortage)}"></i></span><b>${formatQuantity(row.demand)}</b></span>
          <span class="supply-breakdown demand-breakdown"><small>消費 ${formatQuantity(consumedTotal)}</small><small>不足 ${formatQuantity(row.shortage)}</small></span>
        </span>
        <span class="supply-foot">
          <span class="supply-number${row.undelivered ? ' undelivered' : ''}"><small>市場</small><b>${formatQuantity(row.marketStock)}荷</b></span>
          <span class="supply-number"><small>島全体</small><b>${formatQuantity(row.stock)}荷</b></span>
          <span class="supply-number ${trendClass}"><small>相場</small><b>${row.price === null ? '—' : `${formatQuantity(row.price)}D ${row.priceTrend.arrow}`}</b></span>
        </span>
      </button>`;
    }).join('') : '<p class="sheet-note goods-empty">まだ島に品がありません</p>';
    uiMetrics.domWrites += 1;
  });
}

recordEconomyHistory(model);

const HOUSEHOLD_STATE_LABELS = Object.freeze({
  home: '在宅', toMarket: '市場へ移動中', atMarket: '市場で取引中',
  toSupplier: '近所へ買付中', atSupplier: '生産者から買付中',
  fromMarket: '帰宅中', toHome: '帰宅中', working: '仕事中', toWork: '仕事場へ移動中',
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
  goodsDiscovery.observe(model);
  seasonalEvents.observe(model);
  boundaryEvents.observe(model);
  recordEconomyHistory(model);
  guidanceDirector.observe(model, events);
  if (model.day > 0 && model.day % 5 === 0 && model.day !== lastAutosaveDay) {
    persistCurrentSave();
  }
  return events;
}

function renderHud() {
  uiMetrics.domUpdates += 1;
  syncSelectedBuilding();
  setTextIfChanged('#build-version', VERSION);
  setTextIfChanged('#start-mode-label', START_MODES[startMode].shortLabel);
  setTextIfChanged('#funds-value', formatNumber(toDenari(model.companyMoney)));
  setTextIfChanged('#day-value', `${model.day}日目`);
  const calendar = islandCalendar(model.day, model.calendarOffsetDays);
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
  renderShortageAlerts();
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
  if (!$('#supply-sheet').hidden) renderSupplySheet();
  if (!$('#goods-detail-sheet').hidden) renderGoodsDetailSheet();
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
  const productivityHint = preview.productivity?.kind
    ? preview.productivity.target
      ? `資源まで片道${preview.productivity.oneWayTicks.toFixed(1)}刻・実働${Math.round(preview.productivity.workTicks)}/30刻・予測日産${preview.productivity.dailyOutput.toFixed(1)}荷（${Math.round(preview.productivity.efficiency * 100)}%）`
      : '資源へ歩いて行けないため、予測日産はほぼ0です'
    : preview.productivity?.supplier
      ? preview.productivity.directEligible
        ? `近所の${JOB_LABELS[preview.productivity.supplier.job] ?? preview.productivity.supplier.job}が仕入候補・市場往復より約${preview.productivity.savedTicks.toFixed(1)}刻短縮`
        : `最寄り原料元まで片道${preview.productivity.supplier.distance.toFixed(1)}刻（市場経由の方が近い配置です）`
      : preview.productivity ? '近所に原料の生産者はいません。市場から調達します' : null;
  setToolHint(preview.ok
    ? productivityHint ?? (activeTool === 'road' ? 'この線へ道路を敷設します' : 'この位置で確定できます')
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
  if (!pointers.has(event.pointerId)) {
    const slot = renderer.hitTestInventory(displayModel, point.x, point.y);
    setToolHint(slot
      ? `${GOODS_LABELS[slot.row.goods] ?? slot.row.goods} ${formatQuantity(slot.row.amount)}荷`
      : null);
    return;
  }
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
canvas.addEventListener('pointerleave', () => {
  if (!activeTool && pointers.size === 0) setToolHint(null);
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
        <p class="order-goods"><b>${goodsIconMarkup(active.g)}<span>${GOODS_LABELS[active.g] ?? active.g}・納品済み ${formatQuantity(shipped)} / ${formatQuantity(active.qty)}荷</span></b></p>
        <p class="order-progress">残り <b>${formatQuantity(active.left)}荷</b>・期限まで <b>あと${daysLeft}日</b>（${active.due}日目まで）</p>
        <p>全量を期限内に納めた時だけ完遂です。船が出ても残りがあれば注文は続きます。</p>
        <p>完遂決済単価 ${formatQuantity(active.price * 1.25 * 10)}デナリ（注文基準 ${formatQuantity(active.price * 10)}）</p>`;
    } else if (offer && dismissedOfferKey === orderKey(offer)) {
      $('#order-panel').innerHTML = `
        <h3>注文状を見送り中</h3>
        <p class="order-goods">${goodsIconMarkup(offer.g)}<span>${GOODS_LABELS[offer.g] ?? offer.g} ${formatQuantity(offer.qty)}荷。島の状態と操作記録は変えず、期限まで観察できます。</span></p>
        <div class="order-actions"><button type="button" data-company-action="reconsider">再検討する</button></div>`;
    } else if (offer) {
      const cheapest = model.marketLowest[offer.g];
      const marketText = Number.isFinite(cheapest)
        ? `${formatQuantity(cheapest * 10)}デナリ`
        : '市場在庫なし';
      $('#order-panel').innerHTML = `
        <h3>本国から注文状</h3>
        <p class="order-goods"><b>${goodsIconMarkup(offer.g)}<span>${GOODS_LABELS[offer.g] ?? offer.g} ${formatQuantity(offer.qty)}荷</span></b>・期限 ${offer.due}日目</p>
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
  const visibleGoods = goodsDiscovery.knownGoods();
  const signature = JSON.stringify(visibleGoods.map(goods => [
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
    $('#company-goods').innerHTML = visibleGoods.length ? visibleGoods.map(goods => {
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
          <span class="goods-identity">${goodsIconMarkup(goods)}<span><b>${GOODS_LABELS[goods]}</b><small>倉庫 ${formatQuantity(stock)}荷</small></span></span>
          <label class="target-editor"><span>買上げ目標</span><input data-stock-target type="number" min="0" step="1" value="${escapeHtml(targetValue)}" aria-label="${GOODS_LABELS[goods]}の買上げ目標"><small data-target-feedback>${escapeHtml(feedback)}</small></label>
          <div class="release-quote"><small>平均仕入 ${Number.isFinite(averageCost) ? `${formatQuantity(toDenari(averageCost))}D/荷` : '—'}</small><small>市場へ出す希望単価 ${Number.isFinite(releaseQuote) ? `${formatQuantity(toDenari(releaseQuote))}D/荷` : '—'}</small></div>
          <label class="release-editor"><span>市場へ出す量</span><input data-release-qty type="number" min="1" max="${Math.max(1, Math.floor(stock))}" step="1" value="${escapeHtml(releaseValue)}" aria-label="${GOODS_LABELS[goods]}を市場へ出す量"><small>荷</small></label>
          <button type="button" data-company-action="release-stock" data-goods="${goods}" ${stock < 1 ? 'disabled' : ''}>市場へ出す</button>
        </div>`;
    }).join('') : '<p class="sheet-note goods-empty">まだ島に品がありません</p>';
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
        <small>${row.details || '島からの知らせ'}</small>
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
  const nextSpeed = tutorialSpeedAfterObjectiveChange({
    previousObjective: lastTutorialObjective,
    objective,
    previousAction: currentTutorialAction,
    speedIndex: clock.speedIndex,
  });
  if (nextSpeed !== clock.speedIndex) setSpeed(nextSpeed);
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
      detail: `${JOB_LABELS[selected.type] ?? selected.type}の暮らしと在庫を開きます`,
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
    incident: seasonalEvents.currentMessage(),
    boundary: boundaryEvents.currentMessage(),
    discovery: goodsDiscovery.currentMessage(),
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
    const speech = currentSecretaryRoute.speech ?? '島の様子を、引き続き見ていきましょう。';
    setTextIfChanged('#secretary-speech', formatElenaSpeech(speech, {
      maxLines: canFollowTarget ? 2 : 3,
    }));
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
        : delivery === 'goods-discovery'
          ? guidanceReadingTimeMs(route.speech, { minimumMs: TUTORIAL_MESSAGE_MINIMUM_MS })
        : delivery === 'seasonal-event'
          ? guidanceReadingTimeMs(route.speech, { minimumMs: TUTORIAL_MESSAGE_MINIMUM_MS })
        : delivery === 'boundary-event'
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
    else if (delivery === 'goods-discovery') goodsDiscovery.markAnnounced(target.id);
    else if (delivery === 'seasonal-event') seasonalEvents.markAnnounced(target.id);
    else if (delivery === 'boundary-event') boundaryEvents.markAnnounced(target.id);
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
  else if (action.kind === 'sheet') {
    if (action.sheet === 'supply-sheet') focusedSupplyGoods = action.goods ?? null;
    openSheet(action.sheet);
  }
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
  const roadConnected = model.roadConnection?.buildings
    ?.find(row => row.id === building.id)?.connected ?? true;
  const signature = JSON.stringify({
    building,
    household,
    roadConnected,
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
    const growthPercent = Math.max(0, Math.min(100, growthRatio * 100));
    const delivery = household.foodDelivery;
    const marketRhythm = household.marketRhythm;
    const productivity = household.productivity;
    const productivityPercent = Number.isFinite(productivity?.efficiency)
      ? Math.round(productivity.efficiency * 100) : null;
    const workTool = household.workTool;
    const workToolLabel = workTool.kind === 'iron'
      ? `鉄の道具（残り${Math.max(0, Math.ceil(workTool.durability))}日・生産120%）`
      : workTool.kind === 'wood'
        ? `木の道具（残り${Math.max(0, Math.ceil(workTool.durability))}日・生産100%）`
        : '素手（生産75%）';
    const missingGoodsMarkup = growth?.missingGoodsForCurrent?.map(goodsIconMarkup).join('') ?? '';
    const repairNotice = building.conditionStatus === 'needs_repair'
      ? `要修繕（状態 ${Math.round(building.condition)}%）`
      : building.conditionStatus === 'worn'
        ? `建物に傷みあり（状態 ${Math.round(building.condition)}%）`
        : `建物は良好（状態 ${Math.round(building.condition)}%）`;
    const headline = household.hungerRun >= 10 || foodDays < 3
      ? `⚠ ${delivery?.label ?? `食料があと${Math.max(0, Math.floor(foodDays))}日分`}`
      : !roadConnected ? '⚠ 市場へ道がつながっていません'
        : household.insolvencyMonths >= 3 ? '⚠ 暮らしの資金が続いていません'
          : missingKeep.length ? `⚠ ${missingKeep[0]}が不足し、今の暮らしを保てません`
            : '順調';
    const headlineTone = headline.startsWith('⚠') ? 'warning' : 'good';
    $('#building-summary').innerHTML = `
      <div class="building-health" data-tone="${headlineTone}">${escapeHtml(headline)}</div>
      <div class="building-health" data-tone="${building.conditionStatus === 'good' ? 'good' : 'warning'}">${escapeHtml(repairNotice)}</div>`;
    const outputRows = building.shelves.filter(row => row.section === 'output' && row.amount > 1e-9);
    const outputNow = outputRows.length
      ? outputRows.map(row => `<span class="goods-inline">${goodsIconMarkup(row.goods)}<span>${escapeHtml(GOODS_LABELS[row.goods] ?? row.goods)} ${formatQuantity(row.amount)}荷</span></span>`).join('<span aria-hidden="true">・</span>')
      : '製品棚は空';
    const conversionMarkup = selectedConversion ? `
      <div class="conversion-chain">
        <span><small>原料棚</small><b class="goods-inline">${goodsIconMarkup(selectedConversion.inputGoods)}<span>${escapeHtml(GOODS_LABELS[selectedConversion.inputGoods] ?? selectedConversion.inputGoods)} ${formatQuantity(selectedConversion.inputAmount)}荷</span></b></span>
        <b>→</b>
        <span><small>製品棚</small><b class="goods-inline">${goodsIconMarkup(selectedConversion.goods)}<span>${escapeHtml(GOODS_LABELS[selectedConversion.goods] ?? selectedConversion.goods)} ${formatQuantity(selectedConversion.outputAmount)}荷</span></b></span>
      </div>
      <small>1日あたり（30日ならし）${formatQuantity(selectedConversion.productionEma)}荷・実原価 ${formatQuantity(selectedConversion.cost * 10)}デナリ/荷</small>` : '';
    // 出たり消えたりする札を作らない。行数固定のスロットに文面だけ入れ替える。
    const stateLabel = HOUSEHOLD_STATE_LABELS[household.state] ?? household.state;
    const rhythmShort = marketRhythm
      ? (marketRhythm.kind === 'travelling' ? '往復中' : escapeHtml(marketRhythm.label.replace('出荷をまとめ中 ', 'まとめ中 ')))
      : '今日は出ない';
    const flow = delivery
      ? { tone: delivery.tone === 'blocked' ? 'warning' : delivery.tone, icons: delivery.goods ?? [], text: `${delivery.label}——${delivery.detail}` }
      : marketRhythm
        ? { tone: 'plain', icons: [], text: `${marketRhythm.label}——${marketRhythm.detail}` }
        : { tone: 'plain', icons: [], text: '今日は市場の便を出さず、家で仕事をしています。' };
    const idealActive = productivity?.ideal > 1e-9;
    const productionNow = idealActive && productivity.days > 0
      ? `${formatQuantity(productivity.actual)}荷/日` : idealActive ? '観測中' : '—';
    const productionIdeal = idealActive ? `${formatQuantity(productivity.ideal)}荷/日` : '—';
    const productionRate = idealActive && productivityPercent !== null ? `${productivityPercent}%` : '—';
    const productionTone = !idealActive || productivityPercent === null ? 'good'
      : productivityPercent >= 80 ? 'good' : productivityPercent >= 50 ? 'warning' : 'danger';
    const cause = !idealActive
      ? (building.type === 'wheat' ? '麦は9月の収穫でまとめて実ります。'
        : ['veg', 'rapeseed', 'fisher2'].includes(building.type) ? '今の季節にする仕事はありません。'
          : '日々の生産で数える仕事ではありません。')
      : productivity.resourceWork
        ? `${productivity.resourceWork.kind === 'forest' ? '森' : '漁場'}まで片道 ${Number.isFinite(productivity.resourceWork.oneWayTicks) ? productivity.resourceWork.oneWayTicks.toFixed(1) : '到達不能'}刻——通いの時間が実働 ${Math.round(productivity.resourceWork.workTicks)}/30刻を決めています。`
        : productivity.lastDirectTrade
          ? `近所から${GOODS_LABELS[productivity.lastDirectTrade.goods] ?? productivity.lastDirectTrade.goods}を直接 ${formatQuantity(productivity.lastDirectTrade.qty)}荷仕入れ、市場往復より ${formatQuantity(productivity.lastDirectTrade.savedTicks)}刻の節約。`
          : '生産を妨げるものは見えていません。';
    householdPanel.innerHTML = `
      <div class="household-vitals" aria-label="家の数字">
        <span><small>食料</small><b>あと${Math.max(0, Math.floor(foodDays))}日分</b></span>
        <span><small>財布</small><b>${purse}</b></span>
        <span><small>最近の収支</small><b>${income}</b></span>
        <span><small>いま</small><b>${escapeHtml(stateLabel)}</b></span>
        <span><small>市場の便</small><b>${rhythmShort}</b></span>
        <span><small>空腹</small><b>${household.hungerWindow ? `${household.hungerDays}/${household.hungerWindow}日` : '記録なし'}</b></span>
      </div>
      <section class="next-living">
        <h3>次の暮らし</h3>
        ${nextNeed ? `<div class="culture-growth ${growth.nextSatisfied ? 'met' : 'missing'}"
          data-state="${missingKeep.length ? 'falling' : growth.nextSatisfied ? 'rising' : 'waiting'}"
          title="${growth.upDays}/${growth.requiredDays}日。必要な暮らしが続くとLv${growth.nextDisplayLevel}になります">
          <b>Lv${growth.nextDisplayLevel}へ：${escapeHtml(nextNeed)}</b>
          <span>${growth.nextSatisfied ? '今日は満たしています' : '今日は不足しています'}</span>
          <i role="progressbar" aria-label="レベルアップの進み具合" aria-valuemin="0"
            aria-valuemax="${growth.requiredDays}" aria-valuenow="${growth.upDays}">
            <i style="width:${growthPercent.toFixed(1)}%"></i>
          </i>
          <small>あと${Math.max(0, growth.requiredDays - growth.upDays)}日（${growth.upDays}/${growth.requiredDays}日）</small>
        </div>` : '<p class="sheet-note">この家は最高の暮らしに達しています。</p>'}
        ${missingKeep.length
    ? `<small class="living-danger"><span class="missing-goods-icons">${missingGoodsMarkup}</span>今のLvを保つには ${escapeHtml(missingKeep.join('・'))} が必要です。段階低下まであと${Math.max(0, growth.downgradeDays - growth.downDays)}日。</small>`
    : '<small class="living-keep">今の暮らしに必要な品は足りています。</small>'}
      </section>
      <section class="job-now">
        <h3>仕事のいま</h3>
        <p class="household-flow" data-tone="${escapeHtml(flow.tone)}">${flow.icons.map(goodsIconMarkup).join('')}${escapeHtml(flow.text)}</p>
        <div class="productivity-card" data-tone="${productionTone}">
          <span><small>30日平均の生産</small><b>${productionNow}</b></span>
          <span><small>順調な日の生産</small><b>${productionIdeal}</b></span>
          <span><small>達成率</small><b>${productionRate}</b></span>
        </div>
        <p class="productivity-tool"><b>作業道具</b>　${escapeHtml(workToolLabel)}</p>
        <p class="productivity-cause">${cause}</p>
        <small class="productivity-level-note">達成率は「順調な日」——移動・品切れ・空腹で手が止まらない日の生産量——を100%とした30日平均です。配置はLv条件へ直接加点せず、増えた生産・収入・供給が暮らしと次のLvを支えます。</small>
        <p class="goods-output-list">${outputNow}</p>
        ${building.type === 'cartwright' ? `<p>販売待ちの荷車 ${building.cartStock.length}台${building.cartWork ? `・製作 ${Math.floor(building.cartWork.progress)}/${building.cartWork.required}日` : ''}</p>` : ''}
        ${conversionMarkup}
      </section>`;
  } else {
    const headline = building.vacant ? '⚠ 働く家族がいません' : '順調';
    const marketProductivity = building.marketProductivity;
    const marketMarkup = marketProductivity ? `
      <div class="market-productivity">
        <b>市場圏14刻：${marketProductivity.buildings}/${marketProductivity.totalBuildings}棟</b>
        <span>平均生産性 ${Number.isFinite(marketProductivity.efficiency) ? `${Math.round(marketProductivity.efficiency * 100)}%` : '観測中'}・実生産 ${formatQuantity(marketProductivity.actual)} / 理想 ${formatQuantity(marketProductivity.ideal)}荷/日</span>
        <span>近隣直接取引 ${marketProductivity.directTrade.trades}回・${formatQuantity(marketProductivity.directTrade.quantity)}荷・移動 ${formatQuantity(marketProductivity.directTrade.savedTicks)}刻短縮</span>
      </div>` : '';
    $('#building-summary').innerHTML = `
      <div class="building-health" data-tone="${building.vacant ? 'warning' : 'good'}">${headline}</div>
      ${marketMarkup}`;
  }

  const shelfPanel = $('#building-shelves');
  const boundedCapacity = row => Number.isFinite(row.capacity)
    && row.capacity > 0 && row.capacity < Number.MAX_SAFE_INTEGER / 2;
  const sectionNames = {
    foodPantry: '家の食料庫', householdGoods: '家の生活用品',
    pantry: '家の保管物', input: '原料棚', output: '製品棚', storage: '保管棚',
    construction: '建築資材', repair: '修繕棚', inbound: '搬入待ち', outbound: '搬出待ち',
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
    return `<div class="shelf-row"><small>${escapeHtml(sectionNames[row.section] ?? SECTION_LABELS[row.section] ?? row.section)}</small><span class="goods-inline">${goodsIconMarkup(row.goods)}<span>${escapeHtml(GOODS_LABELS[row.goods] ?? row.goods)}${meter}</span></span><b>${formatQuantity(row.amount)}${capacity}</b></div>`;
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
        return `<div class="company-stock-row"><span class="company-stock-name">${goodsIconMarkup(goods)}<span><b>${escapeHtml(GOODS_LABELS[goods] ?? goods)}</b><small>${cost}</small></span></span><b>${formatQuantity(amount)}荷</b></div>`;
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
        <span><small>原料棚</small><b class="goods-inline">${goodsIconMarkup(conversion.inputGoods)}<span>${escapeHtml(GOODS_LABELS[conversion.inputGoods] ?? conversion.inputGoods)} ${formatQuantity(conversion.inputAmount)}荷</span></b></span>
        <b>→</b>
        <span><small>産出棚</small><b class="goods-inline">${goodsIconMarkup(conversion.goods)}<span>${escapeHtml(GOODS_LABELS[conversion.goods] ?? conversion.goods)} ${formatQuantity(conversion.outputAmount)}荷</span></b></span>
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

function renderEconomyCharts() {
  const signature = JSON.stringify({ history: economyHistory });
  renderIfChanged('economy-charts', signature, () => {
    const rows = economyHistory;
    setTextIfChanged('#history-status', rows.length < 2
      ? '日が進むと線になります。'
      : `${rows[0].day}日目〜${rows.at(-1).day}日目（このプレイ中の記録）`);
    $('#food-stock-chart').innerHTML = chartMarkup(rows, [
      {
        value: row => row.foodStock + row.companyFoodStock,
        label: '食料',
        color: GOODS_ART.veg.color,
      },
      {
        value: row => row.foodRequired,
        label: '冬必要',
        color: GOODS_ART.wheat.dark,
        reference: true,
      },
    ], { includeZero: false });
    const startingPopulation = rows[0]?.population ?? 0;
    $('#population-chart').innerHTML = chartMarkup(rows, [
      { value: row => row.population, label: '人口', color: '#9fcb76' },
      {
        value: () => startingPopulation,
        label: '開始時',
        color: '#696e67',
        reference: true,
      },
    ], { includeZero: false });
    $('#finance-chart').innerHTML = chartMarkup(rows, [
      { value: row => row.cash, label: '資金', color: '#e5b65b' },
      { value: () => 0, label: '0', color: '#796e5a', reference: true },
    ]);
    uiMetrics.domWrites += 3;
  });
}

function renderGoodsDetailSheet() {
  if (!selectedSupplyGoods) return;
  const detail = goodsDetail(selectedSupplyGoods);
  const supply = supplyDemandRow(model, selectedSupplyGoods, economyHistory);
  const rows = economyHistory;
  const prices = rows.map(row => row.prices[detail.goods]).filter(Number.isFinite);
  const average = prices.length
    ? prices.reduce((total, value) => total + value, 0) / prices.length
    : 0;
  const priceMarkup = chartMarkup(rows, [
    {
      value: row => row.prices[detail.goods] ?? 0,
      label: GOODS_GLYPHS[detail.goods] ?? '品',
      color: GOODS_ART[detail.goods]?.color ?? '#e5b65b',
    },
    {
      value: () => average,
      label: '平均',
      color: GOODS_ART[detail.goods]?.dark ?? '#796e5a',
      reference: true,
    },
  ], { includeZero: false });
  const sourceMarkup = supply.demandSources.length
    ? supply.demandSources.map(source => `<li><span>${escapeHtml(supplySourceLabel(source.source))}</span><b>需要 ${formatQuantity(source.demand)}</b><small>消費 ${formatQuantity(source.consumed)}　不足 ${formatQuantity(source.shortage)}</small></li>`).join('')
    : '<li class="goods-demand-empty">いま必要としている建物はありません。</li>';
  const supplyReason = supply.status === 'undelivered'
    ? '島にはありますが、使う場所へ届いていません。道路と市場への出荷を確認してください。'
    : supply.status === 'shortage'
      ? '島全体の在庫が足りません。生産を増やすか、本土から仕入れてください。'
      : supply.status === 'inventory'
        ? 'いまは在庫で補っています。このままでは在庫が減るため、供給を増やしてください。'
        : supply.status === 'no_demand'
          ? 'いま、この品を必要としている建物はありません。'
          : '現在の供給で需要を満たしています。';
  const signature = JSON.stringify({ detail, rows, supply });
  renderIfChanged('goods-detail-content', signature, () => {
    $('#goods-detail-title').textContent = GOODS_LABELS[detail.goods] ?? detail.goods;
    $('#goods-detail-content').dataset.goods = detail.goods;
    $('#goods-detail-content').innerHTML = `
      <section class="goods-detail-hero" data-detail-element="art">
        <div class="goods-detail-art">${goodsIconMarkup(detail.goods)}</div>
        <p data-detail-element="fact">${escapeHtml(detail.fact)}</p>
      </section>
      <section class="goods-detail-demand" data-detail-element="supply-demand">
        <h3>需給の内訳 <small>1日あたり</small></h3>
        <div class="goods-demand-totals">
          <span><small>供給</small><b>${formatQuantity(supply.supply)}荷</b></span>
          <span><small>需要</small><b>${formatQuantity(supply.demand)}荷</b></span>
          <span data-shortage="${String(supply.shortage > 0.005)}"><small>不足</small><b>${formatQuantity(supply.shortage)}荷</b></span>
        </div>
        <p class="goods-demand-reason" data-status="${supply.status}"><b>${supply.statusLabel}</b>${escapeHtml(supplyReason)}</p>
        <ul class="goods-demand-sources">${sourceMarkup}</ul>
      </section>
      <section class="goods-detail-life" data-detail-element="shelf-life">
        <h3>日持ち</h3>
        ${shelfLifeMarkup(detail)}
      </section>
      <section class="goods-detail-recipe" data-detail-element="recipe">
        <h3>作り方</h3>
        ${goodsRecipeMarkup(detail)}
      </section>
      <figure class="goods-detail-chart" data-detail-element="price-chart">
        <figcaption>相場 <small>デナリ/荷</small></figcaption>
        <svg id="price-chart" viewBox="0 0 320 112" role="img"
          aria-label="${escapeHtml(GOODS_LABELS[detail.goods])}の市場相場の推移">${priceMarkup}</svg>
      </figure>`;
    uiMetrics.domWrites += 1;
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
  const productivity = model.productivity;
  const currentPercent = Number.isFinite(productivity?.efficiency)
    ? productivity.efficiency * 100 : null;
  const previous = [...economyHistory].reverse().find(
    row => row.day <= model.day - 30 && Number.isFinite(row.productivity),
  );
  const delta = currentPercent !== null && previous
    ? currentPercent - previous.productivity : null;
  renderIfChanged('island-productivity', JSON.stringify({
    productivity, currentPercent, delta,
  }), () => {
    setTextIfChanged('#island-productivity-rate', currentPercent === null
      ? '観測中' : `${Math.round(currentPercent)}%`);
    setTextIfChanged('#island-productivity-output',
      `${formatQuantity(productivity?.actual ?? 0)} / ${formatQuantity(productivity?.ideal ?? 0)}荷/日`);
    setTextIfChanged('#island-productivity-loss',
      `資源への遠さで約${formatQuantity(productivity?.resourceDistanceLoss ?? 0)}荷/日を失っています`);
    setTextIfChanged('#island-productivity-direct',
      `近隣直接取引 ${productivity?.directTrade?.trades ?? 0}回・${formatQuantity(productivity?.directTrade?.quantity ?? 0)}荷・${formatQuantity(productivity?.directTrade?.savedTicks ?? 0)}刻短縮`);
    setTextIfChanged('#island-productivity-delta', delta === null
      ? '30日差：観測中' : `30日差：${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pt`);
  });
}

function renderIslandSheet() {
  renderIslandFinance();
  renderEconomyCharts();
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

function currentSavePayload() {
  return createSavePayload({
    gameVersion: VERSION,
    mode: startMode,
    engineState: controller.saveState(),
    inputJournal: controller.inputJournal(),
    tutorialState: tutorialDirector?.readState() ?? null,
    goodsDiscovery: goodsDiscovery.readState(),
    seasonalEvents: seasonalEvents.readState(),
    boundaryEvents: boundaryEvents.readState(),
    economyHistory,
  });
}

function setSaveFeedback(message, tone = 'ok') {
  const feedback = $('#save-feedback');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function persistCurrentSave({ announce = false } = {}) {
  try {
    const payload = currentSavePayload();
    storedSave = writeLocalSave(localStorage, payload);
    storedSaveError = null;
    lastAutosaveDay = model.day;
    updateResumeOption();
    if (announce) {
      setSaveFeedback(`${model.day}日目をこの端末に保存しました。`);
      $('#status span').textContent = `${model.day}日目を保存しました`;
    }
    return payload;
  } catch (error) {
    if (announce) setSaveFeedback(`保存できませんでした：${error.message}`, 'error');
    return null;
  }
}

function downloadCurrentSave() {
  const payload = persistCurrentSave();
  if (!payload) {
    setSaveFeedback('書き出し用の保存データを作れませんでした。', 'error');
    return false;
  }
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = saveFileName(payload);
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  setSaveFeedback(`${link.download} を書き出しました。調査時はこのファイルを共有してください。`);
  return true;
}

function resumeSavedGame() {
  if (!storedSave) return false;
  const url = new URL(location.href);
  url.searchParams.delete('mode');
  url.searchParams.set('resume', '1');
  location.assign(url.href);
  return true;
}

function updateResumeOption() {
  const button = $('#start-resume');
  if (!button) return;
  button.hidden = !storedSave;
  if (storedSave) {
    $('#start-resume-day').textContent = `${storedSave.summary.day}日目`;
    const population = storedSave.summary.population;
    $('#start-resume-summary').textContent = `${START_MODES[storedSave.mode].shortLabel}・人口${population}人・${new Date(storedSave.savedAt).toLocaleString('ja-JP')}の記録`;
  } else if (storedSaveError) {
    $('#boot-status span').textContent = `保存データを確認できません：${storedSaveError.message}`;
  }
}

async function importSaveFile(file) {
  if (!file) return false;
  try {
    const payload = parseSaveText(await file.text());
    storedSave = writeLocalSave(localStorage, payload);
    storedSaveError = null;
    setSaveFeedback(`${payload.summary.day}日目を読み込みました。島を開き直します。`);
    resumeSavedGame();
    return true;
  } catch (error) {
    setSaveFeedback(`読み込めませんでした：${error.message}`, 'error');
    $('#boot-status span').textContent = `保存ファイルを読み込めません：${error.message}`;
    return false;
  } finally {
    $('#save-file-input').value = '';
  }
}

function openSheet(id) {
  for (const sheet of document.querySelectorAll('.sheet')) sheet.hidden = sheet.id !== id;
  document.body.classList.add('sheet-open');
  document.querySelectorAll('#top-menu button').forEach(button => {
    const target = {
      'open-company': 'company-sheet', 'open-island': 'island-sheet',
      'open-supply': 'supply-sheet',
      'open-building': 'building-sheet', 'open-events': 'event-sheet',
      'open-development': 'development-sheet',
      'open-tutorial-letters': 'tutorial-letter-sheet',
      'open-save': 'save-sheet',
    }[button.id];
    if (target) button.setAttribute('aria-pressed', String(target === id));
  });
  if (id === 'building-sheet') renderBuildingSheet();
  if (id === 'company-sheet') renderCompanySheet();
  if (id === 'event-sheet') renderEventSheet();
  if (id === 'development-sheet') renderDevelopmentMap();
  if (id === 'tutorial-letter-sheet') renderTutorialLetterSheet();
  if (id === 'island-sheet') renderIslandSheet();
  if (id === 'supply-sheet') renderSupplySheet();
  if (id === 'goods-detail-sheet') renderGoodsDetailSheet();
  if (id === 'save-sheet') {
    $('#save-summary').textContent = `${model.day}日目・人口${model.population}人。ファイル保存なら、この島をそのまま調査用に共有できます。`;
    setSaveFeedback(storedSave
      ? `この端末には${storedSave.summary.day}日目の保存があります。`
      : 'この端末にはまだ保存がありません。');
  }
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
$('#open-supply').addEventListener('click', () => {
  focusedSupplyGoods = null;
  openSheet('supply-sheet');
});
$('#open-island').addEventListener('click', () => {
  openSheet('island-sheet');
});
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
$('#open-save').addEventListener('click', () => openSheet('save-sheet'));
$('#save-local').addEventListener('click', () => persistCurrentSave({ announce: true }));
$('#save-download').addEventListener('click', downloadCurrentSave);
$('#save-import').addEventListener('click', () => $('#save-file-input').click());
$('#save-file-input').addEventListener('change', event => importSaveFile(event.target.files?.[0]));
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

$('#open-island-from-building').addEventListener('click', () => openSheet('supply-sheet'));
$('#building-company-stock').addEventListener('click', event => {
  if (event.target.closest('[data-open-company-stock]')) openSheet('company-sheet');
});
$('#shortage-alerts').addEventListener('click', event => {
  const button = event.target.closest('[data-shortage-goods]');
  if (!button) return;
  focusedSupplyGoods = button.dataset.shortageGoods;
  openSheet('supply-sheet');
  requestAnimationFrame(() => {
    $(`[data-supply-goods="${focusedSupplyGoods}"]`)?.focus();
  });
});
$('#supply-grid').addEventListener('click', event => {
  const row = event.target.closest('[data-supply-goods]');
  if (!row) return;
  selectedSupplyGoods = row.dataset.supplyGoods;
  openSheet('goods-detail-sheet');
});
$('#goods-detail-back').addEventListener('click', () => {
  focusedSupplyGoods = selectedSupplyGoods;
  openSheet('supply-sheet');
  requestAnimationFrame(() => {
    $(`[data-supply-goods="${focusedSupplyGoods}"]`)?.focus();
  });
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
  !['start-screen', 'save-file-input'].includes(element.id)
  && !['SCRIPT', 'NOSCRIPT'].includes(element.tagName)
));

function showStartScreen() {
  setSpeed(0);
  $('#start-screen').hidden = false;
  document.body.classList.add('choosing-start');
  for (const element of gameUiElements) element.inert = true;
  ($('#start-resume:not([hidden])') ?? $('#start-screen [data-start-mode="tutorial"]')).focus();
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
  const saveAction = event.target.closest('[data-save-action]')?.dataset.saveAction;
  if (saveAction === 'resume') {
    resumeSavedGame();
    return;
  }
  if (saveAction === 'import') {
    $('#save-file-input').click();
    return;
  }
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
  get discoveredGoods() { return goodsDiscovery.knownGoods(); },
  get goodsDiscoveryState() { return goodsDiscovery.readState(); },
  get seasonalEventState() { return seasonalEvents.readState(); },
  get boundaryEventState() { return boundaryEvents.readState(); },
  boundaryEvents,
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
  currentSavePayload,
  persistCurrentSave,
  downloadCurrentSave,
  importSaveFile,
  get tutorialState() { return tutorialDirector?.readState() ?? null; },
  chooseStartMode,
  previewBuilding(job, x, y) { return previewBuildingPlacement(model, job, { x, y }); },
  previewRoad(start, end) { return previewRoadPlacement(model, start, end); },
});

renderHud();
renderer.render(displayModel, 0);
requestAnimationFrame(frame);

updateResumeOption();

if (requestedStartMode || startupSave) {
  hideStartScreen();
  $('#status span').textContent = startupSave
    ? `${startupSave.summary.day}日目の保存から再開しました`
    : startMode === 'tutorial'
      ? 'エレナの案内で未開拓島から開始しました'
      : `${START_MODES[startMode].shortLabel}で開始しました`;
} else {
  showStartScreen();
}

if (SPEEDS.length !== 4) throw new Error('speed controls and speed definitions must stay aligned');

window.__SHIOJI_BOOT__?.ready();
