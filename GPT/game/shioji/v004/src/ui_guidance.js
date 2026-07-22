const COMPANY_GOALS = new Set([
  'request-first-aid', 'prepare-first-tools-stock',
  'accept-first-order', 'order-procurement-target', 'first-order-procurement',
  'complete-first-order', 'set-seasonal-stock-target', 'fill-seasonal-reserve',
  'release-seasonal-reserve', 'assess-profitable-order', 'accept-profitable-order',
  'target-profitable-order', 'complete-profitable-order', 'observe-skippable-order',
  'let-skippable-order-expire',
]);

const ISLAND_GOALS = new Set([
  'observe-island-food-change', 'reduce-food-imports', 'observe-seasonal-food-valley',
  'observe-tools-price-rise', 'observe-conversion-cost-chain', 'sustain-conversion-workshops',
  'observe-household-level-up',
]);

const LETTER_GOALS = new Set([
  'close-first-chapter', 'close-second-chapter', 'close-third-chapter',
  'close-fourth-chapter', 'close-fifth-chapter', 'graduate-governor',
]);

function buildingCount(model, job) {
  return model.buildings.filter(building => building.type === job).length;
}

export function objectiveActionFor(objective, model) {
  if (!objective || !model) return null;
  if (objective.id === 'first-road-and-logger') {
    return (objective.evidence?.forestRoads ?? 0) <= 0
      ? { kind: 'tool', tool: 'road', label: '森まで道を敷く' }
      : { kind: 'building', job: 'logger', label: '木こりを選ぶ' };
  }
  if (objective.id === 'market-for-logs') {
    return { kind: 'building', job: 'market', label: '市場を選ぶ' };
  }
  if (objective.id === 'connect-market-to-port' || objective.id === 'improve-logger-route') {
    return { kind: 'tool', tool: 'road', label: '道を敷く' };
  }
  if (objective.id === 'first-woodshop') {
    return { kind: 'building', job: 'woodshop', label: '木工房を選ぶ' };
  }
  if (objective.id === 'warehouse-for-order') {
    return buildingCount(model, 'warehouse') === 0
      ? { kind: 'building', job: 'warehouse', label: '蔵を選ぶ' }
      : { kind: 'tool', tool: 'road', label: '蔵へ道を結ぶ' };
  }
  if (objective.id === 'place-island-food') {
    if (buildingCount(model, 'fisher') === 0) {
      return { kind: 'building', job: 'fisher', label: '漁家を選ぶ' };
    }
    return { kind: 'building', job: 'veg', label: '菜園を選ぶ' };
  }
  if (objective.id === 'place-conversion-workshops') {
    for (const job of ['woodshop', 'charburner', 'saltworks']) {
      if (buildingCount(model, job) === 0) {
        const labels = { woodshop: '木工房', charburner: '炭焼', saltworks: '製塩所' };
        return { kind: 'building', job, label: `${labels[job]}を選ぶ` };
      }
    }
  }
  if (COMPANY_GOALS.has(objective.id)) {
    return { kind: 'sheet', sheet: 'company-sheet', label: '会社を開く' };
  }
  if (ISLAND_GOALS.has(objective.id)) {
    return { kind: 'sheet', sheet: 'island-sheet', label: '島況を見る' };
  }
  if (LETTER_GOALS.has(objective.id)) {
    return { kind: 'sheet', sheet: 'tutorial-letter-sheet', label: '書状を開く' };
  }
  return null;
}

export function secretaryRouteFor({
  letters = [], objective = null, objectiveAction = null, events = [], fallback = null,
} = {}) {
  const unread = [...letters].reverse().find(letter => letter.unread);
  if (unread) {
    return {
      priority: 'unread-letter',
      target: { kind: 'letter', id: unread.id },
      kicker: '未読書状',
      title: unread.title,
      detail: `${unread.issuedDay}日目・${unread.summary}`,
    };
  }
  if (objective && !objective.complete) {
    return {
      priority: 'objective',
      target: objectiveAction ?? { kind: 'objective' },
      kicker: objective.chapter,
      title: objective.title,
      detail: objective.detail,
    };
  }
  const important = [...events].reverse().find(event => event.important);
  if (important) {
    return {
      priority: 'important-event',
      target: { kind: 'event', sequence: important.sequence },
      kicker: `${important.day}日目・重要な出来事`,
      title: important.title,
      detail: important.details || `tick ${important.tick}`,
    };
  }
  return fallback;
}
