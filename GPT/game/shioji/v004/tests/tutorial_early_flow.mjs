import assert from 'node:assert/strict';
import { createEngineController } from '../src/engine_bridge.js';
import { previewBuildingPlacement, previewRoadPlacement } from '../src/placement.js';
import { estimateWalkLen } from '../src/tutorial_content.js';
import { createTutorialDirector } from '../src/tutorial_director.js';

const SEEDS = process.env.TUTORIAL_PROBE_SEEDS
  ? process.env.TUTORIAL_PROBE_SEEDS.split(':').map(Number)
  : [11];
const AID_REQUESTS = Number(process.env.TUTORIAL_AID_REQUESTS ?? 1);
const AUDIT_DAY = Number(process.env.TUTORIAL_AUDIT_DAY ?? 0);

function findPreviewNear(model, job, origin) {
  let best = null;
  for (let y = 0; y < model.height; y += 1) {
    for (let x = 0; x < model.width; x += 1) {
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
  return best?.preview ?? null;
}

function findConnectablePreview(model, job, origin) {
  let best = null;
  for (let y = 0; y < model.height; y += 1) {
    for (let x = 0; x < model.width; x += 1) {
      const preview = previewBuildingPlacement(model, job, { x, y });
      if (!preview.ok) continue;
      const road = previewRoadPlacement(model, origin, preview.entrance);
      if (!road.ok) continue;
      const distance = road.cells.length;
      if (!best || distance < best.distance) best = { preview, road, distance };
    }
  }
  return best;
}

function findRoadLoggerSetup(model) {
  const port = model.buildings.find(building => building.roles.includes('port'));
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
            if ((dx || dy)
              && model.terrain[cell.y + dy]?.[cell.x + dx]?.kind === 'forest') return true;
          }
        }
        return false;
      });
      const footprint = new Set(logger.cells.map(cell => `${cell.x},${cell.y}`));
      if (!reachesForest || road.cells.some(cell => footprint.has(`${cell.x},${cell.y}`))) continue;
      candidates.push({ logger, road });
    }
  }
  return candidates.sort((left, right) => left.road.cells.length - right.road.cells.length)[0] ?? null;
}

function place(controller, job, preview) {
  assert.ok(preview, `${job}の配置候補がある`);
  const result = controller.operate({
    type: 'place_building', job,
    x: preview.entrance.x, y: preview.entrance.y,
    buildingX: preview.x, buildingY: preview.y,
  });
  assert.equal(result.ok, true, `${job}を配置できる`);
}

function connect(controller, from, to) {
  const road = previewRoadPlacement(controller.readModel(), from, to);
  if (!road.ok) return;
  assert.equal(controller.operate({
    type: 'add_road', start: road.start, end: road.end,
  }).ok, true, '物流施設を道で結べる');
}

function measureSeed(seed) {
  const controller = createEngineController({ seed, mode: 'tutorial' });
  const director = createTutorialDirector();
  let eventSequence = 0;
  const events = [];
  const collect = () => {
    const rows = controller.events(eventSequence);
    if (rows.length) eventSequence = rows.at(-1).sequence;
    events.push(...rows);
    director.observe(controller.readModel(), rows);
  };
  const advanceDay = () => {
    controller.advanceTicks(30);
    collect();
  };

  const setup = findRoadLoggerSetup(controller.readModel());
  collect();
  assert.equal(director.currentObjective().id, 'first-road-and-logger');
  assert.ok(setup, `seed${seed}で森へ道を引き木こりを置ける`);
  assert.equal(controller.operate({
    type: 'add_road', start: setup.road.start, end: setup.road.end,
  }).ok, true);
  collect();
  assert.equal(director.currentObjective().id, 'first-logger');
  place(controller, 'logger', setup.logger);
  collect();
  assert.equal(director.currentObjective().id, 'market-for-logs');

  let model = controller.readModel();
  const port = model.buildings.find(building => building.roles.includes('port'));
  place(controller, 'market', findPreviewNear(model, 'market', port.entrance));
  collect();
  model = controller.readModel();
  const market = model.buildings.find(building => building.roles.includes('market'));
  connect(controller, port.entrance, market.entrance);
  collect();
  assert.equal(director.currentObjective().id, 'request-first-aid');
  for (let request = 0; request < AID_REQUESTS; request += 1) {
    assert.equal(controller.operate({ type: 'request_aid' }).ok, true);
    collect();
  }
  assert.equal(director.currentObjective().id, 'first-settlers-arrive');

  while (controller.readModel().day < 15) advanceDay();
  assert.equal(
    controller.readModel().households.some(household => household.job === 'logger'),
    true,
    `seed${seed}で市場設置後の15日目に木こり世帯が入る`,
  );
  assert.equal(director.currentObjective().id, 'place-island-food');

  model = controller.readModel();
  place(controller, 'fisher', findPreviewNear(model, 'fisher', market.entrance));
  collect();
  model = controller.readModel();
  place(controller, 'veg', findPreviewNear(model, 'veg', market.entrance));
  collect();
  assert.equal(director.currentObjective().id, 'first-woodshop');
  model = controller.readModel();
  place(controller, 'woodshop', findPreviewNear(model, 'woodshop', market.entrance));
  collect();
  assert.equal(director.currentObjective().id, 'warehouse-for-order');
  model = controller.readModel();
  const warehouseSetup = findConnectablePreview(model, 'warehouse', market.entrance);
  assert.ok(warehouseSetup, '市場から道を結べる倉庫の配置候補がある');
  place(controller, 'warehouse', warehouseSetup.preview);
  collect();
  connect(controller, market.entrance, warehouseSetup.preview.entrance);
  collect();
  assert.equal(director.currentObjective().id, 'prepare-first-tools-stock');
  assert.equal(controller.operate({
    type: 'set_stock_target', goods: 'tools', qty: 80,
  }).ok, true, '初注文の最大量まで木製品を先に買い集める');
  collect();
  assert.equal(director.currentObjective().id, 'accept-first-order');

  let firstOfferDay = null;
  let firstOfferGoods = null;
  let firstCompletionDay = null;
  let firstOrderDue = null;
  let prematureGoalsAtFirstOffer = [];
  let prematureNotificationsAtFirstOffer = [];
  const futureGoalIds = new Set([
    'observe-seasonal-food-valley', 'assess-profitable-order',
    'observe-skippable-order', 'observe-tools-price-rise',
  ]);
  const futureNotificationIds = new Set([
    'seasonal-food-valley-report', 'profitable-order-assessment',
    'skippable-order-assessment', 'tools-price-rise',
  ]);
  while (controller.readModel().day < 240 && firstCompletionDay === null) {
    advanceDay();
    model = controller.readModel();
    if (model.orderOffer && firstOfferDay === null) {
      firstOfferDay = model.day;
      firstOfferGoods = model.orderOffer.g;
      const offer = { ...model.orderOffer };
      firstOrderDue = offer.due;
      prematureGoalsAtFirstOffer = director.readState().completedGoals.filter(
        id => futureGoalIds.has(id),
      );
      assert.equal(controller.operate({ type: 'accept_order' }).ok, true);
      collect();
      prematureNotificationsAtFirstOffer = director.letters()
        .filter(letter => futureNotificationIds.has(letter.id))
        .map(letter => letter.id);
      assert.equal(director.currentObjective().id, 'order-procurement-target');
      assert.equal(controller.operate({
        type: 'set_stock_target', goods: offer.g, qty: offer.qty,
      }).ok, true);
      collect();
      collect();
    }
    if (firstOfferDay !== null && !controller.readModel().activeOrder) {
      const completed = controller.readModel().companyLedger.some(row => (
        row.reason.startsWith('本国注文へ') && row.amount > 0
      ));
      if (completed) firstCompletionDay = controller.readModel().day;
      if (!completed && controller.readModel().day > firstOrderDue) break;
    }
  }

  const deathEventsUntilFirstOrder = events.filter(event => event.type === 'death').length;
  while (AUDIT_DAY > 0 && controller.readModel().day < AUDIT_DAY) advanceDay();
  model = controller.readModel();
  const deaths = events.filter(event => event.type === 'death');
  const letters = director.letters();
  const advice = director.advice();
  return {
    seed,
    firstOfferDay,
    firstOfferGoods,
    firstCompletionDay,
    prematureGoalsAtFirstOffer,
    prematureNotificationsAtFirstOffer,
    deathEvents: deaths.length,
    deathEventsUntilFirstOrder,
    deathDays: deaths.map(event => event.eventDay ?? event.day ?? null),
    population: model.population,
    aidRequests: model.mainlandAid.requests,
    deathReasons: deaths.map(event => event.reason ?? event.cause ?? event.message ?? null),
    finalDay: model.day,
    currentObjective: director.currentObjective()?.id ?? null,
    letterAttention: Object.fromEntries(['critical', 'action', 'notice', 'silent'].map(attention => [
      attention, letters.filter(letter => letter.attention === attention).length,
    ])),
    duplicateLetterIds: letters.length - new Set(letters.map(letter => letter.id)).size,
    invalidLetterAttention: letters.filter(letter => (
      !['critical', 'action', 'notice', 'silent'].includes(letter.attention)
    )).length,
    advicePriorities: Object.fromEntries(['action', 'info'].map(priority => [
      priority, advice.filter(row => row.priority === priority).length,
    ])),
    flowEma: Object.fromEntries(['fish', 'veg', 'log', 'tools'].map(goods => [
      goods, model.flowEma[goods] ?? null,
    ])),
    companyTools: model.companyStock.tools ?? 0,
    toolsTarget: model.stockTargets.tools ?? 0,
    warehouseConnected: model.roadConnection.buildings.find(building => (
      model.buildings.find(candidate => candidate.id === building.id)?.roles.includes('warehouse')
    ))?.connected ?? false,
    jobs: Object.fromEntries(['logger', 'fisher', 'veg', 'woodshop'].map(job => [
      job, model.households.filter(household => household.job === job).length,
    ])),
  };
}

const rows = SEEDS.map(measureSeed);
for (const row of rows) console.log(`  early-flow ${JSON.stringify(row)}`);
assert.equal(rows.every(row => row.deathEventsUntilFirstOrder === 0), true,
  '教程の表示手順だけで初注文完遂まで餓死ゼロ');
assert.equal(rows.every(row => row.aidRequests === AID_REQUESTS), true, '指定した本国支援回数だけを使う');
assert.equal(rows.every(row => row.firstOfferDay !== null), true, '全seedで最初の注文状が届く');
assert.equal(rows.every(row => row.firstOfferGoods === 'tools'), true, '最初の生産適格注文は木製品になる');
assert.equal(rows.every(row => row.firstCompletionDay !== null), true, '全seedで最初の注文を完遂する');
assert.equal(rows.every(row => row.prematureGoalsAtFirstOffer.length === 0), true,
  '最初の注文中に未来章の観察目標を先回り完了しない');
assert.equal(rows.every(row => row.prematureNotificationsAtFirstOffer.length === 0), true,
  '最初の注文中に未来章の報告を先回り発行しない');
if (AUDIT_DAY > 0) {
  assert.equal(rows.every(row => row.finalDay >= AUDIT_DAY), true, `${AUDIT_DAY}日まで同じ島を監査する`);
  assert.equal(rows.every(row => row.duplicateLetterIds === 0), true, '書状は同一IDを重複発行しない');
  assert.equal(rows.every(row => row.invalidLetterAttention === 0), true,
    '長期通知も停止・要対応・報告・非表示の契約に収まる');
}
console.log(`${rows.length} seeds tutorial early-flow: PASS`);
