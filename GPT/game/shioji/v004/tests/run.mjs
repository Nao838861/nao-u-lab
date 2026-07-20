import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createEngineApi } from '../../engine/src/api.js';
import { buildBaseCity } from '../../engine/src/audit.js';
import { ECONOMIC_BUILDINGS } from '../../engine/src/physical.js';
import { IsometricCamera } from '../src/camera.js';
import { SimulationClock } from '../src/clock.js';
import { BUILDING_ART, BUILDING_SIZES, PLACEMENT_JOBS } from '../src/config.js';
import { buildBlankCity, createEngineController } from '../src/engine_bridge.js';
import {
  OBSERVED_EVENT_TYPES, hasEventPresentation, presentEvent,
} from '../src/event_view.js';
import {
  analyzeRoadConnections, previewBuildingPlacement, previewRoadPlacement,
} from '../src/placement.js';
import {
  WorldPresentation, interpolateWorldModel, transitionDuration,
} from '../src/presentation.js';
import { START_MODES, parseStartMode, urlForStartMode } from '../src/start_modes.js';
import { TUTORIAL_GOALS, TUTORIAL_LETTERS, estimateWalkLen } from '../src/tutorial_content.js';
import {
  TutorialDirector, createTutorialDirector, createTutorialDirectorForMode,
} from '../src/tutorial_director.js';
import { snapshotToViewModel } from '../src/view_model.js';
import {
  MAX_PILE_SPRITES, buildingAppearance, pileVisual, trailVisual,
} from '../src/visuals.js';

let passed = 0;

function test(name, body) {
  body();
  passed += 1;
  console.log(`ok - ${name}`);
}

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

test('チュートリアル段1: v003の旧Worldを持ち込まず観測ディレクターを分離する', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const director = fs.readFileSync(new URL('../src/tutorial_director.js', import.meta.url), 'utf8');
  assert.doesNotMatch(director, /applyOperation|advanceTicks|\.operate\(/);
  assert.match(html, /src="\.\/src\/main\.js/);
  assert.match(html, /潮路の島 v004/);
  assert.equal(fs.existsSync(new URL('../src/world.js', import.meta.url)), false);
  for (const id of [
    'tutorial-objective', 'tutorial-progress-bar', 'skip-tutorial',
    'open-tutorial-letters', 'tutorial-letter-sheet', 'tutorial-letter-modal',
  ]) assert.match(html, new RegExp(`id=["']${id}["']`));
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

test('チュートリアル段2: 書状はsnapshotの実数値を本文へ差し込み一度だけ発行する', () => {
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
  assert.match(letter.body, /7日目/);
  assert.match(letter.body, /人口は13人/);
  assert.match(letter.body, /完成道路は5区画/);
  assert.match(letter.summary, /港 1棟・人口 13人・道路 5区画/);
  assert.equal(TUTORIAL_LETTERS.every(definition => typeof definition.render === 'function'), true);
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
  assert.deepEqual(completionDirector.currentObjective().progress, { done: 2, total: 2 });
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

test('チュートリアル段5: 港から森への道・木こり・実入植を目標列と書状へ実況しjournal再生できる', () => {
  const controller = createEngineController({ seed: 11, mode: 'tutorial' });
  const director = createTutorialDirector();
  let sequence = 0;
  const observe = () => {
    const events = controller.events(sequence);
    if (events.length) sequence = events.at(-1).sequence;
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
  assert.equal(controller.currentObjective, undefined, '世界controllerへチュートリアル能力を混ぜない');
  assert.equal(controller.operate({
    type: 'place_building', job: 'logger',
    x: setup.logger.entrance.x, y: setup.logger.entrance.y,
    buildingX: setup.logger.x, buildingY: setup.logger.y,
  }).ok, true);
  observe();
  assert.equal(director.readState().completedGoals.includes('first-road-and-logger'), true);
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
  assert.equal(director.currentObjective().id, 'market-for-logs', '入植の次は市場の目標へ進む');

  const letter = director.letters().find(candidate => candidate.id === 'first-settlers-report');
  assert.ok(letter);
  assert.match(letter.body, new RegExp(`${arrival.day}日目`));
  assert.match(letter.body, new RegExp(`${household.members}人の世帯`));
  assert.match(letter.body, new RegExp(`人口は${model.population}人`));
  const letterCount = director.letters().length;
  director.observe(model, [arrival]);
  assert.equal(director.letters().length, letterCount, '同じ入植イベントでは再発行しない');

  const journal = controller.inputJournal();
  assert.deepEqual(journal.map(row => row.op.type), ['add_road', 'place_building']);
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

test('チュートリアル段6: 丸太の催促→市場→初売り→木工房→持参丸太の初道具→市場の初商いを実況しjournal再生できる', () => {
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

  advanceUntil(() => hasLetter('logs-pile-no-market'), 25, '丸太の催促書状');
  const prompt = director.letters().find(letter => letter.id === 'logs-pile-no-market');
  assert.match(prompt.body, /丸太が\d+(\.\d)?荷積み上がりました/);
  assert.equal(director.currentObjective().id, 'market-for-logs');
  assert.equal(deaths.length, 0, '市場が立つ前に餓死者を出さない(キット食料の余裕)');

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

  advanceUntil(() => hasLetter('first-tools'), 45, '最初の道具の書状');
  const letters = director.letters();
  const toolsIndex = letters.findIndex(letter => letter.id === 'first-tools');
  const tradeIndex = letters.findIndex(letter => letter.id === 'first-log-trade');
  if (tradeIndex === -1 || tradeIndex > toolsIndex) {
    assert.match(letters[toolsIndex].body, /持参した丸太/, '市場取引前の初道具は持参丸太として実況する');
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

test('開始選択: tutorialとsandboxは同じ未開拓島、testは従来の安定都市になる', () => {
  assert.deepEqual(Object.keys(START_MODES), ['tutorial', 'sandbox', 'test']);
  const tutorial = createEngineController({ seed: 11, mode: 'tutorial' });
  const sandbox = createEngineController({ seed: 11, mode: 'sandbox' });
  const testCity = createEngineController({ seed: 11, mode: 'test' });
  assert.deepEqual(tutorial.readModel(), sandbox.readModel());
  const blank = sandbox.readModel();
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
  assert.ok(testCity.readModel().roadKeys.length > 0);
  assert.throws(() => createEngineController({ mode: 'unknown' }), /unknown start mode/);
});

test('開始選択: URLのmodeは3種だけを受理し他のqueryを保つ', () => {
  assert.equal(parseStartMode('?mode=tutorial'), 'tutorial');
  assert.equal(parseStartMode('?mode=sandbox'), 'sandbox');
  assert.equal(parseStartMode('?mode=test'), 'test');
  assert.equal(parseStartMode('?mode=unknown'), null);
  assert.equal(parseStartMode(''), null);
  const selected = new URL(urlForStartMode('https://example.test/game/?seed=11', 'sandbox'));
  assert.equal(selected.searchParams.get('mode'), 'sandbox');
  assert.equal(selected.searchParams.get('seed'), '11');
});

test('段2: full snapshotを地形・建物・キャリア・棚の不変描画モデルへ変換する', () => {
  const api = createEngineApi(buildBaseCity(11));
  const snapshot = api.snapshot({ scope: 'full' });
  const model = snapshotToViewModel(snapshot);
  assert.equal(model.terrain.length, snapshot.physical.height);
  assert.equal(model.terrain[0].length, snapshot.physical.width);
  assert.equal(model.buildings.length, snapshot.physical.buildings.length);
  assert.equal(model.carriers.length, snapshot.economy.households.length);
  assert.ok(model.buildings.every(building => Array.isArray(building.shelves)));
  assert.equal(Object.isFrozen(model), true);
  assert.equal(Object.isFrozen(model.terrain[0][0]), true);
  assert.throws(() => { model.terrain[0][0].kind = 'coal'; }, TypeError);
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
    'placement.js', 'presentation.js', 'renderer.js', 'start_modes.js', 'tutorial_content.js',
    'tutorial_director.js', 'view_model.js',
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
  for (const id of ['world', 'hud', 'funds-value', 'day-value', 'tick-value', 'speed-controls', 'step-day']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(css, /html, body[\s\S]*overflow:\s*hidden/);
  assert.match(css, /touch-action:\s*none/);
  assert.match(css, /@media \(max-width: 640px\)/);
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
  assert.equal(warehouse.vacant, true, '独立配置の空き蔵を空き建物として表示する');
  assert.match(warehouse.appearance.key, /vacant$/);
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
  const raised = buildingAppearance({ type: 'woodshop', cultureLevel: 3, vacant: false });
  assert.notEqual(base.key, raised.key);
  assert.ok(raised.elevation > base.elevation && raised.stoneBase);
  assert.equal(buildingAppearance({ type: 'future-job', cultureLevel: 2, vacant: false }).fallback, true);
});

test('段8: 在庫量を代表スプライト上限と正確な数字へ変換しゼロも保持する', () => {
  const zero = pileVisual(0, 'log');
  const fraction = pileVisual(0.55, 'fish');
  const large = pileVisual(500, 'iron');
  assert.deepEqual({ count: zero.spriteCount, label: zero.label }, { count: 0, label: '0' });
  assert.equal(fraction.spriteCount, 1);
  assert.equal(fraction.label, '0.6');
  assert.equal(large.spriteCount, MAX_PILE_SPRITES);
  assert.equal(large.clipped, true);
  assert.equal(large.label, '500');
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
  assert.ok(transitionDuration(from, to, events, 0.02) >= 0.18, 'dayEnd束を最低表示時間へ展開');
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
  const presentation = new WorldPresentation(from);
  presentation.enqueue(to, events, 0.02);
  assert.equal(presentation.pendingCount, 1);
  assert.ok(presentation.advance(0.09).carriers[1].x > 5);
  assert.equal(presentation.advance(0.2).presentationProgress, 1);
});

test('段10/11: 実港便の接岸・1荷/tick・出港をsnapshotとイベント差分へ同期する', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceTicks(1292);
  let previousSnapshot = api.snapshot();
  let previousModel = snapshotToViewModel(previousSnapshot);
  let sequence = api.events().at(-1)?.sequence ?? 0;

  api.advanceTicks(1);
  let snapshot = api.snapshot();
  let model = snapshotToViewModel(snapshot);
  let events = api.events({ afterSequence: sequence });
  sequence = events.at(-1)?.sequence ?? sequence;
  assert.equal(model.tick, 1293);
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
  api.advanceTicks(1303);
  const model = snapshotToViewModel(api.snapshot());
  const carrier = model.carriers.find(row => row.haulJobId);
  assert.ok(carrier, '最初の港荷を運ぶキャリアが存在する');
  assert.equal(carrier.kind, 'cart');
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

test('段15: 会社台帳・買上げ目標・蔵出し・注文比較を描画モデルと公開操作へ接続する', () => {
  const api = createEngineApi(buildBaseCity(11));
  api.advanceDays(105);
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
  assert.equal(release.ok, false, '在庫ゼロの蔵出しは何も運ばない');
  controller.advanceTicks(105 * 30);
  assert.equal(controller.operate({ type: 'accept_order' }).ok, true);
  assert.deepEqual(controller.inputJournal().slice(-3).map(row => row.op.type), [
    'set_stock_target', 'release_stock', 'accept_order',
  ]);
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['company-sheet', 'order-panel', 'company-goods', 'company-ledger']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test('段16: 観測APIの全イベント種と重要メッセージがトースト・ログ表示経路を持つ', () => {
  for (const type of OBSERVED_EVENT_TYPES) {
    assert.equal(hasEventPresentation(type), true, type);
    const row = presentEvent({ type, day: 3, tick: 81, x: 4, y: 5, goods: 'wheat', qty: 1 });
    assert.ok(row.title && row.tone);
  }
  assert.deepEqual(
    presentEvent({ type: 'notice', message: '★本国より注文状: 道具30荷', day: 1, tick: 1, x: 0, y: 0 }).title,
    '本国から注文状',
  );
  assert.equal(
    presentEvent({ type: 'notice', message: '会社へ最終通告', day: 1, tick: 1, x: 0, y: 0 }).tone,
    'bad',
  );
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(html, /id="toast-stack"/);
  assert.match(html, /id="event-log"/);
  assert.match(main, /appendEvents/);
  assert.match(main, /camera\.focus\(row\.x/);
});

console.log(`\n${passed} v004 tests passed`);
