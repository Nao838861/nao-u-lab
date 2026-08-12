import { buildingById, pathLen } from "./physical.js?v=v004.49.0-economy-recovery";

const DEFAULT_HYSTERESIS = 0.12;
const EPSILON = 1e-9;

function finiteDistance(physical, from, to) {
  if (!from || !to) return Infinity;
  return pathLen(physical, from, to, "walk");
}

function nearestMarket(physical, markets, position, previousId, hysteresis) {
  const candidates = markets
    .map((market) => ({
      market,
      distance: finiteDistance(physical, position, market.entrance),
    }))
    .filter((row) => Number.isFinite(row.distance))
    .sort((left, right) => left.distance - right.distance || left.market.id.localeCompare(right.market.id));
  const nearest = candidates[0];
  if (!nearest) return { marketId: null, distance: Infinity };
  const previous = candidates.find((row) => row.market.id === previousId);
  if (previous && previous.distance <= nearest.distance * (1 + hysteresis) + EPSILON) {
    return { marketId: previous.market.id, distance: previous.distance };
  }
  return { marketId: nearest.market.id, distance: nearest.distance };
}

export function normalizeMarketNetwork(network, fallback = null) {
  const raw = Array.isArray(network) ? { markets: network } : (network ?? {});
  const markets = (raw.markets ?? (fallback ? [fallback] : []))
    .map((market, index) => ({
      id: String(market.id ?? (index === 0 ? "main" : `market-${index + 1}`)),
      name: String(market.name ?? (index === 0 ? "本市場" : `市場 ${index + 1}`)),
      entrance: { x: Math.round(market.entrance?.x ?? market.x), y: Math.round(market.entrance?.y ?? market.y) },
      buildingId: market.buildingId ?? null,
      portId: market.portId ?? null,
    }))
    .filter((market) => Number.isFinite(market.entrance.x) && Number.isFinite(market.entrance.y));
  const unique = new Map();
  for (const market of markets) if (!unique.has(market.id)) unique.set(market.id, market);
  return {
    version: 1,
    hysteresis: Number.isFinite(raw.hysteresis) ? Math.max(0, raw.hysteresis) : DEFAULT_HYSTERESIS,
    markets: [...unique.values()],
    assignments: { ...(raw.assignments ?? {}) },
    marketStates: structuredClone(raw.marketStates ?? {}),
    tradeReceipts: Array.isArray(raw.tradeReceipts) ? structuredClone(raw.tradeReceipts) : [],
    nextTradeId: Number.isSafeInteger(raw.nextTradeId) ? raw.nextTradeId : 1,
  };
}

export function createMarketNetwork({ markets = [], fallback = null, hysteresis = DEFAULT_HYSTERESIS } = {}) {
  return normalizeMarketNetwork({ markets, hysteresis }, fallback);
}

export function assignMarketNetwork(physical, economy, network) {
  const normalized = normalizeMarketNetwork(network, economy?.market ?? null);
  for (const market of normalized.markets) {
    const recorded = buildingById(physical, market.buildingId);
    const building = recorded ?? (physical.buildings ?? []).find((candidate) => (
      candidate.type === "market"
      && candidate.entrance?.x === market.entrance.x
      && candidate.entrance?.y === market.entrance.y
    ));
    if (!building) continue;
    building.marketId = market.id;
    market.buildingId = building.id;
  }
  const assignments = { ...normalized.assignments };
  const assignmentRows = [];
  const assign = (id, position, previousId = assignments[id]) => {
    const result = nearestMarket(
      physical,
      normalized.markets,
      position,
      previousId,
      normalized.hysteresis,
    );
    assignments[id] = result.marketId;
    assignmentRows.push({ id, marketId: result.marketId, distance: result.distance });
    return result;
  };
  for (const building of physical.buildings ?? []) {
    if (building.type === "market" || building.type === "warehouse" || building.type === "port") continue;
    assign(`building:${building.id}`, building.entrance ?? building);
  }
  for (const household of economy?.households ?? []) {
    const building = buildingById(physical, household.buildingId);
    const assignmentId = `household:${household.id}`;
    const activeMarket = household.marketCarrier?.marketId
      ? normalized.markets.find((market) => market.id === household.marketCarrier.marketId)
      : null;
    const result = activeMarket
      ? {
        marketId: activeMarket.id,
        distance: finiteDistance(
          physical,
          building?.entrance ?? household,
          activeMarket.entrance,
        ),
      }
      : assign(assignmentId, building?.entrance ?? household, household.marketId);
    if (activeMarket) {
      assignments[assignmentId] = result.marketId;
      assignmentRows.push({ id: assignmentId, ...result });
    }
    const market = normalized.markets.find((candidate) => candidate.id === result.marketId) ?? null;
    household.marketId = result.marketId;
    household.marketDistance = result.distance;
    household.marketEntrance = market ? { ...market.entrance } : null;
    household.marketBuildingId = market?.buildingId ?? null;
  }
  normalized.assignments = assignments;
  normalized.assignmentRows = assignmentRows;
  return normalized;
}

function marketState(network, marketId) {
  const current = network.marketStates[marketId] ?? {
    stock: {},
    prices: {},
    buyback: {},
    demand: {},
  };
  network.marketStates[marketId] = current;
  return current;
}

export function marketNetworkSummary(physical, economy, network) {
  const assigned = assignMarketNetwork(physical, economy, network);
  const summaries = assigned.markets.map((market) => {
    const state = marketState(assigned, market.id);
    const rows = assigned.assignmentRows.filter((row) => row.marketId === market.id);
    const households = rows.filter((row) => row.id.startsWith("household:"));
    const buildings = rows.filter((row) => row.id.startsWith("building:"));
    return {
      id: market.id,
      name: market.name,
      entrance: { ...market.entrance },
      households: households.length,
      buildings: buildings.length,
      averageDistance: rows.length
        ? rows.reduce((sum, row) => sum + (Number.isFinite(row.distance) ? row.distance : 0), 0) / rows.length
        : 0,
      stock: { ...state.stock },
      prices: { ...state.prices },
      buyback: { ...state.buyback },
      demand: { ...state.demand },
    };
  });
  assigned.summary = summaries;
  return assigned;
}

export function quoteMarketTrade(network, {
  fromMarketId,
  toMarketId,
  goods,
  quantity,
  unitPrice = null,
  transportTicks = 0,
  capacity = Infinity,
  transportCostPerTick = 0,
} = {}) {
  const qty = Math.max(0, Math.min(Number(quantity) || 0, Number(capacity) || 0));
  const from = network.marketStates?.[fromMarketId];
  const to = network.marketStates?.[toMarketId];
  if (!from || !to || fromMarketId === toMarketId || qty <= EPSILON) {
    return { ok: false, reason: "invalid_route", quantity: 0 };
  }
  const available = Number(from.stock?.[goods] ?? 0);
  const buyPrice = Number.isFinite(unitPrice) ? unitPrice : Number(from.prices?.[goods] ?? 0);
  const sellPrice = Number(to.buyback?.[goods] ?? to.prices?.[goods] ?? 0);
  const actualQty = Math.min(qty, available);
  const purchase = actualQty * buyPrice;
  const revenue = actualQty * sellPrice;
  const transportCost = Math.max(0, transportTicks) * Math.max(0, transportCostPerTick);
  return {
    ok: actualQty > EPSILON && Number.isFinite(buyPrice) && Number.isFinite(sellPrice),
    fromMarketId,
    toMarketId,
    goods,
    quantity: actualQty,
    buyPrice,
    sellPrice,
    purchase,
    revenue,
    transportTicks: Math.max(0, transportTicks),
    transportCost,
    profit: revenue - purchase - transportCost,
  };
}

export function executeMarketTrade(network, quote, { day = 0 } = {}) {
  if (!quote?.ok) return { ok: false, reason: quote?.reason ?? "invalid_quote" };
  const from = network.marketStates[quote.fromMarketId];
  const to = network.marketStates[quote.toMarketId];
  from.stock[quote.goods] = Math.max(0, (from.stock[quote.goods] ?? 0) - quote.quantity);
  to.stock[quote.goods] = (to.stock[quote.goods] ?? 0) + quote.quantity;
  const receipt = {
    id: network.nextTradeId++,
    day,
    ...quote,
  };
  network.tradeReceipts.push(receipt);
  if (network.tradeReceipts.length > 128) network.tradeReceipts.splice(0, network.tradeReceipts.length - 128);
  return { ok: true, receipt };
}
