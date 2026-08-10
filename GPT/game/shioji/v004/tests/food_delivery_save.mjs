import assert from 'node:assert/strict';

import { createEngineApi } from '../../engine/src/api.js';
import { buildBaseCity } from '../../engine/src/audit.js';
import {
  FOODS, P, buyAtMarket, buyTargets, createEconomicState, createHousehold,
} from '../../engine/src/econ.js';
import { createWorld } from '../../engine/src/world.js';
import {
  createSavePayload, parseSaveText,
} from '../src/save_game.js';
import { snapshotToViewModel } from '../src/view_model.js';

assert.equal(FOODS.includes('salt'), false, '塩は食料ではない');

{
  const economy = createEconomicState();
  const buyer = createHousehold(economy, { job: 'woodshop', x: 5, y: 5 });
  const wheatSeller = createHousehold(economy, { job: 'wheat', x: 6, y: 5 });
  const logSeller = createHousehold(economy, { job: 'logger', x: 7, y: 5 });
  for (const goods of FOODS) buyer.pantry[goods] = 0;
  buyer.pantry.log = 0;
  buyer.purse = 100;
  economy.currentDay = 120;
  economy.px.wheat = 1;
  economy.px.log = 1;
  economy.stalls.wheat = [{
    householdId: wheatSeller.id, goods: 'wheat', qty: 100, price: 1, cost: 0.5, age: 0,
  }];
  economy.stalls.log = [{
    householdId: logSeller.id, goods: 'log', qty: 100, price: 1, cost: 0.5, age: 0,
  }];
  const targets = buyTargets(economy, buyer, { day: 120 });
  assert.ok(targets.wheat && targets.log, '食料と加工原料の両方に需要がある');
  const result = buyAtMarket(economy, buyer, {
    day: 120,
    delivery: 'cargo',
    capacityLimit: 6,
  });
  assert.equal(result.order[0], 'wheat', '食料備蓄不足時は食料を最初に買う');
  assert.equal(result.purchased.wheat, 3, '原料用の半枠を除いた運搬枠をまず食料に使う');
  assert.equal(result.purchased.log ?? 0, 3,
    '食料を先に半枠確保した後、残りで加工原料を運び収入源も止めない');
}

{
  const world = buildBaseCity(11);
  const api = createEngineApi(world);
  api.advanceTicks(47);
  const before = api.snapshot();
  const payload = createSavePayload({
    gameVersion: 'test',
    mode: 'test',
    engineState: before,
    inputJournal: api.inputJournal(),
    goodsDiscovery: {
      version: 1,
      knownGoods: ['log'],
      announcedGoods: ['log'],
      pending: [],
    },
    economyHistory: [{ day: before.day }],
    savedAt: '2026-07-26T00:00:00.000Z',
  });
  const parsed = parseSaveText(JSON.stringify(payload));
  assert.deepEqual(parsed.goodsDiscovery, payload.goodsDiscovery, '品目の出会い履歴を保存する');
  const restoredWorld = createWorld({ stateSnapshot: parsed.engineState });
  const restoredApi = createEngineApi(restoredWorld, { initialJournal: parsed.inputJournal });
  assert.deepEqual(restoredApi.snapshot(), before, '保存直後の全状態を復元する');
  api.advanceTicks(60);
  restoredApi.advanceTicks(60);
  assert.deepEqual(restoredApi.snapshot(), api.snapshot(), '復元後も乱数を含め同じ進行を続ける');
}

{
  const world = buildBaseCity(11);
  const api = createEngineApi(world);
  api.advanceDays(120);
  const household = world.state.economy.households[0];
  for (const goods of FOODS) household.pantry[goods] = 0;
  household.pantry.salt = 80;
  household.state = 'home';
  household.road = 1;
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
  assert.equal(row.foodDelivery.kind, 'no_money', '市場にあるのに届かない理由を世帯へ出す');
  assert.ok(row.pantry.some(item => item.goods === 'salt' && item.section === 'householdGoods'),
    '塩を食料庫ではなく生活用品として表示する');
  assert.equal(
    row.pantry.filter(item => item.section === 'foodPantry')
      .reduce((total, item) => total + item.amount, 0),
    0,
    '塩だけでは食料在庫にならない',
  );
}

{
  const world = buildBaseCity(11);
  const api = createEngineApi(world);
  api.advanceDays(120);
  const household = world.state.economy.households[0];
  household.members = household.members.slice(0, 4);
  for (const goods of FOODS) household.pantry[goods] = 0;
  household.pantry.wheat = 4;
  household.state = 'home';
  household.hungerRun = 0;
  household.insolvM = 0;
  household.lastMarketVisit = null;

  const oneDayModel = snapshotToViewModel(api.snapshot({ scope: 'view' }));
  const oneDayRow = oneDayModel.households.find(candidate => candidate.id === household.id);
  const oneDayBuilding = oneDayModel.buildings.find(
    candidate => candidate.ownerHouseholdId === household.id,
  );
  assert.equal(oneDayRow.members, 4);
  assert.notEqual(
    oneDayBuilding.stateSignals.crisis?.kind,
    'food',
    '4荷は4人家族の1日分なので固定9人換算の食料危機を出さない',
  );

  household.pantry.wheat = 12;
  const threeDayModel = snapshotToViewModel(api.snapshot({ scope: 'view' }));
  const threeDayRow = threeDayModel.households.find(candidate => candidate.id === household.id);
  assert.equal(
    threeDayRow.foodDelivery?.kind ?? null,
    null,
    '12荷は4人家族の3日分なので物流警告を出さない',
  );
}

console.log('food delivery/save focused tests: PASS');
