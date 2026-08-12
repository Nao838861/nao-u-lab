import {
  activePortCalls,
  buildingById,
  cancelPortCall,
  completeHaulJob,
  carrierGoodsCapacity,
  createCartCarrier,
  createHaulJob,
  createWalkCarrier,
  depositInventory,
  dockVessel,
  findNearestTravelTarget,
  goodsUnitWeight,
  haulJobById,
  isConnected,
  isPavedRoad,
  parseKey,
  pathLen,
  paveRoadTile,
  sectionAmount,
  sectionCapacity,
  withdrawInventory,
  workRoadWorksite,
} from "./physical.js?v=v004.48.0-explicit-import";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export const GOODS = deepFreeze([
  "fish", "veg", "wheat", "pres", "pick", "tools", "salt", "char",
  "meat", "meal", "stone", "oil", "iron", "cloth", "log", "ore", "coal", "bar",
]);
export const PERISH = deepFreeze(["fish", "veg", "meat", "pres", "pick", "wheat", "meal"]);
export const FOODS = deepFreeze(["fish", "veg", "wheat", "pres", "pick", "meat"]);
export const FOOD_KIND = deepFreeze({
  fish: "fish", veg: "veg", wheat: "wheat", pres: "fish", pick: "veg", meat: "meat",
});

export function calendarDay(economy, day = economy?.currentDay) {
  const elapsedDay = Math.max(1, Math.floor(Number(day) || 1));
  const offset = Number.isSafeInteger(economy?.calendarOffsetDays)
    ? economy.calendarOffsetDays
    : 0;
  return elapsedDay + offset;
}

export function calendarMonth(economy, day = economy?.currentDay) {
  return (Math.floor((calendarDay(economy, day) - 1) / 30) % 12) + 1;
}

export const P = deepFreeze({
  EAT: 9,
  PANTRY_FOOD_D: 6,
  FOOD_FIRST_D: 3,
  CULT_D: 60,
  RATION: 0.15,
  Y_FISH: 20,
  Y_FISH_W: 5,
  FISH_LIFE: 3,
  VEG_LIFE: 30,
  PICK_SALT: 0.1,
  PR_PICK: 0.85,
  Y_VEG: 16,
  Y_WHEAT: 6000,
  // 上流ほど多くの施設を要する基準比率。Lv倍率は全職共通で同じ上限にするため、
  // 木工房1軒（8×3=24荷）へ木こり3軒、炭焼き1軒（4×2=8荷）へ1軒となる。
  // 産出を極端に小さくして一次職の採算を壊さず、加工一回の原料投入量で厚みを作る。
  Y_LOG: 8,
  Y_ORE: 4,
  Y_COAL: 2,
  Y_SMELT: 2,
  Y_SMITH: 2,
  SMELT_ORE: 2,
  SMELT_FUEL: 1,
  SMITH_BAR: 1,
  SMITH_FUEL: 0.5,
  LOG_TOOL: 3,
  LOG_CHAR: 2,
  Y_TOOLS: 8,
  Y_CHAR: 4,
  Y_SALT: 3,
  Y_MEAT: 16,
  // 麦・野菜を同じ飼料荷として扱う暫定比率。全需要接続後の需要網7で再較正する。
  FEED_MEAT: 1,
  // 牧畜の布は肉生産の副産物。島内需要を大きく超えて積み上がらない量に留める。
  Y_CLOTH: 0.05,
  // 人口200級で一軒完結していた布を、島内需要に応じ二軒目が成立する量へ抑える。
  // 大家族まで輸出価格で必ず黒字にする旧制約は、輸出偏重を再発させるため置かない。
  Y_COTTON_CLOTH: 3,
  D_CLOTH: 0.03,
  D_IRON: 0.03,
  SALT_CHAR: 1,
  PR_SALT: 0.6,
  PR_SMOKE: 0.95,
  SMOKE_CHAR: 0.1,
  PRES_SALT: 0.125,
  CMULT: 1.35,
  D_TOOL: 0.2,
  D_SALT: 0.06,
  D_CHAR: 0.4,
  LV_MULT: 1.585,
  UP_DAYS: 45,
  DOWN_DAYS: 60,
  HAUL: 40,
  IMP: { wheat: 4, tools: 6, salt: 5, iron: 12, oil: 3 },
  IMP_COST: { wheat: 2.4, tools: 4.2, salt: 3.5, iron: 8.5, oil: 2.6 },
  EXP: { pres: 0.6, pick: 0.55, cloth: 2 },
  EXP_CAP: { pres: 25, pick: 15, cloth: 12 },
  EXP_ML: { pres: 0.66, pick: 0.6, cloth: 2.2 },
  FREE_M: 42,
  IRATE: 0.012,
  LIMIT0: 20000,
  LIMIT_G: 1500,
  LIMIT_FREEZE: 24,
  LIMIT_PC: 250,
  TREASURY0: 5500,
  PURSE0: 60,
  PASSAGE: 60,
  BUILD_COST: 250,
  FEE: 0.04,
  // 最初の注文は、開拓直後の一工房でも事前備蓄から短期間で納められる試し荷。
  // 信用ができた二件目以降は直近日次余剰5日分（最大80荷）の通常注文へ移る。
  FIRST_ORDER_QTY: 12,
  SHIP_COST: 8000,
  SHIP_CAP: 2,
  SHIP_PRICE: 1.2,
  BAY0: 600000,
  BAY_R: 0.00175,
  RESEED: 0.3,
  GROVE0: 60000,
  GROVE_R: 0.0006,
  MEAL_FISH: 8,
  FERT_NEED: 3,
  FERT_BOOST: 0.15,
  // Lv2以上の全施設が石材を維持消費する前提で、人口200級に複数の採石場を要する量。
  Y_STONE: 4,
  WOOD0: 150,
  WOOD_R: 0.25,
  ROAD_WORK: 3,
  CART_LOG: 4,
  CART_TOOLS: 0.5,
  CART_WORK_DAYS: 8,
  CART_HAND_CAPACITY: 2,
  CART_BACKPACK_CAPACITY: 4,
  CART_WOOD_CAPACITY: 8,
  CART_IRON_CAPACITY: 16,
  MARKET_BATCH_DAYS: 2,
  MARKET_BATCH_MAX_DAYS: 3,
  MARKET_CULTURE_INTERVAL_DAYS: 4,
  RESOURCE_DAY_TICKS: 30,
  RESOURCE_FREE_ONE_WAY: 2,
  RESOURCE_PRODUCTIVE_TICKS: 24,
  RESOURCE_MIN_EFFICIENCY: 0.1,
  DIRECT_TRADE_MAX_MARKET_RATIO: 0.8,
  CART_WOOD_DURABILITY: 360,
  CART_MARKUP: 1.7,
  CART_TIME_VALUE: 0.35,
  // 商館・港・倉庫を支える会社の有限な荷役人員。1人1荷を守りつつ、
  // 13職の調達が同日に重なる基準都市でも荷車ゼロの生活床を落とさない人数。
  COMPANY_HAND_PORTERS: 128,
  PAVE_STONE: 200,
  // 石200荷で全島を一括更新せず、工事班が道路セルごとに敷設する。
  PAVE_TILE_STONE: 4,
  PAVE_PORT_TILE_STONE: 8,
  PAVE_DAILY_STONE: 16,
  PAVE_ROAD_F: 0.45,
  WORK_TOOL_WOOD_COST: 1,
  WORK_TOOL_WOOD_DAYS: 30,
  WORK_TOOL_IRON_COST: 1,
  WORK_TOOL_IRON_DAYS: 90,
  WORK_TOOL_BARE_MULT: 0.75,
  WORK_TOOL_WOOD_MULT: 1,
  WORK_TOOL_IRON_MULT: 1.2,
  FISHING_RIG_LOG: 3,
  FISHING_RIG_TOOLS: 1,
  FISHING_RIG_CLOTH: 1,
  FISHING_RIG_SAIL_LOG: 5,
  FISHING_RIG_SAIL_TOOLS: 2,
  FISHING_RIG_SAIL_CLOTH: 2,
  FISHING_RIG_IRON: 1,
  FISHING_RIG_COASTAL_DAYS: 90,
  FISHING_RIG_SAIL_DAYS: 120,
  FISHING_RIG_SHORE_MULT: 0.9,
  FISHING_RIG_COASTAL_MULT: 1,
  FISHING_RIG_SAIL_MULT: 1.15,
  DISTRESS: 40,
  COOLDOWN: 360,
  BELIEF0: {
    fish: 1, veg: 1, wheat: 1.2, pres: 1.2, pick: 1.3, tools: 5,
    salt: 4, char: 4.5, meat: 1.3, meal: 1, stone: 2, oil: 3,
    iron: 10, cloth: 3.5, log: 1.4, ore: 1.8, coal: 2.8, bar: 8,
  },
});

export const JOBCLS = deepFreeze({
  fisher: "fish",
  fisher2: "fish",
  wheat: "farm",
  veg: "farm",
  shepherd: "farm",
  rapeseed: "farm",
  logger: "lumber",
  woodshop: "lumber",
  cartwright: "lumber",
  charburner: "lumber",
  quarryman: "lumber",
  miner: "lumber",
  collier: "lumber",
  smelter: "lumber",
  smith: "lumber",
  saltworks: "artisan",
  carter: "artisan",
});

export const JOBS = deepFreeze(Object.keys(JOBCLS));

export const LADDER = deepFreeze({
  farm: ["food1", "tools", "saltchar", "food2", "iron", "food3"],
  fish: ["grain", "tools", "salt", "char", "food2", "iron"],
  lumber: ["food1", "tools", "food2", "salt", "char", "iron"],
  artisan: ["food1", "food2", "salt", "char", "cloth", "iron"],
});

const FIRST_NAMES = deepFreeze([
  "ハンス", "グレタ", "ヤン", "マリア", "ピム", "ロッテ", "カレル", "アンナ", "ブラム", "エルス",
  "テオ", "ヨハンナ", "ミーナ", "クラース", "フェム", "ダーン", "ソフィー", "ヘンク", "リーケ", "ヨープ",
]);
const SURNAMES = deepFreeze([
  "ヤンセン", "デ・フリース", "バッカー", "フィッセル", "スミット", "デッケル",
  "ブラウワー", "ファン・ダイク", "メイヤー", "ボス", "ペーテルス", "ハウトマン",
]);

function familyRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function generateFamily(id) {
  const random = familyRandom(id * 7919 + 13);
  const count = 7 + Math.floor(random() * 5);
  const sur = SURNAMES[Math.floor(random() * SURNAMES.length)];
  const members = [];
  for (let index = 0; index < count; index += 1) {
    const sex = random() < 0.5 ? "♂" : "♀";
    const age = index < 2
      ? 25 + Math.floor(random() * 20)
      : 3 + Math.floor(random() * 18);
    members.push({
      name: FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)],
      sex,
      age,
    });
  }
  return { sur, members };
}

function emptyPantry() {
  return Object.fromEntries(GOODS.map((goods) => [goods, 0]));
}

const SETTLER_FOOD_KIT = 240;

function applyImmigrantKit(household) {
  household.pantry.tools = 5;
  household.pantry.wheat = SETTLER_FOOD_KIT;
  if (household.job === "saltworks") household.pantry.char = 15;
  if (household.job === "woodshop" || household.job === "charburner") household.pantry.log = 20;
  if (household.job === "cartwright") {
    household.pantry.log = 16;
    household.pantry.tools = 8;
  }
  if (household.job === "smelter") {
    household.pantry.ore = 20;
    household.pantry.char = 10;
  }
  if (household.job === "smith") {
    household.pantry.bar = 10;
    household.pantry.char = 5;
  }
  if (household.job === "fisher") {
    household.pantry.salt = 4;
    household.pantry.char = 2;
  }
  if (household.job === "veg") household.pantry.salt = 3;
}

export function recordEconomicMaterialFlow(
  economy,
  goods,
  kind,
  qty,
  reason,
  { includeInDaily = true } = {},
) {
  if (!["prod", "cons", "imp", "exp"].includes(kind)) throw new Error(`unknown material flow kind: ${kind}`);
  if (!Number.isFinite(qty) || qty < 0) {
    throw new TypeError(
      `material flow qty must be non-negative and finite: ${goods}/${kind}=${qty} (${reason})`,
    );
  }
  const flow = economy.materialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
  flow[kind] += qty;
  economy.materialFlows[goods] = flow;
  economy.materialLedger.push({ goods, kind, qty, reason });
  if (economy.materialLedger.length > 640) {
    economy.materialLedger.splice(0, economy.materialLedger.length - 512);
  }
  if (includeInDaily) {
    const daily = economy.dailyMaterialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    daily[kind] += qty;
    economy.dailyMaterialFlows[goods] = daily;
  }
}

// 物量台帳は「実際に動いた量」だけを記録するため、使いたかったが
// 使えなかった量は別の観測台帳に残す。経済状態は変えず、需給表示にだけ使う。
export function recordEconomicDemand(economy, goods, demand, consumed, source) {
  if (!Number.isFinite(demand) || demand < -1e-9
    || !Number.isFinite(consumed) || consumed < -1e-9) {
    throw new TypeError(`demand must be non-negative and finite: ${goods}=${demand}/${consumed}`);
  }
  const normalizedDemand = Math.max(0, demand);
  const normalizedConsumed = Math.max(0, consumed);
  if (normalizedConsumed > normalizedDemand + 1e-9) {
    throw new RangeError(`consumed demand cannot exceed demand: ${goods}=${demand}/${consumed}`);
  }
  if (typeof source !== "string" || source.length === 0) {
    throw new TypeError("demand source must be a non-empty string");
  }
  economy.dailyDemandFlows ??= {};
  const row = economy.dailyDemandFlows[goods] ?? { demand: 0, consumed: 0, sources: {} };
  row.demand += normalizedDemand;
  row.consumed += normalizedConsumed;
  const sourceRow = row.sources[source] ?? { demand: 0, consumed: 0 };
  sourceRow.demand += normalizedDemand;
  sourceRow.consumed += normalizedConsumed;
  row.sources[source] = sourceRow;
  economy.dailyDemandFlows[goods] = row;
  return row;
}

function makeHouseholdRecord(economy, { job, x, y }) {
  if (!JOBCLS[job]) throw new Error(`unknown household job: ${job}`);
  ensurePersonIds(economy);
  const id = economy.nextHouseholdId;
  economy.nextHouseholdId += 1;
  const family = generateFamily(id);
  for (const member of family.members) {
    member.id = `person${economy.nextPersonId}`;
    economy.nextPersonId += 1;
  }
  const household = {
    id,
    sur: family.sur,
    members: family.members,
    job,
    x,
    y,
    road: false,
    purse: P.PURSE0,
    pantry: emptyPantry(),
    belief: { ...P.BELIEF0 },
    lv: 0,
    up: 0,
    down: 0,
    kindDays: {},
    kindLog: [],
    hunger: 0,
    wheatWork: 0,
    jobCycleDone: job !== "wheat",
    unsold: [],
    income30: 0,
    incomeLog: [],
    purseLog: [],
    incM: 0,
    incMonths: [],
    walk: 0,
    px: x,
    py: y,
    state: "home",
    buildingId: null,
    cargo: null,
    marketCarrier: null,
    marketBatchWaitSinceDay: null,
    lastMarketDepartureDay: null,
    lastMarketTripReason: null,
    workCarrier: null,
    workRotation: 0,
    cart: null,
    cartStock: [],
    cartWork: null,
    workTool: null,
    workToolsAcquired: { wood: 0, iron: 0 },
    workToolsBroken: 0,
    fishingRig: null,
    fishingRigsAcquired: { coastal: 0, sail: 0 },
    fishingRigsBroken: 0,
    cartsPurchased: 0,
    cartsBroken: 0,
    marketTransactionTicks: 0,
    marketTripTicks: 0,
    productionMultiplier: 1,
    resourceWork: null,
    productionToday: {},
    productionHistory: [],
    lastDirectTrade: null,
    buildDays: 0,
    boost: null,
    employerId: null,
    workerId: null,
    worksiteId: null,
    wx: null,
    wy: null,
  };
  return household;
}

function ensurePersonIds(economy) {
  let nextId = Number.isInteger(economy.nextPersonId) && economy.nextPersonId > 0
    ? economy.nextPersonId
    : 1;
  for (const household of economy.households ?? []) {
    for (const member of household.members ?? []) {
      if (typeof member.id !== "string") continue;
      const match = /^person(\d+)$/.exec(member.id);
      if (match) nextId = Math.max(nextId, Number(match[1]) + 1);
    }
  }
  const claimed = new Set();
  for (const household of economy.households ?? []) {
    for (const member of household.members ?? []) {
      if (typeof member.id === "string" && !claimed.has(member.id)) {
        claimed.add(member.id);
        continue;
      }
      while (claimed.has(`person${nextId}`)) nextId += 1;
      member.id = `person${nextId}`;
      claimed.add(member.id);
      nextId += 1;
    }
  }
  economy.nextPersonId = nextId;
}

export function createHousehold(economy, { job, x, y, origin = "immigrant" }) {
  if (origin !== "immigrant") throw new Error(`unsupported household origin: ${origin}`);
  const household = makeHouseholdRecord(economy, { job, x, y });
  applyImmigrantKit(household);
  // 本土から来る漁師世帯だけは使い込んだ小舟と網を持参する。島内分家は資産を
  // 複製せず岸漁から始め、必要なら市場の実資材で新調する。
  if (job === "fisher") {
    household.fishingRig = {
      kind: "coastal",
      durability: 30,
      maxDurability: P.FISHING_RIG_COASTAL_DAYS,
      acquiredDay: 0,
      origin: "passage",
    };
  }
  economy.households.push(household);
  recordExternalMoneyFlow(economy, {
    amount: household.purse,
    reason: `移民${household.id}の持参金`,
  });
  for (const [goods, qty] of Object.entries(household.pantry)) {
    if (qty > 0) {
      recordEconomicMaterialFlow(
        economy,
        goods,
        "imp",
        qty,
        `移民${household.id}の開拓キット`,
        { includeInDaily: false },
      );
    }
  }
  if (household.fishingRig) {
    const recipe = fishingRigRecipe(household.fishingRig.kind);
    const remaining = household.fishingRig.durability / household.fishingRig.maxDurability;
    for (const [goods, qty] of Object.entries(recipe.materials)) {
      recordEconomicMaterialFlow(
        economy,
        goods,
        "imp",
        qty * remaining,
        `移民${household.id}の開拓キット（持参漁具）`,
        { includeInDaily: false },
      );
    }
  }
  return household;
}

export function householdMult(household) {
  // 加工職だけがLvで3.98倍、6.31倍へ伸びる旧式は、一軒の工房が上流全体を
  // 飲み込む原因だった。全職を同じ2倍上限にし、施設比率をLvで反転させない。
  return Math.min(Math.pow(P.LV_MULT, household.lv), 2);
}

const CONSTRUCTION_MATERIALS = deepFreeze({
  // 最初の採取職だけは開拓キットの木製品で建てられる。丸太生産前に丸太を
  // 要求する循環を作らず、以後の畑・工房から現地材の連鎖を始める。
  fisher: { tools: 4 },
  fisher2: { log: 6, tools: 4, cloth: 0.5 },
  wheat: { log: 6, tools: 3, cloth: 0.5 },
  veg: { log: 6, tools: 3, cloth: 0.5 },
  shepherd: { log: 8, tools: 3, cloth: 1 },
  rapeseed: { log: 6, tools: 3, cloth: 0.5 },
  logger: { tools: 4 },
  quarryman: { log: 6, tools: 4 },
  miner: { log: 6, tools: 4, stone: 4 },
  collier: { log: 6, tools: 4, stone: 4 },
  smelter: { tools: 6, stone: 10, iron: 1 },
  smith: { tools: 6, stone: 8, iron: 1 },
  woodshop: { log: 6, tools: 6, stone: 3 },
  cartwright: { log: 8, tools: 6, stone: 3 },
  charburner: { log: 6, tools: 4, stone: 3 },
  saltworks: { log: 6, tools: 4, stone: 4 },
  carter: { log: 8, tools: 5, stone: 4, cloth: 1 },
});

export function constructionMaterialsFor(type) {
  return structuredClone(CONSTRUCTION_MATERIALS[type] ?? { log: 6, tools: 4, stone: 2 });
}

function ensureBuildingShelves(building) {
  if (!building) return null;
  building.inventory ??= {};
  building.caps ??= {};
  for (const section of ["input", "construction", "repair"]) {
    building.inventory[section] ??= {};
    building.caps[section] ??= Object.fromEntries(
      GOODS.map((goods) => [goods, Number.MAX_SAFE_INTEGER]),
    );
  }
  building.condition = Number.isFinite(building.condition) ? building.condition : 100;
  building.conditionStatus ??= "good";
  building.constructionRequired ??= {};
  return building;
}

function outstandingOnShelf(building, section, required) {
  const outstanding = {};
  for (const [goods, qty] of Object.entries(required ?? {})) {
    const missing = Math.max(0, qty - sectionAmount(building, section, goods));
    if (missing > 1e-9) outstanding[goods] = missing;
  }
  return outstanding;
}

export function householdBuildingNeeds(physical, household) {
  if (!physical) return { construction: {}, repair: {} };
  const building = ensureBuildingShelves(buildingById(physical, household?.buildingId));
  if (!building) return { construction: {}, repair: {} };
  const construction = building.constructionConsumed
    ? {}
    : outstandingOnShelf(building, "construction", building.constructionRequired);
  const repair = outstandingOnShelf(building, "repair", building.repairPlan?.required);
  return { construction, repair };
}

export function normalizeCompletedBuildingConstruction(physical, household) {
  const building = ensureBuildingShelves(buildingById(physical, household?.buildingId));
  if (
    !building
    || (building.constructionConsumed !== null && building.constructionConsumed !== undefined)
    || ["arriving", "building"].includes(household?.state)
  ) return false;
  // 建設材の実物流を導入する前に完成していた建物は、完成フラグを持たない。
  // そのまま不足建設材を追わせると、稼働済み世帯が永遠に市場へ通うため、
  // 旧状態でconstruction棚へ退避された未消費材を家財へ戻して完成済みに正規化する。
  for (const [goods, qty] of Object.entries(building.inventory.construction ?? {})) {
    if (!(qty > 1e-9)) continue;
    household.pantry[goods] = (household.pantry[goods] ?? 0) + qty;
    building.inventory.construction[goods] = 0;
  }
  building.constructionConsumed = true;
  household.buildDays = 0;
  return true;
}

export function householdWorkToolNeed(household) {
  const active = household?.workTool;
  if (
    active
    && ["wood", "iron"].includes(active.kind)
    && Number.isFinite(active.durability)
    && active.durability > 1e-9
  ) return null;
  return (household?.lv ?? 0) >= 2
    ? { kind: "iron", goods: "iron", qty: P.WORK_TOOL_IRON_COST }
    : { kind: "wood", goods: "tools", qty: P.WORK_TOOL_WOOD_COST };
}

export function stageOwnedBuildingMaterials(physical, household) {
  const building = ensureBuildingShelves(buildingById(physical, household?.buildingId));
  if (!building) return {};
  const moved = {};
  const plans = [];
  if (!building.constructionConsumed) {
    plans.push(["construction", building.constructionRequired ?? {}, false]);
  }
  if (building.repairPlan) plans.push(["repair", building.repairPlan.required ?? {}, true]);
  const workToolNeed = householdWorkToolNeed(household);
  const fishingRigNeed = householdFishingRigNeed(household);
  for (const [section, required, preserveWorkingCapital] of plans) {
    for (const [goods, requiredQty] of Object.entries(required)) {
      const missing = Math.max(0, requiredQty - sectionAmount(building, section, goods));
      if (missing <= 1e-9) continue;
      const reserved = preserveWorkingCapital
        ? (workToolNeed?.goods === goods ? workToolNeed.qty : 0)
          + (fishingRigNeed?.materials?.[goods] ?? 0)
        : 0;
      const available = Math.max(0, (household.pantry[goods] ?? 0) - reserved);
      const qty = Math.min(missing, available);
      if (qty <= 1e-9) continue;
      household.pantry[goods] -= qty;
      depositInventory(building, section, goods, qty);
      moved[goods] = (moved[goods] ?? 0) + qty;
    }
  }
  return moved;
}

export function householdWorkToolMultiplier(household) {
  const tool = household?.workTool;
  if (!tool || !(tool.durability > 1e-9)) return P.WORK_TOOL_BARE_MULT;
  return tool.kind === "iron" ? P.WORK_TOOL_IRON_MULT : P.WORK_TOOL_WOOD_MULT;
}

function fishingRigRecipe(kind) {
  const sail = kind === "sail";
  return {
    kind: sail ? "sail" : "coastal",
    days: sail ? P.FISHING_RIG_SAIL_DAYS : P.FISHING_RIG_COASTAL_DAYS,
    materials: {
      log: sail ? P.FISHING_RIG_SAIL_LOG : P.FISHING_RIG_LOG,
      tools: sail ? P.FISHING_RIG_SAIL_TOOLS : P.FISHING_RIG_TOOLS,
      cloth: sail ? P.FISHING_RIG_SAIL_CLOTH : P.FISHING_RIG_CLOTH,
      ...(sail ? { iron: P.FISHING_RIG_IRON } : {}),
    },
  };
}

export function householdFishingRigNeed(household) {
  if (household?.job !== "fisher") return null;
  const active = household.fishingRig;
  if (
    active
    && ["coastal", "sail"].includes(active.kind)
    && Number.isFinite(active.durability)
    && active.durability > 1e-9
  ) return null;
  return fishingRigRecipe((household.lv ?? 0) >= 2 ? "sail" : "coastal");
}

export function householdFishingRigMultiplier(household) {
  if (household?.job !== "fisher") return 1;
  const rig = household.fishingRig;
  if (!rig || !(rig.durability > 1e-9)) return P.FISHING_RIG_SHORE_MULT;
  return rig.kind === "sail" ? P.FISHING_RIG_SAIL_MULT : P.FISHING_RIG_COASTAL_MULT;
}

function acquireHouseholdFishingRig(economy, physical, household, { day }) {
  const need = householdFishingRigNeed(household);
  if (!need) return false;
  const ready = Object.entries(need.materials).every(([goods, qty]) => (
    householdMaterialAmount(physical, household, goods) >= qty - 1e-9
  ));
  if (!ready) return false;
  for (const [goods, qty] of Object.entries(need.materials)) {
    withdrawHouseholdMaterial(physical, household, goods, qty);
  }
  household.fishingRig = {
    kind: need.kind,
    durability: need.days,
    maxDurability: need.days,
    acquiredDay: day,
    origin: "local",
  };
  household.fishingRigsAcquired ??= { coastal: 0, sail: 0 };
  household.fishingRigsAcquired[need.kind] = (
    household.fishingRigsAcquired[need.kind] ?? 0
  ) + 1;
  recordEconomyEvent(
    economy,
    day,
    `fisher#${household.id} ${need.kind === "sail" ? "帆走漁具" : "木舟と漁網"}を更新`,
  );
  return true;
}

function recordFishingRigWear(economy, household, effort) {
  if (household?.job !== "fisher" || !(effort > 1e-9)) return;
  const active = household.fishingRig;
  const recipe = fishingRigRecipe(
    active?.kind === "sail" || (!active && (household.lv ?? 0) >= 2) ? "sail" : "coastal",
  );
  for (const [goods, qty] of Object.entries(recipe.materials)) {
    const dailyWear = qty / recipe.days * effort;
    if (active?.durability > 1e-9) {
      recordEconomicMaterialFlow(
        economy,
        goods,
        "cons",
        dailyWear,
        `世帯${household.id}の${active.kind === "sail" ? "帆走漁具" : "木舟と漁網"}の摩耗`,
      );
      recordEconomicDemand(economy, goods, dailyWear, dailyWear, "fishing_gear");
    } else {
      recordEconomicDemand(economy, goods, dailyWear, 0, "fishing_gear");
    }
  }
}

function wearHouseholdFishingRig(household, effort) {
  if (household?.job !== "fisher" || !(effort > 1e-9) || !household.fishingRig) return false;
  household.fishingRig.durability = Math.max(0, household.fishingRig.durability - effort);
  if (household.fishingRig.durability > 1e-9) return false;
  const kind = household.fishingRig.kind;
  household.fishingRig = null;
  household.fishingRigsBroken = (household.fishingRigsBroken ?? 0) + 1;
  return kind;
}

function acquireHouseholdWorkTool(economy, physical, household, { day }) {
  if (!householdWorkToolNeed(household)) return false;
  const preferred = (household.lv ?? 0) >= 2
    ? [
      { kind: "iron", goods: "iron", cost: P.WORK_TOOL_IRON_COST, days: P.WORK_TOOL_IRON_DAYS },
      { kind: "wood", goods: "tools", cost: P.WORK_TOOL_WOOD_COST, days: P.WORK_TOOL_WOOD_DAYS },
    ]
    : [
      { kind: "wood", goods: "tools", cost: P.WORK_TOOL_WOOD_COST, days: P.WORK_TOOL_WOOD_DAYS },
    ];
  const chosen = preferred.find(({ goods, cost }) => (
    householdMaterialAmount(physical, household, goods) >= cost - 1e-9
  ));
  if (!chosen) return false;
  withdrawHouseholdMaterial(physical, household, chosen.goods, chosen.cost);
  recordEconomicMaterialFlow(
    economy,
    chosen.goods,
    "cons",
    chosen.cost,
    `世帯${household.id}の${chosen.kind === "iron" ? "鉄" : "木"}の作業道具`,
  );
  recordEconomicDemand(economy, chosen.goods, chosen.cost, chosen.cost, "work_tools");
  household.workTool = {
    kind: chosen.kind,
    durability: chosen.days,
    maxDurability: chosen.days,
    acquiredDay: day,
  };
  household.workToolsAcquired ??= { wood: 0, iron: 0 };
  household.workToolsAcquired[chosen.kind] = (
    household.workToolsAcquired[chosen.kind] ?? 0
  ) + 1;
  return true;
}

function wearHouseholdWorkTool(household, effort) {
  if (!(effort > 1e-9) || !household.workTool) return false;
  household.workTool.durability = Math.max(0, household.workTool.durability - effort);
  if (household.workTool.durability > 1e-9) return false;
  const kind = household.workTool.kind;
  household.workTool = null;
  household.workToolsBroken = (household.workToolsBroken ?? 0) + 1;
  return kind;
}

function recordMissingWorkToolDemand(economy, household) {
  const need = householdWorkToolNeed(household);
  if (need) recordEconomicDemand(economy, need.goods, need.qty, 0, "work_tools");
}

// 日次生産を持たない給与職も、実際に働いた日だけ同じ作業道具を使う。
// 速度倍率は摩耗前の道具でその日の仕事を行った値を返し、壊れた後は手元の
// 材料で交換できなければ、次の勤務日から素手へ戻る。
export function useHouseholdWorkTool(economy, physical, household, {
  day = economy.currentDay,
  effort = 1,
} = {}) {
  if (!Number.isFinite(effort) || effort < 0) {
    throw new TypeError("work tool effort must be non-negative and finite");
  }
  acquireHouseholdWorkTool(economy, physical, household, { day });
  const multiplier = householdWorkToolMultiplier(household);
  if (effort <= 1e-9) return { multiplier, brokenKind: null };
  const brokenKind = wearHouseholdWorkTool(household, effort);
  if (
    brokenKind
    && !acquireHouseholdWorkTool(economy, physical, household, { day })
  ) {
    recordEconomyEvent(
      economy,
      day,
      `${household.job}#${household.id} ${brokenKind === "iron" ? "鉄" : "木"}の作業道具が摩耗し、素手で作業`,
    );
  }
  return { multiplier, brokenKind };
}

export function isHouseholdCapitalNeed(physical, household, goods) {
  const needs = householdBuildingNeeds(physical, household);
  const toolNeed = householdWorkToolNeed(household);
  const fishingRigNeed = householdFishingRigNeed(household);
  return (needs.construction[goods] ?? 0) > 1e-9
    || (needs.repair[goods] ?? 0) > 1e-9
    || (
      toolNeed?.goods === goods
      && householdMaterialAmount(physical, household, goods) < toolNeed.qty - 1e-9
    )
    || (fishingRigNeed?.materials[goods] ?? 0) > 1e-9;
}

export function buildingConditionMultiplier(physical, household) {
  if (!physical) return 1;
  const condition = buildingById(physical, household?.buildingId)?.condition;
  if (!Number.isFinite(condition) || condition >= 70) return 1;
  if (condition >= 40) return 0.9;
  return 0.75;
}

export function householdEat(household) {
  return household.members.length;
}

export function householdHaul(household, { useCart = Boolean(household.cart) } = {}) {
  return householdTransportPlan(household, { useCart })
    .reduce((total, porter) => total + porter.capacity, 0);
}

export function householdTransportPlan(
  household,
  { useCart = Boolean(household.cart) } = {},
) {
  const canUseBackpack = (household.pantry?.tools ?? 0) > 1e-9;
  return household.members.map((member, index) => {
    if (index === 0 && useCart && household.cart) {
      const iron = household.cart.kind === "iron";
      return {
        memberId: member.id ?? `${household.id}:${index}`,
        memberName: member.name ?? `住民${index + 1}`,
        tier: iron ? "iron_cart" : "wood_cart",
        mode: "cart",
        capacity: iron ? P.CART_IRON_CAPACITY : P.CART_WOOD_CAPACITY,
        assetId: household.cart.id,
        cartKind: household.cart.kind,
      };
    }
    return {
      memberId: member.id ?? `${household.id}:${index}`,
      memberName: member.name ?? `住民${index + 1}`,
      tier: canUseBackpack ? "backpack" : "hand",
      mode: "walk",
      capacity: canUseBackpack ? P.CART_BACKPACK_CAPACITY : P.CART_HAND_CAPACITY,
      assetId: null,
      cartKind: null,
    };
  });
}

export function householdInputBuilding(physical, household) {
  if (!physical || !household.buildingId) return null;
  return buildingById(physical, household.buildingId);
}

export function productionInputAmount(physical, household, goods) {
  const building = householdInputBuilding(physical, household);
  return building
    ? sectionAmount(building, "input", goods)
    : household.pantry[goods];
}

function withdrawProductionInput(physical, household, goods, qty) {
  const building = householdInputBuilding(physical, household);
  if (building) withdrawInventory(building, "input", goods, qty);
  else household.pantry[goods] -= qty;
}

export function householdMaterialAmount(physical, household, goods) {
  const building = householdInputBuilding(physical, household);
  return household.pantry[goods]
    + (building ? sectionAmount(building, "input", goods) : 0);
}

function withdrawHouseholdMaterial(physical, household, goods, qty) {
  const fromPantry = Math.min(household.pantry[goods], qty);
  household.pantry[goods] -= fromPantry;
  const remaining = qty - fromPantry;
  if (remaining > 1e-9) {
    const building = householdInputBuilding(physical, household);
    if (!building) throw new Error(`世帯${household.id}の${goods}が不足しています`);
    withdrawInventory(building, "input", goods, remaining);
  }
}

function tilePosition(position) {
  return { x: Math.round(position.x), y: Math.round(position.y) };
}

function householdEntrance(physical, household) {
  return householdInputBuilding(physical, household)?.entrance ?? tilePosition(household);
}

function logisticsEntrance(physical, role, fallback) {
  const buildingId = physical?.roleBuildingIds?.[role];
  return buildingById(physical, buildingId)?.entrance ?? tilePosition(fallback);
}

export function householdMarketId(household) {
  return household?.marketId ?? "main";
}

export function marketBuildingForId(physical, marketId = "main") {
  if (!physical) return null;
  const normalizedId = marketId ?? "main";
  if (normalizedId === "main") return companyLogisticsSite(physical, "market");
  return (physical.buildings ?? []).find((building) => (
    building.type === "market"
    && (
      building.marketId === normalizedId
      || building.roles?.includes(`market:${normalizedId}`)
    )
  )) ?? null;
}

export function householdMarketEntrance(economy, physical, household) {
  const marketId = householdMarketId(household);
  const recorded = physical
    ? buildingById(physical, household?.marketBuildingId)
    : null;
  if (recorded?.type === "market" && recorded.entrance) return recorded.entrance;
  const market = marketBuildingForId(physical, marketId);
  if (market?.entrance) return market.entrance;
  if (
    Number.isFinite(household?.marketEntrance?.x)
    && Number.isFinite(household?.marketEntrance?.y)
  ) return household.marketEntrance;
  return marketId === "main" ? economy?.market ?? null : null;
}

// 市場別の価格帳。単一市場(main)は economy.px をそのまま使い、従来挙動と同値。
// 第二市場は初回参照時に BELIEF0 から始まる独自の帳を持つ(価格は市場ごとに形成される)。
export function marketPriceBook(economy, marketId = "main") {
  if (!marketId || marketId === "main") return economy.px;
  economy.pxm ??= {};
  economy.pxm[marketId] ??= { ...P.BELIEF0 };
  return economy.pxm[marketId];
}

export function marketPathLength(economy, physical, household, mode = "walk") {
  const marketEntrance = householdMarketEntrance(economy, physical, household);
  if (!marketEntrance) return Infinity;
  if (!physical) {
    return Math.hypot(household.x - marketEntrance.x, household.y - marketEntrance.y);
  }
  return pathLen(
    physical,
    householdEntrance(physical, household),
    marketEntrance,
    mode,
  );
}

export function marketTripDuration(economy, physical, household) {
  const cartDistance = household.cart
    ? marketPathLength(economy, physical, household, "cart")
    : Infinity;
  const mode = Number.isFinite(cartDistance) ? "cart" : "walk";
  return marketPathLength(economy, physical, household, mode) * 2 + 2;
}

export function productionMultiplierForTrip(tripTicks) {
  if (!Number.isFinite(tripTicks) || tripTicks < 0) {
    if (tripTicks === Infinity) return 0;
    throw new TypeError("tripTicks must be non-negative and finite");
  }
  return Math.max(0, (30 - tripTicks) / 30);
}

export function marketTripCost(economy, physical, household) {
  const distance = marketPathLength(economy, physical, household);
  return Math.min(Math.max(10, distance * 2.2), householdHaul(household) * 0.8);
}

export function householdClass(household) {
  return JOBCLS[household.job];
}

export function economicMaterialSnapshot(economy, physical = null) {
  const inventory = {};
  const cargo = {};
  for (const household of economy.households) {
    for (const [goods, qty] of Object.entries(household.pantry)) {
      inventory[goods] = (inventory[goods] ?? 0) + qty;
    }
    if (household.cargo) {
      const manifests = [
        household.cargo.manifest
          ?? (household.cargo.goods ? { [household.cargo.goods]: household.cargo.qty } : {}),
        household.cargo.returnManifest ?? {},
      ];
      for (const manifest of manifests) {
        for (const [goods, qty] of Object.entries(manifest)) {
          cargo[goods] = (cargo[goods] ?? 0) + qty;
        }
      }
    }
    if (household.fishingRig?.durability > 1e-9) {
      const recipe = fishingRigRecipe(household.fishingRig.kind);
      const remaining = Math.min(
        1,
        household.fishingRig.durability / Math.max(1e-9, household.fishingRig.maxDurability),
      );
      for (const [goods, qty] of Object.entries(recipe.materials)) {
        inventory[goods] = (inventory[goods] ?? 0) + qty * remaining;
      }
    }
  }
  for (const ruin of economy.ruins) {
    for (const [goods, qty] of Object.entries(ruin.inventory)) {
      inventory[goods] = (inventory[goods] ?? 0) + qty;
    }
  }
  if (physical) {
    for (const building of physical.buildings) {
      for (const section of Object.values(building.inventory)) {
        for (const [goods, qty] of Object.entries(section)) {
          inventory[goods] = (inventory[goods] ?? 0) + qty;
        }
      }
    }
    const activeJobs = Array.isArray(physical.activeHaulJobIds)
      ? physical.activeHaulJobIds.map((jobId) => haulJobById(physical, jobId)).filter(Boolean)
      : physical.haulJobs.filter((job) => job.status === "in_transit");
    for (const job of activeJobs) {
      if (!job.economicLogistics || !job.carrier.cargo) continue;
      const { goods, qty } = job.carrier.cargo;
      cargo[goods] = (cargo[goods] ?? 0) + qty;
    }
    for (const pile of physical.groundPiles) {
      inventory[pile.goods] = (inventory[pile.goods] ?? 0) + pile.qty;
    }
    // 旧状態や市場棟未配置の市場だけは、屋台・返品を直接計上する。
    // 市場棟がある場合は棚在庫ですでに数えているため重複させない。
    for (const [goods, stalls] of Object.entries(economy.stalls)) {
      for (const stall of stalls) {
        if (!marketBuildingForId(physical, stall.marketId ?? "main")) {
          inventory[goods] = (inventory[goods] ?? 0) + stall.qty;
        }
      }
    }
    for (const lot of economy.marketReturns ?? []) {
      if (!marketBuildingForId(physical, lot.marketId ?? "main")) {
        inventory[lot.goods] = (inventory[lot.goods] ?? 0) + lot.qty;
      }
    }
  } else {
    for (const [goods, stalls] of Object.entries(economy.stalls)) {
      for (const stall of stalls) inventory[goods] = (inventory[goods] ?? 0) + stall.qty;
    }
    for (const lot of economy.marketReturns ?? []) {
      inventory[lot.goods] = (inventory[lot.goods] ?? 0) + lot.qty;
    }
    for (const [goods, qty] of Object.entries(economy.stock)) {
      inventory[goods] = (inventory[goods] ?? 0) + qty;
    }
    for (const [goods, qty] of Object.entries(economy.marketStock ?? {})) {
      inventory[goods] = (inventory[goods] ?? 0) + qty;
    }
    for (const [goods, qty] of Object.entries(economy.importStock ?? {})) {
      inventory[goods] = (inventory[goods] ?? 0) + qty;
    }
  }
  for (const [marketId, table] of Object.entries(economy.marketStockM ?? {})) {
    if (physical && marketBuildingForId(physical, marketId)) continue;
    for (const [goods, qty] of Object.entries(table)) {
      inventory[goods] = (inventory[goods] ?? 0) + qty;
    }
  }
  for (const route of economy.caravans ?? []) {
    for (const [goods, qty] of Object.entries(route.cargo ?? {})) {
      cargo[goods] = (cargo[goods] ?? 0) + qty;
    }
  }
  // 石畳工事場へ買い付け済みだが、まだ道路へ投入していない石。
  inventory.stone = (inventory.stone ?? 0) + Math.max(0, economy.paveBought ?? 0);
  return { inventory, cargo };
}

export function roadPavingStoneCost(physical, roadKey) {
  const [x, y] = parseKey(roadKey);
  const port = physical ? buildingById(physical, physical.roleBuildingIds?.port) : null;
  if (!port) return P.PAVE_TILE_STONE;
  const maxX = port.x + port.w - 1;
  const maxY = port.y + port.h - 1;
  const dx = Math.max(port.x - x, 0, x - maxX);
  const dy = Math.max(port.y - y, 0, y - maxY);
  return Math.max(dx, dy) <= 2 ? P.PAVE_PORT_TILE_STONE : P.PAVE_TILE_STONE;
}

function unpavedRoadKeys(physical, economy) {
  if (!physical) return [];
  return Object.keys(physical.roads ?? {})
    .filter((roadKey) => {
      const [x, y] = parseKey(roadKey);
      return !isPavedRoad(physical, x, y);
    })
    .sort((left, right) => {
      const trafficDiff = (economy.traffic?.[right] ?? 0) - (economy.traffic?.[left] ?? 0);
      if (trafficDiff !== 0) return trafficDiff;
      const [leftX, leftY] = parseKey(left);
      const [rightX, rightY] = parseKey(right);
      return leftY - rightY || leftX - rightX;
    });
}

function remainingRoadPavingStoneNeed(physical, economy) {
  return unpavedRoadKeys(physical, economy).reduce(
    (sum, roadKey) => sum + roadPavingStoneCost(physical, roadKey),
    0,
  );
}

export function runRoadPaving(economy, physical, { day } = {}) {
  const roads = Object.keys(physical?.roads ?? {});
  const pending = unpavedRoadKeys(physical, economy);
  economy.paved = roads.length > 0 && pending.length === 0;
  if (!economy.paving || pending.length === 0) {
    return { pavedTiles: [], stoneUsed: 0, remainingTiles: pending.length };
  }

  const totalNeed = remainingRoadPavingStoneNeed(physical, economy);
  let worksBudget = P.PAVE_DAILY_STONE;
  let stoneStock = Math.max(0, economy.paveBought ?? 0);
  let stoneUsed = 0;
  const pavedTiles = [];
  for (const roadKey of pending) {
    const stoneCost = roadPavingStoneCost(physical, roadKey);
    if (stoneCost > worksBudget + 1e-9 || stoneCost > stoneStock + 1e-9) continue;
    const [x, y] = parseKey(roadKey);
    if (!paveRoadTile(physical, x, y)) continue;
    worksBudget -= stoneCost;
    stoneStock -= stoneCost;
    stoneUsed += stoneCost;
    pavedTiles.push(roadKey);
  }
  economy.paveBought = stoneStock;
  if (stoneUsed > 0) {
    recordEconomicMaterialFlow(economy, "stone", "cons", stoneUsed, "道路セルへの石畳敷設");
  }
  recordEconomicDemand(
    economy,
    "stone",
    Math.min(P.PAVE_DAILY_STONE, totalNeed),
    stoneUsed,
    "road_paving",
  );

  const remainingTiles = unpavedRoadKeys(physical, economy).length;
  economy.paved = roads.length > 0 && remainingTiles === 0;
  if (pavedTiles.length > 0) {
    const suffix = remainingTiles > 0 ? `（未舗装 ${remainingTiles}区画）` : "";
    recordEconomyEvent(economy, day, `石畳を${pavedTiles.length}区画敷設${suffix}`);
  }
  if (economy.paved && pavedTiles.length > 0) {
    recordEconomyEvent(economy, day, "★島内の全道路が石畳になった");
  }
  return { pavedTiles, stoneUsed, remainingTiles };
}

function consumeFood(economy, household, goods, qty, kinds) {
  if (qty <= 1e-9) return 0;
  household.pantry[goods] -= qty;
  kinds.add(FOOD_KIND[goods]);
  economy.led.eat[goods] = (economy.led.eat[goods] ?? 0) + qty;
  recordEconomicMaterialFlow(economy, goods, "cons", qty, `世帯${household.id}の食事`);
  return qty;
}

export function recordEconomyEvent(economy, day, message) {
  economy.events.push([day, message]);
  economy.eventCount = (economy.eventCount ?? economy.events.length - 1) + 1;
  if (economy.events.length > 400) economy.events.shift();
}

function settlementZoneForBuilding(economy, buildingId) {
  return economy.zones.find((zone) => zone.buildingId === buildingId) ?? null;
}

function releaseHouseholdBuilding(economy, physical, household) {
  const building = physical ? buildingById(physical, household.buildingId) : null;
  if (building?.ownerHouseholdId === household.id) building.ownerHouseholdId = null;
  const zone = settlementZoneForBuilding(economy, household.buildingId);
  if (zone) {
    zone.filled = false;
    zone.vacated = true;
  }
  return building;
}

function disperseHousehold(economy, household, day, physical = null) {
  recordEconomyEvent(economy, day, `☠ ${household.sur}家は離散した——家は廃屋になった`);
  // dayEndは離散後も、その世帯オブジェクトに対する文化消費まで続く。
  // pantryを廃屋在庫と共有し、正本の走査順と新エンジンの物資保存を両立する。
  const inventory = household.pantry;
  for (const manifest of [household.cargo?.manifest, household.cargo?.returnManifest]) {
    for (const [goods, qty] of Object.entries(manifest ?? {})) {
      inventory[goods] += qty;
    }
  }
  household.cargo = null;
  household.marketCarrier = null;
  if (household.fishingRig?.durability > 1e-9) {
    const recipe = fishingRigRecipe(household.fishingRig.kind);
    const remaining = Math.min(
      1,
      household.fishingRig.durability / Math.max(1e-9, household.fishingRig.maxDurability),
    );
    for (const [goods, qty] of Object.entries(recipe.materials)) {
      inventory[goods] += qty * remaining;
    }
    household.fishingRig = null;
  }
  const market = marketBuildingForId(physical, householdMarketId(household));
  for (const [goods, stalls] of Object.entries(economy.stalls)) {
    for (let index = stalls.length - 1; index >= 0; index -= 1) {
      if (stalls[index].householdId !== household.id) continue;
      inventory[goods] += stalls[index].qty;
      if (market) withdrawInventory(market, "outbound", goods, stalls[index].qty);
      stalls.splice(index, 1);
    }
  }
  for (let index = economy.marketReturns.length - 1; index >= 0; index -= 1) {
    const lot = economy.marketReturns[index];
    if (lot.householdId !== household.id) continue;
    inventory[lot.goods] += lot.qty;
    if (market) withdrawInventory(market, "pickup", lot.goods, lot.qty);
    economy.marketReturns.splice(index, 1);
  }
  economy.ruins.push({
    x: household.x,
    y: household.y,
    buildingId: household.buildingId,
    formerHouseholdId: household.id,
    inventory,
  });
  releaseHouseholdBuilding(economy, physical, household);
  const rest = economy.households.filter((candidate) => candidate !== household);
  if (rest.length > 0 && household.purse > 0) {
    const near = rest
      .sort((a, b) => Math.hypot(a.x - household.x, a.y - household.y)
        - Math.hypot(b.x - household.x, b.y - household.y))
      .slice(0, 3);
    const share = household.purse / near.length;
    for (const heir of near) heir.purse += share;
    household.purse = 0;
  } else {
    if (household.purse !== 0) {
      postCompanyLedger(economy.company, {
        day,
        amount: household.purse,
        reason: household.purse > 0 ? "相続人なき遺産" : "離散世帯の貸し倒れ",
      });
    }
    household.purse = 0;
  }
  economy.households.splice(economy.households.indexOf(household), 1);
}

function runHouseholdFoodAndDeath(
  economy,
  household,
  day,
  markPhase = () => {},
  physical = null,
) {
  markPhase("food");
  let need = householdEat(household);
  economy.led.need += need;
  const kinds = new Set();

  for (const goods of ["pres", "wheat", "pick"]) {
    const used = Math.min(household.pantry[goods], need * P.RATION * 0.85);
    need -= consumeFood(economy, household, goods, used, kinds);
  }
  for (let pass = 0; pass < 2; pass += 1) {
    const available = ["fish", "veg", "meat"].filter((goods) => household.pantry[goods] > 1e-9);
    if (available.length === 0 || need <= 1e-9) break;
    const share = need / available.length;
    for (const goods of available) {
      const used = Math.min(household.pantry[goods], share);
      need -= consumeFood(economy, household, goods, used, kinds);
    }
  }
  for (const goods of ["pres", "wheat", "pick"]) {
    if (need <= 1e-9) break;
    const used = Math.min(household.pantry[goods], need);
    need -= consumeFood(economy, household, goods, used, kinds);
  }
  if (need > 0.5) {
    const forage = Math.min(need, householdEat(household) * 0.75);
    need -= forage;
    const accounted = forage * 0.3;
    recordEconomicMaterialFlow(economy, "veg", "prod", accounted, `世帯${household.id}の採集`);
    recordEconomicMaterialFlow(
      economy,
      "veg",
      "cons",
      accounted,
      `世帯${household.id}の採集分を即時消費`,
      { includeInDaily: false },
    );
  }

  const hungry = need > 0.5;
  if (hungry) {
    household.hunger += 1;
    economy.famine += 1;
    economy.hungryN += 1;
    household.hungerRun = (household.hungerRun ?? 0) + 1;
  } else {
    household.hungerRun = 0;
  }
  (household.hungerHist ??= []).push(hungry ? 1 : 0);

  markPhase("death");
  if (household.hungerRun >= 60) {
    household.hungerRun = 30;
    const dead = household.members.pop();
    recordEconomyEvent(economy, day, `☠ ${household.sur}家の${dead?.name ?? "一人"}が餓えで亡くなった`);
    if (household.members.length <= 2) disperseHousehold(economy, household, day, physical);
  }

  household.kindLog.push([day, [...kinds]]);
  for (const kind of kinds) household.kindDays[kind] = (household.kindDays[kind] ?? 0) + 1;
  while (household.kindLog.length > 0 && household.kindLog[0][0] <= day - 45) {
    for (const kind of household.kindLog[0][1]) household.kindDays[kind] -= 1;
    household.kindLog.shift();
  }
}

function consumeCultureGoods(economy, physical, household, goods, dailyNeed, satisfied) {
  const used = Math.min(householdMaterialAmount(physical, household, goods), dailyNeed);
  withdrawHouseholdMaterial(physical, household, goods, used);
  satisfied[goods] = used >= dailyNeed * 0.95;
  recordEconomicDemand(economy, goods, dailyNeed, used, "households");
  if (used > 1e-9) {
    recordEconomicMaterialFlow(economy, goods, "cons", used, `世帯${household.id}の文化消費`);
  }
}

function runHouseholdCultureAndLadder(economy, physical, household, day, markPhase = () => {}) {
  markPhase("culture");
  const month = calendarMonth(economy, day);
  const charcoalMultiplier = month >= 10 || month <= 2 ? 2 : 0.6;
  const satisfied = {};
  for (const [goods, baseNeed] of [
    ["tools", P.D_TOOL],
    ["salt", P.D_SALT],
    ["char", P.D_CHAR * charcoalMultiplier],
    ["cloth", P.D_CLOTH],
    ["iron", P.D_IRON],
  ]) {
    consumeCultureGoods(
      economy,
      physical,
      household,
      goods,
      baseNeed * Math.pow(P.CMULT, household.lv),
      satisfied,
    );
  }

  const kindDays = household.kindDays;
  satisfied.food1 = Object.values(kindDays).some((value) => value > 0);
  satisfied.food2 = Object.values(kindDays).filter((value) => value > 5).length >= 2;
  satisfied.grain = (kindDays.wheat ?? 0) > 5;
  satisfied.saltchar = satisfied.salt && satisfied.char;
  satisfied.food3 = Object.values(kindDays).filter((value) => value > 5).length >= 3;

  if (
    household.job === "veg"
    && household.pantry.veg > householdEat(household) * 2
    && householdMaterialAmount(physical, household, "salt") > 0.2
  ) {
    const raw = Math.min(
      household.pantry.veg - householdEat(household) * 2,
      householdMaterialAmount(physical, household, "salt") / P.PICK_SALT,
      15,
    );
    const salt = raw * P.PICK_SALT;
    const pick = raw * P.PR_PICK;
    household.pantry.veg -= raw;
    withdrawHouseholdMaterial(physical, household, "salt", salt);
    household.pantry.pick += pick;
    recordEconomicMaterialFlow(economy, "veg", "cons", raw, `世帯${household.id}の漬け込み`);
    recordEconomicMaterialFlow(economy, "salt", "cons", salt, `世帯${household.id}の漬け込み`);
    recordEconomicMaterialFlow(economy, "pick", "prod", pick, `世帯${household.id}の漬け込み`);
  }
  if (household.job === "fisher" && household.pantry.fish > 1e-9) {
    const raw = Math.min(
      household.pantry.fish,
      householdMaterialAmount(physical, household, "salt") / P.PRES_SALT,
    );
    const smoked = Math.min(
      raw,
      householdMaterialAmount(physical, household, "char") / P.SMOKE_CHAR,
    );
    const salt = raw * P.PRES_SALT;
    const charcoal = smoked * P.SMOKE_CHAR;
    const preserved = smoked * P.PR_SMOKE + (raw - smoked) * P.PR_SALT;
    household.pantry.fish -= raw;
    withdrawHouseholdMaterial(physical, household, "salt", salt);
    withdrawHouseholdMaterial(physical, household, "char", charcoal);
    household.pantry.pres += preserved;
    recordEconomicMaterialFlow(economy, "fish", "cons", raw, `世帯${household.id}の保存加工`);
    recordEconomicMaterialFlow(economy, "salt", "cons", salt, `世帯${household.id}の保存加工`);
    recordEconomicMaterialFlow(economy, "char", "cons", charcoal, `世帯${household.id}の燻製加工`);
    recordEconomicMaterialFlow(economy, "pres", "prod", preserved, `世帯${household.id}の保存加工`);
  }

  const fishRot = household.pantry.fish / P.FISH_LIFE;
  household.pantry.fish -= fishRot;
  economy.led.spoil.fish = (economy.led.spoil.fish ?? 0) + fishRot;
  if (fishRot > 0) {
    recordEconomicMaterialFlow(
      economy,
      "fish",
      "cons",
      fishRot,
      `世帯${household.id}の魚の腐敗`,
      { includeInDaily: false },
    );
  }
  const vegRot = household.pantry.veg / P.VEG_LIFE;
  household.pantry.veg -= vegRot;
  economy.led.spoil.veg = (economy.led.spoil.veg ?? 0) + vegRot;
  if (vegRot > 0) {
    recordEconomicMaterialFlow(
      economy,
      "veg",
      "cons",
      vegRot,
      `世帯${household.id}の野菜の腐敗`,
      { includeInDaily: false },
    );
  }

  markPhase("ladder");
  household.satLast = satisfied;
  const requirements = LADDER[householdClass(household)];
  const keep = requirements.slice(0, household.lv).every((requirement) => satisfied[requirement]);
  const next = household.lv < requirements.length ? satisfied[requirements[household.lv]] : false;
  if (keep && next) {
    household.up += 1;
    household.down = 0;
    if (household.up >= P.UP_DAYS * (household.lv + 1)) {
      household.lv += 1;
      household.up = 0;
      recordEconomyEvent(economy, day, `${household.job}#${household.id} ▲Lv${household.lv}`);
    }
  } else if (keep) {
    household.up = Math.max(0, household.up - 3);
    household.down = 0;
  } else {
    household.up = Math.max(0, household.up - 3);
    household.down += 1;
    if (household.down >= P.DOWN_DAYS && household.lv > 0) {
      household.lv -= 1;
      household.down = 0;
      recordEconomyEvent(economy, day, `${household.job}#${household.id} ▼Lv${household.lv}`);
    }
  }

  if ((day - 1) % 360 === 0) household.incY = 0;
  household.incY = (household.incY ?? 0) + household.income30;
  household.incomeLog.push(household.income30);
  household.incM += household.income30;
  household.income30 = 0;
  if (household.incomeLog.length > 30) household.incomeLog.shift();
  if (day % 30 === 0) {
    household.incMonths.push(household.incM);
    household.incM = 0;
    if (household.incMonths.length > 12) household.incMonths.shift();
  }
  household.purseLog.push(household.purse);
  if (household.purseLog.length > 31) household.purseLog.shift();
}

function runHouseholdDayEnd(economy, physical, { day, markPhase = () => {} }) {
  economy.hungryN = 0;
  for (const household of economy.households) {
    runHouseholdFoodAndDeath(economy, household, day, markPhase, physical);
    runHouseholdCultureAndLadder(economy, physical, household, day, markPhase);
  }
  if (physical) {
    for (const household of economy.households) {
      const building = ensureBuildingShelves(buildingById(physical, household.buildingId));
      if (!building) continue;
      for (const [goods, life] of [["fish", P.FISH_LIFE], ["veg", P.VEG_LIFE]]) {
        const qty = sectionAmount(building, "input", goods);
        if (qty <= 1e-9) continue;
        const spoiled = qty / life;
        withdrawInventory(building, "input", goods, spoiled);
        economy.led.spoil[goods] = (economy.led.spoil[goods] ?? 0) + spoiled;
        recordEconomicMaterialFlow(
          economy,
          goods,
          "cons",
          spoiled,
          `世帯${household.id}の原料棚での${goods === "fish" ? "魚" : "野菜"}の腐敗`,
          { includeInDaily: false },
        );
      }
    }
  }
  for (const phase of ["food", "death", "culture", "ladder"]) markPhase(phase);
  return { hungry: economy.hungryN, famine: economy.famine };
}

export function runHouseholdSurvival(economy, { day, physical = null }) {
  if (!Number.isSafeInteger(day) || day <= 0) throw new TypeError("survival day must be a positive safe integer");
  economy.hungryN = 0;
  for (const household of economy.households) {
    runHouseholdFoodAndDeath(economy, household, day, () => {}, physical);
  }
  return { hungry: economy.hungryN, famine: economy.famine };
}

function terrainKindAt(physical, x, y) {
  const tile = physical?.terrain?.[y]?.[x];
  return typeof tile === "string" ? tile : tile?.kind;
}

function setTerrainKind(physical, x, y, kind) {
  const tile = physical.terrain[y][x];
  const previous = typeof tile === "string" ? tile : tile.kind;
  if (previous === kind) return;
  if (typeof tile === "string") physical.terrain[y][x] = kind;
  else tile.kind = kind;
  physical.travelRevision = (physical.travelRevision ?? 0) + 1;
}

export function woodStage(stock) {
  if (!(stock > 0)) return 0;
  if (stock > P.WOOD0 * 0.65) return 3;
  if (stock > P.WOOD0 * 0.3) return 2;
  return 1;
}

function syncWoodStageTile(physical, x, y, stock) {
  const tile = physical?.terrain?.[y]?.[x];
  if (!tile || typeof tile !== "object" || tile.kind !== "forest") return;
  const stage = woodStage(stock);
  if (tile.wood === stage) return;
  tile.wood = stage;
  physical.travelRevision = (physical.travelRevision ?? 0) + 1;
}

export function initializeNaturalResources(economy, physical) {
  economy.natural.bay = P.BAY0;
  economy.natural.bay2 = P.BAY0;
  economy.natural.wood = {};
  for (let y = 0; y < physical.height; y += 1) {
    for (let x = 0; x < physical.width; x += 1) {
      if (terrainKindAt(physical, x, y) === "forest") {
        economy.natural.wood[`${x},${y}`] = P.WOOD0;
        const tile = physical.terrain[y][x];
        if (tile && typeof tile === "object") tile.wood = 3;
      }
    }
  }
  return economy.natural;
}

const WOOD_NEIGHBORHOOD_CACHE = new WeakMap();

function resourceTargetValid(economy, physical, household, target) {
  if (!physical?.terrain || !target) return false;
  if (household.job === "logger") {
    return terrainKindAt(physical, target.x, target.y) === "forest"
      && (economy.natural.wood[`${target.x},${target.y}`] ?? 0) > 0.5;
  }
  if (household.job === "fisher") {
    return [
      [1, 0], [-1, 0], [0, 1], [0, -1],
    ].some(([offsetX, offsetY]) => (
      terrainKindAt(physical, target.x + offsetX, target.y + offsetY) === "water"
    ));
  }
  return false;
}

export function resourceWorkEfficiency(oneWayTicks) {
  if (!Number.isFinite(oneWayTicks)) return 0;
  const lostTicks = Math.max(
    0,
    (oneWayTicks - P.RESOURCE_FREE_ONE_WAY) * 2,
  );
  return Math.max(
    P.RESOURCE_MIN_EFFICIENCY,
    1 - lostTicks / P.RESOURCE_PRODUCTIVE_TICKS,
  );
}

export function ensureResourceWorkPlan(economy, physical, household) {
  if (!["logger", "fisher"].includes(household.job)) return null;
  if (!physical?.terrain) {
    household.resourceWork = {
      kind: household.job === "logger" ? "forest" : "shore",
      target: { x: Math.round(household.x), y: Math.round(household.y) },
      path: [{ x: Math.round(household.x), y: Math.round(household.y) }],
      oneWayTicks: 0,
      roundTripTicks: 0,
      workTicks: P.RESOURCE_DAY_TICKS,
      efficiency: 1,
      revision: "legacy",
    };
    return household.resourceWork;
  }
  const revision = `${physical.roadRevision ?? 0}:${physical.travelRevision ?? 0}`;
  const cached = household.resourceWork;
  if (
    cached?.revision === revision
    && resourceTargetValid(economy, physical, household, cached.target)
  ) return cached;

  const result = findNearestTravelTarget(
    physical,
    householdEntrance(physical, household),
    (x, y) => resourceTargetValid(economy, physical, household, { x, y }),
  );
  const oneWayTicks = result?.cost ?? Infinity;
  const efficiency = resourceWorkEfficiency(oneWayTicks);
  const lostTicks = Number.isFinite(oneWayTicks)
    ? Math.max(0, (oneWayTicks - P.RESOURCE_FREE_ONE_WAY) * 2)
    : P.RESOURCE_DAY_TICKS;
  household.resourceWork = {
    kind: household.job === "logger" ? "forest" : "shore",
    target: result ? { x: result.x, y: result.y } : null,
    path: result?.path ?? [],
    oneWayTicks,
    roundTripTicks: Number.isFinite(oneWayTicks) ? oneWayTicks * 2 : Infinity,
    workTicks: Number.isFinite(oneWayTicks)
      ? Math.max(3, P.RESOURCE_DAY_TICKS - lostTicks)
      : 0,
    efficiency,
    revision,
  };
  return household.resourceWork;
}

function woodNeighborhood(household, center = household) {
  const centerX = Math.round(center.x);
  const centerY = Math.round(center.y);
  const cached = WOOD_NEIGHBORHOOD_CACHE.get(household);
  if (cached?.centerX === centerX && cached?.centerY === centerY) return cached;
  const localKeys = [];
  for (let offsetY = -5; offsetY <= 5; offsetY += 1) {
    for (let offsetX = -5; offsetX <= 5; offsetX += 1) {
      localKeys.push(`${centerX + offsetX},${centerY + offsetY}`);
    }
  }
  const chopCells = [];
  for (let radius = 0; radius <= 5; radius += 1) {
    for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
      for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
        const x = centerX + offsetX;
        const y = centerY + offsetY;
        chopCells.push({ x, y, key: `${x},${y}` });
      }
    }
  }
  const next = { centerX, centerY, localKeys, chopCells };
  WOOD_NEIGHBORHOOD_CACHE.set(household, next);
  return next;
}

export function chopWood(economy, physical, household, amount) {
  if (!physical?.terrain) return amount;
  const workPlan = ensureResourceWorkPlan(economy, physical, household);
  if (!workPlan?.target) return 0;
  let gathered = 0;
  const { chopCells } = woodNeighborhood(household, workPlan.target);
  const seedFloor = P.WOOD0 * 0.15;
  for (let pass = 0; pass < 2 && gathered < amount; pass += 1) {
    for (const { x, y, key } of chopCells) {
      if (gathered >= amount) break;
      const stock = economy.natural.wood[key];
      const floor = pass === 0 ? seedFloor : 0;
      if (!(stock > floor)) continue;
      const used = Math.min(stock - floor, amount - gathered);
      economy.natural.wood[key] -= used;
      gathered += used;
      if (economy.natural.wood[key] <= 0.5) {
        economy.natural.wood[key] = 0;
        setTerrainKind(physical, x, y, "bald");
        recordEconomyEvent(economy, economy.currentDay, "森が禿げた——伐り尽くされた丘");
      } else {
        syncWoodStageTile(physical, x, y, economy.natural.wood[key]);
      }
    }
  }
  return gathered;
}

export function localWood(economy, physical, household) {
  if (!physical?.terrain) return 1;
  const workPlan = ensureResourceWorkPlan(economy, physical, household);
  if (!workPlan?.target) return 0;
  let stock = 0;
  for (const key of woodNeighborhood(household, workPlan.target).localKeys) {
    stock += economy.natural.wood[key] ?? 0;
  }
  return Math.min(1, stock / (P.WOOD0 * 8));
}

const OUTPUT_GOODS_BY_JOB = deepFreeze({
  saltworks: "salt",
  logger: "log",
  woodshop: "tools",
  charburner: "char",
  quarryman: "stone",
  miner: "ore",
  collier: "coal",
  smelter: "bar",
  smith: "iron",
  rapeseed: "cloth",
  fisher2: "meal",
  shepherd: "meat",
});

const DAILY_OUTPUT_BY_GOODS = deepFreeze({
  salt: P.Y_SALT,
  log: P.Y_LOG,
  tools: P.Y_TOOLS,
  char: P.Y_CHAR,
  stone: P.Y_STONE,
  ore: P.Y_ORE,
  coal: P.Y_COAL,
  bar: P.Y_SMELT,
  iron: P.Y_SMITH,
  cloth: P.Y_COTTON_CLOTH,
  meal: P.Y_FISH / P.MEAL_FISH,
  meat: P.Y_MEAT,
  veg: P.Y_VEG,
});

function householdStallQuantity(economy, household, goods) {
  return economy.stalls[goods].reduce((total, stall) => (
    total + (stall.householdId === household.id ? stall.qty : 0)
  ), 0);
}

function stallsSize(economy) {
  return GOODS.reduce((total, goods) => total + economy.stalls[goods].length, 0);
}

function touchStallMembership(economy) {
  economy.stallMembershipRevision = (economy.stallMembershipRevision ?? 0) + 1;
}

function stallHouseholdMembership(economy) {
  const currentTick = economy.currentTick;
  if (
    Number.isSafeInteger(currentTick)
    && economy.stallMembershipCacheTick === currentTick
    && economy.stallMembershipCacheRevision === economy.stallMembershipRevision
  ) return economy.stallHouseholdMembership;
  const size = stallsSize(economy);
  if (
    economy.stallMembershipCacheRevision === economy.stallMembershipRevision
    && economy.stallMembershipCacheSize === size
  ) {
    economy.stallMembershipCacheTick = currentTick;
    return economy.stallHouseholdMembership;
  }
  const membership = {};
  for (const goods of GOODS) {
    for (const stall of economy.stalls[goods]) membership[stall.householdId] = true;
  }
  economy.stallHouseholdMembership = membership;
  economy.stallMembershipCacheRevision = economy.stallMembershipRevision;
  economy.stallMembershipCacheSize = size;
  economy.stallMembershipCacheTick = currentTick;
  return membership;
}

function hasHouseholdStall(economy, household) {
  return stallHouseholdMembership(economy)[household.id] === true;
}

export function shouldPauseProduction(economy, household) {
  const goods = OUTPUT_GOODS_BY_JOB[household.job];
  if (!goods) return false;
  const daily = DAILY_OUTPUT_BY_GOODS[goods] * householdMult(household);
  return household.pantry[goods] + householdStallQuantity(economy, household, goods) > daily * 10;
}

export function staplePrice(economy) {
  return Math.max(
    1,
    Math.min(
      economy.px.wheat ?? 2,
      economy.px.veg ?? 9,
      economy.px.pres ?? 9,
      P.IMP.wheat,
    ),
  );
}

export function productionCost(economy, physical, household, goods, { day = economy.currentDay } = {}) {
  const month = calendarMonth(economy, day);
  const winter = month >= 10 || month <= 2;
  const dailyYield = {
    fish: winter ? P.Y_FISH_W : P.Y_FISH,
    veg: month >= 3 && month <= 10 ? P.Y_VEG : 0.01,
    wheat: P.Y_WHEAT / 360,
    meat: P.Y_MEAT,
    cloth: household.job === "rapeseed" ? P.Y_COTTON_CLOTH : P.Y_CLOTH,
    tools: P.Y_TOOLS,
    char: P.Y_CHAR,
    salt: P.Y_SALT,
    stone: P.Y_STONE,
    meal: P.Y_FISH / P.MEAL_FISH,
    log: P.Y_LOG,
    ore: P.Y_ORE,
    coal: P.Y_COAL,
    bar: P.Y_SMELT,
    iron: P.Y_SMITH,
    pres: (winter ? P.Y_FISH_W : P.Y_FISH) * P.PR_SALT,
    pick: P.Y_VEG * P.PR_PICK,
  }[goods] ?? 1;
  const scarcity = {
    log: localWood(economy, physical, household),
    fish: economy.natural.bay / P.BAY0,
    pres: economy.natural.bay / P.BAY0,
  }[goods] ?? 1;
  const labor = householdEat(household) * staplePrice(economy)
    / (dailyYield * householdMult(household) * Math.max(0.5, scarcity));
  const fuelPrice = Math.min(
    economy.px.char ?? P.BELIEF0.char,
    economy.px.coal ?? P.BELIEF0.coal,
  );
  const input = {
    salt: (P.SALT_CHAR / P.Y_SALT) * (economy.px.char ?? 2),
    tools: P.LOG_TOOL * (economy.px.log ?? 1),
    char: P.LOG_CHAR * (economy.px.log ?? 1),
    pres: P.PRES_SALT * (economy.px.salt ?? 2) / P.PR_SALT,
    pick: P.PICK_SALT * (economy.px.salt ?? 2) / P.PR_PICK,
    meal: P.MEAL_FISH * (economy.px.fish ?? P.BELIEF0.fish),
    meat: P.FEED_MEAT * Math.min(
      economy.px.wheat ?? P.BELIEF0.wheat,
      economy.px.veg ?? P.BELIEF0.veg,
    ),
    bar: P.SMELT_ORE * (economy.px.ore ?? P.BELIEF0.ore)
      + P.SMELT_FUEL * fuelPrice,
    iron: P.SMITH_BAR * (economy.px.bar ?? P.BELIEF0.bar)
      + P.SMITH_FUEL * fuelPrice,
  }[goods] ?? 0;
  return labor + input;
}

export function sellOffers(
  economy,
  household,
  { capacityLimit = householdHaul(household) } = {},
) {
  const offers = {};
  const goods = {
    fisher: "fish",
    veg: "veg",
    wheat: "wheat",
    shepherd: "meat",
    logger: "log",
    woodshop: "tools",
    charburner: "char",
    saltworks: "salt",
    fisher2: "meal",
    quarryman: "stone",
    miner: "ore",
    collier: "coal",
    smelter: "bar",
    smith: "iron",
    rapeseed: "cloth",
  }[household.job];

  if (goods === "meal") {
    if (household.pantry.meal >= 15) {
      return { meal: Math.min(household.pantry.meal, capacityLimit) };
    }
    return {};
  }
  const px = marketPriceBook(economy, householdMarketId(household));
  if (goods === "fish") {
    let keep = householdEat(household) * 1.2;
    const alternative = Math.min(px.veg ?? 9, px.wheat ?? 9, px.pres ?? 9);
    if ((px.fish ?? 2) > alternative * 1.5) keep = householdEat(household) * 0.4;
    keep += Math.min(household.pantry.salt / P.PRES_SALT, 12);
    const surplus = Math.max(0, household.pantry.fish - keep);
    if (surplus > 1e-9) offers.fish = Math.min(surplus, capacityLimit);
  } else {
    let keep = FOODS.includes(goods) ? householdEat(household) * 2 : 2;
    let rate = 0.5;
    if (goods === "wheat") {
      rate = 0.1;
      keep = householdEat(household) * P.RATION * 10;
    }
    if (goods === "veg") keep = householdEat(household) * P.RATION * 10;
    const surplus = Math.max(0, household.pantry[goods] - keep);
    if (surplus > 1e-9) {
      offers[goods] = Math.min(
        surplus * rate + 2,
        surplus,
        goods === "log" ? capacityLimit / 2 : capacityLimit,
      );
    }
  }
  const dailyFood = Math.max(1, householdEat(household));
  if (household.job === "fisher" && household.pantry.pres > dailyFood * P.PANTRY_FOOD_D) {
    offers.pres = Math.min(
      household.pantry.pres - dailyFood * P.PANTRY_FOOD_D,
      capacityLimit,
    );
  }
  if (household.job === "veg" && household.pantry.pick > 10) {
    offers.pick = Math.min(household.pantry.pick - 5, capacityLimit);
  }
  if (household.job === "shepherd" && household.pantry.cloth > 2) {
    offers.cloth = Math.min(household.pantry.cloth - 1, capacityLimit);
  }
  return offers;
}

export function loadMarketSellCargo(
  economy,
  household,
  { useCart = Boolean(household.cart) } = {},
) {
  if (household.cargo) throw new Error(`世帯${household.id}は既にcargoを運搬中です`);
  let capacity = householdHaul(household, { useCart });
  const offers = sellOffers(economy, household);
  const manifest = {};
  for (const [goods, offered] of Object.entries(offers)) {
    const unitWeight = goodsUnitWeight(goods);
    const qty = Math.min(offered, capacity / unitWeight);
    if (qty <= 1e-9) continue;
    household.pantry[goods] -= qty;
    manifest[goods] = qty;
    capacity -= qty * unitWeight;
  }
  household.cargo = { direction: "outbound", manifest };
  return household.cargo;
}

export function unloadMarketBuyCargo(household, physical = null) {
  if (household.cargo?.direction !== "inbound") {
    throw new Error(`世帯${household.id}に帰宅荷がありません`);
  }
  for (const [goods, qty] of Object.entries(household.cargo.manifest)) {
    const building = ensureBuildingShelves(householdInputBuilding(physical, household));
    let remaining = qty;
    if (building && !building.constructionConsumed) {
      const need = Math.max(
        0,
        (building.constructionRequired?.[goods] ?? 0)
          - sectionAmount(building, "construction", goods),
      );
      const delivered = Math.min(remaining, need);
      if (delivered > 0) depositInventory(building, "construction", goods, delivered);
      remaining -= delivered;
    }
    if (building?.repairPlan) {
      const need = Math.max(
        0,
        (building.repairPlan.required?.[goods] ?? 0) - sectionAmount(building, "repair", goods),
      );
      const delivered = Math.min(remaining, need);
      if (delivered > 0) depositInventory(building, "repair", goods, delivered);
      remaining -= delivered;
    }
    if (remaining > 0 && building && isProductionInput(household, goods)) {
      depositInventory(building, "input", goods, remaining);
    } else if (remaining > 0) household.pantry[goods] += remaining;
  }
  for (const [goods, qty] of Object.entries(household.cargo.returnManifest ?? {})) {
    household.pantry[goods] += qty;
  }
  const delivered = household.cargo;
  household.cargo = null;
  return delivered;
}

export const BUY_ORDER = deepFreeze([
  "ore", "bar", "log", "salt", "char", "coal", "tools", "cloth", "iron", "meal",
  "stone", "oil", "fish", "veg", "wheat", "pres", "pick", "meat",
]);

const FOOD_BUY_ORDER = deepFreeze(["wheat", "pres", "pick", "veg", "fish", "meat"]);
const CREDIT_INPUT_JOBS = new Set([
  "saltworks", "fisher2", "shepherd", "veg",
  "smelter", "smith", "woodshop", "charburner",
]);

export function buyTargets(
  economy,
  household,
  { day = economy.currentDay, physical = null } = {},
) {
  const targets = {};
  const inputQty = (goods) => productionInputAmount(physical, household, goods);
  const dailyFood = Math.max(1, householdEat(household));
  const foodDays = householdFoodDays(household);
  const px = marketPriceBook(economy, householdMarketId(household));
  const cheapest = Math.min(px.veg ?? 9, px.wheat ?? 9, px.pres ?? 9);
  const month = calendarMonth(economy, day);
  const autumn = month >= 7 && month <= 9;
  let targetDays = autumn ? 10 : P.PANTRY_FOOD_D;
  targetDays = Math.max(
    targetDays,
    Math.min(12, marketPathLength(economy, physical, household) * 0.9),
  );

  if (foodDays < targetDays) {
    const starving = foodDays < 1.5;
    const staples = household.job === "shepherd"
      ? ["pres", "pick"]
      : ["veg", "wheat", "pres", "pick"];
    for (const goods of staples) {
      targets[goods] = [
        (targetDays - foodDays) * dailyFood / 4,
        starving ? 99 : Math.min((px[goods] ?? 9) * 1.5, cheapest * 2.2),
      ];
    }
  }
  if (household.job !== "fisher" && household.job !== "fisher2") {
    targets.fish = [dailyFood * 0.5, Math.min((px.fish ?? 9) * 1.5, cheapest * 2.5)];
  }
  if (
    household.job !== "wheat"
    && household.job !== "shepherd"
    && household.pantry.wheat < dailyFood * P.RATION * 10
    && !targets.wheat
  ) {
    targets.wheat = [
      dailyFood * P.RATION * 15 - household.pantry.wheat,
      (px.wheat ?? 3) * 1.3,
    ];
  }
  if (
    household.job !== "veg"
    && household.job !== "shepherd"
    && household.pantry.veg < dailyFood * P.RATION * 6
    && !targets.veg
  ) {
    targets.veg = [
      dailyFood * P.RATION * 10 - household.pantry.veg,
      (px.veg ?? 3) * 1.3,
    ];
  }
  if (household.job !== "shepherd" && household.pantry.meat < dailyFood * P.RATION * 4 && !targets.meat) {
    targets.meat = [
      dailyFood * P.RATION * 8 - household.pantry.meat,
      Math.min((px.meat ?? 3) * 1.4, cheapest * 2.2),
    ];
  }
  if (
    (household.job === "wheat" || household.job === "rapeseed")
    && inputQty("meal") < P.FERT_NEED * 10
    && month >= 3
    && month <= 8
  ) {
    const benefit = (household.job === "wheat"
      ? P.Y_WHEAT * householdMult(household)
      : P.Y_COTTON_CLOTH * householdMult(household) * 540)
      * P.FERT_BOOST
      * (household.job === "wheat" ? (px.wheat ?? 2) : (px.cloth ?? 2.5))
      / (P.FERT_NEED * 180);
    targets.meal = [P.FERT_NEED * 20 - inputQty("meal"), benefit * 0.7];
  }
  if (household.job === "saltworks" && inputQty("char") < P.SALT_CHAR * 5) {
    targets.char = [P.SALT_CHAR * 10 - inputQty("char"), P.Y_SALT * (px.salt ?? 2) * 0.5];
  }
  if (household.job === "woodshop" && inputQty("log") < P.LOG_TOOL * 8) {
    targets.log = [
      P.LOG_TOOL * 16 - inputQty("log"),
      Math.max(0.9, (px.tools ?? 2) / P.LOG_TOOL * 0.6),
    ];
  }
  if (household.job === "charburner" && inputQty("log") < P.LOG_CHAR * 8) {
    targets.log = [
      P.LOG_CHAR * 16 - inputQty("log"),
      Math.max(0.9, (px.char ?? 2) / P.LOG_CHAR * 0.6),
    ];
  }
  if (household.job === "cartwright") {
    if (inputQty("log") < P.CART_LOG * 3) {
      targets.log = [
        P.CART_LOG * 5 - inputQty("log"),
        Math.max(0.9, (px.log ?? P.BELIEF0.log) * 1.5),
      ];
    }
    if (inputQty("tools") < P.CART_TOOLS * 3) {
      targets.tools = [
        P.CART_TOOLS * 5 - inputQty("tools"),
        Math.max(P.IMP.tools * 1.05, (px.tools ?? P.BELIEF0.tools) * 1.4),
      ];
    }
  }
  if (household.job === "smelter") {
    const inputCeiling = (px.bar ?? P.BELIEF0.bar) / P.SMELT_ORE * 0.6;
    if (inputQty("ore") < 10) {
      targets.ore = [20 - inputQty("ore"), inputCeiling];
    }
    const fuel = inputQty("char") + inputQty("coal");
    if (fuel < 5) {
      const wanted = 10 - fuel;
      targets.char = [wanted, inputCeiling];
      targets.coal = [wanted, inputCeiling];
    }
  }
  if (household.job === "smith") {
    const inputCeiling = (px.iron ?? P.IMP.iron) * 0.6;
    if (inputQty("bar") < 5) {
      targets.bar = [10 - inputQty("bar"), inputCeiling];
    }
    const fuel = inputQty("char") + inputQty("coal");
    if (fuel < 2.5) {
      const wanted = 5 - fuel;
      targets.char = [wanted, inputCeiling];
      targets.coal = [wanted, inputCeiling];
    }
  }
  if (household.job === "veg" && inputQty("salt") < 1.5) {
    targets.salt = [
      4 - inputQty("salt"),
      (px.pick ?? 2) * P.PR_PICK / P.PICK_SALT * 0.4,
    ];
  }
  if (household.job === "fisher") {
    if (inputQty("salt") < 3) {
      targets.salt = [
        6 - inputQty("salt"),
        (px.pres ?? 2) * P.PR_SALT / P.PRES_SALT * 0.5,
      ];
    }
    if (inputQty("char") < 2) {
      targets.char = [
        4 - inputQty("char"),
        (P.PR_SMOKE - P.PR_SALT) * (px.pres ?? 2) / P.SMOKE_CHAR * 0.5,
      ];
    }
  }
  if (household.job === "fisher2") {
    const dailyFish = P.Y_FISH * householdMult(household);
    if (inputQty("fish") < dailyFish) {
      targets.fish = [
        dailyFish * 2 - inputQty("fish"),
        Math.max(0.9, (px.fish ?? P.BELIEF0.fish) * 1.25),
      ];
    }
  }
  if (household.job === "shepherd") {
    const dailyFeed = P.Y_MEAT * P.FEED_MEAT * householdMult(household);
    const currentFeed = inputQty("wheat") + inputQty("veg");
    if (currentFeed < dailyFeed) {
      const wantedEach = (dailyFeed * 2 - currentFeed) / 2;
      const ceiling = Math.max(
        0.9,
        (px.meat ?? P.BELIEF0.meat) / P.FEED_MEAT * 0.65,
      );
      for (const goods of ["wheat", "veg"]) {
        if (targets[goods]) {
          targets[goods] = [
            Math.max(targets[goods][0], wantedEach),
            Math.max(targets[goods][1], ceiling),
          ];
        } else targets[goods] = [wantedEach, ceiling];
      }
    }
  }

  const buildingNeeds = householdBuildingNeeds(physical, household);
  for (const needs of [buildingNeeds.construction, buildingNeeds.repair]) {
    for (const [goods, wanted] of Object.entries(needs)) {
      if (!(wanted > 1e-9)) continue;
      const ceiling = Math.max(
        (px[goods] ?? P.BELIEF0[goods] ?? 2) * 1.6,
        P.IMP[goods] !== undefined ? P.IMP[goods] * 1.05 : 0,
      );
      if (targets[goods]) targets[goods] = [targets[goods][0] + wanted, Math.max(targets[goods][1], ceiling)];
      else targets[goods] = [wanted, ceiling];
    }
  }

  const currentRequirements = (LADDER[householdClass(household)] ?? []).slice(0, household.lv + 1);
  const needed = new Set();
  for (const requirement of currentRequirements) {
    if (requirement === "saltchar") {
      needed.add("salt");
      needed.add("char");
    } else if (["tools", "salt", "char", "cloth", "iron"].includes(requirement)) {
      needed.add(requirement);
    }
  }
  needed.add("char");
  for (const [goods, baseDaily, ceiling] of [
    ["tools", P.D_TOOL, P.IMP.tools * 1.05],
    ["salt", P.D_SALT, P.IMP.salt * 1.05],
    ["char", P.D_CHAR, 5],
    ["cloth", P.D_CLOTH, 4],
    ["iron", P.D_IRON, P.IMP.iron * 1.05],
  ]) {
    if (!needed.has(goods)) continue;
    if (targets[goods]) continue;
    const daily = baseDaily * Math.pow(P.CMULT, household.lv);
    let target = daily * P.CULT_D;
    if (goods === "char" && autumn) target = daily * 2 * 100;
    const current = householdMaterialAmount(physical, household, goods);
    if (current < target * 0.5) {
      targets[goods] = [target - current, ceiling];
    }
  }
  const toolNeed = householdWorkToolNeed(household);
  const toolMissingByGoods = {};
  if (toolNeed) {
    const missing = Math.max(
      0,
      toolNeed.qty - householdMaterialAmount(physical, household, toolNeed.goods),
    );
    toolMissingByGoods[toolNeed.goods] = missing;
    if (missing > 1e-9) {
      const ceiling = Math.max(
        (px[toolNeed.goods] ?? P.BELIEF0[toolNeed.goods]) * 1.5,
        (P.IMP[toolNeed.goods] ?? 0) * 1.05,
      );
      if (targets[toolNeed.goods]) {
        targets[toolNeed.goods] = [
          targets[toolNeed.goods][0] + missing,
          targets[toolNeed.goods][1],
        ];
      } else targets[toolNeed.goods] = [missing, ceiling];
    }
  }
  const fishingRigNeed = householdFishingRigNeed(household);
  for (const [goods, qty] of Object.entries(fishingRigNeed?.materials ?? {})) {
    const reservedForTool = toolNeed?.goods === goods ? toolNeed.qty : 0;
    const combinedMissing = Math.max(
      0,
      qty + reservedForTool - householdMaterialAmount(physical, household, goods),
    );
    const missing = Math.max(0, combinedMissing - (toolMissingByGoods[goods] ?? 0));
    if (missing <= 1e-9) continue;
    const ceiling = Math.max(
      (px[goods] ?? P.BELIEF0[goods] ?? 2) * 1.6,
      (P.IMP[goods] ?? 0) * 1.05,
    );
    if (targets[goods]) {
      targets[goods] = [targets[goods][0] + missing, Math.max(targets[goods][1], ceiling)];
    } else targets[goods] = [missing, ceiling];
  }
  return targets;
}

export function isProductionInput(household, goods) {
  return (household.job === "saltworks" && goods === "char")
    || (household.job === "fisher2" && goods === "fish")
    || (household.job === "shepherd" && (goods === "wheat" || goods === "veg"))
    || (household.job === "fisher" && ["salt", "char", "log", "tools", "cloth", "iron"].includes(goods))
    || (household.job === "veg" && goods === "salt")
    || ((household.job === "wheat" || household.job === "rapeseed") && goods === "meal")
    || (household.job === "smelter" && ["ore", "char", "coal"].includes(goods))
    || (household.job === "smith" && ["bar", "char", "coal"].includes(goods))
    || (household.job === "cartwright" && ["log", "tools"].includes(goods))
    || ((household.job === "woodshop" || household.job === "charburner") && goods === "log");
}

export function quoteAskPrice(cost, goods, random) {
  if (!Number.isFinite(cost) || cost < 0) throw new TypeError("cost must be non-negative and finite");
  if (typeof random !== "function") throw new TypeError("random must be a function");
  let ask = cost * (1.05 + random() * 1.25);
  if (P.IMP[goods]) ask = Math.min(ask, P.IMP[goods] * 0.97);
  return Math.max(ask, cost * 1.05);
}

function findHousehold(economy, householdId) {
  return economy.households.find((household) => household.id === householdId);
}

function ensureCartEconomy(economy) {
  economy.nextCartAssetId ??= 1;
  economy.companyCarts ??= [];
  economy.cartStats ??= {
    produced: 0,
    householdPurchased: 0,
    companyPurchased: 0,
    householdBroken: 0,
    companyBroken: 0,
    householdUses: 0,
    companyUses: 0,
  };
  return economy.cartStats;
}

function offeredWoodCarts(
  economy,
  { excludingHouseholdId = null, marketId = null } = {},
) {
  return economy.households
    .filter((household) => (
      household.id !== excludingHouseholdId
      && (marketId === null || householdMarketId(household) === marketId)
    ))
    .flatMap((household) => (household.cartStock ?? []).map((cart) => ({
      household,
      cart,
    })))
    .filter(({ cart }) => cart.kind === "wood" && Number.isFinite(cart.price) && cart.price > 0)
    .sort((left, right) => left.cart.price - right.cart.price
      || left.household.id - right.household.id
      || left.cart.id.localeCompare(right.cart.id));
}

export function householdCartPurchaseDecision(economy, physical, household, cart) {
  if (!cart || household.cart || household.job === "cartwright") {
    return { buy: false, reason: "not_needed" };
  }
  const walkDuration = marketPathLength(economy, physical, household, "walk") * 2 + 2;
  const cartOneWay = marketPathLength(economy, physical, household, "cart");
  if (!Number.isFinite(cartOneWay)) return { buy: false, reason: "no_cart_route" };
  const cartDuration = cartOneWay * 2 + 2;
  const personalFloor = householdTransportPlan(household, { useCart: false })[0]?.capacity
    ?? P.CART_HAND_CAPACITY;
  const capacityRatio = cart.kind === "iron"
    ? P.CART_IRON_CAPACITY / personalFloor
    : P.CART_WOOD_CAPACITY / personalFloor;
  const timeSaved = Math.max(0, walkDuration * capacityRatio - cartDuration);
  const wearPerTrip = Math.max(1, cartOneWay * 2);
  const usefulTrips = cart.durability / wearPerTrip;
  const recoveredValue = timeSaved * P.CART_TIME_VALUE * usefulTrips;
  const foodReserve = staplePrice(economy) * householdEat(household);
  const affordable = household.purse >= cart.price + foodReserve;
  return {
    buy: affordable && recoveredValue >= cart.price,
    reason: !affordable ? "food_reserve" : recoveredValue < cart.price ? "slow_payback" : "value",
    walkDuration,
    cartDuration,
    capacityRatio,
    timeSaved,
    wearPerTrip,
    usefulTrips,
    recoveredValue,
    price: cart.price,
  };
}

export function buyHouseholdWoodCart(economy, physical, household, { day }) {
  ensureCartEconomy(economy);
  const buyerMarketId = householdMarketId(household);
  const caravanNeedsCart = companyCaravanCartOrderPending(
    economy,
    physical,
    buyerMarketId,
  );
  // 荷車待ちの定期路線は既に注文を出している。完成日の午後に来た住民が
  // 先に買い切らず、翌朝の会社買付まで現物を荷車工房へ残す。
  if (caravanNeedsCart) return null;
  const offer = offeredWoodCarts(economy, {
    excludingHouseholdId: household.id,
    marketId: buyerMarketId,
  })[0];
  if (!offer) return null;
  const decision = householdCartPurchaseDecision(economy, physical, household, offer.cart);
  if (!decision.buy) return null;
  const index = offer.household.cartStock.findIndex((cart) => cart.id === offer.cart.id);
  if (index < 0) return null;
  const [cart] = offer.household.cartStock.splice(index, 1);
  household.purse -= cart.price;
  offer.household.purse += cart.price;
  offer.household.income30 += cart.price;
  household.cart = {
    ...cart,
    ownerKind: "household",
    ownerId: household.id,
    purchasedDay: day,
  };
  household.cartsPurchased = (household.cartsPurchased ?? 0) + 1;
  economy.cartStats.householdPurchased += 1;
  recordEconomyEvent(
    economy,
    day,
    `荷車購入: ${household.job}#${household.id}がcartwright#${offer.household.id}から木の荷車${cart.id}`,
  );
  return { cart: household.cart, sellerHouseholdId: offer.household.id, decision };
}

function companyCaravanCartOrderPending(economy, physical, marketId) {
  return (economy.caravans ?? []).some((route) => {
    if (route.state === "disbanded" || route.baseMarketId !== marketId) return false;
    const inn = buildingById(physical, route.baseBuildingId);
    const required = caravanCrewCount(economy, inn);
    const assigned = (route.cartAssetIds ?? []).filter((assetId) => (
      economy.companyCarts.some((asset) => asset.id === assetId && asset.durability > 1e-9)
    )).length;
    // 運行に必要な台数だけを注文済みとする。予備車まで先買いすると初月費用を
    // 不自然に前倒しし、全損時に荷車待ちになる出来事も消してしまう。
    return assigned < required;
  });
}

export function finishHouseholdCartTrip(economy, household, { day, assetId, distance }) {
  if (!assetId || household.cart?.id !== assetId) return null;
  if (!Number.isFinite(distance) || distance < 0) {
    throw new TypeError("cart trip distance must be non-negative and finite");
  }
  ensureCartEconomy(economy);
  household.cart.durability = Math.max(0, household.cart.durability - distance);
  economy.cartStats.householdUses += 1;
  if (household.cart.durability > 1e-9) return household.cart;
  const broken = household.cart;
  household.cart = null;
  household.cartsBroken = (household.cartsBroken ?? 0) + 1;
  economy.cartStats.householdBroken += 1;
  recordEconomyEvent(
    economy,
    day,
    `荷車摩耗: ${household.job}#${household.id}の木の荷車${broken.id}が役目を終えた`,
  );
  return null;
}

export function purchaseCompanyWoodCart(economy, { day, marketId = "main" }) {
  ensureCartEconomy(economy);
  const offer = offeredWoodCarts(economy, { marketId })[0];
  if (!offer) return null;
  if (economy.company.money < offer.cart.price) return null;
  const index = offer.household.cartStock.findIndex((cart) => cart.id === offer.cart.id);
  if (index < 0) return null;
  const [cart] = offer.household.cartStock.splice(index, 1);
  offer.household.purse += cart.price;
  offer.household.income30 += cart.price;
  postCompanyLedger(economy.company, {
    day,
    amount: -cart.price,
    reason: `世帯${offer.household.id}から木の荷車${cart.id}を購入`,
  });
  const asset = {
    ...cart,
    ownerKind: "company",
    ownerId: "company",
    purchasedDay: day,
    busyJobId: null,
  };
  economy.companyCarts.push(asset);
  economy.cartStats.companyPurchased += 1;
  recordEconomyEvent(
    economy,
    day,
    `会社荷車購入: cartwright#${offer.household.id}から木の荷車${cart.id}`,
  );
  assertMoneyConservation(economy, { incremental: true });
  return asset;
}

export function companyStockReleasePrice(economy, goods, { market = false } = {}) {
  const stockTable = market ? economy.marketStock : economy.stock;
  const costTable = market ? economy.marketStockCost : economy.stockCost;
  const stock = stockTable[goods] ?? 0;
  if (stock <= 1e-9) return null;
  const averageCost = (costTable[goods] ?? 0) / Math.max(1e-9, stock);
  return Math.min(
    Math.max(averageCost * 1.2, 0.3),
    (P.IMP[goods] ?? 9e9) * 0.97,
  );
}

export function pendingCompanyImportCost(economy) {
  return (economy.importRequests ?? []).reduce((total, request) => {
    if (request.aid || request.status === "sold") return total;
    const paidQty = Number.isFinite(request.paidQty)
      ? request.paidQty
      : request.status === "vessel"
        ? 0
        : request.qty;
    const unpaidQty = Math.max(0, request.qty - paidQty);
    return total + unpaidQty * (request.unitCost ?? P.IMP_COST[request.goods] ?? 0);
  }, 0);
}

export const MAINLAND_AID = deepFreeze({ BASE_WHEAT: 240, DECAY: 0.25, REFUSAL_AT: 4 });

// 本国への食料支援要請(Nao_u裁可・2026-07-20)。支援は既存の輸入経路(船→港ヤード→市場の荷車便)で届く——
// 道と市場が無い島には支援も届かない。要請を重ねると本国の心象を損ね、量が逓減し、やがて断られる。
export function requestMainlandAid(economy, physical, { day }) {
  const used = economy.mainlandAid?.requests ?? 0;
  if (used >= MAINLAND_AID.REFUSAL_AT) {
    recordEconomyEvent(economy, day, "本国は食料支援の要請を断った——度重なる要請に心象を損ねている");
    return { ok: false, refused: true, requests: used, qty: 0 };
  }
  const qty = Math.round(MAINLAND_AID.BASE_WHEAT * (1 - MAINLAND_AID.DECAY * used));
  const request = requestCompanyImport(economy, physical, "wheat", { day, qty, aid: true });
  if (!request) return { ok: false, refused: false, requests: used, qty: 0 };
  economy.mainlandAid = { requests: used + 1 };
  recordEconomyEvent(economy, day, `本国へ食料支援を要請(${used + 1}回目)——麦${qty}荷の船が発つ`);
  return { ok: true, refused: false, qty, requests: used + 1 };
}

export function requestCompanyImport(economy, physical, goods, { day, qty, aid = false }) {
  if (P.IMP[goods] === undefined) throw new Error(`輸入対象外です: ${goods}`);
  if (!Number.isFinite(qty) || qty <= 1e-9) return null;
  const port = companyLogisticsSite(physical, "port");
  if (!port) return null;
  const unitCost = aid ? 0 : (P.IMP_COST[goods] ?? P.IMP[goods] * 0.7);
  if (
    !aid
    && economy.company.money - pendingCompanyImportCost(economy) - qty * unitCost
      < -companyCreditLimit(economy, { day })
  ) return null;
  const request = {
    id: `imp${economy.nextImportRequestId}`,
    goods,
    qty,
    soldQty: 0,
    marketQty: 0,
    portQty: 0,
    status: "vessel",
    requestedDay: day,
    aid,
    unitCost,
    paidQty: 0,
  };
  economy.nextImportRequestId += 1;
  const call = dockVessel(physical, {
    portBuildingId: port.id,
    direction: "import",
    goods,
    qty,
    metadata: { kind: "import", requestId: request.id },
  });
  request.portCallId = call.id;
  economy.importRequests.push(request);
  (economy.importRequestIndex ??= {})[request.id] = economy.importRequests.length - 1;
  (economy.activeImportRequestIds ??= []).push(request.id);
  (economy.unsoldImportRequestIds ??= []).push(request.id);
  if (!aid) {
    recordEconomyEvent(
      economy,
      day,
      `本土へ${goods}を${qty.toFixed(1)}荷発注——仕入予定${(qty * unitCost).toFixed(1)}`,
    );
  }
  return request;
}

function marketShelvesForGoods(economy, physical, household, goods) {
  const marketId = householdMarketId(household);
  const shelves = economy.stalls[goods]
    .filter((stall) => (
      (stall.marketId ?? "main") === marketId
      && findHousehold(economy, stall.householdId)
      && stall.qty > 1e-9
    ))
    .map((stall) => ({ price: stall.price, qty: stall.qty }));
  const localQty = economy.marketStockM?.[marketId]?.[goods] ?? 0;
  if (localQty > 1e-9) {
    shelves.push({
      price: Math.max(0.1, marketPriceBook(economy, marketId)[goods] ?? P.BELIEF0[goods] ?? 2),
      qty: localQty,
    });
  }
  if (marketId !== "main") return shelves;
  const importQty = physical ? (economy.importStock[goods] ?? 0) : 0;
  if (importQty > 1e-9) shelves.push({ price: P.IMP[goods], qty: importQty });
  const aidQty = physical ? (economy.aidStock?.[goods] ?? 0) : 0;
  if (aidQty > 1e-9) shelves.push({ price: 0, qty: aidQty });
  const companyQty = physical
    ? (economy.marketStock[goods] ?? 0)
    : Math.max(0, (economy.stock[goods] ?? 0) - (economy.order?.g === goods ? economy.order.left : 0));
  const companyPrice = companyStockReleasePrice(economy, goods, { market: Boolean(physical) });
  if (companyQty > 1e-9 && Number.isFinite(companyPrice)) {
    shelves.push({ price: companyPrice, qty: companyQty });
  }
  return shelves;
}

function cheapestMarketFoodPrice(economy, physical, household) {
  const prices = FOODS.flatMap((goods) => (
    marketShelvesForGoods(economy, physical, household, goods)
      .filter((shelf) => shelf.price > 0)
      .map((shelf) => shelf.price)
  ));
  return prices.length > 0 ? Math.min(...prices) : staplePrice(economy);
}

function foodCashReserve(economy, physical, household) {
  return householdEat(household) * P.FOOD_FIRST_D
    * cheapestMarketFoodPrice(economy, physical, household);
}

function foodPurchaseOrder(economy, physical, household, targets, fallbackOrder) {
  const fallbackRank = new Map(fallbackOrder.map((goods, index) => [goods, index]));
  return fallbackOrder.filter((goods) => targets[goods]).sort((left, right) => {
    const leftCeiling = targets[left]?.[1] ?? 0;
    const rightCeiling = targets[right]?.[1] ?? 0;
    const lowest = (goods, ceiling) => marketShelvesForGoods(
      economy,
      physical,
      household,
      goods,
    ).filter((shelf) => shelf.price <= ceiling).reduce(
      (price, shelf) => Math.min(price, shelf.price),
      Infinity,
    );
    return lowest(left, leftCeiling) - lowest(right, rightCeiling)
      || (fallbackRank.get(left) ?? 0) - (fallbackRank.get(right) ?? 0);
  });
}

function recordCaravanRetailSale(economy, routeId, { day, amount, tripNumber = null }) {
  const route = (economy.caravans ?? []).find((candidate) => candidate.id === routeId);
  if (!route) {
    (economy.caravanSalesPending ??= {})[routeId] = (
      economy.caravanSalesPending[routeId] ?? 0
    ) + amount;
    return;
  }
  const month = Math.floor(Math.max(0, day - 1) / 30);
  route.monthly ??= {};
  route.monthly[month] ??= { sales: 0, procurement: 0, wages: 0, cartCosts: 0 };
  route.monthly[month].sales += amount;
  const trip = route.currentTrip?.tripNumber === tripNumber
    ? route.currentTrip
    : route.recentTrips?.find((candidate) => candidate.tripNumber === tripNumber);
  if (trip) trip.retailSales = (trip.retailSales ?? 0) + amount;
}

export function buyAtMarket(
  economy,
  household,
  { day, physical = null, delivery = "pantry", capacityLimit = null },
) {
  if (delivery !== "pantry" && delivery !== "cargo") {
    throw new Error(`unknown market delivery: ${delivery}`);
  }
  let capacity = capacityLimit ?? householdHaul(household);
  const targets = buyTargets(economy, household, { day, physical });
  const jobOrder = household.job === "cartwright"
    ? ["tools", "log", ...BUY_ORDER.filter((goods) => goods !== "tools" && goods !== "log")]
    : BUY_ORDER;
  const foodDays = householdFoodDays(household);
  // 食料の備えが本当に危うい世帯だけ、加工原料より先に食料を積む。
  // 旧順序(常に原料先)は市場に食料があっても加工世帯だけが飢える原因だったが、
  // 6日分を切った時点で常に食料先行にすると、原料購入と生産が細って収入が消え、
  // 島全体の財布が0へ張り付く貧困トラップを起こした(2026-07-26実測)。
  const householdFoodOrder = household.job === "shepherd"
    ? ["veg", "wheat", "fish", "pres", "pick", "meat"]
    : FOOD_BUY_ORDER;
  const pricedFoodOrder = foodPurchaseOrder(
    economy,
    physical,
    household,
    targets,
    householdFoodOrder,
  );
  const preferredOrder = foodDays < P.FOOD_FIRST_D
    ? [...pricedFoodOrder, ...jobOrder.filter((goods) => !FOODS.includes(goods))]
    : [
      ...jobOrder.filter((goods) => !FOODS.includes(goods)),
      ...pricedFoodOrder,
    ];
  const order = preferredOrder.filter((goods) => targets[goods]);
  const transactions = [];
  const manifest = {};
  const purchased = {};
  const unmet = {};
  const blockers = {};
  const processed = new Set();
  // 慢性的な食料買いで運搬枠が埋まり、原料を一切積めず生産と収入が同時に死ぬ
  // 詰み(2026-07-26実測: 加工世帯のno_capacity固定化)を防ぐため、
  // 原料の必要があるあいだは運搬枠の半分までを原料用に取り置く。
  let inputReserve = 0;
  for (const [goods, [wanted]] of Object.entries(targets)) {
    if (isProductionInput(household, goods) || isHouseholdCapitalNeed(physical, household, goods)) {
      inputReserve += Math.max(0, wanted) * goodsUnitWeight(goods);
    }
  }
  inputReserve = Math.min(capacity * 0.5, inputReserve);

  const buyerMarket = householdMarketId(household);
  for (const orderedGoods of order) {
    if (processed.has(orderedGoods)) continue;
    const fuelSubstitution = ["smelter", "smith"].includes(household.job)
      && ["char", "coal"].includes(orderedGoods)
      && targets.char
      && targets.coal;
    const goodsGroup = fuelSubstitution ? ["char", "coal"] : [orderedGoods];
    for (const goods of goodsGroup) processed.add(goods);
    let [wanted, ceiling] = targets[orderedGoods];
    const shelves = [];
    for (const goods of goodsGroup) {
      shelves.push(...economy.stalls[goods]
        .filter((stall) => (stall.marketId ?? "main") === buyerMarket
          && findHousehold(economy, stall.householdId))
        .map((stall) => ({ goods, kind: "STALL", stall, price: stall.price })));
      {
        // 隊商が届けた配給在庫の棚。帰属(どの隊商の売上か)を分けるため、mainでも
        // 会社倉庫在庫(STOCK)とは別勘定で持つ。
        const localStock = economy.marketStockM?.[buyerMarket]?.[goods] ?? 0;
        if (localStock > 1e-9) {
          shelves.push({
            goods,
            kind: "LSTOCK",
            qty: localStock,
            price: Math.max(0.1, marketPriceBook(economy, buyerMarket)[goods]
              ?? P.BELIEF0[goods] ?? 2),
          });
        }
      }
      if (buyerMarket !== "main") continue;
      if (P.IMP[goods] !== undefined) {
        const importQty = economy.importStock[goods] ?? 0;
        if (importQty > 1e-9) {
          shelves.push({ goods, kind: "CO", qty: importQty, price: P.IMP[goods] });
        }
        const aidQty = physical ? (economy.aidStock?.[goods] ?? 0) : 0;
        if (aidQty > 1e-9) {
          shelves.push({ goods, kind: "AID", qty: aidQty, price: 0 });
        }
      }
      const reserved = economy.order?.g === goods ? economy.order.left : 0;
      const warehouseStock = economy.stock[goods] ?? 0;
      const freeStock = Math.max(0, warehouseStock - reserved);
      const retailStock = physical ? (economy.marketStock[goods] ?? 0) : freeStock;
      if (retailStock > 1e-9) {
        shelves.push({
          goods,
          kind: "STOCK",
          qty: retailStock,
          price: companyStockReleasePrice(economy, goods, { market: Boolean(physical) }),
        });
      } else if (physical && freeStock > 1e-9) {
        requestCompanyStockRelease(economy, physical, goods, { day, qty: wanted });
        const arrived = economy.marketStock[goods] ?? 0;
        if (arrived > 1e-9) {
          shelves.push({
            goods,
            kind: "STOCK",
            qty: arrived,
            price: companyStockReleasePrice(economy, goods, { market: true }),
          });
        }
      }
    }
    shelves.sort((a, b) => a.price - b.price);
    const stockedShelves = shelves.filter((shelf) => (
      (shelf.kind === "CO" || shelf.kind === "AID" || shelf.kind === "STOCK" || shelf.kind === "LSTOCK")
        ? shelf.qty > 1e-9
        : shelf.stall.qty > 1e-9
    ));
    const affordableShelves = stockedShelves.filter((shelf) => (
      shelf.kind === "AID" || (shelf.price > 0 && shelf.price <= ceiling)
    ));

    for (const shelf of shelves) {
      if (wanted < 1e-9) break;
      if (shelf.kind !== "AID" && (shelf.price > ceiling || shelf.price <= 0)) continue;
      const { goods } = shelf;
      const unitWeight = goodsUnitWeight(goods);
      const productionInput = isProductionInput(household, goods);
      const capitalNeed = isHouseholdCapitalNeed(physical, household, goods);
      const input = productionInput || capitalNeed;
      const workingInput = productionInput && !capitalNeed;
      const protectsFoodCash = !FOODS.includes(goods) && !workingInput;
      // 信用買いは売上へ直結する日々の原料だけ。建設・修繕・道具・漁具・肥料・
      // 荷車材料まで一律に借金購入すると、改善投資が食料を買えない世帯を作る。
      let creditEligible = workingInput && CREDIT_INPUT_JOBS.has(household.job);
      // 複数原料の製鉄は、主原料がないのに燃料だけ借金購入して棚へ寝かせない。
      if (creditEligible && ["char", "coal"].includes(goods)) {
        if (household.job === "smelter") {
          creditEligible = productionInputAmount(physical, household, "ore")
            + (purchased.ore ?? 0) > 1e-9;
        } else if (household.job === "smith") {
          creditEligible = productionInputAmount(physical, household, "bar")
            + (purchased.bar ?? 0) > 1e-9;
        }
      }
      const available = (shelf.kind === "CO" || shelf.kind === "AID" || shelf.kind === "STOCK" || shelf.kind === "LSTOCK")
        ? shelf.qty
        : shelf.stall.qty;
      const reserve = protectsFoodCash
        ? foodCashReserve(economy, physical, household, purchased)
        : 0;
      const affordable = shelf.kind === "AID"
        ? Infinity
        : Math.max(0, household.purse - reserve + (creditEligible ? 30 : 0)) / shelf.price;
      const usableCapacity = input ? capacity : Math.max(0, capacity - inputReserve);
      const qty = Math.min(wanted, available, affordable, usableCapacity / unitWeight);
      if (qty < 1e-9) continue;
      if (input) inputReserve = Math.max(0, inputReserve - qty * unitWeight);

      const payment = qty * shelf.price;
      household.purse -= payment;
      if (delivery === "pantry") household.pantry[goods] += qty;
      else manifest[goods] = (manifest[goods] ?? 0) + qty;
      purchased[goods] = (purchased[goods] ?? 0) + qty;
      wanted -= qty;
      capacity -= qty * unitWeight;

      if (shelf.kind === "AID") {
        if (physical) {
          economy.aidStock[goods] = Math.max(0, (economy.aidStock[goods] ?? 0) - qty);
          const market = companyLogisticsSite(physical, "market");
          withdrawInventory(market, "inbound", goods, qty);
          shelf.qty -= qty;
          let remainingTaken = qty;
          for (const requestId of [...(economy.unsoldImportRequestIds ?? [])]) {
            const request = importRequestById(economy, requestId);
            if (!request?.aid || request.goods !== goods || remainingTaken <= 1e-9) continue;
            const taken = Math.min(request.marketQty, remainingTaken);
            request.marketQty -= taken;
            request.soldQty += taken;
            remainingTaken -= taken;
            if (request.soldQty >= request.qty - 1e-9) {
              request.status = "sold";
              deactivateId(economy.unsoldImportRequestIds, request.id);
            }
          }
        }
      } else if (shelf.kind === "CO") {
        postCompanyLedger(economy.company, {
          day,
          amount: payment,
          reason: `世帯${household.id}へ輸入${goods}を小売`,
        });
        if (physical) {
          const stock = economy.importStock[goods] ?? 0;
          const averageCost = (economy.importStockCost[goods] ?? 0) / Math.max(1e-9, stock);
          const wholesale = qty * averageCost;
          economy.importStock[goods] = Math.max(0, stock - qty);
          economy.importStockCost[goods] = Math.max(
            0,
            (economy.importStockCost[goods] ?? 0) - wholesale,
          );
          const market = companyLogisticsSite(physical, "market");
          withdrawInventory(market, "inbound", goods, qty);
          shelf.qty -= qty;
          economy.co.impMargin += payment - wholesale;
          economy.outBy[`imp_${goods}`] = (economy.outBy[`imp_${goods}`] ?? 0) - payment;
          let remainingSold = qty;
          const unsoldIds = [...(economy.unsoldImportRequestIds ?? [])];
          for (const requestId of unsoldIds) {
            const request = importRequestById(economy, requestId);
            if (!request || request.aid) continue;
            if (request.goods !== goods || remainingSold <= 1e-9) continue;
            const sold = Math.min(request.marketQty, remainingSold);
            request.marketQty -= sold;
            request.soldQty += sold;
            remainingSold -= sold;
            if (request.soldQty >= request.qty - 1e-9) {
              request.status = "sold";
              deactivateId(economy.unsoldImportRequestIds, request.id);
            }
          }
        } else {
          const wholesale = qty * (P.IMP_COST[goods] ?? P.IMP[goods] * 0.7);
          postCompanyLedger(economy.company, {
            day,
            amount: -wholesale,
            reason: `${goods}の本土仕入`,
          });
          recordExternalMoneyFlow(economy, { amount: -wholesale, reason: `${goods}の本土仕入` });
          economy.co.impMargin += payment - wholesale;
          economy.outBy[`imp_${goods}`] = (economy.outBy[`imp_${goods}`] ?? 0) + wholesale - payment;
          economy.imported[goods] = (economy.imported[goods] ?? 0) + qty;
          recordEconomicMaterialFlow(economy, goods, "imp", qty, `${goods}を本土から輸入`);
        }
      } else if (shelf.kind === "STOCK") {
        postCompanyLedger(economy.company, {
          day,
          amount: payment,
          reason: `世帯${household.id}へ倉庫在庫${goods}を小売`,
        });
        const stockTable = physical ? economy.marketStock : economy.stock;
        const costTable = physical ? economy.marketStockCost : economy.stockCost;
        const averageCost = (costTable[goods] ?? 0)
          / Math.max(1e-9, stockTable[goods] ?? 0);
        costTable[goods] = Math.max(
          0,
          (costTable[goods] ?? 0) - qty * averageCost,
        );
        stockTable[goods] -= qty;
        if (physical) {
          const market = companyLogisticsSite(physical, "market");
          withdrawInventory(market, "inbound", goods, qty);
        }
        shelf.qty -= qty;
        economy.co.stockSell += payment;
      } else if (shelf.kind === "LSTOCK") {
        postCompanyLedger(economy.company, {
          day,
          amount: payment,
          reason: `世帯${household.id}へ隊商在庫${goods}を小売`,
        });
        const localTable = economy.marketStockM[buyerMarket];
        const localCost = (economy.marketStockCostM ??= {})[buyerMarket] ??= {};
        const averageCost = (localCost[goods] ?? 0) / Math.max(1e-9, localTable[goods] ?? 0);
        localCost[goods] = Math.max(0, (localCost[goods] ?? 0) - qty * averageCost);
        localTable[goods] = Math.max(0, (localTable[goods] ?? 0) - qty);
        if (physical) {
          const market = marketBuildingForId(physical, buyerMarket);
          if (market) withdrawInventory(market, "inbound", goods, qty);
        }
        let remainingSale = qty;
        const lots = ((economy.marketStockLotsM ??= {})[buyerMarket] ??= {})[goods] ??= [];
        while (remainingSale > 1e-9 && lots.length > 0) {
          const lot = lots[0];
          const sold = Math.min(remainingSale, lot.qty);
          const attributed = payment * sold / qty;
          recordCaravanRetailSale(economy, lot.routeId, {
            day,
            amount: attributed,
            tripNumber: lot.tripNumber ?? null,
          });
          lot.qty -= sold;
          remainingSale -= sold;
          if (lot.qty <= 1e-9) lots.shift();
        }
        shelf.qty -= qty;
        economy.co.stockSell += payment;
        (economy.lstockSalesM ??= {})[buyerMarket] = (economy.lstockSalesM[buyerMarket] ?? 0) + payment;
      } else {
        shelf.stall.qty -= qty;
        const market = marketBuildingForId(physical, buyerMarket);
        if (market) withdrawInventory(market, "outbound", goods, qty);
        const seller = findHousehold(economy, shelf.stall.householdId);
        const fee = payment * P.FEE;
        seller.purse += payment - fee;
        seller.income30 += payment - fee;
        postCompanyLedger(economy.company, {
          day,
          amount: fee,
          reason: `${goods}市場取引の手数料`,
        });
        economy.co.fee += fee;
      }

      const previousPriceCount = economy.priceCounts[goods] ?? economy.prices[goods].length;
      economy.prices[goods].push([day, shelf.price, qty]);
      economy.priceCounts[goods] = previousPriceCount + 1;
      if (economy.prices[goods].length > 320) {
        economy.prices[goods].splice(0, economy.prices[goods].length - 256);
      }
      if (shelf.kind !== "AID") {
        const book = marketPriceBook(economy, buyerMarket);
        book[goods] = (book[goods] ?? shelf.price) * 0.9 + shelf.price * 0.1;
        transactions.push({
          goods,
          qty,
          price: shelf.price,
          source: shelf.kind === "CO"
            ? "CO"
            : ["STOCK", "LSTOCK"].includes(shelf.kind)
              ? shelf.kind
              : shelf.stall.householdId,
        });
      }
    }
    if (wanted > 1e-9) {
      unmet[orderedGoods] = wanted;
      const orderedCapitalNeed = isHouseholdCapitalNeed(physical, household, orderedGoods);
      const orderedWorkingInput = isProductionInput(household, orderedGoods) && !orderedCapitalNeed;
      const reserveBlocked = !FOODS.includes(orderedGoods)
        && !orderedWorkingInput
        && household.purse > 1e-9
        && household.purse <= foodCashReserve(economy, physical, household, purchased) + 1e-9;
      if (stockedShelves.length === 0) blockers[orderedGoods] = "no_stock";
      else if (affordableShelves.length === 0) blockers[orderedGoods] = "too_expensive";
      else if (capacity <= 1e-9) blockers[orderedGoods] = "no_capacity";
      else if (reserveBlocked) blockers[orderedGoods] = "food_reserve";
      else if (household.purse <= 1e-9) blockers[orderedGoods] = "no_money";
      else blockers[orderedGoods] = "partial";
    }
  }
  return {
    targets,
    order,
    transactions,
    purchased,
    unmet,
    blockers,
    remainingCapacity: capacity,
    cargo: delivery === "cargo" ? { direction: "inbound", manifest } : null,
  };
}

function exportHouseholdGoods(
  economy,
  household,
  goods,
  qty,
  price,
  day,
  { physical = null, inventoryReady = false } = {},
) {
  const purchase = qty * price;
  household.purse += purchase;
  household.income30 += purchase;
  postCompanyLedger(economy.company, {
    day,
    amount: -purchase,
    reason: `世帯${household.id}から${goods}を輸出買付`,
  });
  economy.co.expBuy += purchase;
  if (physical) {
    const market = companyLogisticsSite(physical, "market");
    if (!market) throw new Error("輸出買付を置く市場がありません");
    if (!inventoryReady) depositInventory(market, "outbound", goods, qty);
    const lot = {
      id: `exp${economy.nextExportLotId}`,
      householdId: household.id,
      goods,
      qty,
      marketQty: qty,
      warehouseQty: 0,
      portQty: 0,
      shippedQty: 0,
      unitRevenue: economy.expMl[goods],
      status: "market",
      purchasedDay: day,
    };
    economy.nextExportLotId += 1;
    economy.exportLots.push(lot);
    (economy.exportLotIndex ??= {})[lot.id] = economy.exportLots.length - 1;
    (economy.activeExportLotIds ??= []).push(lot.id);
    (economy.pendingExportLotIds ??= []).push(lot.id);
    dispatchPendingExportLots(economy, physical, { day });
    return lot;
  }
  economy.exported[goods] = (economy.exported[goods] ?? 0) + qty;
  recordEconomicMaterialFlow(economy, goods, "exp", qty, `${goods}を本土へ輸出`);

  const revenue = qty * economy.expMl[goods];
  postCompanyLedger(economy.company, {
    day,
    amount: revenue,
    reason: `${goods}の本土売上`,
  });
  recordExternalMoneyFlow(economy, { amount: revenue, reason: `${goods}の本土売上` });
  economy.co.expSell += revenue;
}

function sellManifestAtMarket(
  economy,
  physical,
  household,
  offers,
  { day, random, withdrawFromPantry },
) {
  const listed = [];
  const sellerMarket = householdMarketId(household);
  for (const [goods, offered] of Object.entries(offers)) {
    let qty = offered;
    const desks = [];
    // 輸出台・石畳台は母港の市場だけにある
    if (sellerMarket === "main" && P.EXP[goods] !== undefined) desks.push(["EXP", P.EXP[goods], economy.expCap[goods]]);
    if (
      sellerMarket === "main"
      && goods === "stone"
      && economy.paving
      && unpavedRoadKeys(physical, economy).length > 0
    ) {
      const used = economy.deskUsed.PAVEstone ?? 0;
      const remaining = Math.max(
        0,
        remainingRoadPavingStoneNeed(physical, economy) - (economy.paveBought ?? 0),
      );
      desks.push(["PAVE", 1.4, used + remaining]);
    }
    desks.sort((a, b) => b[1] - a[1]);
    for (const [kind, price, cap] of desks) {
      if (qty <= 1e-9) break;
      const cost = productionCost(economy, physical, household, goods, { day });
      if (price < cost) continue;
      const deskKey = `${kind}${goods}`;
      const used = economy.deskUsed[deskKey] ?? 0;
      const accepted = Math.min(qty, Math.max(0, cap - used));
      if (accepted > 1e-9) {
        economy.deskUsed[deskKey] = used + accepted;
        if (withdrawFromPantry) household.pantry[goods] -= accepted;
        if (kind === "EXP") {
          exportHouseholdGoods(economy, household, goods, accepted, price, day, { physical });
        } else if (kind === "PAVE") {
          const purchase = accepted * price;
          household.purse += purchase;
          household.income30 += purchase;
          postCompanyLedger(economy.company, {
            day,
            amount: -purchase,
            reason: `世帯${household.id}から石畳用stoneを買付`,
          });
          economy.paveBought += accepted;
        }
        qty -= accepted;
      }
    }
    if (qty > 1e-9) {
      if (withdrawFromPantry) household.pantry[goods] -= qty;
      const cost = productionCost(economy, physical, household, goods, { day });
      const price = quoteAskPrice(cost, goods, random);
      const stall = { householdId: household.id, marketId: sellerMarket, qty, price, age: 0 };
      economy.stalls[goods].push(stall);
      touchStallMembership(economy);
      const market = marketBuildingForId(physical, sellerMarket);
      if (market) depositInventory(market, "outbound", goods, qty);
      listed.push({ goods, ...stall });
    }
  }
  return { offers, listed };
}

export function sellAtMarket(economy, physical, household, { day, random }) {
  return sellManifestAtMarket(
    economy,
    physical,
    household,
    sellOffers(economy, household),
    { day, random, withdrawFromPantry: true },
  );
}

export function sellMarketCargo(economy, physical, household, { day, random }) {
  if (household.cargo?.direction !== "outbound") {
    throw new Error(`世帯${household.id}に市場向けcargoがありません`);
  }
  const offers = household.cargo.manifest;
  const sold = sellManifestAtMarket(
    economy,
    physical,
    household,
    offers,
    { day, random, withdrawFromPantry: false },
  );
  household.cargo = null;
  return sold;
}

export function transactAtMarket(economy, physical, household, { day, random }) {
  const sold = sellAtMarket(economy, physical, household, { day, random });
  const bought = buyAtMarket(economy, household, { day, physical });
  const cartPurchase = physical
    ? buyHouseholdWoodCart(economy, physical, household, { day })
    : null;
  return { sold, bought, cartPurchase };
}

export function transactMarketCargo(economy, physical, household, { day, random }) {
  const sold = sellMarketCargo(economy, physical, household, { day, random });
  const bought = buyAtMarket(economy, household, {
    day,
    physical,
    delivery: "cargo",
    capacityLimit: household.marketCarrier?.capacity ?? null,
  });
  const returnManifest = loadMarketReturns(
    economy,
    physical,
    household,
    bought.remainingCapacity,
  );
  bought.cargo.returnManifest = returnManifest;
  household.cargo = bought.cargo;
  household.lastMarketVisit = {
    day,
    purchased: { ...bought.purchased },
    unmet: { ...bought.unmet },
    blockers: { ...bought.blockers },
    remainingCapacity: bought.remainingCapacity,
    purseAfter: household.purse,
  };
  const cartPurchase = buyHouseholdWoodCart(economy, physical, household, { day });
  return { sold, bought, cartPurchase };
}

export function loadMarketReturns(economy, physical, household, availableCapacity) {
  if (!Number.isFinite(availableCapacity) || availableCapacity < -1e-9) {
    throw new TypeError("返品便の空き容量が不正です");
  }
  let capacity = Math.max(0, availableCapacity);
  const manifest = {};
  const householdMarket = householdMarketId(household);
  const market = marketBuildingForId(physical, householdMarket);
  for (const lot of economy.marketReturns) {
    if (
      lot.householdId !== household.id
      || (lot.marketId ?? "main") !== householdMarket
      || lot.qty <= 1e-9
      || capacity <= 1e-9
    ) continue;
    const unitWeight = goodsUnitWeight(lot.goods);
    const qty = Math.min(lot.qty, capacity / unitWeight);
    if (qty <= 1e-9) continue;
    lot.qty -= qty;
    capacity -= qty * unitWeight;
    manifest[lot.goods] = (manifest[lot.goods] ?? 0) + qty;
    if (market) withdrawInventory(market, "pickup", lot.goods, qty);
  }
  economy.marketReturns = economy.marketReturns.filter((lot) => lot.qty > 1e-9);
  return manifest;
}

function queueMarketReturn(economy, physical, household, goods, qty, day) {
  if (qty <= 1e-9) return null;
  const marketId = householdMarketId(household);
  const lot = {
    id: `ret${economy.nextMarketReturnId}`,
    householdId: household.id,
    goods,
    qty,
    queuedDay: day,
  };
  if (marketId !== "main") lot.marketId = marketId;
  economy.nextMarketReturnId += 1;
  economy.marketReturns.push(lot);
  const market = marketBuildingForId(physical, marketId);
  if (market) {
    withdrawInventory(market, "outbound", goods, qty);
    depositInventory(market, "pickup", goods, qty);
  }
  return lot;
}

function spoilMarketQuantity(economy, physical, section, goods, qty, reason, marketId = "main") {
  const life = goods === "fish" ? P.FISH_LIFE : goods === "veg" ? P.VEG_LIFE : null;
  if (!life || qty <= 1e-9) return 0;
  const spoiled = qty / life;
  const market = marketBuildingForId(physical, marketId);
  if (market) withdrawInventory(market, section, goods, spoiled);
  economy.led.spoil[goods] = (economy.led.spoil[goods] ?? 0) + spoiled;
  recordEconomicMaterialFlow(
    economy,
    goods,
    "cons",
    spoiled,
    reason,
    { includeInDaily: false },
  );
  return spoiled;
}

export function ageMarketStalls(economy, { day, physical = null }) {
  economy.currentDay = day;
  economy.deskUsed = {};
  economy.dailyMaterialFlows = {};
  economy.dailyDemandFlows = {};
  for (const lot of economy.marketReturns) {
    const spoiled = spoilMarketQuantity(
      economy,
      physical,
      "pickup",
      lot.goods,
      lot.qty,
      `引き取り待ち${lot.goods}の腐敗`,
      lot.marketId ?? "main",
    );
    lot.qty -= spoiled;
  }
  economy.marketReturns = economy.marketReturns.filter((lot) => lot.qty > 1e-9);
  for (const goods of GOODS) {
    const stalls = economy.stalls[goods];
    for (let index = stalls.length - 1; index >= 0; index -= 1) {
      const stall = stalls[index];
      const household = findHousehold(economy, stall.householdId);
      stall.age = (stall.age ?? 0) + 1;
      if (stall.age >= 3 && household && (stall.marketId ?? "main") === "main" && P.EXP[goods] !== undefined) {
        const used = economy.deskUsed[`EXP${goods}`] ?? 0;
        const accepted = Math.min(stall.qty, Math.max(0, economy.expCap[goods] - used));
        if (accepted > 1e-9) {
          economy.deskUsed[`EXP${goods}`] = used + accepted;
          stall.qty -= accepted;
          const market = companyLogisticsSite(physical, "market");
          exportHouseholdGoods(
            economy,
            household,
            goods,
            accepted,
            P.EXP[goods],
            day,
            { physical, inventoryReady: Boolean(market) },
          );
        }
      }
      const spoiled = spoilMarketQuantity(
        economy,
        physical,
        "outbound",
        goods,
        stall.qty,
        `屋台の${goods}の腐敗`,
        stall.marketId ?? "main",
      );
      stall.qty -= spoiled;
      if (stall.age >= 6 && household) {
        queueMarketReturn(economy, physical, household, goods, stall.qty, day);
        stall.qty = 0;
      }
      if (stall.qty <= 1e-9) {
        stalls.splice(index, 1);
        touchStallMembership(economy);
      }
    }
  }
}

export function runWheatHarvest(economy, { day, physical = null }) {
  const effectiveDay = calendarDay(economy, day);
  const month = calendarMonth(economy, day);
  if (month !== 9 || effectiveDay % 30 !== 15) return [];
  const harvested = [];
  for (const household of economy.households) {
    if (household.job !== "wheat") continue;
    const fill = Math.min(1, (household.fert ?? 0) / (P.FERT_NEED * 180));
    const qty = P.Y_WHEAT
      * householdMult(household)
      * buildingConditionMultiplier(physical, household)
      * Math.min(1, household.wheatWork / 300)
      * (1 + P.FERT_BOOST * fill);
    household.pantry.wheat += qty;
    household.productionToday ??= {};
    household.productionToday.wheat = (household.productionToday.wheat ?? 0) + qty;
    economy.led.prod.wheat = (economy.led.prod.wheat ?? 0) + qty;
    recordEconomicMaterialFlow(economy, "wheat", "prod", qty, `世帯${household.id}の麦収穫`);
    economy.harvestLog.push([day, qty]);
    harvested.push({ householdId: household.id, qty, fertilizerFill: fill });
    household.wheatWork = 0;
    household.fert = 0;
    household.jobCycleDone = true;
    if (fill > 0.05) {
      recordEconomyEvent(
        economy,
        day,
        `麦畑#${household.id} 施肥${Math.round(fill * 100)}%→+${Math.round(P.FERT_BOOST * fill * 100)}%`,
      );
    }
  }
  return harvested;
}

function withdrawProductionFuel(economy, physical, household, qty) {
  let remaining = qty;
  const used = { char: 0, coal: 0 };
  const fuels = ["char", "coal"].sort((left, right) => (
    (economy.px[left] ?? P.BELIEF0[left]) - (economy.px[right] ?? P.BELIEF0[right])
  ));
  for (const goods of fuels) {
    const amount = Math.min(remaining, productionInputAmount(physical, household, goods));
    if (amount <= 1e-9) continue;
    withdrawProductionInput(physical, household, goods, amount);
    used[goods] += amount;
    remaining -= amount;
    if (remaining <= 1e-9) break;
  }
  return used;
}

export function producePrimaryTick(economy, physical, household, { day, fraction, endOfDay = false }) {
  if (!Number.isFinite(fraction) || fraction < 0) throw new TypeError("production fraction must be non-negative and finite");
  const month = calendarMonth(economy, day);
  const winter = month >= 10;
  let effectiveFraction = fraction;
  if (household.boost) {
    effectiveFraction *= household.boost;
    if (endOfDay) household.boost = null;
  }
  if (hasHouseholdStall(economy, household)) {
    effectiveFraction *= (household.members.length - 1) / household.members.length;
  }
  const resourceWork = ensureResourceWorkPlan(economy, physical, household);
  if (resourceWork) effectiveFraction *= resourceWork.efficiency;
  acquireHouseholdWorkTool(economy, physical, household, { day });
  acquireHouseholdFishingRig(economy, physical, household, { day });
  const productiveEffort = effectiveFraction;
  if (shouldPauseProduction(economy, household)) {
    if (endOfDay) recordMissingWorkToolDemand(economy, household);
    return {};
  }
  effectiveFraction *= buildingConditionMultiplier(physical, household);
  effectiveFraction *= householdWorkToolMultiplier(household);
  effectiveFraction *= householdFishingRigMultiplier(household);
  const workBuilding = physical
    ? ensureBuildingShelves(buildingById(physical, household.buildingId))
    : null;
  const work = effectiveFraction * householdMult(household);
  const produced = {};

  if (household.job === "fisher2") {
    const desiredFish = P.Y_FISH * work;
    const fish = Math.min(
      desiredFish,
      productionInputAmount(physical, household, "fish"),
    );
    withdrawProductionInput(physical, household, "fish", fish);
    const qty = fish / P.MEAL_FISH;
    if (fish > 1e-9) {
      household.pantry.meal += qty;
      recordEconomicMaterialFlow(economy, "fish", "cons", fish, `世帯${household.id}の魚粉加工`);
      recordEconomicMaterialFlow(economy, "meal", "prod", qty, `世帯${household.id}の魚粉生産`);
      produced.meal = qty;
    }
    recordEconomicDemand(economy, "fish", desiredFish, fish, "fisher2");
  } else if (household.job === "quarryman") {
    const qty = P.Y_STONE * work;
    household.pantry.stone += qty;
    recordEconomicMaterialFlow(economy, "stone", "prod", qty, `世帯${household.id}の採石`);
    produced.stone = qty;
  } else if (household.job === "rapeseed") {
    if (month >= 3 && month <= 8) {
      const used = Math.max(
        0,
        Math.min(productionInputAmount(physical, household, "meal"), P.FERT_NEED * effectiveFraction),
      );
      withdrawProductionInput(physical, household, "meal", used);
      household.fert = (household.fert ?? 0) + used;
      if (used > 0) {
        recordEconomicMaterialFlow(economy, "meal", "cons", used, `世帯${household.id}の綿花施肥`);
      }
      const fill = Math.min(
        1,
        household.fert / Math.max(1, P.FERT_NEED * (month - 2) * 30),
      );
      const qty = P.Y_COTTON_CLOTH * work * (1 + P.FERT_BOOST * fill);
      household.pantry.cloth += qty;
      recordEconomicMaterialFlow(economy, "cloth", "prod", qty, `世帯${household.id}の綿織り`);
      produced.cloth = qty;
    }
  } else if (household.job === "fisher") {
    const depletion = economy.natural.bay / P.BAY0;
    const qty = (winter ? P.Y_FISH_W : P.Y_FISH) * work * depletion;
    economy.natural.bay = Math.min(
      P.BAY0,
      economy.natural.bay - qty
        + effectiveFraction * (
          P.BAY_R * economy.natural.bay * (1 - depletion) + P.RESEED * (1 - depletion)
        ),
    );
    household.pantry.fish += qty;
    economy.led.prod.fish = (economy.led.prod.fish ?? 0) + qty;
    recordEconomicMaterialFlow(economy, "fish", "prod", qty, `世帯${household.id}の漁`);
    produced.fish = qty;
  } else if (household.job === "veg" && month >= 3 && month <= 10) {
    const qty = P.Y_VEG * work;
    household.pantry.veg += qty;
    economy.led.prod.veg = (economy.led.prod.veg ?? 0) + qty;
    recordEconomicMaterialFlow(economy, "veg", "prod", qty, `世帯${household.id}の野菜畑`);
    produced.veg = qty;
  } else if (household.job === "shepherd") {
    const desiredMeat = P.Y_MEAT * work;
    const desiredFeed = desiredMeat * P.FEED_MEAT;
    const veg = Math.min(
      desiredFeed,
      productionInputAmount(physical, household, "veg"),
    );
    const wheatNeed = desiredFeed - veg;
    const wheat = Math.min(
      wheatNeed,
      productionInputAmount(physical, household, "wheat"),
    );
    withdrawProductionInput(physical, household, "veg", veg);
    withdrawProductionInput(physical, household, "wheat", wheat);
    const feed = veg + wheat;
    const fill = desiredFeed > 1e-9 ? feed / desiredFeed : 0;
    const meat = desiredMeat * fill;
    const cloth = P.Y_CLOTH * work * fill;
    if (feed > 1e-9) {
      household.pantry.meat += meat;
      household.pantry.cloth += cloth;
      if (veg > 1e-9) {
        recordEconomicMaterialFlow(economy, "veg", "cons", veg, `世帯${household.id}の家畜飼料`);
      }
      if (wheat > 1e-9) {
        recordEconomicMaterialFlow(economy, "wheat", "cons", wheat, `世帯${household.id}の家畜飼料`);
      }
      recordEconomicMaterialFlow(economy, "meat", "prod", meat, `世帯${household.id}の牧畜`);
      recordEconomicMaterialFlow(economy, "cloth", "prod", cloth, `世帯${household.id}の牧畜`);
      economy.led.prod.meat = (economy.led.prod.meat ?? 0) + meat;
      produced.meat = meat;
      produced.cloth = cloth;
    }
    if (veg > 1e-9) recordEconomicDemand(economy, "veg", veg, veg, "shepherd");
    if (wheatNeed > 1e-9) recordEconomicDemand(economy, "wheat", wheatNeed, wheat, "shepherd");
  } else if (household.job === "wheat") {
    if (household.pantry.wheat > P.Y_WHEAT * householdMult(household) * 0.8) {
      if (endOfDay) recordMissingWorkToolDemand(economy, household);
      return produced;
    }
    household.wheatWork += effectiveFraction;
    if (month >= 3 && month <= 8) {
      const used = Math.max(
        0,
        Math.min(productionInputAmount(physical, household, "meal"), P.FERT_NEED * effectiveFraction),
      );
      withdrawProductionInput(physical, household, "meal", used);
      household.fert = (household.fert ?? 0) + used;
      if (used > 0) {
        recordEconomicMaterialFlow(economy, "meal", "cons", used, `世帯${household.id}の施肥`);
      }
    }
  } else if (household.job === "logger") {
    const qty = chopWood(economy, physical, household, P.Y_LOG * work);
    household.pantry.log += qty;
    recordEconomicMaterialFlow(economy, "log", "prod", qty, `世帯${household.id}の伐採`);
    produced.log = qty;
  } else if (household.job === "miner") {
    const qty = P.Y_ORE * work;
    household.pantry.ore += qty;
    recordEconomicMaterialFlow(economy, "ore", "prod", qty, `世帯${household.id}の採鉱`);
    produced.ore = qty;
  } else if (household.job === "collier") {
    const qty = P.Y_COAL * work;
    household.pantry.coal += qty;
    recordEconomicMaterialFlow(economy, "coal", "prod", qty, `世帯${household.id}の採炭`);
    produced.coal = qty;
  } else if (household.job === "smelter") {
    const desiredQty = P.Y_SMELT * work;
    const fuelAvailable = productionInputAmount(physical, household, "char")
      + productionInputAmount(physical, household, "coal");
    const qty = Math.max(0, Math.min(
      desiredQty,
      productionInputAmount(physical, household, "ore") / P.SMELT_ORE,
      fuelAvailable / P.SMELT_FUEL,
    ));
    const ore = qty * P.SMELT_ORE;
    const fuel = qty * P.SMELT_FUEL;
    withdrawProductionInput(physical, household, "ore", ore);
    const usedFuel = withdrawProductionFuel(economy, physical, household, fuel);
    household.pantry.bar += qty;
    if (qty > 0) recordEconomicMaterialFlow(economy, "bar", "prod", qty, `世帯${household.id}の製鉄`);
    if (ore > 0) recordEconomicMaterialFlow(economy, "ore", "cons", ore, `世帯${household.id}の製鉄`);
    recordEconomicDemand(
      economy, "ore", desiredQty * P.SMELT_ORE, ore, "smelter",
    );
    for (const goods of ["char", "coal"]) {
      if (usedFuel[goods] > 0) {
        recordEconomicMaterialFlow(economy, goods, "cons", usedFuel[goods], `世帯${household.id}の製鉄`);
      }
    }
    produced.bar = qty;
  } else if (household.job === "smith") {
    const desiredQty = P.Y_SMITH * work;
    const fuelAvailable = productionInputAmount(physical, household, "char")
      + productionInputAmount(physical, household, "coal");
    const qty = Math.max(0, Math.min(
      desiredQty,
      productionInputAmount(physical, household, "bar") / P.SMITH_BAR,
      fuelAvailable / P.SMITH_FUEL,
    ));
    const bar = qty * P.SMITH_BAR;
    const fuel = qty * P.SMITH_FUEL;
    withdrawProductionInput(physical, household, "bar", bar);
    const usedFuel = withdrawProductionFuel(economy, physical, household, fuel);
    household.pantry.iron += qty;
    if (qty > 0) recordEconomicMaterialFlow(economy, "iron", "prod", qty, `世帯${household.id}の鍛冶`);
    if (bar > 0) recordEconomicMaterialFlow(economy, "bar", "cons", bar, `世帯${household.id}の鍛冶`);
    recordEconomicDemand(
      economy, "bar", desiredQty * P.SMITH_BAR, bar, "smith",
    );
    for (const goods of ["char", "coal"]) {
      if (usedFuel[goods] > 0) {
        recordEconomicMaterialFlow(economy, goods, "cons", usedFuel[goods], `世帯${household.id}の鍛冶`);
      }
    }
    produced.iron = qty;
  } else if (household.job === "cartwright") {
    ensureCartEconomy(economy);
    household.cartStock ??= [];
    if (
      !household.cartWork
      && household.cartStock.length < 3
      && productionInputAmount(physical, household, "log") >= P.CART_LOG
      && productionInputAmount(physical, household, "tools") >= P.CART_TOOLS
    ) {
      withdrawProductionInput(physical, household, "log", P.CART_LOG);
      withdrawProductionInput(physical, household, "tools", P.CART_TOOLS);
      recordEconomicMaterialFlow(
        economy, "log", "cons", P.CART_LOG, `世帯${household.id}の木の荷車製作`,
      );
      recordEconomicMaterialFlow(
        economy, "tools", "cons", P.CART_TOOLS, `世帯${household.id}の木の荷車製作`,
      );
      recordEconomicDemand(economy, "log", P.CART_LOG, P.CART_LOG, "cartwright");
      recordEconomicDemand(economy, "tools", P.CART_TOOLS, P.CART_TOOLS, "cartwright");
      household.cartWork = {
        kind: "wood",
        progress: 0,
        required: P.CART_WORK_DAYS,
        materialCost: P.CART_LOG * (economy.px.log ?? P.BELIEF0.log)
          + P.CART_TOOLS * (economy.px.tools ?? P.BELIEF0.tools),
      };
    }
    if (!household.cartWork && household.cartStock.length < 3 && endOfDay) {
      recordEconomicDemand(economy, "log", P.CART_LOG, 0, "cartwright");
      recordEconomicDemand(economy, "tools", P.CART_TOOLS, 0, "cartwright");
    }
    if (household.cartWork) {
      household.cartWork.progress += work;
      produced.cartWork = work;
      if (household.cartWork.progress >= household.cartWork.required - 1e-9) {
        const asset = {
          id: `wood-cart-${economy.nextCartAssetId}`,
          kind: "wood",
          durability: P.CART_WOOD_DURABILITY,
          maxDurability: P.CART_WOOD_DURABILITY,
          price: Math.max(1, household.cartWork.materialCost * P.CART_MARKUP),
          makerHouseholdId: household.id,
        };
        economy.nextCartAssetId += 1;
        household.cartStock.push(asset);
        household.cartWork = null;
        economy.cartStats.produced += 1;
        recordEconomyEvent(economy, day, `荷車完成: cartwright#${household.id} 木の荷車${asset.id}`);
        produced.cart = 1;
      }
    }
  } else if (household.job === "woodshop") {
    const desiredQty = P.Y_TOOLS * work;
    const qty = Math.max(
      0,
      Math.min(desiredQty, productionInputAmount(physical, household, "log") / P.LOG_TOOL),
    );
    withdrawProductionInput(physical, household, "log", qty * P.LOG_TOOL);
    household.pantry.tools += qty;
    recordEconomicMaterialFlow(economy, "tools", "prod", qty, `世帯${household.id}の木工`);
    recordEconomicMaterialFlow(economy, "log", "cons", qty * P.LOG_TOOL, `世帯${household.id}の木工`);
    recordEconomicDemand(
      economy, "log", desiredQty * P.LOG_TOOL, qty * P.LOG_TOOL, "woodshop",
    );
    produced.tools = qty;
  } else if (household.job === "charburner") {
    const desiredQty = P.Y_CHAR * work;
    const qty = Math.max(
      0,
      Math.min(desiredQty, productionInputAmount(physical, household, "log") / P.LOG_CHAR),
    );
    withdrawProductionInput(physical, household, "log", qty * P.LOG_CHAR);
    household.pantry.char += qty;
    recordEconomicMaterialFlow(economy, "char", "prod", qty, `世帯${household.id}の炭焼き小屋`);
    recordEconomicMaterialFlow(economy, "log", "cons", qty * P.LOG_CHAR, `世帯${household.id}の炭焼き小屋`);
    recordEconomicDemand(
      economy, "log", desiredQty * P.LOG_CHAR, qty * P.LOG_CHAR, "charburner",
    );
    produced.char = qty;
  } else if (household.job === "saltworks") {
    const desiredFuel = P.SALT_CHAR * effectiveFraction;
    const fuel = Math.max(
      0,
      Math.min(desiredFuel, productionInputAmount(physical, household, "char")),
    );
    const qty = P.Y_SALT * householdMult(household) * fuel / P.SALT_CHAR;
    withdrawProductionInput(physical, household, "char", fuel);
    household.pantry.salt += qty;
    if (qty > 0) recordEconomicMaterialFlow(economy, "salt", "prod", qty, `世帯${household.id}の製塩`);
    if (fuel > 0) recordEconomicMaterialFlow(economy, "char", "cons", fuel, `世帯${household.id}の製塩`);
    recordEconomicDemand(economy, "char", desiredFuel, fuel, "saltworks");
    produced.salt = qty;
  }
  household.productionToday ??= {};
  for (const [goods, qty] of Object.entries(produced)) {
    if (!Number.isFinite(qty) || qty <= 0 || goods === "cartWork") continue;
    household.productionToday[goods] = (household.productionToday[goods] ?? 0) + qty;
  }
  const didProductiveWork = household.job === "wheat" || Object.entries(produced).some(
    ([goods, qty]) => goods !== "cart" && qty > 1e-9,
  );
  if (
    workBuilding
    && (household.job === "wheat" || Object.entries(produced).some(
      ([goods, qty]) => goods !== "cartWork" && qty > 1e-9,
    ))
  ) {
    workBuilding.operationWear = (workBuilding.operationWear ?? 0) + effectiveFraction;
  }
  if (didProductiveWork) {
    recordFishingRigWear(economy, household, productiveEffort);
    const brokenRig = wearHouseholdFishingRig(household, productiveEffort);
    if (
      brokenRig
      && !acquireHouseholdFishingRig(economy, physical, household, { day })
    ) {
      recordEconomyEvent(
        economy,
        day,
        `fisher#${household.id} ${brokenRig === "sail" ? "帆走漁具" : "木舟と漁網"}が摩耗し、岸漁へ移行`,
      );
    }
    const brokenKind = wearHouseholdWorkTool(household, productiveEffort);
    if (
      brokenKind
      && !acquireHouseholdWorkTool(economy, physical, household, { day })
    ) {
      recordEconomyEvent(
        economy,
        day,
        `${household.job}#${household.id} ${brokenKind === "iron" ? "鉄" : "木"}の作業道具が摩耗し、素手で作業`,
      );
    }
  }
  if (endOfDay) recordMissingWorkToolDemand(economy, household);
  return produced;
}

export function householdIdealDailyOutput(economy, household, { day = economy.currentDay } = {}) {
  const month = calendarMonth(economy, day);
  const winter = month >= 10;
  const mult = householdMult(household);
  const outputs = {};
  const add = (goods, qty) => {
    if (qty > 1e-9) outputs[goods] = qty;
  };
  if (household.job === "fisher") {
    add("fish", (winter ? P.Y_FISH_W : P.Y_FISH) * mult
      * Math.max(0, economy.natural.bay / P.BAY0));
  } else if (household.job === "fisher2") {
    add("meal", P.Y_FISH * mult / P.MEAL_FISH);
  } else if (household.job === "veg" && month >= 3 && month <= 10) {
    add("veg", P.Y_VEG * mult);
  } else if (household.job === "shepherd") {
    add("meat", P.Y_MEAT * mult);
    add("cloth", P.Y_CLOTH * mult);
  } else if (household.job === "logger") add("log", P.Y_LOG * mult);
  else if (household.job === "woodshop") add("tools", P.Y_TOOLS * mult);
  else if (household.job === "charburner") add("char", P.Y_CHAR * mult);
  else if (household.job === "saltworks") add("salt", P.Y_SALT * mult);
  else if (household.job === "quarryman") add("stone", P.Y_STONE * mult);
  else if (household.job === "miner") add("ore", P.Y_ORE * mult);
  else if (household.job === "collier") add("coal", P.Y_COAL * mult);
  else if (household.job === "smelter") add("bar", P.Y_SMELT * mult);
  else if (household.job === "smith") add("iron", P.Y_SMITH * mult);
  else if (household.job === "rapeseed" && month >= 3 && month <= 8) {
    add("cloth", P.Y_COTTON_CLOTH * mult);
  }
  return outputs;
}

export function finalizeHouseholdProductionDay(economy, { day = economy.currentDay } = {}) {
  for (const household of economy.households) {
    household.productionHistory ??= [];
    household.productionHistory.push({
      day,
      goods: { ...(household.productionToday ?? {}) },
      ideal: householdIdealDailyOutput(economy, household, { day }),
    });
    if (household.productionHistory.length > 30) household.productionHistory.shift();
    household.productionToday = {};
  }
}

export function householdProductionSummary(economy, household, { day = economy.currentDay } = {}) {
  const history = household.productionHistory ?? [];
  const actualByGoods = {};
  const idealByGoods = {};
  const currentIdeal = householdIdealDailyOutput(economy, household, { day });
  for (const row of history) {
    for (const [goods, qty] of Object.entries(row.goods ?? {})) {
      actualByGoods[goods] = (actualByGoods[goods] ?? 0) + qty;
    }
    for (const [goods, qty] of Object.entries(row.ideal ?? currentIdeal)) {
      idealByGoods[goods] = (idealByGoods[goods] ?? 0) + qty;
    }
  }
  const days = Math.max(1, history.length);
  for (const goods of Object.keys(actualByGoods)) actualByGoods[goods] /= days;
  if (history.length === 0) Object.assign(idealByGoods, currentIdeal);
  else for (const goods of Object.keys(idealByGoods)) idealByGoods[goods] /= days;
  const actual = Object.values(actualByGoods).reduce((total, qty) => total + qty, 0);
  const ideal = Object.values(idealByGoods).reduce((total, qty) => total + qty, 0);
  return {
    days: history.length,
    actual,
    ideal,
    efficiency: ideal > 1e-9 ? actual / ideal : null,
    actualByGoods,
    idealByGoods,
    resourceWork: household.resourceWork ?? null,
    lastDirectTrade: household.lastDirectTrade ?? null,
  };
}

export function runPrimaryProductionDay(economy, physical, { day }) {
  economy.currentDay = day;
  for (let tick = 0; tick < 30; tick += 1) {
    for (const household of economy.households) {
      if (household.state === "home") {
        producePrimaryTick(economy, physical, household, {
          day,
          fraction: 1 / 30,
          endOfDay: tick === 29,
        });
      }
    }
  }
}

export function householdFoodDays(household) {
  return FOODS.reduce(
    (total, goods) => total + (household.pantry[goods] ?? 0),
    0,
  ) / Math.max(1, householdEat(household));
}

export function isNeedyHousehold(household) {
  return household.purse < householdEat(household) * 0.8 && householdFoodDays(household) < 4;
}

export function laborWage(economy, household) {
  return householdEat(household) * staplePrice(economy);
}

export function assignNeedyWork(economy, physical, household) {
  if (household.state !== "home" || !isNeedyHousehold(household)) return null;
  const home = householdEntrance(physical, household);
  const reachableWorksites = physical.roadWorksites
    .map((worksite) => ({
      worksite,
      distance: pathLen(physical, home, tilePosition(worksite), "walk"),
    }))
    .filter(({ distance }) => distance <= 14)
    .sort((a, b) => a.distance - b.distance);
  if (reachableWorksites.length > 0) {
    const { worksite } = reachableWorksites[0];
    household.wx = worksite.x;
    household.wy = worksite.y;
    household.state = "toWork";
    household.employerId = null;
    household.worksiteId = worksite.id;
    return { kind: "public", worksiteId: worksite.id, x: worksite.x, y: worksite.y };
  }

  const wage = laborWage(economy, household);
  const employer = economy.households
    .filter((candidate) => (
      candidate !== household
      && candidate.purse > wage * 4
      && candidate.workerId === null
      && candidate.state !== "building"
    ))
    .map((candidate) => ({
      candidate,
      distance: pathLen(physical, home, householdEntrance(physical, candidate), "walk"),
    }))
    .filter(({ distance }) => distance <= 14)
    .sort((a, b) => a.distance - b.distance)[0]?.candidate;
  if (!employer) return null;
  employer.workerId = household.id;
  household.employerId = employer.id;
  household.worksiteId = null;
  const employerEntrance = householdEntrance(physical, employer);
  household.wx = employerEntrance.x;
  household.wy = employerEntrance.y;
  household.state = "toWork";
  return { kind: "private", employerId: employer.id, x: employer.x, y: employer.y };
}

export function completeAssignedWork(economy, physical, household, { day }) {
  if (household.state !== "toWork") return { worked: false, kind: null, paid: 0 };
  const wage = laborWage(economy, household);
  let kind = null;
  let paid = 0;
  let completed = false;

  if (household.employerId !== null) {
    const employer = findHousehold(economy, household.employerId);
    if (employer) {
      paid = Math.min(wage, Math.max(0, employer.purse));
      employer.purse -= paid;
      household.purse += paid;
      household.income30 += paid;
      employer.boost = 1.4;
      employer.workerId = null;
      kind = "private";
    }
    household.employerId = null;
  } else if (household.worksiteId !== null) {
    const result = workRoadWorksite(physical, household.worksiteId);
    if (result.worked) {
      household.purse += wage;
      household.income30 += wage;
      postCompanyLedger(economy.company, {
        day,
        amount: -wage,
        reason: `世帯${household.id}の道普請賃金`,
      });
      economy.co.pub += wage;
      paid = wage;
      kind = "public";
      completed = result.completed;
      if (completed) recordEconomyEvent(economy, day, "道が一区画通じた");
    }
    household.worksiteId = null;
  }
  household.state = "toMarket";
  return { worked: kind !== null, kind, paid, completed };
}

export function regenerateForest(economy, physical, { day, random }) {
  if (!physical?.terrain || day % 5 !== 0) return;
  for (const [key, stock] of Object.entries(economy.natural.wood)) {
    if (stock > 0 && stock < P.WOOD0) {
      economy.natural.wood[key] = Math.min(P.WOOD0, stock + P.WOOD_R * 5);
      const separator = key.indexOf(",");
      syncWoodStageTile(
        physical,
        Number(key.slice(0, separator)),
        Number(key.slice(separator + 1)),
        economy.natural.wood[key],
      );
    }
  }
  for (const household of economy.households) {
    if (household.job !== "logger") continue;
    const homeX = Math.round(household.x);
    const homeY = Math.round(household.y);
    let homeStock = 0;
    for (let offsetY = -5; offsetY <= 5; offsetY += 1) {
      for (let offsetX = -5; offsetX <= 5; offsetX += 1) {
        homeStock += economy.natural.wood[`${homeX + offsetX},${homeY + offsetY}`] ?? 0;
      }
    }
    const ratio = homeStock / (P.WOOD0 * 8);
    if (ratio < 0.6 && !household.woodThinWarned) {
      household.woodThinWarned = true;
      recordEconomyEvent(
        economy,
        day,
        `${household.sur}家の伐り場の森が薄くなってきた——次の伐り場を考える頃合い`,
      );
    } else if (ratio > 0.8 && household.woodThinWarned) {
      household.woodThinWarned = false;
    }
  }
  if (day % 30 !== 0) return;
  for (let y = 0; y < physical.height; y += 1) {
    for (let x = 0; x < physical.width; x += 1) {
      if (terrainKindAt(physical, x, y) !== "bald") continue;
      let adjacent = 0;
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          const nearX = x + offsetX;
          const nearY = y + offsetY;
          if (
            terrainKindAt(physical, nearX, nearY) === "forest"
            && (economy.natural.wood[`${nearX},${nearY}`] ?? 0) > P.WOOD0 * 0.3
          ) adjacent += 1;
        }
      }
      if (adjacent >= 2 && random() < 0.06) {
        setTerrainKind(physical, x, y, "forest");
        economy.natural.wood[`${x},${y}`] = P.WOOD0 * 0.25;
        syncWoodStageTile(physical, x, y, P.WOOD0 * 0.25);
      }
    }
  }
}

const ORDER_NAMES = deepFreeze({
  tools: "木製品",
  char: "炭",
  salt: "塩",
  pres: "保存食",
  pick: "漬物",
  cloth: "布",
  stone: "石",
});

export const COMPANY_ORDER_GOODS = Object.freeze(Object.keys(ORDER_NAMES));

const ORDER_PRICES = deepFreeze({
  // 丸太投入3倍後の全量仕入原価を辛うじて上回る小口契約。通常輸出ではなく、
  // 島内余剰5日分に限るため大量輸出益にはならない。
  tools: 2.8,
  char: 1.2,
  salt: 1.5,
  pres: 0.9,
  pick: 0.8,
  cloth: 2,
  stone: 1.2,
});

export function acceptCompanyOrder(economy, { day = economy.currentDay } = {}) {
  if (!Number.isSafeInteger(day) || day < 0) {
    throw new TypeError("order acceptance day must be a non-negative safe integer");
  }
  if (economy.order || !economy.orderOffer || day >= economy.orderOffer.due) return null;
  economy.order = economy.orderOffer;
  economy.orderOffer = null;
  recordEconomyEvent(
    economy,
    day,
    `本国注文を受諾: ${ORDER_NAMES[economy.order.g]}${Math.round(economy.order.qty)}荷`,
  );
  return structuredClone(economy.order);
}

export function companyCreditLimit(economy, { day = economy.currentDay } = {}) {
  if (!Number.isSafeInteger(day) || day < 0) {
    throw new TypeError("credit-limit day must be a non-negative safe integer");
  }
  const month = Math.floor((day - 1) / 30) + 1;
  return Math.min(
    P.LIMIT0 + P.LIMIT_G * Math.min(month, P.LIMIT_FREEZE),
    Math.max(6000, economy.households.length * 9 * P.LIMIT_PC),
  );
}

export function companyLogisticsSite(physical, role) {
  if (!physical) return null;
  const id = physical.roleBuildingIds?.[role];
  if (id) return buildingById(physical, id);
  const building = physical.buildings.find((candidate) => candidate.role === role) ?? null;
  if (building) (physical.roleBuildingIds ??= {})[role] = building.id;
  return building;
}

function recordLogisticsBlocked(economy, day, fromRole, toRole) {
  const message = `会社物流停止(${fromRole}→${toRole})——道が繋がっていません`;
  if (!economy.events.some(([eventDay, event]) => eventDay === day && event === message)) {
    recordEconomyEvent(economy, day, message);
  }
}

function pendingCompanyHaul(physical, kind, goods) {
  const activeIds = physical.activeHaulJobIds
    ?? physical.haulJobs.filter((job) => job.status === "in_transit").map((job) => job.id);
  return activeIds
    .map((jobId) => haulJobById(physical, jobId))
    .filter(Boolean)
    .filter((job) => job.economicLogistics?.kind === kind && job.goods === goods)
    .reduce((total, job) => total + job.qty, 0);
}

function pendingCompanyRepairHaul(physical, buildingId, goods) {
  const activeIds = physical.activeHaulJobIds
    ?? physical.haulJobs.filter((job) => job.status === "in_transit").map((job) => job.id);
  return activeIds
    .map((jobId) => haulJobById(physical, jobId))
    .filter(Boolean)
    .filter((job) => (
      job.economicLogistics?.kind === "company_repair"
      && job.economicLogistics?.targetBuildingId === buildingId
      && job.goods === goods
    ))
    .reduce((total, job) => total + job.qty, 0);
}

function pendingOrderPortQuantity(physical, goods) {
  return physical.portCalls
    .filter((call) => (
      ["docked", "waiting"].includes(call.status)
      && call.direction === "export"
      && call.goods === goods
      && call.metadata?.kind === "order"
    ))
    .reduce((total, call) => total + call.remaining, 0);
}

function availableCompanyTransport(economy, physical, { walkOnly = false } = {}) {
  ensureCartEconomy(economy);
  if (!physical) return { kind: "legacy", asset: null, capacity: 16 };
  if (!walkOnly) {
    const cart = economy.companyCarts.find((asset) => (
      !asset.broken && !asset.busyJobId && asset.durability > 0
    ));
    if (cart) {
      return {
        kind: "cart",
        asset: cart,
        capacity: cart.kind === "iron" ? P.CART_IRON_CAPACITY : P.CART_WOOD_CAPACITY,
      };
    }
  }
  const activeHandPorters = (physical.activeHaulJobIds ?? [])
    .map((jobId) => haulJobById(physical, jobId))
    .filter((job) => (
      job?.status === "in_transit"
      && job.carrier?.companyTransport
      && !job.carrier.assetId
    ))
    .reduce((total, job) => total + Math.max(1, job.carrier.people ?? 1), 0);
  if (activeHandPorters >= P.COMPANY_HAND_PORTERS) return null;
  return {
    kind: "walk",
    asset: null,
    capacity: (P.COMPANY_HAND_PORTERS - activeHandPorters) * P.CART_HAND_CAPACITY,
  };
}

export function companyAvailableGoodsCapacity(economy, physical, goods) {
  const transport = availableCompanyTransport(economy, physical);
  if (!transport) return 0;
  return transport.capacity / goodsUnitWeight(goods);
}

function assignCompanyPorters(job) {
  if (
    job.carrier.mode !== "walk"
    || !job.carrier.companyTransport
    || job.carrier.people <= 1
  ) return job;
  let remaining = job.qty;
  job.carrier.porters = Array.from({ length: job.carrier.people }, (_, index) => {
    const qty = Math.min(
      remaining,
      P.CART_HAND_CAPACITY / goodsUnitWeight(job.goods),
    );
    remaining -= qty;
    return {
      id: `${job.id}:person${index + 1}`,
      mode: "walk",
      routeMode: job.carrier.routeMode,
      people: 1,
      capacity: P.CART_HAND_CAPACITY,
      departureDelay: index * 0.12,
      cargo: { goods: job.goods, qty },
    };
  });
  if (remaining > 1e-7) throw new Error(`会社運び手の割当容量を超えました: ${remaining}`);
  job.carrier.batchElapsed = 0;
  return job;
}

function dispatchCompanyHaul(
  economy,
  physical,
  {
    day,
    kind,
    fromRole,
    fromSection,
    toRole,
    toSection,
    goods,
    qty,
    metadata = {},
    walkOnly = false,
  },
) {
  const from = companyLogisticsSite(physical, fromRole);
  const to = companyLogisticsSite(physical, toRole);
  if (!from || !to || !isConnected(physical, from, to)) {
    recordLogisticsBlocked(economy, day, fromRole, toRole);
    return null;
  }
  const transport = availableCompanyTransport(economy, physical, { walkOnly });
  if (!transport || qty > transport.capacity / goodsUnitWeight(goods) + 1e-9) return null;
  const carrier = transport.kind === "cart"
    ? createCartCarrier(physical, {
      capacity: transport.capacity,
      cartKind: transport.asset.kind,
      assetId: transport.asset.id,
    })
    : createWalkCarrier(physical, {
      people: Math.max(1, Math.ceil(qty * goodsUnitWeight(goods) / P.CART_HAND_CAPACITY)),
    });
  if (transport.kind === "walk") carrier.routeMode = "cart";
  carrier.capacity = transport.kind === "cart"
    ? transport.capacity
    : Math.max(1, carrier.people) * P.CART_HAND_CAPACITY;
  carrier.companyTransport = true;
  const job = createHaulJob(physical, {
    from: { building: from, section: fromSection },
    to: { building: to, section: toSection },
    goods,
    qty,
    carrier,
  });
  if (transport.asset) transport.asset.busyJobId = job.id;
  assignCompanyPorters(job);
  job.economicLogistics = { kind, day, ...metadata };
  job.economicReconciled = false;
  (physical.economicHaulJobIds ??= []).push(job.id);
  if (job.carrier.routeCost <= 1e-9) {
    completeHaulJob(physical, job.id);
    settleCompanyLogistics(economy, physical, { day });
  }
  return job;
}

function exportLotById(economy, lotId) {
  const index = economy.exportLotIndex?.[lotId];
  if (Number.isSafeInteger(index) && economy.exportLots[index]?.id === lotId) {
    return economy.exportLots[index];
  }
  const fallbackIndex = economy.exportLots.findIndex((lot) => lot.id === lotId);
  if (fallbackIndex < 0) return null;
  (economy.exportLotIndex ??= {})[lotId] = fallbackIndex;
  return economy.exportLots[fallbackIndex];
}

function importRequestById(economy, requestId) {
  const index = economy.importRequestIndex?.[requestId];
  if (Number.isSafeInteger(index) && economy.importRequests[index]?.id === requestId) {
    return economy.importRequests[index];
  }
  const fallbackIndex = economy.importRequests.findIndex((request) => request.id === requestId);
  if (fallbackIndex < 0) return null;
  (economy.importRequestIndex ??= {})[requestId] = fallbackIndex;
  return economy.importRequests[fallbackIndex];
}

function portReturnById(economy, returnId) {
  const index = economy.portReturnIndex?.[returnId];
  if (Number.isSafeInteger(index) && economy.portReturns[index]?.id === returnId) {
    return economy.portReturns[index];
  }
  const fallbackIndex = economy.portReturns.findIndex((lot) => lot.id === returnId);
  if (fallbackIndex < 0) return null;
  (economy.portReturnIndex ??= {})[returnId] = fallbackIndex;
  return economy.portReturns[fallbackIndex];
}

function deactivateId(ids, id) {
  const index = ids?.indexOf(id) ?? -1;
  if (index >= 0) ids.splice(index, 1);
}

const COMPLETED_ECONOMY_LOGISTICS_LIMIT = 96;

function retainEconomyLogistics(records, requiredIds) {
  if (records.length <= requiredIds.length + COMPLETED_ECONOMY_LOGISTICS_LIMIT + 32) {
    return records;
  }
  const required = new Set(requiredIds);
  const optional = records.filter((record) => !required.has(record.id));
  if (optional.length <= COMPLETED_ECONOMY_LOGISTICS_LIMIT + 32) return records;
  const recent = new Set(
    optional.slice(-COMPLETED_ECONOMY_LOGISTICS_LIMIT).map((record) => record.id),
  );
  return records.filter((record) => required.has(record.id) || recent.has(record.id));
}

function rebuildEconomyLogisticsIndex(records) {
  return Object.fromEntries(records.map((record, index) => [record.id, index]));
}

export function pruneEconomyHistory(economy) {
  const importIds = [
    ...(economy.activeImportRequestIds ?? []),
    ...(economy.unsoldImportRequestIds ?? []),
  ];
  const importRequests = retainEconomyLogistics(economy.importRequests ?? [], importIds);
  if (importRequests !== economy.importRequests) {
    economy.importRequests = importRequests;
    economy.importRequestIndex = rebuildEconomyLogisticsIndex(importRequests);
  }

  const exportIds = [
    ...(economy.activeExportLotIds ?? []),
    ...(economy.pendingExportLotIds ?? []),
  ];
  const exportLots = retainEconomyLogistics(economy.exportLots ?? [], exportIds);
  if (exportLots !== economy.exportLots) {
    economy.exportLots = exportLots;
    economy.exportLotIndex = rebuildEconomyLogisticsIndex(exportLots);
  }

  const portReturns = retainEconomyLogistics(
    economy.portReturns ?? [],
    economy.activePortReturnIds ?? [],
  );
  if (portReturns !== economy.portReturns) {
    economy.portReturns = portReturns;
    economy.portReturnIndex = rebuildEconomyLogisticsIndex(portReturns);
  }
  return economy;
}

function activeExportLots(economy) {
  return (economy.activeExportLotIds ??= economy.exportLots
    .filter((lot) => lot.status !== "shipped")
    .map((lot) => lot.id))
    .map((lotId) => exportLotById(economy, lotId))
    .filter(Boolean);
}

function activeImportRequests(economy) {
  return (economy.activeImportRequestIds ??= economy.importRequests
    .filter((request) => ["vessel", "port", "to_market"].includes(request.status))
    .map((request) => request.id))
    .map((requestId) => importRequestById(economy, requestId))
    .filter(Boolean);
}

function activePortReturns(economy) {
  return (economy.activePortReturnIds ??= economy.portReturns
    .filter((lot) => lot.status !== "returned")
    .map((lot) => lot.id))
    .map((returnId) => portReturnById(economy, returnId))
    .filter(Boolean);
}

function dispatchPendingExportLots(economy, physical, { day }) {
  const jobs = [];
  const pendingIds = economy.pendingExportLotIds ??= activeExportLots(economy)
    .filter((lot) => lot.marketQty > 1e-9 || lot.warehouseQty > 1e-9)
    .map((lot) => lot.id);
  const stillPending = [];
  for (const lotId of pendingIds) {
    const lot = exportLotById(economy, lotId);
    if (!lot) continue;
    while (lot.marketQty > 1e-9) {
      const qty = Math.min(companyAvailableGoodsCapacity(economy, physical, lot.goods), lot.marketQty);
      if (qty <= 1e-9) break;
      const job = dispatchCompanyHaul(economy, physical, {
        day,
        kind: "export_market",
        fromRole: "market",
        fromSection: "outbound",
        toRole: "warehouse",
        toSection: "storage",
        goods: lot.goods,
        qty,
        metadata: { lotId: lot.id },
      });
      if (!job) break;
      lot.marketQty -= qty;
      lot.status = "to_warehouse";
      jobs.push(job);
    }
    while (lot.warehouseQty > 1e-9) {
      const qty = Math.min(companyAvailableGoodsCapacity(economy, physical, lot.goods), lot.warehouseQty);
      if (qty <= 1e-9) break;
      const job = dispatchCompanyHaul(economy, physical, {
        day,
        kind: "export_port",
        fromRole: "warehouse",
        fromSection: "storage",
        toRole: "port",
        toSection: "outbound",
        goods: lot.goods,
        qty,
        metadata: { lotId: lot.id },
      });
      if (!job) break;
      lot.warehouseQty -= qty;
      lot.status = "to_port";
      jobs.push(job);
    }
    if (lot.marketQty > 1e-9 || lot.warehouseQty > 1e-9) stillPending.push(lot.id);
  }
  economy.pendingExportLotIds = stillPending;
  return jobs;
}

function dispatchPendingImports(economy, physical, { day }) {
  const jobs = [];
  for (const request of activeImportRequests(economy)) {
    if (request.status !== "port") continue;
    while (request.portQty > 1e-9) {
      const qty = Math.min(
        companyAvailableGoodsCapacity(economy, physical, request.goods),
        request.portQty,
      );
      if (qty <= 1e-9) break;
      const job = dispatchCompanyHaul(economy, physical, {
        day,
        kind: "import_delivery",
        fromRole: "port",
        fromSection: "inbound",
        toRole: "market",
        toSection: "inbound",
        goods: request.goods,
        qty,
        metadata: {
          requestId: request.id,
          cost: qty * request.unitCost,
        },
      });
      if (!job) break;
      request.portQty -= qty;
      request.status = "to_market";
      jobs.push(job);
    }
    if (request.portQty <= 1e-9) deactivateId(economy.activeImportRequestIds, request.id);
  }
  return jobs;
}

function dispatchPendingPortReturns(economy, physical, { day }) {
  const jobs = [];
  for (const lot of activePortReturns(economy)) {
    while (lot.portQty > 1e-9) {
      const qty = Math.min(companyAvailableGoodsCapacity(economy, physical, lot.goods), lot.portQty);
      if (qty <= 1e-9) break;
      const job = dispatchCompanyHaul(economy, physical, {
        day,
        kind: "order_return",
        fromRole: "port",
        fromSection: "outbound",
        toRole: "warehouse",
        toSection: "storage",
        goods: lot.goods,
        qty,
        metadata: { returnId: lot.id, cost: qty * lot.unitCost },
      });
      if (!job) break;
      lot.portQty -= qty;
      lot.status = "to_warehouse";
      jobs.push(job);
    }
    if (lot.portQty <= 1e-9) deactivateId(economy.activePortReturnIds, lot.id);
  }
  return jobs;
}

function queuePortReturn(economy, physical, { day, goods, qty, unitCost }) {
  if (qty <= 1e-9) return null;
  const lot = {
    id: `back${economy.nextPortReturnId}`,
    goods,
    qty,
    portQty: qty,
    returnedQty: 0,
    unitCost,
    status: "port",
  };
  economy.nextPortReturnId += 1;
  economy.portReturns.push(lot);
  (economy.portReturnIndex ??= {})[lot.id] = economy.portReturns.length - 1;
  (economy.activePortReturnIds ??= []).push(lot.id);
  dispatchPendingPortReturns(economy, physical, { day });
  return lot;
}

function cancelOrderPortCalls(economy, physical, { day }) {
  for (const call of [...physical.portCalls]) {
    if (!["docked", "waiting"].includes(call.status) || call.metadata?.kind !== "order") continue;
    cancelPortCall(physical, call.id);
    queuePortReturn(economy, physical, {
      day,
      goods: call.goods,
      qty: call.remaining,
      unitCost: call.metadata.unitCost ?? 0,
    });
  }
}

export function requestCompanyStockRelease(economy, physical, goods, { day, qty = 16 }) {
  if (!Number.isFinite(qty) || qty < 0) {
    throw new TypeError("stock release quantity must be non-negative and finite");
  }
  const reserved = economy.order?.g === goods ? economy.order.left : 0;
  economy.stockReleaseQueue ??= [];
  const queued = economy.stockReleaseQueue
    .filter((request) => request.goods === goods)
    .reduce((total, request) => total + request.remaining, 0);
  const free = Math.max(0, (economy.stock[goods] ?? 0) - reserved - queued);
  const remaining = Math.min(qty, free);
  if (remaining <= 1e-9) return null;
  const averageCost = (economy.stockCost[goods] ?? 0)
    / Math.max(1e-9, economy.stock[goods] ?? 0);
  const request = {
    id: `release${economy.nextStockReleaseId ?? 1}`,
    goods,
    remaining,
    averageCost,
    requestedDay: day,
  };
  economy.nextStockReleaseId = (economy.nextStockReleaseId ?? 1) + 1;
  economy.stockReleaseQueue.push(request);
  const jobs = dispatchPendingStockReleases(economy, physical, { day });
  return jobs[0] ?? null;
}

function dispatchPendingStockReleases(economy, physical, { day }) {
  const jobs = [];
  const pending = [];
  for (const request of economy.stockReleaseQueue ?? []) {
    while (request.remaining > 1e-9) {
      const load = Math.min(
        companyAvailableGoodsCapacity(economy, physical, request.goods),
        request.remaining,
        economy.stock[request.goods] ?? 0,
      );
      if (load <= 1e-9) break;
      const job = dispatchCompanyHaul(economy, physical, {
        day,
        kind: "stock_release",
        fromRole: "warehouse",
        fromSection: "storage",
        toRole: "market",
        toSection: "inbound",
        goods: request.goods,
        qty: load,
        metadata: { cost: load * request.averageCost, releaseRequestId: request.id },
      });
      if (!job) break;
      economy.stock[request.goods] -= load;
      economy.stockCost[request.goods] = Math.max(
        0,
        (economy.stockCost[request.goods] ?? 0) - load * request.averageCost,
      );
      request.remaining -= load;
      jobs.push(job);
    }
    if (request.remaining > 1e-9) pending.push(request);
  }
  economy.stockReleaseQueue = pending;
  return jobs;
}

export function setCompanyStockTarget(economy, goods, qty) {
  if (!GOODS.includes(goods)) throw new Error(`unknown stock target goods: ${goods}`);
  if (!Number.isFinite(qty) || qty < 0) throw new TypeError("stock target must be non-negative and finite");
  economy.stockTgt[goods] = qty;
  return qty;
}

export function runCompanyProcurement(economy, { day, physical = null }) {
  const purchases = [];
  const repairNeeds = companyBuildingRepairNeeds(physical);
  const procurementGoods = new Set([
    ...Object.keys(economy.stockTgt),
    ...Object.keys(repairNeeds),
    ...(economy.order?.g ? [economy.order.g] : []),
  ]);
  for (const goods of procurementGoods) {
    // 注文の受諾そのものを必要数の買付命令とする。プレイヤーに同じ数量を
    // 買上げ目標へ再入力させず、市場→倉庫→港の実物流だけを残す。
    // 港へ向かう荷と荷役待ちはすでに契約へ割り当て済みなので、倉庫で新たに
    // 確保すべき量から控除する。任意備蓄と修繕需要は別用途として加算する。
    const activeOrder = economy.order?.g === goods ? economy.order : null;
    const committedToOrder = activeOrder && physical
      ? pendingCompanyHaul(physical, "order", goods)
        + pendingOrderPortQuantity(physical, goods)
      : 0;
    const orderWarehouseTarget = activeOrder
      ? Math.max(0, activeOrder.left - committedToOrder)
      : 0;
    const warehouseOnly = Boolean(activeOrder);
    const warehouseAvailable = (economy.stock[goods] ?? 0)
      + (physical ? pendingCompanyHaul(physical, "procurement", goods) : 0);
    const repairLack = Math.max(0, (repairNeeds[goods] ?? 0) - warehouseAvailable);
    const warehouseAfterRepair = Math.max(0, warehouseAvailable - (repairNeeds[goods] ?? 0));
    const warehouseTarget = Math.max(
      economy.stockTgt[goods] ?? 0,
      orderWarehouseTarget,
    );
    const baseLack = Math.max(
      0,
      warehouseTarget
        - warehouseAfterRepair
        - (physical && !warehouseOnly ? (economy.marketStock[goods] ?? 0) : 0)
        - (physical && !warehouseOnly ? pendingCompanyHaul(physical, "stock_release", goods) : 0),
    );
    let lack = repairLack + baseLack;
    if (lack <= 1e-9 || economy.company.money <= -companyCreditLimit(economy, { day })) continue;
    const stalls = [...economy.stalls[goods]]
      .filter((stall) => (stall.marketId ?? "main") === "main")
      .sort((a, b) => a.price - b.price);
    for (const stall of stalls) {
      if (lack <= 1e-9) break;
      const seller = findHousehold(economy, stall.householdId);
      if (!seller) continue;
      let remaining = Math.min(stall.qty, lack);
      while (remaining > 1e-9) {
        const qty = Math.min(companyAvailableGoodsCapacity(economy, physical, goods), remaining);
        if (qty <= 1e-9) break;
        const payment = qty * stall.price;
        let job = null;
        if (physical) {
          job = dispatchCompanyHaul(economy, physical, {
            day,
            kind: "procurement",
            fromRole: "market",
            fromSection: "outbound",
            toRole: "warehouse",
            toSection: "storage",
            goods,
            qty,
            metadata: { payment, householdId: seller.id, price: stall.price },
          });
          if (!job) break;
        }
        stall.qty -= qty;
        seller.purse += payment;
        seller.income30 += payment;
        postCompanyLedger(economy.company, {
          day,
          amount: -payment,
          reason: `世帯${seller.id}から倉庫へ${goods}を買上げ`,
        });
        economy.co.procBuy += payment;
        if (!physical) {
          economy.stock[goods] = (economy.stock[goods] ?? 0) + qty;
          economy.stockCost[goods] = (economy.stockCost[goods] ?? 0) + payment;
        }
        lack -= qty;
        remaining -= qty;
        purchases.push({
          goods,
          householdId: seller.id,
          qty,
          price: stall.price,
          jobId: job?.id ?? null,
        });
      }
    }
  }
  return purchases;
}

function dispatchCompanyOrder(economy, physical, { day }) {
  if (!economy.order) return [];
  const goods = economy.order.g;
  let remaining = Math.max(
    0,
    economy.order.left
      - pendingCompanyHaul(physical, "order", goods)
      - pendingOrderPortQuantity(physical, goods),
  );
  const jobs = [];
  // 注文は買上げ目標で倉庫へ確保した原価簿から出す。市場の会社小売棚を
  // 直接転用すると、注文時に比較した市場最安と古い平均原価が食い違う。
  for (const source of [
    { role: "warehouse", section: "storage", stock: economy.stock, cost: economy.stockCost },
  ]) {
    while (remaining > 1e-9 && (source.stock[goods] ?? 0) > 1e-9) {
      const qty = Math.min(
        companyAvailableGoodsCapacity(economy, physical, goods),
        remaining,
        source.stock[goods] ?? 0,
      );
      if (qty <= 1e-9) break;
      const averageCost = (source.cost[goods] ?? 0)
        / Math.max(1e-9, source.stock[goods] ?? 0);
      const job = dispatchCompanyHaul(economy, physical, {
        day,
        kind: "order",
        fromRole: source.role,
        fromSection: source.section,
        toRole: "port",
        toSection: "outbound",
        goods,
        qty,
        metadata: {
          cost: qty * averageCost,
          unitCost: averageCost,
          orderPrice: economy.order.price,
          orderDue: economy.order.due,
        },
      });
      if (!job) break;
      source.stock[goods] -= qty;
      source.cost[goods] = Math.max(0, (source.cost[goods] ?? 0) - qty * averageCost);
      remaining -= qty;
      jobs.push(job);
    }
  }
  return jobs;
}

export function settleCompanyLogistics(economy, physical, { day }) {
  const settled = [];
  const pendingIds = physical.economicHaulJobIds
    ?? physical.haulJobs
      .filter((job) => job.economicLogistics && !job.economicReconciled)
      .map((job) => job.id);
  const stillPending = [];
  for (const jobId of pendingIds) {
    const job = haulJobById(physical, jobId);
    if (!job) continue;
    if (
      job.status !== "completed"
      || !job.economicLogistics
      || job.economicReconciled
    ) {
      if (!job.economicReconciled) stillPending.push(job.id);
      continue;
    }
    const metadata = job.economicLogistics;
    if (job.carrier.assetId) {
      ensureCartEconomy(economy);
      const assetIndex = economy.companyCarts.findIndex((cart) => (
        cart.id === job.carrier.assetId
      ));
      if (assetIndex >= 0) {
        const asset = economy.companyCarts[assetIndex];
        asset.busyJobId = null;
        asset.durability = Math.max(0, asset.durability - Math.max(0, job.carrier.routeCost ?? 0));
        economy.cartStats.companyUses += 1;
        if (asset.durability <= 1e-9) {
          economy.companyCarts.splice(assetIndex, 1);
          economy.cartStats.companyBroken += 1;
          recordEconomyEvent(economy, day, `会社の木の荷車${asset.id}が摩耗して役目を終えた`);
        }
      }
    }
    if (metadata.kind === "procurement") {
      economy.stock[job.goods] = (economy.stock[job.goods] ?? 0) + job.qty;
      economy.stockCost[job.goods] = (economy.stockCost[job.goods] ?? 0) + metadata.payment;
    } else if (metadata.kind === "stock_release") {
      economy.marketStock[job.goods] = (economy.marketStock[job.goods] ?? 0) + job.qty;
      economy.marketStockCost[job.goods] = (economy.marketStockCost[job.goods] ?? 0) + metadata.cost;
    } else if (metadata.kind === "company_repair") {
      // 現物はcreateHaulJobの到着処理で対象施設の修繕棚へ入っている。
      // 会社倉庫の数量・原価は出発時に差し引き、周期到来時の実消費まで
      // materialFlowsへは計上しない。
    } else if (metadata.kind === "export_market") {
      const lot = exportLotById(economy, metadata.lotId);
      if (lot) {
        lot.warehouseQty += job.qty;
        lot.status = "warehouse";
        if (!(economy.pendingExportLotIds ??= []).includes(lot.id)) {
          economy.pendingExportLotIds.push(lot.id);
        }
      }
    } else if (metadata.kind === "export_port") {
      const lot = exportLotById(economy, metadata.lotId);
      const port = companyLogisticsSite(physical, "port");
      if (lot && port) {
        lot.portQty += job.qty;
        lot.status = "port";
        dockVessel(physical, {
          portBuildingId: port.id,
          direction: "export",
          goods: job.goods,
          qty: job.qty,
          metadata: { kind: "household_export", lotId: lot.id, yardReady: true },
        });
      }
    } else if (metadata.kind === "import_delivery") {
      const request = importRequestById(economy, metadata.requestId);
      if (request?.aid) {
        (economy.aidStock ??= {})[job.goods] = (economy.aidStock[job.goods] ?? 0) + job.qty;
      } else {
        economy.importStock[job.goods] = (economy.importStock[job.goods] ?? 0) + job.qty;
        economy.importStockCost[job.goods] = (economy.importStockCost[job.goods] ?? 0) + metadata.cost;
      }
      if (request) {
        request.marketQty += job.qty;
        request.status = "market";
      }
    } else if (metadata.kind === "order_return") {
      const lot = portReturnById(economy, metadata.returnId);
      economy.stock[job.goods] = (economy.stock[job.goods] ?? 0) + job.qty;
      economy.stockCost[job.goods] = (economy.stockCost[job.goods] ?? 0) + metadata.cost;
      if (lot) {
        lot.returnedQty += job.qty;
        if (lot.returnedQty >= lot.qty - 1e-9) {
          lot.status = "returned";
          deactivateId(economy.activePortReturnIds, lot.id);
        }
      }
    } else if (metadata.kind === "order") {
      const port = companyLogisticsSite(physical, "port");
      if (
        port
        && economy.order
        && economy.order.g === job.goods
      ) {
        dockVessel(physical, {
          portBuildingId: port.id,
          direction: "export",
          goods: job.goods,
          qty: Math.min(job.qty, economy.order.left),
          metadata: {
            kind: "order",
            orderPrice: metadata.orderPrice,
            orderDue: metadata.orderDue,
            unitCost: metadata.unitCost,
            yardReady: true,
          },
        });
      } else {
        queuePortReturn(economy, physical, {
          day,
          goods: job.goods,
          qty: job.qty,
          unitCost: metadata.unitCost ?? 0,
        });
      }
    }
    job.economicReconciled = true;
    settled.push({ jobId: job.id, kind: metadata.kind, goods: job.goods, qty: job.qty });
  }
  physical.economicHaulJobIds = stillPending;
  // 期限付き注文は、完了した通常補充が運び手を解放した瞬間に先に割り当てる。
  // 日初だけのdispatchでは、連続する市場補充が全運び手を再取得し続けてしまう。
  if (economy.order) dispatchCompanyOrder(economy, physical, { day });
  dispatchPendingStockReleases(economy, physical, { day });
  dispatchPendingExportLots(economy, physical, { day });
  dispatchPendingImports(economy, physical, { day });
  dispatchPendingPortReturns(economy, physical, { day });
  return settled;
}

export function settlePortTransfers(economy, physical, { day, transfers }) {
  const settled = [];
  for (const transfer of transfers) {
    const metadata = transfer.metadata ?? {};
    if (metadata.kind === "import") {
      const request = importRequestById(economy, metadata.requestId);
      if (!request) continue;
      request.portQty += transfer.qty;
      if (request.aid) {
        economy.imported[transfer.goods] = (economy.imported[transfer.goods] ?? 0) + transfer.qty;
        recordEconomicMaterialFlow(
          economy,
          transfer.goods,
          "imp",
          transfer.qty,
          `本国からの食料支援(${transfer.goods})が港ヤードへ届く——贈与のため代金は動かない`,
        );
      } else {
        const wholesale = transfer.qty * request.unitCost;
        postCompanyLedger(economy.company, {
          day,
          amount: -wholesale,
          reason: `${transfer.goods}の本土仕入`,
        });
        recordExternalMoneyFlow(economy, {
          amount: -wholesale,
          reason: `${transfer.goods}の本土仕入`,
        });
        economy.outBy[`imp_${transfer.goods}`] = (economy.outBy[`imp_${transfer.goods}`] ?? 0) + wholesale;
        economy.imported[transfer.goods] = (economy.imported[transfer.goods] ?? 0) + transfer.qty;
        recordEconomicMaterialFlow(
          economy,
          transfer.goods,
          "imp",
          transfer.qty,
          `${transfer.goods}を本土から港ヤードへ輸入`,
        );
      }
      request.paidQty = Math.min(request.qty, (request.paidQty ?? 0) + transfer.qty);
      if (transfer.completed) request.status = "port";
    } else if (metadata.kind === "household_export") {
      const lot = exportLotById(economy, metadata.lotId);
      if (!lot) continue;
      lot.portQty = Math.max(0, lot.portQty - transfer.qty);
      lot.shippedQty += transfer.qty;
      const revenue = transfer.qty * lot.unitRevenue;
      postCompanyLedger(economy.company, {
        day,
        amount: revenue,
        reason: `${transfer.goods}の本土売上`,
      });
      recordExternalMoneyFlow(economy, { amount: revenue, reason: `${transfer.goods}の本土売上` });
      economy.co.expSell += revenue;
      economy.exported[transfer.goods] = (economy.exported[transfer.goods] ?? 0) + transfer.qty;
      recordEconomicMaterialFlow(
        economy,
        transfer.goods,
        "exp",
        transfer.qty,
        `${transfer.goods}を港から本土へ輸出`,
      );
      if (lot.shippedQty >= lot.qty - 1e-9) {
        lot.status = "shipped";
        deactivateId(economy.activeExportLotIds, lot.id);
      }
    } else if (metadata.kind === "order") {
      if (
        !economy.order
        || economy.order.g !== transfer.goods
      ) continue;
      const shipped = Math.min(transfer.qty, economy.order.left);
      economy.order.left -= shipped;
      const revenue = shipped * metadata.orderPrice * 1.25;
      postCompanyLedger(economy.company, {
        day,
        amount: revenue,
        reason: `本国注文へ${transfer.goods}を出荷`,
      });
      recordExternalMoneyFlow(economy, {
        amount: revenue,
        reason: `${transfer.goods}の本国注文売上`,
      });
      economy.co.ordSell += revenue;
      economy.exported[transfer.goods] = (economy.exported[transfer.goods] ?? 0) + shipped;
      recordEconomicMaterialFlow(
        economy,
        transfer.goods,
        "exp",
        shipped,
        `${transfer.goods}を本国注文へ出荷`,
      );
      if (economy.order.left <= 1e-9) {
        recordEconomyEvent(economy, day, "★注文を納めた——本国での評判が上がった");
        economy.orderDone += 1;
        economy.order = null;
        cancelOrderPortCalls(economy, physical, { day });
      }
    }
    settled.push(transfer);
  }
  dispatchPendingImports(economy, physical, { day });
  return settled;
}

function settleHouseholdInZone(economy, physical, household, zone) {
  household.buildingId = zone.buildingId ?? null;
  if (zone.vacated) {
    household.px = zone.x;
    household.py = zone.y;
    household.state = "home";
    zone.vacated = false;
  }
  const building = physical ? buildingById(physical, household.buildingId) : null;
  if (building) {
    building.ownerHouseholdId = household.id;
    ensureBuildingShelves(building);
    // 区画指定時の支度金は本土建築資材を含む。移民・分家とも不足分を入居便で
    // 受け取り、新規建物の実消費を経て完成する。
    if (!building.constructionConsumed && household.state === "arriving") {
      for (const [goods, required] of Object.entries(building.constructionRequired ?? {})) {
        const available = (household.pantry[goods] ?? 0)
          + sectionAmount(building, "construction", goods);
        const missing = Math.max(0, required - available);
        if (missing <= 1e-9) continue;
        household.pantry[goods] = (household.pantry[goods] ?? 0) + missing;
        recordEconomicMaterialFlow(
          economy,
          goods,
          "imp",
          missing,
          `世帯${household.id}の本土建築資材`,
          { includeInDaily: false },
        );
      }
    }
    for (const [goods, need] of Object.entries(building.constructionRequired ?? {})) {
      const carried = Math.min(need, household.pantry[goods] ?? 0);
      if (carried <= 1e-9) continue;
      household.pantry[goods] -= carried;
      depositInventory(building, "construction", goods, carried);
    }
  }
}

function createSuccessorHousehold(economy, donor, zone, physical = null) {
  const household = makeHouseholdRecord(economy, { job: zone.job, x: zone.x, y: zone.y });
  const movedCount = Math.floor(donor.members.length / 2);
  const moved = donor.members.splice(donor.members.length - movedCount, movedCount);
  const share = movedCount / (movedCount + donor.members.length);
  household.sur = donor.sur;
  household.members = moved;
  // 持ち出しは旅の財布(頭数比)と食料だけ。食料は移民の開拓キットと同水準を
  // 上限に、親の食料の頭数比取り分を超えない。全pantryの頭数比相続は、収穫直後の
  // 麦畑から分かれた世帯が売り先のない麦数千荷を抱え込む原因だった。
  const donorFood = FOODS.reduce((total, goods) => total + donor.pantry[goods], 0);
  let foodCarry = Math.min(SETTLER_FOOD_KIT, donorFood * share);
  for (const goods of FOOD_BUY_ORDER) {
    if (foodCarry <= 1e-9) break;
    const carried = Math.min(donor.pantry[goods], foodCarry);
    household.pantry[goods] = carried;
    donor.pantry[goods] -= carried;
    foodCarry -= carried;
  }
  household.purse = donor.purse * share;
  donor.purse *= 1 - share;
  household.px = donor.x;
  household.py = donor.y;
  household.state = "arriving";
  settleHouseholdInZone(economy, physical, household, zone);
  economy.households.push(household);
  return household;
}

function createZoneImmigrant(economy, zone, day, physical = null) {
  const household = createHousehold(economy, {
    job: zone.job,
    x: zone.x,
    y: zone.y,
  });
  household.px = economy.port.x;
  household.py = economy.port.y;
  household.state = "arriving";
  settleHouseholdInZone(economy, physical, household, zone);
  postCompanyLedger(economy.company, {
    day,
    amount: -P.PASSAGE,
    reason: `移民${household.id}の渡航費`,
  });
  recordExternalMoneyFlow(economy, {
    amount: -P.PASSAGE,
    reason: `移民${household.id}の本土渡航費`,
  });
  economy.outBy.pass += P.PASSAGE;
  return household;
}

export function fillSettlementZones(economy, { day, physical = null }) {
  const settlements = [];
  if (day % 15 !== 0 || !economy.port) return settlements;
  for (const zone of economy.zones) {
    if (zone.filled || settlements.length >= 2) continue;
    const donor = economy.households
      .filter((household) => household.members.length >= 8 && household.state === "home")
      .sort((a, b) => b.members.length - a.members.length)[0];
    if (donor) {
      const household = createSuccessorHousehold(economy, donor, zone, physical);
      zone.filled = true;
      settlements.push({ kind: "successor", zone, household, donor });
      recordEconomyEvent(
        economy,
        day,
        `${donor.sur}家の${household.members.length}人が分かれて${zone.job}の区画へ移り住む`,
      );
    } else if (economy.hungryN < Math.max(1, economy.households.length * 0.2)) {
      const household = createZoneImmigrant(economy, zone, day, physical);
      zone.filled = true;
      settlements.push({ kind: "immigrant", zone, household, donor: null });
      recordEconomyEvent(economy, day, "入植船が着いた——本土からの移民");
    }
  }
  return settlements;
}

export const CARAVAN_EMPLOYMENT_LIMITS = deepFreeze({
  recruitment: { min: 0, max: 12 },
  wage: { min: 0, max: 20 },
});

function normalizedCaravanEmployment(building) {
  const offer = building?.caravanEmployment ?? {};
  return {
    recruitment: Number.isSafeInteger(offer.recruitment) ? offer.recruitment : 1,
    wage: Number.isFinite(offer.wage) ? offer.wage : 1,
  };
}

export function setCaravanEmployment(
  physical,
  { buildingId, recruitment, wage },
) {
  const building = buildingById(physical, buildingId);
  if (!building || building.type !== "carter") {
    return { ok: false, reason: "caravan_inn_not_found" };
  }
  if (
    !Number.isSafeInteger(recruitment)
    || recruitment < CARAVAN_EMPLOYMENT_LIMITS.recruitment.min
    || recruitment > CARAVAN_EMPLOYMENT_LIMITS.recruitment.max
  ) return { ok: false, reason: "invalid_recruitment" };
  if (
    !Number.isFinite(wage)
    || wage < CARAVAN_EMPLOYMENT_LIMITS.wage.min
    || wage > CARAVAN_EMPLOYMENT_LIMITS.wage.max
  ) return { ok: false, reason: "invalid_wage" };
  building.caravanEmployment = { recruitment, wage };
  return { ok: true, employment: structuredClone(building.caravanEmployment) };
}

export function caravanCrewCount(economy, building) {
  if (!building || building.type !== "carter" || building.ownerHouseholdId === null) return 0;
  const household = economy.households.find(
    (candidate) => candidate.id === building.ownerHouseholdId,
  );
  if (!household) return 0;
  return Math.min(normalizedCaravanEmployment(building).recruitment, household.members.length);
}

export function caravanExpectedAnnualIncome(building, household = null) {
  if (!building || building.type !== "carter") return 0;
  const offer = normalizedCaravanEmployment(building);
  const availableWorkers = household?.members?.length ?? offer.recruitment;
  return offer.wage * Math.min(offer.recruitment, availableWorkers) * 360;
}

export function payCaravanFixedWages(economy, physical, { day }) {
  const payments = [];
  for (const building of physical.buildings) {
    if (building.type !== "carter") continue;
    const household = economy.households.find(
      (candidate) => candidate.id === building.ownerHouseholdId,
    );
    const crew = caravanCrewCount(economy, building);
    const wage = normalizedCaravanEmployment(building).wage;
    const amount = crew * wage;
    if (!household || amount <= 1e-9) continue;
    household.purse += amount;
    household.income30 += amount;
    postCompanyLedger(economy.company, {
      day,
      amount: -amount,
      reason: `隊商宿${building.id}の固定給`,
    });
    economy.co.carterWages = (economy.co.carterWages ?? 0) + amount;
    (economy.caravanWagesPending ??= {})[building.id] = (
      economy.caravanWagesPending[building.id] ?? 0
    ) + amount;
    payments.push({ buildingId: building.id, householdId: household.id, crew, wage, amount });
  }
  return payments;
}

export function runCompanyDayStart(economy, { day, random, physical = null }) {
  if (typeof random !== "function") throw new TypeError("company day-start random must be a function");
  const result = {
    created: null,
    offerExpired: null,
    expired: null,
    shipped: null,
    completed: false,
    dispatched: [],
    settlements: [],
    buildingsCompleted: [],
    fixedWages: [],
  };
  if (physical) result.fixedWages = payCaravanFixedWages(economy, physical, { day });
  const orderRoll = !economy.order && !economy.orderOffer && day > 60 && day % 15 === 0
    ? random()
    : null;
  const shouldOfferOrder = economy.orderDone === 0 || orderRoll < 0.5;
  if (!economy.order && !economy.orderOffer && orderRoll !== null && shouldOfferOrder) {
    const orderableDailySurplus = (goods) => Math.max(
      0,
      (economy.f30[goods]?.prod ?? 0) - (economy.f30[goods]?.cons ?? 0),
    );
    const candidates = economy.orderDone === 0
      ? ((economy.f30.tools?.prod ?? 0) > 0.3 ? ["tools"] : [])
      : Object.keys(ORDER_NAMES).filter(
        (goods) => orderableDailySurplus(goods) > 0.3,
      );
    if (candidates.length > 0) {
      // 開拓初回は教程で築いた木工連鎖の試し荷にする。二件目からは生産中の
      // 品目を従来どおり抽選し、食料加工などにも注文が巡る。
      const goods = economy.orderDone === 0
        ? "tools"
        : candidates[Math.floor(random() * candidates.length)];
      const qty = economy.orderDone === 0
        ? P.FIRST_ORDER_QTY
        : Math.max(1, Math.round(Math.min(80, orderableDailySurplus(goods) * 5)));
      economy.orderOffer = {
        g: goods,
        qty,
        left: qty,
        price: ORDER_PRICES[goods],
        due: day + 90,
      };
      result.created = structuredClone(economy.orderOffer);
      recordEconomyEvent(
        economy,
        day,
        `★本国より注文状: ${ORDER_NAMES[goods]}${qty}荷(@${Math.round(ORDER_PRICES[goods] * 10)}デナリ・90日以内)`,
      );
    }
  }

  if (economy.orderOffer && day >= economy.orderOffer.due) {
    result.offerExpired = structuredClone(economy.orderOffer);
    recordEconomyEvent(
      economy,
      day,
      `未受諾の注文状が失効: ${ORDER_NAMES[economy.orderOffer.g]}${Math.round(economy.orderOffer.qty)}荷`,
    );
    economy.orderOffer = null;
  }

  // 表示上は「due日目まで」なので、期限当日の荷役も有効にする。
  // 旧式はdue日の開始時に失効し、港へ着いた端数だけを不自然に持ち帰っていた。
  const tenderedOrderQty = economy.order && physical
    ? pendingCompanyHaul(physical, "order", economy.order.g)
      + pendingOrderPortQuantity(physical, economy.order.g)
    : 0;
  if (
    economy.order
    && day > economy.order.due
    && tenderedOrderQty + 1e-9 < economy.order.left
  ) {
    result.expired = structuredClone(economy.order);
    recordEconomyEvent(
      economy,
      day,
      `注文の期限切れ——本国重役たちの心証を損ねた(残${Math.round(economy.order.left)}荷)`,
    );
    economy.order = null;
    if (physical) cancelOrderPortCalls(economy, physical, { day });
  }

  if (economy.order && physical) {
    result.dispatched = dispatchCompanyOrder(economy, physical, { day })
      .map((job) => ({ jobId: job.id, goods: job.goods, qty: job.qty }));
  } else if (economy.order) {
    const goods = economy.order.g;
    const qty = Math.min(economy.stock[goods] ?? 0, economy.order.left);
    if (qty > 1e-9) {
      const averageCost = (economy.stockCost[goods] ?? 0)
        / Math.max(1e-9, economy.stock[goods] ?? 0);
      economy.stockCost[goods] = Math.max(
        0,
        (economy.stockCost[goods] ?? 0) - qty * averageCost,
      );
      economy.stock[goods] -= qty;
      economy.order.left -= qty;
      const revenue = qty * economy.order.price * 1.25;
      postCompanyLedger(economy.company, {
        day,
        amount: revenue,
        reason: `本国注文へ${goods}を出荷`,
      });
      recordExternalMoneyFlow(economy, { amount: revenue, reason: `${goods}の本国注文売上` });
      economy.co.ordSell += revenue;
      economy.exported[goods] = (economy.exported[goods] ?? 0) + qty;
      recordEconomicMaterialFlow(economy, goods, "exp", qty, `${goods}を本国注文へ出荷`);
      result.shipped = { goods, qty, revenue };
      if (economy.order.left <= 1e-9) {
        recordEconomyEvent(economy, day, "★注文を納めた——本国での評判が上がった");
        economy.orderDone += 1;
        economy.order = null;
        result.completed = true;
      }
    }
  }
  result.settlements = fillSettlementZones(economy, { day, physical });
  for (const household of economy.households) {
    if (household.state !== "building") continue;
    if (physical && !constructionReady(physical, household)) continue;
    if (physical) consumeConstructionMaterials(economy, physical, household);
    household.buildDays -= 1;
    if (household.buildDays <= 0) {
      household.state = "home";
      result.buildingsCompleted.push(household.id);
      recordEconomyEvent(economy, day, `${household.job}#${household.id} 家が建った`);
    }
  }
  return result;
}

export function fundSettlementZone(
  economy,
  { job, x, y, day, buildingId = null, canPlace = () => [true, ""] },
) {
  const placement = canPlace(job, x, y);
  const ok = Array.isArray(placement) ? placement[0] : placement;
  const reason = Array.isArray(placement) ? placement[1] : "配置不可";
  if (!ok) {
    recordEconomyEvent(economy, day, `区画不可(${job}): ${reason}`);
    return false;
  }
  if (economy.company.money - P.BUILD_COST < -companyCreditLimit(economy, { day })) {
    recordEconomyEvent(economy, day, `金庫不足——支度金${P.BUILD_COST * 10}デナリが出せない`);
    return false;
  }
  postCompanyLedger(economy.company, {
    day,
    amount: -P.BUILD_COST,
    reason: `${job}区画の支度金`,
  });
  recordExternalMoneyFlow(economy, { amount: -P.BUILD_COST, reason: `${job}区画の本土建築資材` });
  economy.co.build += P.BUILD_COST;
  economy.zones.push({ job, x, y, buildingId, filled: false });
  recordEconomyEvent(economy, day, `区画指定: ${job}(支度金${P.BUILD_COST * 10}デナリ)`);
  return true;
}

export function fundCompanyBuilding(economy, { type, day }) {
  const label = type === "market" ? "市場" : type === "warehouse" ? "倉庫" : null;
  if (!label) throw new Error(`会社施設の建築対象外です: ${type}`);
  if (!Number.isSafeInteger(day) || day < 0) {
    throw new TypeError("company building day must be a non-negative safe integer");
  }
  if (economy.company.money - P.BUILD_COST < -companyCreditLimit(economy, { day })) {
    recordEconomyEvent(economy, day, `金庫不足——${label}の建築費${P.BUILD_COST * 10}デナリが出せない`);
    return false;
  }
  postCompanyLedger(economy.company, {
    day,
    amount: -P.BUILD_COST,
    reason: `${label}の建築費`,
  });
  recordExternalMoneyFlow(economy, {
    amount: -P.BUILD_COST,
    reason: `${label}の本土建築資材`,
  });
  economy.co.build += P.BUILD_COST;
  recordEconomyEvent(economy, day, `物流施設建設: ${label}(建築費${P.BUILD_COST * 10}デナリ)`);
  return true;
}

export function investCompanyShipping(economy, { day }) {
  if (economy.shipping || economy.company.money < -companyCreditLimit(economy, { day })) return false;
  postCompanyLedger(economy.company, {
    day,
    amount: -P.SHIP_COST,
    reason: "沿岸海運への投資",
  });
  recordExternalMoneyFlow(economy, { amount: -P.SHIP_COST, reason: "沿岸海運への本土投資" });
  economy.shipping = true;
  for (const goods of Object.keys(economy.expCap)) economy.expCap[goods] *= P.SHIP_CAP;
  for (const goods of Object.keys(economy.expMl)) economy.expMl[goods] *= P.SHIP_PRICE;
  recordEconomyEvent(economy, day, "★沿岸海運に投資(輸出天井×2・本土価+20%)");
  return true;
}

export function runCompanyFinance(economy, { day }) {
  if (day % 30 !== 0) return { interest: 0, bankrupt: false };
  const month = Math.floor((day - 1) / 30) + 1;
  const debt = Math.max(0, -economy.company.money);
  let interest = 0;
  if (month > P.FREE_M && debt > 0) {
    interest = debt * P.IRATE;
    postCompanyLedger(economy.company, { day, amount: -interest, reason: "会社債務の月利" });
    recordExternalMoneyFlow(economy, { amount: -interest, reason: "会社債務の本土利払い" });
  }
  let bankrupt = false;
  if (economy.goDay === null && -economy.company.money > companyCreditLimit(economy, { day })) {
    economy.goDay = day;
    bankrupt = true;
    recordEconomyEvent(
      economy,
      day,
      `★破産(債務${Math.round(-economy.company.money)}>限度${Math.round(companyCreditLimit(economy, { day }))})——最終通告`,
    );
  }
  return { interest, bankrupt };
}

export function updateFlowEma(economy) {
  economy.demand30 ??= {};
  for (const goods of GOODS) {
    const today = economy.dailyMaterialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    const flow = economy.f30[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    for (const kind of ["prod", "cons", "imp", "exp"]) {
      flow[kind] = flow[kind] * 0.95 + today[kind] * 0.05;
    }
    economy.f30[goods] = flow;
    const todayDemand = economy.dailyDemandFlows?.[goods]
      ?? { demand: 0, consumed: 0, sources: {} };
    const demandFlow = economy.demand30[goods]
      ?? { demand: 0, consumed: 0, sources: {} };
    demandFlow.demand = demandFlow.demand * 0.95 + todayDemand.demand * 0.05;
    demandFlow.consumed = demandFlow.consumed * 0.95 + todayDemand.consumed * 0.05;
    const sourceIds = new Set([
      ...Object.keys(demandFlow.sources ?? {}),
      ...Object.keys(todayDemand.sources ?? {}),
    ]);
    demandFlow.sources ??= {};
    for (const source of sourceIds) {
      const todaySource = todayDemand.sources?.[source] ?? { demand: 0, consumed: 0 };
      const sourceFlow = demandFlow.sources[source] ?? { demand: 0, consumed: 0 };
      sourceFlow.demand = sourceFlow.demand * 0.95 + todaySource.demand * 0.05;
      sourceFlow.consumed = sourceFlow.consumed * 0.95 + todaySource.consumed * 0.05;
      demandFlow.sources[source] = sourceFlow;
    }
    economy.demand30[goods] = demandFlow;
  }
  return economy.f30;
}

export const DAY_END_ORDER = deepFreeze([
  "company_procurement",
  "wheat_harvest",
  "food",
  "death",
  "culture",
  "ladder",
  "building_maintenance",
  "paving",
  "birth",
  "population_dynamics",
  "company_finance",
  "forest_regeneration",
  "flow_ema",
  "money_conservation",
]);

const BIRTH_NAMES = deepFreeze([
  "ハンス", "グレタ", "ヤン", "マリア", "ピム",
  "ロッテ", "カレル", "アンナ", "ブラム", "エルス",
]);

export function runBirthPhase(economy, { day, random }) {
  ensurePersonIds(economy);
  const births = [];
  if (day % 30 !== 0) return births;
  for (const household of economy.households) {
    const foodDays = householdFoodDays(household);
    if (
      household.members.length < 11
      && household.hungerRun === 0
      && foodDays > 2
      && random() < 0.12
    ) {
      const member = {
        id: `person${economy.nextPersonId}`,
        name: BIRTH_NAMES[Math.floor(random() * BIRTH_NAMES.length)],
        sex: random() < 0.5 ? "♂" : "♀",
        age: 0,
      };
      economy.nextPersonId += 1;
      household.members.push(member);
      births.push({ householdId: household.id, member });
      recordEconomyEvent(
        economy,
        day,
        `${household.sur}家に子が生まれた(家族${household.members.length}人)`,
      );
    }
  }
  return births;
}

export function vacantJobBuildings(economy, physical, job, { household = null } = {}) {
  if (!physical) return [];
  const activeBuildingIds = new Set(
    economy.households.map((candidate) => candidate.buildingId).filter(Boolean),
  );
  const activeHouseholdIds = new Set(economy.households.map((candidate) => candidate.id));
  const from = householdEntrance(physical, household ?? { x: 0, y: 0, buildingId: null });
  return physical.buildings
    .filter((building) => (
      building.type === job
      && building.id !== household?.buildingId
      && !activeBuildingIds.has(building.id)
      && (
        building.ownerHouseholdId === null
        || !activeHouseholdIds.has(building.ownerHouseholdId)
      )
    ))
    .sort((left, right) => {
      const leftDistance = pathLen(physical, from, left.entrance, "walk");
      const rightDistance = pathLen(physical, from, right.entrance, "walk");
      return leftDistance - rightDistance || left.id.localeCompare(right.id);
    });
}

export function jobSelectionWeights(economy, physical, { exclude, household = null } = {}) {
  const incomes = {};
  for (const candidate of economy.households) {
    (incomes[candidate.job] ??= []).push(
      candidate.incMonths.reduce((total, income) => total + income, 0) + candidate.incM,
    );
  }
  const averages = Object.values(incomes)
    .map((values) => values.reduce((total, value) => total + value, 0) / values.length)
    .filter((value) => value > 0)
    .sort((a, b) => a - b);
  const median = averages.length > 0 ? averages[Math.floor(averages.length / 2)] : 1;
  const weights = [];
  const jobPool = economy.jobSelectionPool ?? JOBS;
  for (const job of jobPool) {
    if (job === exclude) continue;
    const vacancies = physical
      ? vacantJobBuildings(economy, physical, job, { household })
      : [];
    if (physical && vacancies.length === 0) {
      continue;
    }
    const values = incomes[job];
    const weight = job === "carter" && vacancies.length > 0
      ? Math.max(...vacancies.map((building) => (
        caravanExpectedAnnualIncome(building, household)
      )))
      : values?.length
        ? Math.max(0, values.reduce((total, value) => total + value, 0) / values.length)
        : median;
    if (weight > 0) weights.push([job, weight]);
  }
  return weights;
}

function householdAnnualIncome(household) {
  return household.incMonths.reduce((total, income) => total + income, 0) + household.incM;
}

function stayIncomeWeight(economy, household) {
  const byJob = {};
  for (const candidate of economy.households) (byJob[candidate.job] ??= []).push(candidate);
  const jobAverages = Object.values(byJob).map((rows) => (
    rows.reduce((total, candidate) => total + householdAnnualIncome(candidate), 0)
      / rows.length
  )).filter((value) => value > 0).sort((left, right) => left - right);
  const median = jobAverages.length > 0
    ? jobAverages[Math.floor(jobAverages.length / 2)]
    : 1;
  return Math.max(1, householdAnnualIncome(household), median);
}

function moveHouseholdBuildingInventory(household, fromBuilding, toBuilding, nextJob) {
  if (!fromBuilding || fromBuilding === toBuilding) return;
  const nextHousehold = { ...household, job: nextJob };
  for (const goods of GOODS) {
    const qty = sectionAmount(fromBuilding, "input", goods);
    if (qty <= 1e-9) continue;
    withdrawInventory(fromBuilding, "input", goods, qty);
    let movedToInput = 0;
    if (isProductionInput(nextHousehold, goods)) {
      const room = sectionCapacity(toBuilding, "input", goods)
        - sectionAmount(toBuilding, "input", goods);
      movedToInput = Math.min(qty, Math.max(0, room));
      if (movedToInput > 1e-9) depositInventory(toBuilding, "input", goods, movedToInput);
    }
    household.pantry[goods] += qty - movedToInput;
  }
}

export function moveHouseholdToVacantBuilding(
  economy,
  physical,
  household,
  targetBuilding,
  { day },
) {
  if (!physical || !targetBuilding) return false;
  if (!vacantJobBuildings(economy, physical, targetBuilding.type, { household })
    .some((building) => building.id === targetBuilding.id)) return false;
  const previousJob = household.job;
  const previousBuilding = householdInputBuilding(physical, household);
  moveHouseholdBuildingInventory(household, previousBuilding, targetBuilding, targetBuilding.type);
  releaseHouseholdBuilding(economy, physical, household);
  targetBuilding.ownerHouseholdId = household.id;
  const targetZone = settlementZoneForBuilding(economy, targetBuilding.id);
  if (targetZone) {
    targetZone.filled = true;
    targetZone.vacated = false;
  }
  household.job = targetBuilding.type;
  household.buildingId = targetBuilding.id;
  household.x = targetBuilding.entrance.x;
  household.y = targetBuilding.entrance.y;
  household.px = targetBuilding.entrance.x;
  household.py = targetBuilding.entrance.y;
  household.state = "home";
  household.wx = null;
  household.wy = null;
  household.jobCycleDone = household.job !== "wheat";
  household.lv = Math.min(household.lv, 1);
  household.lastSwitch = day;
  household.hungerHist = [];
  household.insolvM = 0;
  recordEconomyEvent(
    economy,
    day,
    `破綻転職: ${previousJob}#${household.id}→${household.job}(${targetBuilding.id})へ移住`,
  );
  return true;
}

export function pickHouseholdJob(economy, physical, {
  exclude,
  household = null,
  random,
}) {
  const candidates = jobSelectionWeights(economy, physical, { exclude, household });
  if (candidates.length === 0) return null;
  // 従来職どうしの転職確率は変えない。固定給の隊商宿が候補にある時だけ、
  // 現職年収も同じ二乗抽選へ入れ、安すぎる募集を見送れるようにする。
  const comparesCaravanOffer = candidates.some(([job]) => job === "carter");
  const stayWeight = household && comparesCaravanOffer
    ? stayIncomeWeight(economy, household)
    : 0;
  const total = candidates.reduce((sum, [, weight]) => sum + weight * weight, 0)
    + stayWeight * stayWeight;
  let choice = random() * total;
  for (const [job, weight] of candidates) {
    choice -= weight * weight;
    if (choice <= 0) return job;
  }
  return comparesCaravanOffer ? exclude : candidates[candidates.length - 1][0];
}

export function runPopulationDynamicsPhase(economy, physical, { day, random }) {
  const changes = [];
  if (day % 30 !== 0) return changes;
  for (const household of economy.households) {
    household.insolvM = household.purse < -2 ? (household.insolvM ?? 0) + 1 : 0;
    household.hungerHist ??= [];
    if (household.hungerHist.length > 180) {
      household.hungerHist.splice(0, household.hungerHist.length - 180);
    }
    const distress = household.jobCycleDone && (
      household.hungerHist.reduce((total, hungry) => total + hungry, 0) >= P.DISTRESS
      || household.insolvM >= 3
    );
    if (household.insolvM >= 6 && household.purse < 0) {
      const debt = -household.purse;
      postCompanyLedger(economy.company, {
        day,
        amount: household.purse,
        reason: `世帯${household.id}の徳政による貸し倒れ`,
      });
      household.purse = 0;
      household.insolvM = 0;
      changes.push({ kind: "debt_relief", householdId: household.id, debt });
      recordEconomyEvent(economy, day, `${household.sur}家の借財を帳消しに(徳政)`);
    }
    if (
      distress
      && household.state === "home"
      && day - (household.lastSwitch || -9e9) >= P.COOLDOWN
      && random() < 0.5
    ) {
      const previousJob = household.job;
      const nextJob = physical ? pickHouseholdJob(economy, physical, {
        exclude: previousJob,
        household,
        random,
      }) : null;
      if (nextJob && nextJob !== previousJob) {
        const targetBuildings = vacantJobBuildings(
          economy,
          physical,
          nextJob,
          { household },
        );
        if (nextJob === "carter") {
          targetBuildings.sort((left, right) => (
            caravanExpectedAnnualIncome(right, household)
              - caravanExpectedAnnualIncome(left, household)
          ));
        }
        const targetBuilding = targetBuildings[0];
        if (!targetBuilding) {
          recordEconomyEvent(
            economy,
            day,
            `転職不可: ${previousJob}#${household.id}——${nextJob}の空き建物がありません`,
          );
          continue;
        }
        if (household.purse < 0) {
          const debt = -household.purse;
          postCompanyLedger(economy.company, {
            day,
            amount: household.purse,
            reason: `世帯${household.id}の転職徳政による貸し倒れ`,
          });
          household.purse = 0;
          changes.push({ kind: "debt_relief", householdId: household.id, debt });
        }
        moveHouseholdToVacantBuilding(
          economy,
          physical,
          household,
          targetBuilding,
          { day },
        );
        changes.push({
          kind: "job_switch",
          householdId: household.id,
          from: previousJob,
          to: nextJob,
        });
      } else if (nextJob === previousJob) {
        recordEconomyEvent(
          economy,
          day,
          `転職見送り: ${previousJob}#${household.id}——提示された収入では今の仕事を離れない`,
        );
      } else {
        recordEconomyEvent(
          economy,
          day,
          `転職不可: ${previousJob}#${household.id}——空いている他職の建物がありません`,
        );
      }
    }
  }
  return changes;
}

const REPAIR_MATERIALS_BY_JOB = deepFreeze({
  fisher: ["log", "tools", "stone", "cloth", "iron"],
  fisher2: ["log", "tools", "stone", "cloth", "iron"],
  wheat: ["log", "tools", "stone", "cloth"],
  veg: ["log", "tools", "stone", "cloth"],
  shepherd: ["log", "tools", "stone", "cloth"],
  rapeseed: ["log", "tools", "stone", "cloth"],
  logger: ["log", "tools", "stone", "cloth"],
  woodshop: ["tools", "stone", "iron"],
  cartwright: ["tools", "stone", "iron"],
  charburner: ["tools", "stone"],
  saltworks: ["tools", "stone"],
  carter: ["log", "tools", "stone", "cloth", "iron"],
  quarryman: ["tools", "stone", "iron"],
  miner: ["tools", "stone", "iron"],
  collier: ["tools", "stone", "iron"],
  smelter: ["stone", "iron"],
  smith: ["stone", "iron"],
});

const COMPANY_REPAIR_MATERIALS_BY_ROLE = deepFreeze({
  market: { tools: 4, stone: 4 },
  warehouse: { tools: 3, stone: 3 },
  port: { log: 4, tools: 3, stone: 6 },
});

function companyRepairRole(building) {
  return ["market", "warehouse", "port"].find((role) => (
    building?.role === role || building?.roles?.includes(role)
  )) ?? null;
}

export function companyRepairMaterialsFor(building) {
  const role = companyRepairRole(building);
  return structuredClone(COMPANY_REPAIR_MATERIALS_BY_ROLE[role] ?? {});
}

export function companyBuildingRepairNeeds(physical) {
  const needs = {};
  if (!physical) return needs;
  for (const building of physical.buildings ?? []) {
    if (!companyRepairRole(building) || !building.repairPlan) continue;
    ensureBuildingShelves(building);
    for (const [goods, required] of Object.entries(building.repairPlan.required ?? {})) {
      const outstanding = Math.max(
        0,
        required
          - sectionAmount(building, "repair", goods)
          - pendingCompanyRepairHaul(physical, building.id, goods),
      );
      if (outstanding > 1e-9) needs[goods] = (needs[goods] ?? 0) + outstanding;
    }
  }
  return needs;
}

export function repairMaterialsFor(building, household) {
  const lv = Math.max(0, household?.lv ?? 0);
  const area = Math.max(1, (building?.w ?? 3) * (building?.h ?? 3));
  const scale = area / 9;
  const operational = 1 + Math.min(0.5, Math.max(0, building?.operationWear ?? 0) / 60);
  const allowed = new Set(REPAIR_MATERIALS_BY_JOB[household?.job] ?? ["tools", "stone"]);
  const required = {};
  const add = (goods, qty) => {
    if (allowed.has(goods) && qty > 1e-9) required[goods] = qty * scale * operational;
  };
  // Lv0の粗末な施設は屋外設備だけを少量直す。Lv1から加工材、Lv2から石材、
  // Lv3から鉄材・布を常時使う。操業した月は最大50%だけ上積みされる。
  add("log", lv === 0 ? 0.5 : 2 + lv);
  if (lv >= 1) add("tools", 6 + lv * 2);
  if (lv >= 2) add("stone", 12 * (lv - 1));
  if (lv >= 3) {
    add("iron", 3 * (lv - 2));
    add("cloth", 2 * (lv - 2));
  }
  return required;
}

function consumeShelfPlan(economy, building, section, required, reason) {
  let requiredTotal = 0;
  let suppliedTotal = 0;
  for (const [goods, need] of Object.entries(required ?? {})) {
    requiredTotal += need;
    const used = Math.min(need, sectionAmount(building, section, goods));
    suppliedTotal += used;
    if (used <= 1e-9) continue;
    withdrawInventory(building, section, goods, used);
    recordEconomicMaterialFlow(economy, goods, "cons", used, reason);
  }
  return requiredTotal > 1e-9 ? suppliedTotal / requiredTotal : 1;
}

function dispatchCompanyRepairMaterials(economy, physical, building, { day }) {
  const role = companyRepairRole(building);
  const warehouse = companyLogisticsSite(physical, "warehouse");
  if (!role || !warehouse || !building.repairPlan) return [];
  const jobs = [];
  for (const [goods, required] of Object.entries(building.repairPlan.required ?? {})) {
    let remaining = Math.max(
      0,
      required
        - sectionAmount(building, "repair", goods)
        - pendingCompanyRepairHaul(physical, building.id, goods),
    );
    while (remaining > 1e-9) {
      const transport = availableCompanyTransport(economy, physical, { walkOnly: true });
      const warehouseQty = Math.max(0, Math.min(
        economy.stock[goods] ?? 0,
        sectionAmount(warehouse, "storage", goods),
      ) - (economy.stockTgt[goods] ?? 0));
      const qty = Math.min(
        remaining,
        warehouseQty,
        (transport?.capacity ?? 0) / goodsUnitWeight(goods),
      );
      if (qty <= 1e-9) break;
      const averageCost = (economy.stockCost[goods] ?? 0)
        / Math.max(1e-9, economy.stock[goods] ?? 0);
      const job = dispatchCompanyHaul(economy, physical, {
        day,
        kind: "company_repair",
        fromRole: "warehouse",
        fromSection: "storage",
        toRole: role,
        toSection: "repair",
        goods,
        qty,
        metadata: { targetBuildingId: building.id, cost: qty * averageCost },
        walkOnly: true,
      });
      if (!job) break;
      economy.stock[goods] -= qty;
      economy.stockCost[goods] = Math.max(
        0,
        (economy.stockCost[goods] ?? 0) - qty * averageCost,
      );
      remaining -= qty;
      jobs.push(job);
    }
  }
  return jobs;
}

function updateBuildingConditionStatus(economy, building, day, label) {
  const previousStatus = building.conditionStatus;
  building.conditionStatus = building.condition >= 70
    ? "good"
    : building.condition >= 40
      ? "worn"
      : "needs_repair";
  if (previousStatus !== building.conditionStatus && building.conditionStatus !== "good") {
    const statusLabel = building.conditionStatus === "worn" ? "傷みあり" : "要修繕";
    recordEconomyEvent(economy, day, `${label} 建物に${statusLabel}`);
  }
}

function recordBuildingRepairDemand(economy, building) {
  for (const [goods, need] of Object.entries(building.repairPlan?.required ?? {})) {
    const dailyNeed = need / 30;
    const fill = Math.min(1, sectionAmount(building, "repair", goods) / Math.max(need, 1e-9));
    recordEconomicDemand(economy, goods, dailyNeed, dailyNeed * fill, "building_repair");
  }
}

export function constructionReady(physical, household) {
  return Object.keys(householdBuildingNeeds(physical, household).construction).length === 0;
}

export function consumeConstructionMaterials(economy, physical, household) {
  const building = ensureBuildingShelves(buildingById(physical, household?.buildingId));
  if (!building || building.constructionConsumed || !constructionReady(physical, household)) return false;
  consumeShelfPlan(
    economy,
    building,
    "construction",
    building.constructionRequired,
    `世帯${household.id}の現地建設`,
  );
  building.constructionConsumed = true;
  return true;
}

export function runBuildingMaintenance(economy, physical, { day }) {
  const results = [];
  if (!physical) return results;
  for (const household of economy.households) {
    const building = ensureBuildingShelves(buildingById(physical, household.buildingId));
    if (!building || household.state === "arriving") continue;
    if (household.state === "building") {
      for (const [goods, need] of Object.entries(building.constructionRequired ?? {})) {
        if (building.constructionConsumed) continue;
        const dailyNeed = need / 10;
        const fill = Math.min(
          1,
          sectionAmount(building, "construction", goods) / Math.max(need, 1e-9),
        );
        recordEconomicDemand(economy, goods, dailyNeed, dailyNeed * fill, "local_construction");
      }
      continue;
    }
    building.nextRepairDay = Number.isSafeInteger(building.nextRepairDay)
      ? building.nextRepairDay
      : day + 30;
    if (building.repairPlan && day >= building.repairPlan.dueDay) {
      const ratio = consumeShelfPlan(
        economy,
        building,
        "repair",
        building.repairPlan.required,
        `世帯${household.id}の建物修繕`,
      );
      building.condition = Math.max(0, Math.min(100,
        building.condition + (ratio >= 0.95 ? 6 : -15 * (1 - ratio)),
      ));
      building.repairNeglectCycles = building.condition < 25
        ? (building.repairNeglectCycles ?? 0) + 1
        : 0;
      if (building.repairNeglectCycles >= 2 && household.lv > 0) {
        household.lv -= 1;
        household.up = 0;
        household.down = 0;
        building.repairNeglectCycles = 0;
        building.condition = Math.max(40, building.condition);
        recordEconomyEvent(economy, day, `${household.job}#${household.id} 修繕不足で▼Lv${household.lv}`);
      }
      building.repairPlan = null;
      building.nextRepairDay = day;
      results.push({ householdId: household.id, ratio, condition: building.condition });
    }
    if (!building.repairPlan && day >= building.nextRepairDay) {
      building.repairPlan = {
        openedDay: day,
        dueDay: day + 30,
        required: repairMaterialsFor(building, household),
      };
      building.operationWear = 0;
      building.nextRepairDay = day + 30;
    }
    updateBuildingConditionStatus(economy, building, day, `${household.job}#${household.id}`);
    recordBuildingRepairDemand(economy, building);
  }
  for (const building of physical.buildings ?? []) {
    const role = companyRepairRole(building);
    if (!role) continue;
    ensureBuildingShelves(building);
    building.nextRepairDay = Number.isSafeInteger(building.nextRepairDay)
      ? building.nextRepairDay
      : day + 30;
    if (building.repairPlan && day >= building.repairPlan.dueDay) {
      const ratio = consumeShelfPlan(
        economy,
        building,
        "repair",
        building.repairPlan.required,
        `会社の${role}修繕`,
      );
      building.condition = Math.max(0, Math.min(100,
        building.condition + (ratio >= 0.95 ? 6 : -15 * (1 - ratio)),
      ));
      building.repairPlan = null;
      building.nextRepairDay = day;
      results.push({ companyRole: role, buildingId: building.id, ratio, condition: building.condition });
    }
    if (!building.repairPlan && day >= building.nextRepairDay) {
      building.repairPlan = {
        openedDay: day,
        dueDay: day + 30,
        required: companyRepairMaterialsFor(building),
      };
      building.nextRepairDay = day + 30;
    }
    updateBuildingConditionStatus(economy, building, day, `会社の${role}`);
    recordBuildingRepairDemand(economy, building);
    dispatchCompanyRepairMaterials(economy, physical, building, { day });
  }
  return results;
}

export function runDayEnd(economy, physical, { day, random = () => 1, trace = [] }) {
  if (!Number.isSafeInteger(day) || day <= 0) throw new TypeError("dayEnd day must be a positive safe integer");
  if (typeof random !== "function") throw new TypeError("dayEnd random must be a function");
  economy.currentDay = day;
  const marked = new Set();
  const mark = (phase) => {
    if (marked.has(phase)) return;
    marked.add(phase);
    trace.push(phase);
  };

  mark("company_procurement");
  const purchases = runCompanyProcurement(economy, { day, physical });
  mark("wheat_harvest");
  const harvests = runWheatHarvest(economy, { day, physical });
  const survival = runHouseholdDayEnd(economy, physical, { day, markPhase: mark });
  mark("building_maintenance");
  const maintenance = runBuildingMaintenance(economy, physical, { day });
  mark("paving");
  const paving = runRoadPaving(economy, physical, { day });
  mark("birth");
  const births = runBirthPhase(economy, { day, random });
  mark("population_dynamics");
  const population = runPopulationDynamicsPhase(economy, physical, { day, random });
  mark("company_finance");
  const finance = runCompanyFinance(economy, { day });
  mark("forest_regeneration");
  regenerateForest(economy, physical, { day, random });
  mark("flow_ema");
  updateFlowEma(economy);
  mark("money_conservation");
  assertMoneyConservation(economy, { incremental: true });

  return { trace, purchases, harvests, survival, maintenance, paving, births, population, finance };
}

const MONEY_EPSILON = 1e-9;
export const COMPANY_LEDGER_LIMIT = 512;
export const MONEY_BOUNDARY_LEDGER_LIMIT = 64;

function requireFiniteMoney(value, label) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${label} must be finite`);
  }
}

export function createCompanyState(initialMoney = 0) {
  requireFiniteMoney(initialMoney, "initialMoney");
  return {
    money: initialMoney,
    openingMoney: initialMoney,
    ledger: [],
    ledgerCount: 0,
    ledgerOffsetBalance: initialMoney,
    ledgerIncome: 0,
    ledgerExpense: 0,
    ledgerByReason: {},
    ledgerDaily: [],
    validatedLedgerLength: 0,
    validatedLedgerBalance: initialMoney,
  };
}

function ensureCompanyLedgerAggregates(company) {
  const ledger = company.ledger ??= [];
  company.ledgerCount ??= ledger.length;
  company.ledgerOffsetBalance ??= ledger.length > 0
    ? ledger[0].balance - ledger[0].amount
    : company.openingMoney;
  company.ledgerIncome ??= ledger
    .filter((entry) => entry.amount > 0)
    .reduce((total, entry) => total + entry.amount, 0);
  company.ledgerExpense ??= ledger
    .filter((entry) => entry.amount < 0)
    .reduce((total, entry) => total - entry.amount, 0);
  if (!company.ledgerByReason) {
    company.ledgerByReason = {};
    for (const entry of ledger) {
      company.ledgerByReason[entry.reason] = (
        company.ledgerByReason[entry.reason] ?? 0
      ) + entry.amount;
    }
  }
  if (!company.ledgerDaily) {
    const dailyByDay = new Map();
    for (const entry of ledger) {
      const daily = dailyByDay.get(entry.day) ?? {
        day: entry.day,
        income: 0,
        expense: 0,
        net: 0,
      };
      if (entry.amount > 0) daily.income += entry.amount;
      else daily.expense += -entry.amount;
      daily.net += entry.amount;
      dailyByDay.set(entry.day, daily);
    }
    company.ledgerDaily = [...dailyByDay.values()].slice(-60);
  }
  return company;
}

export function postCompanyLedger(company, { day, amount, reason }) {
  if (!Number.isSafeInteger(day) || day < 0) {
    throw new TypeError("ledger day must be a non-negative safe integer");
  }
  requireFiniteMoney(amount, "ledger amount");
  if (typeof reason !== "string" || reason.length === 0) {
    throw new TypeError("ledger reason must be a non-empty string");
  }

  ensureCompanyLedgerAggregates(company);
  company.money += amount;
  company.ledgerCount += 1;
  if (amount > 0) company.ledgerIncome += amount;
  else company.ledgerExpense -= amount;
  company.ledgerByReason[reason] = (company.ledgerByReason[reason] ?? 0) + amount;
  let daily = company.ledgerDaily.at(-1);
  if (daily?.day !== day) {
    daily = { day, income: 0, expense: 0, net: 0 };
    company.ledgerDaily.push(daily);
    if (company.ledgerDaily.length > 60) company.ledgerDaily.shift();
  }
  if (amount > 0) daily.income += amount;
  else daily.expense += -amount;
  daily.net += amount;
  company.ledger.push({ day, amount, reason, balance: company.money });
  if (company.ledger.length > COMPANY_LEDGER_LIMIT + 128) {
    const removed = company.ledger.splice(0, company.ledger.length - COMPANY_LEDGER_LIMIT);
    company.ledgerOffsetBalance = removed.at(-1)?.balance ?? company.ledgerOffsetBalance;
    const validatedLength = company.validatedLedgerLength ?? 0;
    if (validatedLength <= removed.length) {
      company.validatedLedgerLength = 0;
      company.validatedLedgerBalance = company.ledgerOffsetBalance;
    } else {
      company.validatedLedgerLength = validatedLength - removed.length;
    }
  }
  return company.money;
}

export function assertCompanyLedger(company) {
  let expected = company.ledgerOffsetBalance ?? company.openingMoney;
  requireFiniteMoney(expected, "company.ledgerOffsetBalance");

  for (const [index, entry] of company.ledger.entries()) {
    requireFiniteMoney(entry.amount, `company.ledger[${index}].amount`);
    expected += entry.amount;
    if (Math.abs(entry.balance - expected) > MONEY_EPSILON) {
      throw new Error(`会社台帳の残高不一致 index=${index}`);
    }
  }

  if (Math.abs(company.money - expected) > MONEY_EPSILON) {
    throw new Error(`会社資金に台帳外の変更があります expected=${expected} actual=${company.money}`);
  }
  return true;
}

function assertCompanyLedgerIncremental(company) {
  let start = company.validatedLedgerLength ?? 0;
  let expected = company.validatedLedgerBalance ?? company.openingMoney;
  if (start < 0 || start > company.ledger.length) {
    start = 0;
    expected = company.ledgerOffsetBalance ?? company.openingMoney;
  }
  requireFiniteMoney(expected, "company.validatedLedgerBalance");
  for (let index = start; index < company.ledger.length; index += 1) {
    const entry = company.ledger[index];
    requireFiniteMoney(entry.amount, `company.ledger[${index}].amount`);
    expected += entry.amount;
    if (Math.abs(entry.balance - expected) > MONEY_EPSILON) {
      throw new Error(`会社台帳の残高不一致 index=${index}`);
    }
  }
  if (Math.abs(company.money - expected) > MONEY_EPSILON) {
    throw new Error(`会社資金に台帳外の変更があります expected=${expected} actual=${company.money}`);
  }
  company.validatedLedgerLength = company.ledger.length;
  company.validatedLedgerBalance = expected;
  return true;
}

export function recordExternalMoneyFlow(economy, { amount, reason }) {
  requireFiniteMoney(amount, "external flow amount");
  if (typeof reason !== "string" || reason.length === 0) {
    throw new TypeError("external flow reason must be a non-empty string");
  }
  if (amount === 0) return;

  if (amount > 0) economy.moneyBoundary.in += amount;
  else economy.moneyBoundary.out += -amount;
  economy.moneyBoundary.ledger.push({ amount, reason });
  if (economy.moneyBoundary.ledger.length > MONEY_BOUNDARY_LEDGER_LIMIT + 16) {
    economy.moneyBoundary.ledger.splice(
      0,
      economy.moneyBoundary.ledger.length - MONEY_BOUNDARY_LEDGER_LIMIT,
    );
  }
}

export function moneyTotal(economy) {
  const householdMoney = (economy.households ?? []).reduce((total, household) => {
    requireFiniteMoney(household.purse, "household.purse");
    return total + household.purse;
  }, 0);
  return economy.company.money + householdMoney;
}

export function assertMoneyConservation(economy, { incremental = false } = {}) {
  if (incremental) assertCompanyLedgerIncremental(economy.company);
  else assertCompanyLedger(economy.company);
  const actual = moneyTotal(economy);
  const expected =
    economy.moneyBoundary.openingTotal +
    economy.moneyBoundary.in -
    economy.moneyBoundary.out;
  const drift = actual - expected;
  if (Math.abs(drift) > 1e-4) {
    throw new Error(`貨幣保存則違反 drift=${drift}`);
  }
  return true;
}

export function createEconomicState({ initialCompanyMoney = P.TREASURY0 } = {}) {
  return {
    company: createCompanyState(initialCompanyMoney),
    households: [],
    nextHouseholdId: 0,
    nextPersonId: 1,
    nextCartAssetId: 1,
    companyCarts: [],
    caravans: [],
    nextCaravanId: 1,
    marketStockM: {},
    marketStockCostM: {},
    marketStockLotsM: {},
    caravanWagesPending: {},
    caravanSalesPending: {},
    lstockSalesM: {},
    transportStats: {},
    directTrades: [],
    cartStats: {
      produced: 0,
      householdPurchased: 0,
      companyPurchased: 0,
      householdBroken: 0,
      companyBroken: 0,
      householdUses: 0,
      companyUses: 0,
    },
    materialFlows: {},
    dailyMaterialFlows: {},
    dailyDemandFlows: {},
    f30: {},
    demand30: {},
    materialLedger: [],
    led: { prod: {}, eat: {}, spoil: {}, need: 0 },
    hungryN: 0,
    famine: 0,
    ruins: [],
    events: [],
    eventCount: 0,
    traffic: {},
    currentDay: 0,
    currentTick: null,
    natural: { bay: P.BAY0, bay2: P.BAY0, wood: {} },
    grove: P.GROVE0,
    px: { ...P.BELIEF0 },
    stalls: Object.fromEntries(GOODS.map((goods) => [goods, []])),
    stallMembershipRevision: 0,
    stallMembershipCacheRevision: -1,
    stallMembershipCacheSize: 0,
    stallMembershipCacheTick: null,
    stallHouseholdMembership: {},
    expCap: { ...P.EXP_CAP },
    expMl: { ...P.EXP_ML },
    deskUsed: {},
    co: {
      expBuy: 0,
      expSell: 0,
      impMargin: 0,
      fee: 0,
      pub: 0,
      carterWages: 0,
      procBuy: 0,
      stockSell: 0,
      ordSell: 0,
      build: 0,
    },
    exported: {},
    imported: {},
    outBy: { pass: 0 },
    prices: Object.fromEntries(GOODS.map((goods) => [goods, []])),
    priceCounts: Object.fromEntries(GOODS.map((goods) => [goods, 0])),
    market: { x: 0, y: 0 },
    warehouse: null,
    port: null,
    logisticsSites: {},
    stock: {},
    stockCost: {},
    marketStock: {},
    marketStockCost: {},
    importStock: {},
    importStockCost: {},
    importRequests: [],
    importRequestIndex: {},
    activeImportRequestIds: [],
    unsoldImportRequestIds: [],
    nextImportRequestId: 1,
    portReturns: [],
    portReturnIndex: {},
    activePortReturnIds: [],
    nextPortReturnId: 1,
    exportLots: [],
    exportLotIndex: {},
    activeExportLotIds: [],
    pendingExportLotIds: [],
    nextExportLotId: 1,
    marketReturns: [],
    nextMarketReturnId: 1,
    stockTgt: {},
    orderOffer: null,
    order: null,
    orderDone: 0,
    zones: [],
    shipping: false,
    goDay: null,
    harvestLog: [],
    paving: false,
    paved: false,
    paveBought: 0,
    moneyBoundary: {
      openingTotal: initialCompanyMoney,
      in: 0,
      out: 0,
      ledger: [],
    },
  };
}
