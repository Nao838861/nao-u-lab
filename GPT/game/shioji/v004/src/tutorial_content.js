function tileKind(model, x, y) {
  return model.terrain[y]?.[x]?.kind ?? null;
}

function roadTouchesForest(model, key) {
  const [x, y] = key.split(',').map(Number);
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if ((dx !== 0 || dy !== 0) && tileKind(model, x + dx, y + dy) === 'forest') return true;
    }
  }
  return false;
}

function portRoadComponent(model) {
  const roads = new Set(model.roadKeys);
  const ports = model.buildings.filter(building => building.roles?.includes('port'));
  const queue = ports
    .map(building => building.entrance)
    .filter(Boolean)
    .filter(point => roads.has(`${point.x},${point.y}`));
  const connected = new Set();
  while (queue.length) {
    const point = queue.shift();
    const key = `${point.x},${point.y}`;
    if (connected.has(key)) continue;
    connected.add(key);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if ((!dx && !dy) || !roads.has(`${point.x + dx},${point.y + dy}`)) continue;
        queue.push({ x: point.x + dx, y: point.y + dy });
      }
    }
  }
  return connected;
}

function newHouseholdEvent(events) {
  return events.find(event => event.type === 'arrival' && event.reason === 'new_household');
}

function pantryAmount(household, goods) {
  return household.pantry?.find(row => row.goods === goods)?.amount ?? 0;
}

function loggerLogStock(model) {
  return model.households
    .filter(household => household.job === 'logger')
    .reduce((total, household) => total + pantryAmount(household, 'log'), 0);
}

function marketBuilding(model) {
  return model.buildings.find(building => building.roles?.includes('market')) ?? null;
}

function woodshopHouseholds(model) {
  return model.households.filter(household => household.job === 'woodshop');
}

function stallAmount(model, goods) {
  return model.stalls
    .filter(stall => stall.goods === goods)
    .reduce((total, stall) => total + (stall.qty ?? 0), 0);
}

function logTransaction(events) {
  return events.find(event => event.type === 'transaction' && event.goods === 'log') ?? null;
}

function firstOrderFacts(state) {
  return state?.letters?.find(letter => letter.id === 'first-order-offer')?.facts ?? null;
}

function orderHandlingEvent(events, state) {
  const facts = firstOrderFacts(state);
  return events.find(event => event.type === 'handling' && event.direction === 'export'
    && (!facts || event.goods === facts.goods)) ?? null;
}

function orderCompletedEvent(events) {
  return events.find(event => event.type === 'notice'
    && event.message?.includes('★注文を納めた')) ?? null;
}

function orderLedgerRevenue(model, goods) {
  return model.companyLedger
    .filter(row => row.reason === `本国注文へ${goods}を出荷`)
    .reduce((total, row) => total + row.amount, 0);
}

function foodImportOutflow(model) {
  const prefixes = new Set(FOOD_GOODS);
  return model.companyLedger.reduce((total, row) => {
    const goods = row.reason?.match(/^([^の]+)の本土仕入$/)?.[1];
    return goods && prefixes.has(goods) && row.amount < 0 ? total - row.amount : total;
  }, 0);
}

function portConnectedToMarket(model) {
  const port = model.buildings.find(building => building.roles?.includes('port'));
  if (!port) return false;
  const row = model.roadConnection?.buildings?.find(entry => entry.id === port.id);
  return Boolean(row?.connected);
}

const FOOD_GOODS = ['fish', 'veg', 'wheat', 'pres', 'pick', 'meat'];

const GOODS_LABELS = Object.freeze({
  tools: '道具', char: '木炭', salt: '塩', pres: '保存食', pick: '漬物',
  oil: '菜種油', cloth: '布', stone: '石材', log: '丸太', fish: '魚',
  veg: '野菜', wheat: '麦', meat: '肉', iron: '鉄',
});

function goodsLabel(goods) {
  return GOODS_LABELS[goods] ?? goods;
}

function warehouseBuilding(model) {
  return model.buildings.find(building => building.type === 'warehouse') ?? null;
}

function warehouseConnected(model) {
  const warehouse = warehouseBuilding(model);
  if (!warehouse) return false;
  const row = model.roadConnection?.buildings?.find(entry => entry.id === warehouse.id);
  return Boolean(row?.connected);
}

function marketFoodShelfAmount(model) {
  const market = marketBuilding(model);
  if (!market) return 0;
  return (market.shelves ?? [])
    .filter(row => FOOD_GOODS.includes(row.goods))
    .reduce((total, row) => total + (row.amount ?? 0), 0);
}

// 徒歩距離の見積り(§2.5.1近似: 道0.6/森1.4/他1.0/水∞・8方向・対角×1.4)。
// 獣道(0.85)はsnapshotに乗らないため考慮しない=距離をやや多めに見積る控えめな警告になる。
export function estimateWalkLen(model, from, to) {
  if (!from || !to) return Infinity;
  const blocked = new Set();
  for (const building of model.buildings) {
    for (let dy = 0; dy < (building.height ?? building.h ?? 0); dy += 1) {
      for (let dx = 0; dx < (building.width ?? building.w ?? 0); dx += 1) {
        blocked.add(`${building.x + dx},${building.y + dy}`);
      }
    }
  }
  const roads = new Set(model.roadKeys);
  const enterCost = (x, y) => {
    if (x < 0 || y < 0 || x >= model.width || y >= model.height) return Infinity;
    const kind = tileKind(model, x, y);
    if (kind === 'water') return Infinity;
    const key = `${x},${y}`;
    if (blocked.has(key) && !(x === to.x && y === to.y)) return Infinity;
    if (roads.has(key)) return 0.6;
    return kind === 'forest' ? 1.4 : 1.0;
  };
  const dist = new Map([[`${from.x},${from.y}`, 0]]);
  const queue = [{ x: from.x, y: from.y, cost: 0 }];
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift();
    if (current.x === to.x && current.y === to.y) return current.cost;
    if (current.cost > (dist.get(`${current.x},${current.y}`) ?? Infinity)) continue;
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = current.x + dx;
        const ny = current.y + dy;
        const base = enterCost(nx, ny);
        if (!Number.isFinite(base)) continue;
        const step = dx && dy ? base * 1.4 : base;
        const next = current.cost + step;
        const key = `${nx},${ny}`;
        if (next >= (dist.get(key) ?? Infinity)) continue;
        dist.set(key, next);
        queue.push({ x: nx, y: ny, cost: next });
      }
    }
  }
  return Infinity;
}

export function islandFoodRunwayDays(model) {
  const pantryFood = model.households.reduce((total, household) => total
    + (household.pantry ?? []).filter(row => FOOD_GOODS.includes(row.goods))
      .reduce((sum, row) => sum + row.amount, 0), 0);
  const stallFood = model.stalls
    .filter(stall => FOOD_GOODS.includes(stall.goods))
    .reduce((total, stall) => total + (stall.qty ?? 0), 0);
  const total = pantryFood + stallFood + marketFoodShelfAmount(model);
  return total / Math.max(1, model.population);
}

function farHouseholdFromMarket(model) {
  const market = marketBuilding(model);
  if (!market?.entrance) return null;
  for (const household of model.households) {
    const home = model.buildings.find(building => building.id === household.buildingId);
    if (!home?.entrance) continue;
    const walk = estimateWalkLen(model, home.entrance, market.entrance);
    if (walk > 14) return { household, home, walk };
  }
  return null;
}

export const LOGGER_TRIP_WARNING_TICKS = 24;
export const LOGGER_TRIP_RECOVERY_TICKS = 4;
export const FOOD_IMPORT_EMA_TARGET = 0.6;
const LOGGER_MULTIPLIER_RECOVERY = 0.1;
const FOOD_PRODUCTION_EMA_MIN = 0.25;
const FOOD_PRICE_CHANGE_MIN = 0.01;
const FOOD_IMPORT_EMA_CHANGE_MIN = 0.05;

function loggerTripObservation(model) {
  const household = model.households.find(row => row.job === 'logger'
    && row.tookMarketTripToday && row.marketTripTicks > 0);
  if (!household) return null;
  return {
    householdId: household.id,
    tripTicks: household.marketTripTicks,
    multiplier: household.productionMultiplier,
  };
}

function loggerWarningFacts(state) {
  return state?.letters?.find(letter => letter.id === 'logger-trip-warning')?.facts ?? null;
}

function goalCompleted(state, id) {
  return Boolean(state?.completedGoals?.includes(id));
}

function starvationReport(events) {
  const deaths = events.filter(event => event.type === 'death');
  if (!deaths.length) return null;
  const narrated = deaths.find(event => event.message?.includes('餓えで亡くなった'))
    ?? deaths.find(event => event.message?.startsWith('☠'))
    ?? deaths[0];
  const peopleLost = deaths.reduce((total, event) => total + (event.count ?? 0), 0);
  return {
    events: deaths.length,
    peopleLost,
    message: narrated.message ?? null,
    householdId: narrated.householdId ?? null,
  };
}

function bankruptcyReport(events) {
  const event = events.find(candidate => candidate.type === 'notice'
    && (candidate.message?.includes('★破産') || candidate.message?.includes('最終通告')));
  if (!event) return null;
  const values = event.message?.match(/債務([\d.]+)>限度([\d.]+)/);
  return {
    message: event.message,
    debt: values ? Number(values[1]) : null,
    limit: values ? Number(values[2]) : null,
  };
}

function foodFlowMetrics(model) {
  return {
    importEma: FOOD_GOODS.reduce((total, goods) => (
      total + (model.flowEma?.[goods]?.imp ?? 0)
    ), 0),
    productionEma: FOOD_GOODS.reduce((total, goods) => (
      total + (model.flowEma?.[goods]?.prod ?? 0)
    ), 0),
    fishPrice: model.marketPrices?.fish ?? 0,
    vegPrice: model.marketPrices?.veg ?? 0,
    outflow: foodImportOutflow(model),
  };
}

function foodDependenceFacts(state) {
  return state?.letters?.find(letter => letter.id === 'food-dependence-report')?.facts ?? null;
}

function foodBuildingStatus(model) {
  const market = marketBuilding(model);
  const fisher = model.buildings.find(building => ['fisher', 'fisher2'].includes(building.type));
  const veg = model.buildings.find(building => building.type === 'veg');
  const fisherWalk = market && fisher ? estimateWalkLen(model, fisher.entrance, market.entrance) : Infinity;
  const vegWalk = market && veg ? estimateWalkLen(model, veg.entrance, market.entrance) : Infinity;
  return {
    fisher: Boolean(fisher),
    veg: Boolean(veg),
    fisherWalk,
    vegWalk,
    near: fisherWalk <= 14 && vegWalk <= 14,
  };
}

function islandFoodChange(model, state) {
  const before = foodDependenceFacts(state);
  if (!before) return null;
  const current = foodFlowMetrics(model);
  const priceChanged = Math.abs(current.fishPrice - before.fishPrice) >= FOOD_PRICE_CHANGE_MIN
    || Math.abs(current.vegPrice - before.vegPrice) >= FOOD_PRICE_CHANGE_MIN;
  const importChanged = Math.abs(current.importEma - before.importEma) >= FOOD_IMPORT_EMA_CHANGE_MIN;
  return current.productionEma >= FOOD_PRODUCTION_EMA_MIN && priceChanged && importChanged
    ? { before, current, priceChanged, importChanged }
    : null;
}

function loggerTripRecovered(model, state) {
  const current = loggerTripObservation(model);
  const before = loggerWarningFacts(state);
  if (!current || !before) return null;
  const ticksRecovered = before.tripTicks - current.tripTicks;
  const multiplierRecovered = current.multiplier - before.multiplier;
  return ticksRecovered >= LOGGER_TRIP_RECOVERY_TICKS
    && multiplierRecovered >= LOGGER_MULTIPLIER_RECOVERY
    ? { before, current, ticksRecovered, multiplierRecovered }
    : null;
}

export const TUTORIAL_GOALS = Object.freeze([
  Object.freeze({
    id: 'first-road-and-logger',
    chapter: '第一章・最初の一荷',
    title: '森の際へ道を敷き、木こりを置く',
    evaluate({ model }) {
      const portRoads = portRoadComponent(model);
      const forestRoads = [...portRoads].filter(key => roadTouchesForest(model, key)).length;
      const loggers = model.buildings.filter(building => building.type === 'logger').length;
      const done = Number(forestRoads > 0) + Number(loggers > 0);
      return {
        complete: done === 2,
        progress: { done, total: 2 },
        detail: `港から森の際へ届いた道 ${forestRoads}区画 / 木こり ${loggers}棟`,
        evidence: { connectedRoads: portRoads.size, forestRoads, loggers },
      };
    },
  }),
  Object.freeze({
    id: 'first-settlers-arrive',
    chapter: '第一章・最初の一荷',
    title: '最初の入植世帯を迎える',
    evaluate({ model }) {
      const households = model.households.filter(household => household.job === 'logger').length;
      return {
        complete: households > 0,
        progress: { done: Number(households > 0), total: 1 },
        detail: `木こりの入植世帯 ${households}世帯 / 島の人口 ${model.population}人`,
        evidence: { households, population: model.population },
      };
    },
  }),
  Object.freeze({
    id: 'market-for-logs',
    chapter: '第一章・最初の一荷',
    title: '市場を置き、丸太の売り場を開く',
    evaluate({ model }) {
      const market = marketBuilding(model);
      const logs = loggerLogStock(model);
      return {
        complete: Boolean(market),
        progress: { done: Number(Boolean(market)), total: 1 },
        detail: `市場 ${market ? 1 : 0}棟 / 木こりの手元の丸太 ${logs.toFixed(1)}荷`,
        evidence: { market: Boolean(market), logs },
      };
    },
  }),
  Object.freeze({
    id: 'connect-market-to-port',
    chapter: '第一章・最初の一荷',
    title: '港と市場を道で結ぶ',
    evaluate({ model }) {
      const connected = portConnectedToMarket(model);
      return {
        complete: connected,
        progress: { done: Number(connected), total: 1 },
        detail: connected ? '港と市場が道で結ばれました' : '港の入口は市場の道路成分の外です',
        evidence: { connected },
      };
    },
  }),
  Object.freeze({
    id: 'first-woodshop',
    chapter: '第一章・最初の一荷',
    title: '木工房を置き、道具づくりを始める',
    evaluate({ model }) {
      const woodshops = model.buildings.filter(building => building.type === 'woodshop').length;
      const settled = woodshopHouseholds(model).length;
      return {
        complete: woodshops > 0,
        progress: { done: Number(woodshops > 0), total: 1 },
        detail: `木工房 ${woodshops}棟 / 入居 ${settled}世帯`,
        evidence: { woodshops, settled },
      };
    },
  }),
  Object.freeze({
    id: 'accept-first-order',
    chapter: '第一章・最初の一荷',
    title: '本国の注文を受ける',
    evaluate({ model }) {
      const accepted = Boolean(model.activeOrder);
      const offer = model.orderOffer;
      const detail = accepted
        ? `受諾済み: ${goodsLabel(model.activeOrder.g)} ${model.activeOrder.qty}荷`
        : offer
          ? `注文状が届いています: ${goodsLabel(offer.g)} ${offer.qty}荷(${offer.due}日目まで)`
          : '道具づくりを続ければ、本国が島の品に目を留めます';
      return {
        complete: accepted,
        progress: { done: Number(accepted), total: 1 },
        detail,
        evidence: { accepted, offer: Boolean(offer) },
      };
    },
  }),
  Object.freeze({
    id: 'warehouse-for-order',
    chapter: '第一章・最初の一荷',
    title: '蔵を置き、道で結ぶ',
    evaluate({ model }) {
      const warehouse = warehouseBuilding(model);
      const connected = warehouseConnected(model);
      const done = Number(Boolean(warehouse)) + Number(connected);
      return {
        complete: Boolean(warehouse) && connected,
        progress: { done, total: 2 },
        detail: warehouse
          ? (connected ? '蔵が道で結ばれました' : '蔵はありますが道の外です')
          : '納品には会社の蔵が要ります',
        evidence: { warehouse: Boolean(warehouse), connected },
      };
    },
  }),
  Object.freeze({
    id: 'order-procurement-target',
    chapter: '第一章・最初の一荷',
    title: '買上げ目標を定め、調達を命じる',
    evaluate({ model }) {
      const order = model.activeOrder;
      const target = order ? (model.stockTargets?.[order.g] ?? 0) : 0;
      const done = Boolean(order) && target > 0;
      return {
        complete: done,
        progress: { done: Number(done), total: 1 },
        detail: order
          ? (done
            ? `${goodsLabel(order.g)}の買上げ目標 ${target}荷`
            : '受諾だけでは会社の銀は動きません。買上げ目標のご下命を')
          : '注文の受諾が先です',
        evidence: { target },
      };
    },
  }),
  Object.freeze({
    id: 'first-order-procurement',
    chapter: '第一章・最初の一荷',
    title: '最初の買付品が蔵へ届くのを見届ける',
    evaluate({ model }) {
      const order = model.activeOrder;
      const stocked = order ? (model.companyStock?.[order.g] ?? 0) : 0;
      return {
        complete: stocked > 0,
        progress: { done: Number(stocked > 0), total: 1 },
        detail: order
          ? `蔵の${goodsLabel(order.g)} ${stocked.toFixed(1)}荷 / 注文 ${order.qty}荷`
          : '注文の受諾が先です',
        evidence: { stocked, goods: order?.g ?? null },
      };
    },
  }),
  Object.freeze({
    id: 'complete-first-order',
    chapter: '第一章・最初の一荷',
    title: '注文の船積みと船出を見届ける',
    evaluate({ model, events }) {
      const completed = Boolean(orderCompletedEvent(events));
      const exportHandling = events.filter(event => (
        event.type === 'handling' && event.direction === 'export'
      ));
      return {
        complete: completed,
        progress: { done: Number(completed), total: 1 },
        detail: completed
          ? '最後の一荷を積み、本国注文を納めました'
          : `このtickの船積み ${exportHandling.reduce((sum, event) => sum + event.qty, 0).toFixed(1)}荷`,
        evidence: { completed, exportHandling: exportHandling.length, ledgerRows: model.companyLedger.length },
      };
    },
  }),
  Object.freeze({
    id: 'close-first-chapter',
    chapter: '第一章・最初の一荷',
    title: '第一章の報告書を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-one-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '輸出収入と食料仕入を並べた報告書が届きました' : '注文の完遂報告を待っています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'improve-logger-route',
    chapter: '橋・木こりの二日',
    title: '木こりの市場往復を道で短くする',
    evaluate({ model, state }) {
      const current = loggerTripObservation(model);
      const warning = loggerWarningFacts(state);
      const recovered = loggerTripRecovered(model, state);
      const alreadyGood = Boolean(current && !warning
        && current.tripTicks <= LOGGER_TRIP_WARNING_TICKS);
      const complete = Boolean(recovered) || alreadyGood;
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: current
          ? `実往復 ${current.tripTicks.toFixed(1)}tick / 生産 ${(current.multiplier * 100).toFixed(1)}%`
          : '木こりが次に市場を往復する日を観測中です',
        evidence: {
          tripTicks: current?.tripTicks ?? null,
          multiplier: current?.multiplier ?? null,
          warned: Boolean(warning),
          recovered: Boolean(recovered),
          alreadyGood,
        },
      };
    },
  }),
  Object.freeze({
    id: 'place-island-food',
    chapter: '第二章・島の食卓',
    title: '漁家と菜園を市場近くの適地へ置く',
    evaluate({ model }) {
      const status = foodBuildingStatus(model);
      const done = Number(status.fisher) + Number(status.veg) + Number(status.near);
      return {
        complete: status.fisher && status.veg && status.near,
        progress: { done, total: 3 },
        detail: status.fisher && status.veg
          ? `市場まで 漁家${Number.isFinite(status.fisherWalk) ? status.fisherWalk.toFixed(1) : '—'} / 菜園${Number.isFinite(status.vegWalk) ? status.vegWalk.toFixed(1) : '—'}`
          : `漁家 ${Number(status.fisher)}棟 / 菜園 ${Number(status.veg)}棟（漁家は水際へ）`,
        evidence: status,
      };
    },
  }),
  Object.freeze({
    id: 'observe-island-food-change',
    chapter: '第二章・島の食卓',
    title: '島の食料が市場を変えるのを見届ける',
    evaluate({ model, state }) {
      const change = islandFoodChange(model, state);
      const metrics = foodFlowMetrics(model);
      return {
        complete: Boolean(change),
        progress: { done: Number(Boolean(change)), total: 1 },
        detail: `食料生産EMA ${metrics.productionEma.toFixed(2)} / 輸入EMA ${metrics.importEma.toFixed(2)}`,
        evidence: { ...metrics, changed: Boolean(change) },
      };
    },
  }),
  Object.freeze({
    id: 'reduce-food-imports',
    chapter: '第二章・島の食卓',
    title: '食料輸入EMAを0.60未満へ下げる',
    evaluate({ model }) {
      const metrics = foodFlowMetrics(model);
      const complete = metrics.productionEma >= FOOD_PRODUCTION_EMA_MIN
        && metrics.importEma < FOOD_IMPORT_EMA_TARGET;
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: `食料輸入EMA ${metrics.importEma.toFixed(3)}（目標 < ${FOOD_IMPORT_EMA_TARGET.toFixed(2)}） / 島内生産 ${metrics.productionEma.toFixed(2)}`,
        evidence: metrics,
      };
    },
  }),
  Object.freeze({
    id: 'close-second-chapter',
    chapter: '第二章・島の食卓',
    title: '第二章の報告書を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-two-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '食料自給と本土流出の報告書が届きました' : '輸入EMAの低下を確認しています',
        evidence: { issued },
      };
    },
  }),
]);

function pendingTutorialGoal(state) {
  const goal = TUTORIAL_GOALS.find(candidate => !goalCompleted(state, candidate.id));
  return goal ? { id: goal.id, chapter: goal.chapter, title: goal.title } : null;
}

export const TUTORIAL_LETTERS = Object.freeze([
  Object.freeze({
    id: 'tutorial-starvation-consequence',
    source: 'event',
    when({ events }) {
      return Boolean(starvationReport(events));
    },
    render({ model, events, state }) {
      const report = starvationReport(events);
      const currentGoal = pendingTutorialGoal(state);
      const runwayDays = islandFoodRunwayDays(model);
      return {
        kicker: '島況・飢餓報告',
        title: '食料を待つあいだにも、人は失われます',
        summary: `死亡・離散事象 ${report.events}件・人口 ${model.population}人・食料 ${runwayDays.toFixed(1)}日分`,
        facts: { ...report, population: model.population, runwayDays, currentGoal },
        body: [
          `${model.day}日目。観測された死亡・離散事象はこの報告で${report.events}件、人数が確定できる事象では${report.peopleLost}人です。現在人口は${model.population}人、島内で見える食料は人口1人あたり${runwayDays.toFixed(1)}日分です。${report.message ? `実記録は「${report.message}」。` : ''}`,
          `教程は食料を足さず、亡くなった人も戻しません。${currentGoal ? `未完了の目標「${currentGoal.title}」はそのままです。` : ''}市場と食料の流れを作るか、この帰結を抱えたまま別の道をお選びください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'tutorial-bankruptcy-consequence',
    source: 'event',
    when({ events }) {
      return Boolean(bankruptcyReport(events));
    },
    render({ model, events, state }) {
      const report = bankruptcyReport(events);
      const currentGoal = pendingTutorialGoal(state);
      const debtText = report.debt === null ? '—' : report.debt.toFixed(0);
      const limitText = report.limit === null ? '—' : report.limit.toFixed(0);
      return {
        kicker: '会社・最終通告',
        title: '帳簿は、教程の外でも閉じません',
        summary: `債務 ${debtText}・信用限度 ${limitText}・会社残高 ${model.companyMoney.toFixed(1)}`,
        facts: { ...report, companyMoney: model.companyMoney, currentGoal },
        body: [
          `${model.day}日目。会社の実記録は「${report.message}」。会社残高は${model.companyMoney.toFixed(1)}、記録された債務は${debtText}、信用限度は${limitText}です。`,
          `教程は支出を取り消さず、帳簿を巻き戻しません。${currentGoal ? `未完了の目標「${currentGoal.title}」も消えていません。` : ''}この島は同じ規則のまま続きます。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'arrival-report',
    source: 'snapshot',
    when({ model }) {
      return model.buildings.some(building => building.roles?.includes('port'));
    },
    render({ model }) {
      const ports = model.buildings.filter(building => building.roles?.includes('port')).length;
      return {
        kicker: '着任時の島況',
        title: '島の現況を報告します',
        summary: `港 ${ports}棟・人口 ${model.population}人・道路 ${model.roadKeys.length}区画`,
        body: [
          `${model.day}日目。盤上では港が${ports}棟稼働し、人口は${model.population}人、完成道路は${model.roadKeys.length}区画です。`,
          'まず森の際まで道を敷き、木こりの区画を指定してください。島の変化は、実際の建物と出来事に沿ってお知らせします。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-settlers-report',
    source: 'event',
    when({ model, events }) {
      const event = newHouseholdEvent(events);
      return Boolean(event && model.households.some(household => (
        household.id === event.householdId && household.job === 'logger'
      )));
    },
    render({ model, events }) {
      const event = newHouseholdEvent(events);
      const household = model.households.find(candidate => candidate.id === event.householdId);
      return {
        kicker: '入植船の着岸報告',
        title: '最初の世帯が島へ入りました',
        summary: `${event.day}日目・${household.members}人の世帯・島の人口 ${model.population}人`,
        body: [
          `${event.day}日目。入植船から${household.members}人の世帯が降り、木こりの区画へ入りました。島の人口は${model.population}人です。`,
          '人が来れば、仕事と暮らしが動き始めます。まずは丸太が積み上がる様子を見届けましょう。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'logs-pile-no-market',
    source: 'snapshot',
    when({ model }) {
      return !marketBuilding(model) && loggerLogStock(model) >= 10;
    },
    render({ model }) {
      const logs = loggerLogStock(model);
      return {
        kicker: '丸太の山からの催促',
        title: '売る場所がありません',
        summary: `木こりの手元に丸太 ${logs.toFixed(1)}荷・市場 0棟`,
        body: [
          `${model.day}日目。木こりの手元には丸太が${logs.toFixed(1)}荷積み上がりましたが、島にはまだ売り買いの場がありません。`,
          '市場の区画をお決めください。港の近くの平地が良いでしょう——のちに会社の荷車が市場と港を行き来します。入植者が持参した食料が尽きる前に、買い物のできる場を。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'market-distance-warning',
    source: 'snapshot',
    when({ model }) {
      return Boolean(farHouseholdFromMarket(model));
    },
    render({ model }) {
      const far = farHouseholdFromMarket(model);
      return {
        kicker: '道のりの懸念',
        title: '市場まで遠すぎる家があります',
        summary: `${far.household.job}の家から市場まで、道なりの見積りでおよそ${far.walk.toFixed(1)}`,
        body: [
          `市場まで、${far.household.job}の家から道なりの見積りでおよそ${far.walk.toFixed(1)}。14を超えると、一日のうちに市場まで歩いて戻ることができません。`,
          'この家の者は買い物に出られず、いずれ食べる物に困ります。道を敷いて近づけるか、建て直しをご検討ください。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'market-needs-port-road',
    source: 'snapshot',
    when({ model }) {
      return Boolean(marketBuilding(model)) && !portConnectedToMarket(model);
    },
    render({ model }) {
      return {
        kicker: '空の輸入棚',
        title: '本土の食料が市場に届きません',
        summary: `${model.day}日目・市場は開きましたが港と道が結ばれていません`,
        body: [
          `${model.day}日目。市場は開きましたが、本土から届く食料は港のヤードに降りたまま——会社の荷車は道のない所を通れません。`,
          '港と市場を道でお結びください。結ばれるまで市場の輸入棚は空のままで、入植者たちは持参の食料を食べ尽くせば飢えます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-import-food',
    source: 'snapshot',
    when({ model }) {
      return marketFoodShelfAmount(model) > 0;
    },
    render({ model }) {
      const amount = marketFoodShelfAmount(model);
      return {
        kicker: '本土からの荷',
        title: '本土の食料が市場に並びました',
        summary: `${model.day}日目・市場の食料棚 ${amount.toFixed(1)}荷`,
        body: [
          `${model.day}日目。港に降りた本土の食料が荷車で運ばれ、市場の棚に${amount.toFixed(1)}荷並びました。これで入植者たちは銀さえあれば食べていけます。`,
          'ただし本土の食料は買うたびに島の銀が海を渡って出ていきます。いずれ、島の食卓は島で賄う日が要りましょう。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-log-stall',
    source: 'snapshot',
    when({ model }) {
      return stallAmount(model, 'log') > 0;
    },
    render({ model }) {
      const amount = stallAmount(model, 'log');
      return {
        kicker: '市の立った日',
        title: '市場に丸太が並びました',
        summary: `${model.day}日目・屋台の丸太 ${amount.toFixed(1)}荷`,
        body: [
          `${model.day}日目。木こりが市場まで歩き、屋台に丸太を${amount.toFixed(1)}荷並べました。`,
          '値付けは彼ら自身が行い、買い手がつけば商いになります。次は丸太の買い手——木工房の区画をお決めください。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-tools',
    source: 'snapshot',
    when({ model }) {
      return woodshopHouseholds(model)
        .some(household => pantryAmount(household, 'tools') > 0);
    },
    render({ model, state }) {
      const household = woodshopHouseholds(model)
        .find(candidate => pantryAmount(candidate, 'tools') > 0);
      const tools = pantryAmount(household, 'tools');
      const tradedBefore = Boolean(state?.letters?.some(letter => letter.id === 'first-log-trade'));
      const provenance = tradedBefore
        ? '工房の棚の丸太——持参分と市場で買い足した分——から'
        : '入植のとき船で持参した丸太から';
      return {
        kicker: '工房の初仕事',
        title: '最初の道具が挽かれました',
        summary: `${model.day}日目・道具 ${tools.toFixed(1)}荷`,
        body: [
          `${model.day}日目。木工房が${provenance}、最初の道具を${tools.toFixed(1)}荷仕上げました。`,
          '棚の丸太が減れば、工房は市場で買い足します。物が育ち、銀が回り始めています。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'aid-suggestion',
    source: 'snapshot',
    when({ model }) {
      return model.population > 0 && model.day > 10
        && islandFoodRunwayDays(model) < 14
        && (model.mainlandAid?.requests ?? 0) === 0;
    },
    render({ model }) {
      const runway = islandFoodRunwayDays(model);
      const aid = model.mainlandAid ?? { nextQty: 240 };
      return {
        kicker: '秘書の進言',
        title: '食料の残りが心もとなくなっています',
        summary: `島の食料はおよそ${runway.toFixed(0)}日分`,
        body: [
          `${model.day}日目。島の食料を数えると、およそ${runway.toFixed(0)}日分です。まだ切れてはいませんが、船の往来には日数がかかります——少し早めにお知らせしています。`,
          `会社の帳場から本国へ食料支援を要請できます(次の支援は麦${aid.nextQty}荷)。ただし、要請を重ねるほど本国の心象を損ね、支援の量は減っていきます。実際に要請するかどうかは、総督のご判断です。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-order-offer',
    source: 'snapshot',
    when({ model }) {
      return Boolean(model.orderOffer);
    },
    render({ model }) {
      const offer = model.orderOffer;
      const unit = (offer.price * 1.25 * 10).toFixed(1);
      return {
        kicker: '本国からの書状',
        title: `${goodsLabel(offer.g)}の注文が届きました`,
        summary: `${goodsLabel(offer.g)} ${offer.qty}荷・決済${unit}デナリ/荷・${offer.due}日目まで`,
        facts: { goods: offer.g, qty: offer.qty, price: offer.price, due: offer.due },
        body: [
          `${model.day}日目。本国が島の${goodsLabel(offer.g)}に目を留め、${offer.qty}荷の注文状が届きました。決済は1荷あたり${unit}デナリ、納期は${offer.due}日目です。`,
          '受けるかどうかは総督のご判断です。お受けになるなら、会社が市場で買い付け、船で本国へ納めます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'order-needs-warehouse',
    source: 'snapshot',
    when({ model }) {
      return Boolean(model.activeOrder) && !warehouseBuilding(model);
    },
    render({ model }) {
      const order = model.activeOrder;
      return {
        kicker: '受諾の続き',
        title: '納めるには蔵が要ります',
        summary: `${goodsLabel(order.g)} ${order.qty}荷の調達には会社の蔵が必要です`,
        body: [
          `${model.day}日目。${goodsLabel(order.g)}${order.qty}荷の注文をお受けになりました。会社の荷車は市場で買い付けた品を一度蔵へ納め、そこから港へ運びます。`,
          'いまの島には蔵がありません。市場と港を結ぶ道の沿いに、蔵の区画をお決めください。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'warehouse-unconnected',
    source: 'snapshot',
    when({ model }) {
      return Boolean(warehouseBuilding(model)) && !warehouseConnected(model);
    },
    render({ model }) {
      return {
        kicker: '道の切れ目',
        title: '蔵まで道が繋がっていません',
        summary: `${model.day}日目・蔵の入口は道路の外です`,
        body: [
          `${model.day}日目。蔵は建ちましたが、入口が市場からの道と繋がっていません。会社の荷車は道のない所を通れず、買い付けた品を運び込めません。`,
          '蔵の入口まで道をお延ばしください。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'order-needs-target',
    source: 'snapshot',
    when({ model }) {
      const order = model.activeOrder;
      return Boolean(order) && Boolean(warehouseBuilding(model)) && warehouseConnected(model)
        && (model.stockTargets?.[order.g] ?? 0) <= 0;
    },
    render({ model }) {
      const order = model.activeOrder;
      return {
        kicker: '会社の銀は総督のもの',
        title: '買付のご下命を',
        summary: `${goodsLabel(order.g)}の買上げ目標が0のままです`,
        body: [
          `${model.day}日目。蔵と道は整いましたが、会社の買付はまだ動いていません。注文の受諾だけでは会社の銀は動かず、いくらまで買い集めるかは総督のご下命によります。`,
          `会社の帳場で${goodsLabel(order.g)}の買上げ目標をお定めください。注文は${order.qty}荷、目標をその数に合わせるのが定石です。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-company-procurement',
    source: 'snapshot',
    when({ model }) {
      const order = model.activeOrder;
      return Boolean(order) && (model.companyStock?.[order.g] ?? 0) > 0;
    },
    render({ model }) {
      const order = model.activeOrder;
      const stocked = model.companyStock[order.g];
      return {
        kicker: '調達はじまる',
        title: '会社の荷車が蔵へ運び始めました',
        summary: `${model.day}日目・蔵の${goodsLabel(order.g)} ${stocked.toFixed(1)}荷/${order.qty}荷`,
        body: [
          `${model.day}日目。会社が市場の屋台から${goodsLabel(order.g)}を買い付け、荷車が蔵へ${stocked.toFixed(1)}荷を納めました。注文の${order.qty}荷まで、買い付けは続きます。`,
          '作った者に銀が入り、島の品が本国へ向かう仕度が進んでいます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-order-handling',
    source: 'event',
    when({ events, state }) {
      return Boolean(orderHandlingEvent(events, state));
    },
    render({ model, events, state }) {
      const handling = orderHandlingEvent(events, state);
      const facts = firstOrderFacts(state);
      return {
        kicker: '港の荷役報告',
        title: '注文の品を一荷ずつ船へ',
        summary: `${handling.day}日目・${goodsLabel(handling.goods)} ${handling.qty.toFixed(1)}荷を船積み`,
        body: [
          `${handling.day}日目。蔵から港へ届いた${goodsLabel(handling.goods)}を、このtickは${handling.qty.toFixed(1)}荷だけ船へ移しました。荷役は一度に消えず、実際に一荷ずつ進みます。`,
          `注文は${facts?.qty ?? '—'}荷。最後の荷を積み終えるまで、港のヤードと船をご覧ください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-order-complete',
    source: 'event',
    when({ events }) {
      return Boolean(orderCompletedEvent(events));
    },
    render({ model, events, state }) {
      const completed = orderCompletedEvent(events);
      const facts = firstOrderFacts(state);
      const revenue = orderLedgerRevenue(model, facts.goods);
      const base = facts.qty * facts.price;
      const premium = revenue - base;
      return {
        kicker: '第一便の完遂報告',
        title: '注文の船が本国へ発ちました',
        summary: `${completed.eventDay ?? completed.day}日目・売上 ${revenue.toFixed(1)}・達成上乗せ ${premium.toFixed(1)}`,
        facts: { goods: facts.goods, qty: facts.qty, revenue, premium },
        body: [
          `${completed.eventDay ?? completed.day}日目。最後の一荷が船へ移り、${goodsLabel(facts.goods)}${facts.qty}荷の注文を納めました。会社の実台帳に、本国注文売上として${revenue.toFixed(1)}が記帳されています。`,
          `このうち通常単価分は${base.toFixed(1)}、完遂による上乗せは${premium.toFixed(1)}です。市場で作り手へ銀を払い、道と蔵と港を経て、島の品が初めて本国の売上になりました。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-one-close',
    source: 'event',
    when({ events }) {
      return Boolean(orderCompletedEvent(events));
    },
    render({ model, state }) {
      const completion = state?.letters?.find(letter => letter.id === 'first-order-complete');
      const revenue = completion?.facts?.revenue ?? 0;
      const foodOutflow = foodImportOutflow(model);
      const aidRequests = model.mainlandAid?.requests ?? 0;
      return {
        kicker: '第一章・収支報告',
        title: '最初の一荷、その向こう側',
        summary: `注文売上 ${revenue.toFixed(1)} / 食料の本土仕入 ${foodOutflow.toFixed(1)}`,
        facts: { revenue, foodOutflow, aidRequests },
        body: [
          `最初の注文で、会社の実台帳には売上${revenue.toFixed(1)}が入りました。同じ時点までに、本土から買った食料の仕入は累計${foodOutflow.toFixed(1)}です。`,
          `食料支援は${aidRequests}回要請しましたが、贈与なのでこの仕入額には含まれません。輸出で銀を得る道は通りました。次は、島の食卓を本土任せにせず、島の中で作る番です。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'logger-trip-warning',
    source: 'snapshot',
    when({ model, state }) {
      const trip = loggerTripObservation(model);
      return goalCompleted(state, 'close-first-chapter')
        && Boolean(trip && trip.tripTicks > LOGGER_TRIP_WARNING_TICKS);
    },
    render({ model }) {
      const trip = loggerTripObservation(model);
      const lost = (1 - trip.multiplier) * 100;
      return {
        kicker: '橋・木こりの二日',
        title: '買い出しが伐採の一日を削っています',
        summary: `実往復 ${trip.tripTicks.toFixed(1)}tick・生産減 ${(lost).toFixed(1)}%`,
        facts: { ...trip, lost },
        body: [
          `${model.day}日目。木こりの市場往復は実測で${trip.tripTicks.toFixed(1)}tick。買い出しに一日を取られ、伐採の生産倍率は${(trip.multiplier * 100).toFixed(1)}%、つまり${lost.toFixed(1)}%減っています。`,
          '家の入口から市場まで、なるべく続けて道をお敷きください。次の買い出しの日に、同じ値をもう一度測ります。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'logger-road-recovered',
    source: 'snapshot',
    when({ model, state }) {
      return goalCompleted(state, 'close-first-chapter')
        && Boolean(loggerTripRecovered(model, state));
    },
    render({ model, state }) {
      const recovery = loggerTripRecovered(model, state);
      return {
        kicker: '道の効き目',
        title: '木こりの仕事時間が戻りました',
        summary: `${recovery.before.tripTicks.toFixed(1)}→${recovery.current.tripTicks.toFixed(1)}tick・生産${(recovery.current.multiplier * 100).toFixed(1)}%`,
        facts: recovery,
        body: [
          `${model.day}日目。新しい道の後、市場往復は${recovery.before.tripTicks.toFixed(1)}tickから${recovery.current.tripTicks.toFixed(1)}tickへ短くなりました。`,
          `伐採の生産倍率は${(recovery.before.multiplier * 100).toFixed(1)}%から${(recovery.current.multiplier * 100).toFixed(1)}%へ回復しています。距離は時間であり、道は働く時間を取り戻します。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'logger-road-already-good',
    source: 'snapshot',
    when({ model, state }) {
      const trip = loggerTripObservation(model);
      return goalCompleted(state, 'close-first-chapter')
        && Boolean(trip && !loggerWarningFacts(state)
        && trip.tripTicks <= LOGGER_TRIP_WARNING_TICKS);
    },
    render({ model }) {
      const trip = loggerTripObservation(model);
      return {
        kicker: '道の効き目',
        title: '森への道は、すでに働いています',
        summary: `実往復 ${trip.tripTicks.toFixed(1)}tick・生産 ${(trip.multiplier * 100).toFixed(1)}%`,
        facts: trip,
        body: [
          `${model.day}日目。木こりの市場往復は${trip.tripTicks.toFixed(1)}tick、生産倍率は${(trip.multiplier * 100).toFixed(1)}%でした。`,
          '最初に敷いた道が十分に短い経路を作っています。余計な敷き直しは要りません——道の効き目だけ、覚えておいてください。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'food-dependence-report',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'improve-logger-route');
    },
    render({ model }) {
      const facts = foodFlowMetrics(model);
      return {
        kicker: '第二章・島の食卓',
        title: '島の銀を、島の食卓へ',
        summary: `食料輸入EMA ${facts.importEma.toFixed(3)}・本土仕入累計 ${facts.outflow.toFixed(1)}`,
        facts,
        body: [
          `${model.day}日目。食料の輸入量EMAは${facts.importEma.toFixed(3)}、会社の実台帳に残る本土仕入は累計${facts.outflow.toFixed(1)}です。輸入の代金は、島の銀が本土へ出てゆく流れでもあります。`,
          '水際には漁家を、市場の近くの平地には菜園をお置きください。島の食料が市場に届けば、値と輸入の流れがどう変わるかを同じ帳面で追います。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'island-food-change',
    source: 'snapshot',
    when({ model, state }) {
      return goalCompleted(state, 'place-island-food')
        && Boolean(islandFoodChange(model, state));
    },
    render({ model, state }) {
      const change = islandFoodChange(model, state);
      return {
        kicker: '島内生産の報告',
        title: '魚と野菜が、市場の数字を動かしました',
        summary: `食料生産EMA ${change.current.productionEma.toFixed(2)}・輸入EMA ${change.before.importEma.toFixed(3)}→${change.current.importEma.toFixed(3)}`,
        facts: change,
        body: [
          `${model.day}日目。島内の食料生産EMAは${change.current.productionEma.toFixed(2)}へ立ち上がりました。魚の値は1荷あたり${(change.before.fishPrice * 10).toFixed(1)}から${(change.current.fishPrice * 10).toFixed(1)}デナリへ、野菜は${(change.before.vegPrice * 10).toFixed(1)}から${(change.current.vegPrice * 10).toFixed(1)}デナリへ動いています。`,
          `食料輸入EMAも${change.before.importEma.toFixed(3)}から${change.current.importEma.toFixed(3)}へ変わりました。まだ上下はしますが、島の食卓を島の手で満たす流れは、実際の価格と荷の動きに現れています。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'food-import-target-reached',
    source: 'snapshot',
    when({ model, state }) {
      const metrics = foodFlowMetrics(model);
      return goalCompleted(state, 'observe-island-food-change')
        && metrics.productionEma >= FOOD_PRODUCTION_EMA_MIN
        && metrics.importEma < FOOD_IMPORT_EMA_TARGET;
    },
    render({ model, state }) {
      const before = foodDependenceFacts(state);
      const current = foodFlowMetrics(model);
      return {
        kicker: '自給の節目',
        title: '本土から買う食料の流れが細りました',
        summary: `輸入EMA ${before.importEma.toFixed(3)}→${current.importEma.toFixed(3)}（目標 < ${FOOD_IMPORT_EMA_TARGET.toFixed(2)}）`,
        facts: { before, current, target: FOOD_IMPORT_EMA_TARGET },
        body: [
          `${model.day}日目。食料輸入EMAは${current.importEma.toFixed(3)}となり、実測から定めた節目${FOOD_IMPORT_EMA_TARGET.toFixed(2)}を下回りました。第二章の開始時は${before.importEma.toFixed(3)}でした。`,
          `島内の食料生産EMAは${current.productionEma.toFixed(2)}。本土仕入の累計は${current.outflow.toFixed(1)}ですが、いま流れ込む速さそのものは細っています。累計と現在の速さは、分けてご覧ください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-two-close',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'reduce-food-imports');
    },
    render({ model, state }) {
      const reached = state?.letters?.find(letter => letter.id === 'food-import-target-reached');
      const before = foodDependenceFacts(state);
      const current = foodFlowMetrics(model);
      return {
        kicker: '第二章・収支報告',
        title: '島の食卓は、島の営みになりました',
        summary: `食料生産EMA ${current.productionEma.toFixed(2)}・輸入EMA ${current.importEma.toFixed(3)}`,
        facts: { before, current, reached: Boolean(reached) },
        body: [
          `${model.day}日目。魚と野菜を作る営みが根付き、食料生産EMAは${current.productionEma.toFixed(2)}。食料輸入EMAは第二章開始時の${before.importEma.toFixed(3)}から${current.importEma.toFixed(3)}へ下がりました。`,
          `本土仕入の累計${current.outflow.toFixed(1)}は消えません——過去に出た銀の記録です。けれど、これから出てゆく速さは変えられました。ここから先も同じ島、同じ帳簿のまま、総督のお考えでお続けください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-log-trade',
    source: 'event',
    when({ events }) {
      return Boolean(logTransaction(events));
    },
    render({ model, events }) {
      const trade = logTransaction(events);
      const price = (trade.price * 10).toFixed(1);
      return {
        kicker: '市場の初商い',
        title: '丸太に買い手がつきました',
        summary: `${trade.transactionDay ?? model.day}日目・${trade.qty}荷・${price}デナリ/荷`,
        body: [
          `${trade.transactionDay ?? model.day}日目。市場で丸太${trade.qty}荷が1荷あたり${price}デナリで商われました。木工房の棚が満ち、木こりの財布に銀が入りました。`,
          '値は私どもが決めたものではありません。売り手の言い値に買い手がついた、それだけのことです。市場とはそういう場所でございます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
]);
