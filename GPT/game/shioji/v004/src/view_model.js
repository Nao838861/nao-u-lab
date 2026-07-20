import { JOB_LABELS, SECTION_LABELS } from './config.js';
import { MAINLAND_AID } from './engine_bridge.js';
import { analyzeRoadConnections } from './placement.js';
import { buildingAppearance, pileVisual, trailVisual } from './visuals.js';

const INVENTORY_SECTIONS = Object.freeze([
  'input', 'output', 'storage', 'construction', 'inbound', 'outbound', 'pickup',
]);

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
    const row = {
      id: building.id,
      type: building.type,
      role: building.role,
      roles: [...(building.roles ?? [])],
      x: building.x,
      y: building.y,
      width: building.w,
      height: building.h,
      entrance: building.entrance ? { ...building.entrance } : null,
      grade: building.grade ?? 0,
      fixed: Boolean(building.fixed),
      ownerHouseholdId: building.ownerHouseholdId,
      occupied: building.ownerHouseholdId !== null,
      vacant: !building.fixed && building.ownerHouseholdId === null,
      cultureLevel: owner?.lv ?? 0,
      shelves,
      shelfGroups: groupedStock(shelves),
      shelfAmount: shelves.reduce((total, row) => total + row.amount, 0),
    };
    return { ...row, appearance: buildingAppearance(row) };
  });
  const households = snapshot.economy.households.map(household => {
    const pantry = pantryRows(household);
    const pantryGroups = groupedStock(pantry);
    return {
      id: household.id,
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
  const base = {
    day: snapshot.day,
    tick: snapshot.tick,
    seed: snapshot.seed,
    companyMoney: snapshot.economy.company.money,
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
    totalVisibleStock: buildings.reduce((total, building) => total + building.shelfAmount, 0)
      + households.reduce((total, household) => (
        total + household.pantry.reduce((sum, row) => sum + row.visual.amount, 0)
      ), 0)
      + stalls.reduce((total, stall) => total + stall.visual.amount, 0),
    portCalls,
    portBerth: portBuilding
      ? portBerth(portBuilding, snapshot.physical.terrain, snapshot.physical.width, snapshot.physical.height)
      : null,
    economyMarket: { ...snapshot.economy.market },
    zones: snapshot.economy.zones.map(zone => ({ ...zone })),
    reservedBuildingSites: (snapshot.economy.reservedBuildingSites ?? []).map(site => ({ ...site })),
    roadWorksites: snapshot.physical.roadWorksites.map(site => ({ ...site })),
    companyLedger: snapshot.economy.company.ledger.map(row => ({ ...row })),
    companyStock: { ...snapshot.economy.stock },
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
