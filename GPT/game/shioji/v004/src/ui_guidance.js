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

export function guidanceReadingTimeMs(
  text,
  { minimumMs = 5200, maximumMs = 10000, millisecondsPerCharacter = 115 } = {},
) {
  const characterCount = [...String(text ?? '').replace(/\s/g, '')].length;
  return Math.min(maximumMs,
    Math.max(minimumMs, characterCount * millisecondsPerCharacter));
}

export function secretaryEventsAfter(events = [], deliveredSequence = 0) {
  return events.filter(event => Number(event?.sequence ?? 0) > deliveredSequence);
}

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
    return { kind: 'tool', tool: 'road', label: '道を敷き始める' };
  }
  if (objective.id === 'first-logger') {
    return { kind: 'building', job: 'logger', label: '木こりを選ぶ' };
  }
  if (objective.id === 'market-for-logs') {
    return { kind: 'building', job: 'market', label: '市場を選ぶ' };
  }
  if (objective.id === 'connect-market-to-port' || objective.id === 'improve-logger-route') {
    return { kind: 'tool', tool: 'road', label: '道を敷き始める' };
  }
  if (objective.id === 'first-woodshop') {
    return { kind: 'building', job: 'woodshop', label: '木工房を選ぶ' };
  }
  if (objective.id === 'warehouse-for-order') {
    return buildingCount(model, 'warehouse') === 0
      ? { kind: 'building', job: 'warehouse', label: '倉庫を選ぶ' }
      : { kind: 'tool', tool: 'road', label: '倉庫へ道を結ぶ' };
  }
  if (objective.id === 'place-island-food') {
    if (buildingCount(model, 'fisher') === 0) {
      return { kind: 'building', job: 'fisher', label: '漁師を選ぶ' };
    }
    return { kind: 'building', job: 'veg', label: '野菜畑を選ぶ' };
  }
  if (objective.id === 'first-settlers-arrive') {
    return { kind: 'speed', speed: 3, label: '一日毎秒にして入植を待つ' };
  }
  if (objective.id === 'accept-first-order' && !model.orderOffer) {
    return { kind: 'speed', speed: 3, label: '一日毎秒にして注文を待つ' };
  }
  if (['first-order-procurement', 'complete-first-order'].includes(objective.id)) {
    return { kind: 'speed', speed: 3, label: '一日毎秒にして荷車を待つ' };
  }
  if (objective.id === 'place-conversion-workshops') {
    for (const job of ['woodshop', 'charburner', 'saltworks']) {
      if (buildingCount(model, job) === 0) {
        const labels = { woodshop: '木工房', charburner: '炭焼き小屋', saltworks: '塩田' };
        return { kind: 'building', job, label: `${labels[job]}を選ぶ` };
      }
    }
  }
  if (COMPANY_GOALS.has(objective.id)) {
    return { kind: 'sheet', sheet: 'company-sheet', label: '取引を開く' };
  }
  if (ISLAND_GOALS.has(objective.id)) {
    return { kind: 'sheet', sheet: 'island-sheet', label: '統計を見る' };
  }
  if (LETTER_GOALS.has(objective.id)) {
    return { kind: 'sheet', sheet: 'tutorial-letter-sheet', label: '書状を開く' };
  }
  return null;
}

export function secretaryActionForRoute(route) {
  const target = route?.target ?? null;
  if (target?.kind === 'letter' && target.delivery === 'letter') {
    return Object.freeze({ kind: 'letter', id: target.id, label: route.action ?? '書状を開く' });
  }
  if (target?.kind === 'event') {
    return Object.freeze({ kind: 'event', sequence: target.sequence, label: 'この家を見る' });
  }
  if (target?.kind === 'advice' && target.route?.kind === 'building-detail') {
    return Object.freeze({
      kind: 'advice-building',
      adviceId: target.id,
      target: target.route,
      label: route.action ?? 'この家を見る',
    });
  }
  return null;
}

export function secretaryRouteFor({
  letters = [], messages = [], advice = [], handoff = null, objective = null, objectiveAction = null,
  events = [], fallback = null,
} = {}) {
  const deliveryOf = letter => letter.delivery
    ?? (letter.attention === 'critical' ? 'forced' : 'letter');
  const forcedLetter = [...letters].reverse().find(letter => (
    letter.unread && deliveryOf(letter) === 'forced'
      && String(letter.elenaMessage ?? '').trim()
  ));
  if (forcedLetter) {
    return {
      priority: 'forced-letter',
      tier: 'stop',
      target: { kind: 'letter', id: forcedLetter.id, delivery: 'forced' },
      speech: forcedLetter.elenaMessage,
      kicker: '重要書状',
      title: forcedLetter.title,
      detail: forcedLetter.summary,
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
  const optionalLetter = [...letters].reverse().find(letter => (
    letter.unread && !letter.announced && deliveryOf(letter) === 'letter'
      && String(letter.elenaMessage ?? '').trim()
  ));
  if (optionalLetter) {
    return {
      priority: 'optional-letter',
      tier: 'action',
      target: { kind: 'letter', id: optionalLetter.id, delivery: 'letter' },
      speech: optionalLetter.elenaMessage,
      kicker: 'エレナからの書状',
      title: optionalLetter.title,
      detail: optionalLetter.summary,
      action: '書状を開く',
    };
  }
  const unreadMessage = [...messages].reverse().find(message => (
    message.unread && String(message.elenaMessage ?? '').trim()
  ));
  if (unreadMessage) {
    return {
      priority: 'tutorial-message',
      tier: 'notice',
      target: { kind: 'message', id: unreadMessage.id },
      speech: unreadMessage.elenaMessage,
      kicker: 'エレナからの報告',
      title: unreadMessage.title,
      detail: unreadMessage.summary,
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
  const important = [...events].reverse().find(event => (
    event.important && String(event.elenaSpeech ?? '').trim()
  ));
  if (important) {
    return {
      priority: 'important-event',
      tier: 'notice',
      target: { kind: 'event', sequence: important.sequence },
      speech: important.elenaSpeech,
      kicker: '重要な出来事',
      title: important.title,
      detail: important.details || `${important.day}日目の出来事`,
    };
  }
  return fallback;
}
