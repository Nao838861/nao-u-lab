import { islandCalendar } from './ui_summary.js?v=v004.46.3-boot-report';

export const FOOD_GOODS = Object.freeze([
  'fish', 'veg', 'wheat', 'pres', 'pick', 'meat',
]);

export const PLAYER_FACING_BANNED_TERMS = Object.freeze([
  '教程', 'EMA', 'input棚',
]);

// 3シードの基準都市を冬90日（12月1日〜2月30日）進めた実測では、
// 島内食料の取り崩しは開始人口1人あたり26.7〜45.7荷だった。
// 上側へ丸めた46荷/人を、冬入り時点の安全側の必要量として使う。
export const WINTER_RESERVE_PER_PERSON = 46;

const ACTUAL_PERISHABLE_LIFE_DAYS = Object.freeze({
  fish: 3,
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

export function foodHudSummary(model, history = []) {
  const food = islandFoodSummary(model);
  const baseline = [...history].reverse().find(row => (
    row.day <= (model?.day ?? 0) - 7 && Number.isFinite(row.foodRunwayDays)
  )) ?? history[0] ?? null;
  const delta = baseline ? food.runwayDays - baseline.foodRunwayDays : 0;
  const arrow = delta <= -3 ? '↘↘' : delta <= -0.8 ? '↘' : '→';
  const month = islandCalendar(model?.day, model?.calendarOffsetDays).month;
  const flow = FOOD_GOODS.reduce((totals, goods) => {
    const row = model?.flowEma?.[goods] ?? {};
    totals.produced += finiteAmount(row.prod);
    totals.consumed += finiteAmount(row.cons);
    return totals;
  }, { produced: 0, consumed: 0 });
  const reason = [12, 1, 2].includes(month)
    ? '冬・畑が休み'
    : flow.consumed > flow.produced * 1.12
      ? '消費が生産より多い'
      : delta <= -0.8 ? '備えが減少' : '生産と消費が安定';
  const tone = food.runwayDays < 7 ? 'danger'
    : food.runwayDays < 14 ? 'warning' : 'steady';
  return Object.freeze({ ...food, delta, arrow, reason, tone });
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
