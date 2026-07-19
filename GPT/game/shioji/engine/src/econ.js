function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export const GOODS = deepFreeze([
  "fish", "veg", "wheat", "pres", "pick", "tools", "salt", "char",
  "meat", "meal", "stone", "oil", "iron", "cloth", "log",
]);
export const PERISH = deepFreeze(["fish", "veg", "meat", "pres", "pick", "wheat", "meal"]);
export const FOODS = deepFreeze(["fish", "veg", "wheat", "pres", "pick", "meat"]);
export const FOOD_KIND = deepFreeze({
  fish: "fish", veg: "veg", wheat: "wheat", pres: "fish", pick: "veg", meat: "meat",
});

export const P = deepFreeze({
  EAT: 9,
  PANTRY_FOOD_D: 6,
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
  Y_LOG: 16,
  LOG_TOOL: 1.5,
  LOG_CHAR: 1,
  Y_TOOLS: 8,
  Y_CHAR: 8,
  Y_SALT: 12,
  Y_MEAT: 16,
  Y_CLOTH: 0.35,
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
  TRAVEL_RATE: 0.012,
  ROAD_F: 0.55,
  TRAVEL_MAX: 0.45,
  HAUL: 40,
  IMP: { wheat: 4, tools: 6, salt: 5, iron: 4.5 },
  IMP_COST: { wheat: 2.4, tools: 4.2, salt: 3.5, iron: 3.2 },
  EXP: { pres: 0.6, pick: 0.55, oil: 2.4 },
  EXP_CAP: { pres: 25, pick: 15, oil: 12 },
  EXP_ML: { pres: 0.66, pick: 0.6, oil: 2.64 },
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
  Y_STONE: 8,
  Y_OIL: 6,
  WOOD0: 350,
  WOOD_R: 0.7,
  ROAD_WORK: 3,
  PAVE_STONE: 200,
  PAVE_ROAD_F: 0.45,
  DISTRESS: 40,
  COOLDOWN: 360,
  BELIEF0: {
    fish: 1, veg: 1, wheat: 1.2, pres: 1.2, pick: 1.3, tools: 2,
    salt: 2, char: 1.5, meat: 1.3, meal: 1, stone: 1, oil: 3,
    iron: 3.5, cloth: 2.5,
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
  charburner: "lumber",
  quarryman: "lumber",
  saltworks: "artisan",
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

function applyImmigrantKit(household) {
  household.pantry.tools = 5;
  household.pantry.wheat = 240;
  if (household.job === "saltworks") household.pantry.char = 15;
  if (household.job === "woodshop" || household.job === "charburner") household.pantry.log = 20;
  if (household.job === "fisher") {
    household.pantry.salt = 4;
    household.pantry.char = 2;
  }
  if (household.job === "veg") household.pantry.salt = 3;
  if (household.job === "fisher2") household.pantry.salt = 2;
}

export function recordEconomicMaterialFlow(economy, goods, kind, qty, reason) {
  if (!["prod", "cons", "imp", "exp"].includes(kind)) throw new Error(`unknown material flow kind: ${kind}`);
  if (!Number.isFinite(qty) || qty < 0) throw new TypeError("material flow qty must be non-negative and finite");
  const flow = economy.materialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
  flow[kind] += qty;
  economy.materialFlows[goods] = flow;
  economy.materialLedger.push({ goods, kind, qty, reason });
}

export function createHousehold(economy, { job, x, y, origin = "immigrant" }) {
  if (!JOBCLS[job]) throw new Error(`unknown household job: ${job}`);
  if (origin !== "immigrant") throw new Error(`unsupported household origin: ${origin}`);
  const id = economy.nextHouseholdId;
  economy.nextHouseholdId += 1;
  const family = generateFamily(id);
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
    cargo: null,
    buildDays: 0,
  };
  applyImmigrantKit(household);
  economy.households.push(household);
  recordExternalMoneyFlow(economy, {
    amount: household.purse,
    reason: `移民${household.id}の持参金`,
  });
  for (const [goods, qty] of Object.entries(household.pantry)) {
    if (qty > 0) recordEconomicMaterialFlow(economy, goods, "imp", qty, `移民${household.id}の開拓キット`);
  }
  return household;
}

export function householdMult(household) {
  const raw = Math.pow(P.LV_MULT, household.lv);
  const primary = {
    fisher: 1, fisher2: 1, veg: 1, wheat: 1, shepherd: 1, rapeseed: 1,
  }[household.job];
  return primary ? Math.min(raw, 2) : raw;
}

export function householdEat(household) {
  return household.members.length;
}

export function householdHaul(household) {
  return household.members.length * 4;
}

export function householdClass(household) {
  return JOBCLS[household.job];
}

export function economicMaterialSnapshot(economy) {
  const inventory = {};
  const cargo = {};
  for (const household of economy.households) {
    for (const [goods, qty] of Object.entries(household.pantry)) {
      inventory[goods] = (inventory[goods] ?? 0) + qty;
    }
    if (household.cargo) {
      cargo[household.cargo.goods] = (cargo[household.cargo.goods] ?? 0) + household.cargo.qty;
    }
  }
  return { inventory, cargo };
}

const MONEY_EPSILON = 1e-9;

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
  };
}

export function postCompanyLedger(company, { day, amount, reason }) {
  if (!Number.isSafeInteger(day) || day < 0) {
    throw new TypeError("ledger day must be a non-negative safe integer");
  }
  requireFiniteMoney(amount, "ledger amount");
  if (typeof reason !== "string" || reason.length === 0) {
    throw new TypeError("ledger reason must be a non-empty string");
  }

  company.money += amount;
  company.ledger.push({ day, amount, reason, balance: company.money });
  return company.money;
}

export function assertCompanyLedger(company) {
  let expected = company.openingMoney;
  requireFiniteMoney(expected, "company.openingMoney");

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

export function recordExternalMoneyFlow(economy, { amount, reason }) {
  requireFiniteMoney(amount, "external flow amount");
  if (typeof reason !== "string" || reason.length === 0) {
    throw new TypeError("external flow reason must be a non-empty string");
  }
  if (amount === 0) return;

  if (amount > 0) economy.moneyBoundary.in += amount;
  else economy.moneyBoundary.out += -amount;
  economy.moneyBoundary.ledger.push({ amount, reason });
}

export function moneyTotal(economy) {
  const householdMoney = (economy.households ?? []).reduce((total, household) => {
    requireFiniteMoney(household.purse, "household.purse");
    return total + household.purse;
  }, 0);
  return economy.company.money + householdMoney;
}

export function assertMoneyConservation(economy) {
  assertCompanyLedger(economy.company);
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
    materialFlows: {},
    materialLedger: [],
    moneyBoundary: {
      openingTotal: initialCompanyMoney,
      in: 0,
      out: 0,
      ledger: [],
    },
  };
}
