import {
  buildingById,
  completeHaulJob,
  carrierGoodsCapacity,
  createCartCarrier,
  createHaulJob,
  depositInventory,
  goodsUnitWeight,
  haulJobById,
  isConnected,
  pathLen,
  sectionAmount,
  withdrawInventory,
  workRoadWorksite,
} from "./physical.js";

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
  Y_ORE: 14,
  Y_COAL: 10,
  Y_SMELT: 8,
  Y_SMITH: 5,
  SMELT_ORE: 2,
  SMELT_FUEL: 1,
  SMITH_BAR: 1,
  SMITH_FUEL: 0.5,
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
    iron: 3.5, cloth: 2.5, ore: 0.8, coal: 1, bar: 2.2,
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
  miner: "lumber",
  collier: "lumber",
  smelter: "lumber",
  smith: "lumber",
  saltworks: "artisan",
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

function applyImmigrantKit(household) {
  household.pantry.tools = 5;
  household.pantry.wheat = 240;
  if (household.job === "saltworks") household.pantry.char = 15;
  if (household.job === "woodshop" || household.job === "charburner") household.pantry.log = 20;
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
  if (household.job === "fisher2") household.pantry.salt = 2;
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
  if (includeInDaily) {
    const daily = economy.dailyMaterialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    daily[kind] += qty;
    economy.dailyMaterialFlows[goods] = daily;
  }
}

function makeHouseholdRecord(economy, { job, x, y }) {
  if (!JOBCLS[job]) throw new Error(`unknown household job: ${job}`);
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
    buildingId: null,
    cargo: null,
    marketCarrier: null,
    marketTransactionTicks: 0,
    marketTripTicks: 0,
    productionMultiplier: 1,
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

export function createHousehold(economy, { job, x, y, origin = "immigrant" }) {
  if (origin !== "immigrant") throw new Error(`unsupported household origin: ${origin}`);
  const household = makeHouseholdRecord(economy, { job, x, y });
  applyImmigrantKit(household);
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

export function marketPathLength(economy, physical, household) {
  if (!physical) {
    return Math.hypot(household.x - economy.market.x, household.y - economy.market.y);
  }
  return pathLen(
    physical,
    tilePosition(household),
    tilePosition(economy.market),
    "walk",
  );
}

export function marketTripDuration(economy, physical, household) {
  return marketPathLength(economy, physical, household) * 2 + 2;
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
      const manifest = household.cargo.manifest
        ?? (household.cargo.goods ? { [household.cargo.goods]: household.cargo.qty } : {});
      for (const [goods, qty] of Object.entries(manifest)) {
        cargo[goods] = (cargo[goods] ?? 0) + qty;
      }
    }
  }
  for (const ruin of economy.ruins) {
    for (const [goods, qty] of Object.entries(ruin.inventory)) {
      inventory[goods] = (inventory[goods] ?? 0) + qty;
    }
  }
  for (const [goods, stalls] of Object.entries(economy.stalls)) {
    for (const stall of stalls) inventory[goods] = (inventory[goods] ?? 0) + stall.qty;
  }
  for (const [goods, qty] of Object.entries(economy.stock)) {
    inventory[goods] = (inventory[goods] ?? 0) + qty;
  }
  for (const [goods, qty] of Object.entries(economy.marketStock ?? {})) {
    inventory[goods] = (inventory[goods] ?? 0) + qty;
  }
  if (physical) {
    for (const building of physical.buildings) {
      if (building.ownerHouseholdId === null && building.role !== "port") continue;
      for (const section of Object.values(building.inventory)) {
        for (const [goods, qty] of Object.entries(section)) {
          inventory[goods] = (inventory[goods] ?? 0) + qty;
        }
      }
    }
    for (const job of physical.haulJobs) {
      if (!job.economicLogistics || !job.carrier.cargo) continue;
      const { goods, qty } = job.carrier.cargo;
      cargo[goods] = (cargo[goods] ?? 0) + qty;
    }
    for (const pile of physical.groundPiles) {
      inventory[pile.goods] = (inventory[pile.goods] ?? 0) + pile.qty;
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
  // dayEndは離散後も、その世帯オブジェクトに対する文化消費まで続く。
  // pantryを廃屋在庫と共有し、正本の走査順と新エンジンの物資保存を両立する。
  const inventory = household.pantry;
  for (const [goods, stalls] of Object.entries(economy.stalls)) {
    for (let index = stalls.length - 1; index >= 0; index -= 1) {
      if (stalls[index].householdId !== household.id) continue;
      inventory[goods] += stalls[index].qty;
      stalls.splice(index, 1);
    }
  }
  economy.ruins.push({
    x: household.x,
    y: household.y,
    formerHouseholdId: household.id,
    inventory,
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

function runHouseholdFoodAndDeath(economy, household, day, markPhase = () => {}) {
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

  markPhase("death");
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

function consumeCultureGoods(economy, physical, household, goods, dailyNeed, satisfied) {
  const used = Math.min(householdMaterialAmount(physical, household, goods), dailyNeed);
  withdrawHouseholdMaterial(physical, household, goods, used);
  satisfied[goods] = used >= dailyNeed * 0.95;
  if (used > 1e-9) {
    recordEconomicMaterialFlow(economy, goods, "cons", used, `世帯${household.id}の文化消費`);
  }
}

function runHouseholdCultureAndLadder(economy, physical, household, day, markPhase = () => {}) {
  markPhase("culture");
  const month = ((Math.floor((day - 1) / 30)) % 12) + 1;
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
    runHouseholdFoodAndDeath(economy, household, day, markPhase);
    runHouseholdCultureAndLadder(economy, physical, household, day, markPhase);
  }
  for (const phase of ["food", "death", "culture", "ladder"]) markPhase(phase);
  return { hungry: economy.hungryN, famine: economy.famine };
}

export function runHouseholdSurvival(economy, { day }) {
  if (!Number.isSafeInteger(day) || day <= 0) throw new TypeError("survival day must be a positive safe integer");
  economy.hungryN = 0;
  for (const household of economy.households) runHouseholdFoodAndDeath(economy, household, day);
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
  rapeseed: "oil",
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
  oil: P.Y_OIL,
  meal: P.Y_FISH / P.MEAL_FISH,
  meat: P.Y_MEAT,
  veg: P.Y_VEG,
});

function householdStallQuantity(economy, household, goods) {
  return economy.stalls[goods].reduce((total, stall) => (
    total + (stall.householdId === household.id ? stall.qty : 0)
  ), 0);
}

function hasHouseholdStall(economy, household) {
  return GOODS.some((goods) => economy.stalls[goods].some(
    (stall) => stall.householdId === household.id,
  ));
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
  const month = (Math.floor((Math.max(1, day) - 1) / 30) % 12) + 1;
  const winter = month >= 10 || month <= 2;
  const dailyYield = {
    fish: winter ? P.Y_FISH_W : P.Y_FISH,
    veg: month >= 3 && month <= 10 ? P.Y_VEG : 0.01,
    wheat: P.Y_WHEAT / 360,
    meat: P.Y_MEAT,
    cloth: P.Y_CLOTH,
    tools: P.Y_TOOLS,
    char: P.Y_CHAR,
    salt: P.Y_SALT,
    stone: P.Y_STONE,
    oil: month >= 3 && month <= 8 ? P.Y_OIL : 0.01,
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
    bar: P.SMELT_ORE * (economy.px.ore ?? P.BELIEF0.ore)
      + P.SMELT_FUEL * fuelPrice,
    iron: P.SMITH_BAR * (economy.px.bar ?? P.BELIEF0.bar)
      + P.SMITH_FUEL * fuelPrice,
  }[goods] ?? 0;
  return labor + input;
}

export function sellOffers(economy, household) {
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
    rapeseed: "oil",
  }[household.job];

  if (goods === "meal") {
    if (household.pantry.meal >= 15) return { meal: Math.min(household.pantry.meal, P.HAUL) };
    return {};
  }
  if (goods === "fish") {
    let keep = householdEat(household) * 1.2;
    const alternative = Math.min(economy.px.veg ?? 9, economy.px.wheat ?? 9, economy.px.pres ?? 9);
    if ((economy.px.fish ?? 2) > alternative * 1.5) keep = householdEat(household) * 0.4;
    keep += Math.min(household.pantry.salt / P.PRES_SALT, 12);
    const surplus = Math.max(0, household.pantry.fish - keep);
    if (surplus > 1e-9) offers.fish = Math.min(surplus, householdHaul(household));
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
        goods === "log" ? householdHaul(household) / 2 : householdHaul(household),
      );
    }
  }
  if (household.job === "fisher" && household.pantry.pres > P.EAT * P.PANTRY_FOOD_D) {
    offers.pres = Math.min(
      household.pantry.pres - P.EAT * P.PANTRY_FOOD_D,
      householdHaul(household),
    );
  }
  if (household.job === "veg" && household.pantry.pick > 10) {
    offers.pick = Math.min(household.pantry.pick - 5, householdHaul(household));
  }
  if (household.job === "shepherd" && household.pantry.cloth > 2) {
    offers.cloth = Math.min(household.pantry.cloth - 1, householdHaul(household));
  }
  return offers;
}

export function loadMarketSellCargo(economy, household) {
  if (household.cargo) throw new Error(`世帯${household.id}は既にcargoを運搬中です`);
  let capacity = householdHaul(household);
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
    const building = householdInputBuilding(physical, household);
    if (building && isProductionInput(household, goods)) {
      depositInventory(building, "input", goods, qty);
    } else household.pantry[goods] += qty;
  }
  const delivered = household.cargo;
  household.cargo = null;
  return delivered;
}

export const BUY_ORDER = deepFreeze([
  "ore", "bar", "log", "salt", "char", "coal", "tools", "cloth", "iron", "meal",
  "stone", "oil", "fish", "veg", "wheat", "pres", "meat",
]);

export function buyTargets(
  economy,
  household,
  { day = economy.currentDay, physical = null } = {},
) {
  const targets = {};
  const inputQty = (goods) => productionInputAmount(physical, household, goods);
  const foodDays = FOODS.reduce((total, goods) => total + household.pantry[goods], 0) / P.EAT;
  const { px } = economy;
  const cheapest = Math.min(px.veg ?? 9, px.wheat ?? 9, px.pres ?? 9);
  const month = (Math.floor((day - 1) / 30) % 12) + 1;
  const autumn = month >= 7 && month <= 9;
  let targetDays = autumn ? 10 : P.PANTRY_FOOD_D;
  targetDays = Math.max(
    targetDays,
    Math.min(12, marketPathLength(economy, physical, household) * 0.9),
  );

  if (foodDays < targetDays) {
    const starving = foodDays < 1.5;
    for (const goods of ["veg", "wheat", "pres", "pick"]) {
      targets[goods] = [
        (targetDays - foodDays) * P.EAT / 4,
        starving ? 99 : Math.min((px[goods] ?? 9) * 1.5, cheapest * 2.2),
      ];
    }
  }
  if (household.job !== "fisher") {
    targets.fish = [P.EAT * 0.5, Math.min((px.fish ?? 9) * 1.5, cheapest * 2.5)];
  }
  if (household.job !== "wheat" && household.pantry.wheat < P.EAT * P.RATION * 10 && !targets.wheat) {
    targets.wheat = [
      P.EAT * P.RATION * 15 - household.pantry.wheat,
      (px.wheat ?? 3) * 1.3,
    ];
  }
  if (household.job !== "veg" && household.pantry.veg < P.EAT * P.RATION * 6 && !targets.veg) {
    targets.veg = [
      P.EAT * P.RATION * 10 - household.pantry.veg,
      (px.veg ?? 3) * 1.3,
    ];
  }
  if (household.job !== "shepherd" && household.pantry.meat < P.EAT * P.RATION * 4 && !targets.meat) {
    targets.meat = [
      P.EAT * P.RATION * 8 - household.pantry.meat,
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
      : P.Y_OIL * householdMult(household) * 540)
      * P.FERT_BOOST
      * (household.job === "wheat" ? (px.wheat ?? 2) : (px.oil ?? 3))
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
    ["tools", P.D_TOOL, 2.5],
    ["salt", P.D_SALT, 2.5],
    ["char", P.D_CHAR, 2.5],
    ["cloth", P.D_CLOTH, 2.8],
    ["iron", P.D_IRON, 5],
  ]) {
    if (!needed.has(goods)) continue;
    const daily = baseDaily * Math.pow(P.CMULT, household.lv);
    if (targets[goods]) continue;
    let target = daily * P.CULT_D;
    if (goods === "char" && autumn) target = daily * 2 * 100;
    const current = householdMaterialAmount(physical, household, goods);
    if (current < target * 0.5) {
      targets[goods] = [target - current, ceiling];
    }
  }
  return targets;
}

export function isProductionInput(household, goods) {
  return (household.job === "saltworks" && goods === "char")
    || (household.job === "fisher" && (goods === "salt" || goods === "char"))
    || (household.job === "veg" && goods === "salt")
    || ((household.job === "wheat" || household.job === "rapeseed") && goods === "meal")
    || (household.job === "smelter" && ["ore", "char", "coal"].includes(goods))
    || (household.job === "smith" && ["bar", "char", "coal"].includes(goods))
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

export function buyAtMarket(
  economy,
  household,
  { day, physical = null, delivery = "pantry" },
) {
  if (delivery !== "pantry" && delivery !== "cargo") {
    throw new Error(`unknown market delivery: ${delivery}`);
  }
  let capacity = householdHaul(household);
  const targets = buyTargets(economy, household, { day, physical });
  const order = BUY_ORDER.filter((goods) => targets[goods]);
  const transactions = [];
  const manifest = {};

  for (const goods of order) {
    let [wanted, ceiling] = targets[goods];
    const unitWeight = goodsUnitWeight(goods);
    wanted = Math.min(wanted, capacity / unitWeight);
    const shelves = economy.stalls[goods]
      .filter((stall) => findHousehold(economy, stall.householdId))
      .map((stall) => ({ kind: "STALL", stall, price: stall.price }));
    if (P.IMP[goods] !== undefined) shelves.push({ kind: "CO", price: P.IMP[goods] });
    const reserved = economy.order?.g === goods ? economy.order.left : 0;
    const freeStock = (economy.stock[goods] ?? 0) - reserved;
    const retailStock = physical ? (economy.marketStock[goods] ?? 0) : freeStock;
    if (retailStock > 1e-9) {
      shelves.push({
        kind: "STOCK",
        qty: retailStock,
        price: companyStockReleasePrice(economy, goods, { market: Boolean(physical) }),
      });
    } else if (physical && freeStock > 1e-9) {
      requestCompanyStockRelease(economy, physical, goods, { day, qty: wanted });
      const arrived = economy.marketStock[goods] ?? 0;
      if (arrived > 1e-9) {
        shelves.push({
          kind: "STOCK",
          qty: arrived,
          price: companyStockReleasePrice(economy, goods, { market: true }),
        });
      }
    }
    shelves.sort((a, b) => a.price - b.price);
    const input = isProductionInput(household, goods);

    for (const shelf of shelves) {
      if (wanted < 1e-9) break;
      if (shelf.price > ceiling || shelf.price <= 0) continue;
      const available = shelf.kind === "CO"
        ? Infinity
        : shelf.kind === "STOCK" ? shelf.qty : shelf.stall.qty;
      const affordable = (household.purse + (input ? 30 : 0)) / shelf.price;
      const qty = Math.min(wanted, available, affordable);
      if (qty < 1e-9) continue;

      const payment = qty * shelf.price;
      household.purse -= payment;
      if (delivery === "pantry") household.pantry[goods] += qty;
      else manifest[goods] = (manifest[goods] ?? 0) + qty;
      wanted -= qty;
      capacity -= qty * unitWeight;

      if (shelf.kind === "CO") {
        postCompanyLedger(economy.company, {
          day,
          amount: payment,
          reason: `世帯${household.id}へ輸入${goods}を小売`,
        });
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
      } else if (shelf.kind === "STOCK") {
        postCompanyLedger(economy.company, {
          day,
          amount: payment,
          reason: `世帯${household.id}へ蔵出し${goods}を小売`,
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
      } else {
        shelf.stall.qty -= qty;
        if (physical) {
          const market = companyLogisticsSite(physical, "market");
          withdrawInventory(market, "outbound", goods, qty);
        }
        const seller = findHousehold(economy, shelf.stall.householdId);
        const fee = payment * P.FEE;
        seller.purse += payment - fee;
        seller.income30 += payment - fee;
        postCompanyLedger(economy.company, {
          day,
          amount: fee,
          reason: `${goods}市場取引の口銭`,
        });
        economy.co.fee += fee;
      }

      economy.prices[goods].push([day, shelf.price, qty]);
      economy.px[goods] = (economy.px[goods] ?? shelf.price) * 0.9 + shelf.price * 0.1;
      transactions.push({
        goods,
        qty,
        price: shelf.price,
        source: shelf.kind === "CO"
          ? "CO"
          : shelf.kind === "STOCK" ? "STOCK" : shelf.stall.householdId,
      });
    }
  }
  return {
    targets,
    order,
    transactions,
    remainingCapacity: capacity,
    cargo: delivery === "cargo" ? { direction: "inbound", manifest } : null,
  };
}

function exportHouseholdGoods(economy, household, goods, qty, price, day) {
  const purchase = qty * price;
  household.purse += purchase;
  household.income30 += purchase;
  postCompanyLedger(economy.company, {
    day,
    amount: -purchase,
    reason: `世帯${household.id}から${goods}を輸出買付`,
  });
  economy.co.expBuy += purchase;
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
  for (const [goods, offered] of Object.entries(offers)) {
    let qty = offered;
    const desks = [];
    if (P.EXP[goods] !== undefined) desks.push(["EXP", P.EXP[goods], economy.expCap[goods]]);
    if (goods === "stone" && economy.paving && !economy.paved) desks.push(["PAVE", 1.4, Infinity]);
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
          exportHouseholdGoods(economy, household, goods, accepted, price, day);
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
          recordEconomicMaterialFlow(
            economy,
            "stone",
            "cons",
            accepted,
            "石畳への投入",
            { includeInDaily: false },
          );
        }
        qty -= accepted;
      }
    }
    if (qty > 1e-9) {
      if (withdrawFromPantry) household.pantry[goods] -= qty;
      const cost = productionCost(economy, physical, household, goods, { day });
      const price = quoteAskPrice(cost, goods, random);
      const stall = { householdId: household.id, qty, price, age: 0 };
      economy.stalls[goods].push(stall);
      const market = companyLogisticsSite(physical, "market");
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
  return { sold, bought };
}

export function transactMarketCargo(economy, physical, household, { day, random }) {
  const sold = sellMarketCargo(economy, physical, household, { day, random });
  const bought = buyAtMarket(economy, household, { day, physical, delivery: "cargo" });
  household.cargo = bought.cargo;
  return { sold, bought };
}

export function ageMarketStalls(economy, { day, physical = null }) {
  economy.currentDay = day;
  economy.deskUsed = {};
  economy.dailyMaterialFlows = {};
  for (const goods of GOODS) {
    const stalls = economy.stalls[goods];
    for (let index = stalls.length - 1; index >= 0; index -= 1) {
      const stall = stalls[index];
      const household = findHousehold(economy, stall.householdId);
      stall.age = (stall.age ?? 0) + 1;
      if (stall.age >= 3 && household && P.EXP[goods] !== undefined) {
        const used = economy.deskUsed[`EXP${goods}`] ?? 0;
        const accepted = Math.min(stall.qty, Math.max(0, economy.expCap[goods] - used));
        if (accepted > 1e-9) {
          economy.deskUsed[`EXP${goods}`] = used + accepted;
          stall.qty -= accepted;
          const market = companyLogisticsSite(physical, "market");
          if (market) withdrawInventory(market, "outbound", goods, accepted);
          exportHouseholdGoods(economy, household, goods, accepted, P.EXP[goods], day);
        }
      }
      if (stall.age >= 6 && household && goods !== "fish" && goods !== "veg") {
        const returned = stall.qty;
        household.pantry[goods] += stall.qty;
        stall.qty = 0;
        const market = companyLogisticsSite(physical, "market");
        if (market && returned > 0) withdrawInventory(market, "outbound", goods, returned);
      }
      if (goods === "fish" && stall.qty > 0) {
        const spoiled = stall.qty / P.FISH_LIFE;
        stall.qty -= spoiled;
        const market = companyLogisticsSite(physical, "market");
        if (market) withdrawInventory(market, "outbound", goods, spoiled);
        economy.led.spoil.fish = (economy.led.spoil.fish ?? 0) + spoiled;
        recordEconomicMaterialFlow(
          economy,
          "fish",
          "cons",
          spoiled,
          "屋台の魚の腐敗",
          { includeInDaily: false },
        );
      }
      if (goods === "veg" && stall.qty > 0) {
        const spoiled = stall.qty / P.VEG_LIFE;
        stall.qty -= spoiled;
        const market = companyLogisticsSite(physical, "market");
        if (market) withdrawInventory(market, "outbound", goods, spoiled);
        economy.led.spoil.veg = (economy.led.spoil.veg ?? 0) + spoiled;
        recordEconomicMaterialFlow(
          economy,
          "veg",
          "cons",
          spoiled,
          "屋台の野菜の腐敗",
          { includeInDaily: false },
        );
      }
      if (stall.qty < 0.5 || stall.price < 0.05) {
        const returned = Math.max(0, stall.qty);
        if (household) household.pantry[goods] += returned;
        const market = companyLogisticsSite(physical, "market");
        if (market && returned > 0) withdrawInventory(market, "outbound", goods, returned);
        stalls.splice(index, 1);
      }
    }
  }
}

export function runWheatHarvest(economy, { day }) {
  const month = (Math.floor((day - 1) / 30) % 12) + 1;
  if (month !== 9 || day % 30 !== 15) return [];
  const harvested = [];
  for (const household of economy.households) {
    if (household.job !== "wheat") continue;
    const fill = Math.min(1, (household.fert ?? 0) / (P.FERT_NEED * 180));
    const qty = P.Y_WHEAT
      * householdMult(household)
      * Math.min(1, household.wheatWork / 300)
      * (1 + P.FERT_BOOST * fill);
    household.pantry.wheat += qty;
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
  const month = (Math.floor((day - 1) / 30) % 12) + 1;
  const winter = month >= 10;
  let effectiveFraction = fraction;
  if (household.boost) {
    effectiveFraction *= household.boost;
    if (endOfDay) household.boost = null;
  }
  if (hasHouseholdStall(economy, household)) {
    effectiveFraction *= (household.members.length - 1) / household.members.length;
  }
  if (shouldPauseProduction(economy, household)) return {};
  const work = effectiveFraction * householdMult(household);
  const produced = {};

  if (household.job === "fisher2") {
    const depletion = economy.natural.bay2 / P.BAY0;
    if (!winter) {
      const fish = P.Y_FISH * work * depletion;
      economy.natural.bay2 = Math.min(
        P.BAY0,
        economy.natural.bay2 - fish
          + effectiveFraction * (
            P.BAY_R * economy.natural.bay2 * (1 - depletion)
            + P.RESEED * (1 - depletion)
          ),
      );
      const qty = fish / P.MEAL_FISH;
      household.pantry.meal += qty;
      recordEconomicMaterialFlow(economy, "meal", "prod", qty, `世帯${household.id}の魚粉生産`);
      produced.meal = qty;
    }
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
        recordEconomicMaterialFlow(economy, "meal", "cons", used, `世帯${household.id}の菜種施肥`);
      }
      const fill = Math.min(
        1,
        household.fert / Math.max(1, P.FERT_NEED * (month - 2) * 30),
      );
      const qty = P.Y_OIL * work * (1 + P.FERT_BOOST * fill);
      household.pantry.oil += qty;
      recordEconomicMaterialFlow(economy, "oil", "prod", qty, `世帯${household.id}の搾油`);
      produced.oil = qty;
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
  } else if (household.job === "wheat") {
    if (household.pantry.wheat > P.Y_WHEAT * householdMult(household) * 0.8) return produced;
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
    const fuelAvailable = productionInputAmount(physical, household, "char")
      + productionInputAmount(physical, household, "coal");
    const qty = Math.max(0, Math.min(
      P.Y_SMELT * work,
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
    for (const goods of ["char", "coal"]) {
      if (usedFuel[goods] > 0) {
        recordEconomicMaterialFlow(economy, goods, "cons", usedFuel[goods], `世帯${household.id}の製鉄`);
      }
    }
    produced.bar = qty;
  } else if (household.job === "smith") {
    const fuelAvailable = productionInputAmount(physical, household, "char")
      + productionInputAmount(physical, household, "coal");
    const qty = Math.max(0, Math.min(
      P.Y_SMITH * work,
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
    for (const goods of ["char", "coal"]) {
      if (usedFuel[goods] > 0) {
        recordEconomicMaterialFlow(economy, goods, "cons", usedFuel[goods], `世帯${household.id}の鍛冶`);
      }
    }
    produced.iron = qty;
  } else if (household.job === "woodshop") {
    const qty = Math.max(
      0,
      Math.min(P.Y_TOOLS * work, productionInputAmount(physical, household, "log") / P.LOG_TOOL),
    );
    withdrawProductionInput(physical, household, "log", qty * P.LOG_TOOL);
    household.pantry.tools += qty;
    recordEconomicMaterialFlow(economy, "tools", "prod", qty, `世帯${household.id}の木工`);
    recordEconomicMaterialFlow(economy, "log", "cons", qty * P.LOG_TOOL, `世帯${household.id}の木工`);
    produced.tools = qty;
  } else if (household.job === "charburner") {
    const qty = Math.max(
      0,
      Math.min(P.Y_CHAR * work, productionInputAmount(physical, household, "log") / P.LOG_CHAR),
    );
    withdrawProductionInput(physical, household, "log", qty * P.LOG_CHAR);
    household.pantry.char += qty;
    recordEconomicMaterialFlow(economy, "char", "prod", qty, `世帯${household.id}の炭焼`);
    recordEconomicMaterialFlow(economy, "log", "cons", qty * P.LOG_CHAR, `世帯${household.id}の炭焼`);
    produced.char = qty;
  } else if (household.job === "saltworks") {
    const fuel = Math.max(
      0,
      Math.min(P.SALT_CHAR * effectiveFraction, productionInputAmount(physical, household, "char")),
    );
    const qty = P.Y_SALT * householdMult(household) * fuel / P.SALT_CHAR;
    withdrawProductionInput(physical, household, "char", fuel);
    household.pantry.salt += qty;
    if (qty > 0) recordEconomicMaterialFlow(economy, "salt", "prod", qty, `世帯${household.id}の製塩`);
    if (fuel > 0) recordEconomicMaterialFlow(economy, "char", "cons", fuel, `世帯${household.id}の製塩`);
    produced.salt = qty;
  }
  return produced;
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
  return FOODS.reduce((total, goods) => total + household.pantry[goods], 0) / P.EAT;
}

export function isNeedyHousehold(household) {
  return household.purse < householdEat(household) * 0.8 && householdFoodDays(household) < 4;
}

export function laborWage(economy, household) {
  return householdEat(household) * staplePrice(economy);
}

export function assignNeedyWork(economy, physical, household) {
  if (household.state !== "home" || !isNeedyHousehold(household)) return null;
  const home = tilePosition(household);
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
      distance: pathLen(physical, home, tilePosition(candidate), "walk"),
    }))
    .filter(({ distance }) => distance <= 14)
    .sort((a, b) => a.distance - b.distance)[0]?.candidate;
  if (!employer) return null;
  employer.workerId = household.id;
  household.employerId = employer.id;
  household.worksiteId = null;
  household.wx = employer.x;
  household.wy = employer.y;
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

const ORDER_NAMES = deepFreeze({
  tools: "道具",
  char: "炭",
  salt: "塩",
  pres: "保存食",
  pick: "漬物",
  oil: "油",
  cloth: "布",
  stone: "石",
});

const ORDER_PRICES = deepFreeze({
  tools: 2.5,
  char: 1.2,
  salt: 1.5,
  pres: 0.9,
  pick: 0.8,
  oil: 2.6,
  cloth: 2,
  stone: 1.2,
});

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

function dispatchCompanyHaul(
  economy,
  physical,
  { day, kind, fromRole, fromSection, toRole, toSection, goods, qty, metadata = {} },
) {
  const from = companyLogisticsSite(physical, fromRole);
  const to = companyLogisticsSite(physical, toRole);
  if (!from || !to || !isConnected(physical, from, to)) {
    recordLogisticsBlocked(economy, day, fromRole, toRole);
    return null;
  }
  const job = createHaulJob(physical, {
    from: { building: from, section: fromSection },
    to: { building: to, section: toSection },
    goods,
    qty,
    carrier: createCartCarrier(physical),
  });
  job.economicLogistics = { kind, day, ...metadata };
  job.economicReconciled = false;
  (physical.economicHaulJobIds ??= []).push(job.id);
  if (job.carrier.routeCost <= 1e-9) {
    completeHaulJob(physical, job.id);
    settleCompanyLogistics(economy, physical, { day });
  }
  return job;
}

export function requestCompanyStockRelease(economy, physical, goods, { day, qty = 16 }) {
  if (!Number.isFinite(qty) || qty < 0) {
    throw new TypeError("stock release quantity must be non-negative and finite");
  }
  const reserved = economy.order?.g === goods ? economy.order.left : 0;
  const free = Math.max(0, (economy.stock[goods] ?? 0) - reserved);
  let remaining = Math.min(qty, free);
  if (remaining <= 1e-9) return null;
  const averageCost = (economy.stockCost[goods] ?? 0)
    / Math.max(1e-9, economy.stock[goods] ?? 0);
  const jobs = [];
  while (remaining > 1e-9) {
    const load = Math.min(carrierGoodsCapacity({ capacity: 16 }, goods), remaining);
    const job = dispatchCompanyHaul(economy, physical, {
      day,
      kind: "stock_release",
      fromRole: "warehouse",
      fromSection: "storage",
      toRole: "market",
      toSection: "inbound",
      goods,
      qty: load,
      metadata: { cost: load * averageCost },
    });
    if (!job) break;
    economy.stock[goods] -= load;
    economy.stockCost[goods] = Math.max(
      0,
      (economy.stockCost[goods] ?? 0) - load * averageCost,
    );
    remaining -= load;
    jobs.push(job);
  }
  return jobs[0] ?? null;
}

export function setCompanyStockTarget(economy, goods, qty) {
  if (!GOODS.includes(goods)) throw new Error(`unknown stock target goods: ${goods}`);
  if (!Number.isFinite(qty) || qty < 0) throw new TypeError("stock target must be non-negative and finite");
  economy.stockTgt[goods] = qty;
  return qty;
}

export function runCompanyProcurement(economy, { day, physical = null }) {
  const purchases = [];
  for (const goods of Object.keys(economy.stockTgt)) {
    let lack = (economy.stockTgt[goods] ?? 0)
      - (economy.stock[goods] ?? 0)
      - (physical ? (
        (economy.marketStock[goods] ?? 0)
        + pendingCompanyHaul(physical, "procurement", goods)
        + pendingCompanyHaul(physical, "stock_release", goods)
      ) : 0);
    if (lack <= 1e-9 || economy.company.money <= -companyCreditLimit(economy, { day })) continue;
    const stalls = [...economy.stalls[goods]].sort((a, b) => a.price - b.price);
    for (const stall of stalls) {
      if (lack <= 1e-9) break;
      const seller = findHousehold(economy, stall.householdId);
      if (!seller) continue;
      let remaining = Math.min(stall.qty, lack);
      while (remaining > 1e-9) {
        const qty = Math.min(carrierGoodsCapacity({ capacity: 16 }, goods), remaining);
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
          reason: `世帯${seller.id}から蔵へ${goods}を買上げ`,
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
  let remaining = Math.min(
    economy.stock[goods] ?? 0,
    Math.max(0, economy.order.left - pendingCompanyHaul(physical, "order", goods)),
  );
  const jobs = [];
  while (remaining > 1e-9) {
    const qty = Math.min(carrierGoodsCapacity({ capacity: 16 }, goods), remaining);
    const averageCost = (economy.stockCost[goods] ?? 0)
      / Math.max(1e-9, economy.stock[goods] ?? 0);
    const job = dispatchCompanyHaul(economy, physical, {
      day,
      kind: "order",
      fromRole: "warehouse",
      fromSection: "storage",
      toRole: "port",
      toSection: "outbound",
      goods,
      qty,
      metadata: {
        cost: qty * averageCost,
        orderPrice: economy.order.price,
        orderDue: economy.order.due,
      },
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
    if (metadata.kind === "procurement") {
      economy.stock[job.goods] = (economy.stock[job.goods] ?? 0) + job.qty;
      economy.stockCost[job.goods] = (economy.stockCost[job.goods] ?? 0) + metadata.payment;
    } else if (metadata.kind === "stock_release") {
      economy.marketStock[job.goods] = (economy.marketStock[job.goods] ?? 0) + job.qty;
      economy.marketStockCost[job.goods] = (economy.marketStockCost[job.goods] ?? 0) + metadata.cost;
    } else if (metadata.kind === "order") {
      if (
        economy.order
        && economy.order.g === job.goods
        && day <= economy.order.due
      ) {
        const port = companyLogisticsSite(physical, "port");
        const shipped = Math.min(job.qty, economy.order.left);
        withdrawInventory(port, "outbound", job.goods, shipped);
        economy.order.left -= shipped;
        const revenue = shipped * metadata.orderPrice * 1.25;
        postCompanyLedger(economy.company, {
          day,
          amount: revenue,
          reason: `本国注文へ${job.goods}を出荷`,
        });
        recordExternalMoneyFlow(economy, {
          amount: revenue,
          reason: `${job.goods}の本国注文売上`,
        });
        economy.co.ordSell += revenue;
        economy.exported[job.goods] = (economy.exported[job.goods] ?? 0) + shipped;
        recordEconomicMaterialFlow(
          economy,
          job.goods,
          "exp",
          shipped,
          `${job.goods}を本国注文へ出荷`,
        );
        if (economy.order.left <= 1e-9) {
          recordEconomyEvent(economy, day, "★注文を納めた——本国での評判が上がった");
          economy.orderDone += 1;
          economy.order = null;
        }
      }
    }
    job.economicReconciled = true;
    settled.push({ jobId: job.id, kind: metadata.kind, goods: job.goods, qty: job.qty });
  }
  physical.economicHaulJobIds = stillPending;
  return settled;
}

function createSuccessorHousehold(economy, donor, zone) {
  const household = makeHouseholdRecord(economy, { job: zone.job, x: zone.x, y: zone.y });
  const movedCount = Math.floor(donor.members.length / 2);
  const moved = donor.members.splice(donor.members.length - movedCount, movedCount);
  const share = movedCount / (movedCount + donor.members.length);
  household.sur = donor.sur;
  household.members = moved;
  for (const goods of GOODS) {
    household.pantry[goods] = donor.pantry[goods] * share;
    donor.pantry[goods] *= 1 - share;
  }
  household.purse = donor.purse * share;
  donor.purse *= 1 - share;
  household.px = donor.x;
  household.py = donor.y;
  household.state = "arriving";
  economy.households.push(household);
  return household;
}

function createZoneImmigrant(economy, zone, day) {
  const household = createHousehold(economy, {
    job: zone.job,
    x: zone.x,
    y: zone.y,
  });
  household.px = economy.port.x;
  household.py = economy.port.y;
  household.state = "arriving";
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

export function fillSettlementZones(economy, { day }) {
  const settlements = [];
  if (day % 15 !== 0 || !economy.port) return settlements;
  for (const zone of economy.zones) {
    if (zone.filled || settlements.length >= 2) continue;
    const donor = economy.households
      .filter((household) => household.members.length >= 8 && household.state === "home")
      .sort((a, b) => b.members.length - a.members.length)[0];
    if (donor) {
      const household = createSuccessorHousehold(economy, donor, zone);
      zone.filled = true;
      settlements.push({ kind: "successor", zone, household, donor });
      recordEconomyEvent(
        economy,
        day,
        `${donor.sur}家の${household.members.length}人が分かれて${zone.job}の区画へ移り住む`,
      );
    } else if (economy.hungryN < Math.max(1, economy.households.length * 0.2)) {
      const household = createZoneImmigrant(economy, zone, day);
      zone.filled = true;
      settlements.push({ kind: "immigrant", zone, household, donor: null });
      recordEconomyEvent(economy, day, "入植船が着いた——本土からの移民");
    }
  }
  return settlements;
}

export function runCompanyDayStart(economy, { day, random, physical = null }) {
  if (typeof random !== "function") throw new TypeError("company day-start random must be a function");
  const result = {
    created: null,
    expired: null,
    shipped: null,
    completed: false,
    dispatched: [],
    settlements: [],
    buildingsCompleted: [],
  };
  if (!economy.order && day > 60 && day % 15 === 0 && random() < 0.5) {
    const candidates = Object.keys(ORDER_NAMES).filter(
      (goods) => (economy.f30[goods]?.prod ?? 0) > 0.3,
    );
    if (candidates.length > 0) {
      const goods = candidates[Math.floor(random() * candidates.length)];
      const qty = Math.round(30 + random() * 50);
      economy.order = {
        g: goods,
        qty,
        left: qty,
        price: ORDER_PRICES[goods],
        due: day + 90,
      };
      result.created = structuredClone(economy.order);
      recordEconomyEvent(
        economy,
        day,
        `★本国より注文状: ${ORDER_NAMES[goods]}${qty}荷(@${Math.round(ORDER_PRICES[goods] * 10)}デナリ・90日以内)`,
      );
    }
  }

  if (economy.order && day >= economy.order.due) {
    result.expired = structuredClone(economy.order);
    recordEconomyEvent(
      economy,
      day,
      `注文の期限切れ——本国重役たちの心証を損ねた(残${Math.round(economy.order.left)}荷)`,
    );
    economy.order = null;
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
  result.settlements = fillSettlementZones(economy, { day });
  for (const household of economy.households) {
    if (household.state !== "building") continue;
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
  { job, x, y, day, canPlace = () => [true, ""] },
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
  economy.zones.push({ job, x, y, filled: false });
  recordEconomyEvent(economy, day, `区画指定: ${job}(支度金${P.BUILD_COST * 10}デナリ)`);
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
  for (const goods of GOODS) {
    const today = economy.dailyMaterialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    const flow = economy.f30[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    for (const kind of ["prod", "cons", "imp", "exp"]) {
      flow[kind] = flow[kind] * 0.95 + today[kind] * 0.05;
    }
    economy.f30[goods] = flow;
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
  const births = [];
  if (day % 30 !== 0) return births;
  for (const household of economy.households) {
    const foodDays = FOODS.reduce(
      (total, goods) => total + household.pantry[goods],
      0,
    ) / P.EAT;
    if (
      household.members.length < 11
      && household.hungerRun === 0
      && foodDays > 2
      && random() < 0.12
    ) {
      const member = {
        name: BIRTH_NAMES[Math.floor(random() * BIRTH_NAMES.length)],
        sex: random() < 0.5 ? "♂" : "♀",
        age: 0,
      };
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

function isNearTerrain(physical, household, kind, radius = 2) {
  if (!physical?.terrain) return true;
  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      if (
        terrainKindAt(
          physical,
          Math.round(household.x) + offsetX,
          Math.round(household.y) + offsetY,
        ) === kind
      ) return true;
    }
  }
  return false;
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
  const terrainNeed = {
    fisher: "water",
    fisher2: "water",
    logger: "forest",
    quarryman: "rock",
    miner: "ore",
    collier: "coal",
  };
  const weights = [];
  const jobPool = economy.jobSelectionPool ?? JOBS;
  for (const job of jobPool) {
    if (job === exclude) continue;
    if (household && terrainNeed[job] && !isNearTerrain(physical, household, terrainNeed[job], 2)) {
      continue;
    }
    if (!household && terrainNeed[job] && !economy.households.some((entry) => entry.job === job)) {
      continue;
    }
    const values = incomes[job];
    const weight = values?.length
      ? Math.max(0, values.reduce((total, value) => total + value, 0) / values.length)
      : median;
    if (weight > 0) weights.push([job, weight]);
  }
  return weights;
}

export function pickHouseholdJob(economy, physical, {
  exclude,
  household = null,
  random,
}) {
  const candidates = jobSelectionWeights(economy, physical, { exclude, household });
  if (candidates.length === 0) return null;
  const total = candidates.reduce((sum, [, weight]) => sum + weight * weight, 0);
  let choice = random() * total;
  for (const [job, weight] of candidates) {
    choice -= weight * weight;
    if (choice <= 0) return job;
  }
  return candidates[candidates.length - 1][0];
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
      && day - (household.lastSwitch || -9e9) >= P.COOLDOWN
      && random() < 0.5
    ) {
      const previousJob = household.job;
      const nextJob = pickHouseholdJob(economy, physical, {
        exclude: previousJob,
        household,
        random,
      });
      if (nextJob && nextJob !== previousJob) {
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
        household.job = nextJob;
        household.jobCycleDone = nextJob !== "wheat";
        household.lv = Math.min(household.lv, 1);
        household.lastSwitch = day;
        household.hungerHist = [];
        household.insolvM = 0;
        changes.push({
          kind: "job_switch",
          householdId: household.id,
          from: previousJob,
          to: nextJob,
        });
        recordEconomyEvent(
          economy,
          day,
          `破綻転職: ${previousJob}#${household.id}→${nextJob}`,
        );
      }
    }
  }
  return changes;
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
  const harvests = runWheatHarvest(economy, { day });
  const survival = runHouseholdDayEnd(economy, physical, { day, markPhase: mark });
  mark("paving");
  if (economy.paving && !economy.paved && economy.paveBought >= P.PAVE_STONE) {
    economy.paved = true;
    recordEconomyEvent(economy, day, "★石畳完成——全ての道が格上げ(0.6→0.45・永続)");
  }
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
  assertMoneyConservation(economy);

  return { trace, purchases, harvests, survival, births, population, finance };
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
    dailyMaterialFlows: {},
    f30: {},
    materialLedger: [],
    led: { prod: {}, eat: {}, spoil: {}, need: 0 },
    hungryN: 0,
    famine: 0,
    ruins: [],
    events: [],
    traffic: {},
    currentDay: 0,
    natural: { bay: P.BAY0, bay2: P.BAY0, wood: {} },
    grove: P.GROVE0,
    px: { ...P.BELIEF0 },
    stalls: Object.fromEntries(GOODS.map((goods) => [goods, []])),
    expCap: { ...P.EXP_CAP },
    expMl: { ...P.EXP_ML },
    deskUsed: {},
    co: {
      expBuy: 0,
      expSell: 0,
      impMargin: 0,
      fee: 0,
      pub: 0,
      procBuy: 0,
      stockSell: 0,
      ordSell: 0,
      build: 0,
    },
    exported: {},
    imported: {},
    outBy: { pass: 0 },
    prices: Object.fromEntries(GOODS.map((goods) => [goods, []])),
    market: { x: 0, y: 0 },
    port: null,
    stock: {},
    stockCost: {},
    marketStock: {},
    marketStockCost: {},
    stockTgt: {},
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
