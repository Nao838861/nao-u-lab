export function recentCompanySummary(model, days = 30) {
  if (!model || !Array.isArray(model.companyLedger)) {
    throw new TypeError('company ledger model is required');
  }
  if (!Number.isSafeInteger(days) || days <= 0) {
    throw new RangeError('summary days must be a positive integer');
  }
  const toDay = Number.isFinite(model.day) ? model.day : 0;
  const fromDay = Math.max(0, toDay - days + 1);
  const dailyRows = model.companyDailyLedger?.filter(
    row => row.day >= fromDay && row.day <= toDay,
  );
  const rows = dailyRows?.length
    ? dailyRows
    : model.companyLedger.filter(row => row.day >= fromDay && row.day <= toDay);
  const income = dailyRows?.length
    ? rows.reduce((total, row) => total + row.income, 0)
    : rows.reduce((total, row) => row.amount > 0 ? total + row.amount : total, 0);
  const expense = dailyRows?.length
    ? rows.reduce((total, row) => total + row.expense, 0)
    : rows.reduce((total, row) => row.amount < 0 ? total - row.amount : total, 0);
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

export function islandCalendar(day) {
  const normalized = Math.max(1, Math.floor(Number(day) || 1));
  const month = (Math.floor((normalized - 1) / 30) % 12) + 1;
  const dayOfMonth = ((normalized - 1) % 30) + 1;
  const year = Math.floor((normalized - 1) / 360) + 1;
  const season = month <= 2 || month === 12 ? '冬'
    : month <= 5 ? '春' : month <= 8 ? '夏' : '秋';
  return Object.freeze({ year, month, dayOfMonth, season, label: `${season}・${month}月` });
}

export function islandHealthSummary(model, history = []) {
  if (!model || !Array.isArray(model.households)) {
    throw new TypeError('household model is required');
  }
  const longestHunger = model.households.reduce(
    (longest, household) => Math.max(longest, household.hungerRun ?? 0), 0,
  );
  const currentPopulation = model.population ?? 0;
  const baseline = [...history].find(row => row.day >= (model.day ?? 0) - 29) ?? history[0] ?? null;
  const populationDelta = baseline ? currentPopulation - baseline.population : 0;
  const finance = recentCompanySummary(model);
  let tone = 'steady';
  let label = '落ち着いています';
  let reason = '長い空腹や急な人口減は見えていません';
  if (longestHunger >= 30) {
    tone = 'danger';
    label = '食料が危険です';
    reason = `最長${longestHunger}日連続で食べ足りない世帯があります`;
  } else if (longestHunger >= 10) {
    tone = 'warning';
    label = '食料に注意';
    reason = `最長${longestHunger}日連続で食べ足りない世帯があります`;
  } else if (populationDelta < 0) {
    tone = 'warning';
    label = '人口が減少';
    reason = `直近30日ほどで人口が${Math.abs(populationDelta)}人減りました`;
  } else if ((model.companyMoney ?? 0) < 0) {
    tone = 'warning';
    label = '資金に注意';
    reason = '取引資金が0を下回っています';
  } else if (populationDelta > 0) {
    tone = 'good';
    label = '暮らしが成長中';
    reason = `直近30日ほどで人口が${populationDelta}人増えました`;
  }
  return Object.freeze({
    tone,
    label,
    reason,
    longestHunger,
    populationDelta,
    companyNet: finance.net,
  });
}
