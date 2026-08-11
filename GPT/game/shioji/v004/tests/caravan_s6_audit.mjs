import { createEngineController } from '../src/engine_bridge.js';

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

const controller = createEngineController({ seed: SEED, mode: 'caravan' });
const initial = controller.saveState();
const configured = controller.operate({
  type: 'set_caravan_route',
  baseBuildingId: initial.caravanSlice.innBuildingId,
  destMarketId: initial.caravanSlice.fisheryMarketId,
  goodsOut: ['wheat'],
  goodsBack: ['fish'],
  intervalDays: INTERVAL_DAYS,
});
if (!configured.ok) throw new Error(`路線を設定できません: ${configured.reason}`);

const rows = [];
let fiscalProfit = 0;
for (let month = 1; month <= 12; month += 1) {
  controller.advanceTicks(30 * 30);
  const state = controller.saveState();
  const route = controller.readModel().caravans[0];
  const accounting = route.accounting.rows.find(row => row.month === month - 1)
    ?? route.accounting.current;
  fiscalProfit += accounting.profit;
  rows.push({
    month,
    day: month * 30,
    trips: route.completedTrips,
    state: route.state,
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
  });
}

const start = fisherySnapshot(initial);
console.log(`# 隊商S6 一年実測（seed ${SEED}・${INTERVAL_DAYS}日便）`);
console.log('');
console.log('| 月 | 累計便 | 売上 | 仕入 | 固定給 | 荷車 | 月損益 | 年累計 | 漁郷食料 | 漁郷財布 | 空腹世帯 |');
console.log('|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const row of rows) {
  console.log(`| ${row.month} | ${row.trips} | ${row.sales} | ${row.procurement} | ${row.wages} | ${row.cartCosts} | ${row.profit} | ${row.fiscalProfit} | ${row.fishery.totalFood} | ${row.fishery.purse} | ${row.fishery.hungryHouseholds} |`);
}
const last = rows.at(-1);
const finalState = controller.saveState();
const carter = finalState.economy.households.find(
  household => household.buildingId === initial.caravanSlice.innBuildingId,
);
console.log('');
console.log(`漁郷の開始時食料 ${rounded(start.totalFood)}荷・人口${start.population}人。`);
console.log(`会社の木荷車は一年で${last.carts.companyPurchased}台購入、${last.carts.companyBroken}台全損。`);
console.log(`隊商宿世帯の作業道具は木を${carter.workToolsAcquired.wood}組使用開始し、${carter.workToolsBroken}組が摩耗。年末は${carter.workTool ? `${carter.workTool.kind === 'iron' ? '鉄' : '木'}の道具・残り${rounded(carter.workTool.durability)}日` : '素手'}。`);
