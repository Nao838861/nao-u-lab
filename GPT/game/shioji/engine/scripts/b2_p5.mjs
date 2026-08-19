import { readFileSync } from "node:fs";

import {
  FOODS,
  GOODS,
  companyCreditLimit,
  economicMaterialSnapshot,
} from "../src/econ.js";
import { runB2ExpansionScenario } from "../src/audit.js";
import { buildingById } from "../src/physical.js";
import { parseB2MapData } from "../../v004/src/b2_map.js";

const strategyId = process.argv[2] ?? "fishery";
const days = Number(process.argv[3] ?? 1800);
const compact = process.argv.includes("--compact");
if (!Number.isSafeInteger(days) || days <= 0) {
  throw new TypeError("days must be a positive safe integer");
}

const sourceUrl = new URL("../../design/map_b2/b2_map_data.json", import.meta.url);
const definition = parseB2MapData(JSON.parse(readFileSync(sourceUrl, "utf8")));
const startedAt = performance.now();
const result = runB2ExpansionScenario(definition, { strategyId, days });
const elapsedMs = performance.now() - startedAt;
const { economy, physical } = result.world.state;

const marketIds = [...new Set([
  "main",
  ...economy.households.map(household => household.marketId ?? "main"),
])];
const markets = Object.fromEntries(marketIds.map(marketId => {
  const households = economy.households.filter(
    household => (household.marketId ?? "main") === marketId,
  );
  const population = households.reduce((total, household) => total + household.members.length, 0);
  const pantryFood = households.reduce((total, household) => (
    total + FOODS.reduce((sum, goods) => sum + Math.max(0, household.pantry[goods] ?? 0), 0)
  ), 0);
  const publicFood = FOODS.reduce((total, goods) => (
    total
      + (economy.stalls[goods] ?? []).reduce((sum, stall) => (
        (stall.marketId ?? "main") === marketId ? sum + Math.max(0, stall.qty ?? 0) : sum
      ), 0)
      + Math.max(0, economy.marketStockM?.[marketId]?.[goods] ?? 0)
      + (marketId === "main" ? Math.max(0, economy.importStock?.[goods] ?? 0) : 0)
  ), 0);
  const levels = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map(level => [
    level,
    households.filter(household => household.lv === level).length,
  ]));
  const jobs = Object.fromEntries([...new Set(households.map(household => household.job))]
    .sort()
    .map(job => {
      const rows = households.filter(household => household.job === job);
      const rowPopulation = rows.reduce((total, household) => total + household.members.length, 0);
      return [job, {
        households: rows.length,
        population: rowPopulation,
        hungry30: rows.reduce((total, household) => (
          total + (household.hungerHist ?? []).slice(-30).filter(Boolean).length
        ), 0),
        foodDays: rows.reduce((total, household) => (
          total + FOODS.reduce((sum, goods) => sum + Math.max(0, household.pantry[goods] ?? 0), 0)
        ), 0) / Math.max(1, rowPopulation),
        purse: rows.reduce((total, household) => total + household.purse, 0),
        income30: rows.reduce((total, household) => total + household.income30, 0),
        averageLevel: rows.reduce((total, household) => total + household.lv, 0)
          / Math.max(1, rows.length),
        averageCondition: rows.reduce((total, household) => (
          total + (buildingById(physical, household.buildingId)?.condition ?? 100)
        ), 0) / Math.max(1, rows.length),
      }];
    }));
  const conditions = households.map(household => (
    buildingById(physical, household.buildingId)?.condition ?? 100
  ));
  const goods = Object.fromEntries(GOODS.map(goodsId => {
    const pantry = households.reduce(
      (total, household) => total + Math.max(0, household.pantry[goodsId] ?? 0),
      0,
    );
    const stalls = (economy.stalls[goodsId] ?? []).reduce((total, stall) => (
      (stall.marketId ?? "main") === marketId ? total + Math.max(0, stall.qty ?? 0) : total
    ), 0);
    const company = Math.max(0, economy.marketStockM?.[marketId]?.[goodsId] ?? 0)
      + (marketId === "main" ? Math.max(0, economy.importStock?.[goodsId] ?? 0) : 0);
    return [goodsId, { pantry, stalls, company, total: pantry + stalls + company }];
  }));
  const repair = {};
  for (const household of households) {
    const building = buildingById(physical, household.buildingId);
    for (const [goodsId, required] of Object.entries(building?.repairPlan?.required ?? {})) {
      const row = repair[goodsId] ??= { required: 0, stocked: 0 };
      row.required += required;
      row.stocked += Math.max(0, building.inventory?.repair?.[goodsId] ?? 0);
    }
  }
  return [marketId, {
    households: households.length,
    population,
    hungry30: households.reduce((total, household) => (
      total + (household.hungerHist ?? []).slice(-30).filter(Boolean).length
    ), 0),
    foodDays: (pantryFood + publicFood) / Math.max(1, population),
    purse: households.reduce((total, household) => total + household.purse, 0),
    income30: households.reduce((total, household) => total + household.income30, 0),
    levels,
    jobs,
    goods,
    repair,
    conditionAverage: conditions.length > 0
      ? conditions.reduce((total, value) => total + value, 0) / conditions.length
      : null,
  }];
}));

const hungryHouseholds = economy.households
  .map(household => ({
    id: household.id,
    marketId: household.marketId ?? "main",
    job: household.job,
    members: household.members.length,
    level: household.lv,
    hungry30: (household.hungerHist ?? []).slice(-30).filter(Boolean).length,
    food: Object.fromEntries(FOODS.map(goods => [goods, household.pantry[goods] ?? 0])),
    purse: household.purse,
    income30: household.income30,
    state: household.state,
    condition: buildingById(physical, household.buildingId)?.condition ?? null,
  }))
  .filter(household => household.hungry30 > 0)
  .sort((left, right) => (
    right.hungry30 - left.hungry30
      || String(left.id).localeCompare(String(right.id), "en", { numeric: true })
  ));

const material = economicMaterialSnapshot(economy, physical);
const flows = Object.fromEntries(GOODS.map(goods => [goods, {
  prod: economy.materialFlows[goods]?.prod ?? 0,
  cons: economy.materialFlows[goods]?.cons ?? 0,
  imp: economy.materialFlows[goods]?.imp ?? 0,
  exp: economy.materialFlows[goods]?.exp ?? 0,
  inventory: material.inventory?.[goods] ?? 0,
  emaProd: economy.f30[goods]?.prod ?? 0,
  emaCons: economy.f30[goods]?.cons ?? 0,
}]));

function ledgerCategory(reason) {
  if (/徳政|貸し倒れ/.test(reason)) return "householdBadDebt";
  if (reason === "会社債務の月利") return "interest";
  if (/固定給/.test(reason)) return "caravanWages";
  if (/圏内集荷|を仕入れ$/.test(reason)) return "caravanProcurement";
  if (/隊商在庫.+小売/.test(reason)) return "caravanRetail";
  if (/支度金|建築費|沿岸海運への投資/.test(reason)) return "development";
  if (/木の荷車.+購入/.test(reason)) return "carts";
  if (/本土仕入/.test(reason)) return "imports";
  if (/本土売上|本国注文へ.+出荷/.test(reason)) return "exports";
  if (/市場取引の手数料/.test(reason)) return "marketFees";
  if (/渡航費/.test(reason)) return "immigration";
  return "other";
}

const ledgerCategories = {};
for (const [reason, amount] of Object.entries(economy.company.ledgerByReason ?? {})) {
  const category = ledgerCategory(reason);
  ledgerCategories[category] = (ledgerCategories[category] ?? 0) + amount;
}
const topLedgerReasons = Object.entries(economy.company.ledgerByReason ?? {})
  .sort((left, right) => Math.abs(right[1]) - Math.abs(left[1]))
  .slice(0, 30)
  .map(([reason, amount]) => ({ reason, amount }));

const output = {
  strategyId,
  days,
  elapsedMs,
  company: {
    start: result.companyStart,
    end: result.companyEnd,
    creditLimit: companyCreditLimit(economy, { day: days }),
    bankruptcyDay: result.bankruptcyDay,
    orderRevenue: result.orderRevenue,
    regularExportRevenue: result.regularExportRevenue,
    ledgerIncome: economy.company.ledgerIncome,
    ledgerExpense: economy.company.ledgerExpense,
    ledgerCategories,
    topLedgerReasons,
  },
  population: result.population,
  famine: result.famine,
  medianLevel: result.medianLevel,
  highLevelHouseholds: result.highLevelHouseholds,
  markets,
  hungryHouseholds,
  yearly: result.yearly,
  monthly: result.monthly,
  routes: result.routes,
  developmentImports: result.developmentImports,
  exported: result.exported,
  flows,
};

console.log(JSON.stringify(compact ? {
  strategyId: output.strategyId,
  days: output.days,
  elapsedMs: output.elapsedMs,
  company: output.company,
  population: output.population,
  famine: output.famine,
  medianLevel: output.medianLevel,
  highLevelHouseholds: output.highLevelHouseholds,
  yearly: output.yearly,
  routes: output.routes,
  markets: Object.fromEntries(Object.entries(output.markets).map(([id, market]) => [id, {
    households: market.households,
    population: market.population,
    hungry30: market.hungry30,
    foodDays: market.foodDays,
    purse: market.purse,
    income30: market.income30,
    levels: market.levels,
    conditionAverage: market.conditionAverage,
    repair: market.repair,
  }])),
  exported: output.exported,
  developmentImports: output.developmentImports,
} : output, null, 2));
