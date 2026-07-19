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
      });
    }
  }
  return rows;
}

function pantryRows(household) {
  return Object.entries(household.pantry ?? {}).map(([goods, amount]) => ({
    section: 'pantry', goods, amount, capacity: null,
  }));
}

function carrierRows(snapshot) {
  const hauls = snapshot.physical.haulJobs
    .filter(job => job.status !== 'completed' && job.carrier?.position)
    .map(job => ({
      id: `haul:${job.id}`,
      kind: job.carrier.mode === 'cart' ? 'cart' : 'walker',
      x: job.carrier.position.x,
      y: job.carrier.position.y,
      goods: job.goods,
      amount: job.qty,
      from: job.from,
      to: job.to,
    }));
  const households = snapshot.economy.households.map(household => ({
    id: `household:${household.id}`,
    kind: 'household',
    x: household.px ?? household.x,
    y: household.py ?? household.y,
    state: household.state,
    job: household.job,
    members: household.members?.length ?? 0,
  }));
  return [...hauls, ...households];
}

export function snapshotToViewModel(snapshot) {
  if (!snapshot?.physical || !snapshot?.economy) {
    throw new TypeError('full engine snapshot is required');
  }
  const buildings = snapshot.physical.buildings.map(building => {
    const shelves = shelfRows(building);
    return {
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
      occupied: building.ownerHouseholdId !== null,
      shelves,
      shelfAmount: shelves.reduce((total, row) => total + row.amount, 0),
    };
  });
  const households = snapshot.economy.households.map(household => ({
    id: household.id,
    job: household.job,
    x: household.px ?? household.x,
    y: household.py ?? household.y,
    members: household.members?.length ?? 0,
    state: household.state,
    pantry: pantryRows(household),
  }));
  const stalls = Object.entries(snapshot.economy.stalls).flatMap(([goods, rows]) => (
    rows.map(stall => ({ goods, ...stall }))
  ));
  return deepFreeze({
    day: snapshot.day,
    tick: snapshot.tick,
    seed: snapshot.seed,
    companyMoney: snapshot.economy.company.money,
    population: households.reduce((total, household) => total + household.members, 0),
    width: snapshot.physical.width,
    height: snapshot.physical.height,
    terrain: snapshot.physical.terrain.map(row => row.map(tile => ({ ...tile }))),
    roadKeys: Object.keys(snapshot.physical.roads),
    trailRows: Object.entries(snapshot.physical.trails).map(([key, tread]) => ({ key, tread })),
    occupiedKeys: Object.keys(snapshot.physical.occupied),
    buildings,
    carriers: carrierRows(snapshot),
    households,
    stalls,
    portCalls: snapshot.physical.portCalls.map(call => ({ ...call })),
  });
}

export { INVENTORY_SECTIONS };
