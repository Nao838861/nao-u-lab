import { JOB_LABELS, SECTION_LABELS } from './config.js';
import { MAINLAND_AID, companyStockReleasePrice, productionCost } from './engine_bridge.js';
import { analyzeRoadConnections } from './placement.js';
import { buildingAppearance, pileVisual, trailVisual } from './visuals.js';

const INVENTORY_SECTIONS = Object.freeze([
  'input', 'output', 'storage', 'construction', 'inbound', 'outbound', 'pickup',
]);

const CONVERSION_JOBS = Object.freeze({
  woodshop: Object.freeze({ goods: 'tools', inputGoods: 'log' }),
  charburner: Object.freeze({ goods: 'char', inputGoods: 'log' }),
  saltworks: Object.freeze({ goods: 'salt', inputGoods: 'char' }),
});

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function shelfRows(building) {
  const rows = [];
  for (const section of INVENTORY_SECTIONS) {
    const amounts = building.inventory?.[section] ?? {};
    const capacities = building.caps?.[section] ?? {};
    const goods = new Set([...Object.keys(amounts), ...Object.keys(capacities)]);
    for (const goodsId of goods) {
      rows.push({
        section,
        goods: goodsId,
        amount: amounts[goodsId] ?? 0,
        capacity: capacities[goodsId] ?? 0,
        visual: pileVisual(amounts[goodsId] ?? 0, goodsId),
      });
    }
  }
  return rows;
}

function pantryRows(household) {
  return Object.entries(household.pantry ?? {}).map(([goods, amount]) => ({
    section: 'pantry', goods, amount, capacity: null, visual: pileVisual(amount, goods),
  }));
}

function groupedStock(rows) {
  const groups = new Map();
  for (const row of rows.filter(item => item.visual.amount > 1e-9)) {
    if (!groups.has(row.section)) groups.set(row.section, []);
    groups.get(row.section).push(row);
  }
  return [...groups.entries()].map(([section, items]) => {
    const totalAmount = items.reduce((total, item) => total + item.visual.amount, 0);
    const primary = [...items].sort((left, right) => right.visual.amount - left.visual.amount)[0];
    return {
      section,
      items,
      goods: primary.goods,
      totalAmount,
      visual: pileVisual(totalAmount, primary.goods),
    };
  });
}

function stockManifest(
  buildings, households, stalls, marketBuilding, companyStock = {}, companyStockCost = {},
) {
  const rows = [];
  for (const building of buildings) {
    for (const shelf of building.shelves) {
      if (shelf.amount <= 1e-9) continue;
      rows.push({
        source: 'building', sourceId: building.id,
        sourceLabel: `${JOB_LABELS[building.type] ?? building.type} #${building.id}・${SECTION_LABELS[shelf.section] ?? shelf.section}`,
        x: building.x, y: building.y,
        section: shelf.section, goods: shelf.goods, amount: shelf.amount,
      });
    }
  }
  for (const household of households) {
    for (const pantry of household.pantry) {
      if (pantry.amount <= 1e-9) continue;
      const family = household.familyName ? `${household.familyName}家` : `世帯#${household.id}`;
      rows.push({
        source: 'pantry', sourceId: household.id,
        sourceLabel: `${family} #${household.id}（${JOB_LABELS[household.job] ?? household.job}）`,
        x: household.homeX, y: household.homeY,
        section: 'pantry', goods: pantry.goods, amount: pantry.amount,
      });
    }
  }
  const householdById = new Map(households.map(household => [household.id, household]));
  for (const stall of stalls) {
    if (stall.qty <= 1e-9) continue;
    const household = householdById.get(stall.householdId);
    const family = household?.familyName ? `${household.familyName}家` : `世帯#${stall.householdId}`;
    rows.push({
      source: 'stall', sourceId: stall.householdId,
      sourceLabel: `市場の${family} #${stall.householdId}屋台`,
      x: marketBuilding?.x ?? 0, y: marketBuilding?.y ?? 0,
      section: 'stall', goods: stall.goods, amount: stall.qty,
    });
  }
  const warehouse = buildings.find(building => building.roles?.includes('warehouse'));
  if (warehouse) {
    for (const [goods, amount] of Object.entries(companyStock)) {
      if (amount <= 1e-9) continue;
      rows.push({
        source: 'company', sourceId: warehouse.id,
        sourceLabel: `会社の蔵 #${warehouse.id}・保管`,
        x: warehouse.x, y: warehouse.y,
        section: 'companyStock', goods, amount,
        averageCost: (companyStockCost[goods] ?? 0) / amount,
      });
    }
  }
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.goods)) grouped.set(row.goods, []);
    grouped.get(row.goods).push(row);
  }
  const goods = [...grouped.entries()].map(([goodsId, locations]) => ({
    goods: goodsId,
    totalAmount: locations.reduce((total, location) => total + location.amount, 0),
    locations,
  })).sort((left, right) => right.totalAmount - left.totalAmount || left.goods.localeCompare(right.goods));
  return { rows, goods };
}

function buildingEndpoint(buildingById, endpoint) {
  const building = buildingById.get(endpoint?.buildingId);
  if (!building) return endpoint ? { ...endpoint, label: endpoint.buildingId } : null;
  const section = endpoint.section ? ` / ${SECTION_LABELS[endpoint.section] ?? endpoint.section}` : '';
  return {
    ...endpoint,
    type: building.type,
    x: building.entrance?.x ?? building.x + building.width / 2,
    y: building.entrance?.y ?? building.y + building.height / 2,
    label: `${JOB_LABELS[building.type] ?? building.type}${section}`,
  };
}

function carrierRows(snapshot, buildings) {
  const buildingById = new Map(buildings.map(building => [building.id, building]));
  const hauls = snapshot.physical.haulJobs
    .filter(job => job.status !== 'completed' && job.carrier?.position)
    .map(job => ({
      id: `haul:${job.id}`,
      haulJobId: job.id,
      kind: job.carrier.mode === 'cart' ? 'cart' : 'walker',
      mode: job.carrier.mode,
      x: job.carrier.position.x,
      y: job.carrier.position.y,
      goods: job.goods,
      amount: job.qty,
      people: job.carrier.people ?? 1,
      path: (job.carrier.path ?? []).map(point => ({ ...point })),
      from: buildingEndpoint(buildingById, job.from),
      to: buildingEndpoint(buildingById, job.to),
    }));
  const households = snapshot.economy.households.map(household => ({
    id: `household:${household.id}`,
    householdId: household.id,
    kind: 'household',
    x: household.px ?? household.x,
    y: household.py ?? household.y,
    state: household.state,
    job: household.job,
    members: household.members?.length ?? 0,
    goods: household.marketCarrier?.cargo?.goods ?? null,
    amount: household.marketCarrier?.cargo?.qty ?? 0,
    path: (household.marketCarrier?.path ?? []).map(point => ({ ...point })),
    from: { label: JOB_LABELS[household.job] ?? household.job, x: household.x, y: household.y },
    to: { label: household.state === 'toMarket' ? '市場' : '家', x: household.x, y: household.y },
  }));
  return [...hauls, ...households];
}

function portBerth(building, terrain, width, height) {
  const candidates = [
    { side: 'north', dx: 0, dy: -1, x: building.x + building.width / 2, y: building.y - 0.7 },
    { side: 'south', dx: 0, dy: 1, x: building.x + building.width / 2, y: building.y + building.height + 0.7 },
    { side: 'west', dx: -1, dy: 0, x: building.x - 0.7, y: building.y + building.height / 2 },
    { side: 'east', dx: 1, dy: 0, x: building.x + building.width + 0.7, y: building.y + building.height / 2 },
  ];
  const waterScore = candidate => {
    let score = 0;
    for (let offset = -1; offset <= 1; offset += 1) {
      for (let distance = 1; distance <= 3; distance += 1) {
        const edgeX = candidate.dx === 0
          ? Math.floor(building.x + building.width / 2 + offset)
          : Math.floor(candidate.x + candidate.dx * distance);
        const edgeY = candidate.dy === 0
          ? Math.floor(building.y + building.height / 2 + offset)
          : Math.floor(candidate.y + candidate.dy * distance);
        if (edgeX >= 0 && edgeX < width && edgeY >= 0 && edgeY < height
          && terrain[edgeY]?.[edgeX]?.kind === 'water') score += 1;
      }
    }
    return score;
  };
  const selected = candidates
    .map(candidate => ({ ...candidate, score: waterScore(candidate) }))
    .sort((left, right) => right.score - left.score)[0];
  return {
    side: selected.side,
    dock: { x: selected.x, y: selected.y },
    away: { x: selected.x + selected.dx * 4, y: selected.y + selected.dy * 4 },
  };
}

export function snapshotToViewModel(snapshot) {
  if (!snapshot?.physical || !snapshot?.economy) {
    throw new TypeError('full engine snapshot is required');
  }
  const householdById = new Map(snapshot.economy.households.map(household => [household.id, household]));
  const buildings = snapshot.physical.buildings.map(building => {
    const shelves = shelfRows(building);
    const owner = householdById.get(building.ownerHouseholdId);
    const roles = [...(building.roles ?? [])];
    const companyLogistics = roles.some(role => role === 'market' || role === 'warehouse');
    const companyStockShelves = roles.includes('warehouse')
      ? Object.entries(snapshot.economy.stock).flatMap(([goods, amount]) => amount > 1e-9 ? [{
        section: 'companyStock', goods, amount, capacity: null, visual: pileVisual(amount, goods),
      }] : [])
      : [];
    const row = {
      id: building.id,
      type: building.type,
      role: building.role,
      roles,
      x: building.x,
      y: building.y,
      width: building.w,
      height: building.h,
      entrance: building.entrance ? { ...building.entrance } : null,
      grade: building.grade ?? 0,
      fixed: Boolean(building.fixed),
      ownerHouseholdId: building.ownerHouseholdId,
      occupied: building.ownerHouseholdId !== null,
      vacant: !building.fixed && !companyLogistics && building.ownerHouseholdId === null,
      cultureLevel: owner?.lv ?? 0,
      shelves,
      shelfGroups: groupedStock([...shelves, ...companyStockShelves]),
      shelfAmount: shelves.reduce((total, row) => total + row.amount, 0),
    };
    return { ...row, appearance: buildingAppearance(row) };
  });
  const households = snapshot.economy.households.map(household => {
    const pantry = pantryRows(household);
    const pantryGroups = groupedStock(pantry);
    const hungerHistory = [...(household.hungerHist ?? [])];
    const satisfaction = household.satLast ? { ...household.satLast } : null;
    return {
      id: household.id,
      familyName: household.sur ?? '',
      memberNames: (household.members ?? []).map(member => member?.name ?? String(member)),
      job: household.job,
      x: household.px ?? household.x,
      y: household.py ?? household.y,
      homeX: household.x,
      homeY: household.y,
      members: household.members?.length ?? 0,
      cultureLevel: household.lv ?? 0,
      buildingId: household.buildingId,
      state: household.state,
      marketTripActive: Boolean(household.marketCarrier),
      marketTripTicks: household.marketTripTicks ?? 0,
      productionMultiplier: household.productionMultiplier ?? 1,
      tookMarketTripToday: Boolean(household.tookMarketTripToday),
      purse: Number.isFinite(household.purse) ? household.purse : null,
      recentIncome: Number.isFinite(household.incomeLog?.at(-1))
        ? household.incomeLog.at(-1) : (household.income30 ?? 0),
      satisfaction,
      satisfiedCount: satisfaction
        ? Object.values(satisfaction).filter(Boolean).length : null,
      satisfactionCount: satisfaction ? Object.keys(satisfaction).length : null,
      hungerDays: hungerHistory.reduce((total, hungry) => total + Number(Boolean(hungry)), 0),
      hungerWindow: hungerHistory.length,
      hungerRun: household.hungerRun ?? 0,
      walkingDistance: household.walk ?? 0,
      roadConnected: Boolean(household.road),
      marketTransactionTicks: household.marketTransactionTicks ?? 0,
      pantry,
      pantryStock: pantryGroups[0] ?? null,
    };
  });
  const stalls = Object.entries(snapshot.economy.stalls).flatMap(([goods, rows]) => (
    rows.map(stall => ({ goods, ...stall, visual: pileVisual(stall.qty, goods) }))
  ));
  const marketBuilding = buildings.find(building => building.type === 'market');
  const marketStallGroups = new Map();
  for (const stall of stalls.filter(row => row.visual.amount > 1e-9)) {
    if (!marketStallGroups.has(stall.householdId)) marketStallGroups.set(stall.householdId, []);
    marketStallGroups.get(stall.householdId).push(stall);
  }
  const marketStalls = [...marketStallGroups.entries()].map(([householdId, items], index) => ({
    id: `stall:${householdId}`,
    householdId,
    items,
    x: marketBuilding ? marketBuilding.x + 0.7 + (index % 4) * 1.05 : snapshot.economy.market.x,
    y: marketBuilding ? marketBuilding.y + 0.8 + (Math.floor(index / 4) % 4) * 1.0 : snapshot.economy.market.y,
    totalAmount: items.reduce((total, item) => total + item.visual.amount, 0),
  }));
  const manifest = stockManifest(
    buildings, households, stalls, marketBuilding,
    snapshot.economy.stock, snapshot.economy.stockCost,
  );
  const traffic = new Map(Object.entries(snapshot.economy.traffic ?? {}));
  for (const [key, value] of Object.entries(snapshot.physical.trails ?? {})) {
    if (value) traffic.set(key, Math.max(traffic.get(key) ?? 0, value === true ? 1 : value));
  }
  const trailRows = [...traffic.entries()]
    .map(([key, tread]) => ({ key, ...trailVisual(tread) }))
    .filter(row => row.stage > 0);
  const portCalls = snapshot.physical.portCalls.map(call => {
    const port = snapshot.physical.buildings.find(building => building.id === call.portBuildingId);
    const section = call.direction === 'export' ? 'outbound' : 'inbound';
    return {
      ...call,
      metadata: { ...(call.metadata ?? {}) },
      yardSection: section,
      yardAmount: port?.inventory?.[section]?.[call.goods] ?? 0,
    };
  });
  const portBuilding = buildings.find(building => building.type === 'port');
  const marketLowest = Object.fromEntries(Object.entries(snapshot.economy.stalls).map(([goods, rows]) => [
    goods,
    rows.filter(row => row.qty > 1e-9).reduce((lowest, row) => Math.min(lowest, row.price), Infinity),
  ]));
  const companyStockAverageCosts = Object.fromEntries(Object.entries(snapshot.economy.stock).map(([goods, qty]) => [
    goods,
    qty > 1e-9 ? (snapshot.economy.stockCost[goods] ?? 0) / qty : null,
  ]));
  const companyMarketStockAverageCosts = Object.fromEntries(Object.entries(snapshot.economy.marketStock).map(([goods, qty]) => [
    goods,
    qty > 1e-9 ? (snapshot.economy.marketStockCost[goods] ?? 0) / qty : null,
  ]));
  const companyReleasePrices = Object.fromEntries(Object.entries(snapshot.economy.marketStock).map(([goods, qty]) => [
    goods,
    qty > 1e-9 ? companyStockReleasePrice(snapshot.economy, goods, { market: true }) : null,
  ]));
  const conversionEconomics = snapshot.economy.households.flatMap(household => {
    const definition = CONVERSION_JOBS[household.job];
    if (!definition) return [];
    const building = snapshot.physical.buildings.find(candidate => candidate.id === household.buildingId);
    const cost = productionCost(
      snapshot.economy,
      snapshot.physical,
      household,
      definition.goods,
      { day: snapshot.day },
    );
    return [{
      householdId: household.id,
      buildingId: household.buildingId,
      job: household.job,
      goods: definition.goods,
      inputGoods: definition.inputGoods,
      inputAmount: building?.inventory?.input?.[definition.inputGoods] ?? 0,
      outputAmount: building?.inventory?.output?.[definition.goods] ?? 0,
      inputPrice: snapshot.economy.px[definition.inputGoods] ?? 0,
      cost,
      marketPrice: snapshot.economy.px[definition.goods] ?? 0,
      productionEma: snapshot.economy.f30?.[definition.goods]?.prod ?? 0,
      consumptionEma: snapshot.economy.f30?.[definition.goods]?.cons ?? 0,
    }];
  });
  const base = {
    day: snapshot.day,
    tick: snapshot.tick,
    seed: snapshot.seed,
    companyMoney: snapshot.economy.company.money,
    companyBankruptcyDay: snapshot.economy.goDay ?? null,
    population: households.reduce((total, household) => total + household.members, 0),
    width: snapshot.physical.width,
    height: snapshot.physical.height,
    terrain: snapshot.physical.terrain.map(row => row.map(tile => ({ ...tile }))),
    roadKeys: Object.keys(snapshot.physical.roads),
    trailRows,
    occupiedKeys: Object.keys(snapshot.physical.occupied),
    buildings,
    carriers: carrierRows(snapshot, buildings),
    households,
    stalls,
    marketStalls,
    stockLocations: manifest.rows,
    goodsManifest: manifest.goods,
    totalVisibleStock: buildings.reduce((total, building) => total + building.shelfAmount, 0)
      + households.reduce((total, household) => (
        total + household.pantry.reduce((sum, row) => sum + row.visual.amount, 0)
      ), 0)
      + stalls.reduce((total, stall) => total + stall.visual.amount, 0)
      + Object.values(snapshot.economy.stock).reduce((total, amount) => total + amount, 0),
    portCalls,
    portBerth: portBuilding
      ? portBerth(portBuilding, snapshot.physical.terrain, snapshot.physical.width, snapshot.physical.height)
      : null,
    economyMarket: { ...snapshot.economy.market },
    zones: snapshot.economy.zones.map(zone => ({ ...zone })),
    reservedBuildingSites: (snapshot.economy.reservedBuildingSites ?? []).map(site => ({ ...site })),
    roadWorksites: snapshot.physical.roadWorksites.map(site => ({ ...site })),
    companyLedger: snapshot.economy.company.ledger.map(row => ({ ...row })),
    marketPrices: { ...snapshot.economy.px },
    flowEma: Object.fromEntries(Object.entries(snapshot.economy.f30 ?? {}).map(([goods, flow]) => [
      goods, { ...flow },
    ])),
    imported: { ...snapshot.economy.imported },
    moneyOutBy: { ...snapshot.economy.outBy },
    companyStock: { ...snapshot.economy.stock },
    companyStockAverageCosts,
    companyMarketStock: { ...snapshot.economy.marketStock },
    companyMarketStockAverageCosts,
    companyReleasePrices,
    conversionEconomics,
    stockTargets: { ...snapshot.economy.stockTgt },
    mainlandAid: (() => {
      const requests = snapshot.economy.mainlandAid?.requests ?? 0;
      const refused = requests >= MAINLAND_AID.REFUSAL_AT;
      const nextQty = refused ? 0 : Math.round(MAINLAND_AID.BASE_WHEAT * (1 - MAINLAND_AID.DECAY * requests));
      return { requests, refused, nextQty };
    })(),
    orderOffer: snapshot.economy.orderOffer ? { ...snapshot.economy.orderOffer } : null,
    activeOrder: snapshot.economy.order ? { ...snapshot.economy.order } : null,
    marketLowest,
  };
  return deepFreeze({ ...base, roadConnection: analyzeRoadConnections(base) });
}

export { INVENTORY_SECTIONS };
