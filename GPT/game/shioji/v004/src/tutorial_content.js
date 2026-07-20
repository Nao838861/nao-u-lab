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
]);

export const TUTORIAL_LETTERS = Object.freeze([
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
