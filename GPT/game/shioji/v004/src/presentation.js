function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function eventCarrierId(event) {
  if (event.haulJobId) return `haul:${event.haulJobId}`;
  if (event.householdId !== undefined) return `household:${event.householdId}`;
  return null;
}

function eventPoint(events, carrierId, type) {
  const event = events.find(row => row.type === type && eventCarrierId(row) === carrierId);
  return event && Number.isFinite(event.x) && Number.isFinite(event.y)
    ? { x: event.x, y: event.y }
    : null;
}

function carrierEndpoint(carrier, endpoint) {
  const point = carrier?.[endpoint];
  return point && Number.isFinite(point.x) && Number.isFinite(point.y)
    ? { x: point.x, y: point.y }
    : null;
}

function interpolateCarrier(from, to, alpha) {
  return {
    ...to,
    x: from.x + (to.x - from.x) * alpha,
    y: from.y + (to.y - from.y) * alpha,
  };
}

function interpolateCarriers(fromRows, toRows, events, alpha) {
  const fromById = new Map(fromRows.map(row => [row.id, row]));
  const toIds = new Set(toRows.map(row => row.id));
  const rows = toRows.map(to => {
    const from = fromById.get(to.id)
      ?? eventPoint(events, to.id, 'departure')
      ?? carrierEndpoint(to, 'from')
      ?? to;
    return interpolateCarrier(from, to, alpha);
  });
  if (alpha < 1) {
    for (const from of fromRows) {
      if (toIds.has(from.id)) continue;
      const destination = eventPoint(events, from.id, 'arrival')
        ?? carrierEndpoint(from, 'to')
        ?? from;
      rows.push(interpolateCarrier(from, { ...from, ...destination }, alpha));
    }
  }
  return rows;
}

function handlingRows(from, to, events, alpha) {
  const fromCalls = new Map((from.portCalls ?? []).map(call => [call.id, call]));
  const eventRows = events
    .filter(event => event.type === 'handling')
    .map(event => ({ ...event, progress: alpha, derived: false }));
  const eventQty = new Map();
  for (const event of eventRows) {
    eventQty.set(event.portCallId, (eventQty.get(event.portCallId) ?? 0) + event.qty);
  }
  for (const call of to.portCalls ?? []) {
    const previous = fromCalls.get(call.id);
    const previousRemaining = previous?.remaining ?? call.qty;
    const moved = Math.max(0, previousRemaining - call.remaining);
    const missing = moved - (eventQty.get(call.id) ?? 0);
    if (missing > 1e-9) {
      eventRows.push({
        type: 'handling', portCallId: call.id, direction: call.direction,
        goods: call.goods, qty: missing, progress: alpha, derived: true,
      });
    }
  }
  return eventRows;
}

function portVisualRows(from, to, events, alpha) {
  if (!to.portBerth) return [];
  const fromCalls = new Map((from.portCalls ?? []).map(call => [call.id, call]));
  const dockingIds = new Set(events.filter(event => event.type === 'docking').map(event => event.portCallId));
  const rows = [];
  for (const call of to.portCalls ?? []) {
    const previous = fromCalls.get(call.id);
    if (call.status === 'docked') {
      const docking = dockingIds.has(call.id);
      const progress = docking ? clamp01(alpha / 0.62) : 1;
      rows.push({ ...call, phase: progress < 1 ? 'approaching' : 'docked', progress });
    } else if (previous?.status === 'docked' && call.status === 'completed') {
      rows.push({ ...call, phase: 'departing', progress: alpha });
    }
  }
  return rows;
}

// 道路上のキャリアは仕様どおり最大約1.7タイル/tick進む(コスト1.0/tick・道0.6)。
// 「飛び」の判定閾値はその上に置く——通常の道路移動を飛び扱いすると、
// 高速時に平滑下限が毎tick掛かり、表示速度が速度設定に追従しなくなる。
const TELEPORT_DISTANCE = 2.6;

export function transitionDuration(from, to, events, baseSeconds = 0.12) {
  const fromById = new Map((from.carriers ?? []).map(row => [row.id, row]));
  const largeMove = (to.carriers ?? []).some(row => {
    const previous = fromById.get(row.id);
    return previous && Math.hypot(row.x - previous.x, row.y - previous.y) > TELEPORT_DISTANCE;
  });
  const bundled = events.length >= 3 || events.some(event => (
    ['birth', 'death', 'inheritance', 'job_move', 'docking'].includes(event.type)
  ));
  // 平滑下限は速度(baseSeconds)に比例させ、生成レートを恒常的に超えないよう抑える
  const smoothFloor = Math.min(0.18, Math.max(baseSeconds * 2, 0.05));
  return Math.max(0.02, baseSeconds, largeMove || bundled ? smoothFloor : 0);
}

export function interpolateWorldModel(from, to, events = [], alpha = 1) {
  const progress = clamp01(alpha);
  return {
    ...to,
    carriers: interpolateCarriers(from.carriers ?? [], to.carriers ?? [], events, progress),
    portVisuals: portVisualRows(from, to, events, progress),
    handlingVisuals: handlingRows(from, to, events, progress),
    presentationProgress: progress,
  };
}

function stableWorldModel(model) {
  return {
    ...model,
    portVisuals: portVisualRows(model, model, [], 1),
    handlingVisuals: [],
    presentationProgress: 1,
  };
}

const MAX_PENDING_TRANSITIONS = 12;

export class WorldPresentation {
  constructor(initialModel) {
    this.display = initialModel;
    this.tail = initialModel;
    this.queue = [];
    this.active = null;
    this.elapsed = 0;
  }

  reset(model) {
    this.display = stableWorldModel(model);
    this.tail = model;
    this.queue.length = 0;
    this.active = null;
    this.elapsed = 0;
    return this.display;
  }

  enqueue(model, events = [], baseSeconds = 0.12) {
    const transition = {
      from: this.tail,
      to: model,
      events: events.map(event => ({ ...event })),
      duration: transitionDuration(this.tail, model, events, baseSeconds),
    };
    this.tail = model;
    this.queue.push(transition);
    return transition;
  }

  advance(elapsedSeconds = 0) {
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
      throw new TypeError('presentation elapsed time must be finite and non-negative');
    }
    // 表示キューが経済時間を支配しない: 溜まりすぎた遷移は古い順に即確定して追いつく
    while (this.queue.length > MAX_PENDING_TRANSITIONS) {
      const skipped = this.queue.shift();
      this.display = stableWorldModel(skipped.to);
      this.active = null;
      this.elapsed = 0;
    }
    let remaining = elapsedSeconds;
    while (remaining >= 0) {
      if (!this.active) {
        this.active = this.queue.shift() ?? null;
        this.elapsed = 0;
        if (!this.active) return this.display;
      }
      const left = this.active.duration - this.elapsed;
      const consumed = Math.min(remaining, left);
      this.elapsed += consumed;
      remaining -= consumed;
      const alpha = this.active.duration > 0 ? this.elapsed / this.active.duration : 1;
      this.display = interpolateWorldModel(
        this.active.from, this.active.to, this.active.events, alpha,
      );
      if (this.elapsed + 1e-9 < this.active.duration) return this.display;
      this.display = stableWorldModel(this.active.to);
      this.active = null;
      this.elapsed = 0;
      if (remaining <= 1e-9) return this.display;
    }
    return this.display;
  }

  get pendingCount() {
    return this.queue.length + (this.active ? 1 : 0);
  }
}
