// 隊商路線 — 定期便・実移動・実費・月次収支（正本: v004/WORLD_DESIGN_DECISIONS_20260810.md Q10-Q29）
// 設計は人間、運行は自動。便は物理実体として道路上を移動し、両端の市場の実需給とだけ売買する。
//
// 【状態: Mirの下書き・未配線・未テスト】WORK_ORDER_20260810_CARAVAN_SLICE.md の叩き台。
// world.js への配線・荷車の実調達・拠点建物との接続は未実装。設計判断はWORK_ORDERと正本に従うこと。
import { findTravelPath } from "./physical.js";
import {
  P,
  findHousehold,
  postCompanyLedger,
  recordEconomyEvent,
} from "./econ.js";

export const CARAVAN_CART_CAPACITY = 8;
export const CARAVAN_CART_WEAR_PER_TILE = 0.02;
const CART_SPEED_TILES_PER_TICK = 1 / 0.6;

function calendarMonthIndex(day) {
  return Math.floor(Math.max(0, day - 1) / 30);
}

export function createCaravanRoute(economy, physical, {
  id = null,
  name = null,
  baseMarketId,
  destMarketId,
  baseEntrance,
  destEntrance,
  goodsOut = [],
  goodsBack = [],
  intervalDays = 3,
  wage = 3,
  slots = 1,
  crewHouseholdIds = [],
  carts = 1,
} = {}) {
  if (!baseMarketId || !destMarketId || baseMarketId === destMarketId) {
    throw new Error("路線には異なる2つの市場が必要です");
  }
  const path = findTravelPath(physical, baseEntrance, destEntrance, "cart");
  if (!path) return { ok: false, reason: "no_cart_road", route: null };
  economy.caravans ??= [];
  if (economy.caravans.some((row) => row.destMarketId === destMarketId && row.state !== "disbanded")) {
    return { ok: false, reason: "dest_taken", route: null };
  }
  const route = {
    id: id ?? `caravan${(economy.nextCaravanId ??= 1)}`,
    name: name ?? `隊商${economy.nextCaravanId}`,
    baseMarketId,
    destMarketId,
    baseEntrance: { ...baseEntrance },
    destEntrance: { ...destEntrance },
    goodsOut: [...goodsOut],
    goodsBack: [...goodsBack],
    intervalDays: Math.max(1, Math.round(intervalDays)),
    wage,
    slots: Math.max(1, Math.round(slots)),
    crewHouseholdIds: [...crewHouseholdIds],
    carts: Array.from({ length: Math.max(1, carts) }, () => ({
      durability: P.CART_DURABILITY ?? 240,
      maxDurability: P.CART_DURABILITY ?? 240,
    })),
    state: "idle",
    pathTicks: path.cost,
    progress: 0,
    cargo: {},
    cargoCost: 0,
    nextDepartDay: null,
    currentTrip: null,
    recentTrips: [],
    monthly: {},
  };
  economy.nextCaravanId += 1;
  economy.caravans.push(route);
  return { ok: true, route };
}

export function caravanCrewCount(route) {
  return Math.min(route.slots, route.crewHouseholdIds.length > 0
    ? route.crewHouseholdIds.length : 0);
}

function workingCarts(route) {
  return route.caravanCartless ? 0 : route.carts.filter((cart) => cart.durability > 0).length;
}

export function caravanCapacity(route) {
  return Math.min(caravanCrewCount(route), workingCarts(route)) * CARAVAN_CART_CAPACITY;
}

function monthlyRow(route, day) {
  const month = calendarMonthIndex(day);
  route.monthly[month] ??= { sales: 0, procurement: 0, wages: 0, wear: 0 };
  return route.monthly[month];
}

// 市場の屋台から安い順に実買い付け(代金は売り手世帯へ)。会社買上げと同じ会計。
function caravanBuyAtMarket(economy, route, marketId, goodsList, capacity, { day }) {
  let remainingCapacity = capacity;
  let spent = 0;
  const bought = {};
  for (const goods of goodsList) {
    if (remainingCapacity <= 1e-9) break;
    const stalls = economy.stalls[goods]
      .filter((stall) => (stall.marketId ?? "main") === marketId && stall.qty > 1e-9)
      .sort((a, b) => a.price - b.price);
    for (const stall of stalls) {
      if (remainingCapacity <= 1e-9) break;
      const seller = findHousehold(economy, stall.householdId);
      if (!seller) continue;
      const qty = Math.min(stall.qty, remainingCapacity);
      const payment = qty * stall.price;
      stall.qty -= qty;
      seller.purse += payment;
      seller.income30 += payment;
      postCompanyLedger(economy.company, {
        day,
        amount: -payment,
        reason: `${route.name}が${goods}を仕入れ`,
      });
      spent += payment;
      bought[goods] = (bought[goods] ?? 0) + qty;
      remainingCapacity -= qty;
    }
  }
  return { bought, spent };
}

function unloadToMarket(economy, route, marketId, { day }) {
  const table = (economy.marketStockM ??= {})[marketId] ??= {};
  const costTable = (economy.marketStockCostM ??= {})[marketId] ??= {};
  const totalQty = Object.values(route.cargo).reduce((a, b) => a + b, 0);
  for (const [goods, qty] of Object.entries(route.cargo)) {
    if (qty <= 1e-9) continue;
    table[goods] = (table[goods] ?? 0) + qty;
    costTable[goods] = (costTable[goods] ?? 0)
      + route.cargoCost * (qty / Math.max(1e-9, totalQty));
  }
  const summary = Object.entries(route.cargo)
    .filter(([, qty]) => qty > 1e-9)
    .map(([goods, qty]) => `${goods}${qty.toFixed(0)}荷`)
    .join("・");
  if (summary) recordEconomyEvent(economy, day, `${route.name}が着いた——${summary}を降ろした`);
  route.cargo = {};
  route.cargoCost = 0;
}

function payTripCosts(economy, route, { day }) {
  const crew = caravanCrewCount(route);
  const wages = route.wage * crew;
  if (wages > 0) {
    for (const householdId of route.crewHouseholdIds.slice(0, crew)) {
      const household = findHousehold(economy, householdId);
      if (!household) continue;
      const share = wages / crew;
      household.purse += share;
      household.income30 += share;
    }
    postCompanyLedger(economy.company, {
      day,
      amount: -wages,
      reason: `${route.name}の雇い賃`,
    });
  }
  const wearTiles = route.pathTicks * CART_SPEED_TILES_PER_TICK * 0.6;
  let wear = 0;
  for (const cart of route.carts) {
    if (cart.durability <= 0) continue;
    const used = Math.min(cart.durability, wearTiles * CARAVAN_CART_WEAR_PER_TILE);
    cart.durability -= used;
    wear += used;
    if (cart.durability <= 0) {
      recordEconomyEvent(economy, day, `${route.name}の荷車が壊れた——新しい荷車が要る`);
    }
  }
  return { wages, wear };
}

// 1日1回(日始め)の運行判断と、tick単位の移動を分ける。
export function stepCaravanDay(economy, physical, { day }) {
  for (const route of economy.caravans ?? []) {
    if (route.state === "disbanded") continue;
    // 月次: 到着地でのLSTOCK売上を自分の月次へ回収
    const sales = economy.lstockSalesM?.[route.destMarketId] ?? 0;
    if (sales > 0) {
      monthlyRow(route, day).sales += sales;
      economy.lstockSalesM[route.destMarketId] = 0;
    }
    const backSales = route.goodsBack.length > 0 ? economy.lstockSalesM?.[route.baseMarketId] ?? 0 : 0;
    if (backSales > 0) {
      monthlyRow(route, day).sales += backSales;
      economy.lstockSalesM[route.baseMarketId] = 0;
    }
    if (route.state === "idle") {
      route.nextDepartDay ??= day;
      if (day < route.nextDepartDay) continue;
      if (caravanCapacity(route) <= 0) continue;
      const { bought, spent } = caravanBuyAtMarket(
        economy, route, route.baseMarketId, route.goodsOut, caravanCapacity(route), { day },
      );
      route.cargo = bought;
      route.cargoCost = spent;
      route.progress = 0;
      route.state = "outbound";
      route.currentTrip = { departedDay: day, procurement: spent };
      monthlyRow(route, day).procurement += spent;
    }
  }
}

export function stepCaravanTick(economy, physical, { day }) {
  for (const route of economy.caravans ?? []) {
    if (route.state !== "outbound" && route.state !== "returning") continue;
    route.progress += 1;
    if (route.progress < route.pathTicks) continue;
    if (route.state === "outbound") {
      unloadToMarket(economy, route, route.destMarketId, { day });
      const capacity = caravanCapacity(route);
      if (route.goodsBack.length > 0 && capacity > 0) {
        const { bought, spent } = caravanBuyAtMarket(
          economy, route, route.destMarketId, route.goodsBack, capacity, { day },
        );
        route.cargo = bought;
        route.cargoCost = spent;
        monthlyRow(route, day).procurement += spent;
        route.currentTrip.procurement += spent;
      }
      route.progress = 0;
      route.state = "returning";
    } else {
      unloadToMarket(economy, route, route.baseMarketId, { day });
      const { wages, wear } = payTripCosts(economy, route, { day });
      const row = monthlyRow(route, day);
      row.wages += wages;
      row.wear += wear;
      route.recentTrips.push({ ...route.currentTrip, returnedDay: day, wages, wear });
      if (route.recentTrips.length > 12) route.recentTrips.shift();
      route.currentTrip = null;
      route.state = "idle";
      route.nextDepartDay = day + route.intervalDays;
    }
  }
}

export function caravanMonthlyLedger(route, { months = 12 } = {}) {
  return Object.entries(route.monthly)
    .map(([month, row]) => ({
      month: Number(month),
      ...row,
      profit: row.sales - row.procurement - row.wages,
    }))
    .sort((a, b) => a.month - b.month)
    .slice(-months);
}
