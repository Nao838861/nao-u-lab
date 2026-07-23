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

export const GUIDANCE_TIERS = Object.freeze({
  stop: Object.freeze({ label: '時間を止めて確認', action: '書状を読む' }),
  action: Object.freeze({ label: '要対応', action: '対応する' }),
  guidance: Object.freeze({ label: '今やること', action: '操作へ進む' }),
  notice: Object.freeze({ label: '報告', action: '詳しく見る' }),
});

export function tutorialHandoffFor(previous, next) {
  if (!previous || !next) return null;
  const advanced = previous.id !== next.id;
  const finished = previous.id === next.id && !previous.complete && next.complete;
  if (!advanced && !finished) return null;
  const writtenSpeech = String(previous.elenaCompletion ?? '').trim();
  if (!writtenSpeech) return null;
  const nextObjective = advanced && !next.complete ? next : null;
  return Object.freeze({
    completedId: previous.id,
    nextId: nextObjective?.id ?? null,
    speech: writtenSpeech,
  });
}

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
  if (objective.id === 'first-settlers-arrive') {
    return { kind: 'speed', speed: 3, label: '一日毎秒で入植を待つ' };
  }
  if (objective.id === 'accept-first-order' && !model.orderOffer) {
    return { kind: 'speed', speed: 3, label: '一日毎秒で注文を待つ' };
  }
  if (['first-order-procurement', 'complete-first-order'].includes(objective.id)) {
    return { kind: 'speed', speed: 3, label: '一日毎秒で荷車を待つ' };
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
  letters = [], advice = [], handoff = null, objective = null, objectiveAction = null,
  events = [], fallback = null,
} = {}) {
  const unreadAction = [...letters].reverse().find(letter => (
    letter.unread && letter.attention !== 'notice' && letter.attention !== 'silent'
      && String(letter.elenaMessage ?? '').trim()
  ));
  if (unreadAction) {
    return {
      priority: 'unread-letter',
      tier: unreadAction.attention === 'critical' ? 'stop' : 'action',
      target: { kind: 'letter', id: unreadAction.id },
      speech: unreadAction.elenaMessage,
      kicker: '未読書状',
      title: unreadAction.title,
      detail: `${unreadAction.issuedDay}日目・${unreadAction.summary}`,
    };
  }
  const actionAdvice = [...advice].reverse().find(row => (
    row.unread && !row.completed && row.priority === 'action'
      && String(row.speech ?? '').trim()
  ));
  if (actionAdvice) {
    return {
      priority: 'timely-advice',
      tier: 'action',
      target: { kind: 'advice', id: actionAdvice.id, route: actionAdvice.target },
      speech: actionAdvice.speech,
      kicker: actionAdvice.kicker,
      title: actionAdvice.title,
      detail: actionAdvice.detail,
    };
  }
  if (handoff) {
    return {
      priority: 'goal-complete',
      tier: 'guidance',
      target: { kind: 'tutorial-handoff' },
      badge: '達成',
      action: handoff.nextId ? '次の案内へ' : '島へ戻る',
      speech: handoff.speech,
    };
  }
  if (objective && !objective.complete && String(objective.elenaMessage ?? '').trim()) {
    return {
      priority: 'objective',
      tier: 'guidance',
      target: objectiveAction ?? { kind: 'objective' },
      speech: objective.elenaMessage,
      kicker: objective.chapter,
      title: objective.title,
      detail: objective.elenaMessage || objective.detail,
      action: objectiveAction?.label ?? '操作メモを見る',
    };
  }
  const infoAdvice = [...advice].reverse().find(row => (
    row.unread && !row.completed && row.priority === 'info'
      && String(row.speech ?? '').trim()
  ));
  if (infoAdvice) {
    return {
      priority: 'timely-message',
      tier: 'notice',
      target: { kind: 'advice', id: infoAdvice.id, route: infoAdvice.target },
      speech: infoAdvice.speech,
      kicker: infoAdvice.kicker,
      title: infoAdvice.title,
      detail: infoAdvice.detail,
    };
  }
  const unreadNotice = [...letters].reverse().find(letter => (
    letter.unread && letter.attention === 'notice'
      && String(letter.elenaMessage ?? '').trim()
  ));
  if (unreadNotice) {
    return {
      priority: 'unread-report',
      tier: 'notice',
      target: { kind: 'letter', id: unreadNotice.id },
      speech: unreadNotice.elenaMessage,
      kicker: '未読の報告',
      title: unreadNotice.title,
      detail: `${unreadNotice.issuedDay}日目・${unreadNotice.summary}`,
    };
  }
  const important = [...events].reverse().find(event => (
    event.important && String(event.elenaSpeech ?? '').trim()
  ));
  if (important) {
    return {
      priority: 'important-event',
      tier: 'notice',
      target: { kind: 'event', sequence: important.sequence },
      speech: important.elenaSpeech,
      kicker: `${important.day}日目・重要な出来事`,
      title: important.title,
      detail: important.details || `${important.day}日目の出来事`,
    };
  }
  return fallback;
}
