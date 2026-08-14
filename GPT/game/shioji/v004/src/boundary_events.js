import {
  FOOD_GOODS,
  dominantProducedFood,
  foodProductionBalance,
  foodShortageGoods,
  islandFoodSummary,
} from './food_readability.js?v=v004.59.0-food-balance';
import { islandCalendar } from './ui_summary.js?v=v004.59.0-food-balance';

export const BOUNDARY_EVENT_STATE_VERSION = 1;
export const FOOD_RUNWAY_THRESHOLD_DAYS = 14;
export const FOOD_WARNING_COOLDOWN_DAYS = 7;

export const PRESERVATION_STOP_SCRIPTS = Object.freeze({
  salt: '塩がなくなりました。魚を保存食にできず、獲れた魚は5日で腐ります。',
  char: '木炭がなくなりました。魚を燻製にできず、獲れた魚は5日で腐ります。',
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

export function foodBalanceBoundarySpeech(model) {
  const balance = foodProductionBalance(model);
  if (balance.diagnosis === 'depleted') {
    return '入江の魚が痩せてきました。獲り続ければ数年で尽きます。別の入江を使うか、漁を休ませてください。';
  }
  if (balance.diagnosis === 'undelivered') {
    const produced = dominantProducedFood(model);
    const blockers = (model?.households ?? []).map(row => row.foodDelivery?.kind).filter(Boolean);
    const cause = blockers.includes('too_expensive') ? '値が合わず売れ残っています。'
      : blockers.includes('no_route') ? '市場までの道が切れています。'
        : blockers.includes('no_capacity') ? '運べる量が足りません。'
          : blockers.includes('no_money') ? '買う家のお金が足りません。'
            : '市場までの供給経路が詰まっています。';
    return `${produced?.label ?? '食料'}は作れていますが市場に届いていません。${cause}`;
  }
  const shortage = foodShortageGoods(model).map(row => row.label);
  const named = shortage.length > 0 ? shortage.join('と') : '食料';
  return `${named}が足りていません。島の食料は1日${Math.abs(balance.balance).toFixed(1)}荷分足りません——畑を増やすか、本国へ麦を注文してください。`;
}

function restoredState(state) {
  if (!state) return null;
  if (state.version !== BOUNDARY_EVENT_STATE_VERSION) {
    throw new Error(`未対応の境界事件保存版です: ${state.version}`);
  }
  const pending = Array.isArray(state.pending) ? state.pending.map(row => ({
    id: String(row.id),
    day: Number.isSafeInteger(row.day) ? row.day : 0,
    type: ['food', 'balance', 'balanceLetter', 'salt', 'char'].includes(row.type) ? row.type : null,
    speech: String(row.speech ?? ''),
    ...(row.letter && typeof row.letter === 'object' ? { letter: clone(row.letter) } : {}),
  })).filter(row => row.type && row.speech) : [];
  return {
    lastFoodRunwayDays: finiteAmount(state.lastFoodRunwayDays),
    lastFoodBalance: Number.isFinite(state.lastFoodBalance) ? state.lastFoodBalance : null,
    lastFoodDiagnosis: typeof state.lastFoodDiagnosis === 'string'
      ? state.lastFoodDiagnosis : null,
    foodDeficitSinceDay: Number.isSafeInteger(state.foodDeficitSinceDay)
      ? state.foodDeficitSinceDay : null,
    foodSummaryIssuedDiagnosis: typeof state.foodSummaryIssuedDiagnosis === 'string'
      ? state.foodSummaryIssuedDiagnosis : null,
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
    this.lastFoodBalance = foodProductionBalance(model).balance;
    this.lastFoodDiagnosis = foodProductionBalance(model).diagnosis;
    this.foodDeficitSinceDay = this.lastFoodDiagnosis === 'stable'
      ? null : (Number.isSafeInteger(model?.day) ? model.day : 0);
    this.foodSummaryIssuedDiagnosis = null;
    this.lastFoodWarningDay = null;
    this.lastGoodsAmounts = Object.fromEntries(['fish', ...PRESERVATION_INPUTS].map(goods => [
      goods,
      goodsAmount(model, goods),
    ]));
    this.nextSequence = 1;
    this.pending = [];
  }

  enqueue({ day, type, speech, letter = null }) {
    const row = {
      id: `boundary-${type}-${day}-${this.nextSequence}`,
      day,
      type,
      speech,
      ...(letter ? { letter: clone(letter) } : {}),
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

  observeBalance(model) {
    const day = Number.isSafeInteger(model?.day) ? model.day : 0;
    const summary = foodProductionBalance(model);
    const balance = summary.balance;
    const diagnosis = summary.diagnosis;
    const introducedIntoOldSave = this.lastFoodDiagnosis === null;
    const crossed = this.lastFoodBalance >= 0 && balance < 0;
    const severity = { stable: 0, undelivered: 1, insufficient: 1, depleted: 2 };
    const worsened = this.lastFoodDiagnosis !== diagnosis
      && diagnosis !== 'stable'
      && (introducedIntoOldSave
        || (severity[diagnosis] ?? 0) > (severity[this.lastFoodDiagnosis] ?? 0));
    const alreadyPending = this.pending.some(row => row.type === 'balance');
    this.lastFoodBalance = balance;
    this.lastFoodDiagnosis = diagnosis;
    let message = null;
    if ((crossed || worsened) && !alreadyPending) {
      message = this.enqueue({
        day,
        type: 'balance',
        speech: foodBalanceBoundarySpeech(model),
      });
    }
    if (diagnosis === 'stable') {
      this.foodDeficitSinceDay = null;
      this.foodSummaryIssuedDiagnosis = null;
      return message;
    }
    if (!Number.isSafeInteger(this.foodDeficitSinceDay)) this.foodDeficitSinceDay = day;
    const summaryDue = day - this.foodDeficitSinceDay >= 30
      && this.foodSummaryIssuedDiagnosis !== diagnosis
      && !this.pending.some(row => row.type === 'balanceLetter');
    if (summaryDue) {
      const speech = foodBalanceBoundarySpeech(model);
      const summary = foodProductionBalance(model);
      this.enqueue({
        day,
        type: 'balanceLetter',
        speech: '食料の不足が一月続いています。原因と手当てを一通にまとめました。',
        letter: {
          kicker: '島の食料・一月報告',
          title: '食料不足が続いています',
          summary: `${summary.reason}（${summary.balance.toFixed(1)}荷/日）`,
          body: `${speech}\n\n輸入は自動では起きません。費用を確かめたうえで本国へ麦を注文するか、島の生産を増やす判断が必要です。`,
          signature: '会社秘書　エレナ・ヴァンス',
        },
      });
      this.foodSummaryIssuedDiagnosis = diagnosis;
    }
    return message;
  }

  observe(model) {
    return Object.freeze({
      food: this.observeFood(model),
      balance: this.observeBalance(model),
      preservation: this.observePreservation(model),
    });
  }

  messageFor(row) {
    return row ? Object.freeze({ ...row }) : null;
  }

  currentMessage() {
    return this.messageFor(this.pending[0] ?? null);
  }

  message(id) {
    return this.messageFor(this.pending.find(row => row.id === id) ?? null);
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
      lastFoodBalance: this.lastFoodBalance,
      lastFoodDiagnosis: this.lastFoodDiagnosis,
      foodDeficitSinceDay: this.foodDeficitSinceDay,
      foodSummaryIssuedDiagnosis: this.foodSummaryIssuedDiagnosis,
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
