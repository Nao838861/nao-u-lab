import { createEngineController } from '../src/engine_bridge.js';
import { assertMoneyConservation } from '../../engine/src/econ.js';

const FOODS = ['fish', 'veg', 'wheat', 'pres', 'pick', 'meat'];
const SEED = 11;
const INTERVAL_DAYS = 20;

function fisherySnapshot(state) {
  const { economy } = state;
  const households = economy.households.filter(household => household.marketId === 'fishery');
  const pantry = households.reduce((total, household) => (
    total + FOODS.reduce((food, goods) => food + (household.pantry[goods] ?? 0), 0)
  ), 0);
  const stalls = FOODS.reduce((total, goods) => (
    total + economy.stalls[goods]
      .filter(stall => (stall.marketId ?? 'main') === 'fishery')
      .reduce((goodsTotal, stall) => goodsTotal + stall.qty, 0)
  ), 0);
  const market = FOODS.reduce(
    (total, goods) => total + (economy.marketStockM?.fishery?.[goods] ?? 0),
    0,
  );
  return {
    population: households.reduce((total, household) => total + household.members.length, 0),
    purse: households.reduce((total, household) => total + household.purse, 0),
    pantry,
    stalls,
    market,
    totalFood: pantry + stalls + market,
    hungryHouseholds: households.filter(household => (household.hungerRun ?? 0) > 0).length,
  };
}

function rounded(value) {
  return Number((value ?? 0).toFixed(1));
}

function audit(label, goodsOut, goodsBack) {
  const controller = createEngineController({ seed: SEED, mode: 'caravan' });
  const initial = controller.saveState();
  const configured = controller.operate({
    type: 'set_caravan_route',
    baseBuildingId: initial.caravanSlice.innBuildingId,
    destMarketId: initial.caravanSlice.fisheryMarketId,
    goodsOut,
    goodsBack,
    intervalDays: INTERVAL_DAYS,
  });
  if (!configured.ok) throw new Error(`路線を設定できません: ${configured.reason}`);
  const rows = [];
  let fiscalProfit = 0;
  for (let month = 1; month <= 12; month += 1) {
    controller.advanceTicks(30 * 30);
    const state = controller.saveState();
    assertMoneyConservation(state.economy);
    const route = controller.readModel().caravans[0];
    const accounting = route.accounting.rows.find(row => row.month === month - 1)
      ?? route.accounting.current;
    fiscalProfit += accounting.profit;
    rows.push({
      month,
      trips: route.completedTrips,
      sales: rounded(accounting.sales),
      procurement: rounded(accounting.procurement),
      wages: rounded(accounting.wages),
      cartCosts: rounded(accounting.cartCosts),
      profit: rounded(accounting.profit),
      fiscalProfit: rounded(fiscalProfit),
      fishery: Object.fromEntries(
        Object.entries(fisherySnapshot(state)).map(([key, value]) => [key, rounded(value)]),
      ),
      carts: { ...state.economy.cartStats },
      unsold: route.diagnosis.unsold.reduce((total, row) => total + row.qty, 0),
    });
  }
  return { label, goodsOut, goodsBack, initial, finalState: controller.saveState(), rows };
}

const audits = [
  audit('旧単品', ['wheat'], ['fish']),
  audit('複数品目', ['wheat', 'char'], ['fish', 'salt']),
];

console.log(`# 隊商S6 一年比較実測（seed ${SEED}・${INTERVAL_DAYS}日便）`);
for (const result of audits) {
  console.log('');
  console.log(`## ${result.label}（行き ${result.goodsOut.join('・')}／帰り ${result.goodsBack.join('・')}）`);
  console.log('| 月 | 累計便 | 売上 | 仕入 | 固定給 | 荷車 | 月損益 | 年累計 | 漁郷食料 | 漁郷財布 | 空腹 | 売れ残り |');
  console.log('|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const row of result.rows) {
    console.log(`| ${row.month} | ${row.trips} | ${row.sales} | ${row.procurement} | ${row.wages} | ${row.cartCosts} | ${row.profit} | ${row.fiscalProfit} | ${row.fishery.totalFood} | ${row.fishery.purse} | ${row.fishery.hungryHouseholds} | ${rounded(row.unsold)} |`);
  }
  const last = result.rows.at(-1);
  const start = fisherySnapshot(result.initial);
  const carter = result.finalState.economy.households.find(
    household => household.buildingId === result.initial.caravanSlice.innBuildingId,
  );
  console.log(`漁郷開始食料${rounded(start.totalFood)}荷・年末${last.fishery.totalFood}荷。荷車購入${last.carts.companyPurchased}台・全損${last.carts.companyBroken}台。`);
  console.log(`隊商宿の木道具は${carter.workToolsAcquired.wood}組使用開始、${carter.workToolsBroken}組摩耗。貨幣保存: 合格。`);
}
