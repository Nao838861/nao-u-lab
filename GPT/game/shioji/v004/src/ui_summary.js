export function recentCompanySummary(model, days = 30) {
  if (!model || !Array.isArray(model.companyLedger)) {
    throw new TypeError('company ledger model is required');
  }
  if (!Number.isSafeInteger(days) || days <= 0) {
    throw new RangeError('summary days must be a positive integer');
  }
  const toDay = Number.isFinite(model.day) ? model.day : 0;
  const fromDay = Math.max(0, toDay - days + 1);
  const rows = model.companyLedger.filter(row => row.day >= fromDay && row.day <= toDay);
  const income = rows.reduce((total, row) => row.amount > 0 ? total + row.amount : total, 0);
  const expense = rows.reduce((total, row) => row.amount < 0 ? total - row.amount : total, 0);
  return Object.freeze({
    days,
    fromDay,
    toDay,
    funds: model.companyMoney ?? 0,
    income,
    expense,
    net: income - expense,
  });
}
