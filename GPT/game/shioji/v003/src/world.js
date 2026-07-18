import {
  BUILDINGS, DAY_SECONDS, FIXED, GOODS, GRID, ROAD_COST, SPEEDS, UPGRADE_REQUIREMENTS,
} from './config.js';
import { connectedRoads, keyOf, line8, perimeterTiles, roadPath } from './pathfinding.js';

const SECTIONS = ['input', 'output', 'storage', 'construction', 'inbound', 'outbound'];
const SHIP_IMPORT_PRICE = { food: 1, tools: 4, stone: 2 };
const SHIP_EXPORT_PRICE = { boards: 12 };

function emptyInventory() {
  return Object.fromEntries(SECTIONS.map(section => [section, {}]));
}

function sumObject(value) {
  return Object.values(value || {}).reduce((total, amount) => total + amount, 0);
}

function seededNoise(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export class World {
  constructor({ seedTown = true } = {}) {
    this.width = GRID.width;
    this.height = GRID.height;
    this.terrain = this.makeTerrain();
    this.roads = new Set();
    this.buildings = [];
    this.occupied = new Map();
    this.shipments = [];
    this.events = [];
    this.ledger = [];
    this.moneyFloats = [];
    this.funds = 1200;
    this.day = 1;
    this.dayAccumulator = 0;
    this.speedIndex = 1;
    this.chapterStage = 0;
    this.opened = false;
    this.nextId = 1;
    this.dispatchTimer = 0;
    this.stats = {
      produced: {}, delivered: {}, deliveredTo: {}, exported: {}, imported: {},
      cartTrips: 0, roadsBuilt: 0, buildingsBuilt: 0,
    };
    this.ship = {
      state: 'docked', progress: 1, timer: 0, idle: 0, nextDay: 12,
      manifest: [], cargo: {}, initial: true, bellRung: false,
    };
    if (seedTown) this.seedTown();
  }

  makeTerrain() {
    const terrain = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        const edge = x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1;
        const clippedCorner = x + y < 4 || x + y > 38 || x - y > 20 || y - x > 17;
        let kind = edge || clippedCorner ? 'water' : 'grass';
        if (kind === 'grass' && x >= 15 && x <= 22 && y >= 3 && y <= 10 && seededNoise(x, y) > 0.12) kind = 'forest';
        if (kind === 'grass' && x >= 17 && y >= 12 && seededNoise(x, y) > 0.7) kind = 'rock';
        if (x >= 16 && x <= 18 && y >= 7 && y <= 9) kind = 'forest';
        row.push({ kind, variant: Math.floor(seededNoise(x + 41, y + 19) * 4) });
      }
      terrain.push(row);
    }
    return terrain;
  }

  seedTown() {
    const initialRoads = [
      [6, 15], [7, 15], [8, 15], [9, 15], [10, 14], [11, 13], [12, 12], [13, 11],
    ];
    for (const [x, y] of initialRoads) this.roads.add(keyOf(x, y));
    this.createBuilding('port', FIXED.port.x, FIXED.port.y, { fixed: true, entrance: FIXED.port.entrance, grade: FIXED.port.grade });
    this.createBuilding('market', FIXED.market.x, FIXED.market.y, { fixed: true, entrance: FIXED.market.entrance, grade: FIXED.market.grade });
    const market = this.getBuildingByType('market');
    market.inventory.input.food = 18;
    this.record(0, '会社支度金', 'charter', FIXED.port.entrance, { silent: true });
  }

  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  terrainAt(x, y) {
    return this.inside(x, y) ? this.terrain[y][x] : { kind: 'water', variant: 0 };
  }

  isLand(x, y) {
    return this.inside(x, y) && this.terrainAt(x, y).kind !== 'water';
  }

  createBuilding(type, x, y, options = {}) {
    const def = BUILDINGS[type];
    if (!def) throw new Error(`unknown building: ${type}`);
    const building = {
      id: `b${this.nextId++}`, type, x, y, w: def.w, h: def.h,
      entrance: options.entrance || null,
      fixed: Boolean(options.fixed), grade: options.grade || 0,
      inventory: emptyInventory(), progress: 0, buildProgress: 0,
      upgradeRequested: false, siteActivity: 0, placedAt: this.day,
    };
    if (type === 'port') {
      building.caps = {
        inbound: { food: 80, tools: 40, stone: 70 },
        outbound: { boards: 80 },
      };
    } else if (type === 'market') {
      building.caps = { input: { food: 42 } };
    } else if (type === 'warehouse') {
      building.caps = { storage: { ...def.storageCaps } };
    } else {
      building.caps = {
        input: { ...(def.inputCaps || {}) },
        output: { ...(def.outputCaps || {}) },
        construction: { boards: 40, tools: 20, stone: 30 },
      };
    }
    this.buildings.push(building);
    for (let py = y; py < y + def.h; py++) {
      for (let px = x; px < x + def.w; px++) this.occupied.set(keyOf(px, py), building.id);
    }
    return building;
  }

  getBuilding(id) {
    return this.buildings.find(building => building.id === id) || null;
  }

  getBuildingByType(type) {
    return this.buildings.find(building => building.type === type) || null;
  }

  buildingsByType(type) {
    return this.buildings.filter(building => building.type === type);
  }

  buildingAt(x, y) {
    const id = this.occupied.get(keyOf(x, y));
    return id ? this.getBuilding(id) : null;
  }

  footprintTiles(type, x, y) {
    const def = BUILDINGS[type];
    const out = [];
    for (let py = y; py < y + def.h; py++) {
      for (let px = x; px < x + def.w; px++) out.push({ x: px, y: py });
    }
    return out;
  }

  connectedRoadSet() {
    return connectedRoads(this.roads, FIXED.port.entrance);
  }

  findEntrance(type, x, y) {
    const def = BUILDINGS[type];
    const connected = this.connectedRoadSet();
    const candidates = perimeterTiles(x, y, def.w, def.h)
      .filter(tile => connected.has(keyOf(tile.x, tile.y)))
      .sort((a, b) => {
        const da = Math.hypot(a.x - FIXED.port.entrance.x, a.y - FIXED.port.entrance.y);
        const db = Math.hypot(b.x - FIXED.port.entrance.x, b.y - FIXED.port.entrance.y);
        return da - db;
      });
    return candidates[0] || null;
  }

  canPlace(type, x, y) {
    const def = BUILDINGS[type];
    if (!def || def.category === 'fixed') return { ok: false, reason: 'ここには建てられません。' };
    const tiles = this.footprintTiles(type, x, y);
    if (tiles.some(tile => !this.isLand(tile.x, tile.y))) return { ok: false, reason: '建物全体が陸地へ収まる場所を選んでください。' };
    if (tiles.some(tile => this.roads.has(keyOf(tile.x, tile.y)))) return { ok: false, reason: '道の上には建てられません。' };
    if (tiles.some(tile => this.occupied.has(keyOf(tile.x, tile.y)))) return { ok: false, reason: '別の建物と重なっています。' };
    if (def.forestMin) {
      const forest = tiles.filter(tile => this.terrainAt(tile.x, tile.y).kind === 'forest').length;
      if (forest < def.forestMin) return { ok: false, reason: `森が足りません（${forest}/${def.forestMin}区画）。` };
    }
    const entrance = this.findEntrance(type, x, y);
    if (!entrance) return { ok: false, reason: '完成した道に接する入口が必要です。' };
    if (this.funds < def.cost) return { ok: false, reason: `会社資金が${def.cost - this.funds}不足しています。` };
    return { ok: true, reason: '建設できます。', entrance };
  }

  addBuilding(type, x, y) {
    const check = this.canPlace(type, x, y);
    if (!check.ok) return check;
    const building = this.createBuilding(type, x, y, { entrance: check.entrance, grade: 0 });
    this.record(-BUILDINGS[type].cost, `${BUILDINGS[type].name}を開設`, 'construction', building.entrance);
    this.stats.buildingsBuilt++;
    this.emit('building_added', { buildingId: building.id, type });
    return { ok: true, building };
  }

  roadPreview(start, end) {
    if (!start || !end) return { ok: false, reason: '始点と終点を選んでください。', cells: [] };
    const connected = this.connectedRoadSet();
    if (!connected.has(keyOf(start.x, start.y))) return { ok: false, reason: '町や港へ繋がる道から延ばしてください。', cells: [] };
    const cells = line8([start.x, start.y], [end.x, end.y]).map(([x, y]) => ({ x, y }));
    const invalid = cells.find(cell => !this.isLand(cell.x, cell.y) || this.occupied.has(keyOf(cell.x, cell.y)));
    if (invalid) return { ok: false, reason: '水辺や建物を横切らない経路を選んでください。', cells };
    const newCells = cells.filter(cell => !this.roads.has(keyOf(cell.x, cell.y)));
    if (!newCells.length) return { ok: false, reason: 'すでに完成している道です。', cells, newCells };
    const cost = newCells.length * ROAD_COST;
    if (this.funds < cost) return { ok: false, reason: `会社資金が${cost - this.funds}不足しています。`, cells, newCells, cost };
    return { ok: true, reason: `${newCells.length}区画の道を通せます。`, cells, newCells, cost };
  }

  addRoadLine(start, end) {
    const preview = this.roadPreview(start, end);
    if (!preview.ok) return preview;
    for (const cell of preview.newCells) this.roads.add(keyOf(cell.x, cell.y));
    this.stats.roadsBuilt += preview.newCells.length;
    const location = preview.newCells[Math.floor(preview.newCells.length / 2)];
    this.record(-preview.cost, `道普請 ${preview.newCells.length}区画`, 'road', location);
    this.emit('road_added', { cells: preview.newCells, cost: preview.cost });
    return preview;
  }

  sectionAmount(building, section, good) {
    return Number(building?.inventory?.[section]?.[good] || 0);
  }

  sectionCapacity(building, section, good) {
    const base = building?.caps?.[section]?.[good] || 0;
    if (!base) return 0;
    if (section === 'input' || section === 'output' || section === 'storage') return Math.round(base * (1 + building.grade * 0.2));
    return base;
  }

  addInventory(building, section, good, amount) {
    building.inventory[section][good] = Math.max(0, this.sectionAmount(building, section, good) + amount);
  }

  incomingAmount(buildingId, section, good) {
    return this.shipments
      .filter(shipment => shipment.targetId === buildingId && shipment.targetSection === section && shipment.good === good)
      .reduce((total, shipment) => total + shipment.amount, 0);
  }

  record(amount, reason, kind, location, options = {}) {
    this.funds += amount;
    const row = { id: `l${this.nextId++}`, day: Math.floor(this.day), amount, reason, kind };
    this.ledger.unshift(row);
    this.ledger = this.ledger.slice(0, 80);
    if (!options.silent && amount !== 0) {
      this.moneyFloats.push({ x: location.x, y: location.y, amount, life: 2.5, maxLife: 2.5 });
      this.emit('money', { ...row, location });
    }
    return row;
  }

  recentMoney(days = 7) {
    const cutoff = Math.floor(this.day) - days;
    return this.ledger.filter(row => row.day >= cutoff).reduce((out, row) => {
      if (row.amount > 0) out.income += row.amount;
      if (row.amount < 0) out.expense += -row.amount;
      return out;
    }, { income: 0, expense: 0 });
  }

  emit(type, detail = {}) {
    this.events.push({ type, detail, at: performance?.now?.() || Date.now() });
  }

  drainEvents() {
    return this.events.splice(0);
  }

  setSpeed(index) {
    this.speedIndex = Math.max(0, Math.min(SPEEDS.length - 1, index));
  }

  get speed() {
    return SPEEDS[this.speedIndex];
  }

  beginCharter() {
    if (this.opened) return;
    this.opened = true;
    this.ship.state = 'unloading';
    this.ship.timer = 0;
    this.ship.manifest = [
      { good: 'food', amount: 24 },
      { good: 'tools', amount: 8 },
      { good: 'stone', amount: 12 },
    ];
    this.emit('charter_begun');
  }

  requestUpgrade(buildingId) {
    const building = this.getBuilding(buildingId);
    const requirements = this.nextUpgradeRequirements(building);
    if (!building || !requirements) return { ok: false, reason: 'これ以上の増築はまだありません。' };
    building.upgradeRequested = true;
    this.emit('upgrade_requested', { buildingId });
    return { ok: true, building };
  }

  nextUpgradeRequirements(building) {
    if (!building) return null;
    return UPGRADE_REQUIREMENTS[building.type]?.[building.grade + 1] || null;
  }

  missingUpgrade(building) {
    const requirements = this.nextUpgradeRequirements(building);
    if (!requirements) return {};
    const missing = {};
    for (const [good, need] of Object.entries(requirements)) {
      missing[good] = Math.max(0, need - this.sectionAmount(building, 'construction', good) - this.incomingAmount(building.id, 'construction', good));
    }
    return missing;
  }

  update(dt) {
    const safeDt = Math.min(0.1, Math.max(0, dt));
    if (!this.opened) return;
    const simSeconds = safeDt * this.speed;
    const gameDays = simSeconds / DAY_SECONDS;
    this.dayAccumulator += gameDays;
    this.day += gameDays;
    while (this.dayAccumulator >= 1) {
      this.dayAccumulator -= 1;
      this.onNewDay();
    }

    this.updateBuildings(gameDays);
    this.dispatchTimer += simSeconds;
    if (this.dispatchTimer >= 0.38) {
      this.dispatchTimer %= 0.38;
      this.dispatchOnce();
    }
    this.updateShipments(safeDt);
    this.updateShip(safeDt);
    for (const float of this.moneyFloats) float.life -= safeDt;
    this.moneyFloats = this.moneyFloats.filter(float => float.life > 0);
    for (const building of this.buildings) building.siteActivity = Math.max(0, building.siteActivity - safeDt);
  }

  onNewDay() {
    const market = this.getBuildingByType('market');
    if (this.sectionAmount(market, 'input', 'food') >= 1) {
      this.addInventory(market, 'input', 'food', -1);
      if (Math.floor(this.day) % 3 === 0) this.record(3, '朝市の口銭', 'market', market.entrance);
    }
    if (this.funds < -500) this.emit('funds_warning', { funds: this.funds });
  }

  updateBuildings(gameDays) {
    for (const building of this.buildings) {
      if (building.upgradeRequested) this.updateUpgrade(building, gameDays);
      if (building.buildProgress > 0) continue;
      const def = BUILDINGS[building.type];
      if (!def.output) continue;
      building.progress += gameDays * (1 + building.grade * 0.24);
      if (building.progress < def.interval) continue;

      const outGood = def.output.good;
      const outAmount = def.output.base + def.output.perGrade * building.grade;
      const outSpace = this.sectionCapacity(building, 'output', outGood) - this.sectionAmount(building, 'output', outGood);
      if (outSpace < outAmount) {
        building.progress = def.interval;
        continue;
      }
      if (def.input) {
        if (this.sectionAmount(building, 'input', def.input.good) < def.input.amount) {
          building.progress = def.interval;
          continue;
        }
        this.addInventory(building, 'input', def.input.good, -def.input.amount);
      }
      building.progress -= def.interval;
      this.addInventory(building, 'output', outGood, outAmount);
      this.stats.produced[outGood] = (this.stats.produced[outGood] || 0) + outAmount;
      building.siteActivity = 1.3;
      this.emit('produced', { buildingId: building.id, good: outGood, amount: outAmount });
    }
  }

  updateUpgrade(building, gameDays) {
    const requirements = this.nextUpgradeRequirements(building);
    if (!requirements) {
      building.upgradeRequested = false;
      return;
    }
    const ready = Object.entries(requirements).every(([good, amount]) => this.sectionAmount(building, 'construction', good) >= amount);
    if (!ready) return;
    building.buildProgress += gameDays;
    building.siteActivity = 1;
    if (building.buildProgress < 1.6) return;
    for (const [good, amount] of Object.entries(requirements)) this.addInventory(building, 'construction', good, -amount);
    building.grade++;
    building.buildProgress = 0;
    building.upgradeRequested = false;
    this.emit('grade_up', { buildingId: building.id, grade: building.grade });
  }

  dispatchOnce() {
    for (const building of this.buildings) {
      if (!building.upgradeRequested) continue;
      const missing = this.missingUpgrade(building);
      for (const [good, amount] of Object.entries(missing)) {
        if (amount <= 0) continue;
        const own = this.sectionAmount(building, 'output', good);
        if (own > 0) {
          const moved = Math.min(own, amount, 4);
          this.addInventory(building, 'output', good, -moved);
          this.addInventory(building, 'construction', good, moved);
          building.siteActivity = 1.2;
          this.emit('local_material', { buildingId: building.id, good, amount: moved });
          continue;
        }
        this.findAndShip(good, building, 'construction', Math.min(4, amount));
      }
    }

    for (const woodshop of this.buildingsByType('woodshop')) {
      const current = this.sectionAmount(woodshop, 'input', 'log') + this.incomingAmount(woodshop.id, 'input', 'log');
      if (current < 12) this.findAndShip('log', woodshop, 'input', Math.min(8, 18 - current));
    }

    const market = this.getBuildingByType('market');
    const marketFood = this.sectionAmount(market, 'input', 'food') + this.incomingAmount(market.id, 'input', 'food');
    if (marketFood < 20) this.findAndShip('food', market, 'input', Math.min(6, 28 - marketFood));

    if (this.chapterStage >= 6) {
      const port = this.getBuildingByType('port');
      const portBoards = this.sectionAmount(port, 'outbound', 'boards') + this.incomingAmount(port.id, 'outbound', 'boards');
      if (portBoards < this.sectionCapacity(port, 'outbound', 'boards')) {
        this.findAndShip('boards', port, 'outbound', Math.min(6, this.sectionCapacity(port, 'outbound', 'boards') - portBoards));
      }
    }

    if (this.chapterStage >= 8) {
      for (const warehouse of this.buildingsByType('warehouse')) {
        for (const good of ['log', 'boards']) {
          const stored = this.sectionAmount(warehouse, 'storage', good) + this.incomingAmount(warehouse.id, 'storage', good);
          const capacity = this.sectionCapacity(warehouse, 'storage', good);
          if (stored >= capacity * 0.72) continue;
          const overflowingProducer = this.sourceSectionsFor(good).some(source => {
            if (source.section !== 'output' || source.building.id === warehouse.id) return false;
            const sourceCapacity = this.sectionCapacity(source.building, 'output', good);
            return sourceCapacity > 0 && source.amount >= sourceCapacity * 0.62;
          });
          if (overflowingProducer) this.findAndShip(good, warehouse, 'storage', Math.min(8, capacity - stored));
        }
      }
    }
  }

  sourceSectionsFor(good) {
    const sources = [];
    for (const building of this.buildings) {
      for (const section of ['output', 'inbound', 'storage']) {
        const amount = this.sectionAmount(building, section, good);
        if (amount > 0) sources.push({ building, section, amount });
      }
    }
    return sources;
  }

  findAndShip(good, target, targetSection, requested) {
    if (requested <= 0) return false;
    const incoming = this.incomingAmount(target.id, targetSection, good);
    const capacity = this.sectionCapacity(target, targetSection, good);
    const targetAmount = this.sectionAmount(target, targetSection, good);
    const space = Math.max(0, capacity - targetAmount - incoming);
    if (space <= 0) return false;

    const candidates = this.sourceSectionsFor(good)
      .filter(source => source.building.id !== target.id)
      .filter(source => !this.shipments.some(shipment => shipment.sourceId === source.building.id && shipment.targetId === target.id && shipment.good === good))
      .map(source => ({ ...source, path: roadPath(this.roads, source.building.entrance, target.entrance) }))
      .filter(source => source.path)
      .sort((a, b) => a.path.length - b.path.length);
    const source = candidates[0];
    if (!source) return false;
    const amount = Math.min(requested, space, source.amount, 8);
    return Boolean(this.createShipment(source.building, source.section, target, targetSection, good, amount, source.path));
  }

  createShipment(source, sourceSection, target, targetSection, good, amount, knownPath = null) {
    const path = knownPath || roadPath(this.roads, source.entrance, target.entrance);
    if (!path || amount <= 0 || this.sectionAmount(source, sourceSection, good) < amount) return null;
    this.addInventory(source, sourceSection, good, -amount);
    const shipment = {
      id: `s${this.nextId++}`, sourceId: source.id, targetId: target.id,
      sourceSection, targetSection, good, amount, path,
      phase: 'loading', timer: 0.58, segment: 0, segmentT: 0,
      x: path[0].x, y: path[0].y,
    };
    this.shipments.push(shipment);
    this.emit('shipment_started', { shipmentId: shipment.id, good, amount, sourceId: source.id, targetId: target.id });
    return shipment;
  }

  updateShipments(dt) {
    const motionDt = dt * Math.min(this.speed, 1.55);
    if (motionDt <= 0) return;
    for (const shipment of this.shipments) {
      if (shipment.phase === 'loading' || shipment.phase === 'unloading') {
        shipment.timer -= motionDt;
        if (shipment.timer > 0) continue;
        if (shipment.phase === 'loading') {
          shipment.phase = 'moving';
          continue;
        }
        const target = this.getBuilding(shipment.targetId);
        if (target) {
          this.addInventory(target, shipment.targetSection, shipment.good, shipment.amount);
          target.siteActivity = 1.2;
          this.stats.cartTrips++;
          this.stats.delivered[shipment.good] = (this.stats.delivered[shipment.good] || 0) + shipment.amount;
          const deliveryKey = `${target.type}:${shipment.good}`;
          this.stats.deliveredTo[deliveryKey] = (this.stats.deliveredTo[deliveryKey] || 0) + shipment.amount;
          this.emit('shipment_arrived', { shipmentId: shipment.id, good: shipment.good, amount: shipment.amount, targetId: target.id });
        }
        shipment.phase = 'done';
        continue;
      }

      if (shipment.phase !== 'moving') continue;
      let distanceLeft = motionDt * 2.25;
      while (distanceLeft > 0 && shipment.segment < shipment.path.length - 1) {
        const from = shipment.path[shipment.segment];
        const to = shipment.path[shipment.segment + 1];
        const length = Math.hypot(to.x - from.x, to.y - from.y);
        const remaining = length * (1 - shipment.segmentT);
        if (distanceLeft < remaining) {
          shipment.segmentT += distanceLeft / length;
          distanceLeft = 0;
        } else {
          distanceLeft -= remaining;
          shipment.segment++;
          shipment.segmentT = 0;
        }
      }
      const from = shipment.path[Math.min(shipment.segment, shipment.path.length - 1)];
      const to = shipment.path[Math.min(shipment.segment + 1, shipment.path.length - 1)];
      shipment.x = from.x + (to.x - from.x) * shipment.segmentT;
      shipment.y = from.y + (to.y - from.y) * shipment.segmentT;
      if (shipment.segment >= shipment.path.length - 1) {
        shipment.phase = 'unloading';
        shipment.timer = 0.62;
      }
    }
    this.shipments = this.shipments.filter(shipment => shipment.phase !== 'done');
  }

  updateShip(dt) {
    if (this.speed === 0) return;
    const motionDt = dt * Math.min(this.speed, 1.7);
    const port = this.getBuildingByType('port');
    const ship = this.ship;
    if (ship.state === 'away') {
      if (this.day >= ship.nextDay) {
        ship.state = 'arriving';
        ship.progress = 0;
        ship.timer = 0;
        ship.bellRung = true;
        ship.manifest = [
          { good: 'food', amount: 14 },
          { good: 'tools', amount: 4 },
          { good: 'stone', amount: 8 },
        ];
        ship.initial = false;
        this.emit('ship_arriving', { days: 0 });
      }
      return;
    }
    if (ship.state === 'arriving') {
      ship.progress = Math.min(1, ship.progress + motionDt / 3.2);
      if (ship.progress >= 1) {
        ship.state = 'unloading';
        ship.timer = 0.5;
        this.emit('ship_docked');
      }
      return;
    }
    if (ship.state === 'unloading') {
      ship.timer -= motionDt;
      if (ship.timer > 0) return;
      const item = ship.manifest.find(entry => entry.amount > 0);
      if (!item) {
        ship.state = 'loading';
        ship.timer = 0.55;
        ship.idle = 0;
        return;
      }
      const space = this.sectionCapacity(port, 'inbound', item.good) - this.sectionAmount(port, 'inbound', item.good);
      if (space <= 0) {
        ship.timer = 0.8;
        return;
      }
      const amount = Math.min(4, item.amount, space);
      item.amount -= amount;
      this.addInventory(port, 'inbound', item.good, amount);
      this.stats.imported[item.good] = (this.stats.imported[item.good] || 0) + amount;
      if (!ship.initial) this.record(-amount * SHIP_IMPORT_PRICE[item.good], `本国から${GOODS[item.good].name}を輸入`, 'import', port.entrance);
      port.siteActivity = 1.2;
      ship.timer = 0.72;
      this.emit('ship_unloaded', { good: item.good, amount, free: ship.initial });
      return;
    }
    if (ship.state === 'loading') {
      ship.timer -= motionDt;
      if (ship.timer > 0) return;
      const boards = this.sectionAmount(port, 'outbound', 'boards');
      if (boards > 0) {
        const amount = Math.min(4, boards);
        this.addInventory(port, 'outbound', 'boards', -amount);
        ship.cargo.boards = (ship.cargo.boards || 0) + amount;
        this.stats.exported.boards = (this.stats.exported.boards || 0) + amount;
        this.record(amount * SHIP_EXPORT_PRICE.boards, `木製品${amount}を本国へ輸出`, 'export', port.entrance);
        port.siteActivity = 1.2;
        ship.timer = 0.72;
        ship.idle = 0;
        this.emit('ship_loaded', { good: 'boards', amount });
        return;
      }
      if (this.incomingAmount(port.id, 'outbound', 'boards') > 0) {
        ship.idle = 0;
        ship.timer = 0.35;
        return;
      }
      ship.idle += motionDt;
      ship.timer = 0.35;
      if (ship.idle >= 4.2) {
        ship.state = 'departing';
        ship.progress = 0;
        this.emit('ship_departing', { cargo: { ...ship.cargo } });
      }
      return;
    }
    if (ship.state === 'departing') {
      ship.progress = Math.min(1, ship.progress + motionDt / 3.2);
      if (ship.progress >= 1) {
        ship.state = 'away';
        ship.nextDay = ship.initial ? Math.max(12, Math.ceil(this.day + 6)) : Math.ceil(this.day + 16);
        ship.cargo = {};
        ship.initial = false;
        ship.bellRung = false;
        this.emit('ship_departed', { nextDay: ship.nextDay });
      }
    }
  }

  daysToShip() {
    if (this.ship.state !== 'away') return 0;
    return Math.max(0, Math.ceil(this.ship.nextDay - this.day));
  }

  setChapterStage(stage) {
    this.chapterStage = Math.max(this.chapterStage, stage);
  }

  tutorialComplete(stage, state = {}) {
    const logger = this.getBuildingByType('logger');
    const woodshop = this.getBuildingByType('woodshop');
    const port = this.getBuildingByType('port');
    switch (stage) {
      case 0: return this.connectedRoadSet().has(keyOf(FIXED.forestGate.x, FIXED.forestGate.y));
      case 1: return Boolean(logger);
      case 2: return (this.stats.produced.log || 0) > 0;
      case 3: return Boolean(woodshop);
      case 4: return (this.stats.deliveredTo['woodshop:log'] || 0) > 0;
      case 5: return Boolean(woodshop && woodshop.grade >= 1);
      case 6: return this.sectionAmount(port, 'outbound', 'boards') > 0 || (this.stats.exported.boards || 0) > 0;
      case 7: return (this.stats.exported.boards || 0) > 0;
      case 8: return Boolean(this.getBuildingByType('warehouse'));
      case 9: return Boolean(this.getBuildingByType('warehouse') && state.warehouseViewed);
      default: return false;
    }
  }

  statusOf(building) {
    if (!building) return { label: '不明', tone: 'warn', detail: '' };
    if (building.upgradeRequested) {
      const requirements = this.nextUpgradeRequirements(building) || {};
      const missing = Object.entries(requirements)
        .filter(([good, amount]) => this.sectionAmount(building, 'construction', good) < amount)
        .map(([good, amount]) => `${GOODS[good].name} ${this.sectionAmount(building, 'construction', good)}/${amount}`);
      if (missing.length) return { label: '増築材待ち', tone: 'wait', detail: missing.join('・') };
      return { label: '増築中', tone: 'build', detail: `工事 ${Math.min(100, Math.round(building.buildProgress / 1.6 * 100))}%` };
    }
    if (building.type === 'logger') {
      const good = 'log';
      const amount = this.sectionAmount(building, 'output', good);
      const cap = this.sectionCapacity(building, 'output', good);
      if (cap - amount < BUILDINGS.logger.output.base) return { label: '搬出待ち', tone: 'warn', detail: '丸太の出荷場が満杯です。荷車か道を確認してください。' };
      return { label: '伐採中', tone: 'good', detail: '丸太を出荷場へ積んでいます。' };
    }
    if (building.type === 'woodshop') {
      const logs = this.sectionAmount(building, 'input', 'log');
      const out = this.sectionAmount(building, 'output', 'boards');
      const cap = this.sectionCapacity(building, 'output', 'boards');
      if (logs < BUILDINGS.woodshop.input.amount) return { label: '丸太待ち', tone: 'wait', detail: '道路側の入荷棚が空です。木こりからの荷車を待っています。' };
      if (cap - out < BUILDINGS.woodshop.output.base) return { label: '搬出待ち', tone: 'warn', detail: '木製品の出荷場が満杯です。港か倉庫への道を確認してください。' };
      return { label: '加工中', tone: 'good', detail: '丸太を木製品へ加工しています。' };
    }
    if (building.type === 'warehouse') {
      const used = sumObject(building.inventory.storage);
      const cap = Object.entries(building.caps.storage).reduce((sum, [good]) => sum + this.sectionCapacity(building, 'storage', good), 0);
      return used >= cap * 0.9
        ? { label: '満庫', tone: 'warn', detail: `保管 ${Math.round(used)}/${cap}` }
        : { label: '受入中', tone: 'good', detail: `保管 ${Math.round(used)}/${cap}` };
    }
    if (building.type === 'market') {
      const food = this.sectionAmount(building, 'input', 'food');
      return food < 5
        ? { label: '食料不足', tone: 'warn', detail: '港からの食料荷車を待っています。' }
        : { label: '朝市開催中', tone: 'good', detail: `食料は約${Math.floor(food)}日分あります。` };
    }
    if (building.type === 'port') {
      const labels = {
        docked: '第一便停泊中', unloading: '荷揚げ中', loading: '船積み中',
        departing: '出港中', arriving: '入港中', away: '次便待ち',
      };
      return { label: labels[this.ship.state] || '港湾稼働中', tone: 'good', detail: `輸出ヤード 木製品${this.sectionAmount(building, 'outbound', 'boards')}` };
    }
    return { label: '稼働中', tone: 'good', detail: '' };
  }

  debugAdd(type, x, y) {
    const entrance = this.findEntrance(type, x, y);
    return this.createBuilding(type, x, y, { entrance, grade: 0 });
  }
}
