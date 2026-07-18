import {
  BUILDINGS,
  CONTRACTS,
  GOOD_KEYS,
  GOODS,
  MAP_H,
  MAP_W,
  MARKET_FEE,
  MERCHANT_SEAL_TARGET,
  SAVE_SCHEMA,
  SHIP_INTERVAL,
  STARTING_PRICES,
  emptyGoods,
  isLand,
  terrainAt
} from "./config.js";
import { findPath, keyOf, orthogonalLine, pathCost } from "./pathfinding.js";
import { RNG } from "./rng.js";

const EPS = 1e-7;
const MAX_MARKET_PATH_COST = 14;
const round = (value, digits = 3) => Number(value.toFixed(digits));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const addGoods = (target, source, multiplier = 1) => {
  for (const good of GOOD_KEYS) target[good] += (source[good] || 0) * multiplier;
};

const FAMILY_NAMES = ["汐見", "舟木", "浜野", "実森", "高瀬", "朝倉", "小波", "樫村", "白帆", "深町", "水守", "島崎"];

export class World {
  constructor({ seed = 11, empty = false } = {}) {
    this.seed = Number(seed) || 11;
    this.rng = new RNG(this.seed);
    this.day = 1;
    this.funds = 720;
    this.roads = new Set();
    this.buildings = [];
    this.constructions = [];
    this.roadProjects = [];
    this.shipments = [];
    this.waitingSettlers = [];
    this.events = [];
    this.nextBuildingId = 1;
    this.nextHouseholdId = 1;
    this.nextShipmentId = 1;
    this.nextConstructionId = 1;
    this.shipNumber = 0;
    this.nextShipDay = SHIP_INTERVAL;
    this.shipAtSea = 1;
    this.activeContract = structuredClone(CONTRACTS.first_grain);
    this.pendingContractChoices = [];
    this.lastShipResult = null;
    this.seals = { life: false, timber: false, trade: false };
    this.unlockTier = 1;
    this.pausedForDecision = false;
    this.won = false;
    this.continuedAfterWin = false;
    this.emergencyCreditUsed = false;
    this.hungerFreeDays = 0;
    this.stats = {
      residentTradeValue: 0,
      companyTradeValue: 0,
      merchantGoods: 0,
      contractsSucceeded: 0,
      contractsFailed: 0,
      roadsBuilt: 0,
      buildingsBuilt: 0
    };
    this.ledger = {
      goodsInitial: emptyGoods(),
      produced: emptyGoods(),
      consumed: emptyGoods(),
      spoiled: emptyGoods(),
      imported: emptyGoods(),
      exported: emptyGoods(),
      constructionUsed: emptyGoods(),
      moneyInitial: 0,
      moneyExternalNet: 0
    };

    if (!empty) this.setupInitialIsland();
    this.snapshotInitialLedger();
  }

  setupInitialIsland() {
    this.addBuilding("port", 3, 9, { complete: true });
    this.addBuilding("market", 7, 9, { complete: true });
    this.addBuilding("fishery", 4, 15, {
      complete: true,
      household: this.makeHousehold({ members: 5, cash: 110 }),
      inventory: { grain: 5, fish: 7 }
    });

    const roadSegments = [
      [{ x: 4, y: 9 }, { x: 6, y: 9 }],
      [{ x: 7, y: 10 }, { x: 7, y: 14 }],
      [{ x: 5, y: 14 }, { x: 7, y: 14 }]
    ];
    for (const [start, end] of roadSegments) {
      for (const point of orthogonalLine(start, end)) this.roads.add(keyOf(point.x, point.y));
    }
    this.waitingSettlers.push(this.makeHousehold({ members: 4, cash: 90, waiting: true }));
    this.assignMarkets();
    this.log("島に最初の一家が上陸しました。畑区画を用意しましょう。", "story");
  }

  snapshotInitialLedger() {
    this.ledger.goodsInitial = this.currentGoods();
    this.ledger.moneyInitial = this.currentMoney();
  }

  makeHousehold({ members = null, cash = 90, waiting = false } = {}) {
    const id = this.nextHouseholdId++;
    return {
      id,
      name: `${FAMILY_NAMES[(id + this.seed) % FAMILY_NAMES.length]}家`,
      members: members ?? this.rng.int(4, 6),
      cash,
      hunger: 0,
      hungryToday: false,
      waiting,
      daysOnIsland: 0,
      activity: waiting ? "入植待ち" : "暮らしている"
    };
  }

  makeInventory(seed = {}) {
    return { ...emptyGoods(), ...seed };
  }

  addBuilding(type, x, y, options = {}) {
    const definition = BUILDINGS[type];
    if (!definition) throw new Error(`unknown building: ${type}`);
    const id = this.nextBuildingId++;
    const building = {
      id,
      type,
      x,
      y,
      complete: options.complete ?? true,
      vacant: false,
      household: options.household ?? null,
      inventory: this.makeInventory(options.inventory),
      avgCost: { ...STARTING_PRICES },
      marketId: null,
      lastOutput: 0,
      lastInput: 0,
      idleReason: "",
      activity: "",
      merchant: definition.merchant ? {
        currentMarketId: null,
        knownPrices: {},
        inventory: emptyGoods(),
        trip: null,
        cargoTargetMarketId: null,
        cooldown: 0,
        lifetimeGoods: 0,
        lastDecision: "市場を待っている"
      } : null,
      warehouse: type === "warehouse" ? {
        cash: options.warehouseCash ?? 0,
        targets: { grain: 10, fish: 0, logs: 7, lumber: 5, tools: 1.2 }
      } : null,
      market: type === "market" ? {
        prices: { ...STARTING_PRICES },
        lastTradeDay: Object.fromEntries(GOOD_KEYS.map((good) => [good, 0])),
        dayVolume: emptyGoods(),
        lifetimeVolume: emptyGoods()
      } : null
    };
    if (building.household) building.household.waiting = false;
    this.buildings.push(building);
    return building;
  }

  buildingAt(x, y) {
    return this.buildings.find((building) => building.complete && building.x === x && building.y === y) || null;
  }

  buildingById(id) {
    return this.buildings.find((building) => building.id === id) || null;
  }

  markets() {
    return this.buildings.filter((building) => building.complete && building.type === "market");
  }

  port() {
    return this.buildings.find((building) => building.type === "port");
  }

  get population() {
    const housed = this.buildings.reduce((sum, building) => sum + (building.household?.members || 0), 0);
    return housed + this.waitingSettlers.reduce((sum, household) => sum + household.members, 0);
  }

  get unlockedBuildings() {
    return Object.entries(BUILDINGS)
      .filter(([, definition]) => definition.unlock <= this.unlockTier)
      .map(([type]) => type);
  }

  validateBuilding(type, x, y) {
    const definition = BUILDINGS[type];
    if (!definition || definition.civic && type === "port") return { ok: false, reason: "建設できない区画です" };
    if (definition.unlock > this.unlockTier) return { ok: false, reason: `第${definition.unlock}章で解禁されます` };
    if (!isLand(x, y)) return { ok: false, reason: "陸地に置いてください" };
    if (!definition.terrain.includes(terrainAt(x, y))) return { ok: false, reason: `${definition.name}に適さない地形です` };
    if (this.buildingAt(x, y) || this.constructions.some((item) => item.x === x && item.y === y)) return { ok: false, reason: "すでに使われている場所です" };
    if (this.roads.has(keyOf(x, y)) || this.roadProjects.some((project) => project.points.some((point) => point.x === x && point.y === y))) return { ok: false, reason: "道の上には置けません" };
    if (this.funds + EPS < definition.cost) return { ok: false, reason: "会社資金が足りません" };
    return { ok: true, reason: "" };
  }

  placeBuilding(type, x, y) {
    const validation = this.validateBuilding(type, x, y);
    if (!validation.ok) return validation;
    const definition = BUILDINGS[type];
    this.funds -= definition.cost;
    const construction = {
      id: this.nextConstructionId++,
      type,
      x,
      y,
      totalDays: definition.days,
      daysLeft: definition.days,
      escrow: definition.cost,
      progress: 0
    };
    this.constructions.push(construction);
    this.log(`${definition.name}の建設契約を結びました。`, "build", { x, y });
    return { ok: true, construction };
  }

  validateRoad(points) {
    const unique = points.filter((point, index) => index === 0 || keyOf(point.x, point.y) !== keyOf(points[index - 1].x, points[index - 1].y));
    const buildable = unique.filter((point) => !this.roads.has(keyOf(point.x, point.y)));
    if (!buildable.length) return { ok: false, reason: "新しく敷く道がありません", points: [] };
    for (const point of buildable) {
      if (!isLand(point.x, point.y)) return { ok: false, reason: "海には道を敷けません", points: buildable };
      if (this.buildingAt(point.x, point.y) || this.constructions.some((item) => item.x === point.x && item.y === point.y)) {
        return { ok: false, reason: "建物を横切る道は敷けません", points: buildable };
      }
    }
    const cost = buildable.length * 4;
    if (this.funds + EPS < cost) return { ok: false, reason: "会社資金が足りません", points: buildable, cost };
    return { ok: true, reason: "", points: buildable, cost, days: Math.max(1, Math.ceil(buildable.length / 5)) };
  }

  planRoad(start, end) {
    const validation = this.validateRoad(orthogonalLine(start, end));
    if (!validation.ok) return validation;
    this.funds -= validation.cost;
    const project = {
      id: this.nextConstructionId++,
      points: validation.points,
      cost: validation.cost,
      escrow: validation.cost,
      totalDays: validation.days,
      daysLeft: validation.days
    };
    this.roadProjects.push(project);
    this.log(`${validation.points.length}区画の道普請を始めました。`, "build", { x: start.x, y: start.y });
    return { ok: true, project };
  }

  tickDay() {
    if (this.pausedForDecision || this.won && !this.continuedAfterWin) return;
    this.day += 1;
    this.shipAtSea = clamp((this.day - (this.nextShipDay - SHIP_INTERVAL)) / SHIP_INTERVAL, 0, 1);
    this.processConstruction();
    this.assignMarkets();
    this.advanceMerchantTrips();
    this.advanceShipments();
    this.processSpoilage();
    this.processDayLabor();
    this.processHouseholds();
    this.processProduction();
    this.resetMarketDay();
    this.runMarkets();
    this.updateMerchantSeals();
    this.updatePopulation();
    this.updateHungerClock();
    if (this.day >= this.nextShipDay) this.handleShipDay();
    this.assertInvariants();
  }

  processConstruction() {
    for (const item of this.constructions) {
      item.daysLeft -= 1;
      item.progress = clamp(1 - item.daysLeft / item.totalDays, 0, 1);
    }
    const completed = this.constructions.filter((item) => item.daysLeft <= 0);
    this.constructions = this.constructions.filter((item) => item.daysLeft > 0);
    for (const item of completed) {
      this.ledger.moneyExternalNet -= item.escrow;
      const building = this.addBuilding(item.type, item.x, item.y, { complete: true });
      building.vacant = !BUILDINGS[item.type].civic;
      if (building.warehouse) {
        const cooperativeCapital = 120;
        building.warehouse.cash = cooperativeCapital;
        this.ledger.moneyExternalNet += cooperativeCapital;
        this.log("共同蔵に入植者組合の運転資金120金が入りました。", "story", building);
      }
      this.stats.buildingsBuilt += 1;
      this.fillBuilding(building);
      this.log(`${BUILDINGS[item.type].name}が完成しました。`, "success", { x: item.x, y: item.y });
    }

    for (const project of this.roadProjects) project.daysLeft -= 1;
    const roadsDone = this.roadProjects.filter((project) => project.daysLeft <= 0);
    this.roadProjects = this.roadProjects.filter((project) => project.daysLeft > 0);
    for (const project of roadsDone) {
      this.ledger.moneyExternalNet -= project.escrow;
      for (const point of project.points) this.roads.add(keyOf(point.x, point.y));
      this.stats.roadsBuilt += project.points.length;
      this.log(`道が${project.points.length}区画つながりました。`, "success", project.points[0]);
    }
  }

  fillBuilding(building) {
    if (!building.vacant || !this.waitingSettlers.length) return false;
    const household = this.waitingSettlers.shift();
    household.waiting = false;
    household.activity = `${BUILDINGS[building.type].name}へ入植`;
    building.household = household;
    building.vacant = false;
    const starterGrain = building.type === "tradehouse" ? 2 : 3;
    if (starterGrain) {
      building.inventory.grain += starterGrain;
      this.ledger.imported.grain += starterGrain;
    }
    if (building.type === "tradehouse") {
      const merchantCapital = 160;
      household.cash += merchantCapital;
      this.ledger.moneyExternalNet += merchantCapital;
    }
    this.log(`${household.name}が${BUILDINGS[building.type].name}へ入りました。`, "story", building);
    return true;
  }

  fillVacancies() {
    const vacancies = this.buildings.filter((building) => building.vacant);
    for (const building of vacancies) {
      if (!this.fillBuilding(building)) break;
    }
  }

  assignMarkets() {
    const markets = this.markets();
    for (const building of this.buildings) {
      if (!building.complete || building.type === "market" || building.type === "port") continue;
      let best = null;
      for (const market of markets) {
        const path = findPath(this, building, market, "walker");
        const cost = pathCost(this, path);
        if (!best || cost < best.cost) best = { market, cost };
      }
      // 徒歩で島を横断すること自体はできるが、日常的に売買へ参加できる
      // 「市場圏」には上限を置く。道路は同じ距離の負担を約1/3へ縮める。
      building.marketId = best && best.cost <= MAX_MARKET_PATH_COST ? best.market.id : null;
      if (building.merchant && !building.merchant.currentMarketId && building.marketId) {
        building.merchant.currentMarketId = building.marketId;
        const market = this.buildingById(building.marketId);
        building.merchant.knownPrices[building.marketId] = { ...market.market.prices };
      }
    }
  }

  processSpoilage() {
    for (const building of this.buildings) {
      if (!building.complete) continue;
      const spoiled = building.inventory.fish * 0.12;
      if (spoiled > EPS) {
        building.inventory.fish -= spoiled;
        this.ledger.spoiled.fish += spoiled;
      }
      if (building.merchant) {
        const merchantSpoiled = building.merchant.inventory.fish * 0.12;
        building.merchant.inventory.fish -= merchantSpoiled;
        this.ledger.spoiled.fish += merchantSpoiled;
      }
    }
  }

  processHouseholds() {
    for (const building of this.buildings) {
      const household = building.household;
      if (!household) continue;
      household.daysOnIsland += 1;
      household.hungryToday = false;
      const need = household.members * 0.13;
      let remaining = need;
      const order = building.type === "farm" && this.day % 3 === 0 ? ["fish", "grain"] : ["grain", "fish"];
      for (const good of order) {
        const eaten = Math.min(building.inventory[good], remaining);
        building.inventory[good] -= eaten;
        this.ledger.consumed[good] += eaten;
        remaining -= eaten;
      }
      if (remaining > EPS) {
        household.hungryToday = true;
        household.hunger = Math.min(12, household.hunger + remaining / need);
        household.activity = "食べ物を探している";
      } else {
        household.hunger = Math.max(0, household.hunger - 0.65);
      }
    }
  }

  processDayLabor() {
    const port = this.port();
    if (!port || this.funds < 2) return;
    for (const building of this.buildings) {
      const household = building.household;
      if (!household || household.cash >= 9) continue;
      const path = findPath(this, building, port, "walker");
      if (!path || pathCost(this, path) > 26) continue;
      const wage = Math.min(this.funds, household.members * 0.48);
      if (wage <= EPS) break;
      this.funds -= wage;
      household.cash += wage;
      household.activity = "港の日傭へ出た";
    }
  }

  consumeTool(building) {
    if (building.inventory.tools < 0.035) return 1;
    building.inventory.tools -= 0.035;
    this.ledger.consumed.tools += 0.035;
    return 1.5;
  }

  produce(building, good, quantity, unitCost) {
    if (quantity <= EPS) return;
    const oldQuantity = building.inventory[good];
    building.inventory[good] += quantity;
    building.avgCost[good] = oldQuantity + quantity > EPS
      ? (building.avgCost[good] * oldQuantity + unitCost * quantity) / (oldQuantity + quantity)
      : unitCost;
    building.lastOutput = quantity;
    this.ledger.produced[good] += quantity;
  }

  processProduction() {
    for (const building of this.buildings) {
      const household = building.household;
      if (!household) continue;
      building.lastOutput = 0;
      building.lastInput = 0;
      building.idleReason = "";
      const health = clamp(1 - household.hunger * 0.18, 0.25, 1);
      const people = household.members;
      if (building.type === "farm") {
        const fertility = terrainAt(building.x, building.y) === "fertile" ? 1.35 : 0.82;
        const tool = this.consumeTool(building);
        this.produce(building, "grain", people * 0.34 * fertility * tool * health, 1.15 / (fertility * tool));
        building.activity = tool > 1 ? "道具で畑を耕している" : "畑を耕している";
      } else if (building.type === "fishery") {
        const tool = this.consumeTool(building);
        this.produce(building, "fish", people * 0.29 * tool * health, 1.55 / tool);
        building.activity = "漁から戻った";
      } else if (building.type === "logger") {
        const forest = terrainAt(building.x, building.y) === "forest" ? 1.25 : 0.8;
        const tool = this.consumeTool(building);
        this.produce(building, "logs", people * 0.31 * forest * tool * health, 1.45 / (forest * tool));
        building.activity = "丸太を切り出している";
      } else if (building.type === "sawmill") {
        const input = Math.min(building.inventory.logs, people * 0.23);
        if (input <= EPS) {
          building.idleReason = "丸太が届いていない";
          building.activity = "丸太を待っている";
        } else {
          const inputCost = building.avgCost.logs;
          building.inventory.logs -= input;
          this.ledger.consumed.logs += input;
          building.lastInput = input;
          this.produce(building, "lumber", input * 0.75 * health, (inputCost + 0.85) / 0.75);
          building.activity = "鋸が動いている";
        }
      } else if (building.type === "workshop") {
        const input = Math.min(building.inventory.lumber, people * 0.12);
        if (input <= EPS) {
          building.idleReason = "材木が届いていない";
          building.activity = "材木を待っている";
        } else {
          const inputCost = building.avgCost.lumber;
          building.inventory.lumber -= input;
          this.ledger.consumed.lumber += input;
          building.lastInput = input;
          this.produce(building, "tools", input * 0.65 * health, (inputCost + 1.6) / 0.65);
          building.activity = "道具を仕上げている";
        }
      }
    }
  }

  resetMarketDay() {
    for (const market of this.markets()) market.market.dayVolume = emptyGoods();
  }

  runMarkets() {
    for (const market of this.markets()) {
      const { asks, bids } = this.collectOrders(market);
      for (const good of GOOD_KEYS) this.matchGood(market, good, asks.filter((order) => order.good === good), bids.filter((order) => order.good === good));
    }
  }

  collectOrders(market) {
    const asks = [];
    const bids = [];
    const members = this.buildings.filter((building) => building.complete && building.marketId === market.id && building.household);
    for (const building of members) {
      const output = BUILDINGS[building.type].output;
      if (output) {
        const reserve = output === "grain" ? 3 : output === "fish" ? 1.2 : 0.5;
        const quantity = Math.max(0, building.inventory[output] - reserve);
        if (quantity > 0.2) {
          const route = findPath(this, building, market, "walker");
          const distanceCost = pathCost(this, route) * 0.025;
          asks.push({
            owner: `b:${building.id}`,
            ownerType: "resident",
            buildingId: building.id,
            location: building,
            good: output,
            quantity: Math.min(quantity, 7),
            price: building.avgCost[output] * 1.08 + distanceCost
          });
        }
      }

      const household = building.household;
      const foodTarget = household.members * 0.13 * 8;
      const foodHeld = building.inventory.grain + building.inventory.fish;
      if (foodHeld < foodTarget) {
        const preferred = building.type === "farm" ? "fish" : "grain";
        // 困窮で購入意欲は上がるが、入札額を無制限に上げると
        // 日雇い賃金で最小量すら買えない逆転が起きるため上限を持たせる。
        const price = GOODS[preferred].basePrice * (1.35 + Math.min(2, household.hunger) * 0.25);
        bids.push({
          owner: `b:${building.id}`,
          ownerType: "resident",
          buildingId: building.id,
          location: building,
          good: preferred,
          quantity: Math.min(6, foodTarget - foodHeld),
          price
        });
      }

      if (building.type === "sawmill" && building.inventory.logs < 5 && building.inventory.lumber < 8) {
        bids.push({ owner: `b:${building.id}`, ownerType: "resident", buildingId: building.id, location: building, good: "logs", quantity: 5 - building.inventory.logs, price: 4.8 });
      }
      if (building.type === "workshop" && building.inventory.lumber < 4 && building.inventory.tools < 3) {
        bids.push({ owner: `b:${building.id}`, ownerType: "resident", buildingId: building.id, location: building, good: "lumber", quantity: 4 - building.inventory.lumber, price: 11.5 });
      }
      if (["farm", "fishery", "logger"].includes(building.type) && building.inventory.tools < 0.5 && household.cash > 20) {
        bids.push({ owner: `b:${building.id}`, ownerType: "resident", buildingId: building.id, location: building, good: "tools", quantity: 0.5 - building.inventory.tools, price: 19 });
      }

    }

    for (const merchantBuilding of this.buildings.filter((building) => building.household && building.merchant?.currentMarketId === market.id)) {
      this.collectMerchantOrders(merchantBuilding, market, asks, bids);
    }

    for (const warehouse of this.buildings.filter((building) => building.warehouse && building.marketId === market.id)) {
      this.collectWarehouseOrders(warehouse, market, asks, bids);
    }

    if (market.id === this.portMarket()?.id && this.activeContract) {
      const remaining = this.contractRemaining();
      if (remaining > 0.1) {
        const perGood = remaining / this.activeContract.goods.length;
        for (const good of this.activeContract.goods) {
          bids.push({
            owner: "company",
            ownerType: "company",
            buildingId: this.port().id,
            location: this.port(),
            good,
            quantity: perGood,
            price: GOODS[good].basePrice * 1.75
          });
        }
      }
    }
    return { asks, bids };
  }

  collectWarehouseOrders(building, market, asks, bids) {
    for (const good of GOOD_KEYS) {
      const target = building.warehouse.targets[good] || 0;
      if (!target) continue;
      const held = building.inventory[good];
      const reserve = target * 0.35;
      if (held > reserve + 0.2) {
        asks.push({
          owner: `w:${building.id}`,
          ownerType: "warehouse",
          buildingId: building.id,
          location: building,
          good,
          quantity: Math.min(6, held - reserve),
          price: Math.max(building.avgCost[good] * 1.04, market.market.prices[good] * 0.98)
        });
      }
      if (held < target && building.warehouse.cash > market.market.prices[good]) {
        bids.push({
          owner: `w:${building.id}`,
          ownerType: "warehouse",
          buildingId: building.id,
          location: building,
          good,
          quantity: Math.min(5, target - held),
          // 世帯と港契約を押しのけず、余剰だけを拾う控えめな指値。
          price: market.market.prices[good] * 1.16
        });
      }
    }
  }

  collectMerchantOrders(building, market, asks, bids) {
    const merchant = building.merchant;
    if (merchant.trip || merchant.currentMarketId !== market.id) return;
    merchant.knownPrices[market.id] = { ...market.market.prices };
    if (merchant.cooldown > 0) {
      merchant.cooldown -= 1;
      return;
    }

    const cargoGood = GOOD_KEYS.find((good) => merchant.inventory[good] > 0.05);
    if (cargoGood) {
      if (merchant.cargoTargetMarketId && merchant.cargoTargetMarketId !== market.id) {
        this.startMerchantTrip(building, merchant.cargoTargetMarketId);
        return;
      }
      asks.push({
        owner: `m:${building.id}`,
        ownerType: "merchant",
        buildingId: building.id,
        location: market,
        good: cargoGood,
        quantity: Math.min(8, merchant.inventory[cargoGood]),
        price: Math.max(building.avgCost[cargoGood] * 1.12, market.market.prices[cargoGood] * 0.95)
      });
      merchant.lastDecision = `${GOODS[cargoGood].name}を売っている`;
      return;
    }

    const otherMarkets = this.markets().filter((candidate) => candidate.id !== market.id);
    const unknown = otherMarkets.find((candidate) => !merchant.knownPrices[candidate.id]);
    if (unknown) {
      this.startMerchantTrip(building, unknown.id, true);
      return;
    }

    let best = null;
    for (const destination of otherMarkets) {
      for (const good of GOOD_KEYS.filter((item) => item !== "fish")) {
        const local = market.market.prices[good];
        const remote = merchant.knownPrices[destination.id]?.[good];
        const margin = remote - local;
        if (margin <= Math.max(0.8, local * 0.22)) continue;
        if (!best || margin > best.margin) best = { good, destination, margin, local };
      }
    }
    if (best && building.household.cash > best.local * 2) {
      bids.push({
        owner: `m:${building.id}`,
        ownerType: "merchant",
        buildingId: building.id,
        location: market,
        good: best.good,
        quantity: Math.min(8, Math.floor(building.household.cash / (best.local * 1.08))),
        price: best.local * 1.08,
        merchantTarget: best.destination.id
      });
      merchant.lastDecision = `${GOODS[best.good].name}を仕入れようとしている`;
    } else if (otherMarkets.length && this.day % 7 === building.id % 7) {
      this.startMerchantTrip(building, otherMarkets[0].id, true);
    } else {
      merchant.lastDecision = "採算の合う荷を待っている";
    }
  }

  matchGood(market, good, asks, bids) {
    asks.sort((a, b) => a.price - b.price || a.buildingId - b.buildingId);
    bids.sort((a, b) => b.price - a.price || a.buildingId - b.buildingId);
    for (const bid of bids) {
      for (const ask of asks) {
        if (bid.quantity <= EPS) break;
        if (ask.quantity <= EPS || ask.price > bid.price || ask.owner === bid.owner) continue;
        const buyerCash = this.ownerCash(bid.owner);
        const price = (ask.price + bid.price) / 2;
        const quantity = Math.min(ask.quantity, bid.quantity, buyerCash / price);
        if (quantity <= 0.02) continue;
        const path = this.tradePath(ask.location, market, bid.location);
        if (!path) continue;
        this.takeOwnerGoods(ask.owner, good, quantity);
        this.takeOwnerCash(bid.owner, quantity * price);
        const shipment = {
          id: this.nextShipmentId++,
          kind: "trade",
          marketId: market.id,
          seller: ask.owner,
          buyer: bid.owner,
          sellerType: ask.ownerType,
          buyerType: bid.ownerType,
          good,
          quantity,
          payment: quantity * price,
          path,
          progress: 0,
          duration: Math.max(1, Math.ceil(pathCost(this, path) / 4.2)),
          daysLeft: Math.max(1, Math.ceil(pathCost(this, path) / 4.2)),
          merchantTarget: bid.merchantTarget ?? null
        };
        this.shipments.push(shipment);
        ask.quantity -= quantity;
        bid.quantity -= quantity;
        market.market.prices[good] = market.market.lastTradeDay[good]
          ? market.market.prices[good] * 0.72 + price * 0.28
          : price;
        market.market.lastTradeDay[good] = this.day;
        market.market.dayVolume[good] += quantity;
        market.market.lifetimeVolume[good] += quantity;
      }
    }
  }

  tradePath(seller, market, buyer) {
    const first = findPath(this, seller, market, "walker");
    const second = findPath(this, market, buyer, "walker");
    if (!first || !second) return null;
    return [...first, ...second.slice(1)];
  }

  ownerCash(owner) {
    if (owner === "company") return this.funds;
    const [kind, idText] = owner.split(":");
    const building = this.buildingById(Number(idText));
    if (kind === "w") return building?.warehouse?.cash || 0;
    if (!building?.household) return 0;
    if (kind === "b" || kind === "m") return building.household.cash;
    return 0;
  }

  takeOwnerCash(owner, amount) {
    if (owner === "company") this.funds -= amount;
    else {
      const [kind, idText] = owner.split(":");
      const building = this.buildingById(Number(idText));
      if (kind === "w") building.warehouse.cash -= amount;
      else building.household.cash -= amount;
    }
  }

  giveOwnerCash(owner, amount) {
    if (owner === "company") this.funds += amount;
    else {
      const [kind, idText] = owner.split(":");
      const building = this.buildingById(Number(idText));
      if (kind === "w" && building?.warehouse) building.warehouse.cash += amount;
      else if (building?.household) building.household.cash += amount;
      else {
        this.funds += amount;
        this.log("送り先を失った代金を会社金庫へ保全しました。", "warning");
      }
    }
  }

  takeOwnerGoods(owner, good, amount) {
    const [kind, idText] = owner.split(":");
    const building = this.buildingById(Number(idText));
    const inventory = kind === "m" ? building.merchant.inventory : building.inventory;
    inventory[good] -= amount;
    if (inventory[good] < -EPS) throw new Error(`negative goods ${owner} ${good}`);
  }

  giveOwnerGoods(owner, good, amount, price = null) {
    if (owner === "company") {
      this.port().inventory[good] += amount;
      return;
    }
    const [kind, idText] = owner.split(":");
    const building = this.buildingById(Number(idText));
    if (!building) {
      this.port().inventory[good] += amount;
      this.log("行き先を失った荷を港で保管しました。", "warning");
      return;
    }
    const inventory = kind === "m" ? building.merchant.inventory : building.inventory;
    const old = inventory[good];
    inventory[good] += amount;
    if (price !== null && kind !== "m") building.avgCost[good] = (building.avgCost[good] * old + price * amount) / Math.max(EPS, old + amount);
  }

  advanceShipments() {
    for (const shipment of this.shipments) {
      shipment.daysLeft -= 1;
      shipment.progress = clamp(1 - shipment.daysLeft / shipment.duration, 0, 1);
    }
    const arrivals = this.shipments.filter((shipment) => shipment.daysLeft <= 0);
    this.shipments = this.shipments.filter((shipment) => shipment.daysLeft > 0);
    for (const shipment of arrivals) {
      const unitPrice = shipment.payment / shipment.quantity;
      this.giveOwnerGoods(shipment.buyer, shipment.good, shipment.quantity, unitPrice);
      const fee = shipment.payment * MARKET_FEE;
      this.giveOwnerCash(shipment.seller, shipment.payment - fee);
      this.funds += fee;
      if (shipment.buyerType === "company" || shipment.sellerType === "company") this.stats.companyTradeValue += shipment.payment;
      else this.stats.residentTradeValue += shipment.payment;
      if (shipment.sellerType === "merchant" || shipment.buyerType === "merchant") {
        const merchantBuilding = this.buildingById(Number((shipment.sellerType === "merchant" ? shipment.seller : shipment.buyer).split(":")[1]));
        if (merchantBuilding?.merchant) {
          if (shipment.merchantTarget) merchantBuilding.merchant.cargoTargetMarketId = shipment.merchantTarget;
        }
      }
    }
  }

  startMerchantTrip(building, targetMarketId, exploration = false) {
    const merchant = building.merchant;
    const from = this.buildingById(merchant.currentMarketId);
    const to = this.buildingById(targetMarketId);
    if (!from || !to) return false;
    const path = findPath(this, from, to, "cart");
    if (!path) {
      merchant.lastDecision = "市場まで荷馬車道がつながっていない";
      return false;
    }
    const duration = Math.max(1, Math.ceil(pathCost(this, path) / 7));
    merchant.trip = {
      fromMarketId: from.id,
      targetMarketId: to.id,
      path,
      duration,
      daysLeft: duration,
      progress: 0,
      exploration
    };
    merchant.lastDecision = exploration ? `${to.id}番市場へ相場を見に行く` : `${to.id}番市場へ荷を運んでいる`;
    return true;
  }

  advanceMerchantTrips() {
    for (const building of this.buildings.filter((item) => item.merchant?.trip)) {
      const trip = building.merchant.trip;
      trip.daysLeft -= 1;
      trip.progress = clamp(1 - trip.daysLeft / trip.duration, 0, 1);
      if (trip.daysLeft > 0) continue;
      building.merchant.currentMarketId = trip.targetMarketId;
      const market = this.buildingById(trip.targetMarketId);
      building.merchant.knownPrices[market.id] = { ...market.market.prices };
      const carried = GOOD_KEYS.reduce((sum, good) => sum + building.merchant.inventory[good], 0);
      if (carried > EPS) {
        this.stats.merchantGoods += carried;
        building.merchant.lifetimeGoods += carried;
      }
      building.merchant.trip = null;
      building.merchant.cooldown = 1;
      if (building.merchant.cargoTargetMarketId === market.id) building.merchant.cargoTargetMarketId = null;
      building.merchant.lastDecision = `${BUILDINGS.market.name}へ到着した`;
    }
  }

  portMarket() {
    const markets = this.markets();
    if (!markets.length) return null;
    let best = markets[0];
    let bestDistance = Infinity;
    for (const market of markets) {
      const distance = Math.abs(market.x - this.port().x) + Math.abs(market.y - this.port().y);
      if (distance < bestDistance) {
        best = market;
        bestDistance = distance;
      }
    }
    return best;
  }

  contractRemaining() {
    if (!this.activeContract) return 0;
    const port = this.port();
    const stored = this.activeContract.goods.reduce((sum, good) => sum + port.inventory[good], 0);
    const inbound = this.shipments
      .filter((shipment) => shipment.buyer === "company" && this.activeContract.goods.includes(shipment.good))
      .reduce((sum, shipment) => sum + shipment.quantity, 0);
    return Math.max(0, this.activeContract.target - stored - inbound);
  }

  handleShipDay() {
    this.shipNumber += 1;
    const contract = this.activeContract;
    let delivered = 0;
    if (contract) {
      for (const good of contract.goods) {
        const amount = Math.min(this.port().inventory[good], contract.target - delivered);
        this.port().inventory[good] -= amount;
        this.ledger.exported[good] += amount;
        delivered += amount;
      }
    }
    const success = contract ? delivered + EPS >= contract.target : true;
    const reward = success && contract ? contract.reward : 0;
    if (reward) {
      this.funds += reward;
      this.ledger.moneyExternalNet += reward;
      this.stats.contractsSucceeded += 1;
      if (contract.seal) {
        this.seals[contract.seal] = true;
        if (contract.seal === "life") this.unlockTier = Math.max(this.unlockTier, 2);
        if (contract.seal === "timber") this.unlockTier = Math.max(this.unlockTier, 3);
      }
      this.log(`${contract.title}を達成。${Math.round(delivered)}荷を積みました。`, "ship");
    } else if (contract) {
      this.stats.contractsFailed += 1;
      this.log(`${contract.title}は${round(delivered, 1)}/${contract.target}荷。次便で立て直せます。`, "warning");
    }

    const arrivals = success ? 2 : 1;
    for (let i = 0; i < arrivals; i += 1) {
      const household = this.makeHousehold({ cash: 95, waiting: true });
      this.waitingSettlers.push(household);
      this.ledger.moneyExternalNet += household.cash;
    }
    this.fillVacancies();
    this.lastShipResult = {
      shipNumber: this.shipNumber,
      contract: contract ? { ...contract } : null,
      delivered,
      success,
      reward,
      arrivals
    };
    this.activeContract = null;
    this.pendingContractChoices = this.nextContractChoices(success, contract);
    this.pausedForDecision = true;
    this.nextShipDay += SHIP_INTERVAL;
    this.shipAtSea = 0;
  }

  nextContractChoices(success, previous) {
    if (!this.seals.life) return [{ ...CONTRACTS.first_grain, target: Math.max(12, (previous?.target || 18) - 3) }];
    if (!this.seals.timber) return [structuredClone(CONTRACTS.grain_relief), structuredClone(CONTRACTS.timber_charter)];
    return [structuredClone(CONTRACTS.grain_relief), structuredClone(CONTRACTS.timber_charter), structuredClone(CONTRACTS.tool_charter)];
  }

  chooseContract(contractId) {
    const choice = this.pendingContractChoices.find((contract) => contract.id === contractId);
    if (!choice) return false;
    this.activeContract = structuredClone(choice);
    this.pendingContractChoices = [];
    this.pausedForDecision = false;
    this.lastShipResult = null;
    this.log(`次便は「${choice.title}」を受けます。`, "story");
    return true;
  }

  updateMerchantSeals() {
    if (!this.seals.trade && this.markets().length >= 2 && this.stats.merchantGoods >= MERCHANT_SEAL_TARGET) {
      this.seals.trade = true;
      this.log("荷馬車が二つの市を結び、島内商いの章印が灯りました。", "success");
    }
  }

  updatePopulation() {
    if (this.day % 60 !== 0 || this.hungerFreeDays < 20) return;
    const candidates = this.buildings.filter((building) => building.household && building.household.members < 8);
    if (!candidates.length) return;
    const building = this.rng.pick(candidates);
    building.household.members += 1;
    this.log(`${building.household.name}に子どもが生まれました。`, "story", building);
  }

  updateHungerClock() {
    const households = this.buildings.filter((building) => building.household).map((building) => building.household);
    if (!households.length) return;
    const fedRatio = households.filter((household) => !household.hungryToday).length / households.length;
    const meanHunger = households.reduce((sum, household) => sum + household.hunger, 0) / households.length;
    if (fedRatio >= 0.75 && meanHunger < 2) this.hungerFreeDays += 1;
    else this.hungerFreeDays = 0;
  }

  get residentTradeShare() {
    const total = this.stats.residentTradeValue + this.stats.companyTradeValue;
    return total <= EPS ? 0 : this.stats.residentTradeValue / total;
  }

  get independenceStatus() {
    return {
      charters: this.seals.life && this.seals.timber && this.seals.trade,
      wellbeing: this.hungerFreeDays >= 30,
      commerce: this.residentTradeShare >= 0.55,
      ready: this.seals.life && this.seals.timber && this.seals.trade && this.hungerFreeDays >= 30 && this.residentTradeShare >= 0.55
    };
  }

  declareIndependence() {
    if (!this.independenceStatus.ready) return false;
    this.won = true;
    this.pausedForDecision = true;
    this.log("会社旗を降ろし、潮路の島は独立を宣言しました。", "victory");
    return true;
  }

  continueAfterVictory() {
    if (!this.won) return false;
    this.continuedAfterWin = true;
    this.pausedForDecision = false;
    return true;
  }

  requestEmergencyCredit() {
    if (this.emergencyCreditUsed || this.funds > 90) return false;
    const amount = 180;
    this.funds += amount;
    this.ledger.moneyExternalNet += amount;
    this.emergencyCreditUsed = true;
    this.log("本土へ緊急信用を要請しました。180金、次の島史に残ります。", "warning");
    return true;
  }

  log(text, kind = "info", point = null) {
    this.events.unshift({ day: this.day, text, kind, point: point ? { x: point.x, y: point.y } : null });
    this.events = this.events.slice(0, 60);
  }

  currentGoods() {
    const total = emptyGoods();
    for (const building of this.buildings) {
      addGoods(total, building.inventory);
      if (building.merchant) addGoods(total, building.merchant.inventory);
    }
    for (const shipment of this.shipments) total[shipment.good] += shipment.quantity;
    return total;
  }

  currentMoney() {
    let total = this.funds;
    for (const building of this.buildings) {
      total += building.household?.cash || 0;
      total += building.warehouse?.cash || 0;
    }
    for (const household of this.waitingSettlers) total += household.cash;
    for (const item of this.constructions) total += item.escrow;
    for (const project of this.roadProjects) total += project.escrow;
    for (const shipment of this.shipments) total += shipment.payment;
    return total;
  }

  assertInvariants() {
    const actualGoods = this.currentGoods();
    for (const good of GOOD_KEYS) {
      const expected = this.ledger.goodsInitial[good]
        + this.ledger.produced[good]
        + this.ledger.imported[good]
        - this.ledger.consumed[good]
        - this.ledger.spoiled[good]
        - this.ledger.exported[good]
        - this.ledger.constructionUsed[good];
      if (Math.abs(actualGoods[good] - expected) > 1e-5) {
        throw new Error(`goods invariant ${good}: actual=${actualGoods[good]} expected=${expected}`);
      }
      if (actualGoods[good] < -EPS) throw new Error(`negative total goods ${good}`);
    }
    const expectedMoney = this.ledger.moneyInitial + this.ledger.moneyExternalNet;
    const actualMoney = this.currentMoney();
    if (Math.abs(actualMoney - expectedMoney) > 1e-5) {
      throw new Error(`money invariant actual=${actualMoney} expected=${expectedMoney}`);
    }
    for (const building of this.buildings) {
      if (building.household && building.household.cash < -EPS) throw new Error(`negative household cash ${building.id}`);
      if (building.warehouse && building.warehouse.cash < -EPS) throw new Error(`negative warehouse cash ${building.id}`);
      for (const good of GOOD_KEYS) {
        if (building.inventory[good] < -EPS) throw new Error(`negative building inventory ${building.id} ${good}`);
        if (building.merchant && building.merchant.inventory[good] < -EPS) throw new Error(`negative merchant inventory ${building.id} ${good}`);
      }
    }
    if (this.shipments.some((shipment) => shipment.buyer === shipment.seller)) throw new Error("self trade shipment");
    return true;
  }

  toJSON() {
    return {
      schema: SAVE_SCHEMA,
      seed: this.seed,
      day: this.day,
      funds: this.funds,
      roads: [...this.roads],
      buildings: this.buildings,
      constructions: this.constructions,
      roadProjects: this.roadProjects,
      shipments: this.shipments,
      waitingSettlers: this.waitingSettlers,
      events: this.events,
      counters: {
        nextBuildingId: this.nextBuildingId,
        nextHouseholdId: this.nextHouseholdId,
        nextShipmentId: this.nextShipmentId,
        nextConstructionId: this.nextConstructionId
      },
      shipNumber: this.shipNumber,
      nextShipDay: this.nextShipDay,
      shipAtSea: this.shipAtSea,
      activeContract: this.activeContract,
      pendingContractChoices: this.pendingContractChoices,
      lastShipResult: this.lastShipResult,
      seals: this.seals,
      unlockTier: this.unlockTier,
      pausedForDecision: this.pausedForDecision,
      won: this.won,
      continuedAfterWin: this.continuedAfterWin,
      emergencyCreditUsed: this.emergencyCreditUsed,
      hungerFreeDays: this.hungerFreeDays,
      stats: this.stats,
      ledger: this.ledger,
      rngState: this.rng.state
    };
  }

  static fromJSON(data) {
    if (!data || data.schema !== SAVE_SCHEMA) throw new Error("対応していないセーブデータです");
    const world = new World({ seed: data.seed, empty: true });
    world.day = data.day;
    world.funds = data.funds;
    world.roads = new Set(data.roads);
    world.buildings = data.buildings;
    world.constructions = data.constructions;
    world.roadProjects = data.roadProjects;
    world.shipments = data.shipments;
    world.waitingSettlers = data.waitingSettlers;
    world.events = data.events;
    Object.assign(world, data.counters);
    world.shipNumber = data.shipNumber;
    world.nextShipDay = data.nextShipDay;
    world.shipAtSea = data.shipAtSea;
    world.activeContract = data.activeContract;
    world.pendingContractChoices = data.pendingContractChoices;
    world.lastShipResult = data.lastShipResult;
    world.seals = data.seals;
    world.unlockTier = data.unlockTier;
    world.pausedForDecision = data.pausedForDecision;
    world.won = data.won;
    world.continuedAfterWin = data.continuedAfterWin;
    world.emergencyCreditUsed = data.emergencyCreditUsed;
    world.hungerFreeDays = data.hungerFreeDays;
    world.stats = data.stats;
    world.ledger = data.ledger;
    world.rng.state = data.rngState;
    world.assertInvariants();
    return world;
  }

  summary() {
    return {
      day: this.day,
      funds: round(this.funds, 1),
      population: this.population,
      markets: this.markets().length,
      shipments: this.shipments.length,
      waiting: this.waitingSettlers.length,
      seals: { ...this.seals },
      hungerFreeDays: this.hungerFreeDays,
      residentTradeShare: round(this.residentTradeShare, 3),
      merchantGoods: round(this.stats.merchantGoods, 1),
      independence: this.independenceStatus
    };
  }
}

export function makeRoad(world, points) {
  for (const point of points) world.roads.add(keyOf(point.x, point.y));
}

export function runDays(world, days, onDecision = null) {
  for (let i = 0; i < days; i += 1) {
    if (world.pausedForDecision) {
      if (!onDecision) break;
      onDecision(world);
    }
    world.tickDay();
  }
  return world;
}

export { MAP_W, MAP_H };
