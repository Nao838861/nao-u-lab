export const SEASONAL_EVENT_STATE_VERSION = 1;

export const SEASONAL_EVENT_SCRIPTS = Object.freeze({
  firstSnow: '初雪です。畑は春まで止まり、魚は1日20荷から5荷に減ります。蓄えと漁で春を待ちます。',
  thaw: '雪が解けました。畑が動き始めます。',
  fishSpoilage: '魚が傷んで捨てられました。魚は5日ほどで傷みます。',
  vegSpoilage: '野菜も傷みました。野菜は30日ほど持ちます。',
});

const PERISHABLE_GOODS = Object.freeze(['fish', 'veg']);
const MINIMUM_AMOUNT = 1e-9;

function clone(value) {
  return structuredClone(value);
}

function calendarSerial(model) {
  const day = Number.isSafeInteger(model?.day) ? model.day : 0;
  const offset = Number.isSafeInteger(model?.calendarOffsetDays)
    ? model.calendarOffsetDays : 0;
  return Math.max(1, day) + offset - 1;
}

function dateForSerial(serial) {
  const normalized = ((serial % 360) + 360) % 360;
  return {
    year: Math.floor(serial / 360) + 1,
    month: Math.floor(normalized / 30) + 1,
    dayOfMonth: (normalized % 30) + 1,
  };
}

function spoilTotals(model) {
  return Object.fromEntries(PERISHABLE_GOODS.map(goods => [
    goods,
    Math.max(0, Number(model?.spoilByGoods?.[goods] ?? 0)),
  ]));
}

function restoredState(state) {
  if (!state) return null;
  if (state.version !== SEASONAL_EVENT_STATE_VERSION) {
    throw new Error(`未対応の季節事件保存版です: ${state.version}`);
  }
  const announcedSpoilage = Array.isArray(state.announcedSpoilage)
    ? state.announcedSpoilage.filter(goods => PERISHABLE_GOODS.includes(goods))
    : [];
  const pending = Array.isArray(state.pending) ? state.pending.map(row => ({
    id: String(row.id),
    day: Number.isSafeInteger(row.day) ? row.day : 0,
    type: ['firstSnow', 'thaw', 'fishSpoilage', 'vegSpoilage'].includes(row.type)
      ? row.type : null,
    goods: PERISHABLE_GOODS.includes(row.goods) ? row.goods : null,
  })).filter(row => row.type) : [];
  return {
    lastCalendarSerial: Number.isSafeInteger(state.lastCalendarSerial)
      ? state.lastCalendarSerial : null,
    spoilTotals: Object.fromEntries(PERISHABLE_GOODS.map(goods => [
      goods,
      Math.max(0, Number(state.spoilTotals?.[goods] ?? 0)),
    ])),
    announcedSpoilage,
    pending,
  };
}

export class SeasonalEvents {
  constructor({
    model = null,
    state = null,
    suppressInitialAnnouncements = false,
  } = {}) {
    const restored = restoredState(state);
    if (restored) {
      this.lastCalendarSerial = restored.lastCalendarSerial;
      this.lastSpoilTotals = restored.spoilTotals;
      this.announcedSpoilage = new Set(restored.announcedSpoilage);
      this.pending = restored.pending;
      return;
    }
    const serial = calendarSerial(model);
    this.lastCalendarSerial = suppressInitialAnnouncements ? serial : serial - 1;
    this.lastSpoilTotals = spoilTotals(model);
    this.announcedSpoilage = new Set();
    this.pending = [];
    if (model) this.observe(model);
  }

  enqueue(row) {
    if (this.pending.some(candidate => candidate.id === row.id)) return null;
    this.pending.push(row);
    return this.messageFor(row);
  }

  observeSeasons(model) {
    const currentSerial = calendarSerial(model);
    if (!Number.isSafeInteger(this.lastCalendarSerial)) {
      this.lastCalendarSerial = currentSerial - 1;
    }
    if (currentSerial < this.lastCalendarSerial) {
      this.lastCalendarSerial = currentSerial;
      return [];
    }
    const messages = [];
    const offset = Number.isSafeInteger(model?.calendarOffsetDays)
      ? model.calendarOffsetDays : 0;
    for (let serial = this.lastCalendarSerial + 1; serial <= currentSerial; serial += 1) {
      const date = dateForSerial(serial);
      const type = date.month === 12 && date.dayOfMonth === 1 ? 'firstSnow'
        : date.month === 3 && date.dayOfMonth === 1 ? 'thaw' : null;
      if (!type) continue;
      const message = this.enqueue({
        id: `season-${type}-${date.year}`,
        day: serial === currentSerial && Number.isSafeInteger(model?.day)
          ? model.day : serial - offset + 1,
        type,
        goods: null,
      });
      if (message) messages.push(message);
    }
    this.lastCalendarSerial = currentSerial;
    return messages;
  }

  observeSpoilage(model) {
    const current = spoilTotals(model);
    const messages = [];
    for (const goods of PERISHABLE_GOODS) {
      const increased = current[goods] > (this.lastSpoilTotals[goods] ?? 0) + MINIMUM_AMOUNT;
      const pending = this.pending.some(row => row.goods === goods);
      if (increased && !pending && !this.announcedSpoilage.has(goods)) {
        const type = goods === 'fish' ? 'fishSpoilage' : 'vegSpoilage';
        const message = this.enqueue({
          id: `first-spoilage-${goods}`,
          day: Number.isSafeInteger(model?.day) ? model.day : 0,
          type,
          goods,
        });
        if (message) messages.push(message);
      }
      this.lastSpoilTotals[goods] = current[goods];
    }
    return messages;
  }

  observe(model) {
    return {
      seasons: this.observeSeasons(model),
      spoilage: this.observeSpoilage(model),
    };
  }

  messageFor(row) {
    if (!row) return null;
    return Object.freeze({
      ...row,
      speech: SEASONAL_EVENT_SCRIPTS[row.type],
    });
  }

  currentMessage() {
    return this.messageFor(this.pending[0] ?? null);
  }

  markAnnounced(id) {
    const index = this.pending.findIndex(row => row.id === id);
    if (index < 0) return false;
    const [row] = this.pending.splice(index, 1);
    if (row.goods) this.announcedSpoilage.add(row.goods);
    return true;
  }

  readState() {
    return clone({
      version: SEASONAL_EVENT_STATE_VERSION,
      lastCalendarSerial: this.lastCalendarSerial,
      spoilTotals: this.lastSpoilTotals,
      announcedSpoilage: PERISHABLE_GOODS.filter(goods => this.announcedSpoilage.has(goods)),
      pending: this.pending,
    });
  }
}

export function createSeasonalEvents(options) {
  return new SeasonalEvents(options);
}
