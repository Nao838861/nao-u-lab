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
  for (const ruin of economy.ruins) {
    for (const [goods, qty] of Object.entries(ruin.inventory)) {
      inventory[goods] = (inventory[goods] ?? 0) + qty;
    }
  }
  return { inventory, cargo };
}

function consumeFood(economy, household, goods, qty, kinds) {
  if (qty <= 1e-9) return 0;
  household.pantry[goods] -= qty;
  kinds.add(FOOD_KIND[goods]);
  economy.led.eat[goods] = (economy.led.eat[goods] ?? 0) + qty;
  recordEconomicMaterialFlow(economy, goods, "cons", qty, `世帯${household.id}の食事`);
  return qty;
}

function recordEconomyEvent(economy, day, message) {
  economy.events.push([day, message]);
  if (economy.events.length > 400) economy.events.shift();
}

function disperseHousehold(economy, household, day) {
  recordEconomyEvent(economy, day, `☠ ${household.sur}家は離散した——家は廃屋になった`);
  economy.ruins.push({
    x: household.x,
    y: household.y,
    formerHouseholdId: household.id,
    inventory: structuredClone(household.pantry),
  });
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

export function runHouseholdSurvival(economy, { day }) {
  if (!Number.isSafeInteger(day) || day <= 0) throw new TypeError("survival day must be a positive safe integer");
  economy.hungryN = 0;
  for (const household of economy.households) {
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
      recordEconomicMaterialFlow(economy, "veg", "prod", forage * 0.3, `世帯${household.id}の採集`);
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

    if (household.hungerRun >= 60) {
      household.hungerRun = 30;
      const dead = household.members.pop();
      recordEconomyEvent(economy, day, `☠ ${household.sur}家の${dead?.name ?? "一人"}が餓えで亡くなった`);
      if (household.members.length <= 2) disperseHousehold(economy, household, day);
    }

    household.kindLog.push([day, [...kinds]]);
    for (const kind of kinds) household.kindDays[kind] = (household.kindDays[kind] ?? 0) + 1;
    while (household.kindLog.length > 0 && household.kindLog[0][0] <= day - 45) {
      for (const kind of household.kindLog[0][1]) household.kindDays[kind] -= 1;
      household.kindLog.shift();
    }
  }
  return { hungry: economy.hungryN, famine: economy.famine };
}

function terrainKindAt(physical, x, y) {
  const tile = physical?.terrain?.[y]?.[x];
  return typeof tile === "string" ? tile : tile?.kind;
}

function setTerrainKind(physical, x, y, kind) {
  const tile = physical.terrain[y][x];
  if (typeof tile === "string") physical.terrain[y][x] = kind;
  else tile.kind = kind;
}

export function initializeNaturalResources(economy, physical) {
  economy.natural.bay = P.BAY0;
  economy.natural.bay2 = P.BAY0;
  economy.natural.wood = {};
  for (let y = 0; y < physical.height; y += 1) {
    for (let x = 0; x < physical.width; x += 1) {
      if (terrainKindAt(physical, x, y) === "forest") {
        economy.natural.wood[`${x},${y}`] = P.WOOD0;
      }
    }
  }
  return economy.natural;
}

export function chopWood(economy, physical, household, amount) {
  if (!physical?.terrain) return amount;
  let gathered = 0;
  const centerX = Math.round(household.x);
  const centerY = Math.round(household.y);
  const seedFloor = P.WOOD0 * 0.15;
  for (let pass = 0; pass < 2 && gathered < amount; pass += 1) {
    for (let radius = 0; radius <= 5 && gathered < amount; radius += 1) {
      for (let offsetY = -radius; offsetY <= radius && gathered < amount; offsetY += 1) {
        for (let offsetX = -radius; offsetX <= radius && gathered < amount; offsetX += 1) {
          const x = centerX + offsetX;
          const y = centerY + offsetY;
          const key = `${x},${y}`;
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
          }
        }
      }
    }
  }
  return gathered;
}

export function localWood(economy, physical, household) {
  if (!physical?.terrain) return 1;
  let stock = 0;
  const centerX = Math.round(household.x);
  const centerY = Math.round(household.y);
  for (let offsetY = -5; offsetY <= 5; offsetY += 1) {
    for (let offsetX = -5; offsetX <= 5; offsetX += 1) {
      stock += economy.natural.wood[`${centerX + offsetX},${centerY + offsetY}`] ?? 0;
    }
  }
  return Math.min(1, stock / (P.WOOD0 * 8));
}

export function producePrimaryTick(economy, physical, household, { day, fraction }) {
  if (!Number.isFinite(fraction) || fraction < 0) throw new TypeError("production fraction must be non-negative and finite");
  const month = (Math.floor((day - 1) / 30) % 12) + 1;
  const winter = month >= 10;
  const work = fraction * householdMult(household);
  const produced = {};

  if (household.job === "fisher") {
    const depletion = economy.natural.bay / P.BAY0;
    const qty = (winter ? P.Y_FISH_W : P.Y_FISH) * work * depletion;
    economy.natural.bay = Math.min(
      P.BAY0,
      economy.natural.bay - qty
        + fraction * (P.BAY_R * economy.natural.bay * (1 - depletion) + P.RESEED * (1 - depletion)),
    );
    household.pantry.fish += qty;
    economy.led.prod.fish = (economy.led.prod.fish ?? 0) + qty;
    recordEconomicMaterialFlow(economy, "fish", "prod", qty, `世帯${household.id}の漁`);
    produced.fish = qty;
  } else if (household.job === "veg" && month >= 3 && month <= 10) {
    const qty = P.Y_VEG * work;
    household.pantry.veg += qty;
    economy.led.prod.veg = (economy.led.prod.veg ?? 0) + qty;
    recordEconomicMaterialFlow(economy, "veg", "prod", qty, `世帯${household.id}の菜園`);
    produced.veg = qty;
  } else if (household.job === "shepherd") {
    const meat = P.Y_MEAT * work;
    const cloth = P.Y_CLOTH * work;
    household.pantry.meat += meat;
    household.pantry.cloth += cloth;
    economy.led.prod.meat = (economy.led.prod.meat ?? 0) + meat;
    recordEconomicMaterialFlow(economy, "meat", "prod", meat, `世帯${household.id}の牧畜`);
    recordEconomicMaterialFlow(economy, "cloth", "prod", cloth, `世帯${household.id}の牧畜`);
    produced.meat = meat;
    produced.cloth = cloth;
  } else if (household.job === "logger") {
    const qty = chopWood(economy, physical, household, P.Y_LOG * work);
    household.pantry.log += qty;
    recordEconomicMaterialFlow(economy, "log", "prod", qty, `世帯${household.id}の伐採`);
    produced.log = qty;
  }
  return produced;
}

export function runPrimaryProductionDay(economy, physical, { day }) {
  economy.currentDay = day;
  for (let tick = 0; tick < 30; tick += 1) {
    for (const household of economy.households) {
      if (household.state === "home") {
        producePrimaryTick(economy, physical, household, { day, fraction: 1 / 30 });
      }
    }
  }
}

export function regenerateForest(economy, physical, { day, random }) {
  if (!physical?.terrain || day % 5 !== 0) return;
  for (const [key, stock] of Object.entries(economy.natural.wood)) {
    if (stock > 0 && stock < P.WOOD0) {
      economy.natural.wood[key] = Math.min(P.WOOD0, stock + P.WOOD_R * 5);
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
      }
    }
  }
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
    led: { prod: {}, eat: {}, spoil: {}, need: 0 },
    hungryN: 0,
    famine: 0,
    ruins: [],
    events: [],
    currentDay: 0,
    natural: { bay: P.BAY0, bay2: P.BAY0, wood: {} },
    moneyBoundary: {
      openingTotal: initialCompanyMoney,
      in: 0,
      out: 0,
      ledger: [],
    },
  };
}
