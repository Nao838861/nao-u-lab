export const FOOD_GOODS = Object.freeze([
  'fish', 'veg', 'wheat', 'pres', 'pick', 'meat',
]);

const PRIMARY_FOOD_LABELS = Object.freeze({
  wheat: '麦',
  veg: '野菜',
  fish: '魚',
});

export const PLAYER_FACING_BANNED_TERMS = Object.freeze([
  '教程', 'EMA', 'input棚',
]);

// 3シードの基準都市を冬90日（12月1日〜2月30日）進めた実測では、
// 島内食料の取り崩しは開始人口1人あたり26.7〜45.7荷だった。
// 上側へ丸めた46荷/人を、冬入り時点の安全側の必要量として使う。
export const WINTER_RESERVE_PER_PERSON = 46;

const ACTUAL_PERISHABLE_LIFE_DAYS = Object.freeze({
  fish: 5,
  veg: 30,
});

function finiteAmount(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function objectFoodTotal(rows = {}) {
  return FOOD_GOODS.reduce((total, goods) => total + finiteAmount(rows?.[goods]), 0);
}

export function householdFoodAmount(household) {
  return (household?.pantry ?? [])
    .filter(row => FOOD_GOODS.includes(row.goods))
    .reduce((total, row) => total + finiteAmount(row.amount), 0);
}

export function islandFoodSummary(model) {
  const pantry = (model?.households ?? [])
    .reduce((total, household) => total + householdFoodAmount(household), 0);
  const stalls = (model?.stalls ?? [])
    .filter(stall => FOOD_GOODS.includes(stall.goods))
    .reduce((total, stall) => total + finiteAmount(stall.qty), 0);
  // marketStock は会社が市場へ発送済みの現物。屋台とは別在庫なので加算する。
  const market = objectFoodTotal(model?.companyMarketStock);
  const companyReserve = objectFoodTotal(model?.companyStock);
  const population = Math.max(1, finiteAmount(model?.population));
  const available = pantry + stalls + market;
  return Object.freeze({
    pantry,
    stalls,
    market,
    available,
    companyReserve,
    totalWithReserve: available + companyReserve,
    population,
    runwayDays: available / population,
  });
}

export function householdFoodDays(household) {
  return householdFoodAmount(household) / Math.max(1, finiteAmount(household?.members));
}

export function foodProductionBalance(model) {
  const food = islandFoodSummary(model);
  const flow = FOOD_GOODS.reduce((totals, goods) => {
    const row = model?.flowEma?.[goods] ?? {};
    totals.produced += finiteAmount(row.prod);
    totals.actualConsumed += finiteAmount(row.cons);
    return totals;
  }, { produced: 0, actualConsumed: 0 });
  // 飢餓時は「食べられた量」が落ちるため、実消費だけでは不足が黒字に見える。
  // 日次必要量のEMAを下限として、満たせなかった需要も収支へ残す。
  const required = Number.isFinite(model?.foodNeedEma)
    ? Math.max(0, model.foodNeedEma)
    : finiteAmount(model?.population);
  const consumed = Math.max(flow.actualConsumed, required);
  const balance = flow.produced - consumed;
  const marketFood = food.stalls + food.market;
  const fisheryRatio = Number.isFinite(model?.foodResourceHealth?.minimumFisheryRatio)
    ? Math.max(0, model.foodResourceHealth.minimumFisheryRatio) : 1;
  let diagnosis = 'stable';
  let reason = '生産と消費が釣り合っています';
  let action = '食料の在庫推移を確認できます';
  if (balance < -0.05 && fisheryRatio < 0.3) {
    diagnosis = 'depleted';
    reason = '資源が痩せています';
    action = '漁場の資源量を確認できます';
  } else if (balance < -0.05) {
    diagnosis = 'insufficient';
    reason = '作る量が足りない';
    action = '畑・漁を増やすか、本国から麦を注文できます';
  } else if (consumed > 0.05 && marketFood < Math.max(0.5, consumed * 0.25)) {
    diagnosis = 'undelivered';
    reason = '作れているが届いていない';
    action = '食料の供給経路を確認できます';
  }
  return Object.freeze({
    produced: flow.produced,
    actualConsumed: flow.actualConsumed,
    consumed,
    required,
    balance,
    marketFood,
    fisheryRatio,
    diagnosis,
    reason,
    action,
  });
}

export function foodShortageGoods(model, limit = 2) {
  const requiredShare = foodProductionBalance(model).consumed / 3;
  return Object.keys(PRIMARY_FOOD_LABELS)
    .map(goods => ({
      goods,
      label: PRIMARY_FOOD_LABELS[goods],
      produced: finiteAmount(model?.flowEma?.[goods]?.prod),
    }))
    .map(row => ({ ...row, shortage: Math.max(0, requiredShare - row.produced) }))
    .filter(row => row.shortage > 0.05)
    .sort((left, right) => right.shortage - left.shortage)
    .slice(0, Math.max(1, limit));
}

export function dominantProducedFood(model) {
  return Object.keys(PRIMARY_FOOD_LABELS)
    .map(goods => ({
      goods,
      label: PRIMARY_FOOD_LABELS[goods],
      produced: finiteAmount(model?.flowEma?.[goods]?.prod),
    }))
    .sort((left, right) => right.produced - left.produced)[0];
}

export function foodHudSummary(model, history = []) {
  const food = islandFoodSummary(model);
  const baseline = [...history].reverse().find(row => (
    row.day <= (model?.day ?? 0) - 7 && Number.isFinite(row.foodRunwayDays)
  )) ?? history[0] ?? null;
  const delta = baseline ? food.runwayDays - baseline.foodRunwayDays : 0;
  const arrow = delta <= -3 ? '↘↘' : delta <= -0.8 ? '↘' : '→';
  const production = foodProductionBalance(model);
  const reason = production.diagnosis === 'insufficient'
    ? `${production.reason}・本国から注文できます`
    : production.reason;
  const tone = food.runwayDays < 7 ? 'danger'
    : food.runwayDays < 14 || production.diagnosis !== 'stable' ? 'warning' : 'steady';
  return Object.freeze({ ...food, ...production, delta, arrow, reason, tone });
}

export function winterFoodForecast(model) {
  const food = islandFoodSummary(model);
  const required = Math.ceil(food.population * WINTER_RESERVE_PER_PERSON);
  const reserve = food.totalWithReserve;
  const shortage = Math.max(0, required - reserve);
  return Object.freeze({
    required,
    reserve,
    shortage,
    sufficient: shortage <= 0,
    perPerson: WINTER_RESERVE_PER_PERSON,
  });
}

export function executableFoodIntervention(model) {
  const reserve = objectFoodTotal(model?.companyStock);
  if (reserve >= 1) {
    return Object.freeze({
      kind: 'release',
      target: { kind: 'sheet', sheet: 'company-sheet' },
      speech: `会社の倉庫に食料が${Math.floor(reserve)}荷あります。［取引］の「市場へ出す」で、家族が買える場所へ戻しましょう。`,
    });
  }
  if (!model?.mainlandAid?.refused) {
    return Object.freeze({
      kind: 'aid',
      target: { kind: 'sheet', sheet: 'company-sheet' },
      speech: `会社の倉庫に食料がありません。［取引］から本国へ食料支援を要請できます。届くまで時間がかかるので、いま頼みましょう。`,
    });
  }
  const targetTotal = FOOD_GOODS.reduce(
    (total, goods) => total + finiteAmount(model?.stockTargets?.[goods]), 0,
  );
  if (targetTotal < 1) {
    return Object.freeze({
      kind: 'target',
      target: { kind: 'sheet', sheet: 'company-sheet' },
      speech: '本国の支援はもう望めません。［取引］で魚か麦の買上げ目標を定め、余る時期の食料を会社の倉庫へ集めましょう。',
    });
  }
  const fisherCount = (model?.buildings ?? []).filter(row => row.type === 'fisher').length;
  const farmCount = (model?.buildings ?? []).filter(row => row.type === 'veg').length;
  const job = fisherCount <= farmCount ? '漁師' : '野菜畑';
  return Object.freeze({
    kind: 'build',
    target: null,
    speech: `買上げは始まっています。中期の不足を止めるには、建築欄から${job}を増やして市場へ道をつなぎましょう。`,
  });
}

export function perishableFreshness(goods, ageDays = 0) {
  const life = ACTUAL_PERISHABLE_LIFE_DAYS[goods];
  if (!life) return Object.freeze({ stage: 'stable', ratio: 0, lifeDays: null });
  const ratio = finiteAmount(ageDays) / life;
  const stage = ratio >= 0.72 ? 'spoiling' : ratio >= 0.34 ? 'aging' : 'fresh';
  return Object.freeze({ stage, ratio: Math.min(1, ratio), lifeDays: life });
}
