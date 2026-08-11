import {
  FOOD_GOODS,
  islandFoodSummary,
} from './food_readability.js?v=v004.45.5-caravan-integrity';
import { islandCalendar } from './ui_summary.js?v=v004.45.5-caravan-integrity';

export const BOUNDARY_EVENT_STATE_VERSION = 1;
export const FOOD_RUNWAY_THRESHOLD_DAYS = 14;
export const FOOD_WARNING_COOLDOWN_DAYS = 7;

export const PRESERVATION_STOP_SCRIPTS = Object.freeze({
  salt: '塩がなくなりました。魚を保存食にできず、獲れた魚は3日で腐ります。',
  char: '木炭がなくなりました。魚を燻製にできず、獲れた魚は3日で腐ります。',
});

const MINIMUM_AMOUNT = 1e-9;
const BUILD_MONTHS = new Set([3, 4, 5, 6]);
const PRESERVATION_INPUTS = Object.freeze(['salt', 'char']);

function clone(value) {
  return structuredClone(value);
}

function finiteAmount(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function goodsAmount(model, goods) {
  return finiteAmount(
    model?.goodsManifest?.find(row => row.goods === goods)?.totalAmount,
  );
}

function foodFlow(model) {
  return FOOD_GOODS.reduce((total, goods) => {
    const row = model?.flowEma?.[goods] ?? {};
    total.produced += finiteAmount(row?.prod) + finiteAmount(row?.imp);
    total.consumed += finiteAmount(row?.cons);
    return total;
  }, { produced: 0, consumed: 0 });
}

export function foodBoundarySpeech(model) {
  const runwayDays = islandFoodSummary(model).runwayDays;
  const remainingDays = Math.max(0, Math.floor(runwayDays));
  const calendar = islandCalendar(model?.day, model?.calendarOffsetDays);
  const flow = foodFlow(model);
  const cause = [12, 1, 2].includes(calendar.month)
    ? '冬で畑の生産が止まっています。'
    : `1日の生産と仕入は${flow.produced.toFixed(1)}荷、消費は${flow.consumed.toFixed(1)}荷です。`;
  const action = BUILD_MONTHS.has(calendar.month)
    ? '畑や漁師を建てれば間に合います。'
    : '会社の倉庫から食料を出すか、本土から輸入してください。';
  return `島の食料が14日分を下回りました。残り${remainingDays}日分です。${cause}${action}`;
}

function restoredState(state) {
  if (!state) return null;
  if (state.version !== BOUNDARY_EVENT_STATE_VERSION) {
    throw new Error(`未対応の境界事件保存版です: ${state.version}`);
  }
  const pending = Array.isArray(state.pending) ? state.pending.map(row => ({
    id: String(row.id),
    day: Number.isSafeInteger(row.day) ? row.day : 0,
    type: ['food', 'salt', 'char'].includes(row.type) ? row.type : null,
    speech: String(row.speech ?? ''),
  })).filter(row => row.type && row.speech) : [];
  return {
    lastFoodRunwayDays: finiteAmount(state.lastFoodRunwayDays),
    lastFoodWarningDay: Number.isSafeInteger(state.lastFoodWarningDay)
      ? state.lastFoodWarningDay : null,
    lastGoodsAmounts: Object.fromEntries(['fish', ...PRESERVATION_INPUTS].map(goods => [
      goods,
      finiteAmount(state.lastGoodsAmounts?.[goods]),
    ])),
    nextSequence: Number.isSafeInteger(state.nextSequence)
      ? Math.max(1, state.nextSequence) : 1,
    pending,
  };
}

export class BoundaryEvents {
  constructor({ model = null, state = null } = {}) {
    const restored = restoredState(state);
    if (restored) {
      Object.assign(this, restored);
      return;
    }
    this.lastFoodRunwayDays = islandFoodSummary(model).runwayDays;
    this.lastFoodWarningDay = null;
    this.lastGoodsAmounts = Object.fromEntries(['fish', ...PRESERVATION_INPUTS].map(goods => [
      goods,
      goodsAmount(model, goods),
    ]));
    this.nextSequence = 1;
    this.pending = [];
  }

  enqueue({ day, type, speech }) {
    const row = {
      id: `boundary-${type}-${day}-${this.nextSequence}`,
      day,
      type,
      speech,
    };
    this.nextSequence += 1;
    this.pending.push(row);
    return this.messageFor(row);
  }

  observeFood(model) {
    const day = Number.isSafeInteger(model?.day) ? model.day : 0;
    const runwayDays = islandFoodSummary(model).runwayDays;
    const crossed = this.lastFoodRunwayDays >= FOOD_RUNWAY_THRESHOLD_DAYS
      && runwayDays < FOOD_RUNWAY_THRESHOLD_DAYS;
    const cooledDown = this.lastFoodWarningDay === null
      || day - this.lastFoodWarningDay >= FOOD_WARNING_COOLDOWN_DAYS;
    const alreadyPending = this.pending.some(row => row.type === 'food');
    this.lastFoodRunwayDays = runwayDays;
    if (!crossed || !cooledDown || alreadyPending) return null;
    this.lastFoodWarningDay = day;
    return this.enqueue({ day, type: 'food', speech: foodBoundarySpeech(model) });
  }

  observePreservation(model) {
    const day = Number.isSafeInteger(model?.day) ? model.day : 0;
    const current = Object.fromEntries(['fish', ...PRESERVATION_INPUTS].map(goods => [
      goods,
      goodsAmount(model, goods),
    ]));
    const messages = [];
    for (const goods of PRESERVATION_INPUTS) {
      const exhausted = this.lastGoodsAmounts[goods] > MINIMUM_AMOUNT
        && current[goods] <= MINIMUM_AMOUNT;
      if (exhausted && current.fish > MINIMUM_AMOUNT) {
        messages.push(this.enqueue({
          day,
          type: goods,
          speech: PRESERVATION_STOP_SCRIPTS[goods],
        }));
      }
    }
    this.lastGoodsAmounts = current;
    return messages;
  }

  observe(model) {
    return Object.freeze({
      food: this.observeFood(model),
      preservation: this.observePreservation(model),
    });
  }

  messageFor(row) {
    return row ? Object.freeze({ ...row }) : null;
  }

  currentMessage() {
    return this.messageFor(this.pending[0] ?? null);
  }

  markAnnounced(id) {
    const index = this.pending.findIndex(row => row.id === id);
    if (index < 0) return false;
    this.pending.splice(index, 1);
    return true;
  }

  readState() {
    return clone({
      version: BOUNDARY_EVENT_STATE_VERSION,
      lastFoodRunwayDays: this.lastFoodRunwayDays,
      lastFoodWarningDay: this.lastFoodWarningDay,
      lastGoodsAmounts: this.lastGoodsAmounts,
      nextSequence: this.nextSequence,
      pending: this.pending,
    });
  }
}

export function createBoundaryEvents(options) {
  return new BoundaryEvents(options);
}
