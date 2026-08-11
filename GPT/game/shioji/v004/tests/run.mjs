import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createEngineApi, replayInputJournal } from '../../engine/src/api.js';
import { buildBaseCity, findAuditSpot } from '../../engine/src/audit.js';
import {
  FOODS, createHousehold, requestCompanyImport, runPopulationDynamicsPhase,
} from '../../engine/src/econ.js';
import { ECONOMIC_BUILDINGS, depositInventory } from '../../engine/src/physical.js';
import { IsometricCamera } from '../src/camera.js';
import { SimulationClock } from '../src/clock.js';
import {
  FOOD_RUNWAY_THRESHOLD_DAYS, FOOD_WARNING_COOLDOWN_DAYS, PRESERVATION_STOP_SCRIPTS,
  createBoundaryEvents, foodBoundarySpeech,
} from '../src/boundary_events.js';
import {
  BUILD_CATEGORIES, BUILDING_ART, BUILDING_SIZES, DENARI_PER_MONEY_UNIT, GOODS_ART,
  GOODS_LABELS, JOB_ICONS, JOB_LABELS, PLACEMENT_JOBS, VERSION, toDenari,
} from '../src/config.js';
import {
  DISPLAY_BATCH_TICKS, advanceInBatches, displayBatchSizeFor,
} from '../src/display_batch.js';
import { developmentMapView } from '../src/development_map.js';
import {
  BUILD_COST_DENARI, E_STABLE_JOBS, E_STABLE_POPULATION_BAND, E_STABLE_YEARS,
  applySpringStartCalendar, buildBlankCity, createEngineController,
} from '../src/engine_bridge.js';
import {
  EVENT_DISPLAY_POLICY, OBSERVED_EVENT_TYPES, eventPlaceLabel, hasEventPresentation,
  presentEvent, shouldPresentEvent,
} from '../src/event_view.js';
import { formatElenaSpeech } from '../src/elena_text.js';
import {
  PLAYER_FACING_BANNED_TERMS, WINTER_RESERVE_PER_PERSON, executableFoodIntervention,
  foodHudSummary, islandFoodSummary, perishableFreshness, winterFoodForecast,
} from '../src/food_readability.js';
import {
  GOODS_SPRITE_IDS, goodsSpriteDefinition, goodsSpriteGeometrySignature,
  goodsSpriteSvgMarkup,
} from '../src/goods_sprites.js';
import {
  GOODS_DISCOVERY_SCRIPTS, createGoodsDiscovery,
} from '../src/goods_discovery.js';
import {
  GOODS_DETAIL_FACTS, GOODS_RECIPES, GOODS_SHELF_LIFE_DAYS, goodsDetail,
} from '../src/goods_detail.js';
import {
  SEASONAL_EVENT_SCRIPTS, createSeasonalEvents,
} from '../src/seasonal_events.js';
import { movementVector, panCameraFromKeys, shouldIgnoreShortcut } from '../src/keyboard.js';
import {
  analyzeRoadConnections, previewBuildingPlacement, previewRoadPlacement,
  resourcePlacementEstimate, supplierPlacementEstimate,
} from '../src/placement.js';
import {
  WorldPresentation, interpolateWorldModel, transitionDuration,
} from '../src/presentation.js';
import { buildingLayerDepth, mergeDrawables } from '../src/render_scene.js';
import { Renderer } from '../src/renderer.js';
import { createSavePayload, parseSaveText } from '../src/save_game.js';
import {
  SPRING_START_CALENDAR_OFFSET_DAYS, START_MODES, parseStartMode, urlForStartMode,
} from '../src/start_modes.js';
import {
  SUPPLY_STATUS, shortageRows, supplyDemandRow, supplyDemandRows,
} from '../src/supply_demand.js';
import {
  CONVERSION_SURVIVAL_DAYS, FOOD_IMPORT_EMA_TARGET,
  LOGGER_TRIP_RECOVERY_TICKS, LOGGER_TRIP_WARNING_TICKS,
  ORDER_JUDGMENT_FALLBACK_OFFERS, SEASONAL_RESERVE_TARGET,
  SEASONAL_SURPLUS_MIN, SEASONAL_VALLEY_RATIO, TOOLS_PRICE_RISE_DELTA,
  TOOLS_PRICE_RISE_RATIO,
  TUTORIAL_GOALS, TUTORIAL_LETTERS, TUTORIAL_LETTER_ATTENTION,
  TUTORIAL_GOAL_START_AFTER, TUTORIAL_LETTER_DELIVERY,
  TUTORIAL_ELENA_COMPLETIONS, TUTORIAL_ELENA_MESSAGES, TUTORIAL_LETTER_MESSAGES,
  TUTORIAL_OPTIONAL_GOAL_IDS,
  TUTORIAL_PLAYER_TITLES, TUTORIAL_SYSTEM_INSTRUCTIONS,
  isRequiredTutorialGoal, isTutorialGoalUnlocked, tutorialLetterDelivery, estimateWalkLen,
  orderQuote,
} from '../src/tutorial_content.js';
import {
  TutorialDirector, createTutorialDirector, createTutorialDirectorForMode,
} from '../src/tutorial_director.js';
import {
  GUIDANCE_TIERS, guidanceReadingTimeMs, objectiveActionFor, secretaryActionForRoute,
  secretaryRouteFor, secretaryEventsAfter, tutorialHandoffFor,
  tutorialSpeedAfterObjectiveChange,
} from '../src/ui_guidance.js';
import { islandCalendar, islandHealthSummary, recentCompanySummary } from '../src/ui_summary.js';
import {
  COMPANY_VISIBLE_PORTER_LIMIT, FOOD_DELIVERY_ALERT_LABELS,
  caravanAccountingPresentation, caravanStatePresentation, foodDeliveryAlertLabel,
  snapshotToViewModel, terrainTopologyForModel,
  walkingVisualPosition, walkingVisualProfile,
} from '../src/view_model.js';
import {
  EXACT_PILE_LIMIT, MAX_DISPLAY_CULTURE_LEVEL, MAX_PILE_SPRITES, MAX_YARD_GOODS,
  PILE_STAGE_LIMITS, YARD_STRUCTURE_CLEARANCE,
  buildingAppearance, buildingStructureLayout, displayCultureLevel,
  pileVisual, seasonalNaturalVisual, seasonalPlotVisual, seasonalTerrainVisual,
  trailVisual, yardLayout, yardSlots, yardStockRows,
} from '../src/visuals.js';

let passed = 0;
let tutorialThroughPlay = null;
const PROFITABLE_ORDER_OBSERVATION_DAYS = 400;
const SKIPPABLE_ORDER_OBSERVATION_DAYS = 600;
const suiteStartedAt = performance.now();
const testTimings = [];
const matchIndex = process.argv.indexOf('--match');
const testMatchSource = matchIndex >= 0 ? process.argv[matchIndex + 1] : null;
const testMatch = testMatchSource ? new RegExp(testMatchSource) : null;
const tutorialStage17Requested = testMatchSource?.includes('チュートリアル段17') ?? false;
const tutorialStage17Dependency = /^チュートリアル段(?:7〜9|1[0-7])(?::|実測:)/;

function test(name, body) {
  if (testMatch && !testMatch.test(name)
    && !(tutorialStage17Requested && tutorialStage17Dependency.test(name))) return;
  console.log(`run - ${name}`);
  const startedAt = performance.now();
  body();
  const elapsedMs = performance.now() - startedAt;
  testTimings.push({ name, elapsedMs });
  passed += 1;
  console.log(`ok - ${name} (${(elapsedMs / 1000).toFixed(2)}s)`);
}

test('食料警告: 盤面でも購買力・在庫・経路・移動の原因を区別する', () => {
  assert.deepEqual(FOOD_DELIVERY_ALERT_LABELS, {
    no_money: 'お金がなく買えない',
    too_expensive: '高くて買えない',
    no_capacity: '荷が多く運べない',
    no_route: '市場への道がない',
    no_stock: '市場に食料なし',
    not_released: '市場に出ていない',
    shopping: '買い出し中',
    waiting: '次の買い出し待ち',
    consumed: '今日分を食べ切った',
  });
  assert.equal(foodDeliveryAlertLabel({ kind: 'unknown' }), '食料不足');

  const world = buildBaseCity(11);
  const api = createEngineApi(world);
  api.advanceDays(120);
  const household = world.state.economy.households[0];
  for (const goods of FOODS) household.pantry[goods] = 0;
  household.state = 'home';
  household.lastMarketVisit = {
    day: world.state.economy.currentDay,
    purchased: {},
    blockers: { wheat: 'no_money' },
  };
  world.state.economy.stalls.wheat = [{
    householdId: world.state.economy.households[1].id,
    goods: 'wheat',
    qty: 20,
    price: 1,
  }];
  const model = snapshotToViewModel(api.snapshot({ scope: 'view' }));
  const row = model.households.find(candidate => candidate.id === household.id);
  const building = model.buildings.find(candidate => candidate.ownerHouseholdId === household.id);
  assert.equal(row.foodDelivery.kind, 'no_money');
  assert.equal(row.foodDelivery.label, '食料を買うお金が足りません');
  assert.equal(building.stateSignals.crisis.label, 'お金がなく買えない');
});

test('品目スプライト: 全18品を色なしの輪郭で区別し、CanvasとUIで同じ定義を使う', () => {
  const goods = Object.keys(GOODS_LABELS);
  assert.equal(goods.length, 18);
  assert.deepEqual([...GOODS_SPRITE_IDS].sort(), [...goods].sort());
  const signatures = goods.map(item => goodsSpriteGeometrySignature(item));
  assert.equal(new Set(signatures).size, goods.length);
  for (const item of goods) {
    const art = GOODS_ART[item];
    assert.equal(art.sprite, item);
    assert.ok(goodsSpriteDefinition(item).length >= 3, `${item}に輪郭と内部特徴がある`);
    assert.equal(new Set([art.color, art.dark, art.light, art.accent]).size, 4);
    const markup = goodsSpriteSvgMarkup(item, art);
    assert.match(markup, new RegExp(`data-goods-sprite="${item}"`));
    assert.match(markup, /viewBox="0 0 16 16"/);
    assert.doesNotMatch(markup, />[木鉱石銑鉄槌岩麦魚菜肉燻漬粉塩炭布油]</);
  }
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const renderer = fs.readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
  assert.match(main, /goodsSpriteSvgMarkup\(goods, art\)/);
  assert.match(renderer, /drawGoodsSpriteCanvas\(this\.ctx, art/);
});

test('段1: createEngineApiで基準都市を起動し1日30tick進める', () => {
  const controller = createEngineController({ seed: 11 });
  const before = controller.readModel();
  assert.equal(before.day, 0);
  assert.equal(before.tick, 0);
  assert.deepEqual([before.width, before.height], [48, 40]);
  assert.ok(before.buildings.length > 0);
  controller.advanceOneDay();
  const after = controller.readModel();
  assert.equal(after.day, 1);
  assert.equal(after.tick, 30);
});

test('ラン3: 発展図は現存産業を点灯し、将来案を操作ロックに使わない', () => {
  const model = snapshotToViewModel(createEngineApi(buildBaseCity(11)).snapshot({ scope: 'full' }));
  const branches = developmentMapView(model);
  const nodes = branches.flatMap(branch => branch.nodes);
  assert.equal(branches.length, 4);
  assert.equal(nodes.find(node => node.id === 'port').state, 'active');
  assert.equal(nodes.find(node => node.id === 'cartwright').state, 'available');
  assert.equal(nodes.find(node => node.id === 'future-shipwright').state, 'future');
  assert.equal(nodes.find(node => node.id === 'future-mine').state, 'future');
  assert.equal(nodes.every(node => !('locked' in node)), true);
  const source = fs.readFileSync(new URL('../src/development_map.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /operate|place_building|unlock|requiredNode/);
});

function buildCartLifecycleCity(seed) {
  const world = buildBaseCity(seed);
  const api = createEngineApi(world);
  const spot = findAuditSpot(world, 'cartwright');
  assert.ok(spot, `seed${seed}で荷車工房を配置できる`);
  const placed = api.applyOperation({
    type: 'place_building', job: 'cartwright', x: spot[0], y: spot[1],
  });
  assert.equal(placed.ok, true);
  const building = world.state.physical.buildings.find(({ id }) => id === placed.buildingId);
  const household = createHousehold(world.state.economy, {
    job: 'cartwright', x: building.entrance.x, y: building.entrance.y,
  });
  household.buildingId = building.id;
  building.ownerHouseholdId = household.id;
  building.constructionConsumed = true;
  world.state.economy.zones.find(({ buildingId }) => buildingId === building.id).filled = true;
  // 荷車そのものの製造・購入・摩耗を、旧基準都市の上流不足から独立して検査する。
  depositInventory(building, 'input', 'log', 400);
  depositInventory(building, 'input', 'tools', 50);
  return world;
}

test('ラン3: 3シードで木製荷車が製造・世帯購入・使用・摩耗・買い替えまで循環する', () => {
  const rows = [];
  for (const seed of [11, 13, 14]) {
    const world = buildCartLifecycleCity(seed);
    const api = createEngineApi(world);
    for (let day = 0; day < 600; day += 1) {
      api.advanceDays(1);
      const stats = world.state.economy.cartStats;
      if (stats.produced > 0
        && stats.householdPurchased >= 2
        && stats.householdUses > 0
        && stats.householdBroken > 0) break;
    }
    const stats = { ...world.state.economy.cartStats };
    assert.ok(stats.produced > 0, `seed${seed}で荷車を製造`);
    assert.ok(stats.householdPurchased >= 2, `seed${seed}で買い替えを含む世帯購入`);
    assert.ok(stats.householdUses > 0, `seed${seed}で市場往復に使用`);
    assert.ok(stats.householdBroken > 0, `seed${seed}で距離摩耗`);
    assert.ok(stats.householdPurchased > stats.householdBroken,
      `seed${seed}で摩耗後に次の荷車が残る`);
    rows.push({ seed, day: world.state.day, ...stats });
  }
  console.log(`  荷車循環実測 ${rows.map(row => (
    `seed${row.seed}:d${row.day} 製${row.produced}/買${row.householdPurchased}`
    + `/便${row.householdUses}/摩${row.householdBroken}`
  )).join(' | ')}`);
});

test('ラン3: 会社の木製荷車は公開操作でだけ購入され、有限容量で使われ摩耗する', () => {
  const world = buildCartLifecycleCity(11);
  const api = createEngineApi(world);
  let offer = null;
  for (let day = 0; day < 400 && !offer; day += 1) {
    api.advanceDays(1);
    offer = world.state.economy.households
      .flatMap(household => household.cartStock ?? [])[0] ?? null;
  }
  assert.ok(offer, '荷車工房の実在庫が販売待ちになる');
  assert.equal(world.state.economy.cartStats.companyPurchased, 0, '会社は自動購入しない');
  const moneyBefore = world.state.economy.company.money;
  const result = api.applyOperation({ type: 'purchase_company_cart' });
  assert.equal(result.ok, true);
  assert.equal(world.state.economy.companyCarts.length, 1);
  assert.equal(world.state.economy.cartStats.companyPurchased, 1);
  assert.ok(world.state.economy.company.money < moneyBefore);
  api.applyOperation({ type: 'set_stock_target', goods: 'tools', qty: 80 });
  for (let day = 0; day < 300 && world.state.economy.cartStats.companyBroken < 1; day += 1) {
    api.advanceDays(1);
  }
  assert.ok(world.state.economy.cartStats.companyUses > 0);
  assert.equal(world.state.economy.cartStats.companyBroken, 1);
  const journal = api.inputJournal();
  const replay = replayInputJournal(
    () => buildCartLifecycleCity(11),
    journal,
    { untilTick: world.state.tick },
  );
  assert.deepEqual(replay.world.state, world.state, '荷車購入を含む公開journalが同じ世界を再生する');
});

test('性能L: イベントcursorは全履歴filterと同じ順序・値を返し、返却値は内部から分離する', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceTicks(3600);
  const all = api.events();
  assert.ok(all.length > 2);
  assert.ok(all.length <= 128, '観測イベントは小さなリングバッファだけを保持する');
  assert.ok(
    all.at(-1).sequence > all.length,
    '頻出イベントは切り詰めつつ、古い重要イベントは保持できる',
  );
  for (const cursor of [0, all[0].sequence, all[Math.floor(all.length / 2)].sequence, all.at(-1).sequence]) {
    assert.deepEqual(api.events({ afterSequence: cursor }), all.filter(event => event.sequence > cursor));
  }
  const tail = api.events({ afterSequence: all.at(-2).sequence });
  tail[0].type = 'mutated-outside';
  assert.notEqual(api.events({ afterSequence: all.at(-2).sequence })[0].type, 'mutated-outside');
});

test('教程T/U: 全目標をエレナ概要と一意なsystem操作へ分け、player-facing内部語を出さない', () => {
  const reportOnly = new Set([
    'close-first-chapter', 'close-second-chapter', 'close-third-chapter',
    'close-fourth-chapter', 'close-fifth-chapter', 'graduate-governor',
  ]);
  assert.deepEqual(
    TUTORIAL_GOALS.slice(0, 2).map(goal => goal.id),
    ['first-road-and-logger', 'first-logger'],
    '最初は森への道と木こりを別々の目標として案内する',
  );
  const forbidden = /適格日|教程|EMA|input棚|snapshot|\btick\b|haulJobId|productionCost|\bengine\b|\bjournal\b|E-Stable/;
  const forbiddenElena = /画面|ボタン|クリック|押して|できました。次の仕事|少しだけお待ち|銀が海を渡る|帳場|手数料/;
  for (const goal of TUTORIAL_GOALS) {
    assert.ok(TUTORIAL_PLAYER_TITLES[goal.id], `${goal.id}のplayer-facing目標名`);
    assert.ok(TUTORIAL_ELENA_MESSAGES[goal.id], `${goal.id}のエレナによる意味づけ`);
    assert.ok(TUTORIAL_ELENA_COMPLETIONS[goal.id], `${goal.id}のエレナによる達成報告`);
    assert.equal(forbidden.test(TUTORIAL_PLAYER_TITLES[goal.id]), false, goal.id);
    assert.equal(forbidden.test(TUTORIAL_ELENA_MESSAGES[goal.id]), false, goal.id);
    assert.equal(forbidden.test(TUTORIAL_ELENA_COMPLETIONS[goal.id]), false, goal.id);
    assert.equal(forbiddenElena.test(TUTORIAL_ELENA_MESSAGES[goal.id]), false, goal.id);
    assert.equal(forbiddenElena.test(TUTORIAL_ELENA_COMPLETIONS[goal.id]), false, goal.id);
    const instruction = TUTORIAL_SYSTEM_INSTRUCTIONS[goal.id];
    assert.equal(typeof instruction, 'string', `${goal.id}のsystem操作`);
    if (!reportOnly.has(goal.id)) assert.ok(instruction.length > 0, `${goal.id}は次の操作が一意`);
    assert.equal(forbidden.test(instruction), false, goal.id);
  }
  for (const letter of TUTORIAL_LETTERS) {
    assert.ok(TUTORIAL_LETTER_MESSAGES[letter.id], `${letter.id}のエレナによる書状案内`);
    assert.equal(forbidden.test(TUTORIAL_LETTER_MESSAGES[letter.id]), false, letter.id);
    assert.equal(forbiddenElena.test(TUTORIAL_LETTER_MESSAGES[letter.id]), false, letter.id);
  }
  const director = createTutorialDirector();
  director.observe(snapshotToViewModel(createEngineApi(buildBlankCity(11)).snapshot()), []);
  const objective = director.currentObjective();
  assert.equal(objective.title, TUTORIAL_PLAYER_TITLES[objective.id]);
  assert.equal(objective.elenaMessage, TUTORIAL_ELENA_MESSAGES[objective.id]);
  assert.equal(objective.elenaCompletion, TUTORIAL_ELENA_COMPLETIONS[objective.id]);
  assert.equal(objective.systemInstruction, TUTORIAL_SYSTEM_INSTRUCTIONS[objective.id]);
  assert.equal(forbidden.test(
    `${objective.title} ${objective.elenaMessage} ${objective.detail} ${objective.systemInstruction}`,
  ), false);
  const restoredOldLetter = new TutorialDirector({
    goals: [],
    letters: [],
    state: {
      version: 1,
      letters: [{
        id: 'arrival-report', unread: true, attention: 'action',
        issuedDay: 0, issuedTick: 0, title: '着任報告', summary: '港だけの島',
      }],
    },
  }).letters()[0];
  assert.equal(restoredOldLetter.elenaMessage, TUTORIAL_LETTER_MESSAGES['arrival-report']);
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const contentSource = fs.readFileSync(new URL('../src/tutorial_content.js', import.meta.url), 'utf8');
  assert.doesNotMatch(main, /書状を閉じ、画面上部の現在目標/);
  assert.doesNotMatch(contentSource,
    /相場EMA|生産EMA|input棚|教程は|教程の必達条件|教程を止め/,
    'Mir検査で見つかったプレイヤー向け内部語を発話・書状の原文へ戻さない');
  const canonicalPlayerText = JSON.stringify({
    titles: TUTORIAL_PLAYER_TITLES,
    instructions: TUTORIAL_SYSTEM_INSTRUCTIONS,
    messages: TUTORIAL_ELENA_MESSAGES,
    completions: TUTORIAL_ELENA_COMPLETIONS,
    letters: TUTORIAL_LETTER_MESSAGES,
  });
  for (const term of PLAYER_FACING_BANNED_TERMS) {
    assert.equal(canonicalPlayerText.includes(term), false,
      `プレイヤー向けcanonへ内部語「${term}」を戻さない`);
  }
});

test('教程V〜Y: 創発待ちは進行を止めず、注文残量と適時アドバイスを別層で扱う', () => {
  for (const id of [
    'observe-seasonal-food-valley', 'fill-seasonal-reserve', 'release-seasonal-reserve',
    'observe-tools-price-rise', 'sustain-conversion-workshops',
  ]) {
    assert.ok(TUTORIAL_OPTIONAL_GOAL_IDS.includes(id), `${id}は任意観察`);
    assert.equal(isRequiredTutorialGoal(TUTORIAL_GOALS.find(goal => goal.id === id)), false);
  }

  const completeOrder = TUTORIAL_GOALS.find(goal => goal.id === 'complete-first-order');
  const orderModel = {
    day: 70,
    activeOrder: { g: 'tools', qty: 60, left: 24, due: 80, price: 5 },
    companyLedger: [],
  };
  const progress = completeOrder.evaluate({ model: orderModel, events: [], state: { goalResults: {} } });
  assert.equal(progress.complete, false);
  assert.deepEqual(progress.progress, { done: 36, total: 60 });
  assert.match(progress.detail, /納品済み 36\.0\/60荷・残り 24\.0荷・期限まであと10日/);

  const deathAdvice = new TutorialDirector({ goals: [], letters: [] });
  const adviceModel = {
    day: 20, tick: 600, companyStock: { wheat: 0 }, marketPrices: { wheat: 1 },
    stalls: [], buildings: [], households: [],
  };
  deathAdvice.observe(adviceModel, [{
    type: 'death', sequence: 9, day: 20, message: '住民が餓えで亡くなった',
  }]);
  const message = deathAdvice.advice().find(row => row.id === 'resident-death-message');
  assert.equal(message.priority, 'info');
  assert.equal(message.unread, true);
  assert.equal(deathAdvice.letters().length, 0, '死亡は停止書状にしない');
  const routed = secretaryRouteFor({
    advice: [{
      id: 'seasonal-release-opportunity', unread: true, completed: false,
      priority: 'action', kicker: '助言', title: '市場へ出す', detail: 'いま動けます',
      speech: '市場の食料が少なくなりました。倉庫の備えを戻しましょう。',
      target: { kind: 'sheet', sheet: 'company-sheet' },
    }],
    objective: {
      id: 'first-road-and-logger', complete: false, title: '道', detail: '森へ',
      elenaMessage: '森まで道を敷き、木こりを建てましょう。',
    },
  });
  assert.equal(routed.priority, 'timely-advice');
  assert.equal(routed.target.route.sheet, 'company-sheet');

  const seasonal = new TutorialDirector({
    goals: [], letters: [],
    state: {
      version: 1, active: true, skipped: false,
      completedGoals: ['set-seasonal-stock-target'], letters: [],
      goalResults: { 'set-seasonal-stock-target': { evidence: { goods: 'wheat' } } },
    },
  });
  const seasonalModel = (day, available) => ({
    day, tick: day * 30, companyStock: { wheat: 16 }, marketPrices: { wheat: 1 },
    stalls: [{ goods: 'wheat', qty: available }], buildings: [], households: [],
  });
  seasonal.observe(seasonalModel(10, 10), []);
  assert.equal(seasonal.advice().length, 0);
  seasonal.observe(seasonalModel(15, 1), []);
  assert.equal(seasonal.advice()[0].unread, true);
  seasonal.markAdviceRead('seasonal-release-opportunity');
  seasonal.observe(seasonalModel(20, 1), []);
  assert.equal(seasonal.advice()[0].repeatCount, 2, '未実行なら5日後に再通知');
  seasonal.observe(seasonalModel(21, 1), [
    { type: 'operation', ok: true, op: { type: 'release_stock', goods: 'wheat', qty: 8 } },
    { type: 'departure', carrier: 'cart', goods: 'wheat', qty: 8, haulJobId: 4 },
  ]);
  assert.equal(seasonal.advice()[0].completed, true, '実市場へ出すで助言完了');
});

test('可読性B: 食料日数・冬予報・鮮度・実行可能な打ち手を状態だけから決める', () => {
  const foodModel = {
    day: 241,
    population: 4,
    households: [
      { members: 2, pantry: [{ goods: 'fish', amount: 8 }, { goods: 'tools', amount: 99 }] },
      { members: 2, pantry: [{ goods: 'wheat', amount: 12 }] },
    ],
    stalls: [{ goods: 'veg', qty: 8 }],
    companyMarketStock: { wheat: 4 },
    companyStock: { wheat: 20 },
    stockTargets: {},
    mainlandAid: { refused: false },
    buildings: [],
    flowEma: { fish: { prod: 1, cons: 2 } },
  };
  const summary = islandFoodSummary(foodModel);
  assert.deepEqual(
    [summary.available, summary.companyReserve, summary.runwayDays],
    [32, 20, 8],
  );
  const hud = foodHudSummary(foodModel, [{ day: 234, foodRunwayDays: 12 }]);
  assert.equal(hud.arrow, '↘↘');
  assert.equal(hud.tone, 'warning');
  assert.notEqual(foodHudSummary({
    ...foodModel,
    day: 0,
    calendarOffsetDays: SPRING_START_CALENDAR_OFFSET_DAYS,
  }).reason, '冬・畑が休み', '春開始直後を冬として案内しない');
  const forecast = winterFoodForecast(foodModel);
  assert.equal(forecast.required, 4 * WINTER_RESERVE_PER_PERSON);
  assert.equal(forecast.reserve, 52);
  assert.equal(forecast.shortage, forecast.required - 52);
  assert.equal(perishableFreshness('fish', 0).stage, 'fresh');
  assert.equal(perishableFreshness('fish', 2).stage, 'aging');
  assert.equal(perishableFreshness('fish', 3).stage, 'spoiling');
  assert.equal(perishableFreshness('wheat', 99).stage, 'stable',
    '実際に日次腐敗する魚・野菜だけを鮮度表示する');
  assert.equal(executableFoodIntervention(foodModel).kind, 'release');
  assert.equal(executableFoodIntervention({
    ...foodModel, companyStock: {}, mainlandAid: { refused: false },
  }).kind, 'aid');
  assert.equal(executableFoodIntervention({
    ...foodModel, companyStock: {}, mainlandAid: { refused: true },
  }).kind, 'target');

  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(2);
  const full = api.snapshot();
  const view = snapshotToViewModel(api.snapshot({ scope: 'view' }));
  assert.equal(
    view.spoilTotal,
    Object.values(full.economy.led.spoil).reduce((total, amount) => total + amount, 0),
    '表示snapshotへ腐敗累計を加え、経済状態は読み取り専用に保つ');
  assert.deepEqual(view.spoilByGoods, full.economy.led.spoil,
    '初腐敗の品目判定に必要な累計だけを品目別に公開する');
});

test('可読性B: エレナの秋予告は暦オフセットへ追従し毎年一度だけ出す', () => {
  const director = new TutorialDirector({ goals: [], letters: [] });
  const model = (day, calendarOffsetDays = 0) => ({
    day,
    tick: day * 30,
    calendarOffsetDays,
    population: 4,
    households: [{ members: 4, pantry: [{ goods: 'wheat', amount: 40 }] }],
    stalls: [],
    companyMarketStock: {},
    companyStock: {},
    stockTargets: {},
    mainlandAid: { refused: false },
    buildings: [],
    flowEma: {},
    spoilTotal: 0,
  });
  director.observe(model(241), []);
  const first = director.advice().find(row => row.id === 'annual-autumn-food-forecast');
  assert.match(first.speech, /冬が来ます.*約10日分/s);
  const springStartDirector = new TutorialDirector({ goals: [], letters: [] });
  springStartDirector.observe(model(181, SPRING_START_CALENDAR_OFFSET_DAYS), []);
  assert.ok(springStartDirector.advice().some(
    row => row.id === 'annual-autumn-food-forecast',
  ), '春開始から180日後の9月1日に秋予告を出す');
  director.markAdviceRead(first.id);
  director.observe(model(250), []);
  assert.equal(director.advice().find(row => row.id === first.id).repeatCount, 1);
  director.observe(model(601), []);
  assert.equal(director.advice().find(row => row.id === first.id).repeatCount, 2);

  director.observe({ ...model(602), spoilTotal: 3 }, []);
  assert.equal(director.advice().some(row => row.id === 'large-food-spoilage'), false);
  director.observe({ ...model(603), spoilTotal: 9 }, []);
  assert.match(
    director.advice().find(row => row.id === 'large-food-spoilage').speech,
    /6荷傷みました/,
  );
});

test('可読性B: エレナのボタンは書状・家ジャンプだけ、操作はシステム側に残す', () => {
  const optionalLetter = {
    action: '書状を開く',
    target: { kind: 'letter', id: 'report', delivery: 'letter' },
  };
  assert.equal(secretaryActionForRoute(optionalLetter).kind, 'letter');
  assert.equal(secretaryActionForRoute({
    target: { kind: 'event', sequence: 9 },
  }).kind, 'event');
  assert.equal(secretaryActionForRoute({
    target: {
      kind: 'advice', id: 'hungry',
      route: { kind: 'building-detail', buildingId: 8 },
    },
  }).kind, 'advice-building');
  for (const target of [
    { kind: 'sheet', sheet: 'company-sheet' },
    { kind: 'tool', tool: 'road' },
    { kind: 'building', job: 'logger' },
    { kind: 'speed', speed: 3 },
  ]) {
    assert.equal(secretaryActionForRoute({ target }), null);
  }
});

test('教程AA: 未来章をロックし、重要度に応じて強制書状・任意書状・一言を分ける', () => {
  assert.equal(Object.keys(TUTORIAL_GOAL_START_AFTER).length, TUTORIAL_OPTIONAL_GOAL_IDS.length);
  for (const [id, prerequisite] of Object.entries(TUTORIAL_GOAL_START_AFTER)) {
    const goal = { id };
    assert.equal(isTutorialGoalUnlocked(goal, { completedGoals: [] }), false, `${id}は先回りしない`);
    assert.equal(isTutorialGoalUnlocked(goal, { completedGoals: [prerequisite] }), true,
      `${id}は${prerequisite}後に始まる`);
  }

  const gatedGoal = {
    id: 'observe-skippable-order',
    evaluate: () => ({ complete: true, progress: { done: 1, total: 1 }, evidence: {} }),
  };
  const locked = new TutorialDirector({ goals: [gatedGoal], letters: [], advice: [] });
  locked.observe({ day: 1, tick: 30 }, []);
  assert.equal(locked.readState().completedGoals.includes(gatedGoal.id), false);
  const unlocked = new TutorialDirector({
    goals: [gatedGoal], letters: [], advice: [],
    state: {
      version: 1, active: true, skipped: false,
      completedGoals: ['complete-profitable-order'], letters: [],
    },
  });
  unlocked.observe({ day: 2, tick: 60 }, []);
  assert.equal(unlocked.readState().completedGoals.includes(gatedGoal.id), true);

  assert.equal(tutorialLetterDelivery('arrival-report'), 'forced');
  assert.equal(tutorialLetterDelivery('chapter-one-close'), 'letter');
  assert.equal(tutorialLetterDelivery('first-order-complete'), 'message');
  assert.equal(Object.values(TUTORIAL_LETTER_DELIVERY).filter(value => value === 'forced').length, 6);
  assert.equal(Object.values(TUTORIAL_LETTER_DELIVERY).filter(value => value === 'letter').length, 8);

  const minimalLetter = id => Object.freeze({
    id,
    when: () => true,
    render: () => ({
      title: id, summary: '要約', body: '本文', signature: 'エレナ',
      elenaMessage: TUTORIAL_LETTER_MESSAGES[id] ?? `${id}のお知らせです。`,
    }),
  });
  const delivery = new TutorialDirector({
    goals: [],
    advice: [],
    letters: [
      minimalLetter('arrival-report'),
      minimalLetter('chapter-one-close'),
      minimalLetter('logs-pile-no-market'),
    ],
  });
  delivery.observe({ day: 3, tick: 90 }, []);
  assert.deepEqual(delivery.visibleLetters().map(letter => letter.id),
    ['arrival-report', 'chapter-one-close']);
  assert.deepEqual(delivery.messages().map(message => message.id), ['logs-pile-no-market']);
  let route = secretaryRouteFor({
    letters: delivery.visibleLetters(), messages: delivery.messages(),
  });
  assert.equal(route.priority, 'forced-letter');
  assert.equal(route.speech, TUTORIAL_LETTER_MESSAGES['arrival-report']);
  assert.doesNotMatch(route.speech, /このあと自動で開きます/);
  delivery.markLetterRead('arrival-report');
  route = secretaryRouteFor({
    letters: delivery.visibleLetters(), messages: delivery.messages(),
  });
  assert.equal(route.priority, 'optional-letter');
  assert.deepEqual(route.target, {
    kind: 'letter', id: 'chapter-one-close', delivery: 'letter',
  });
  assert.match(route.speech, /この欄から直接開けます/);
  delivery.markLetterAnnounced('chapter-one-close');
  route = secretaryRouteFor({
    letters: delivery.visibleLetters(), messages: delivery.messages(),
  });
  assert.equal(route.priority, 'tutorial-message');
  assert.equal(route.target.kind, 'message');
});

test('教程Z: 季節・島の基調・飢餓予告・建物成長の因果をplayer-facing表示へ出す', () => {
  assert.deepEqual(islandCalendar(1), {
    year: 1, month: 1, dayOfMonth: 1, season: '冬', label: '冬・1月',
  });
  assert.equal(islandCalendar(61).label, '春・3月');
  assert.equal(islandCalendar(241).label, '秋・9月');
  assert.deepEqual(islandCalendar(0, SPRING_START_CALENDAR_OFFSET_DAYS), {
    year: 1, month: 3, dayOfMonth: 1, season: '春', label: '春・3月',
  });

  const observedController = createEngineController({ seed: 11 });
  observedController.advanceTicks(15 * 30);
  const observed = observedController.readModel();
  const growth = observed.households[0].cultureGrowth;
  assert.equal(growth.level, observed.households[0].cultureLevel);
  assert.ok(growth.requiredDays >= 45);
  assert.equal(typeof growth.nextRequirement, 'string');
  assert.equal(growth.downgradeDays, 60);

  const healthModel = {
    day: 40, population: 8, companyMoney: 100, companyLedger: [],
    households: [{ hungerRun: 31 }],
  };
  const health = islandHealthSummary(healthModel, [{ day: 11, population: 10 }]);
  assert.equal(health.tone, 'danger');
  assert.match(health.reason, /31日連続/);

  const director = new TutorialDirector({ goals: [], letters: [] });
  const hungryModel = {
    day: 30, tick: 900, companyStock: { wheat: 0 }, marketPrices: { wheat: 1 }, stalls: [],
    households: [{
      id: 7, familyName: 'テスト', hungerRun: 30, buildingId: 4,
      cultureGrowth: { achievedRequirement: null },
    }],
    buildings: [{ id: 4, type: 'veg', x: 2, y: 3 }],
  };
  director.observe(hungryModel, []);
  const warning = director.advice().find(row => row.id === 'household-hunger-warning');
  assert.equal(warning.priority, 'action');
  assert.match(warning.detail, /60日に達すると家族が亡くなります/);
  assert.equal(warning.target.kind, 'building-detail');

  director.markAdviceRead('household-hunger-warning');
  const levelModel = structuredClone(hungryModel);
  levelModel.day = 31;
  levelModel.tick = 930;
  levelModel.households[0].hungerRun = 0;
  levelModel.households[0].cultureGrowth.achievedRequirement = 'food1';
  director.observe(levelModel, [{
    type: 'notice', sequence: 20, message: 'veg#7 ▲Lv1', day: 31,
  }]);
  const celebration = director.advice().find(row => row.id === 'building-level-up-celebration');
  assert.match(celebration.title, /野菜畑がLv2へ成長/);
  assert.match(celebration.detail, /食料1種.*45日/);
});

test('チュートリアル段1: v003の旧Worldを持ち込まず観測ディレクターを分離する', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const director = fs.readFileSync(new URL('../src/tutorial_director.js', import.meta.url), 'utf8');
  assert.doesNotMatch(director, /applyOperation|advanceTicks|\.operate\(/);
  assert.match(html, /src="\.\/src\/main\.js/);
  assert.match(html, /潮路の島 v004/);
  assert.equal(fs.existsSync(new URL('../src/world.js', import.meta.url)), false);
  for (const id of [
    'tutorial-objective', 'tutorial-progress-bar',
    'open-tutorial-letters', 'tutorial-letter-sheet', 'tutorial-letter-modal',
  ]) assert.match(html, new RegExp(`id=["']${id}["']`));
  assert.doesNotMatch(html, /id=["']skip-tutorial["']/, '復帰不能な案内終了ボタンを常設しない');
});

test('チュートリアル段1: ディレクター有無で操作なしの世界JSONと入力journalが完全一致する', () => {
  const guided = createEngineApi(buildBlankCity(13));
  const plain = createEngineApi(buildBlankCity(13));
  const director = createTutorialDirector();
  let sequence = 0;
  director.observe(snapshotToViewModel(guided.snapshot({ scope: 'full' })), []);
  for (let tick = 0; tick < 90; tick += 1) {
    guided.advanceTicks(1);
    plain.advanceTicks(1);
    const events = guided.events({ afterSequence: sequence });
    if (events.length) sequence = events.at(-1).sequence;
    director.observe(snapshotToViewModel(guided.snapshot({ scope: 'full' })), events);
  }
  assert.deepEqual(guided.snapshot(), plain.snapshot());
  assert.deepEqual(guided.inputJournal(), plain.inputJournal());

  const save = director.exportSave(guided.inputJournal());
  const roundTrip = JSON.parse(JSON.stringify(save));
  const restored = createTutorialDirector({ state: roundTrip.tutorialState });
  assert.deepEqual(restored.readState(), director.readState());
  assert.deepEqual(roundTrip.engineJournal, guided.inputJournal());
});

test('チュートリアル段2: 書状は専用文面で一度だけ発行する', () => {
  const model = snapshotToViewModel(createEngineApi(buildBlankCity(11)).snapshot({ scope: 'full' }));
  const observed = structuredClone(model);
  observed.day = 7;
  observed.population = 13;
  observed.roadKeys = ['1,1', '2,2', '3,3', '4,4', '5,5'];
  const director = createTutorialDirector({ goals: [] });
  director.observe(observed, []);
  director.observe(observed, []);
  const [letter] = director.letters();
  assert.equal(director.letters().length, 1);
  assert.match(letter.body, /港だけがあります/);
  assert.match(letter.body, /道を敷いてください/);
  assert.doesNotMatch(`${letter.summary}\n${letter.body}`, /7日目|人口は13人|完成道路は5区画/);
  assert.equal(letter.attention, 'critical');
  assert.equal(TUTORIAL_LETTER_ATTENTION['tutorial-starvation-consequence'], 'critical');
  assert.equal(TUTORIAL_LETTER_ATTENTION['tutorial-bankruptcy-consequence'], 'critical');
  assert.equal(TUTORIAL_LETTER_ATTENTION['chapter-two-close'], 'notice');
  assert.equal(TUTORIAL_LETTERS.every(definition => typeof definition.render === 'function'), true);
});

test('第四章回帰: 利益・見送り・失効が未確定でも締め書状を安全に描画する', () => {
  const definition = TUTORIAL_LETTERS.find(letter => letter.id === 'chapter-four-close');
  const state = {
    goalResults: {
      'complete-profitable-order': { evidence: { completed: false } },
      'let-skippable-order-expire': {
        evidence: { selected: null, expired: null },
      },
    },
  };
  const letter = definition.render({ state });
  assert.match(letter.summary, /採算を比べる準備/);
  assert.equal(letter.facts.skipped.expired, null);
  assert.doesNotMatch(letter.body, /日目に実際に失効/);
});

test('チュートリアル段2: 実ロット数と実帳簿値を書状へ渡してもworldを変えない', () => {
  const model = structuredClone(
    snapshotToViewModel(createEngineApi(buildBlankCity(11)).snapshot({ scope: 'full' })),
  );
  model.companyLedger = [{ day: 2, amount: 37.5, reason: '実測決済' }];
  const definitions = [{
    id: 'event-fixture',
    when: ({ events }) => events.some(event => event.type === 'handling'),
    render: ({ model: observed, events }) => ({
      kicker: '実イベント', title: '荷役と帳簿の報告', summary: `${events[0].qty}荷`,
      body: `${events[0].qty}荷を扱い、帳簿へ${observed.companyLedger.at(-1).amount}デナリを記録しました。`,
      signature: '会社秘書 エレナ',
    }),
  }];
  const director = new TutorialDirector({ goals: [], letters: definitions });
  const event = { sequence: 4, type: 'handling', day: 2, tick: 33, qty: 6.25 };
  director.observe(model, [event]);
  director.observe(model, [event]);
  assert.equal(director.letters().length, 1);
  assert.match(director.letters()[0].body, /6\.25荷/);
  assert.match(director.letters()[0].body, /37\.5デナリ/);
  assert.equal(director.readState().lastEventSequence, event.sequence);
});

test('チュートリアル段3: skipは同じ世界とjournalを保ったまま案内だけを終了する', () => {
  const api = createEngineApi(buildBlankCity(14));
  const director = createTutorialDirector();
  director.observe(snapshotToViewModel(api.snapshot({ scope: 'full' })), []);
  const before = api.snapshot();
  const journal = api.inputJournal();
  const skipped = director.skip();
  assert.equal(skipped.active, false);
  assert.equal(skipped.skipped, true);
  assert.equal(director.currentObjective(), null);
  assert.deepEqual(api.snapshot(), before);
  assert.deepEqual(api.inputJournal(), journal);

  const completedModel = structuredClone(snapshotToViewModel(before));
  const portEntrance = completedModel.buildings.find(building => building.roles.includes('port')).entrance;
  completedModel.terrain[portEntrance.y][portEntrance.x + 1] = {
    ...completedModel.terrain[portEntrance.y][portEntrance.x + 1], kind: 'forest',
  };
  completedModel.roadKeys = [`${portEntrance.x},${portEntrance.y}`];
  completedModel.buildings.push({ type: 'logger' });
  const completionDirector = new TutorialDirector({ goals: [TUTORIAL_GOALS[0]], letters: [] });
  completionDirector.observe(completedModel, []);
  assert.equal(completionDirector.currentObjective().complete, true);
  assert.deepEqual(completionDirector.currentObjective().progress, { done: 1, total: 1 });
});

test('チュートリアル段4: tutorialだけが同じ未開拓worldへディレクターを重ねる', () => {
  const tutorial = createEngineController({ seed: 11, mode: 'tutorial' });
  const sandbox = createEngineController({ seed: 11, mode: 'sandbox' });
  assert.deepEqual(tutorial.readModel(), sandbox.readModel());
  assert.ok(createTutorialDirectorForMode('tutorial'));
  assert.equal(createTutorialDirectorForMode('sandbox'), null);
  assert.equal(createTutorialDirectorForMode('test'), null);
});

test('チュートリアル段5前提実測: 港だけの無人島でも木こり区画へ15日目に移民が入る', () => {
  for (const seed of [11, 13, 14]) {
    const controller = createEngineController({ seed, mode: 'tutorial' });
    const preview = findPreview(controller.readModel(), 'logger');
    assert.ok(preview, `seed${seed}で木こりを配置できる`);
    assert.equal(controller.operate({
      type: 'place_building', job: 'logger',
      x: preview.entrance.x, y: preview.entrance.y,
      buildingX: preview.x, buildingY: preview.y,
    }).ok, true);
    controller.advanceTicks(15 * 30);
    const model = controller.readModel();
    assert.equal(model.population, 9, `seed${seed}の15日目人口`);
    assert.equal(model.buildings.some(building => building.roles.includes('market')), false);
    assert.equal(model.roadKeys.length, 0);
  }
});

test('チュートリアル段5: 木こりの後に市場・食料便を先に整え、それから実入植を待つ', () => {
  const controller = createEngineController({ seed: 11, mode: 'tutorial' });
  const director = createTutorialDirector();
  let sequence = 0;
  const observedEvents = [];
  const observe = () => {
    const events = controller.events(sequence);
    if (events.length) sequence = events.at(-1).sequence;
    observedEvents.push(...events);
    director.observe(controller.readModel(), events);
    return events;
  };
  observe();

  const setup = findRoadLoggerSetup(controller.readModel());
  assert.ok(setup, '港から森の際へ道を通し、木こりを置ける組合せがある');
  assert.equal(controller.operate({
    type: 'add_road', start: setup.road.start, end: setup.road.end,
  }).ok, true);
  observe();
  assert.equal(director.readState().completedGoals.includes('first-road-and-logger'), true);
  assert.equal(director.currentObjective().id, 'first-logger');
  assert.equal(controller.currentObjective, undefined, '世界controllerへチュートリアル能力を混ぜない');
  assert.equal(controller.operate({
    type: 'place_building', job: 'logger',
    x: setup.logger.entrance.x, y: setup.logger.entrance.y,
    buildingX: setup.logger.x, buildingY: setup.logger.y,
  }).ok, true);
  observe();
  assert.equal(director.readState().completedGoals.includes('first-logger'), true);
  assert.equal(director.currentObjective().id, 'market-for-logs');

  const port = controller.readModel().buildings.find(building => building.roles.includes('port'));
  const marketPreview = findPreviewNear(controller.readModel(), 'market', port.entrance);
  assert.equal(controller.operate({
    type: 'place_building', job: 'market',
    x: marketPreview.entrance.x, y: marketPreview.entrance.y,
    buildingX: marketPreview.x, buildingY: marketPreview.y,
  }).ok, true);
  observe();
  const market = controller.readModel().buildings.find(building => building.roles.includes('market'));
  if (!director.readState().completedGoals.includes('connect-market-to-port')) {
    const portRoad = previewRoadPlacement(controller.readModel(), port.entrance, market.entrance);
    if (portRoad.ok) {
      assert.equal(controller.operate({ type: 'add_road', start: portRoad.start, end: portRoad.end }).ok, true);
      observe();
    }
  }
  observe();
  assert.equal(director.currentObjective().id, 'request-first-aid');
  assert.equal(controller.operate({ type: 'request_aid' }).ok, true);
  observe();
  assert.equal(director.currentObjective().id, 'first-settlers-arrive');

  let arrival = null;
  while (!arrival && controller.readModel().day <= 16) {
    controller.advanceTicks(1);
    const events = observe();
    arrival = events.find(event => event.type === 'arrival' && event.reason === 'new_household') ?? null;
  }
  assert.ok(arrival, '入植イベントが実際に発生する');
  const model = controller.readModel();
  const household = model.households.find(candidate => candidate.id === arrival.householdId);
  assert.ok(household);
  assert.equal(household.job, 'logger');
  assert.equal(director.readState().completedGoals.includes('first-settlers-arrive'), true);
  assert.equal(director.currentObjective().id, 'place-island-food', '入植の次は木工房より先に食料職へ進む');

  const letter = director.letters().find(candidate => candidate.id === 'first-settlers-report');
  assert.ok(letter);
  assert.match(letter.body, new RegExp(`${arrival.day}日目`));
  assert.match(letter.body, new RegExp(`${household.members}人の世帯`));
  assert.match(letter.body, new RegExp(`人口は${model.population}人`));
  const letterCount = director.letters().length;
  director.observe(model, [arrival]);
  assert.equal(director.letters().length, letterCount, '同じ入植イベントでは再発行しない');

  const journal = controller.inputJournal();
  assert.deepEqual(journal.filter(row => row.op.type === 'request_aid').length, 1);
  assert.deepEqual(journal.slice(0, 3).map(row => row.op.type), [
    'add_road', 'place_building', 'place_building',
  ]);
  const replay = createEngineController({ seed: 11, mode: 'tutorial' });
  let replayTick = 0;
  for (const row of journal) {
    replay.advanceTicks(row.tick - replayTick);
    replayTick = row.tick;
    assert.equal(replay.operate(row.op).ok, true);
  }
  replay.advanceTicks(model.tick - replayTick);
  assert.deepEqual(replay.readModel(), model);
  assert.deepEqual(replay.inputJournal(), journal);
});

test('チュートリアル段6: 市場→支援→入植→食料職→木工房の安全な順で初商いを実況する', () => {
  const controller = createEngineController({ seed: 11, mode: 'tutorial' });
  const director = createTutorialDirector();
  const deaths = [];
  let sequence = 0;
  const observe = () => {
    const events = controller.events(sequence);
    if (events.length) sequence = events.at(-1).sequence;
    deaths.push(...events.filter(event => event.type === 'death'));
    director.observe(controller.readModel(), events);
    return events;
  };
  const advanceUntil = (predicate, maxDays, label) => {
    const limit = controller.readModel().day + maxDays;
    while (controller.readModel().day <= limit) {
      controller.advanceTicks(1);
      observe();
      if (predicate()) return;
    }
    assert.fail(`${label}が${maxDays}日以内に起きる`);
  };
  const hasLetter = id => director.letters().some(letter => letter.id === id);
  observe();

  const setup = findRoadLoggerSetup(controller.readModel());
  assert.ok(setup);
  assert.equal(controller.operate({
    type: 'add_road', start: setup.road.start, end: setup.road.end,
  }).ok, true);
  assert.equal(controller.operate({
    type: 'place_building', job: 'logger',
    x: setup.logger.entrance.x, y: setup.logger.entrance.y,
    buildingX: setup.logger.x, buildingY: setup.logger.y,
  }).ok, true);
  observe();

  assert.equal(director.currentObjective().id, 'first-logger');
  observe();
  assert.equal(director.currentObjective().id, 'market-for-logs');

  const port = controller.readModel().buildings.find(building => building.roles.includes('port'));
  const marketPreview = findPreviewNear(controller.readModel(), 'market', port.entrance);
  assert.ok(marketPreview);
  assert.equal(controller.operate({
    type: 'place_building', job: 'market',
    x: marketPreview.entrance.x, y: marketPreview.entrance.y,
    buildingX: marketPreview.x, buildingY: marketPreview.y,
  }).ok, true);
  observe();
  observe();
  assert.equal(director.readState().completedGoals.includes('market-for-logs'), true);

  const afterMarket = controller.readModel();
  const market = afterMarket.buildings.find(building => building.roles.includes('market'));
  const loggerHome = afterMarket.buildings.find(building => building.type === 'logger');
  const walkNear = estimateWalkLen(afterMarket, loggerHome.entrance, market.entrance);
  if (walkNear <= 14) {
    assert.equal(hasLetter('market-distance-warning'), false, '近い市場では警告を出さない');
  }

  if (!director.readState().completedGoals.includes('connect-market-to-port')) {
    assert.equal(hasLetter('market-needs-port-road'), true, '未接続なら輸入棚が空である事実の書状が出る');
    const portRoad = previewRoadPlacement(controller.readModel(), port.entrance, market.entrance);
    assert.equal(portRoad.ok, true, '港と市場を結ぶ道を引ける');
    assert.equal(controller.operate({
      type: 'add_road', start: portRoad.start, end: portRoad.end,
    }).ok, true);
    observe();
    observe();
  } else {
    assert.equal(hasLetter('market-needs-port-road'), false, '接続済みなら催促書状は出ない');
  }
  assert.equal(director.readState().completedGoals.includes('connect-market-to-port'), true);
  observe();
  const aidPlan = director.letters().find(letter => letter.id === 'initial-aid-plan');
  assert.match(aidPlan.body, /食料支援を1回要請/);
  assert.equal(director.currentObjective().id, 'request-first-aid');
  const firstAid = controller.operate({ type: 'request_aid' });
  assert.deepEqual([firstAid.ok, firstAid.qty, firstAid.requests], [true, 240, 1]);
  observe();
  assert.equal(director.currentObjective().id, 'first-settlers-arrive');
  advanceUntil(() => director.readState().completedGoals.includes('first-settlers-arrive'), 20, '最初の入植');
  assert.equal(director.currentObjective().id, 'place-island-food');

  for (const job of ['fisher', 'fisher', 'veg', 'veg', 'logger', 'logger']) {
    const placement = findReachablePreviewNear(controller.readModel(), job, market.entrance)?.preview;
    assert.ok(placement, `${job}を市場から徒歩14以内へ置ける`);
    assert.equal(controller.operate({
      type: 'place_building', job,
      x: placement.entrance.x, y: placement.entrance.y,
      buildingX: placement.x, buildingY: placement.y,
    }).ok, true);
    observe();
  }
  assert.equal(director.currentObjective().id, 'first-woodshop');

  advanceUntil(() => hasLetter('first-import-food'), 30, '本土の食料が市場に並ぶ');
  advanceUntil(() => hasLetter('first-log-stall'), 20, '市場に丸太が並ぶ');
  assert.equal(director.currentObjective().id, 'first-woodshop');

  const woodshopPreview = findPreviewNear(controller.readModel(), 'woodshop', market.entrance);
  assert.ok(woodshopPreview);
  assert.equal(controller.operate({
    type: 'place_building', job: 'woodshop',
    x: woodshopPreview.entrance.x, y: woodshopPreview.entrance.y,
    buildingX: woodshopPreview.x, buildingY: woodshopPreview.y,
  }).ok, true);
  observe();
  assert.equal(director.readState().completedGoals.includes('first-woodshop'), true);

  advanceUntil(() => hasLetter('first-tools'), 90, '上流3軒の入植後に起きる最初の木製品の書状');
  const letters = director.letters();
  const toolsIndex = letters.findIndex(letter => letter.id === 'first-tools');
  const tradeIndex = letters.findIndex(letter => letter.id === 'first-log-trade');
  if (tradeIndex === -1 || tradeIndex > toolsIndex) {
    assert.match(letters[toolsIndex].body, /持参した丸太/, '市場取引前の初木製品は持参丸太として実況する');
  }

  if (!hasLetter('first-log-trade')) {
    advanceUntil(() => hasLetter('first-log-trade'), 45, '丸太の初商い');
  }
  const tradeLetter = director.letters().find(letter => letter.id === 'first-log-trade');
  assert.match(tradeLetter.body, /1荷あたり\d+(\.\d)?デナリで商われました/);

  const model = controller.readModel();
  const journal = controller.inputJournal();
  assert.deepEqual(
    journal.slice(0, 3).map(row => row.op.type),
    ['add_road', 'place_building', 'place_building'],
  );
  assert.equal(journal.at(-1).op.type, 'place_building');
  assert.equal(deaths.length, 0, '支援1回と早期食料配置で初木製品・初商いまで死亡ゼロ');
  const replay = createEngineController({ seed: 11, mode: 'tutorial' });
  let replayTick = 0;
  for (const row of journal) {
    replay.advanceTicks(row.tick - replayTick);
    replayTick = row.tick;
    assert.equal(replay.operate(row.op).ok, true);
  }
  replay.advanceTicks(model.tick - replayTick);
  assert.deepEqual(replay.readModel(), model);
});

test('チュートリアル段6: 市場まで見積り14超の家にはエレナが実測値で警告する', () => {
  const controller = createEngineController({ seed: 11, mode: 'tutorial' });
  const director = createTutorialDirector();
  let sequence = 0;
  const observe = () => {
    const events = controller.events(sequence);
    if (events.length) sequence = events.at(-1).sequence;
    director.observe(controller.readModel(), events);
  };
  observe();
  const setup = findRoadLoggerSetup(controller.readModel());
  assert.ok(setup);
  assert.equal(controller.operate({
    type: 'add_road', start: setup.road.start, end: setup.road.end,
  }).ok, true);
  assert.equal(controller.operate({
    type: 'place_building', job: 'logger',
    x: setup.logger.entrance.x, y: setup.logger.entrance.y,
    buildingX: setup.logger.x, buildingY: setup.logger.y,
  }).ok, true);
  let settled = false;
  while (!settled && controller.readModel().day <= 16) {
    controller.advanceTicks(1);
    observe();
    settled = controller.readModel().households.some(household => household.job === 'logger');
  }
  assert.ok(settled, '木こり世帯が入居する');

  const model = controller.readModel();
  const loggerHome = model.buildings.find(building => building.type === 'logger');
  let farPreview = null;
  for (let y = model.height - 1; y >= 0 && !farPreview; y -= 1) {
    for (let x = model.width - 1; x >= 0 && !farPreview; x -= 1) {
      const preview = previewBuildingPlacement(model, 'market', { x, y });
      if (!preview.ok) continue;
      const walk = estimateWalkLen(model, loggerHome.entrance, preview.entrance);
      if (Number.isFinite(walk) && walk > 14) farPreview = preview;
    }
  }
  assert.ok(farPreview, '見積り14超の市場候補地が存在する');
  assert.equal(controller.operate({
    type: 'place_building', job: 'market',
    x: farPreview.entrance.x, y: farPreview.entrance.y,
    buildingX: farPreview.x, buildingY: farPreview.y,
  }).ok, true);
  observe();
  const warning = director.letters().find(letter => letter.id === 'market-distance-warning');
  assert.ok(warning, '遠距離警告の書状が出る');
  const after = controller.readModel();
  const placedMarket = after.buildings.find(building => building.roles.includes('market'));
  const measured = estimateWalkLen(after, loggerHome.entrance, placedMarket.entrance);
  assert.ok(measured > 14);
  assert.match(warning.body, new RegExp(`およそ${measured.toFixed(1)}`));
});

test('チュートリアル段7〜9: 支援1回・早期食料・事前備蓄で初注文を死亡ゼロ完遂する', () => {
  const controller = createEngineController({ seed: 11, mode: 'tutorial' });
  const director = createTutorialDirector();
  let sequence = 0;
  const observedEvents = [];
  const observe = () => {
    const events = controller.events(sequence);
    if (events.length) sequence = events.at(-1).sequence;
    observedEvents.push(...events);
    director.observe(controller.readModel(), events);
    return events;
  };
  const hasLetter = id => director.letters().some(letter => letter.id === id);
  const advanceDaysUntil = (predicate, maxDays, label) => {
    const limit = controller.readModel().day + maxDays;
    while (controller.readModel().day <= limit) {
      controller.advanceTicks(30);
      observe();
      if (predicate()) return;
    }
    assert.fail(`${label}が${maxDays}日以内に起きる`);
  };
  observe();

  const setup = findRoadLoggerSetup(controller.readModel());
  assert.equal(controller.operate({
    type: 'add_road', start: setup.road.start, end: setup.road.end,
  }).ok, true);
  assert.equal(controller.operate({
    type: 'place_building', job: 'logger',
    x: setup.logger.entrance.x, y: setup.logger.entrance.y,
    buildingX: setup.logger.x, buildingY: setup.logger.y,
  }).ok, true);
  observe();
  observe();

  const port = controller.readModel().buildings.find(building => building.roles.includes('port'));
  const marketPreview = findPreviewNear(controller.readModel(), 'market', port.entrance);
  assert.equal(controller.operate({
    type: 'place_building', job: 'market',
    x: marketPreview.entrance.x, y: marketPreview.entrance.y,
    buildingX: marketPreview.x, buildingY: marketPreview.y,
  }).ok, true);
  observe();
  const market = controller.readModel().buildings.find(building => building.roles.includes('market'));
  if (!director.readState().completedGoals.includes('connect-market-to-port')) {
    const portRoad = previewRoadPlacement(controller.readModel(), port.entrance, market.entrance);
    if (portRoad.ok) {
      assert.equal(controller.operate({ type: 'add_road', start: portRoad.start, end: portRoad.end }).ok, true);
      observe();
    }
  }
  observe();
  assert.equal(director.currentObjective().id, 'request-first-aid');
  const firstAid = controller.operate({ type: 'request_aid' });
  assert.deepEqual([firstAid.ok, firstAid.qty, firstAid.requests], [true, 240, 1]);
  observe();
  assert.equal(director.currentObjective().id, 'first-settlers-arrive');
  advanceDaysUntil(
    () => director.readState().completedGoals.includes('first-settlers-arrive'),
    20,
    '市場設置後の最初の入植',
  );

  for (const job of ['fisher', 'fisher', 'veg', 'veg', 'logger', 'logger']) {
    const preview = findReachablePreviewNear(controller.readModel(), job, market.entrance)?.preview;
    assert.ok(preview, `${job}を市場から徒歩14以内へ置ける`);
    assert.equal(controller.operate({
      type: 'place_building', job,
      x: preview.entrance.x, y: preview.entrance.y,
      buildingX: preview.x, buildingY: preview.y,
    }).ok, true);
    observe();
  }
  const woodshopPreview = findReachablePreviewNear(
    controller.readModel(), 'woodshop', market.entrance,
  )?.preview;
  assert.equal(controller.operate({
    type: 'place_building', job: 'woodshop',
    x: woodshopPreview.entrance.x, y: woodshopPreview.entrance.y,
    buildingX: woodshopPreview.x, buildingY: woodshopPreview.y,
  }).ok, true);
  observe();
  assert.equal(director.currentObjective().id, 'warehouse-for-order');

  let warehousePlan = null;
  const modelForWarehouse = controller.readModel();
  for (let y = 0; y < modelForWarehouse.height; y += 1) {
    for (let x = 0; x < modelForWarehouse.width; x += 1) {
      const preview = previewBuildingPlacement(modelForWarehouse, 'warehouse', { x, y });
      if (!preview.ok) continue;
      const road = previewRoadPlacement(modelForWarehouse, market.entrance, preview.entrance);
      if (!road.ok) continue;
      if (!warehousePlan || road.cells.length < warehousePlan.road.cells.length) {
        warehousePlan = { preview, road };
      }
    }
  }
  assert.ok(warehousePlan, '市場から道を結べる倉庫候補がある');
  assert.equal(controller.operate({
    type: 'place_building', job: 'warehouse',
    x: warehousePlan.preview.entrance.x, y: warehousePlan.preview.entrance.y,
    buildingX: warehousePlan.preview.x, buildingY: warehousePlan.preview.y,
  }).ok, true);
  observe();
  const warehouseRoad = previewRoadPlacement(
    controller.readModel(), market.entrance, warehousePlan.preview.entrance,
  );
  if (warehouseRoad.ok) {
    assert.equal(controller.operate({
      type: 'add_road', start: warehouseRoad.start, end: warehouseRoad.end,
    }).ok, true);
    observe();
  }
  observe();
  assert.equal(director.currentObjective().id, 'prepare-first-tools-stock');
  assert.equal(controller.operate({
    type: 'set_stock_target', goods: 'tools', qty: 12,
  }).ok, true);
  observe();
  assert.equal(director.currentObjective().id, 'accept-first-order');

  advanceDaysUntil(() => Boolean(controller.readModel().orderOffer), 110, '木工房が動き始めた後の初注文到着');
  const offer = controller.readModel().orderOffer;
  const offerDay = controller.readModel().day;
  assert.ok(offerDay >= 75 && offerDay <= 120, `木工房の生産適格日までに初注文が届く: ${offerDay}日`);
  assert.equal(offer.g, 'tools');
  assert.match(director.letters().find(letter => letter.id === 'first-order-offer').summary,
    new RegExp(`${offer.qty}荷`));
  assert.equal(controller.operate({ type: 'accept_order' }).ok, true);
  observe();
  assert.equal(director.currentObjective().id, 'order-procurement-target');
  assert.equal(hasLetter('order-needs-target'), false, '12荷の事前備蓄を同量の初注文でそのまま使う');
  observe();
  assert.equal(director.readState().completedGoals.includes('order-procurement-target'), true);
  assert.equal(controller.readModel().stockTargets.tools, 12, '入力した12荷を維持する');
  observe();
  assert.equal(director.readState().completedGoals.includes('first-order-procurement'), true);
  assert.equal(hasLetter('first-company-procurement'), true, '注文前の実調達在庫を確認する');

  const completionLimit = (offer.due + 1) * 30;
  while (!hasLetter('first-order-complete') && controller.readModel().tick < completionLimit) {
    controller.advanceTicks(1);
    observe();
  }
  const completionEvent = observedEvents.find(event => (
    event.type === 'notice' && event.message?.includes('★注文を納めた')
  ));
  assert.ok(completionEvent, `注文期限${offer.due}日目までに完遂イベントが起きる`);
  assert.ok(
    controller.readModel().day <= offerDay + 10,
    `上流3軒をまだ持たない開拓初期でも、小口の事前備蓄により受諾後10日以内に完遂する: 受諾${offerDay}日、完遂${controller.readModel().day}日`,
  );
  const handlingEvents = observedEvents.filter(event => (
    event.type === 'handling' && event.direction === 'export' && event.goods === offer.g
  ));
  assert.ok(handlingEvents.length > 0, '港で逐次荷役が観測できる');
  assert.equal(handlingEvents.every(event => event.qty > 0 && event.qty <= 1 + 1e-9), true);

  const completeModel = controller.readModel();
  const revenue = completeModel.companyLedger
    .filter(row => row.reason === `本国注文へ${offer.g}を出荷`)
    .reduce((total, row) => total + row.amount, 0);
  assert.ok(revenue > 0);
  assert.equal(completeModel.activeOrder, null);
  assert.equal(director.readState().completedGoals.includes('complete-first-order'), true);
  observe();
  assert.equal(director.readState().completedGoals.includes('close-first-chapter'), true);
  const closing = director.letters().find(letter => letter.id === 'chapter-one-close');
  assert.equal(closing.facts.aidRequests, 1);
  assert.equal(observedEvents.some(event => event.type === 'death'), false,
    '表示された手順だけで初注文完遂まで死亡ゼロ');
  assert.deepEqual(
    controller.inputJournal().filter(row => row.op.type === 'request_aid').map(row => row.op.type),
    ['request_aid'],
  );

  const journal = controller.inputJournal();
  const replay = createEngineController({ seed: 11, mode: 'tutorial' });
  let replayTick = 0;
  for (const row of journal) {
    replay.advanceTicks(row.tick - replayTick);
    replayTick = row.tick;
    assert.equal(replay.operate(row.op).ok, true);
  }
  replay.advanceTicks(completeModel.tick - replayTick);
  assert.deepEqual(replay.readModel(), completeModel, '新しい第一章journalを同じ世界へ再生できる');
  assert.deepEqual(replay.inputJournal(), journal);
  tutorialThroughPlay = {
    controller, director, observe, observedEvents,
    firstChapter: { model: completeModel, journal },
  };
});

test('チュートリアル段10: 第一章を終えた同じ世界で既設道路の実測効果を認める', () => {
  const { controller, director, observe } = tutorialThroughPlay;
  const limit = controller.readModel().tick + 45 * 30;
  while (!director.readState().completedGoals.includes('improve-logger-route')
    && controller.readModel().tick < limit) {
    controller.advanceTicks(1);
    observe();
  }
  assert.equal(director.readState().completedGoals.includes('improve-logger-route'), true);
  const evidence = director.readState().goalResults['improve-logger-route'].evidence;
  assert.ok(evidence.tripTicks > 0);
  const resultLetter = director.letters().find(letter => (
    letter.id === 'logger-road-already-good' || letter.id === 'logger-road-recovered'
  ));
  assert.ok(resultLetter);
  assert.match(resultLetter.body, new RegExp(`${evidence.tripTicks.toFixed(1)}時間ぶん`));
});

test('チュートリアル段10実測: 遠回りの木こりは実往復tickが長く、直結道路で倍率が回復する', () => {
  const rows = [11, 13, 14].map(seed => measureLoggerRoadRecovery(seed));
  for (const row of rows) {
    assert.ok(row.before.tripTicks > row.after.tripTicks, `seed${row.seed}の往復時間が短縮する`);
    assert.ok(row.before.multiplier < row.after.multiplier, `seed${row.seed}の生産倍率が回復する`);
    assert.ok(row.before.tripTicks <= 30, `seed${row.seed}の遠回りでも市場往復は成立する`);
    assert.ok(row.before.tripTicks > LOGGER_TRIP_WARNING_TICKS);
    assert.ok(row.after.tripTicks <= LOGGER_TRIP_WARNING_TICKS);
    assert.ok(row.before.tripTicks - row.after.tripTicks >= LOGGER_TRIP_RECOVERY_TICKS);
    const warning = row.director.letters().find(letter => letter.id === 'logger-trip-warning');
    const recovered = row.director.letters().find(letter => letter.id === 'logger-road-recovered');
    assert.match(warning.body, new RegExp(`${row.before.tripTicks.toFixed(1)}時間ぶん`));
    assert.match(recovered.body, new RegExp(`${row.after.tripTicks.toFixed(1)}時間ぶん`));
    assert.equal(row.director.currentObjective().complete, true);
  }
  console.log(`  段10実測 ${rows.map(row => (
    `seed${row.seed}:${row.before.tripTicks.toFixed(1)}tick/${row.before.multiplier.toFixed(3)}`
      + `→${row.after.tripTicks.toFixed(1)}tick/${row.after.multiplier.toFixed(3)}`
  )).join(' | ')}`);
});

const TUTORIAL_FOOD_GOODS = ['fish', 'veg', 'wheat', 'pres', 'pick', 'meat'];

function tutorialFoodMetrics(model) {
  return {
    day: model.day,
    importEma: TUTORIAL_FOOD_GOODS.reduce((total, goods) => total + (model.flowEma[goods]?.imp ?? 0), 0),
    productionEma: TUTORIAL_FOOD_GOODS.reduce((total, goods) => total + (model.flowEma[goods]?.prod ?? 0), 0),
    fishPrice: model.marketPrices.fish,
    vegPrice: model.marketPrices.veg,
    outflow: model.companyLedger.reduce((total, row) => {
      const goods = row.reason?.match(/^([^の]+)の本土仕入$/)?.[1];
      return goods && TUTORIAL_FOOD_GOODS.includes(goods) && row.amount < 0
        ? total - row.amount : total;
    }, 0),
  };
}

test('チュートリアル段11: 第一章で置いた漁師と野菜畑の実価格・実フロー変化を実況する', () => {
  const { controller, director, observe } = tutorialThroughPlay;
  observe();
  assert.equal(director.currentObjective().id, 'set-seasonal-stock-target');
  const opening = director.letters().find(letter => letter.id === 'food-dependence-report');
  assert.ok(opening);
  const baseline = tutorialFoodMetrics(controller.readModel());
  assert.equal(opening.facts.importEma, baseline.importEma);
  assert.ok(Math.abs(opening.facts.outflow - baseline.outflow) < 1e-12);
  const foodStartTick = controller.inputJournal()
    .find(row => row.op.type === 'place_building' && row.op.job === 'fisher').tick;
  const placement = director.readState().goalResults['place-island-food'];
  assert.equal(
    director.readState().completedGoals.includes('place-island-food'),
    true,
    `配置判定 ${JSON.stringify(placement)}`,
  );
  assert.ok(placement.evidence.fisherWalk <= 14);
  assert.ok(placement.evidence.vegWalk <= 14);

  const deadline = controller.readModel().day + 60;
  while (!director.readState().completedGoals.includes('observe-island-food-change')
    && controller.readModel().day < deadline) {
    controller.advanceTicks(30);
    observe();
  }
  assert.equal(director.readState().completedGoals.includes('observe-island-food-change'), true);
  const letter = director.letters().find(row => row.id === 'island-food-change');
  assert.ok(letter.facts.current.productionEma >= 0.25);
  assert.notEqual(letter.facts.current.importEma, letter.facts.before.importEma);
  assert.ok(
    letter.facts.current.fishPrice !== letter.facts.before.fishPrice
      || letter.facts.current.vegPrice !== letter.facts.before.vegPrice,
  );
  assert.match(letter.body, new RegExp(`1日あたり${letter.facts.before.importEma.toFixed(2)}荷から${letter.facts.current.importEma.toFixed(2)}荷へ`));
  tutorialThroughPlay.foodStartTick = foodStartTick;
  tutorialThroughPlay.foodBaseline = baseline;
});

test('チュートリアル段12: 個人運搬後の3シード実測帯で食料輸入EMAを自給目標にする', () => {
  const { controller, director, observe, foodStartTick, foodBaseline } = tutorialThroughPlay;
  const deadline = controller.readModel().day + 70;
  while (!director.readState().completedGoals.includes('reduce-food-imports')
    && controller.readModel().day < deadline) {
    controller.advanceTicks(30);
    observe();
  }
  assert.equal(director.readState().completedGoals.includes('reduce-food-imports'), true);
  const final = tutorialFoodMetrics(controller.readModel());
  assert.ok(final.importEma < FOOD_IMPORT_EMA_TARGET);
  assert.ok(final.productionEma >= 0.25);
  observe();
  const reached = director.letters().find(letter => letter.id === 'food-import-target-reached');
  assert.equal(reached.facts.target, FOOD_IMPORT_EMA_TARGET);
  assert.match(reached.body, new RegExp(`1日あたり${reached.facts.current.importEma.toFixed(2)}荷になり`));

  const journal = controller.inputJournal();
  const seedRows = [{ seed: 11, baseline: foodBaseline, final }];
  for (const seed of [13, 14]) {
    const replay = createEngineController({ seed, mode: 'tutorial' });
    let journalIndex = 0;
    let replayTick = 0;
    let replayBaseline = null;
    const targetTicks = [...new Set([
      ...journal.map(row => row.tick), foodStartTick, controller.readModel().tick,
    ])].sort((left, right) => left - right);
    for (const targetTick of targetTicks) {
      replay.advanceTicks(targetTick - replayTick);
      replayTick = targetTick;
      if (targetTick === foodStartTick) replayBaseline = tutorialFoodMetrics(replay.readModel());
      while (journal[journalIndex]?.tick === targetTick) {
        const result = replay.operate(journal[journalIndex].op);
        assert.equal(result.ok, true, `seed${seed}で${journal[journalIndex].op.type}を再生できる`);
        journalIndex += 1;
      }
    }
    const deadlineTick = foodStartTick + 70 * 30;
    while (tutorialFoodMetrics(replay.readModel()).importEma >= FOOD_IMPORT_EMA_TARGET
      && replayTick < deadlineTick) {
      replay.advanceTicks(30);
      replayTick += 30;
    }
    seedRows.push({ seed, baseline: replayBaseline, final: tutorialFoodMetrics(replay.readModel()) });
  }
  console.log(`  段12実測 ${seedRows.map(row => (
    `seed${row.seed}:baseline=${row.baseline.importEma.toFixed(3)}`
      + `→${row.final.importEma.toFixed(3)} / 生産${row.final.productionEma.toFixed(2)}`
  )).join(' | ')}`);
  for (const row of seedRows) {
    assert.ok(row.final.importEma < FOOD_IMPORT_EMA_TARGET, `seed${row.seed}が輸入EMA帯を通る`);
    assert.ok(row.final.productionEma >= 0.25, `seed${row.seed}で島内食料生産が立ち上がる`);
  }
});

test('チュートリアル段13: 第二章を実数で締め、同じ世界で公開操作を続けられる', () => {
  const { controller, director, observe } = tutorialThroughPlay;
  observe();
  assert.equal(director.readState().completedGoals.includes('close-second-chapter'), true);
  assert.equal(director.isComplete(), false);
  assert.equal(director.currentObjective().id, 'set-seasonal-stock-target');
  const closing = director.letters().find(letter => letter.id === 'chapter-two-close');
  assert.ok(closing.facts.current.importEma < FOOD_IMPORT_EMA_TARGET);
  assert.match(closing.body, /ご報告だけです/);
  assert.doesNotMatch(closing.body, /EMA|直近30日/);

  const beforeJournal = controller.inputJournal().length;
  const beforeTick = controller.readModel().tick;
  assert.equal(controller.operate({ type: 'set_stock_target', goods: 'fish', qty: 3 }).ok, true);
  observe();
  assert.equal(controller.readModel().stockTargets.fish, 3);
  assert.equal(controller.readModel().tick, beforeTick);
  assert.equal(controller.inputJournal().length, beforeJournal + 1);
  assert.equal(controller.operate({ type: 'set_stock_target', goods: 'fish', qty: 0 }).ok, true);
  observe();
  assert.equal(controller.readModel().stockTargets.fish, 0,
    '第三章の備えをプレイヤー自身が新しく定められるよう自由操作smokeの目標を戻す');
  assert.equal(controller.inputJournal().length, beforeJournal + 2);

  const finalModel = controller.readModel();
  const replay = createEngineController({ seed: 11, mode: 'tutorial' });
  let replayTick = 0;
  for (const row of controller.inputJournal()) {
    replay.advanceTicks(row.tick - replayTick);
    replayTick = row.tick;
    assert.equal(replay.operate(row.op).ok, true);
  }
  replay.advanceTicks(finalModel.tick - replayTick);
  assert.deepEqual(replay.readModel(), finalModel, '第二章完走後も全操作journalから同じ自由プレイ世界を再生できる');
  tutorialThroughPlay.secondChapter = {
    model: finalModel,
    journal: controller.inputJournal(),
  };
});

function replayTutorialJournal(journal, finalTick, seed = 11) {
  const replay = createEngineController({ seed, mode: 'tutorial' });
  let replayTick = 0;
  for (const row of journal) {
    replay.advanceTicks(row.tick - replayTick);
    replayTick = row.tick;
    replay.operate(row.op);
  }
  replay.advanceTicks(finalTick - replayTick);
  return replay;
}

test('チュートリアル段14: ディレクター有無で第二章完走後の世界が完全一致する', () => {
  const { model, journal } = tutorialThroughPlay.secondChapter;
  const replay = replayTutorialJournal(journal, model.tick);
  assert.deepEqual(replay.readModel(), model);
  assert.deepEqual(replay.inputJournal(), journal);
});

test('チュートリアル段14: 目標を無視した飢餓・破産を実数で語り、失敗後も進行できる', () => {
  const controller = createEngineController({ seed: 11, mode: 'tutorial' });
  const director = createTutorialDirector();
  let sequence = 0;
  const observedEvents = [];
  const observe = () => {
    const events = controller.events(sequence);
    if (events.length) sequence = events.at(-1).sequence;
    observedEvents.push(...events);
    director.observe(controller.readModel(), events);
    return events;
  };
  observe();

  let model = controller.readModel();
  const port = model.buildings.find(building => building.roles.includes('port'));
  const failureSetup = findRoadLoggerSetup(model);
  const logger = failureSetup?.logger;
  assert.ok(logger && failureSetup.road);
  assert.equal(controller.operate({
    type: 'place_building', job: 'logger',
    x: logger.entrance.x, y: logger.entrance.y,
    buildingX: logger.x, buildingY: logger.y,
  }).ok, true);
  observe();
  assert.equal(director.currentObjective().id, 'first-road-and-logger');
  assert.equal(director.currentObjective().complete, false);

  model = controller.readModel();
  const burn = findPreviewNear(model, 'woodshop', port.entrance);
  assert.ok(burn, '浪費も公開された通常の建築操作だけで行える');
  const spendToCreditEdge = () => {
    let built = 0;
    for (; built < 1000; built += 1) {
      const placed = controller.operate({
        type: 'place_building', job: 'woodshop',
        x: burn.entrance.x, y: burn.entrance.y,
        buildingX: burn.x, buildingY: burn.y,
      });
      if (!placed.ok) break;
      assert.equal(controller.operate({
        type: 'remove_building', buildingId: placed.buildingId,
      }).ok, true);
    }
    assert.ok(built < 1000, '信用限度で建築支出が止まる');
    return built;
  };

  let paidBuildings = 0;
  for (let month = 0; month < 45; month += 1) {
    paidBuildings += spendToCreditEdge();
    controller.advanceTicks(30 * 30);
    observe();
    if (director.letters().some(letter => letter.id === 'tutorial-bankruptcy-consequence')
      && director.letters().some(letter => letter.id === 'tutorial-starvation-consequence')) break;
  }
  assert.ok(paidBuildings > 0);
  const starvation = director.letters().find(letter => letter.id === 'tutorial-starvation-consequence');
  const bankruptcy = director.letters().find(letter => letter.id === 'tutorial-bankruptcy-consequence');
  assert.ok(starvation, `市場も道路も作らず放置すると実死亡事象が書状になる: ${JSON.stringify({
    day: controller.readModel().day,
    population: controller.readModel().population,
    households: controller.readModel().households.length,
    deathEvents: observedEvents.filter(event => event.type === 'death').length,
    notices: observedEvents.filter(event => event.message?.includes('餓')).map(event => event.message),
  })}`);
  assert.ok(bankruptcy, '通常建築の浪費と実月利による最終通告が書状になる');
  assert.ok(starvation.facts.events > 0);
  assert.ok(starvation.facts.peopleLost > 0, '死亡イベント自身の実人数を使う');
  assert.ok(starvation.facts.population >= 0);
  assert.equal(starvation.facts.currentGoal.id, 'first-road-and-logger');
  assert.ok(bankruptcy.facts.debt > bankruptcy.facts.limit);
  assert.equal(bankruptcy.facts.companyMoney, controller.readModel().companyMoney);
  assert.equal(bankruptcy.facts.currentGoal.id, 'first-road-and-logger');
  assert.match(starvation.body, /漁師か野菜畑を増やし.*市場まで道が続いているか/);
  assert.match(bankruptcy.body, /新しい建設と買上げを止め.*収入と支出を比べてください/);
  assert.doesNotMatch(`${starvation.body}\n${bankruptcy.body}`, /教程|実記録|EMA/);
  assert.equal(director.currentObjective().id, 'first-road-and-logger');
  console.log(`  段14失敗実測 飢餓day${starvation.issuedDay}:人口${starvation.facts.population}`
    + ` / 破産day${bankruptcy.issuedDay}:債務${bankruptcy.facts.debt}>限度${bankruptcy.facts.limit}`
    + ` / 建築支出${paidBuildings}回`);

  model = controller.readModel();
  assert.equal(controller.operate({
    type: 'add_road', start: failureSetup.road.start, end: failureSetup.road.end,
  }).ok, true);
  observe();
  assert.equal(director.currentObjective().id, 'first-logger');
  observe();
  assert.equal(director.readState().completedGoals.includes('first-road-and-logger'), true,
    '飢餓・破産後も実snapshotで目標列が進む');
  assert.equal(director.readState().completedGoals.includes('first-logger'), true,
    '先に建ててあった木こりも、次の独立目標として確認される');

  const finalModel = controller.readModel();
  const journal = controller.inputJournal();
  const replay = replayTutorialJournal(journal, finalModel.tick);
  assert.deepEqual(replay.readModel(), finalModel,
    '失敗経路もディレクターなしのjournal再生と完全一致する');
  tutorialThroughPlay.failure = {
    model: finalModel,
    journal,
    tutorialState: director.readState(),
    starvationId: starvation.id,
    bankruptcyId: bankruptcy.id,
  };
});

test('チュートリアル段15: 第一章・第二章の完走journal 2本をリリースsmokeに常設する', () => {
  const chapters = [
    ['第一章', tutorialThroughPlay.firstChapter],
    ['第二章', tutorialThroughPlay.secondChapter],
  ];
  assert.ok(chapters[0][1].journal.length > 0);
  assert.ok(chapters[1][1].journal.length > chapters[0][1].journal.length);
  assert.ok(chapters[1][1].model.tick > chapters[0][1].model.tick);
  for (const [chapter, fixture] of chapters) {
    const replay = replayTutorialJournal(fixture.journal, fixture.model.tick);
    assert.deepEqual(replay.readModel(), fixture.model, `${chapter}完走journalの世界が完全一致する`);
    assert.deepEqual(replay.inputJournal(), fixture.journal, `${chapter}完走journal自体も同一である`);
  }
});

test('チュートリアル段16実測: 季節在庫谷は任意観察として3シードで有限期間だけ追う', () => {
  const valleyGoal = TUTORIAL_GOALS.find(goal => goal.id === 'observe-seasonal-food-valley');
  const rows = [];
  for (const seed of [11, 13, 14]) {
    const fixture = tutorialThroughPlay.secondChapter;
    const replay = replayTutorialJournal(fixture.journal, fixture.model.tick, seed);
    const director = createTutorialDirector({
      goals: [valleyGoal],
      letters: [],
      state: { version: 1, active: true, completedGoals: ['close-second-chapter'] },
    });
    director.observe(replay.readModel(), []);
    const deadline = replay.readModel().day + 120;
    while (!director.readState().completedGoals.includes(valleyGoal.id)
      && replay.readModel().day < deadline) {
      replay.advanceTicks(30);
      director.observe(replay.readModel(), []);
    }
    const evidence = director.readState().goalResults[valleyGoal.id]?.evidence;
    assert.ok(Object.keys(evidence?.observations ?? {}).length > 0);
    if (evidence.valley) {
      assert.ok(evidence.valley.peakAvailability >= SEASONAL_SURPLUS_MIN);
      assert.ok(evidence.valley.valleyRatio <= SEASONAL_VALLEY_RATIO);
    }
    rows.push({ seed, valley: evidence.valley });
  }
  console.log(`  段16季節実測 ${rows.map(row => (
    row.valley
      ? `seed${row.seed}:${row.valley.goods} ${row.valley.peakAvailability.toFixed(1)}`
        + `→${row.valley.available.toFixed(1)}荷`
      : `seed${row.seed}:120日内は大きな谷なし`
  )).join(' | ')}`);
});

test('チュートリアル段16: 在庫谷を待たず、旧注文目標を閉じて食料の買上げ目標を定める', () => {
  const { controller, director, observe } = tutorialThroughPlay;
  observe();
  const reserve = director.readState().goalResults['set-seasonal-stock-target']?.evidence;
  assert.ok(reserve?.goods);
  if (reserve.firstOrderGoods && reserve.staleTarget > 0) {
    assert.equal(controller.operate({
      type: 'set_stock_target', goods: reserve.firstOrderGoods, qty: 0,
    }).ok, true);
    observe();
  }
  assert.equal(controller.operate({
    type: 'set_stock_target', goods: reserve.goods, qty: SEASONAL_RESERVE_TARGET,
  }).ok, true);
  observe();
  observe();
  assert.equal(director.readState().completedGoals.includes('set-seasonal-stock-target'), true);
  assert.equal(controller.readModel().stockTargets[reserve.goods], SEASONAL_RESERVE_TARGET);
  if (reserve.firstOrderGoods !== reserve.goods) {
    assert.equal(controller.readModel().stockTargets[reserve.firstOrderGoods], 0);
  }
  const targetLetter = director.letters().find(letter => letter.id === 'seasonal-stock-target-set');
  assert.equal(targetLetter.facts.target, SEASONAL_RESERVE_TARGET);
  assert.match(targetLetter.body, /目標を書いただけでは品は増えません/);
  const closing = director.letters().find(letter => letter.id === 'chapter-three-close');
  assert.ok(closing);
  assert.equal(director.readState().completedGoals.includes('close-third-chapter'), true);
  tutorialThroughPlay.seasonalGoods = reserve.goods;
  tutorialThroughPlay.thirdChapter = {
    model: controller.readModel(),
    journal: controller.inputJournal(),
  };
});

test('チュートリアル段17: 備蓄の入庫は確認するが、次の在庫谷を教程の必達条件にしない', () => {
  const { director, observe } = tutorialThroughPlay;
  observe();
  const filled = director.letters().find(letter => letter.id === 'seasonal-reserve-filled');
  if (filled) {
    assert.ok(filled.facts.stock > 0);
    assert.ok(filled.facts.averageCost > 0);
  }
  assert.equal(director.readState().completedGoals.includes('close-third-chapter'), true);
  assert.equal(director.isComplete(), false);
  assert.equal(director.currentObjective().id, 'place-conversion-workshops');
});

test('チュートリアル段18〜19実測: 3シードで黒字注文と3件比較の代替経路が成立する', () => {
  const rows = [];
  for (const seed of [11, 13, 14]) {
    const fixture = tutorialThroughPlay.thirdChapter;
    const replay = replayTutorialJournal(fixture.journal, fixture.model.tick, seed);
    const offers = [];
    const seen = new Set();
    const deadline = replay.readModel().day + PROFITABLE_ORDER_OBSERVATION_DAYS;
    while (replay.readModel().day < deadline) {
      replay.advanceTicks(30);
      const model = replay.readModel();
      const offer = model.orderOffer;
      if (!offer) continue;
      const key = `${offer.g}:${offer.qty}:${offer.due}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const quote = orderQuote(model);
      offers.push({
        day: model.day, goods: offer.g, qty: offer.qty, due: offer.due,
        settlement: quote.settlementPrice,
        unitCost: quote.marketUnitCost,
        available: quote.marketAvailable,
        profitable: quote.profitable,
      });
      const hasProfitable = offers.some(row => row.profitable);
      const hasUnsafe = offers.some(row => !row.profitable);
      if ((hasProfitable && hasUnsafe)
        || offers.length >= ORDER_JUDGMENT_FALLBACK_OFFERS) break;
    }
    assert.ok(offers.length > 0, `seed${seed}で注文を観測できる`);
    rows.push({ seed, offers });
  }
  assert.ok(rows.some(row => row.offers.some(offer => offer.profitable)),
    '春開始後も3シードのいずれかで黒字見込み注文を観測できる');
  assert.ok(rows.some(row => row.offers.some(offer => !offer.profitable)
    || row.offers.length >= ORDER_JUDGMENT_FALLBACK_OFFERS),
  `春開始後も危険注文または${ORDER_JUDGMENT_FALLBACK_OFFERS}件比較の代替経路を観測できる`);
  console.log(`  段18〜19注文実測 ${rows.map(row => `seed${row.seed}: ${row.offers.map(offer => `${offer.goods}@d${offer.day} ${Number.isFinite(offer.unitCost) ? `全量原価${offer.unitCost.toFixed(3)}` : `調達${offer.available.toFixed(1)}/${offer.qty}荷`} / 決済${offer.settlement.toFixed(3)} ${offer.profitable ? '黒字' : '見送り候補'}`).join(', ')}`).join(' | ')}`);
});

test('チュートリアル段18: 最安の一荷ではなく注文全量の加重原価で採算を決める', () => {
  const model = {
    day: 100,
    orderOffer: { g: 'tools', qty: 5, due: 190, price: 2.8 },
    marketLowest: { tools: 1 },
    companyStock: { tools: 0 },
    companyStockAverageCosts: { tools: 0 },
    stalls: [
      { goods: 'tools', qty: 1, price: 1 },
      { goods: 'tools', qty: 4, price: 5 },
    ],
  };
  const quote = orderQuote(model);
  assert.equal(quote.marketLowest, 1);
  assert.equal(quote.marketAvailable, 5);
  assert.equal(quote.marketUnitCost, 4.2);
  assert.equal(quote.settlementPrice, 3.5);
  assert.equal(quote.profitable, false, '最安値だけが安い全量赤字注文を受けない');
});

test('チュートリアル段18: 実決済と注文全量の加重原価を並べ、黒字注文を受諾・完遂する', () => {
  const { controller, director, observe } = tutorialThroughPlay;
  const assessmentDeadline = controller.readModel().day + PROFITABLE_ORDER_OBSERVATION_DAYS;
  while (!director.readState().completedGoals.includes('assess-profitable-order')
    && controller.readModel().day < assessmentDeadline) {
    controller.advanceTicks(30);
    observe();
  }
  assert.equal(director.readState().completedGoals.includes('assess-profitable-order'), true);
  observe();
  const assessment = director.letters().find(letter => letter.id === 'profitable-order-assessment');
  assert.ok(assessment);
  assert.ok(assessment.facts.marketUnitCost < assessment.facts.settlementPrice);
  assert.ok(assessment.facts.quotedMargin > 0);
  assert.match(assessment.body, /一荷あたりの支払と.*加重仕入原価を比べました/);
  assert.match(assessment.body, /受諾してください/);
  assert.equal(director.currentObjective().id, 'place-conversion-workshops');

  const accepted = controller.operate({ type: 'accept_order' });
  assert.equal(accepted.ok, true);
  observe();
  observe();
  assert.equal(director.readState().completedGoals.includes('accept-profitable-order'), true);
  const acceptedLetter = director.letters().find(letter => letter.id === 'profitable-order-accepted');
  assert.ok(acceptedLetter);

  assert.equal(controller.operate({
    type: 'set_stock_target', goods: assessment.facts.goods, qty: assessment.facts.qty,
  }).ok, true);
  observe();
  assert.equal(director.readState().completedGoals.includes('target-profitable-order'), true);

  // 期限までに港へ全量到着した荷は、翌日の船積み完了まで契約が有効。
  const completionDeadline = (assessment.facts.due + 2) * 30;
  while (!director.readState().completedGoals.includes('complete-profitable-order')
    && controller.readModel().tick < completionDeadline) {
    controller.advanceTicks(1);
    observe();
  }
  const completionModel = controller.readModel();
  assert.equal(director.readState().completedGoals.includes('complete-profitable-order'), true,
    `注文期限までに黒字で完遂する ${JSON.stringify({ assessment: assessment.facts, day: completionModel.day, activeOrder: completionModel.activeOrder, stock: completionModel.companyStock[assessment.facts.goods], marketStock: completionModel.companyMarketStock[assessment.facts.goods], portCalls: completionModel.portCalls.filter(call => ['docked', 'waiting'].includes(call.status)), flow: completionModel.flowEma[assessment.facts.goods] })}`);
  observe();
  const completed = director.letters().find(letter => letter.id === 'profitable-order-complete');
  assert.ok(completed);
  assert.ok(completed.facts.revenue > 0);
  assert.ok(completed.facts.orderCost >= 0);
  assert.ok(completed.facts.realizedMargin > 0);
  assert.match(completed.body, new RegExp(`粗利は${toDenari(completed.facts.realizedMargin).toFixed(1)}デナリ`));
  tutorialThroughPlay.profitableOrder = completed.facts;
});

test('チュートリアル段19: 注文を受けずに見送り、実失効イベントで第四章を締める', () => {
  const { controller, director, observe } = tutorialThroughPlay;
  const selectionDeadline = controller.readModel().day + SKIPPABLE_ORDER_OBSERVATION_DAYS;
  while (!director.readState().completedGoals.includes('observe-skippable-order')
    && controller.readModel().day < selectionDeadline) {
    controller.advanceTicks(30);
    observe();
  }
  assert.equal(director.readState().completedGoals.includes('observe-skippable-order'), true);
  observe();
  const advice = director.letters().find(letter => letter.id === 'skippable-order-assessment');
  assert.ok(advice);
  const selected = advice.facts.selected;
  assert.ok(['loss', 'insufficient_supply', 'comparison_fallback'].includes(selected.reason));
  assert.match(advice.body, /受諾せず、期限まで待ってください/);
  assert.equal(controller.readModel().activeOrder, null, '見送りは受諾操作を行わない');
  const journalBeforeWait = controller.inputJournal();

  const expiryDeadline = selected.due + 2;
  while (!director.readState().completedGoals.includes('let-skippable-order-expire')
    && controller.readModel().day <= expiryDeadline) {
    controller.advanceTicks(30);
    observe();
  }
  assert.equal(director.readState().completedGoals.includes('let-skippable-order-expire'), true);
  assert.deepEqual(controller.inputJournal(), journalBeforeWait,
    '見送りと期限切れはエンジン操作を追加しない');
  observe();
  const closing = director.letters().find(letter => letter.id === 'chapter-four-close');
  assert.ok(closing);
  assert.equal(closing.title, '受ける判断と見送る判断');
  assert.match(closing.body, /ご報告だけです/);
  assert.match(
    director.readState().goalResults['let-skippable-order-expire'].evidence.expired.message,
    /未受諾の注文状が失効/,
  );
  assert.equal(director.readState().completedGoals.includes('close-fourth-chapter'), true);
  assert.equal(director.isComplete(), false);
  assert.equal(director.currentObjective().id, 'place-conversion-workshops');

  const finalModel = controller.readModel();
  const journal = controller.inputJournal();
  const replay = replayTutorialJournal(journal, finalModel.tick);
  assert.deepEqual(replay.readModel(), finalModel, '第四章完走後も公開journalから同じ世界を再生できる');
  assert.deepEqual(replay.inputJournal(), journal);
  tutorialThroughPlay.fourthChapter = { model: finalModel, journal };
  const profit = tutorialThroughPlay.profitableOrder;
  const expiry = director.readState().goalResults['let-skippable-order-expire'].evidence.expired;
  console.log(`  段18〜19実測 ${profit.goods}${profit.qty}荷:全量見積${profit.quote.marketUnitCost.toFixed(3)}`
    + `→決済${profit.quote.settlementPrice.toFixed(3)} / 売上${profit.revenue.toFixed(3)}`
    + `-原価${profit.orderCost.toFixed(3)}=粗利${profit.realizedMargin.toFixed(3)}`
    + ` / 見送り${selected.goods}${selected.qty}荷 ${selected.reason}→day${expiry.day}失効`);
});

function findPreviewNear(model, job, origin, maxRadius = 20) {
  let best = null;
  for (let y = Math.max(0, origin.y - maxRadius); y <= Math.min(model.height - 1, origin.y + maxRadius); y += 1) {
    for (let x = Math.max(0, origin.x - maxRadius); x <= Math.min(model.width - 1, origin.x + maxRadius); x += 1) {
      const preview = previewBuildingPlacement(model, job, { x, y });
      if (!preview.ok) continue;
      const distance = Math.hypot(preview.entrance.x - origin.x, preview.entrance.y - origin.y);
      if (!best || distance < best.distance) best = { preview, distance };
    }
  }
  return best?.preview ?? null;
}

function findReachablePreviewNear(model, job, origin, maxRadius = 20) {
  let best = null;
  for (let y = Math.max(0, origin.y - maxRadius); y <= Math.min(model.height - 1, origin.y + maxRadius); y += 1) {
    for (let x = Math.max(0, origin.x - maxRadius); x <= Math.min(model.width - 1, origin.x + maxRadius); x += 1) {
      const preview = previewBuildingPlacement(model, job, { x, y });
      if (!preview.ok) continue;
      const width = Math.max(...preview.cells.map(cell => cell.x)) - preview.x + 1;
      const height = Math.max(...preview.cells.map(cell => cell.y)) - preview.y + 1;
      const projected = {
        ...model,
        buildings: [...model.buildings, {
          id: 'placement-projection', type: job,
          x: preview.x, y: preview.y, width, height,
          entrance: preview.entrance,
        }],
      };
      const distance = estimateWalkLen(projected, preview.entrance, origin);
      if (!Number.isFinite(distance) || distance > 14) continue;
      if (!best || distance < best.distance) best = { preview, distance };
    }
  }
  return best;
}

function placeMissingConversionBuildings(controller) {
  const placed = [];
  for (const job of ['woodshop', 'charburner', 'saltworks']) {
    let model = controller.readModel();
    if (model.buildings.some(building => building.type === job)) continue;
    const market = model.buildings.find(building => building.roles.includes('market'));
    const candidate = findReachablePreviewNear(model, job, market.entrance);
    assert.ok(candidate?.preview, `${job}を市場から徒歩14以内へ配置できる`);
    const preview = candidate.preview;
    const result = controller.operate({
      type: 'place_building', job,
      x: preview.entrance.x, y: preview.entrance.y,
      buildingX: preview.x, buildingY: preview.y,
    });
    assert.equal(result.ok, true, `${job}の公開配置操作が成功する`);
    placed.push({ job, buildingX: preview.x, buildingY: preview.y });
  }
  return placed;
}

function measureFifthChapterSeed(seed) {
  const fixture = tutorialThroughPlay.fourthChapter;
  const controller = replayTutorialJournal(fixture.journal, fixture.model.tick, seed);
  let model = controller.readModel();
  const startDay = model.day;
  let minimumPrice = model.marketPrices.tools;
  let minimumDay = model.day;
  let rise = null;
  while (!rise && model.day < startDay + 180) {
    controller.advanceTicks(30);
    model = controller.readModel();
    if (model.marketPrices.tools < minimumPrice) {
      minimumPrice = model.marketPrices.tools;
      minimumDay = model.day;
    }
    const delta = model.marketPrices.tools - minimumPrice;
    const ratio = model.marketPrices.tools / minimumPrice - 1;
    if (ratio >= TOOLS_PRICE_RISE_RATIO && delta >= TOOLS_PRICE_RISE_DELTA) {
      rise = {
        startDay, minimumDay, day: model.day, minimumPrice,
        currentPrice: model.marketPrices.tools, ratio, delta,
      };
    }
  }
  assert.ok(rise, `seed${seed}で180日以内に木製品相場の実上昇を観測できる`);
  placeMissingConversionBuildings(controller);
  const placementDay = controller.readModel().day;
  let sequence = controller.events(0).at(-1)?.sequence ?? 0;
  let activeSince = null;
  let signature = null;
  let chainDay = null;
  let levelUp = null;
  let noVacancy = null;
  let survived = null;
  const deadline = placementDay + 360;
  while (controller.readModel().day < deadline && (!survived || !levelUp || !chainDay)) {
    controller.advanceTicks(30);
    model = controller.readModel();
    const events = controller.events(sequence);
    if (events.length) sequence = events.at(-1).sequence;
    levelUp ??= events.find(event => event.type === 'notice'
      && /#\d+ ▲Lv\d+/.test(event.message ?? '')) ?? null;
    noVacancy ??= events.find(event => event.type === 'notice'
      && event.message?.startsWith('転職不可:')
      && /空.*建物がありません/.test(event.message)) ?? null;
    const rows = ['woodshop', 'charburner', 'saltworks'].map(job => {
      const household = model.households.find(row => row.job === job);
      return { job, householdId: household?.id ?? null, buildingId: household?.buildingId ?? null };
    });
    const active = rows.every(row => row.householdId !== null);
    const nextSignature = active ? rows.map(row => `${row.job}:${row.buildingId}`).join('|') : null;
    if (!active) {
      activeSince = null;
      signature = null;
    } else if (signature !== nextSignature) {
      activeSince = model.day;
      signature = nextSignature;
    }
    if (!chainDay && model.conversionEconomics.length === 3
      && model.conversionEconomics.every(row => row.productionEma > 0 && row.cost > 0)) {
      chainDay = model.day;
    }
    if (activeSince !== null && model.day - activeSince >= CONVERSION_SURVIVAL_DAYS) {
      survived = { startDay: activeSince, day: model.day, elapsedDays: model.day - activeSince, rows };
    }
  }
  assert.ok(chainDay, `seed${seed}で三職の実原価・生産EMAが立ち上がる`);
  assert.ok(survived, `seed${seed}で三職が連続${CONVERSION_SURVIVAL_DAYS}日存続する`);
  assert.ok(levelUp, `seed${seed}で配置後にLv上昇の実イベントが起きる`);
  return {
    seed, rise, placementDay, chainDay, survived,
    levelUp: { day: levelUp.eventDay ?? levelUp.day, message: levelUp.message },
    noVacancy: noVacancy
      ? { day: noVacancy.eventDay ?? noVacancy.day, message: noVacancy.message }
      : null,
  };
}

test('チュートリアル段20: 木製品の実相場上昇から三変換職を配置し、原料棚と実原価を実況する', () => {
  const { controller, director, observe } = tutorialThroughPlay;
  const journalBefore = controller.inputJournal().length;
  const startDay = controller.readModel().day;
  while (!director.readState().completedGoals.includes('observe-tools-price-rise')
    && controller.readModel().day < startDay + 180) {
    controller.advanceTicks(30);
    observe();
  }
  assert.equal(director.readState().completedGoals.includes('observe-tools-price-rise'), true,
    '3シード較正した180日以内に木製品相場の立ち上がりを検出する');
  observe();
  const riseLetter = director.letters().find(letter => letter.id === 'tools-price-rise');
  assert.ok(riseLetter);
  assert.ok(riseLetter.facts.ratio >= TOOLS_PRICE_RISE_RATIO);
  assert.ok(riseLetter.facts.delta >= TOOLS_PRICE_RISE_DELTA);
  assert.match(riseLetter.title, /木製品の値が上がっています/);
  assert.match(riseLetter.body, new RegExp(`${(riseLetter.facts.currentPrice * 10).toFixed(1)}デナリ`));
  assert.equal(director.currentObjective().id, 'place-conversion-workshops');

  const placed = placeMissingConversionBuildings(controller);
  assert.deepEqual(placed.map(row => row.job), ['charburner', 'saltworks'],
    '第一章の木工房を活かし、炭焼き小屋と塩田だけを新設する');
  observe();
  observe();
  assert.equal(director.readState().completedGoals.includes('place-conversion-workshops'), true);
  const placedLetter = director.letters().find(letter => letter.id === 'conversion-workshops-placed');
  assert.ok(placedLetter);
  assert.match(placedLetter.body, /原料棚/);

  const chainEvidence = director.readState().goalResults['observe-conversion-cost-chain']?.evidence;
  assert.equal(chainEvidence.rows.length, 3);
  if (director.readState().completedGoals.includes('observe-conversion-cost-chain')) {
    const chainLetter = director.letters().find(letter => letter.id === 'conversion-cost-chain');
    assert.ok(chainLetter);
    for (const row of chainEvidence.rows) {
      assert.equal(row.occupied, true, `${row.job}へ実世帯が入る`);
      assert.ok(row.economics.cost > 0, `${row.job}のengine正本実原価を表示する`);
      assert.ok(row.economics.productionEma > 0, `${row.job}の実生産EMAが立つ`);
    }
    assert.match(chainLetter.body, /原料へ払った代金は、作った品の費用に含まれます/);
    assert.doesNotMatch(chainLetter.body, /EMA/);
  }
  assert.equal(director.currentObjective().id, 'graduate-governor');
  tutorialThroughPlay.fifthChapterStart = {
    journalBefore,
    rise: riseLetter.facts,
    chain: chainEvidence,
  };
});

test('チュートリアル段21: 三変換職の配置で卒業し、90日存続とLv上昇は任意報告にする', () => {
  const { controller, director, observe } = tutorialThroughPlay;
  observe();
  observe();
  const closing = director.letters().find(letter => letter.id === 'chapter-five-close');
  assert.ok(closing);
  assert.equal(closing.delivery, 'letter');
  assert.equal(director.readState().completedGoals.includes('close-fifth-chapter'), true);
  assert.equal(director.isComplete(), true);
  assert.equal(director.currentObjective().id, 'graduate-governor');
  assert.equal(director.currentObjective().complete, true);
  const survival = director.readState().goalResults['sustain-conversion-workshops']?.evidence ?? null;
  const levelLetter = director.letters().find(letter => letter.id === 'household-level-up') ?? null;

  const finalModel = controller.readModel();
  const journal = controller.inputJournal();
  assert.equal(journal.length, tutorialThroughPlay.fifthChapterStart.journalBefore + 2,
    '第五章で世界を変える入力はプレイヤーの炭焼き小屋・塩田配置だけ');
  const replay = replayTutorialJournal(journal, finalModel.tick);
  assert.deepEqual(replay.readModel(), finalModel, '第五章完走後も公開journalから同じ世界を再生できる');
  assert.deepEqual(replay.inputJournal(), journal);
  tutorialThroughPlay.fifthChapter = {
    model: finalModel,
    journal,
    report: {
      seed: 11,
      rise: tutorialThroughPlay.fifthChapterStart.rise,
      survived: survival,
      levelUp: levelLetter?.facts ?? null,
    },
  };
  console.log(`  段20〜21実測 seed11:木製品day${tutorialThroughPlay.fifthChapterStart.rise.minimumDay}`
    + ` ${(tutorialThroughPlay.fifthChapterStart.rise.minimumPrice).toFixed(3)}`
    + `→day${tutorialThroughPlay.fifthChapterStart.rise.currentDay}`
    + ` ${(tutorialThroughPlay.fifthChapterStart.rise.currentPrice).toFixed(3)}`
    + ' / 三職配置で教程卒業'
    + `${survival?.elapsedDays ? ` / 任意観測${survival.elapsedDays}日` : ''}`
    + `${levelLetter ? ` / ${levelLetter.facts.message}@day${levelLetter.facts.day}` : ''}`);
});

test('チュートリアル段22: 卒業書状へ町の実測と安定監査の参照帯を並記する', () => {
  const { controller, director, observe } = tutorialThroughPlay;
  const modelBefore = controller.readModel();
  const journalBefore = controller.inputJournal();
  observe();

  const graduation = director.letters().find(letter => letter.id === 'tutorial-graduation');
  assert.ok(graduation);
  const facts = graduation.facts;
  const foodGoods = ['fish', 'veg', 'wheat', 'pres', 'pick', 'meat'];
  assert.ok(facts.day <= modelBefore.day);
  assert.ok(facts.population > 0);
  assert.ok(facts.survivingJobCount > 0);
  assert.ok(Number.isFinite(facts.foodImportEma));
  assert.ok(Number.isFinite(facts.foodProductionEma));
  assert.ok(Number.isFinite(facts.companyIncome));
  assert.ok(Number.isFinite(facts.companyExpense));
  assert.equal(facts.companyNet, facts.companyIncome - facts.companyExpense);
  assert.ok(Number.isFinite(facts.companyMoney));
  assert.deepEqual(facts.reference.populationBand, [...E_STABLE_POPULATION_BAND]);
  assert.deepEqual(facts.reference.stableJobs, [...E_STABLE_JOBS]);
  assert.equal(facts.reference.years, E_STABLE_YEARS);
  assert.equal(facts.reference.foodImportEmaMax, FOOD_IMPORT_EMA_TARGET);
  assert.equal(facts.stableJobsRequired, E_STABLE_JOBS.length);
  assert.equal(graduation.title, 'この先は、総督の島です');
  assert.match(graduation.body, new RegExp(`いま島には${facts.population}人`));
  assert.match(graduation.body, /ご報告だけです/);
  assert.equal(director.isComplete(), true);
  assert.equal(director.readState().completedGoals.includes('graduate-governor'), true);
  assert.deepEqual(controller.readModel(), modelBefore, '卒業書状は世界を変更しない');
  assert.deepEqual(controller.inputJournal(), journalBefore, '卒業書状は入力を追加しない');

  const tutorialSave = JSON.parse(JSON.stringify(director.exportSave(journalBefore)));
  const restored = createTutorialDirector({ state: tutorialSave.tutorialState });
  assert.equal(restored.isComplete(), true);
  assert.ok(restored.letters().some(letter => letter.id === 'tutorial-graduation'));
  const letterCount = restored.letters().length;
  restored.observe(modelBefore, []);
  assert.equal(restored.letters().length, letterCount, '卒業書状は再発行されない');

  const guided = replayTutorialJournal(journalBefore, modelBefore.tick);
  const sandbox = replayTutorialJournal(journalBefore, modelBefore.tick);
  const target = (modelBefore.stockTargets.tools ?? 0) + 1;
  const operation = { type: 'set_stock_target', goods: 'tools', qty: target };
  assert.deepEqual(guided.operate(operation), sandbox.operate(operation));
  restored.observe(guided.readModel(), []);
  guided.advanceTicks(30);
  sandbox.advanceTicks(30);
  restored.observe(guided.readModel(), []);
  assert.deepEqual(guided.readModel(), sandbox.readModel(),
    '卒業後もディレクターを重ねた同一島はサンドボックスと同じ規則で進む');
  assert.deepEqual(guided.inputJournal(), sandbox.inputJournal());

  tutorialThroughPlay.graduation = {
    model: modelBefore,
    journal: journalBefore,
    tutorialState: director.readState(),
    save: tutorialSave,
    facts,
  };
  console.log(`  段22卒業実測 人口${facts.population} / 存続${facts.survivingJobCount}職`
    + ` / 中核${facts.stableJobsPresent}/${facts.stableJobsRequired}`
    + ` / 食料輸入EMA ${facts.foodImportEma.toFixed(3)}`
    + ` / 会社収支 ${facts.companyNet >= 0 ? '+' : ''}${facts.companyNet.toFixed(1)}`);
});

function replayRawJournalWithDirector(fixture) {
  const guided = createEngineApi(applySpringStartCalendar(buildBlankCity(11)));
  const plain = createEngineApi(applySpringStartCalendar(buildBlankCity(11)));
  const director = createTutorialDirector();
  let tick = 0;
  let sequence = 0;
  const observe = () => {
    const events = guided.events({ afterSequence: sequence });
    if (events.length) sequence = events.at(-1).sequence;
    director.observe(snapshotToViewModel(guided.snapshot({ scope: 'full' })), events);
  };
  const advanceTo = target => {
    while (tick < target) {
      const step = Math.min(30, target - tick);
      guided.advanceTicks(step);
      plain.advanceTicks(step);
      tick += step;
      observe();
    }
  };
  observe();
  for (const row of fixture.journal) {
    advanceTo(row.tick);
    assert.deepEqual(guided.applyOperation(row.op), plain.applyOperation(row.op));
    observe();
  }
  advanceTo(fixture.model.tick);
  for (let pass = 0; pass < 3; pass += 1) observe();
  return { guided, plain, director };
}

test('チュートリアル段23: 全章通しと失敗経路でディレクター非干渉を再監査する', () => {
  const full = replayRawJournalWithDirector(tutorialThroughPlay.graduation);
  assert.deepEqual(full.guided.snapshot(), full.plain.snapshot(),
    '全章journalを通した生のengine snapshotがディレクター有無で完全一致する');
  assert.deepEqual(full.guided.inputJournal(), full.plain.inputJournal());
  assert.deepEqual(
    snapshotToViewModel(full.guided.snapshot({ scope: 'view' })),
    tutorialThroughPlay.graduation.model,
  );
  assert.equal(full.director.readState().observedTick, tutorialThroughPlay.graduation.model.tick,
    '間引いた日次観測でも全章journalの最終tickまで購読する');

  const failed = replayRawJournalWithDirector(tutorialThroughPlay.failure);
  assert.deepEqual(failed.guided.snapshot(), failed.plain.snapshot());
  assert.deepEqual(failed.guided.inputJournal(), failed.plain.inputJournal());
  assert.deepEqual(
    snapshotToViewModel(failed.guided.snapshot({ scope: 'view' })),
    tutorialThroughPlay.failure.model,
  );
  const failedState = failed.director.readState();
  assert.ok(failedState.letters.some(letter => letter.id === tutorialThroughPlay.failure.starvationId));
  assert.ok(failedState.letters.some(letter => letter.id === tutorialThroughPlay.failure.bankruptcyId));
  assert.ok(failedState.completedGoals.includes('first-road-and-logger'),
    '飢餓・破産後も道路操作で目標列を再開できる');
  const directorSource = fs.readFileSync(new URL('../src/tutorial_director.js', import.meta.url), 'utf8');
  assert.doesNotMatch(directorSource, /applyOperation|advanceTicks|\.operate\(/);
});

test('チュートリアル段24: 全章完走journalと卒業セーブを恒久smokeにする', () => {
  const chapters = [
    ['第一章', tutorialThroughPlay.firstChapter],
    ['第二章', tutorialThroughPlay.secondChapter],
    ['第三章', tutorialThroughPlay.thirdChapter],
    ['第四章', tutorialThroughPlay.fourthChapter],
    ['第五章', tutorialThroughPlay.fifthChapter],
    ['終章', tutorialThroughPlay.graduation],
  ];
  let previousTick = -1;
  let previousJournalLength = -1;
  for (const [chapter, fixture] of chapters) {
    assert.ok(fixture.model.tick >= previousTick, `${chapter}は前章と同じ世界の続きである`);
    assert.ok(fixture.journal.length >= previousJournalLength, `${chapter}のjournalは前章を包含する`);
    const replay = replayTutorialJournal(fixture.journal, fixture.model.tick);
    assert.deepEqual(replay.readModel(), fixture.model, `${chapter}完走journalの世界が完全一致する`);
    assert.deepEqual(replay.inputJournal(), fixture.journal, `${chapter}完走journal自体も同一である`);
    previousTick = fixture.model.tick;
    previousJournalLength = fixture.journal.length;
  }
  const restored = createTutorialDirector({
    state: JSON.parse(JSON.stringify(tutorialThroughPlay.graduation.save)).tutorialState,
  });
  assert.equal(restored.isComplete(), true);
  assert.equal(restored.letters().at(-1).id, 'tutorial-graduation');
  assert.equal(VERSION, 'v004.45.5-caravan-integrity');
  const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /第一章.*第二章.*第三章.*第四章.*第五章.*終章/s);
  assert.match(readme, /見本の町/);
});

test('チュートリアル段20〜21実測: 相場・原価・成長の創発観測は卒業を止めない', () => {
  const { director, fifthChapter } = tutorialThroughPlay;
  assert.equal(director.isComplete(), true);
  assert.ok(fifthChapter.report.rise.ratio >= TOOLS_PRICE_RISE_RATIO);
  assert.ok(fifthChapter.report.rise.delta >= TOOLS_PRICE_RISE_DELTA);
  const optionalIds = [
    'observe-conversion-cost-chain',
    'sustain-conversion-workshops',
    'observe-household-level-up',
  ];
  for (const id of optionalIds) {
    assert.ok(director.readState().goalResults[id], `${id}は卒業後も観測状態を保持する`);
  }
});

test('チュートリアル段21: engineが実際に出した転職不可だけへ空き建物の意味を実況する', () => {
  const world = buildBaseCity(11);
  const api = createEngineApi(world);
  api.advanceDays(60);
  const { economy, physical } = world.state;
  const owner = economy.households[0].id;
  for (const building of physical.buildings) {
    if (!building.fixed) building.ownerHouseholdId = owner;
  }
  for (const household of economy.households) {
    household.hungerHist = Array(40).fill(true);
    household.purse = 0;
    household.insolvM = 0;
    household.lastSwitch = -1;
    household.state = 'home';
    household.jobCycleDone = true;
  }
  const eventDay = world.state.day + 360;
  const eventCount = economy.events.length;
  runPopulationDynamicsPhase(economy, physical, { day: eventDay, random: () => 0 });
  const actual = economy.events.slice(eventCount)
    .find(([, message]) => message.startsWith('転職不可:') && /空.*建物がありません/.test(message));
  assert.ok(actual, '空き職建物ゼロのengineから転職不可が実発生する');
  const [day, message] = actual;
  const state = new TutorialDirector().readState();
  state.completedGoals.push('place-conversion-workshops');
  const director = new TutorialDirector({
    goals: [],
    letters: TUTORIAL_LETTERS.filter(letter => letter.id === 'no-vacancy-job-change'),
    state,
  });
  director.observe(snapshotToViewModel(api.snapshot({ scope: 'full' })), [{
    type: 'notice', eventDay: day, day, message,
  }]);
  const letter = director.letters().find(row => row.id === 'no-vacancy-job-change');
  assert.ok(letter);
  assert.equal(letter.source, 'event');
  assert.equal(letter.facts.message, message);
  assert.equal(letter.facts.vacantBuildingCount, 0);
  assert.match(letter.body, new RegExp(message));
  assert.match(letter.body, /空いている別職の建物へ移り住みます/);
});

function measureLoggerRoadRecovery(seed) {
  const controller = createEngineController({ seed, mode: 'tutorial' });
  const state = new TutorialDirector().readState();
  state.completedGoals.push('close-first-chapter');
  const director = new TutorialDirector({
    goals: TUTORIAL_GOALS.filter(goal => goal.id === 'improve-logger-route'),
    letters: TUTORIAL_LETTERS.filter(letter => (
      letter.id === 'logger-trip-warning' || letter.id === 'logger-road-recovered'
    )),
    state,
  });
  const observe = () => director.observe(controller.readModel(), []);
  let model = controller.readModel();
  observe();
  const port = model.buildings.find(building => building.roles.includes('port'));
  const marketPreview = findPreviewNear(model, 'market', port.entrance);
  assert.ok(marketPreview);
  assert.equal(controller.operate({
    type: 'place_building', job: 'market',
    x: marketPreview.entrance.x, y: marketPreview.entrance.y,
    buildingX: marketPreview.x, buildingY: marketPreview.y,
  }).ok, true);
  model = controller.readModel();
  const market = model.buildings.find(building => building.roles.includes('market'));
  if (!model.roadConnection.buildings.find(row => row.id === port.id)?.connected) {
    const portRoad = previewRoadPlacement(model, port.entrance, market.entrance);
    assert.equal(controller.operate({ type: 'add_road', start: portRoad.start, end: portRoad.end }).ok, true);
    model = controller.readModel();
    observe();
  }

  let selected = null;
  for (let y = 0; y < model.height; y += 1) {
    for (let x = 0; x < model.width; x += 1) {
      const preview = previewBuildingPlacement(model, 'logger', { x, y });
      if (!preview.ok) continue;
      const walk = estimateWalkLen(model, preview.entrance, market.entrance);
      if (!Number.isFinite(walk) || walk < 8 || walk > 13.5) continue;
      const road = previewRoadPlacement(model, preview.entrance, market.entrance);
      if (!road.ok) continue;
      const footprint = new Set(preview.cells.map(cell => `${cell.x},${cell.y}`));
      if (road.cells.some(cell => footprint.has(`${cell.x},${cell.y}`))) continue;
      if (!selected || walk > selected.walk) selected = { preview, road, walk };
    }
  }
  assert.ok(selected, `seed${seed}に道路改善可能な遠回り木こり候補がある`);
  assert.equal(controller.operate({
    type: 'place_building', job: 'logger',
    x: selected.preview.entrance.x, y: selected.preview.entrance.y,
    buildingX: selected.preview.x, buildingY: selected.preview.y,
  }).ok, true);
  observe();

  let before = null;
  const beforeLimit = controller.readModel().tick + 60 * 30;
  while (!before && controller.readModel().tick < beforeLimit) {
    controller.advanceTicks(1);
    observe();
    const household = controller.readModel().households.find(row => row.job === 'logger');
    if (household?.tookMarketTripToday && household.marketTripTicks > 0) {
      before = {
        day: controller.readModel().day,
        tripTicks: household.marketTripTicks,
        multiplier: household.marketTripEfficiency,
      };
    }
  }
  assert.ok(before, `seed${seed}で道路前の市場往復を観測できる`);
  assert.equal(director.letters().some(letter => letter.id === 'logger-trip-warning'), true);
  assert.equal(director.currentObjective().complete, false);
  model = controller.readModel();
  const logger = model.buildings.find(building => building.type === 'logger');
  const shortcut = previewRoadPlacement(model, logger.entrance, market.entrance);
  assert.equal(shortcut.ok, true);
  assert.equal(controller.operate({ type: 'add_road', start: shortcut.start, end: shortcut.end }).ok, true);
  observe();

  let after = null;
  const afterLimit = controller.readModel().tick + 45 * 30;
  while (!after && controller.readModel().tick < afterLimit) {
    controller.advanceTicks(1);
    observe();
    const household = controller.readModel().households.find(row => row.job === 'logger');
    if (controller.readModel().day > before.day && household?.tookMarketTripToday
      && household.marketTripTicks < before.tripTicks) {
      after = {
        day: controller.readModel().day,
        tripTicks: household.marketTripTicks,
        multiplier: household.marketTripEfficiency,
      };
    }
  }
  assert.ok(after, `seed${seed}で道路後の短い市場往復を観測できる`);
  return { seed, before, after, director };
}

test('開始選択: 未開拓2種・見本町・二市場縦切りを選べる', () => {
  assert.deepEqual(Object.keys(START_MODES), ['tutorial', 'sandbox', 'test', 'caravan']);
  const tutorial = createEngineController({ seed: 11, mode: 'tutorial' });
  const sandbox = createEngineController({ seed: 11, mode: 'sandbox' });
  const testCity = createEngineController({ seed: 11, mode: 'test' });
  const caravan = createEngineController({ seed: 11, mode: 'caravan' });
  assert.deepEqual(tutorial.readModel(), sandbox.readModel());
  const blank = sandbox.readModel();
  for (const [mode, controller] of [
    ['tutorial', tutorial], ['sandbox', sandbox], ['test', testCity], ['caravan', caravan],
  ]) {
    const started = controller.readModel();
    assert.equal(started.day, 0, `${mode}の経過日は0日から始まる`);
    assert.equal(started.calendarOffsetDays, SPRING_START_CALENDAR_OFFSET_DAYS);
    assert.deepEqual(
      islandCalendar(started.day, started.calendarOffsetDays),
      { year: 1, month: 3, dayOfMonth: 1, season: '春', label: '春・3月' },
      `${mode}は3月1日から始まる`,
    );
  }
  const legacy = snapshotToViewModel(createEngineApi(buildBaseCity(11)).snapshot({ scope: 'view' }));
  assert.equal(legacy.calendarOffsetDays, 0, '既存の世界は従来暦のまま復元する');
  assert.equal(islandCalendar(legacy.day, legacy.calendarOffsetDays).label, '冬・1月');
  const resumed = createEngineController({
    mode: 'test',
    stateSnapshot: testCity.saveState(),
  }).readModel();
  assert.equal(resumed.calendarOffsetDays, SPRING_START_CALENDAR_OFFSET_DAYS,
    '春開始後の保存は暦オフセットを保って再開する');
  assert.deepEqual(blank.buildings.map(building => building.type), ['port']);
  assert.equal(blank.households.length, 0);
  assert.equal(blank.roadKeys.length, 0);
  assert.deepEqual(PLACEMENT_JOBS.slice(0, 2), ['market', 'warehouse']);
  sandbox.advanceOneDay();
  assert.deepEqual(sandbox.readModel().buildings.map(building => building.type), ['port']);
  for (const type of ['market', 'warehouse']) {
    const logisticsPreview = findPreview(sandbox.readModel(), type);
    assert.ok(logisticsPreview, `未開拓島に${type}を配置できる`);
    assert.equal(sandbox.operate({
      type: 'place_building', job: type,
      x: logisticsPreview.entrance.x, y: logisticsPreview.entrance.y,
      buildingX: logisticsPreview.x, buildingY: logisticsPreview.y,
    }).ok, true);
  }
  assert.deepEqual(
    sandbox.readModel().buildings.map(building => building.type).sort(),
    ['market', 'port', 'warehouse'],
  );
  const preview = findPreview(sandbox.readModel(), 'woodshop');
  assert.ok(preview, '未開拓島にも最初の職建物を配置できる');
  assert.equal(sandbox.operate({
    type: 'place_building', job: 'woodshop',
    x: preview.entrance.x, y: preview.entrance.y,
    buildingX: preview.x, buildingY: preview.y,
  }).ok, true);
  sandbox.advanceTicks(15 * 30);
  assert.ok(sandbox.readModel().households.length > 0, '未開拓島の最初の区画へ移民が到着する');
  assert.ok(testCity.readModel().buildings.length > blank.buildings.length);
  assert.ok(testCity.readModel().zones.length > 0);
  assert.deepEqual([caravan.readModel().width, caravan.readModel().height], [96, 64]);
  assert.equal(caravan.readModel().marketNetwork.markets.length, 2);
  assert.ok(testCity.readModel().roadKeys.length > 0);
  assert.throws(() => createEngineController({ mode: 'unknown' }), /unknown start mode/);
});

test('開始選択: URLのmodeは4種だけを受理し他のqueryを保つ', () => {
  assert.equal(parseStartMode('?mode=tutorial'), 'tutorial');
  assert.equal(parseStartMode('?mode=sandbox'), 'sandbox');
  assert.equal(parseStartMode('?mode=test'), 'test');
  assert.equal(parseStartMode('?mode=caravan'), 'caravan');
  assert.equal(parseStartMode('?mode=unknown'), null);
  assert.equal(parseStartMode(''), null);
  const selected = new URL(urlForStartMode('https://example.test/game/?seed=11', 'sandbox'));
  assert.equal(selected.searchParams.get('mode'), 'sandbox');
  assert.equal(selected.searchParams.get('seed'), '11');
  for (const mode of Object.keys(START_MODES)) {
    const restarted = new URL(urlForStartMode(
      'https://example.test/game/?mode=test&resume=1&seed=11',
      mode,
    ));
    assert.equal(restarted.searchParams.get('mode'), mode);
    assert.equal(restarted.searchParams.get('resume'), null, '最初から選んだ時は保存再開指定を破棄する');
    assert.equal(restarted.searchParams.get('seed'), '11');
  }
});

test('隊商S2: 96×64の母港と漁郷が麦なしで一年自律し餓死を出さない', () => {
  const controller = createEngineController({ seed: 11, mode: 'caravan' });
  const initial = controller.saveState();
  assert.deepEqual([initial.physical.width, initial.physical.height], [96, 64]);
  assert.deepEqual(
    initial.marketNetwork.markets.map(market => [market.id, market.name]),
    [['main', '母港市場'], ['fishery', '漁郷市場']],
  );
  const fisheryAtStart = initial.economy.households.filter(
    household => household.marketId === 'fishery',
  );
  assert.deepEqual(
    fisheryAtStart.map(household => household.job).sort(),
    ['fisher', 'fisher', 'fisher', 'saltworks'],
  );
  assert.equal(initial.economy.households.filter(household => household.job === 'logger').length, 7);
  assert.equal(initial.economy.households.filter(household => household.job === 'woodshop').length, 2);
  assert.equal(initial.economy.households.filter(household => household.job === 'cartwright').length, 2);
  assert.equal(initial.economy.households.filter(household => (
    household.marketId === 'main' && household.job === 'fisher'
  )).length, 0);
  assert.equal(initial.economy.pxm?.fishery, undefined,
    '漁郷だけの恣意的な初期相場を置かない');
  assert.equal(fisheryAtStart.every(household => household.pantry.wheat === 0), true);
  const originalFisheryIds = fisheryAtStart.map(household => household.id);
  const saltworksAtStart = fisheryAtStart.find(household => household.job === 'saltworks');
  const saltworksBuildingAtStart = initial.physical.buildings.find(
    building => building.id === saltworksAtStart.buildingId,
  );
  const startingSaltworksCharcoal = saltworksBuildingAtStart.inventory.input.char;

  controller.advanceTicks(360 * 30);
  const after = controller.saveState();
  assert.equal(
    after.economy.events.some(([, message]) => (
      message.includes('餓えで亡くなった') || message.includes('離散した')
    )),
    false,
  );
  const fisheryAfter = originalFisheryIds.map(
    id => after.economy.households.find(household => household.id === id),
  );
  assert.equal(fisheryAfter.every(Boolean), true, '漁郷の種付き4世帯が一年後も残る');
  assert.equal(fisheryAfter.every(household => household.pantry.wheat === 0), true,
    '路線なしでは漁郷へ麦が現れない');
  assert.equal(fisheryAfter.filter(household => household.job === 'fisher').every(
    household => household.productionHistory.some(row => (row.goods.fish ?? 0) > 0),
  ), true);
  const saltworks = fisheryAfter.find(household => household.job === 'saltworks');
  const saltworksBuildingAfter = after.physical.buildings.find(
    building => building.id === saltworks.buildingId,
  );
  assert.ok(saltworksBuildingAfter.inventory.input.char < startingSaltworksCharcoal,
    '塩田が木炭を実消費して塩を生産する');
});

test('隊商S2: 二市場開始モードは同じ入力journalから同じ状態を再生する', () => {
  const controller = createEngineController({ seed: 11, mode: 'caravan' });
  const operation = { type: 'add_road', start: { x: 90, y: 20 }, end: { x: 91, y: 20 } };
  assert.equal(controller.operate(operation).ok, true);
  controller.advanceTicks(30 * 30);
  const expected = controller.saveState();
  const journal = controller.inputJournal();

  const replay = createEngineController({ seed: 11, mode: 'caravan' });
  let replayTick = 0;
  for (const row of journal) {
    replay.advanceTicks(row.tick - replayTick);
    replayTick = row.tick;
    assert.equal(replay.operate(row.op).ok, true);
  }
  replay.advanceTicks(expected.tick - replayTick);
  assert.deepEqual(replay.saveState(), expected);
});

test('隊商S3: 隊商宿の募集人数と給料を表示モデルから公開操作で変更できる', () => {
  const controller = createEngineController({ seed: 11, mode: 'caravan' });
  const initial = controller.readModel();
  const inn = initial.buildings.find(building => building.type === 'carter');
  const household = initial.households.find(row => row.buildingId === inn?.id);
  assert.ok(inn);
  assert.ok(household);
  assert.deepEqual(inn.caravanEmployment, { recruitment: 2, wage: 0.75 });
  assert.equal(inn.caravanCrew, 2);
  assert.deepEqual(inn.caravanRouteQuotes.map(quote => quote.marketId), ['fishery']);
  assert.equal(inn.caravanRouteQuotes[0].reachable, true);
  assert.ok(inn.caravanRouteQuotes[0].oneWayDays > 1);
  assert.equal(inn.caravanRouteQuotes[0].capacity, 16);
  assert.equal(JOB_LABELS.carter, '隊商宿');
  assert.deepEqual(BUILDING_SIZES.carter, { width: 3, height: 3 });

  assert.equal(controller.operate({
    type: 'set_caravan_employment',
    buildingId: inn.id,
    recruitment: 3,
    wage: 6.5,
  }).ok, true);
  const changed = controller.readModel().buildings.find(building => building.id === inn.id);
  assert.deepEqual(changed.caravanEmployment, { recruitment: 3, wage: 6.5 });
  assert.equal(changed.caravanCrew, 3);
  assert.deepEqual(controller.inputJournal().at(-1).op, {
    type: 'set_caravan_employment',
    buildingId: inn.id,
    recruitment: 3,
    wage: 6.5,
  });
});

test('隊商S4: 二市場開始モードの路線は実荷車で往復し表示モデルへ公開される', () => {
  const controller = createEngineController({ seed: 11, mode: 'caravan' });
  const initial = controller.saveState();
  const result = controller.operate({
    type: 'set_caravan_route',
    baseBuildingId: initial.caravanSlice.innBuildingId,
    destMarketId: initial.caravanSlice.fisheryMarketId,
    goodsOut: ['wheat'],
    goodsBack: ['fish'],
    intervalDays: 3,
  });
  assert.equal(result.ok, true, result.reason);
  let travellingCarrier = null;
  for (let tick = 0; tick < 30 * 30; tick += 1) {
    controller.advanceTicks(1);
    travellingCarrier ??= controller.readModel().carriers.find(
      carrier => carrier.caravanRouteId,
    ) ?? null;
  }
  const model = controller.readModel();
  const route = model.caravans[0];
  assert.equal(route.baseMarketId, 'main');
  assert.equal(route.destMarketId, 'fishery');
  assert.ok(route.completedTrips >= 1, JSON.stringify(route));
  assert.ok(route.recentTrips.some(trip => (
    trip.outboundTicks > 0 && trip.returnTicks > 0
  )), JSON.stringify(route.recentTrips));
  assert.ok(model.companyCarts.some(cart => cart.caravanRouteId === route.id));
  const innHousehold = model.households.find(
    household => household.buildingId === route.baseBuildingId,
  );
  assert.ok(travellingCarrier);
  assert.equal(travellingCarrier.householdId, innHousehold.id);
  assert.ok(innHousehold.memberNames.includes(travellingCarrier.peopleRows[0].name));
});

test('隊商S5: 状態語は運行・待機・御者・荷車・道路・資金の原因を区別する', () => {
  assert.deepEqual(caravanStatePresentation({ state: 'outbound' }), {
    key: 'running', label: '往路を運行中',
  });
  assert.deepEqual(caravanStatePresentation({ state: 'returning' }), {
    key: 'running', label: '帰路を運行中',
  });
  assert.equal(caravanStatePresentation({ state: 'idle' }).label, '待機中');
  assert.equal(caravanStatePresentation({ state: 'waiting_crew' }).label, '御者待ち');
  assert.equal(caravanStatePresentation({ state: 'waiting_cart' }).label, '荷車待ち');
  assert.equal(caravanStatePresentation({ state: 'waiting_road_return' }).label, '道路待ち');
  assert.equal(caravanStatePresentation({ state: 'idle', fundingShortfall: true }).label, '資金不足');
});

test('隊商S5: 月次表は実売上から仕入・固定給・荷車を引き今月と今期を同じ式で示す', () => {
  const accounting = caravanAccountingPresentation({
    monthly: {
      11: { sales: 20, procurement: 4, wages: 6, cartCosts: 2 },
      12: { sales: 30, procurement: 8, wages: 10, cartCosts: 3 },
      13: { sales: 12, procurement: 5, wages: 4, cartCosts: 1 },
    },
  }, 391);
  assert.equal(accounting.currentMonth, 13);
  assert.equal(accounting.current.profit, 2);
  assert.equal(accounting.fiscalProfit, 11);
  assert.deepEqual(accounting.rows.map(row => row.profit), [8, 9, 2]);
});

test('隊商S5: 実世界の小売売上は翌日待ちにせず月次表と便内訳へ計上する', () => {
  const controller = createEngineController({ seed: 11, mode: 'caravan' });
  const initial = controller.saveState();
  controller.operate({
    type: 'set_caravan_route',
    baseBuildingId: initial.caravanSlice.innBuildingId,
    destMarketId: initial.caravanSlice.fisheryMarketId,
    goodsOut: ['wheat'],
    goodsBack: ['fish'],
    intervalDays: 3,
  });
  controller.advanceTicks(30 * 30);
  const route = controller.readModel().caravans[0];
  assert.ok(route.accounting.current.sales > 0, JSON.stringify(route.accounting));
  assert.equal(
    route.accounting.current.profit,
    route.accounting.current.sales - route.accounting.current.procurement
      - route.accounting.current.wages - route.accounting.current.cartCosts,
  );
  assert.ok(route.recentTrips.some(trip => (trip.retailSales ?? 0) > 0));
});

test('段2: full snapshotを地形・建物・キャリア・棚の不変描画モデルへ変換する', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(30);
  const snapshot = api.snapshot({ scope: 'full' });
  const pavedRoadKey = Object.keys(snapshot.physical.roads)[0];
  snapshot.physical.pavedRoads[pavedRoadKey] = true;
  snapshot.physical.roadRevision += 1;
  snapshot.economy.households[0].workTool = {
    kind: 'iron', durability: 47.5, maxDurability: 90, acquiredDay: 10,
  };
  snapshot.economy.households[0].job = 'fisher';
  snapshot.economy.households[0].fishingRig = {
    kind: 'sail', durability: 88.5, maxDurability: 120, acquiredDay: 10,
  };
  snapshot.physical.buildings[0].condition = 30;
  snapshot.physical.buildings[0].conditionStatus = 'needs_repair';
  snapshot.physical.buildings[0].repairPlan = {
    openedDay: 1, dueDay: 31, required: { stone: 12 },
  };
  snapshot.physical.buildings[0].inventory.repair.stone = 2;
  snapshot.physical.buildings[0].caps.repair ??= {};
  snapshot.physical.buildings[0].caps.repair.stone = 20;
  const model = snapshotToViewModel(snapshot);
  assert.equal(model.terrain.length, snapshot.physical.height);
  assert.equal(model.terrain[0].length, snapshot.physical.width);
  assert.equal(model.buildings.length, snapshot.physical.buildings.length);
  assert.deepEqual(model.pavedRoadKeys, [pavedRoadKey]);
  assert.equal(model.renderScene.roadRows.find(row => row.key === pavedRoadKey).paved, true);
  assert.deepEqual(model.households[0].workTool, {
    kind: 'iron', durability: 47.5, maxDurability: 90, acquiredDay: 10,
  });
  assert.deepEqual(model.households[0].fishingRig, {
    kind: 'sail', durability: 88.5, maxDurability: 120, acquiredDay: 10,
  });
  assert.equal(
    model.carriers.filter(carrier => carrier.householdId !== undefined).length,
    snapshot.economy.households.reduce((total, household) => total + household.members.length, 0),
  );
  assert.ok(model.carriers.every(carrier => carrier.members === undefined || carrier.members === 1));
  assert.ok(model.buildings.every(building => Array.isArray(building.shelves)));
  assert.equal(model.buildings[0].condition, 30);
  assert.equal(model.buildings[0].conditionStatus, 'needs_repair');
  assert.deepEqual(model.buildings[0].repairPlan.required, { stone: 12 });
  assert.equal(
    model.buildings[0].shelves.find(row => row.section === 'repair' && row.goods === 'stone').amount,
    2,
  );
  assert.equal(Object.isFrozen(model), true);
  assert.equal(Object.isFrozen(model.terrain[0][0]), true);
  assert.equal(Object.isFrozen(model.renderScene), true);
  assert.equal(Object.isFrozen(model.renderScene.staticDrawables), true);
  assert.equal(Object.isFrozen(terrainTopologyForModel(model).naturalDrawables), true);
  assert.throws(() => { model.terrain[0][0].kind = 'coal'; }, TypeError);
});

test('市場往復: 建物シートへ2日まとめ待ちと緊急例外の実理由を渡す', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(30);
  const snapshot = api.snapshot({ scope: 'full' });
  const household = snapshot.economy.households[0];
  snapshot.economy.currentDay = 10;
  household.marketBatchWaitSinceDay = 10;
  let row = snapshotToViewModel(snapshot).households.find(({ id }) => id === household.id);
  assert.equal(row.marketRhythm.kind, 'batching');
  assert.match(row.marketRhythm.label, /1\/2日/);
  assert.match(row.marketRhythm.detail, /食料切れと生産停止は待ちません/);

  household.marketCarrier = { reason: 'food_urgent', porters: [] };
  row = snapshotToViewModel(snapshot).households.find(({ id }) => id === household.id);
  assert.equal(row.marketRhythm.kind, 'travelling');
  assert.match(row.marketRhythm.label, /食料の緊急買い出し/);
});

test('森の段階: 木の残量段階がtree描画へ流れ、段階変化で地形cache keyが変わる', () => {
  const api = createEngineApi(buildBaseCity(11));
  const snapshot = api.snapshot({ scope: 'full' });
  const first = snapshotToViewModel(snapshot);
  const trees = terrainTopologyForModel(first).naturalDrawables.filter(row => row.kind === 'tree');
  assert.ok(trees.length > 0);
  assert.ok(trees.every(row => row.data.stage === 3), '初期の森は深い森(段階3)');

  const changed = structuredClone(api.snapshot({ scope: 'full' }));
  const target = trees[0].data;
  changed.physical.terrain[target.y][target.x].wood = 1;
  changed.physical.travelRevision += 1;
  const thinned = snapshotToViewModel(changed, { previousModel: first });
  assert.notEqual(thinned.renderScene.terrainKey, first.renderScene.terrainKey,
    '段階が変われば地形cache keyが変わる');
  const thinnedTree = terrainTopologyForModel(thinned).naturalDrawables
    .find(row => row.kind === 'tree' && row.data.x === target.x && row.data.y === target.y);
  assert.equal(thinnedTree.data.stage, 1, '疎らな森(段階1)が描画資料へ届く');
});

test('描画構造最適化: snapshot更新時に静的描画場面を一度だけ編成し動的列と安定mergeする', () => {
  const api = createEngineApi(buildBaseCity(11));
  const first = snapshotToViewModel(api.snapshot({ scope: 'full' }));
  const scene = first.renderScene;
  assert.equal(scene.roadRows.length, first.roadKeys.length);
  assert.equal(scene.counts.roadTiles, first.roadKeys.length);
  const topology = terrainTopologyForModel(first);
  assert.ok(topology.naturalDrawables.length > 0);
  assert.ok(scene.staticDrawables.some(row => row.kind === 'building'));
  assert.equal(scene.staticDrawables.some(row => (
    row.kind === 'carrier' || row.kind === 'ship' || row.kind === 'handling'
  )), false);
  assert.ok(scene.staticDrawables.every((row, index, rows) => (
    index === 0 || rows[index - 1].depth <= row.depth
  )));
  const roadKeys = new Set(first.roadKeys);
  assert.ok(scene.trailRows.every(row => (
    !roadKeys.has(row.key) && Number.isFinite(row.x) && Number.isFinite(row.y)
  )));

  const dynamic = [
    { kind: 'dynamic-a', depth: scene.staticDrawables[0].depth },
    { kind: 'dynamic-b', depth: scene.staticDrawables.at(-1).depth + 1 },
  ];
  const expected = [...scene.staticDrawables, ...dynamic]
    .sort((left, right) => left.depth - right.depth);
  assert.deepEqual(mergeDrawables(scene.staticDrawables, dynamic), expected);

  const copied = snapshotToViewModel(structuredClone(api.snapshot({ scope: 'full' })));
  assert.equal(copied.renderScene.terrainKey, scene.terrainKey,
    '同じ地形ならsnapshotのcloneが変わってもcache keyを保つ');
  const sameRevision = snapshotToViewModel(api.snapshot({ scope: 'full' }), {
    previousModel: first,
  });
  assert.equal(sameRevision.terrain, first.terrain,
    '同じrevisionなら凍結済み地形を複製し直さない');
  assert.equal(sameRevision.roadConnection, first.roadConnection,
    '同じrevisionなら道路接続の探索を繰り返さない');
  assert.equal(sameRevision.renderScene.roadRows, scene.roadRows,
    '同じrevisionなら道路描画行を再編成しない');
  assert.equal(sameRevision.renderScene.roadSegments, scene.roadSegments);
  assert.equal(
    terrainTopologyForModel(sameRevision).naturalDrawables,
    topology.naturalDrawables,
    '同じrevisionなら自然物の描画資料を再走査しない');
  const viewRevision = api.snapshot({ scope: 'view' }).physical.travelRevision;
  assert.equal(
    api.snapshot({ scope: 'view', terrainAfterRevision: viewRevision }).physical.terrain,
    null,
    '表示側が同じrevisionを持つ時だけAPIの地形複製を省く',
  );
  assert.ok(Array.isArray(
    api.snapshot({ scope: 'view', terrainAfterRevision: viewRevision - 1 }).physical.terrain,
  ), 'revisionが違えばAPIは完全な地形を返す');
  const changedSnapshot = structuredClone(api.snapshot({ scope: 'full' }));
  changedSnapshot.physical.terrain[0][0].kind = (
    changedSnapshot.physical.terrain[0][0].kind === 'water' ? 'grass' : 'water'
  );
  changedSnapshot.physical.travelRevision += 1;
  const terrainChanged = snapshotToViewModel(changedSnapshot, { previousModel: first });
  assert.notEqual(terrainChanged.renderScene.terrainKey, scene.terrainKey,
    '伐採などで地形が変わればcache keyを更新する');
  assert.notEqual(terrainChanged.terrain, first.terrain);
  assert.notEqual(
    terrainTopologyForModel(terrainChanged).naturalDrawables,
    topology.naturalDrawables,
  );

  api.advanceTicks(1);
  const second = snapshotToViewModel(api.snapshot({ scope: 'full' }));
  assert.notEqual(second.renderScene, scene, '新しいsnapshotでは場面を再編成する');
  assert.equal(second.renderScene.counts.staticDrawables, second.renderScene.staticDrawables.length);

  const owner = second.buildings[0];
  const yardRow = {
    section: 'storage', goods: 'fish', amount: 1, visual: pileVisual(1, 'fish'),
  };
  const yardPoint = yardSlots(owner, [yardRow])[0];
  const transition = {
    ...interpolateWorldModel(first, second, [], 0.5),
    inventoryVisuals: [{ ...yardPoint, ownerId: owner.id }],
  };
  const renderer = Object.create(Renderer.prototype);
  const merged = renderer.collectWorldDrawables(transition);
  const buildingIndex = new Map(merged
    .map((row, index) => [row, index])
    .filter(([row]) => row.kind === 'building')
    .map(([row, index]) => [row.data.id, index]));
  const movingInventory = merged.filter(row => row.dynamic && row.kind === 'inventory');
  assert.ok(movingInventory.length > 0, '補間中の在庫を回帰対象に含める');
  for (const inventory of movingInventory) {
    const inventoryOwner = transition.buildings.find(building => building.id === inventory.data.ownerId);
    assert.ok(inventory.depth > buildingLayerDepth(inventoryOwner),
      `${inventory.data.ownerId}の在庫は補間中も建屋より手前の同じ層に置く`);
    assert.ok(merged.indexOf(inventory) > buildingIndex.get(inventory.data.ownerId),
      `${inventory.data.ownerId}の在庫はtick境界で建屋の裏へ潜らない`);
  }
});

test('可視物流AC: 家族列は実人数・実活動状態・実仕事先を描画モデルへ渡す', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(30);
  const snapshot = api.snapshot({ scope: 'full' });
  const household = snapshot.economy.households[0];
  assert.ok(household);
  household.state = 'toWork';
  household.wx = household.x + 3;
  household.wy = household.y + 2;
  household.productionMultiplier = 0.75;
  const worker = household.members[0];
  household.workCarrier = {
    memberId: worker.id,
    memberName: worker.name,
    position: { x: household.x + 1, y: household.y + 0.5 },
    path: [
      { x: household.x, y: household.y },
      { x: household.wx, y: household.wy },
    ],
  };
  const model = snapshotToViewModel(snapshot);
  const carriers = model.carriers.filter(row => row.householdId === household.id);
  assert.equal(carriers.length, household.members.length);
  assert.ok(carriers.every(carrier => carrier.members === 1 && carrier.peopleRows.length === 1));
  const travelling = carriers.find(carrier => carrier.activity === 'working-away');
  assert.equal(travelling.personId, worker.id);
  assert.deepEqual(
    { x: travelling.to.x, y: travelling.to.y },
    { x: household.wx, y: household.wy },
  );
  assert.equal(carriers.filter(carrier => carrier.activity === 'working').length,
    household.members.length - 1);
});

test('25C可視物流: 運び手ごとの経路・時差・実積み荷を個人行へそのまま渡す', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(30);
  const snapshot = api.snapshot({ scope: 'full' });
  const household = snapshot.economy.households[0];
  const [first, second] = household.members;
  household.state = 'toMarket';
  household.productionMultiplier = 0.8;
  household.marketCarrier = {
    mode: 'walk',
    porters: [
      {
        memberId: first.id,
        memberName: first.name,
        mode: 'walk',
        tier: 'backpack',
        visualMode: 'backpack',
        capacity: 4,
        position: { x: household.x + 1, y: household.y },
        path: [{ x: household.x, y: household.y }, { x: snapshot.economy.market.x, y: snapshot.economy.market.y }],
        departureDelay: 0,
        cargo: { manifest: { log: 2, tools: 1 } },
      },
      {
        memberId: second.id,
        memberName: second.name,
        mode: 'walk',
        tier: 'hand',
        visualMode: 'hand',
        capacity: 2,
        position: { x: household.x + 0.4, y: household.y },
        path: [{ x: household.x, y: household.y }, { x: snapshot.economy.market.x, y: snapshot.economy.market.y }],
        departureDelay: 0.22,
        cargo: { manifest: { wheat: 1 } },
      },
    ],
  };
  const model = snapshotToViewModel(snapshot);
  const firstRow = model.carriers.find(row => row.personId === first.id);
  const secondRow = model.carriers.find(row => row.personId === second.id);
  assert.equal(firstRow.kind, 'backpack');
  assert.deepEqual(firstRow.cargoRows, [
    { goods: 'log', amount: 2 },
    { goods: 'tools', amount: 1 },
  ]);
  assert.equal(secondRow.kind, 'walker');
  assert.deepEqual(secondRow.cargoRows, [{ goods: 'wheat', amount: 1 }]);
  assert.equal(secondRow.departureDelay, 0.22);
  assert.notDeepEqual({ x: firstRow.x, y: firstRow.y }, { x: secondRow.x, y: secondRow.y });
  assert.ok(model.carriers.filter(row => row.householdId === household.id)
    .every(row => row.peopleRows.length === 1));
  assert.ok(Math.abs(
    model.carriers.filter(row => row.householdId === household.id)
      .reduce((total, row) => total + row.productionMultiplier, 0)
      - household.productionMultiplier
  ) < 1e-9);
});

test('26A可視物流: 歩行の個体差と左右レーンを決定的に描き会社人足は固定6人に絞る', () => {
  const snapshot = structuredClone(createEngineApi(buildBaseCity(11)).snapshot({ scope: 'full' }));
  const [fromBuilding, toBuilding] = snapshot.physical.buildings.filter(row => row.entrance).slice(0, 2);
  const path = [{ x: 2, y: 2 }, { x: 12, y: 2 }];
  snapshot.physical.haulJobs = [{
    id: 'company-large-haul',
    status: 'in_transit',
    from: { buildingId: fromBuilding.id, section: 'outbound' },
    to: { buildingId: toBuilding.id, section: 'inbound' },
    goods: 'wheat',
    qty: 40,
    carrier: {
      mode: 'walk',
      companyTransport: true,
      people: 40,
      position: { x: 7, y: 2 },
      path,
      routeCost: 10,
      batchTravelCost: 10,
      batchElapsed: 5,
      porters: Array.from({ length: 40 }, (_, index) => ({
        id: `ghost${index + 1}`,
        people: 1,
        mode: 'walk',
        departureDelay: index * 0.12,
        cargo: { goods: 'wheat', qty: 1 },
      })),
    },
  }];
  const before = structuredClone(snapshot);
  const model = snapshotToViewModel(snapshot);
  const crew = model.carriers.filter(row => row.companyCrewSlot !== null
    && row.companyCrewSlot !== undefined);
  const queue = model.carriers.find(row => row.kind === 'porter_queue');
  assert.equal(crew.length, COMPANY_VISIBLE_PORTER_LIMIT);
  assert.deepEqual(
    crew.map(row => row.id),
    Array.from({ length: COMPANY_VISIBLE_PORTER_LIMIT }, (_, index) => `company-porter:${index + 1}`),
  );
  assert.equal(queue.queuedPeople, 34);
  assert.equal(queue.amount, 34);
  assert.equal(queue.selectable, false);
  assert.ok(new Set(crew.map(row => row.y.toFixed(3))).size >= 3,
    '同じ横道でも左右レーンへ散る');
  assert.ok(new Set(crew.map(row => row.visualPace.toFixed(3))).size >= 4,
    '歩速の見え方が個人ごとに異なる');
  assert.ok(crew.every(row => row.visualPace >= 0.9 && row.visualPace <= 1.1));
  assert.deepEqual(snapshot, before, '表示のばらしはengine snapshotを変えない');

  const same = walkingVisualPosition({
    id: 'person:17', seed: 11, path, position: { x: 7, y: 2 },
  });
  assert.deepEqual(
    walkingVisualPosition({ id: 'person:17', seed: 11, path, position: { x: 7, y: 2 } }),
    same,
  );
  assert.notDeepEqual(walkingVisualProfile('person:17', 11), walkingVisualProfile('person:18', 11));
});

test('UI向上段2: 世帯の財布・家族・充足・空腹と加工棚を不変モデルで公開する', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(30);
  const snapshot = api.snapshot({ scope: 'full' });
  const before = structuredClone(snapshot);
  const model = snapshotToViewModel(snapshot);
  const source = snapshot.economy.households[0];
  assert.ok(source, '入植後の実世帯を観測する');
  const household = model.households.find(row => row.id === source.id);
  assert.equal(household.familyName, source.sur);
  assert.deepEqual(household.memberNames, source.members.map(member => member.name));
  assert.equal(household.purse, source.purse);
  assert.equal(household.recentIncome, source.incomeLog.at(-1) ?? source.income30);
  assert.deepEqual(household.satisfaction, source.satLast);
  assert.equal(household.hungerDays, source.hungerHist.reduce((total, value) => total + value, 0));
  assert.equal(household.hungerWindow, source.hungerHist.length);
  assert.equal(Object.isFrozen(household.satisfaction), true);
  assert.throws(() => household.memberNames.push('改変'), TypeError);
  for (const conversion of model.conversionEconomics) {
    const building = snapshot.physical.buildings.find(row => row.id === conversion.buildingId);
    assert.equal(conversion.inputAmount, building.inventory.input[conversion.inputGoods] ?? 0);
    assert.equal(conversion.outputAmount, building.inventory.output[conversion.goods] ?? 0);
  }
  assert.deepEqual(snapshot, before, '表示変換は元snapshotを書き換えない');
});

test('段2: UIあり/なしで60tick後のエンジンJSON状態が完全一致する', () => {
  const withUi = createEngineApi(buildBaseCity(13));
  const headless = createEngineApi(buildBaseCity(13));
  for (let tick = 0; tick < 60; tick += 1) {
    snapshotToViewModel(withUi.snapshot({ scope: 'full' }));
    withUi.advanceTicks(1);
    headless.advanceTicks(1);
  }
  snapshotToViewModel(withUi.snapshot({ scope: 'full' }));
  assert.deepEqual(withUi.snapshot(), headless.snapshot());
  assert.deepEqual(withUi.inputJournal(), headless.inputJournal());
});

test('段2: engine importをbridge一か所へ隔離しrendererへAPIを渡さない', () => {
  const sources = Object.fromEntries([
    'camera.js', 'clock.js', 'config.js', 'controller.js', 'event_view.js', 'main.js',
    'placement.js', 'presentation.js', 'render_scene.js', 'renderer.js', 'start_modes.js', 'tutorial_content.js',
    'tutorial_director.js', 'ui_guidance.js', 'view_model.js',
  ].map(file => [file, fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')]));
  for (const [file, source] of Object.entries(sources)) {
    assert.doesNotMatch(source, /engine\/src/, `${file}からengineを直接importしない`);
  }
  assert.doesNotMatch(sources['renderer.js'], /snapshot|applyOperation|advanceTicks|inputJournal/);
  const bridge = fs.readFileSync(new URL('../src/engine_bridge.js', import.meta.url), 'utf8');
  assert.match(bridge, /engine\/src\/api\.js/);
  assert.match(bridge, /createEngineApi/);
});

test('段3: アイソメカメラは盤サイズを焼き付けず中心・往復変換を保つ', () => {
  for (const [width, height] of [[48, 40], [96, 80], [137, 91]]) {
    const camera = new IsometricCamera();
    camera.resize(1440, 900);
    camera.setWorldSize(width, height);
    const center = camera.project(width / 2, height / 2);
    assert.ok(Math.abs(center.x - 720) < 1e-9);
    assert.ok(Math.abs(center.y - 450) < 1e-9);
    const worldPoint = { x: width * 0.73, y: height * 0.28 };
    const projected = camera.project(worldPoint.x, worldPoint.y);
    const restored = camera.unproject(projected.x, projected.y);
    assert.ok(Math.abs(restored.x - worldPoint.x) < 1e-9);
    assert.ok(Math.abs(restored.y - worldPoint.y) < 1e-9);
  }
});

test('段3: PCドラッグとホイール、スマホのピンチに使うpan/zoomAtが焦点を保つ', () => {
  const camera = new IsometricCamera();
  camera.resize(390, 844);
  camera.setWorldSize(48, 40);
  const beforePan = { x: camera.panX, y: camera.panY };
  camera.pan(37, -19);
  assert.deepEqual({ x: camera.panX, y: camera.panY }, {
    x: beforePan.x + 37,
    y: beforePan.y - 19,
  });
  const screen = { x: 180, y: 300 };
  const beforeZoom = camera.unproject(screen.x, screen.y);
  camera.zoomAt(1.25, screen.x, screen.y);
  const afterZoom = camera.unproject(screen.x, screen.y);
  assert.ok(Math.abs(afterZoom.x - beforeZoom.x) < 1e-9);
  assert.ok(Math.abs(afterZoom.y - beforeZoom.y) < 1e-9);
  assert.ok(camera.zoom >= camera.minZoom && camera.zoom <= camera.maxZoom);
});

test('描画構造最適化: 可視world境界は画面四隅を含み盤外へはみ出さない', () => {
  const camera = new IsometricCamera();
  camera.resize(1280, 720);
  camera.setWorldSize(56, 56);
  camera.focus(28, 28);
  camera.zoomAt(1.35, 640, 360);
  const bounds = camera.visibleWorldBounds(4);
  assert.ok(bounds.minX >= 0 && bounds.maxX <= 55);
  assert.ok(bounds.minY >= 0 && bounds.maxY <= 55);
  for (const [screenX, screenY] of [[0, 0], [1280, 0], [1280, 720], [0, 720]]) {
    const point = camera.unproject(screenX, screenY);
    if (point.x >= 0 && point.x <= 55) {
      assert.ok(point.x >= bounds.minX && point.x <= bounds.maxX);
    }
    if (point.y >= 0 && point.y <= 55) {
      assert.ok(point.y >= bounds.minY && point.y <= bounds.maxY);
    }
  }
});

function runSpeedSchedule({ frameSeconds, speedPattern }) {
  const api = createEngineApi(buildBaseCity(14));
  const clock = new SimulationClock();
  const operationTicks = [30, 90];
  let operationIndex = 0;
  let tick = 0;
  let frame = 0;
  let guard = 0;
  while (tick < 150) {
    clock.setSpeed(speedPattern[frame % speedPattern.length]);
    let budget = clock.consume(frameSeconds[frame % frameSeconds.length]);
    frame += 1;
    guard += 1;
    assert.ok(guard < 20000, '速度スケジュールが進行する');
    while (budget > 0 && tick < 150) {
      const nextOperationTick = operationTicks[operationIndex] ?? 150;
      const nextStop = Math.min(nextOperationTick, 150);
      const count = Math.min(budget, nextStop - tick);
      if (count > 0) {
        api.advanceTicks(count);
        tick += count;
        budget -= count;
      }
      if (tick === nextOperationTick && operationIndex < operationTicks.length) {
        api.applyOperation({
          type: 'set_stock_target',
          goods: operationIndex === 0 ? 'wheat' : 'tools',
          qty: operationIndex === 0 ? 120 : 8,
        });
        operationIndex += 1;
      }
    }
  }
  return { snapshot: api.snapshot(), journal: api.inputJournal() };
}

test('段4: 停止を含む速度変更はstep頻度だけを変え同一journal・同一結果になる', () => {
  const first = runSpeedSchedule({
    frameSeconds: [0.08, 0.17, 0.31],
    speedPattern: [1, 2, 0, 3],
  });
  const second = runSpeedSchedule({
    frameSeconds: [0.5, 0.04, 0.23, 0.12],
    speedPattern: [3, 0, 1, 2, 2],
  });
  assert.deepEqual(first.journal, second.journal);
  assert.deepEqual(first.snapshot, second.snapshot);
});

test('段4: 時間制御は停止・通常・四倍・一日毎秒の4段階を持つ', () => {
  const clock = new SimulationClock({ speedIndex: 0 });
  assert.equal(clock.consume(10), 0);
  clock.setSpeed(1);
  assert.equal(clock.consume(0.5), 1);
  clock.setSpeed(2);
  assert.equal(clock.consume(0.5), 4);
  clock.setSpeed(3);
  assert.equal(clock.consume(1), 30);
  assert.throws(() => clock.setSpeed(4), RangeError);
});

test('段3/4: レスポンシブHUDとカメラ・速度操作のブラウザ契約を持つ', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  for (const id of ['world', 'hud', 'funds-value', 'day-value', 'top-menu', 'speed-controls', 'step-day']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(css, /html, body[\s\S]*overflow:\s*hidden/);
  assert.match(css, /touch-action:\s*none/);
  assert.match(css, /@media \(max-width: 640px\)/);
});

test('起動AA: 公開cacheで新旧moduleを混在させず、失敗時も開始画面と復旧導線を残す', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const sourceRoot = new URL('../src/', import.meta.url);
  const importPattern = /(?:from\s+|import\s*)['"](\.{1,2}\/[^'"]+\.js(?:\?[^'"]*)?)['"]/g;
  for (const filename of fs.readdirSync(sourceRoot).filter(name => name.endsWith('.js'))) {
    const source = fs.readFileSync(new URL(filename, sourceRoot), 'utf8');
    for (const match of source.matchAll(importPattern)) {
      assert.match(match[1], new RegExp(`\\?v=${VERSION.replaceAll('.', '\\.')}$`),
        `${filename}: ${match[1]} は公開build版と同じqueryを持つ`);
    }
  }
  assert.match(html, new RegExp(`style\\.css\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(html, new RegExp(`main\\.js\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(html, /id="start-screen" class="start-screen" data-testid=/,
    'JavaScript起動前から開始画面を安全殻として表示する');
  assert.match(html, /id="boot-status"[\s\S]*id="retry-boot"/);
  assert.match(html, /v002\/assets\/elena_vance\.png/);
  assert.match(html, /id="continue-tutorial-letter"[\s\S]*島を開いて時間を進める/);
  assert.match(html, /書状を読んでいる間、島の時間は止まっています/);
});

test('UI O〜R: 上部メニュー・非重複通知・自動適用在庫・時系列グラフの契約を持つ', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /エンジンの世界/);
  assert.match(html, /id="top-menu"[\s\S]*id="open-company"[\s\S]*id="open-supply"[\s\S]*id="open-island"[\s\S]*id="open-building"[\s\S]*id="open-events"/);
  for (const id of ['food-stock-chart', 'population-chart', 'finance-chart']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(main, /id="price-chart"/);
  assert.match(html, /id="tutorial-goal"/);
  assert.match(html, /id="tutorial-action"[^>]*>操作を始める/);
  assert.match(main, /setTextIfChanged\(actionButton, currentTutorialAction\?\.label/);
  assert.match(main, /data-stock-target/);
  assert.match(main, /event\.key !== 'Enter'/);
  assert.match(main, /focusout[\s\S]*applyStockTargetInput/);
  assert.doesNotMatch(main, /release_stock', goods, qty: 16/);
  assert.match(main, /data-release-qty/);
  assert.match(main, /companyStockReleaseQuotes/);
  assert.match(main, /deathNotice[\s\S]*row\.title === '餓死'[\s\S]*showToast/,
    '死亡は現在目標を奪わず、一時toastでも伝える');
  assert.match(main, /children\.length > 2/, '報告toastは同時に2件まで');
  assert.match(css, /#toast-stack[^}]*left:/);
  assert.match(css, /pointer-events:\s*none/);
});

test('段5: economy.trafficの踏圧を使用頻度5段階の獣道へ変換する', () => {
  assert.deepEqual([1, 9, 10, 49, 50, 199, 200, 799, 800].map(value => (
    trailVisual(value).stage
  )), [1, 1, 2, 2, 3, 3, 4, 4, 5]);
  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(120);
  const snapshot = api.snapshot();
  assert.equal(Object.keys(snapshot.physical.trails).length, 0, 'エンジン側の未同期trailsへ書き込まない');
  assert.ok(Object.keys(snapshot.economy.traffic).length > 100);
  const model = snapshotToViewModel(snapshot);
  assert.equal(model.trailRows.length, Object.keys(snapshot.economy.traffic).length);
  assert.ok(model.trailRows.some(row => row.stage >= 4));
});

test('段6: 全建物種をsnapshotの正位置・正サイズ・入口のまま描画モデル化する', () => {
  const snapshot = createEngineApi(buildBaseCity(11)).snapshot();
  const entries = Object.entries(ECONOMIC_BUILDINGS);
  snapshot.physical.buildings = entries.map(([type, definition], index) => ({
    id: `fixture-${type}`,
    type,
    x: 2 + (index % 5) * 8,
    y: 2 + Math.floor(index / 5) * 8,
    w: definition.w,
    h: definition.h,
    entrance: { x: 2 + (index % 5) * 8, y: 1 + Math.floor(index / 5) * 8 },
    role: type,
    roles: [type],
    ownerHouseholdId: ['market', 'warehouse', 'port'].includes(type) ? null : 100 + index,
    fixed: type === 'port',
    grade: 0,
    inventory: {
      input: {}, output: {}, storage: {}, construction: {}, inbound: {}, outbound: {}, pickup: {},
    },
    caps: {},
  }));
  snapshot.physical.occupied = {};
  snapshot.economy.households = entries
    .map(([type], index) => ({
      id: 100 + index,
      job: type,
      x: 0,
      y: 0,
      px: 0,
      py: 0,
      lv: index % 5,
      members: [],
      pantry: {},
      state: 'home',
      buildingId: `fixture-${type}`,
    }))
    .filter(household => !['market', 'warehouse', 'port'].includes(household.job));
  const model = snapshotToViewModel(snapshot);
  assert.deepEqual(new Set(model.buildings.map(building => building.type)), new Set(entries.map(([type]) => type)));
  for (const source of snapshot.physical.buildings) {
    const building = model.buildings.find(row => row.id === source.id);
    assert.deepEqual(
      { x: building.x, y: building.y, width: building.width, height: building.height, entrance: building.entrance },
      { x: source.x, y: source.y, width: source.w, height: source.h, entrance: source.entrance },
    );
  }
  assert.deepEqual(new Set(Object.keys(BUILDING_ART)), new Set(entries.map(([type]) => type)));
  const warehouse = model.buildings.find(building => building.type === 'warehouse');
  assert.equal(warehouse.vacant, false, '会社物流の倉庫を空き世帯建物として扱わない');
  assert.match(warehouse.appearance.key, /active$/);
});

test('段7: Lvイベント後の世帯文化Lvが職建物の外観キーと段階へ反映される', () => {
  const world = buildBaseCity(11);
  const api = createEngineApi(world);
  api.advanceDays(120);
  const levelEvents = api.events().filter(event => event.message?.includes('▲Lv'));
  assert.ok(levelEvents.length > 0, '実エンジンからLv上昇イベントが出る');
  const model = snapshotToViewModel(api.snapshot());
  assert.ok(model.buildings.some(building => building.cultureLevel >= 1));
  for (const event of levelEvents) {
    const householdId = Number(event.message.match(/#(\d+)/)?.[1]);
    const household = model.households.find(row => row.id === householdId);
    const building = model.buildings.find(row => row.id === household?.buildingId);
    if (building) assert.ok(building.appearance.level >= 1);
  }
  const base = buildingAppearance({ type: 'woodshop', cultureLevel: 0, vacant: false });
  const second = buildingAppearance({ type: 'woodshop', cultureLevel: 1, vacant: false });
  const third = buildingAppearance({ type: 'woodshop', cultureLevel: 2, vacant: false });
  const raised = buildingAppearance({ type: 'woodshop', cultureLevel: 3, vacant: false });
  const vacant = buildingAppearance({ type: 'woodshop', cultureLevel: 0, vacant: true });
  const fixed = buildingAppearance({
    type: 'port', cultureLevel: 0, cultureLeveled: false, vacant: false,
  });
  assert.deepEqual(
    [0, 1, 2, 3, 6].map(displayCultureLevel),
    [1, 2, 3, 4, 4],
    '内部Lvは保存互換のまま、プレイヤー表示だけをLv1〜4へ写す',
  );
  assert.equal(MAX_DISPLAY_CULTURE_LEVEL, 4);
  assert.equal(base.level, 1);
  assert.equal(base.structureVisible, false, 'Lv1は建屋でなく最小限の道具だけ');
  assert.equal(base.toolCount, 1);
  assert.equal(base.bannerCount, 1, 'Lv1から左側の旗で表示Lvを読める');
  assert.equal(second.level, 2);
  assert.equal(second.structureVisible, true, 'Lv2で小屋が立つ');
  assert.ok(second.elevation > base.elevation);
  assert.ok(third.structureScale > second.structureScale && third.toolCount > second.toolCount,
    'Lv3は小屋と道具が増える');
  assert.equal(raised.level, 4);
  assert.deepEqual([base, second, third, raised].map(row => row.bannerCount), [1, 2, 3, 4]);
  assert.ok(raised.structureScale > third.structureScale);
  assert.ok(raised.elevation > third.elevation && raised.stoneBase);
  assert.ok(raised.bannerCount > third.bannerCount, 'Lv4は大きな小屋と装飾で豪華になる');
  assert.equal(vacant.abandoned, true);
  assert.equal(vacant.structureVisible, false, '無人の職場は建屋を描かず空き地＋道具＋無札だけで示す');
  assert.equal(vacant.level, 1, '再入居時に始まる表示段階はLv1');
  assert.equal(fixed.level, null, '港など会社施設へ文化Lvを付けない');
  assert.equal(fixed.structureVisible, true);
  assert.notEqual(base.key, raised.key);
  assert.equal(buildingAppearance({ type: 'future-job', cultureLevel: 2, vacant: false }).fallback, true);

  const structures = [base, second, third, raised].map(appearance => buildingStructureLayout({
    x: 10, y: 20, width: 3, height: 3, appearance,
  }));
  assert.ok(structures.every(structure => (
    structure.x >= 10 && structure.y >= 20
    && structure.x + structure.width <= 13
    && structure.y + structure.height <= 23
  )), 'Lv外観は3×3敷地から出ない');
  assert.ok(structures[1].width < structures[2].width
    && structures[2].width < structures[3].width,
    'Lv2〜4で建屋規模が単調に増える');
});

test('生きた庭E1: 1〜20荷は実個数、21荷以上は小山・中山・大山へ変換する', () => {
  const zero = pileVisual(0, 'log');
  const fraction = pileVisual(0.55, 'fish');
  const large = pileVisual(500, 'iron');
  assert.deepEqual({ count: zero.spriteCount, label: zero.label }, { count: 0, label: '0' });
  assert.equal(fraction.spriteCount, 1);
  assert.equal(fraction.label, '0.6');
  assert.equal(large.spriteCount, MAX_PILE_SPRITES);
  assert.equal(large.clipped, true);
  assert.equal(large.label, '500');
  assert.equal(EXACT_PILE_LIMIT, 20);
  for (let amount = 1; amount <= EXACT_PILE_LIMIT; amount += 1) {
    assert.equal(pileVisual(amount, 'log').spriteCount, amount);
    assert.equal(pileVisual(amount, 'log').pileStage, 'exact');
  }
  assert.equal(pileVisual(21, 'log').pileStage, 'small');
  assert.equal(pileVisual(PILE_STAGE_LIMITS.small + 1, 'log').pileStage, 'medium');
  assert.equal(pileVisual(PILE_STAGE_LIMITS.medium + 1, 'log').pileStage, 'large');
  const amounts = [0, 0.5, 1, 2, 6, 12, 20, 21, 60, 61, 180, 181, 500, 2000];
  const counts = amounts.map(amount => pileVisual(amount, 'log').spriteCount);
  assert.ok(counts.every((count, index) => index === 0 || count >= counts[index - 1]),
    `在庫が増えた時に荷姿が減らない: ${counts.join(',')}`);
  assert.ok(pileVisual(181, 'log').footprintScale > pileVisual(61, 'log').footprintScale);
  assert.ok(pileVisual(181, 'log').heightScale > pileVisual(21, 'log').heightScale);
});

test('生きた庭E2: 役割ゾーンと空きスロットを固定し、品目消滅で他の山を動かさない', () => {
  const building = {
    id: 'yard-fixture',
    type: 'woodshop',
    x: 10,
    y: 20,
    width: 3,
    height: 3,
    entrance: { x: 11, y: 23 },
    appearance: { archetype: 'workshop', tier: 0 },
    shelfGroups: [{
      section: 'input',
      items: [
        { section: 'input', goods: 'log', visual: pileVisual(8, 'log') },
        { section: 'input', goods: 'coal', visual: pileVisual(4, 'coal') },
      ],
    }, {
      section: 'output',
      items: [
        { section: 'output', goods: 'tools', visual: pileVisual(3, 'tools') },
        { section: 'output', goods: 'iron', visual: pileVisual(2, 'iron') },
      ],
    }],
  };
  const pantry = [
    { section: 'pantry', goods: 'fish', visual: pileVisual(5, 'fish') },
    { section: 'pantry', goods: 'wheat', visual: pileVisual(6, 'wheat') },
    { section: 'pantry', goods: 'veg', visual: pileVisual(7, 'veg') },
  ];
  const rows = yardStockRows(building, pantry);
  assert.equal(rows.length, 7);
  assert.deepEqual(rows.slice(0, 2).map(row => row.goods), ['coal', 'log']);
  assert.ok(rows.some(row => row.goods === 'tools') && rows.some(row => row.goods === 'veg'),
    '代表一品へ潰さず施設棚とpantryの各品目を残す');
  const layout = yardLayout(building, rows);
  assert.equal(layout.length, 6);
  assert.deepEqual(
    layout.reduce((totals, slot) => ({ ...totals, [slot.zone]: (totals[slot.zone] ?? 0) + 1 }), {}),
    { input: 2, output: 2, storage: 2 },
  );
  const slots = yardSlots(building, rows);
  assert.ok(slots.length <= layout.length && slots.length > 0);
  assert.ok(slots.every(slot => (
    slot.x >= building.x && slot.x <= building.x + building.width
    && slot.y >= building.y && slot.y <= building.y + building.height
  )));
  const toolsSlot = slots.find(slot => slot.row.goods === 'tools');
  assert.equal(toolsSlot.zone, 'output');
  assert.equal(toolsSlot.zoneIndex, 0, '同じ職の自家生産品は製品ゾーンの定位置');
  assert.ok(slots.filter(slot => ['log', 'coal'].includes(slot.row.goods))
    .every(slot => slot.zone === 'input'));
  const withoutFish = yardLayout(building, rows.filter(row => row.goods !== 'fish'));
  const beforeByIdentity = new Map(layout.filter(slot => slot.row)
    .map(slot => [`${slot.row.section}:${slot.row.goods}`, slot]));
  const afterByIdentity = new Map(withoutFish.filter(slot => slot.row)
    .map(slot => [`${slot.row.section}:${slot.row.goods}`, slot]));
  for (const [identity, before] of beforeByIdentity) {
    if (!afterByIdentity.has(identity)) continue;
    const after = afterByIdentity.get(identity);
    assert.deepEqual([after.x, after.y], [before.x, before.y], `${identity}を動かさない`);
  }
  const sparseRows = rows.filter(row => ['log', 'tools', 'fish'].includes(row.goods));
  const sparseFish = yardLayout(building, sparseRows).find(slot => slot.row?.goods === 'fish');
  const sparseAfter = yardLayout(building, sparseRows.filter(row => row.goods !== 'fish'));
  assert.equal(
    sparseAfter.find(slot => slot.zone === sparseFish.zone
      && slot.zoneIndex === sparseFish.zoneIndex).row,
    null,
    '品目が消えた位置は別の山で詰めず裸の置き場に戻す',
  );
  const secondWorkshop = {
    ...building, id: 'yard-fixture-2', x: 30, y: 40, entrance: { x: 31, y: 43 },
  };
  const secondTools = yardSlots(secondWorkshop, rows).find(slot => slot.row.goods === 'tools');
  assert.ok(
    Math.abs((secondTools.x - secondWorkshop.x) - (toolsSlot.x - building.x)) < 1e-9
      && Math.abs((secondTools.y - secondWorkshop.y) - (toolsSlot.y - building.y)) < 1e-9,
    '同じ職の製品は敷地内の同じ相対位置',
  );
  const largeWarehouse = { ...building, type: 'warehouse', width: 4, height: 4 };
  assert.equal(yardLayout(largeWarehouse, rows).length, 8);
  assert.equal(MAX_YARD_GOODS, 10);
  const structure = buildingStructureLayout(building);
  assert.ok(structure.width <= building.width * 0.6);
  assert.ok(structure.height <= building.height * 0.6);
  assert.ok(structure.x + structure.width < building.x + building.width);
  assert.ok(structure.y + structure.height < building.y + building.height);
  assert.ok(layout.every(slot => (
    slot.x < structure.x - YARD_STRUCTURE_CLEARANCE
    || slot.x > structure.x + structure.width + YARD_STRUCTURE_CLEARANCE
    || slot.y < structure.y - YARD_STRUCTURE_CLEARANCE
    || slot.y > structure.y + structure.height + YARD_STRUCTURE_CLEARANCE
  )), '魚・丸太など全置き場は建屋の占有範囲と余白を空ける');

  const matureWorkshop = {
    ...building,
    appearance: buildingAppearance({ type: 'woodshop', cultureLevel: 3, vacant: false }),
  };
  matureWorkshop.structure = buildingStructureLayout(matureWorkshop);
  const matureLayout = yardLayout(matureWorkshop, rows);
  assert.equal(matureLayout.length, 6);
  assert.ok(matureLayout.every(slot => (
    slot.x < matureWorkshop.structure.x - YARD_STRUCTURE_CLEARANCE
    || slot.x > matureWorkshop.structure.x + matureWorkshop.structure.width + YARD_STRUCTURE_CLEARANCE
    || slot.y < matureWorkshop.structure.y - YARD_STRUCTURE_CLEARANCE
    || slot.y > matureWorkshop.structure.y + matureWorkshop.structure.height + YARD_STRUCTURE_CLEARANCE
  )), '最大Lvの建屋でも庭の荷姿を家へ重ねない');
});

test('生きた庭E3: 山段階の切替は在庫到着・搬出の補間中に同じ定位置で起きる', () => {
  const slot = amount => ({
    x: 5.25,
    y: 7.5,
    row: { section: 'output', goods: 'tools', amount, visual: pileVisual(amount, 'tools') },
  });
  const from = {
    carriers: [], portCalls: [], portBerth: null,
    buildings: [{ id: 3, yardSlots: [slot(20)] }],
  };
  const to = {
    ...from,
    buildings: [{ id: 3, yardSlots: [slot(21)] }],
  };
  const start = interpolateWorldModel(from, to, [], 0);
  const half = interpolateWorldModel(from, to, [], 0.5);
  const end = interpolateWorldModel(from, to, [], 1);
  assert.equal(start.inventoryVisuals[0].row.visual.pileStage, 'exact');
  assert.equal(half.inventoryVisuals[0].row.amount, 20.5);
  assert.equal(half.inventoryVisuals[0].row.visual.pileStage, 'small');
  assert.equal(end.inventoryVisuals[0].row.visual.pileStage, 'small');
  assert.deepEqual(
    [start.inventoryVisuals[0].x, start.inventoryVisuals[0].y],
    [end.inventoryVisuals[0].x, end.inventoryVisuals[0].y],
  );
  const camera = new IsometricCamera();
  camera.resize(800, 600);
  camera.setWorldSize(20, 20);
  camera.focus(5.25, 7.5);
  const renderer = Object.create(Renderer.prototype);
  renderer.camera = camera;
  const point = camera.project(5.25, 7.5, 5);
  assert.equal(
    renderer.hitTestInventory(to, point.x, point.y)?.row.visual.label,
    '21',
    '盤面の山へ触れると正確な数量を引ける',
  );
});

test('ラン2 P4: 飢え・離散間際・段階低下を建物外の危機信号へまとめる', () => {
  const world = buildBaseCity(11);
  const api = createEngineApi(world);
  api.advanceDays(60);
  const household = world.state.economy.households[0];
  household.hungerRun = 51;
  household.insolvM = 5;
  household.lv = Math.max(1, household.lv ?? 0);
  household.down = 55;
  const model = snapshotToViewModel(api.snapshot({ scope: 'full' }));
  const building = model.buildings.find(row => row.ownerHouseholdId === household.id);
  assert.equal(building.stateSignals.crisis.kind, 'hunger');
  assert.equal(building.stateSignals.crisis.severity, 'critical');
  assert.equal(building.stateSignals.trend, 'down');
  household.hungerRun = 0;
  household.insolvM = 0;
  household.lv = Math.max(2, household.lv ?? 0);
  household.satLast = {};
  const demotionModel = snapshotToViewModel(api.snapshot({ scope: 'full' }));
  const demotionBuilding = demotionModel.buildings.find(row => row.ownerHouseholdId === household.id);
  assert.equal(demotionBuilding.stateSignals.crisis.kind, 'demotion');
  const missingGoods = demotionBuilding.stateSignals.crisis.goods;
  assert.ok(Array.isArray(missingGoods) && missingGoods.length > 0,
    '段階低下の危機札には、何が不足かの品目を添える');
  assert.ok(missingGoods.every(goods => Boolean(GOODS_LABELS[goods])),
    '不足品は盤面スプライトを持つ品目IDへ写す');
  assert.equal(model.renderScene.crisisBuildings.some(row => row.id === building.id), true);
  const death = presentEvent({
    type: 'death', householdId: household.id, buildingId: building.id,
    familyName: household.sur, job: household.job, message: '餓えで亡くなった',
  }, model);
  assert.match(death.title, new RegExp(`${JOB_LABELS[household.job]}の${household.sur}家`));
  assert.equal(death.buildingId, building.id);
  const rendererSource = fs.readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
  const renderBody = rendererSource.match(/render\(model, elapsedSeconds = 0\) \{[\s\S]*?\n  \}\n\n  drawTerrain/)?.[0] ?? '';
  assert.ok(renderBody.indexOf('this.drawWorldObjects(model)')
    < renderBody.indexOf('this.drawWorldOverlays(model)'),
  '警告・危機アイコンは建物と人物の描画後に最前面へ描く');
  assert.match(rendererSource,
    /drawWorldOverlays\(model\) \{[\s\S]*drawConnectionWarnings\(model\)[\s\S]*drawCrisisSignals\(model\)/,
    '最前面overlayへ接続警告と危機信号をまとめる');
});

test('段8: 区分棚・pantry・市場屋台をsnapshotと同量で世帯単位に表示する', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(120);
  const snapshot = api.snapshot();
  const model = snapshotToViewModel(snapshot);
  for (const building of model.buildings) {
    const source = snapshot.physical.buildings.find(row => row.id === building.id);
    for (const shelf of building.shelves) {
      assert.equal(shelf.amount, source.inventory[shelf.section]?.[shelf.goods] ?? 0);
    }
    for (const group of building.shelfGroups) {
      assert.equal(group.totalAmount, group.items.reduce((total, item) => total + Math.max(0, item.amount), 0));
    }
  }
  for (const household of model.households) {
    const source = snapshot.economy.households.find(row => row.id === household.id);
    for (const pantry of household.pantry) assert.equal(pantry.amount, source.pantry[pantry.goods]);
  }
  const positiveHouseholdIds = new Set(model.stalls
    .filter(stall => stall.visual.amount > 1e-9)
    .map(stall => stall.householdId));
  assert.deepEqual(new Set(model.marketStalls.map(stall => stall.householdId)), positiveHouseholdIds);
  assert.ok(model.marketStalls.every(stall => stall.items.every(item => item.householdId === stall.householdId)));
  assert.ok(model.households.every(household => (
    household.pantryStock === null
    || household.pantryStock.totalAmount === household.pantry
      .filter(row => row.section === household.pantryStock.section)
      .reduce((total, row) => total + Math.max(0, row.amount), 0)
  )));
  assert.ok(model.buildings.flatMap(building => building.shelves).some(row => row.visual.spriteCount === 0));
});

test('段9: tick間とdayEnd束イベントを表示時間へ展開しキャリアをテレポートさせない', () => {
  const from = {
    carriers: [
      { id: 'haul:h1', kind: 'cart', x: 2, y: 3, path: [{ x: 2, y: 3 }, { x: 3, y: 3 }] },
      { id: 'household:7', kind: 'household', x: 5, y: 5, members: 4, path: [] },
    ],
    portCalls: [], buildings: [], portBerth: null,
  };
  const to = {
    ...from,
    carriers: [
      { ...from.carriers[0], x: 3, y: 3 },
      { ...from.carriers[1], x: 12, y: 9 },
    ],
  };
  const events = [
    { type: 'job_move', householdId: 7, x: 12, y: 9 },
    { type: 'notice', x: 12, y: 9 },
    { type: 'inheritance', householdId: 7, x: 12, y: 9 },
  ];
  // 平滑下限は速度に比例(min(0.18, base×2)・下限0.05)——高速時に表示が経済時間から遅延しないため
  assert.ok(transitionDuration(from, to, events, 0.02) >= 0.05, 'dayEnd束を最低表示時間へ展開');
  assert.ok(transitionDuration(from, to, events, 0.42) >= 0.42, '通常速度では基本時間が支配する');
  assert.equal(transitionDuration(from, to, events, 0.09), 0.18, '束の平滑下限はbase×2(上限0.18)');
  // 道路上の通常移動(1.67タイル/tick)は「飛び」扱いしない=速度設定に表示速度が追従する
  const roadFrom = { carriers: [{ id: 'household:9', x: 0, y: 0 }], portCalls: [], buildings: [], portBerth: null };
  const roadTo = { ...roadFrom, carriers: [{ id: 'household:9', x: 1.67, y: 0 }] };
  assert.equal(transitionDuration(roadFrom, roadTo, [], 0.028), 0.028, '道路移動は基本時間のまま');
  const quarter = interpolateWorldModel(from, to, events, 0.25);
  assert.deepEqual(
    quarter.carriers.map(row => [row.id, row.x, row.y]),
    [['haul:h1', 2.25, 3], ['household:7', 6.75, 6]],
  );
  const half = interpolateWorldModel(from, to, events, 0.5);
  assert.ok(Math.hypot(
    half.carriers[1].x - quarter.carriers[1].x,
    half.carriers[1].y - quarter.carriers[1].y,
  ) < Math.hypot(12 - 5, 9 - 5), '大移動を単一フレームで飛ばさない');

  const arrived = interpolateWorldModel(
    from,
    { ...from, carriers: [from.carriers[1]] },
    [{ type: 'arrival', haulJobId: 'h1', x: 3, y: 3 }],
    0.5,
  );
  assert.deepEqual(
    arrived.carriers.find(row => row.id === 'haul:h1'),
    { ...from.carriers[0], x: 2.5, y: 3 },
  );
  const lifecycleFrom = {
    carriers: [{
      id: 'haul:old', kind: 'cart', x: 6, y: 4,
      from: { x: 2, y: 4 }, to: { x: 10, y: 4 },
    }],
    portCalls: [], buildings: [], portBerth: null,
  };
  const lifecycleTo = {
    carriers: [{
      id: 'haul:new', kind: 'cart', x: 4, y: 8,
      from: { x: 1, y: 8 }, to: { x: 12, y: 8 },
    }],
    portCalls: [], buildings: [], portBerth: null,
  };
  const lifecycleStart = interpolateWorldModel(lifecycleFrom, lifecycleTo, [], 0);
  assert.deepEqual(
    lifecycleStart.carriers.find(row => row.id === 'haul:new'),
    { ...lifecycleTo.carriers[0], x: 1, y: 8 },
    'departure event欠落時も実from端点から現れる',
  );
  const lifecycleHalf = interpolateWorldModel(lifecycleFrom, lifecycleTo, [], 0.5);
  assert.deepEqual(
    { x: lifecycleHalf.carriers.find(row => row.id === 'haul:old').x,
      y: lifecycleHalf.carriers.find(row => row.id === 'haul:old').y },
    { x: 8, y: 4 },
    'arrival event欠落時も実to端点まで連続してから消える',
  );
  const presentation = new WorldPresentation(from);
  presentation.enqueue(to, events, 0.02);
  assert.equal(presentation.pendingCount, 1);
  assert.ok(presentation.advance(0.09).carriers[1].x > 5);
  assert.equal(presentation.advance(0.2).presentationProgress, 1);
});

test('ラン3 AO: 棚の最後の一荷は遷移中に連続して減り、論理確定後だけ消える', () => {
  const slot = amount => ({
    x: 5.25,
    y: 7.5,
    row: { section: 'output', goods: 'tools', amount, visual: pileVisual(amount, 'tools') },
  });
  const from = {
    carriers: [], portCalls: [], portBerth: null,
    buildings: [{ id: 3, yardSlots: [slot(1)] }],
  };
  const to = {
    ...from,
    buildings: [{ id: 3, yardSlots: [] }],
  };
  const start = interpolateWorldModel(from, to, [], 0);
  const half = interpolateWorldModel(from, to, [], 0.5);
  const end = interpolateWorldModel(from, to, [], 1);
  assert.equal(start.inventoryVisuals[0].row.amount, 1);
  assert.equal(half.inventoryVisuals[0].row.amount, 0.5);
  assert.equal(half.inventoryVisuals[0].row.visual.spriteCount > 0, true);
  assert.deepEqual(end.inventoryVisuals, []);

  const arriving = interpolateWorldModel(to, from, [], 0.5);
  assert.equal(arriving.inventoryVisuals[0].row.amount, 0.5);
  assert.deepEqual(
    { x: arriving.inventoryVisuals[0].x, y: arriving.inventoryVisuals[0].y },
    { x: 5.25, y: 7.5 },
  );

  const marketModel = qty => ({
    carriers: [], buildings: [], portCalls: [], portBerth: null,
    marketStalls: qty > 0 ? [{
      id: 'stall:7', householdId: 7, x: 4, y: 5, totalAmount: qty,
      items: [{ householdId: 7, goods: 'wheat', qty, visual: pileVisual(qty, 'wheat') }],
    }] : [],
  });
  const thinning = interpolateWorldModel(marketModel(5), marketModel(1), [], 0.5);
  assert.equal(thinning.marketStallVisuals[0].items[0].qty, 3);
  assert.equal(thinning.marketStallVisuals[0].items[0].visual.spriteCount, 3);
  assert.equal(thinning.marketStallVisuals[0].totalAmount, 3);
  assert.deepEqual(
    interpolateWorldModel(marketModel(1), marketModel(0), [], 1).marketStallVisuals,
    [],
    '市場の棚は実在庫が尽きた時だけ消える',
  );
});

test('ラン3 AO: 世帯人数ぶんの個人IDを保ち、在宅生産者を敷地内の作業場へ出す', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(30);
  const model = snapshotToViewModel(api.snapshot({ scope: 'full' }));
  const householdCarriers = model.carriers.filter(carrier => carrier.householdId !== undefined);
  assert.equal(
    householdCarriers.length,
    model.households.reduce((total, household) => total + household.members, 0),
  );
  for (const carrier of householdCarriers) {
    const household = model.households.find(row => row.id === carrier.householdId);
    assert.equal(carrier.peopleRows.length, 1);
    assert.equal(carrier.members, 1);
    assert.ok(household.memberNames.includes(carrier.peopleRows[0].name));
  }
  const working = householdCarriers.find(carrier => carrier.activity === 'working');
  assert.ok(working, '在宅生産中の世帯が作業ヤードにいる');
  const home = model.households.find(row => row.id === working.householdId);
  const building = model.buildings.find(row => row.id === home.buildingId);
  assert.ok(working.x > building.x && working.x < building.x + building.width);
  assert.ok(working.y > building.y && working.y < building.y + building.height);
  assert.notDeepEqual({ x: working.x, y: working.y }, { x: home.homeX, y: home.homeY });
});

test('段10/11: 実港便の接岸・1荷/tick・出港をsnapshotとイベント差分へ同期する', () => {
  const world = buildBaseCity(11);
  const api = createEngineApi(world);
  let previousSnapshot = api.snapshot();
  let previousModel = snapshotToViewModel(previousSnapshot);
  let sequence = api.events().at(-1)?.sequence ?? 0;
  // 自動輸入量は需給バランスで変わる。描画契約は固定4荷の小口便で検証する。
  requestCompanyImport(world.state.economy, world.state.physical, 'tools', {
    day: 1,
    qty: 4,
  });
  api.advanceTicks(1);
  let snapshot = api.snapshot();
  let model = snapshotToViewModel(snapshot);
  let events = api.events({ afterSequence: sequence });
  sequence = events.at(-1)?.sequence ?? sequence;
  assert.equal(model.portCalls.length, 1);
  assert.equal(events.some(event => event.type === 'docking'), true);
  const approaching = interpolateWorldModel(previousModel, model, events, 0.25);
  assert.equal(approaching.portVisuals[0].phase, 'approaching');
  const docked = interpolateWorldModel(previousModel, model, events, 0.9);
  assert.equal(docked.portVisuals[0].phase, 'docked');
  assert.equal(docked.handlingVisuals.length, 1, '新規便と同tickの初荷をsnapshot差分で補完');
  assert.equal(docked.handlingVisuals[0].derived, true);
  assert.equal(docked.handlingVisuals[0].qty, 1);

  let departed = null;
  let engineHandlingTicks = 0;
  for (let guard = 0; guard < 20 && !departed; guard += 1) {
    previousSnapshot = snapshot;
    previousModel = model;
    api.advanceTicks(1);
    snapshot = api.snapshot();
    model = snapshotToViewModel(snapshot);
    events = api.events({ afterSequence: sequence });
    sequence = events.at(-1)?.sequence ?? sequence;
    const previousCall = previousSnapshot.physical.portCalls[0];
    const call = snapshot.physical.portCalls[0];
    const moved = previousCall.remaining - call.remaining;
    const frame = interpolateWorldModel(previousModel, model, events, 0.5);
    const visibleMoved = frame.handlingVisuals.reduce((total, row) => total + row.qty, 0);
    assert.ok(Math.abs(visibleMoved - moved) < 1e-9, `tick ${snapshot.tick}の1荷表示`);
    if (moved > 0) {
      assert.ok(moved <= 1 + 1e-9);
      if (events.some(event => event.type === 'handling')) engineHandlingTicks += 1;
    }
    const modelCall = model.portCalls[0];
    const port = snapshot.physical.buildings.find(building => building.id === call.portBuildingId);
    assert.equal(modelCall.vesselCargo, call.vesselCargo);
    assert.equal(modelCall.yardAmount, port.inventory[modelCall.yardSection][call.goods] ?? 0);
    if (call.status === 'completed') departed = frame.portVisuals[0];
  }
  assert.ok(engineHandlingTicks > 0, '2荷目以降は公開handlingイベントを使用');
  assert.equal(departed.phase, 'departing');
  assert.ok(departed.progress > 0 && departed.progress < 1);
});

test('段12: 実キャリアは荷・出所・行き先・経路を追跡表示できるモデルを持つ', () => {
  const api = createEngineApi(buildBaseCity(11));
  let model = snapshotToViewModel(api.snapshot());
  let carrier = null;
  for (let guard = 0; guard < 1800 && !carrier; guard += 1) {
    api.advanceTicks(1);
    model = snapshotToViewModel(api.snapshot());
    carrier = model.carriers.find(row => row.haulJobId && row.goods === 'wheat');
  }
  assert.ok(carrier, '最初の港荷を運ぶキャリアが存在する');
  assert.equal(carrier.kind, 'walker', '会社が荷車を買う前は有限の運び手が担う');
  assert.ok(carrier.people >= 1);
  assert.equal(carrier.goods, 'wheat');
  assert.ok(carrier.amount > 0);
  assert.match(carrier.from.label, /港/);
  assert.match(carrier.to.label, /市場/);
  assert.ok(carrier.path.length >= 2);
  const renderer = fs.readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(renderer, /hitTestCarrier/);
  assert.match(main, /selectCarrier/);
});

test('UI向上段3: 3D建物の上面を前面順にhit testし空所は選ばない', () => {
  const model = snapshotToViewModel(createEngineApi(buildBaseCity(11)).snapshot());
  const camera = new IsometricCamera();
  camera.resize(1200, 800);
  camera.setWorldSize(model.width, model.height);
  const renderer = Object.create(Renderer.prototype);
  renderer.camera = camera;
  const building = model.buildings.find(row => row.type === 'market') ?? model.buildings[0];
  const point = camera.project(
    building.x + building.width / 2,
    building.y + building.height / 2,
    building.appearance.elevation,
  );
  assert.equal(renderer.hitTestBuilding(model, point.x, point.y)?.id, building.id);
  assert.equal(renderer.hitTestBuilding(model, -10000, -10000), null);
});

test('UI向上段3/4: 建物sheet・クリック選択・地面先行の選択強調を備える', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const renderer = fs.readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  for (const id of [
    'building-sheet', 'building-summary', 'building-household', 'building-shelves',
    'building-conversion', 'focus-selected-building',
  ]) assert.match(html, new RegExp(`id=["']${id}["']`));
  assert.match(main, /hitTestCarrier[\s\S]*hitTestBuilding[\s\S]*selectBuilding/);
  assert.match(main, /function renderBuildingSheet/);
  assert.match(main, /作業道具[\s\S]*鉄の道具[\s\S]*木の道具[\s\S]*素手/);
  assert.match(main, /帆走漁具[\s\S]*木舟と漁網[\s\S]*岸漁[\s\S]*漁の設備/);
  assert.match(main, /camera\.focus\(building\.x \+ building\.width \/ 2/);
  assert.match(renderer, /selectedBuildingId/);
  assert.match(renderer, /islandCalendar\(model\.day, model\.calendarOffsetDays\)\.season/);
  assert.match(renderer, /drawGabledRoof/);
  assert.match(renderer, /drawBuildingProps/);
  assert.match(renderer, /this\.camera\.zoom >= 1\.02/);
  assert.equal(Object.keys(BUILDING_ART).every(job => JOB_ICONS[job]), true,
    '全19職は常駐バッジで見分けられる');
  assert.match(renderer, /drawTerrain\(model\);[\s\S]*drawBuildingGrounds\(model\);[\s\S]*drawRoads\(model\);[\s\S]*drawGroundOverlays\(model\);[\s\S]*drawWorldObjects\(model\);/);
  assert.match(css, /#world\s*\{[\s\S]*cursor:\s*default/);
  assert.match(css, /#world\.map-dragging\s*\{\s*cursor:\s*grabbing/);
  assert.match(css, /#world\.tool-active\s*\{\s*cursor:\s*crosshair/);

  const api = createEngineApi(buildBaseCity(13));
  const before = api.snapshot();
  const journal = api.inputJournal();
  const selected = snapshotToViewModel(before).buildings[0];
  assert.ok(selected.id !== null, '選択対象にはsnapshot由来のIDがある');
  assert.deepEqual(api.snapshot(), before, '表示上の選択はengine stateを変えない');
  assert.deepEqual(api.inputJournal(), journal, '表示上の選択はjournalを増やさない');
});

test('季節描画: 冬は全地形・自然物・農地が雪へ変わり、春開始の実効暦へ追従する', () => {
  const farm = { appearance: { archetype: 'farm' } };
  const pasture = { appearance: { archetype: 'pasture' } };
  const workshop = { appearance: { archetype: 'workshop' } };
  assert.equal(seasonalPlotVisual(farm, '春'), null);
  assert.equal(seasonalPlotVisual(workshop, '冬'), null);
  assert.equal(seasonalPlotVisual(farm, '秋').state, 'dry');
  assert.equal(seasonalPlotVisual(pasture, '秋').state, 'dry');
  assert.equal(seasonalPlotVisual(farm, '冬').state, 'snow');
  assert.equal(seasonalPlotVisual(pasture, '冬').state, 'snow');
  assert.equal(seasonalPlotVisual(farm, '冬').furrowState, 'buried');
  assert.notDeepEqual(seasonalPlotVisual(farm, '秋').fills, seasonalPlotVisual(farm, '冬').fills);
  for (const kind of ['grass', 'sand', 'forest', 'rock', 'ore', 'coal']) {
    assert.equal(seasonalTerrainVisual(kind, '冬').state, 'snow', `${kind}も積雪する`);
    assert.equal(seasonalTerrainVisual(kind, '春'), null, `${kind}は春に元へ戻る`);
  }
  assert.equal(seasonalTerrainVisual('water', '冬'), null, '水面は凍雪色へ置換しない');
  assert.equal(seasonalNaturalVisual('tree', '冬').state, 'snow-capped');
  assert.equal(seasonalNaturalVisual('rock', '冬').state, 'snow-capped');
  assert.equal(seasonalNaturalVisual('tree', '春'), null);
  assert.equal(islandCalendar(0, SPRING_START_CALENDAR_OFFSET_DAYS).season, '春');
  assert.equal(islandCalendar(271, SPRING_START_CALENDAR_OFFSET_DAYS).season, '冬');
  assert.equal(islandCalendar(361, SPRING_START_CALENDAR_OFFSET_DAYS).season, '春');

  const rendererSource = fs.readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
  assert.match(rendererSource,
    /drawBuildingGrounds\(model\)[\s\S]*drawSeasonalPlotGround\(building\)/,
    '画面全体の色調ではなく建物区画の地面描画へ季節を適用する');
  assert.match(rendererSource,
    /drawSeasonalPlotGround\(building\)[\s\S]*this\.diamond\(x, y, fill, visual\.stroke/,
    '4×4の一枚塗りではなく農地の各タイルを描く');
  assert.match(rendererSource,
    /scene\.terrainKey, this\.season,[\s\S]*rebuildTerrainCache\(model, cacheKey\)/,
    '季節をcache keyに含め、季節境界だけ地形cacheを焼き直す');
  assert.match(rendererSource,
    /drawTerrainBase\(model\)[\s\S]*seasonalTerrainVisual\(tile\.kind, this\.season\)/,
    '毎フレームの全面overlayではなく地形cache本体へ冬色を焼く');
  assert.match(rendererSource, /furrowState === 'buried'/,
    '畑と牧草地は雪に埋もれた畝で休耕を示す');
});

test('UI向上段5: 全建物を重複なく分類し費用・寸法付き直接パレットを備える', () => {
  const categorized = BUILD_CATEGORIES.flatMap(category => category.jobs);
  assert.deepEqual([...categorized].sort(), [...PLACEMENT_JOBS].sort());
  assert.equal(new Set(categorized).size, PLACEMENT_JOBS.length);
  assert.equal(BUILD_COST_DENARI, 2500);
  assert.ok(PLACEMENT_JOBS.every(job => BUILDING_ART[job] && BUILDING_SIZES[job]));
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  for (const id of ['build-tabs', 'building-palette', 'ground-tools', 'cancel-tool']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.doesNotMatch(html, /id="building-kind"/);
  assert.doesNotMatch(main, /#building-kind/);
  assert.match(main, /let activeBuildingJob/);
  assert.match(main, /function activateBuildingJob/);
  assert.match(main, /dataset\.buildingJob/);
});

test('AH-3/4: 地中海正典の平易名へ統一し、重複する建物選択UIを残さない', () => {
  assert.deepEqual(JOB_LABELS, {
    market: '市場', warehouse: '倉庫', port: '港',
    fisher: '漁師', fisher2: '魚粉屋', logger: '木こり', woodshop: '木工房',
    cartwright: '荷車工房', charburner: '炭焼き小屋', saltworks: '塩田', quarryman: '採石場',
    carter: '隊商宿',
    miner: '鉱山', collier: '炭鉱', smelter: '製鉄所', smith: '鍛冶屋',
    wheat: '麦畑', veg: '野菜畑', shepherd: '牧場', rapeseed: '綿花畑',
  });
  assert.equal(GOODS_LABELS.tools, '木製品');
  const files = [
    '../index.html', '../README.md', '../src/config.js', '../src/main.js',
    '../src/tutorial_content.js', '../src/ui_guidance.js', '../../engine/src/econ.js',
  ];
  const playerText = files.map(path => fs.readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');
  // 「道具」は日常語として正当（AP 仕様の Lv1 記述等）。品目名の退行は上の GOODS_LABELS.tools === '木製品' が守る
  assert.doesNotMatch(playerText, /銀|口銭|蔵|菜種|漁家|菜園|麦農家|製塩所|島況/);
  assert.doesNotMatch(playerText, /道具の買上げ|道具を\d+荷|道具相場/);
  assert.match(playerText, />取引</);
  assert.match(playerText, />統計 /);
  assert.doesNotMatch(playerText, /id="building-kind"/);
});

test('UI向上段6: 教程の実目標だけが既存操作一つへ案内される', () => {
  const model = buildings => ({ buildings: buildings.map(type => ({ type })) });
  assert.deepEqual(objectiveActionFor({ id: 'first-road-and-logger', evidence: { forestRoads: 0 } }, model([])),
    { kind: 'tool', tool: 'road', label: '道を敷き始める' });
  assert.deepEqual(objectiveActionFor({ id: 'first-logger' }, model([])),
    { kind: 'building', job: 'logger', label: '木こりを選ぶ' });
  assert.equal(objectiveActionFor({ id: 'market-for-logs' }, model([])).job, 'market');
  assert.equal(objectiveActionFor({ id: 'place-island-food' }, model(['fisher'])).job, 'fisher');
  assert.equal(objectiveActionFor({ id: 'place-island-food' }, model(['fisher', 'fisher'])).job, 'veg');
  assert.equal(objectiveActionFor({ id: 'place-island-food' }, model(['fisher', 'fisher', 'veg', 'veg'])).job, 'logger');
  assert.equal(objectiveActionFor({ id: 'request-first-aid' }, model([])).sheet, 'company-sheet');
  assert.equal(objectiveActionFor({ id: 'prepare-first-tools-stock' }, model([])).sheet, 'company-sheet');
  assert.equal(objectiveActionFor({ id: 'place-conversion-workshops' }, model(['woodshop'])).job, 'charburner');
  assert.deepEqual(objectiveActionFor({ id: 'observe-tools-price-rise' }, model([])),
    { kind: 'sheet', sheet: 'supply-sheet', goods: 'tools', label: '木製品の需給を見る' });
  assert.equal(objectiveActionFor(null, model([])), null, 'サンドボックスでは政策を推測しない');
});

test('UI向上段7: 統計の現物は棚・食料庫・屋台を所在別に一度ずつ合計する', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(60);
  const snapshot = api.snapshot();
  snapshot.economy.stock.tools = 12;
  snapshot.economy.stockCost.tools = 6;
  const model = snapshotToViewModel(snapshot);
  const locationTotal = model.stockLocations.reduce((total, row) => total + row.amount, 0);
  assert.ok(Math.abs(locationTotal - model.totalVisibleStock) < 1e-9);
  assert.ok(model.stockLocations.length > 0);
  assert.ok(model.stockLocations.every(row => row.amount > 0));
  const companyTotal = Object.values(model.companyStock).reduce((total, amount) => total + amount, 0);
  const companyLocations = model.stockLocations.filter(row => row.source === 'company');
  assert.ok(Math.abs(companyLocations.reduce((total, row) => total + row.amount, 0) - companyTotal) < 1e-9);
  if (companyTotal > 0) {
    assert.ok(companyLocations.every(row => row.sourceLabel.includes('会社の倉庫')));
    assert.ok(companyLocations.every(row => row.averageCost >= 0));
    assert.equal(companyLocations.find(row => row.goods === 'tools').averageCost, 0.5);
    const warehouse = model.buildings.find(building => building.roles.includes('warehouse'));
    assert.ok(warehouse.shelfGroups.some(row => row.section === 'companyStock'));
  }
  assert.ok(['building', 'pantry', 'stall'].every(
    source => model.stockLocations.some(row => row.source === source),
  ));
  for (const goodsRow of model.goodsManifest) {
    const locations = model.stockLocations.filter(row => row.goods === goodsRow.goods);
    const total = locations.reduce((sum, row) => sum + row.amount, 0);
    assert.ok(Math.abs(total - goodsRow.totalAmount) < 1e-9, goodsRow.goods);
    assert.deepEqual(goodsRow.locations, locations);
  }
  assert.equal(Object.isFrozen(model.stockLocations), true);
  assert.equal(Object.isFrozen(model.goodsManifest[0].locations), true);
});

test('UI向上段8: 需給は需要=消費+不足を保ち、原因別の5状態で深刻順に並べる', () => {
  const makeModel = ({ supply = 2, consumed = 2, demand = 2, stock = 20, marketStock = stock } = {}) => ({
    population: 0,
    goodsManifest: [{
      goods: 'log', totalAmount: stock,
      locations: marketStock > 0 ? [{ section: 'stall', sourceLabel: '市場', amount: marketStock }]
        : stock > 0 ? [{ section: 'input', sourceLabel: '木工房', amount: stock }] : [],
    }],
    flowEma: { log: { prod: supply, imp: 0, cons: consumed, exp: 0 } },
    demandEma: {
      log: { demand, consumed: Math.min(demand, consumed), sources: {
        woodshop: { demand, consumed: Math.min(demand, consumed) },
      } },
    },
    marketPrices: { log: 3 },
  });
  const enough = supplyDemandRow(makeModel(), 'log');
  assert.equal(enough.status, 'sufficient');
  assert.equal(enough.demand, enough.consumed + enough.exported + enough.shortage);
  assert.equal(supplyDemandRow(makeModel({ supply: 1 }), 'log').status, 'inventory');
  const undelivered = supplyDemandRow(
    makeModel({ supply: 0, consumed: 0, demand: 2, stock: 10, marketStock: 0 }), 'log',
  );
  assert.equal(undelivered.status, 'undelivered');
  assert.equal(undelivered.shortage, 2);
  assert.deepEqual(undelivered.demandSources, [
    { source: 'woodshop', demand: 2, consumed: 0, shortage: 2 },
  ]);
  const lacking = supplyDemandRow(
    makeModel({ supply: 0, consumed: 0, demand: 2, stock: 0, marketStock: 0 }), 'log',
  );
  assert.equal(lacking.status, 'shortage');
  const idle = supplyDemandRow(makeModel({ supply: 0, consumed: 0, demand: 0 }), 'log');
  assert.equal(idle.status, 'no_demand');
  const rows = supplyDemandRows({
    ...makeModel(),
    goodsManifest: [
      { goods: 'log', totalAmount: 20, locations: [{ section: 'stall', amount: 20 }] },
      { goods: 'tools', totalAmount: 0, locations: [] },
    ],
    flowEma: {
      log: { prod: 2, cons: 2 }, tools: { prod: 0, cons: 0 },
    },
    demandEma: {
      log: { demand: 2, consumed: 2 }, tools: { demand: 1, consumed: 0 },
    },
  }, [], ['log', 'tools']);
  assert.deepEqual(rows.map(row => row.goods), ['tools', 'log']);
  assert.deepEqual(shortageRows(rows).map(row => row.goods), ['tools']);
  assert.deepEqual(Object.values(SUPPLY_STATUS).map(row => row.label), [
    '需要なし', '足りている', '在庫で補給中', '届いていない', '不足',
  ]);
});

test('UI向上段9: 需給を独立表示し、統計は収支と既定3グラフへ整理する', () => {
  const api = createEngineApi(buildBaseCity(13));
  api.advanceDays(30);
  const snapshot = api.snapshot();
  const model = snapshotToViewModel(snapshot);
  assert.deepEqual(model.marketPrices, snapshot.economy.px);
  assert.deepEqual(model.flowEma, snapshot.economy.f30);
  assert.deepEqual(model.demandEma, snapshot.economy.demand30);
  const summary = recentCompanySummary(model);
  const recent = model.companyLedger.filter(row => row.day >= model.day - 29);
  assert.equal(summary.income, recent.filter(row => row.amount > 0)
    .reduce((total, row) => total + row.amount, 0));
  assert.equal(summary.expense, recent.filter(row => row.amount < 0)
    .reduce((total, row) => total - row.amount, 0));
  assert.equal(summary.net, summary.income - summary.expense);
  assert.equal(DENARI_PER_MONEY_UNIT, 10);
  assert.equal(toDenari(summary.funds), model.companyMoney * 10);
  const matureDiscovery = createGoodsDiscovery({
    goodsIds: Object.keys(GOODS_LABELS), mode: 'test', model,
  });
  assert.equal(supplyDemandRows(model, [], matureDiscovery.knownGoods()).length, 18);
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const supply = fs.readFileSync(new URL('../src/supply_demand.js', import.meta.url), 'utf8');
  for (const id of ['supply-sheet', 'supply-grid', 'shortage-alerts', 'island-sheet', 'island-finance', 'open-supply', 'open-island']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.doesNotMatch(html, /id="island-manifest"|id="market-overview"|id="food-flow-chart"|id="history-goods"/);
  assert.equal((html.match(/<figure data-chart=/g) ?? []).length, 3);
  assert.match(html, /id="goods-detail-sheet"[^>]*data-testid="goods-detail-sheet"/);
  assert.match(html, /id="goods-detail-content"/);
  assert.doesNotMatch(html, /id="price-chart-panel"|data-chart="price"/);
  assert.equal((main.match(/data-detail-element=/g) ?? []).length, 6);
  assert.match(main, /openSheet\('goods-detail-sheet'\)/);
  assert.match(main, /goods-detail-back[\s\S]*openSheet\('supply-sheet'\)/);
  assert.match(supply, /right\.severity - left\.severity/);
  assert.match(main, /chart-end-label/);
  assert.match(main, /reference:\s*true/);
  assert.match(main, /GOODS_ART\[detail\.goods\]\?\.color/);
  assert.match(main, /formatNumber\(toDenari\(model\.companyMoney\)\)/);
  assert.match(main, /formatQuantity\(toDenari\(row\.amount\)\)/);
  for (const source of [html, main]) {
    assert.doesNotMatch(source, /足りず|潜在需要|未達量|ギリギリ|足りてる/);
  }
  assert.match(main, /消費 \$\{formatQuantity\(consumedTotal\)\}/);
  assert.match(main, /不足 \$\{formatQuantity\(row\.shortage\)\}/);
});

test('品目の出会い開示: 未開拓は空、見本の町は18品、保有履歴は再消費後も残る', () => {
  const goodsIds = Object.keys(GOODS_LABELS);
  const blank = createGoodsDiscovery({
    goodsIds,
    mode: 'sandbox',
    model: { day: 0, goodsManifest: [] },
  });
  assert.deepEqual(blank.knownGoods(), []);
  assert.equal(blank.currentMessage(), null);

  const first = blank.observe({
    day: 12,
    goodsManifest: [
      { goods: 'log', totalAmount: 3 },
      { goods: 'stone', totalAmount: 2 },
    ],
  });
  assert.deepEqual(first.discovered, ['log', 'stone']);
  assert.deepEqual(blank.knownGoods(), ['log', 'stone']);
  assert.equal(first.message.speech, GOODS_DISCOVERY_SCRIPTS.log);

  const sameDay = blank.observe({
    day: 12,
    goodsManifest: [
      { goods: 'log', totalAmount: 3 },
      { goods: 'stone', totalAmount: 2 },
      { goods: 'fish', totalAmount: 1 },
    ],
  });
  assert.deepEqual(sameDay.discovered, ['fish']);
  assert.deepEqual(blank.currentMessage().goods, ['log', 'fish']);
  assert.equal(
    blank.currentMessage().speech,
    `${GOODS_DISCOVERY_SCRIPTS.log}${GOODS_DISCOVERY_SCRIPTS.fish}`,
    '同日の複数品は1件のエレナ発話にまとめる',
  );
  assert.equal(blank.markAnnounced(blank.currentMessage().id), true);
  blank.observe({ day: 13, goodsManifest: [] });
  blank.observe({ day: 14, goodsManifest: [{ goods: 'log', totalAmount: 1 }] });
  assert.equal(blank.currentMessage(), null, '消費後に再保有しても再び発話しない');

  const restored = createGoodsDiscovery({
    goodsIds, mode: 'sandbox', state: blank.readState(),
  });
  assert.deepEqual(restored.knownGoods(), blank.knownGoods());
  assert.equal(restored.currentMessage(), null);
  const saveController = createEngineController({ seed: 11, mode: 'sandbox' });
  const savePayload = createSavePayload({
    gameVersion: VERSION,
    mode: 'sandbox',
    engineState: saveController.saveState(),
    inputJournal: saveController.inputJournal(),
    goodsDiscovery: restored.readState(),
  });
  assert.deepEqual(
    parseSaveText(JSON.stringify(savePayload)).goodsDiscovery,
    restored.readState(),
    '既知集合と発話済み集合を通常セーブで往復する',
  );

  const mature = createGoodsDiscovery({
    goodsIds, mode: 'test', model: { day: 0, goodsManifest: [] },
  });
  assert.deepEqual(mature.knownGoods(), goodsIds);
  assert.equal(mature.currentMessage(), null);
});

test('品目の出会い台本: 8品だけに専用文を持ち、数字・名詞・平易語で性質を示す', () => {
  assert.deepEqual(
    Object.keys(GOODS_DISCOVERY_SCRIPTS),
    ['salt', 'char', 'pres', 'pick', 'wheat', 'fish', 'log', 'tools'],
  );
  for (const speech of Object.values(GOODS_DISCOVERY_SCRIPTS)) {
    assert.match(speech, /ました。.+。$/);
    assert.doesNotMatch(speech, /細る|息づく|恵み|気配|豊か/);
  }
  const route = secretaryRouteFor({
    discovery: {
      id: 'goods-discovery-12-log',
      day: 12,
      goods: ['log'],
      speech: GOODS_DISCOVERY_SCRIPTS.log,
    },
    fallback: { priority: 'fallback', speech: '待機中です。' },
  });
  assert.equal(route.priority, 'goods-discovery');
  assert.equal(route.target.kind, 'goods-discovery');
  assert.equal(route.speech, GOODS_DISCOVERY_SCRIPTS.log);
});

test('品目詳細: 18品すべてに性質・日持ち・製法の表示契約を持つ', () => {
  const goodsIds = Object.keys(GOODS_LABELS);
  assert.deepEqual(Object.keys(GOODS_DETAIL_FACTS), goodsIds);
  assert.deepEqual(Object.keys(GOODS_RECIPES), goodsIds);
  assert.deepEqual(GOODS_SHELF_LIFE_DAYS, { fish: 3, veg: 30 });
  for (const goods of goodsIds) {
    const detail = goodsDetail(goods);
    assert.equal(detail.goods, goods);
    assert.match(detail.fact, /。$/);
    assert.equal(detail.recipe.output, goods);
    assert.ok(detail.recipe.makers.length >= 1);
    assert.equal(Object.isFrozen(detail), true);
    assert.equal(Object.isFrozen(detail.recipe), true);
  }
  for (const goods of Object.keys(GOODS_DISCOVERY_SCRIPTS)) {
    assert.equal(goodsDetail(goods).fact, GOODS_DISCOVERY_SCRIPTS[goods],
      `${goods}は出会いの一言を品目詳細へそのまま再掲する`);
  }
  assert.equal(goodsDetail('fish').shelfLifeDays, 3);
  assert.equal(goodsDetail('veg').shelfLifeDays, 30);
  assert.equal(goodsDetail('wheat').shelfLifeDays, null);
  assert.deepEqual(goodsDetail('pick').recipe.inputs, ['veg', 'salt']);
  assert.deepEqual(goodsDetail('meal').recipe.inputs, ['fish']);
  assert.deepEqual(goodsDetail('meat').recipe.alternatives, [['wheat', 'veg']]);
  assert.deepEqual(goodsDetail('pres').recipe.optional, ['char']);
  assert.deepEqual(goodsDetail('bar').recipe.alternatives, [['coal', 'char']]);
  assert.throws(() => goodsDetail('unknown'), /不明な品目/);
});

test('季節事件: 初雪と雪解けを毎年一言にし、魚と野菜の初腐敗は島史で一度にする', () => {
  const base = {
    day: 269,
    calendarOffsetDays: SPRING_START_CALENDAR_OFFSET_DAYS,
    spoilByGoods: { fish: 0, veg: 0 },
  };
  const events = createSeasonalEvents({ model: base });
  assert.equal(events.currentMessage(), null);

  events.observe({ ...base, day: 270 });
  assert.equal(events.currentMessage(), null, '11月30日には初雪を出さない');
  events.observe({ ...base, day: 271 });
  assert.equal(events.currentMessage().type, 'firstSnow');
  assert.equal(events.currentMessage().speech, SEASONAL_EVENT_SCRIPTS.firstSnow);
  events.markAnnounced(events.currentMessage().id);

  events.observe({ ...base, day: 361 });
  assert.equal(events.currentMessage().type, 'thaw');
  assert.equal(events.currentMessage().speech, SEASONAL_EVENT_SCRIPTS.thaw);
  events.markAnnounced(events.currentMessage().id);

  events.observe({ ...base, day: 631 });
  assert.equal(events.currentMessage().type, 'firstSnow',
    '翌年の初雪も同じ一言を出す');
  events.markAnnounced(events.currentMessage().id);

  events.observe({ ...base, day: 632, spoilByGoods: { fish: 0.25, veg: 0 } });
  assert.equal(events.currentMessage().type, 'fishSpoilage');
  assert.equal(events.currentMessage().speech, SEASONAL_EVENT_SCRIPTS.fishSpoilage);
  events.observe({ ...base, day: 633, spoilByGoods: { fish: 0.5, veg: 0 } });
  assert.equal(events.readState().pending.length, 1, '魚の腐敗が続いても一言を重ねない');
  events.markAnnounced(events.currentMessage().id);

  events.observe({ ...base, day: 634, spoilByGoods: { fish: 0.75, veg: 0.1 } });
  assert.equal(events.currentMessage().type, 'vegSpoilage');
  assert.equal(events.currentMessage().speech, SEASONAL_EVENT_SCRIPTS.vegSpoilage);
  events.markAnnounced(events.currentMessage().id);
  events.observe({ ...base, day: 635, spoilByGoods: { fish: 1, veg: 0.2 } });
  assert.equal(events.currentMessage(), null, '発話済みの魚と野菜は再び出さない');

  const restored = createSeasonalEvents({ state: events.readState() });
  restored.observe({ ...base, day: 636, spoilByGoods: { fish: 2, veg: 1 } });
  assert.equal(restored.currentMessage(), null, '初腐敗の発話済み状態をセーブ後も保持する');
});

test('季節事件: 春開始日の雪解けを出し、一言の器で自動既読できる', () => {
  const events = createSeasonalEvents({
    model: {
      day: 0,
      calendarOffsetDays: SPRING_START_CALENDAR_OFFSET_DAYS,
      spoilByGoods: {},
    },
  });
  const thaw = events.currentMessage();
  assert.equal(thaw.type, 'thaw');
  const route = secretaryRouteFor({
    incident: thaw,
    fallback: { priority: 'fallback', speech: '待機中です。' },
  });
  assert.equal(route.priority, 'season-event');
  assert.equal(route.target.kind, 'seasonal-event');
  assert.equal(events.markAnnounced(route.target.id), true);
  assert.equal(events.currentMessage(), null);

  for (const speech of Object.values(SEASONAL_EVENT_SCRIPTS)) {
    assert.doesNotMatch(speech, /細る|息づく|恵み|気配|豊か/);
  }
});

test('季節事件: 初腐敗と発話待ちを通常セーブで往復する', () => {
  const seasonalEvents = createSeasonalEvents({
    model: {
      day: 10,
      calendarOffsetDays: SPRING_START_CALENDAR_OFFSET_DAYS,
      spoilByGoods: { fish: 0, veg: 0 },
    },
  });
  seasonalEvents.observe({
    day: 11,
    calendarOffsetDays: SPRING_START_CALENDAR_OFFSET_DAYS,
    spoilByGoods: { fish: 0.4, veg: 0 },
  });
  const saveController = createEngineController({ seed: 11, mode: 'sandbox' });
  const payload = createSavePayload({
    gameVersion: VERSION,
    mode: 'sandbox',
    engineState: saveController.saveState(),
    inputJournal: saveController.inputJournal(),
    seasonalEvents: seasonalEvents.readState(),
  });
  assert.deepEqual(
    parseSaveText(JSON.stringify(payload)).seasonalEvents,
    seasonalEvents.readState(),
  );
  const restored = createSeasonalEvents({
    state: parseSaveText(JSON.stringify(payload)).seasonalEvents,
  });
  assert.equal(restored.currentMessage().type, 'fishSpoilage',
    '表示前に保存した初腐敗は再開後も一言として残す');
  restored.markAnnounced(restored.currentMessage().id);
  restored.observe({
    day: 12,
    calendarOffsetDays: SPRING_START_CALENDAR_OFFSET_DAYS,
    spoilByGoods: { fish: 0.8, veg: 0 },
  });
  assert.equal(restored.currentMessage(), null,
    '再開後に読み終えた初腐敗は同じ島で繰り返さない');
});

test('季節事件: 旧セーブへ履歴を足す時は過去の季節と腐敗を誤報しない', () => {
  const legacyModel = {
    day: 400,
    calendarOffsetDays: SPRING_START_CALENDAR_OFFSET_DAYS,
    spoilByGoods: { fish: 12, veg: 4 },
  };
  const events = createSeasonalEvents({
    model: legacyModel,
    suppressInitialAnnouncements: true,
  });
  assert.equal(events.currentMessage(), null);
  events.observe({
    ...legacyModel,
    day: 401,
    spoilByGoods: { fish: 12, veg: 4 },
  });
  assert.equal(events.currentMessage(), null,
    '導入前に起きた季節の節目と腐敗はロード直後に並べない');
  events.observe({
    ...legacyModel,
    day: 402,
    spoilByGoods: { fish: 12.1, veg: 4 },
  });
  assert.equal(events.currentMessage().type, 'fishSpoilage',
    '導入後に新しく増えた腐敗は旧セーブでも初回として知らせる');
});

function boundaryModel({
  day = 1,
  food = 150,
  population = 10,
  fish = 4,
  salt = 2,
  char = 2,
} = {}) {
  return {
    day,
    calendarOffsetDays: SPRING_START_CALENDAR_OFFSET_DAYS,
    population,
    households: [{
      members: Array.from({ length: population }, (_, index) => ({ id: index + 1 })),
      pantry: [{ goods: 'wheat', amount: food }],
    }],
    stalls: [],
    companyMarketStock: {},
    companyStock: {},
    flowEma: {
      wheat: { prod: 2, imp: 0.5, cons: 4 },
    },
    goodsManifest: [
      { goods: 'fish', totalAmount: fish },
      { goods: 'salt', totalAmount: salt },
      { goods: 'char', totalAmount: char },
    ],
  };
}

test('境界の声: 食料14日割れの跨ぎだけを拾い、同一境界は7日空ける', () => {
  assert.equal(FOOD_RUNWAY_THRESHOLD_DAYS, 14);
  assert.equal(FOOD_WARNING_COOLDOWN_DAYS, 7);
  const events = createBoundaryEvents({ model: boundaryModel({ day: 1, food: 150 }) });
  assert.equal(events.currentMessage(), null);
  events.observe(boundaryModel({ day: 2, food: 139 }));
  assert.equal(events.currentMessage().type, 'food');
  assert.match(events.currentMessage().speech, /14日分を下回りました。残り13日分/);
  assert.match(events.currentMessage().speech, /1日の生産と仕入は2\.5荷、消費は4\.0荷/);
  assert.match(events.currentMessage().speech, /畑や漁師を建てれば間に合います/);
  events.markAnnounced(events.currentMessage().id);

  events.observe(boundaryModel({ day: 3, food: 150 }));
  events.observe(boundaryModel({ day: 4, food: 139 }));
  assert.equal(events.currentMessage(), null, '再び跨いでも7日未満では話さない');
  events.observe(boundaryModel({ day: 10, food: 150 }));
  events.observe(boundaryModel({ day: 11, food: 139 }));
  assert.equal(events.currentMessage().type, 'food', '7日以上後の跨ぎは再び話す');
});

test('境界の声: 食料処方は3〜6月だけ建設、7〜2月は蔵出し・本土輸入に固定する', () => {
  const rows = Array.from({ length: 12 }, (_, index) => {
    const month = ((index + 2) % 12) + 1;
    const day = index * 30 + 1;
    return {
      month,
      speech: foodBoundarySpeech(boundaryModel({ day, food: 139 })),
    };
  });
  for (const { month, speech } of rows) {
    if ([3, 4, 5, 6].includes(month)) {
      assert.match(speech, /畑や漁師を建てれば間に合います/, `${month}月`);
      assert.doesNotMatch(speech, /会社の倉庫|本土から輸入/, `${month}月`);
    } else {
      assert.match(speech, /会社の倉庫から食料を出すか、本土から輸入/, `${month}月`);
      assert.doesNotMatch(speech, /畑や漁師|建て/, `${month}月`);
    }
    if ([12, 1, 2].includes(month)) {
      assert.match(speech, /冬で畑の生産が止まっています/, `${month}月`);
    }
  }
});

test('境界の声: 魚がある時の塩・木炭の正→0だけを別々の一言にする', () => {
  const events = createBoundaryEvents({ model: boundaryModel() });
  events.observe(boundaryModel({ day: 2, salt: 0 }));
  assert.equal(events.currentMessage().type, 'salt');
  assert.equal(events.currentMessage().speech, PRESERVATION_STOP_SCRIPTS.salt);
  events.markAnnounced(events.currentMessage().id);

  events.observe(boundaryModel({ day: 3, salt: 2 }));
  events.observe(boundaryModel({ day: 4, salt: 0 }));
  assert.equal(events.currentMessage().type, 'salt', '塩を補充後に再び尽きればもう一度話す');
  events.markAnnounced(events.currentMessage().id);

  events.observe(boundaryModel({ day: 5, salt: 0, char: 0 }));
  assert.equal(events.currentMessage().type, 'char');
  assert.equal(events.currentMessage().speech, PRESERVATION_STOP_SCRIPTS.char);
  events.markAnnounced(events.currentMessage().id);

  events.observe(boundaryModel({ day: 6, fish: 0, salt: 2, char: 2 }));
  events.observe(boundaryModel({ day: 7, fish: 0, salt: 0, char: 0 }));
  assert.equal(events.currentMessage(), null, '魚がない時の資材切れは保存停止として話さない');
});

test('境界の声: 待機中の声・跨ぎ基準・7日間隔を保存して再開する', () => {
  const events = createBoundaryEvents({ model: boundaryModel({ day: 1, food: 150 }) });
  events.observe(boundaryModel({ day: 2, food: 139, salt: 0 }));
  const state = events.readState();
  const saveController = createEngineController({ seed: 11, mode: 'sandbox' });
  const payload = createSavePayload({
    gameVersion: VERSION,
    mode: 'sandbox',
    engineState: saveController.saveState(),
    inputJournal: saveController.inputJournal(),
    boundaryEvents: state,
  });
  assert.deepEqual(
    parseSaveText(JSON.stringify(payload)).boundaryEvents,
    state,
    '境界の基準値と待機中の声を通常セーブで往復する',
  );
  const restored = createBoundaryEvents({ state });
  assert.deepEqual(restored.readState(), state);
  assert.equal(restored.currentMessage().type, 'food');
  restored.markAnnounced(restored.currentMessage().id);
  assert.equal(restored.currentMessage().type, 'salt');
  restored.markAnnounced(restored.currentMessage().id);
  restored.observe(boundaryModel({ day: 3, food: 150, salt: 2 }));
  restored.observe(boundaryModel({ day: 4, food: 139, salt: 2 }));
  assert.equal(restored.currentMessage(), null, 'ロード後も食料警告の7日間隔を保つ');
});

test('境界の声: 一言の器で書状にせず自動既読の対象にする', () => {
  const boundary = {
    id: 'boundary-food-2-1',
    day: 2,
    type: 'food',
    speech: foodBoundarySpeech(boundaryModel({ day: 2, food: 139 })),
  };
  const route = secretaryRouteFor({
    boundary,
    advice: [{
      id: 'blocked-advice',
      unread: true,
      completed: false,
      priority: 'action',
      speech: '別の対応です。',
    }],
    fallback: { priority: 'fallback', speech: '待機中です。' },
  });
  assert.equal(route.priority, 'food-boundary');
  assert.equal(route.tier, 'notice');
  assert.equal(route.target.kind, 'boundary-event');
  assert.equal(route.speech, boundary.speech);
  assert.equal(route.target.delivery, undefined, '書状の配達経路へ載せない');
});

test('通貨表示: engine内部値はfactsを変えず10倍のデナリで示す', () => {
  const foodLetter = TUTORIAL_LETTERS.find(row => row.id === 'food-dependence-report').render({
    model: {
      day: 12,
      flowEma: {},
      marketPrices: {},
      companyLedger: [{ day: 12, reason: 'fishの本土仕入', amount: -2.5 }],
    },
  });
  assert.equal(foodLetter.facts.outflow, 2.5, '書状factsはengine内部値を保つ');
  assert.match(foodLetter.body, /合計25\.0デナリ/);

  const graduation = TUTORIAL_LETTERS.find(row => row.id === 'tutorial-graduation').render({
    model: {
      day: 90,
      population: 0,
      households: [],
      flowEma: {},
      marketPrices: {},
      companyLedger: [
        { day: 1, reason: '本国注文売上', amount: 3 },
        { day: 2, reason: 'fishの本土仕入', amount: -2 },
      ],
      companyMoney: 4,
      companyBankruptcyDay: null,
    },
  });
  assert.equal(graduation.facts.companyNet, 1, '卒業factsもengine内部値を保つ');
  assert.doesNotMatch(graduation.body, /収入30\.0|支出20\.0|差引\+10\.0|残高40\.0/);
});

test('UI向上段9: 常駐エレナは強制書状を予告し、任意書状を直接開ける', () => {
  const letter = {
    id: 'letter-1', unread: true, announced: false, delivery: 'letter',
    issuedDay: 7, title: '実測の書状', summary: '人口13人',
    elenaMessage: '人口の変化を、書状にまとめました。食料と仕事を確かめましょう。',
  };
  const objective = {
    id: 'goal-1', chapter: '第一章', title: '市場を置く', detail: '丸太の売場を作ります',
    elenaMessage: '木こりが丸太を売れるよう、道沿いに市場を開きましょう。',
    elenaCompletion: '市場が開きました。木こりが丸太を売れる場所ができました。',
    complete: false,
  };
  const objectiveAction = { kind: 'building', job: 'market', label: '市場を選ぶ' };
  const events = [
    { sequence: 1, day: 8, tick: 241, important: false, title: '通常', details: '通常イベント' },
    { sequence: 2, day: 9, tick: 270, important: true, title: '実イベント', details: '麦4荷' },
  ];
  const fallback = {
    priority: 'operation-guide', target: { kind: 'sheet', sheet: 'island-sheet' },
    kicker: '観測の案内', title: '統計を見る', detail: '現物12荷',
  };
  const unread = secretaryRouteFor({ letters: [letter], objective, objectiveAction, events, fallback });
  assert.equal(unread.priority, 'optional-letter');
  assert.deepEqual(unread.target, { kind: 'letter', id: 'letter-1', delivery: 'letter' });
  assert.equal(unread.detail, '人口13人');
  assert.equal(unread.speech, letter.elenaMessage);
  const goalBeforeReport = secretaryRouteFor({
    messages: [{ ...letter, delivery: 'message' }], objective, objectiveAction, events, fallback,
  });
  assert.equal(goalBeforeReport.priority, 'tutorial-message');
  assert.equal(goalBeforeReport.tier, 'notice');
  assert.deepEqual(Object.keys(GUIDANCE_TIERS), ['stop', 'action', 'guidance', 'notice']);
  const goalBeforeInfo = secretaryRouteFor({
    advice: [{
      id: 'daily-report', unread: true, completed: false, priority: 'info',
      kicker: '報告', title: '日々の出来事', detail: 'あとで読めます',
      speech: '今日の出来事をまとめました。暮らしの変化を確かめましょう。', target: null,
    }],
    objective, objectiveAction, events, fallback,
  });
  assert.equal(goalBeforeInfo.priority, 'objective', '止めない報告は現在目標を奪わない');
  assert.deepEqual(goalBeforeReport.target, { kind: 'message', id: 'letter-1' });
  const report = secretaryRouteFor({
    messages: [{ ...letter, delivery: 'message' }],
    objective: { ...objective, complete: true }, events: [], fallback,
  });
  assert.equal(report.priority, 'tutorial-message');
  assert.equal(report.tier, 'notice');
  assert.deepEqual(report.target, { kind: 'message', id: 'letter-1' });
  const goal = secretaryRouteFor({
    letters: [{ ...letter, unread: false }], objective, objectiveAction, events, fallback,
  });
  assert.equal(goal.priority, 'objective');
  assert.equal(goal.title, objective.title);
  assert.equal(goal.speech, objective.elenaMessage);
  assert.deepEqual(goal.target, objectiveAction);
  const nextObjective = {
    id: 'goal-2', chapter: '第一章', title: '港へつなぐ',
    elenaMessage: 'この道を荷が行き来します。', detail: '道路 0/1', complete: false,
  };
  const handoff = tutorialHandoffFor(objective, nextObjective);
  assert.deepEqual(
    { completedId: handoff.completedId, nextId: handoff.nextId },
    { completedId: 'goal-1', nextId: 'goal-2' },
  );
  assert.equal(handoff.speech, objective.elenaCompletion);
  const handoffRoute = secretaryRouteFor({
    letters: [{ ...letter, unread: false }],
    handoff, objective: nextObjective, objectiveAction, events, fallback,
  });
  assert.equal(handoffRoute.priority, 'goal-complete');
  assert.equal(handoffRoute.speech, handoff.speech);
  assert.deepEqual(handoffRoute.target, { kind: 'tutorial-handoff' });
  const urgentBeforeHandoff = secretaryRouteFor({
    letters: [{ ...letter, delivery: 'forced', attention: 'critical' }],
    handoff, objective: nextObjective, objectiveAction, events, fallback,
  });
  assert.equal(urgentBeforeHandoff.priority, 'forced-letter', '重要書状は達成案内より先に予告する');
  const optionalAfterHandoff = secretaryRouteFor({
    letters: [letter], handoff, objective: nextObjective, objectiveAction, events, fallback,
  });
  assert.equal(optionalAfterHandoff.priority, 'goal-complete', '任意書状より達成の切替を先に伝える');
  assert.equal(tutorialHandoffFor(nextObjective, nextObjective), null, '同じ目標の再描画では達成を再発行しない');
  assert.deepEqual(objectiveActionFor({ id: 'first-settlers-arrive' }, { buildings: [] }), {
    kind: 'speed', speed: 3, label: '運び手を見ながら一日毎秒にする',
  });
  assert.deepEqual(objectiveActionFor({ id: 'accept-first-order' }, {
    buildings: [], orderOffer: null,
  }), { kind: 'speed', speed: 3, label: '物流を見ながら一日毎秒にする' });
  assert.equal(tutorialSpeedAfterObjectiveChange({
    previousObjective: { id: 'wait' },
    objective: { id: 'build' },
    previousAction: { kind: 'speed', speed: 3 },
    speedIndex: 3,
  }), 1);
  assert.equal(tutorialSpeedAfterObjectiveChange({
    previousObjective: { id: 'build-a' },
    objective: { id: 'build-b' },
    previousAction: { kind: 'building' },
    speedIndex: 3,
  }), 3);
  const important = secretaryRouteFor({
    letters: [], objective: { ...objective, complete: true },
    events: events.map(event => event.important
      ? { ...event, elenaSpeech: '大切な出来事がありました。暮らしへの影響を確かめましょう。' }
      : event),
    fallback,
  });
  assert.equal(important.priority, 'important-event');
  assert.deepEqual(important.target, { kind: 'event', sequence: 2 });
  assert.equal(
    secretaryRouteFor({ events: secretaryEventsAfter(events, 2), fallback }),
    fallback,
    '一度伝えた重要イベントはエレナの常駐発話を占有し続けない',
  );
  const laterEvent = {
    sequence: 3, important: true, elenaSpeech: 'その後に起きた、新しい出来事です。',
  };
  assert.equal(
    secretaryRouteFor({ events: secretaryEventsAfter([...events, laterEvent], 2), fallback })
      .target.sequence,
    3,
    '伝えた後でも、新しく起きた出来事は一度表示する',
  );
  assert.equal(secretaryRouteFor({ events: events.slice(0, 1), fallback }), fallback);
  assert.equal(guidanceReadingTimeMs('短い発話です。'), 5200);
  assert.ok(guidanceReadingTimeMs('長い発話です。'.repeat(12)) > 5200,
    '長い発話は文字数に応じて保持時間を延ばす');
  assert.equal(guidanceReadingTimeMs('長文'.repeat(200)), 10000,
    '極端な長文でも自動切替を無制限には遅らせない');

  const spoken = '食料が5荷傷みました。［需給］で魚と野菜の量を見て、余らせている品の買上げ目標を下げましょう。';
  const formatted = formatElenaSpeech(spoken);
  assert.deepEqual(formatted.split('\n'), [
    '食料が5荷傷みました。',
    '［需給］で魚と野菜の量を見て、',
    '余らせている品の買上げ目標を下げましょう。',
  ]);
  assert.equal(formatted.replaceAll('\n', ''), spoken, '発話本文は改変しない');
  assert.equal(formatted.split('\n').length, 3);
  assert.equal(
    formatElenaSpeech('詳しくは書状を見てください。数字を比べれば判断できます。', {
      maxLines: 2,
    }).split('\n').length,
    2,
    '操作ボタンがある時は二行へ収める',
  );
  assert.equal(
    formatElenaSpeech('句読点のない固有名詞CharterIsle', { maxLines: 3 }),
    '句読点のない固有名詞CharterIsle',
    '句読点がなければ語の途中に改行を作らない',
  );

  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  const mainSource = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(html, /id="secretary"/);
  assert.match(html, /elena_vance\.png/);
  assert.match(html, /<div id="secretary"[^>]*>[\s\S]*secretary-name[\s\S]*secretary-speech/);
  assert.match(html, /id="secretary-letter-action"[^>]*>[\s\S]*書状を開く/);
  assert.doesNotMatch(html, /id="secretary-action"|もう一度言って/);
  assert.doesNotMatch(css, /secretary-repeat|secretary\.repeating/);
  assert.doesNotMatch(html, /id="secretary-(?:tier|kicker|title|detail)"/);
  assert.match(html, /id="tutorial-action"[^>]*>操作を始める/);
  assert.match(css, /\.secretary\.guidance-switching/);
  assert.match(css, /\.secretary p\s*\{[^}]*white-space:\s*pre-line[^}]*overflow-wrap:\s*normal/s);
  assert.doesNotMatch(css, /\.secretary p\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(mainSource, /formatElenaSpeech\(speech,\s*\{\s*maxLines:\s*canFollowTarget \? 2 : 3/s);
  assert.match(css, /\.tutorial-objective\.guidance-entering/);
  assert.doesNotMatch(html, /id="tutorial-(?:system|detail)"/);
  assert.match(css, /\.observer\s*\{[^}]*z-index:\s*45[^}]*top:\s*var\(--elena-top\)[^}]*left:\s*max\(14px,[^}]*width:\s*min\(640px/s);
  assert.match(css, /\.secretary\s*\{[^}]*rgba\(255,250,226[^}]*rgba\(235,220,181[^}]*color:\s*#392d20/s);
  assert.match(css, /\.sheet\s*\{[^}]*right:\s*14px[^}]*top:\s*var\(--sheet-panel-top\)/s);
  assert.match(css, /@media \(max-width:\s*980px\)[\s\S]*?\.observer\s*\{[^}]*left:\s*50%[^}]*transform:\s*translateX\(-50%\)/s);
  assert.match(css, /\.tutorial-objective-visible \.sheet\s*\{[^}]*top:/s);
  assert.match(mainSource, /lastDeliveredSecretaryEventSequence/);
  assert.match(mainSource, /IMPORTANT_EVENT_MINIMUM_MS\s*=\s*6500/);
});

test('UI向上段10: WASDは連続・斜め等速で、編集入力とmodifierを奪わず速度キーを案内する', () => {
  assert.deepEqual(movementVector(new Set(['w'])), { x: 0, y: 1 });
  const diagonal = movementVector(new Set(['w', 'd']));
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 1e-12);
  const camera = new IsometricCamera();
  panCameraFromKeys(camera, new Set(['w', 'd']), 0.5);
  assert.ok(Math.abs(Math.hypot(camera.panX, camera.panY) - 48) < 1e-9,
    '背景復帰時もdelta上限0.1秒を超えて飛ばない');
  const editable = { closest: selector => selector.includes('input') ? editable : null };
  const plain = { closest: () => null };
  assert.equal(shouldIgnoreShortcut({ target: editable, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false }), true);
  assert.equal(shouldIgnoreShortcut({ target: plain, altKey: false, ctrlKey: true, metaKey: false, shiftKey: false }), true);
  assert.equal(shouldIgnoreShortcut({ target: plain, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false }), false);

  const clock = new SimulationClock({ speedIndex: 3 });
  assert.equal(clock.consume(1, { maxTicks: 3 }), 3);
  assert.equal(clock.consume(0, { maxTicks: 3 }), 3, '処理上限を超えた時間は次回へ保持する');
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="key-hints"[\s\S]*WASD[\s\S]*Space[\s\S]*1–4[\s\S]*Esc/);
});

function replayFixtureInEngineBatches(fixture, batchSize) {
  const controller = createEngineController({ seed: 11, mode: 'tutorial' });
  let tick = 0;
  const advanceTo = targetTick => {
    advanceInBatches(controller, targetTick - tick, { batchSize });
    tick = targetTick;
  };
  for (const row of fixture.journal) {
    advanceTo(row.tick);
    controller.operate(row.op);
  }
  advanceTo(fixture.model.tick);
  return controller;
}

test('UI向上段11: 固定3tickバッチは自由プレイ表示を3分の1にし、全章状態を保つ', () => {
  assert.equal(displayBatchSizeFor({ speedIndex: 3 }), DISPLAY_BATCH_TICKS);
  assert.equal(displayBatchSizeFor({ speedIndex: 3, tutorialActive: true }), 1,
    '発行tickと証拠値を変えないため、進行中の教程directorは従来どおり1tick観測する');
  assert.equal(displayBatchSizeFor({
    speedIndex: 3, tutorialActive: true, tutorialComplete: true,
  }), DISPLAY_BATCH_TICKS, '教程完了後の自由プレイは3tick表示へ移る');
  assert.equal(displayBatchSizeFor({ speedIndex: 2 }), 1);
  const unbatched = createEngineController({ seed: 13, mode: 'test' });
  unbatched.resetMetrics();
  for (let tick = 0; tick < 300; tick += 1) {
    unbatched.advanceTicks(1);
    unbatched.readModel();
  }
  const batched = createEngineController({ seed: 13, mode: 'test' });
  batched.resetMetrics();
  const result = advanceInBatches(batched, 300, {
    batchSize: DISPLAY_BATCH_TICKS,
    afterBatch: () => batched.readModel(),
  });
  assert.deepEqual(result, { ticks: 300, batches: 100 });
  assert.deepEqual(batched.readModel(), unbatched.readModel());
  assert.deepEqual(batched.events(0), unbatched.events(0));
  assert.deepEqual(batched.inputJournal(), unbatched.inputJournal());
  const oldCounts = unbatched.metrics();
  const newCounts = batched.metrics();
  assert.ok(newCounts.snapshotReads <= Math.ceil(oldCounts.snapshotReads / 3));
  assert.ok(newCounts.viewModelBuilds <= Math.ceil(oldCounts.viewModelBuilds / 3));
  assert.equal(newCounts.advanceCalls, 100);
  assert.equal(newCounts.advancedTicks, 300);

  const chapters = [
    tutorialThroughPlay.firstChapter,
    tutorialThroughPlay.secondChapter,
    tutorialThroughPlay.thirdChapter,
    tutorialThroughPlay.fourthChapter,
    tutorialThroughPlay.fifthChapter,
    tutorialThroughPlay.graduation,
  ];
  let graduationController = null;
  for (const fixture of chapters) {
    const replay = replayFixtureInEngineBatches(fixture, DISPLAY_BATCH_TICKS);
    assert.deepEqual(replay.readModel(), fixture.model, '全6章の最終描画モデルが一致する');
    assert.deepEqual(replay.inputJournal(), fixture.journal, '全6章の入力journalが一致する');
    if (fixture === tutorialThroughPlay.graduation) graduationController = replay;
  }
  const rawGraduation = replayFixtureInEngineBatches(tutorialThroughPlay.graduation, 1);
  assert.deepEqual(graduationController.readModel(), rawGraduation.readModel());
  assert.deepEqual(graduationController.events(0), rawGraduation.events(0));
  assert.deepEqual(graduationController.inputJournal(), rawGraduation.inputJournal());

});

function findPreview(model, job) {
  for (let y = 0; y < model.height; y += 1) {
    for (let x = 0; x < model.width; x += 1) {
      const preview = previewBuildingPlacement(model, job, { x, y });
      if (preview.ok) return preview;
    }
  }
  return null;
}

function findRoadLoggerSetup(model) {
  const port = model.buildings.find(building => building.roles.includes('port'));
  if (!port?.entrance) return null;
  const candidates = [];
  for (let y = 0; y < model.height; y += 1) {
    for (let x = 0; x < model.width; x += 1) {
      const logger = previewBuildingPlacement(model, 'logger', { x, y });
      if (!logger.ok) continue;
      const road = previewRoadPlacement(model, port.entrance, logger.entrance);
      if (!road.ok) continue;
      const reachesForest = road.cells.some(cell => {
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if ((dx || dy) && model.terrain[cell.y + dy]?.[cell.x + dx]?.kind === 'forest') return true;
          }
        }
        return false;
      });
      if (!reachesForest) continue;
      const footprint = new Set(logger.cells.map(cell => `${cell.x},${cell.y}`));
      if (road.cells.some(cell => footprint.has(`${cell.x},${cell.y}`))) continue;
      candidates.push({ logger, road });
    }
  }
  return candidates.sort((left, right) => left.road.cells.length - right.road.cells.length)[0] ?? null;
}

test('段13: 入口カーソルからエンジンと同じ実寸敷地を選び不正地形を事前拒否する', () => {
  const controller = createEngineController({ seed: 11 });
  const before = controller.readModel();
  for (const [type, definition] of Object.entries(ECONOMIC_BUILDINGS)) {
    assert.deepEqual(BUILDING_SIZES[type], {
      width: definition.w, height: definition.h,
      ...(definition.category === 'fixed' ? { fixed: true } : {}),
      ...(definition.shore ? { shore: true } : {}),
    });
  }
  let water = null;
  for (let y = 0; y < before.height && !water; y += 1) {
    for (let x = 0; x < before.width; x += 1) {
      if (before.terrain[y][x].kind === 'water') { water = { x, y }; break; }
    }
  }
  assert.match(previewBuildingPlacement(before, 'woodshop', water).reason, /水/);
  assert.match(previewBuildingPlacement(before, 'port', { x: 30, y: 35 }).reason, /固定/);
  const occupiedEntrance = before.buildings.find(building => !['market', 'warehouse', 'port'].includes(building.type)).entrance;
  assert.equal(previewBuildingPlacement(before, 'woodshop', occupiedEntrance).ok, false);

  const preview = findPreview(before, 'woodshop');
  assert.ok(preview, '基準都市の空き地に木工房の区画を置ける');
  assert.deepEqual([preview.width, preview.height], [3, 3]);
  assert.equal(preview.cells.length, 9);
  const result = controller.operate({
    type: 'place_building', job: 'woodshop',
    x: preview.entrance.x, y: preview.entrance.y,
    buildingX: preview.x, buildingY: preview.y,
  });
  assert.equal(result.ok, true);
  const placed = controller.readModel().buildings.find(building => building.id === result.buildingId);
  assert.deepEqual(
    { x: placed.x, y: placed.y, width: placed.width, height: placed.height, entrance: placed.entrance },
    { x: preview.x, y: preview.y, width: preview.width, height: preview.height, entrance: preview.entrance },
  );
  assert.deepEqual(controller.inputJournal().at(-1).op, {
    type: 'place_building', job: 'woodshop',
    x: preview.entrance.x, y: preview.entrance.y,
    buildingX: preview.x, buildingY: preview.y,
  });
  assert.equal(controller.operate({ type: 'remove_building', buildingId: placed.id }).ok, true);
  assert.equal(controller.readModel().buildings.some(building => building.id === placed.id), false);
});

test('空間生産性UI: 木こりと漁師は資源から遠くても配置でき、実働と予測日産を返す', () => {
  const model = createEngineController({ seed: 11, mode: 'sandbox' }).readModel();
  const nearKind = (point, kind, radius = 2) => {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (model.terrain[point.y + dy]?.[point.x + dx]?.kind === kind) return true;
      }
    }
    return false;
  };
  let logger = null;
  let fisher = null;
  for (let y = 0; y < model.height; y += 1) {
    for (let x = 0; x < model.width; x += 1) {
      const point = { x, y };
      if (!logger && !nearKind(point, 'forest')) {
        const preview = previewBuildingPlacement(model, 'logger', point);
        if (preview.ok && preview.productivity?.target) logger = preview;
      }
      if (!fisher && !nearKind(point, 'water')) {
        const preview = previewBuildingPlacement(model, 'fisher', point);
        if (preview.ok && preview.productivity?.target) fisher = preview;
      }
    }
  }
  assert.ok(logger, '森の隣でない空き地にも木こりを置ける');
  assert.ok(fisher, '水際でない空き地にも漁師を置ける');
  for (const preview of [logger, fisher]) {
    assert.ok(preview.productivity.oneWayTicks > 2);
    assert.ok(preview.productivity.workTicks < 30);
    assert.ok(preview.productivity.dailyOutput > 0);
    assert.ok(preview.productivity.efficiency < 1);
  }
  assert.deepEqual(
    resourcePlacementEstimate(model, 'logger', logger.entrance),
    logger.productivity,
  );
});

test('空間生産性UI: 生産者が近い加工配置は市場経由との差を具体的に予告する', () => {
  const controller = createEngineController({ seed: 11, mode: 'test' });
  controller.advanceTicks(2_400);
  const model = controller.readModel();
  const logger = model.households.find(household => household.job === 'logger');
  assert.ok(logger);
  const loggerBuilding = model.buildings.find(building => building.id === logger.buildingId);
  const estimates = [
    { x: loggerBuilding.entrance.x + 1, y: loggerBuilding.entrance.y },
    { x: loggerBuilding.entrance.x - 1, y: loggerBuilding.entrance.y },
    { x: loggerBuilding.entrance.x, y: loggerBuilding.entrance.y + 1 },
    { x: loggerBuilding.entrance.x, y: loggerBuilding.entrance.y - 1 },
  ].map(point => supplierPlacementEstimate(model, 'woodshop', point))
    .filter(estimate => estimate?.supplier);
  assert.ok(estimates.length > 0);
  assert.ok(estimates.every(estimate => Number.isFinite(estimate.supplier.distance)));

  const fisher = model.households.find(household => household.job === 'fisher');
  assert.ok(fisher);
  const fisherBuilding = model.buildings.find(building => building.id === fisher.buildingId);
  const fishmealEstimates = [
    { x: fisherBuilding.entrance.x + 1, y: fisherBuilding.entrance.y },
    { x: fisherBuilding.entrance.x - 1, y: fisherBuilding.entrance.y },
    { x: fisherBuilding.entrance.x, y: fisherBuilding.entrance.y + 1 },
    { x: fisherBuilding.entrance.x, y: fisherBuilding.entrance.y - 1 },
  ].map(point => supplierPlacementEstimate(model, 'fisher2', point))
    .filter(estimate => estimate?.supplier);
  assert.ok(fishmealEstimates.length > 0);
  assert.ok(fishmealEstimates.every(estimate => estimate.supplier.job === 'fisher'));

  const pastureEstimates = [
    { x: loggerBuilding.entrance.x + 1, y: loggerBuilding.entrance.y },
    { x: loggerBuilding.entrance.x - 1, y: loggerBuilding.entrance.y },
    { x: loggerBuilding.entrance.x, y: loggerBuilding.entrance.y + 1 },
    { x: loggerBuilding.entrance.x, y: loggerBuilding.entrance.y - 1 },
  ].map(point => supplierPlacementEstimate(model, 'shepherd', point))
    .filter(estimate => estimate?.supplier);
  assert.ok(pastureEstimates.length > 0);
  assert.ok(pastureEstimates.every(estimate => ['wheat', 'veg'].includes(estimate.supplier.job)));
});

test('需要網4 UI: 魚粉屋は水際でなく漁師との仕入れ距離を見て配置できる', () => {
  const controller = createEngineController({ seed: 11, mode: 'test' });
  controller.advanceTicks(2_400);
  const model = controller.readModel();
  const farFromWater = (point) => {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        if (model.terrain[point.y + dy]?.[point.x + dx]?.kind === 'water') return false;
      }
    }
    return true;
  };
  let preview = null;
  for (let y = 0; y < model.height && !preview; y += 1) {
    for (let x = 0; x < model.width && !preview; x += 1) {
      if (!farFromWater({ x, y })) continue;
      const candidate = previewBuildingPlacement(model, 'fisher2', { x, y });
      if (candidate.ok && candidate.productivity?.supplier) preview = candidate;
    }
  }
  assert.ok(preview, '魚粉屋は水際以外の空き地にも配置できる');
  assert.equal(preview.productivity?.supplier?.job, 'fisher');
});

test('空間生産性UI: 建物・市場圏・島全体へ同じ30日実測を公開する', () => {
  const controller = createEngineController({ seed: 11, mode: 'test' });
  controller.advanceTicks(2_400);
  const model = controller.readModel();
  const productive = model.households.filter(household => household.productivity.ideal > 0);
  assert.ok(productive.length > 0);
  assert.ok(productive.some(household => household.productivity.days > 0));
  assert.ok(model.productivity.ideal > 0);
  assert.ok(Number.isFinite(model.productivity.efficiency));
  assert.equal(model.marketProductivity.radiusTicks, 14);
  assert.ok(model.buildings.some(building => building.productivity?.ideal > 0));
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  for (const id of [
    'island-productivity', 'island-productivity-rate', 'island-productivity-output',
    'island-productivity-direct',
  ]) assert.match(html, new RegExp(`id="${id}"`));
  assert.doesNotMatch(html, /id="productivity-chart"/,
    '空間生産性は島の診断カードに残し、既定3グラフへは重ねない');
  assert.match(css, /\.productivity-card/);
  assert.match(css, /\.market-productivity/);
});

test('段14: 道路プレビュー・操作journal・市場接続色と警告座標を保持する', () => {
  const controller = createEngineController({ seed: 11 });
  const before = controller.readModel();
  let roadPreview = null;
  for (let y = 0; y < before.height && !roadPreview; y += 1) {
    for (let x = 0; x < before.width; x += 1) {
      const candidate = previewRoadPlacement(before, { x, y }, { x, y });
      if (candidate.ok) { roadPreview = candidate; break; }
    }
  }
  assert.ok(roadPreview);
  assert.equal(controller.operate({ type: 'add_road', start: roadPreview.start, end: roadPreview.end }).ok, true);
  assert.equal(controller.readModel().roadKeys.includes(`${roadPreview.start.x},${roadPreview.start.y}`), true);
  assert.equal(controller.operate({ type: 'remove_road', x: roadPreview.start.x, y: roadPreview.start.y }).ok, true);
  assert.deepEqual(controller.inputJournal().slice(-2).map(row => row.op.type), ['add_road', 'remove_road']);

  const fixture = {
    roadKeys: ['0,0', '1,0', '5,5'],
    buildings: [
      { id: 'market', type: 'market', roles: ['market'], entrance: { x: 0, y: 0 } },
      { id: 'near', type: 'woodshop', entrance: { x: 1, y: 0 } },
      { id: 'far', type: 'logger', entrance: { x: 5, y: 5 } },
    ],
    economyMarket: { x: 0, y: 0 },
  };
  const connection = analyzeRoadConnections(fixture);
  assert.deepEqual(new Set(connection.connectedRoadKeys), new Set(['0,0', '1,0']));
  assert.equal(connection.buildings.find(row => row.id === 'near').connected, true);
  assert.deepEqual(connection.buildings.find(row => row.id === 'far'), {
    id: 'far', connected: false, x: 5, y: 5,
  });
  const renderer = fs.readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
  assert.match(renderer, /道が繋がっていません/);
});

test('段15: 会社台帳・買上げ目標・市場へ出す・注文比較を描画モデルと公開操作へ接続する', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(120);
  const snapshot = api.snapshot();
  assert.ok(snapshot.economy.orderOffer);
  snapshot.economy.stalls.tools = [{ householdId: 999, qty: 4, price: 1.75, age: 0 }];
  const model = snapshotToViewModel(snapshot);
  assert.deepEqual(model.companyLedger, snapshot.economy.company.ledger);
  assert.equal(model.marketLowest.tools, 1.75);
  assert.deepEqual(model.orderOffer, snapshot.economy.orderOffer);

  const controller = createEngineController({ seed: 11 });
  controller.operate({ type: 'set_stock_target', goods: 'tools', qty: 12 });
  const release = controller.operate({ type: 'release_stock', goods: 'tools', qty: 16 });
  assert.equal(release.ok, false, '在庫ゼロの市場へ出すは何も運ばない');
  controller.advanceTicks(120 * 30);
  assert.equal(controller.operate({ type: 'accept_order' }).ok, true);
  assert.deepEqual(controller.inputJournal().slice(-3).map(row => row.op.type), [
    'set_stock_target', 'release_stock', 'accept_order',
  ]);
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  for (const id of ['company-sheet', 'order-panel', 'aid-panel', 'company-goods', 'company-ledger']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(main, /offer\.price \* 1\.25 \* 10/,
    '会社欄は注文基準値でなく完遂時の1.25倍決済単価を全量仕入原価と並べる');
  assert.match(main, /全量仕入原価/);
});

test('段7支援UI: 逓減量と拒絶を描画モデルへ出し、要請を公開journalへ記録する', () => {
  const controller = createEngineController({ seed: 11, mode: 'tutorial' });
  assert.deepEqual(controller.readModel().mainlandAid, {
    requests: 0, refused: false, nextQty: 240,
  });
  for (const nextQty of [180, 120, 60, 0]) {
    assert.equal(controller.operate({ type: 'request_aid' }).ok, true);
    assert.equal(controller.readModel().mainlandAid.nextQty, nextQty);
  }
  assert.equal(controller.readModel().mainlandAid.refused, true);
  assert.deepEqual(
    controller.inputJournal().map(row => row.op.type),
    ['request_aid', 'request_aid', 'request_aid', 'request_aid'],
  );
});

test('段16: 観測APIの全イベント種とnotice専用トースト・ログ表示経路を持つ', () => {
  for (const type of OBSERVED_EVENT_TYPES) {
    assert.equal(hasEventPresentation(type), true, type);
    const row = presentEvent({ type, day: 3, tick: 81, x: 4, y: 5, goods: 'wheat', qty: 1 });
    assert.ok(row.title && row.tone);
  }
  assert.deepEqual(
    Object.entries(EVENT_DISPLAY_POLICY)
      .filter(([, policy]) => policy.keep)
      .map(([type]) => type),
    ['birth', 'death', 'job_move', 'inheritance', 'blocked', 'notice'],
  );
  for (const type of ['operation', 'departure', 'arrival', 'transaction', 'docking', 'handling']) {
    assert.equal(shouldPresentEvent({ type }), false, `${type}は盤面や台帳で分かるため表示しない`);
  }
  assert.equal(shouldPresentEvent({ type: 'notice', message: '道が一区画通じた' }), false);
  assert.equal(shouldPresentEvent({ type: 'notice', message: '★本国より注文状: 木製品30荷' }), true);
  assert.deepEqual(
    presentEvent({ type: 'notice', message: '★本国より注文状: 木製品30荷', day: 1, tick: 1, x: 0, y: 0 }).title,
    '本国から注文状',
  );
  assert.equal(
    presentEvent({ type: 'notice', message: '会社へ最終通告', day: 1, tick: 1, x: 0, y: 0 }).tone,
    'bad',
  );
  assert.match(
    presentEvent({ type: 'birth', message: '子どもが生まれた', day: 1, tick: 1 }).elenaSpeech,
    /新しい子ども.*食料/,
  );
  assert.match(
    presentEvent({ type: 'blocked', message: '道が切れた', day: 1, tick: 1 }).elenaSpeech,
    /道が切れて.*つなぎ直しましょう/,
  );
  const placeModel = {
    width: 40,
    height: 30,
    buildings: [{ id: 8, type: 'market', x: 18, y: 12, width: 4, height: 4 }],
    households: [{ id: 3, buildingId: 8, job: 'market' }],
  };
  assert.equal(eventPlaceLabel({ householdId: 3 }, placeModel), '市場の近く');
  assert.equal(eventPlaceLabel({ x: 2, y: 27 }, placeModel), '島の南西側');
  assert.equal(presentEvent({ type: 'blocked', buildingId: 8 }, placeModel).details, '市場の近く');
  assert.match(
    presentEvent({ type: 'death', message: '☠ 佐藤家は離散した', day: 1, tick: 1 }).elenaSpeech,
    /住民の佐藤家が島を離れました.*食料/,
  );
  assert.equal(
    presentEvent({ type: 'notice', message: '★本国より注文状: 木製品30荷', day: 1, tick: 1 }).elenaSpeech,
    '',
    '専用に書かれた発話がないイベント本文はエレナへ流用しない',
  );
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(html, /id="toast-stack"/);
  assert.match(html, /id="event-log"/);
  assert.match(main, /appendEvents/);
  assert.doesNotMatch(main, /座標/, 'プレイヤー向けの出来事・案内に座標を出さない');
  assert.match(main, /function focusEvent[\s\S]+camera\.focus\(/);
  assert.match(main, /renderer\.markBuilding/);
});

const slowTests = [...testTimings].sort((left, right) => right.elapsedMs - left.elapsedMs).slice(0, 5);
console.log(`\n${passed} v004 tests passed in ${((performance.now() - suiteStartedAt) / 1000).toFixed(2)}s`);
if (slowTests[0]?.elapsedMs >= 1000) {
  console.log(`slow: ${slowTests.map(row => `${(row.elapsedMs / 1000).toFixed(2)}s ${row.name}`).join(' | ')}`);
}
