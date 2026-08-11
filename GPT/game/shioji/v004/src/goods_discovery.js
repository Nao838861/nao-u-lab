export const GOODS_DISCOVERY_STATE_VERSION = 1;

export const GOODS_DISCOVERY_SCRIPTS = Object.freeze({
  salt: '塩が採れました。魚を保存食に、野菜を漬物に変えられます。',
  char: '木炭ができました。塩と保存食を作るために使います。',
  pres: '保存食ができました。魚より長く保存できます。',
  pick: '漬物ができました。野菜より長く保存できます。',
  wheat: '麦が採れました。収穫は9月の年1回です。',
  fish: '魚が獲れました。3日で腐りますが、食料のほか、保存食や魚粉へ加工できます。',
  log: '丸太が採れました。木製品と木炭に加工できます。建物の修繕や漁の木舟にも使います。',
  tools: '木製品ができました。作業道具、家の発展、木の荷車、木舟の修繕に使います。',
});

const MINIMUM_AMOUNT = 1e-9;

function clone(value) {
  return structuredClone(value);
}

function uniqueKnownGoods(goods, allowed) {
  if (!Array.isArray(goods)) return [];
  const seen = new Set();
  return goods.filter(goodsId => {
    if (!allowed.has(goodsId) || seen.has(goodsId)) return false;
    seen.add(goodsId);
    return true;
  });
}

function possessionGoods(model, goodsIds) {
  const held = new Set();
  for (const row of model?.goodsManifest ?? []) {
    if (Number(row?.totalAmount ?? 0) <= MINIMUM_AMOUNT) continue;
    // 移民の私有食料庫へ自動付与される開拓キットは、プレイヤーが出会った品として
    // 先に3枚開示しない。生産・通常輸入、または島の棚や市場で扱われた時に開示する。
    const locations = row.locations;
    if (!Array.isArray(locations)
      || locations.some(location => location.source !== 'pantry')) {
      held.add(row.goods);
    }
  }
  for (const goods of goodsIds) {
    const flow = model?.flowEma?.[goods] ?? {};
    if (Number(flow.prod ?? 0) > MINIMUM_AMOUNT || Number(flow.imp ?? 0) > MINIMUM_AMOUNT) {
      held.add(goods);
    }
  }
  return goodsIds.filter(goods => held.has(goods));
}

function restoredState(state, goodsIds) {
  if (!state) return null;
  if (state.version !== GOODS_DISCOVERY_STATE_VERSION) {
    throw new Error(`未対応の品目出会い保存版です: ${state.version}`);
  }
  const allowed = new Set(goodsIds);
  const knownGoods = uniqueKnownGoods(state.knownGoods, allowed);
  const announcedGoods = uniqueKnownGoods(state.announcedGoods, allowed)
    .filter(goods => Object.hasOwn(GOODS_DISCOVERY_SCRIPTS, goods));
  const pending = Array.isArray(state.pending) ? state.pending.map(row => ({
    id: String(row.id),
    day: Number.isSafeInteger(row.day) ? row.day : 0,
    goods: uniqueKnownGoods(row.goods, allowed)
      .filter(goods => Object.hasOwn(GOODS_DISCOVERY_SCRIPTS, goods)),
  })).filter(row => row.goods.length > 0) : [];
  return { knownGoods, announcedGoods, pending };
}

function discoverySpeech(goods) {
  return goods.map(goodsId => GOODS_DISCOVERY_SCRIPTS[goodsId]).filter(Boolean).join('');
}

export class GoodsDiscovery {
  constructor({
    goodsIds,
    mode,
    model = null,
    state = null,
    suppressInitialAnnouncements = false,
  }) {
    if (!Array.isArray(goodsIds) || goodsIds.some(goods => typeof goods !== 'string')) {
      throw new TypeError('goodsIds must be an array of strings');
    }
    this.goodsIds = [...new Set(goodsIds)];
    const restored = restoredState(state, this.goodsIds);
    if (restored) {
      this.known = new Set(restored.knownGoods);
      this.announced = new Set(restored.announcedGoods);
      this.pending = restored.pending;
      return;
    }

    const matureEconomy = mode === 'test' || mode === 'caravan';
    this.known = new Set(matureEconomy ? this.goodsIds : []);
    this.announced = new Set(matureEconomy ? Object.keys(GOODS_DISCOVERY_SCRIPTS) : []);
    this.pending = [];
    if (!matureEconomy && model) {
      const initial = possessionGoods(model, this.goodsIds);
      for (const goods of initial) this.known.add(goods);
      if (suppressInitialAnnouncements) {
        for (const goods of initial) {
          if (Object.hasOwn(GOODS_DISCOVERY_SCRIPTS, goods)) this.announced.add(goods);
        }
      } else {
        this.enqueue(initial, model.day);
      }
    }
  }

  enqueue(goods, day) {
    const pendingGoods = new Set(this.pending.flatMap(row => row.goods));
    const scripted = goods.filter(goodsId => (
      Object.hasOwn(GOODS_DISCOVERY_SCRIPTS, goodsId)
      && !this.announced.has(goodsId)
      && !pendingGoods.has(goodsId)
    ));
    if (scripted.length === 0) return null;
    const sameDay = this.pending.find(row => row.day === day);
    if (sameDay) {
      sameDay.goods.push(...scripted);
      sameDay.goods.sort(
        (left, right) => this.goodsIds.indexOf(left) - this.goodsIds.indexOf(right),
      );
      sameDay.id = `goods-discovery-${day}-${sameDay.goods.join('-')}`;
      return this.messageFor(sameDay);
    }
    const row = {
      id: `goods-discovery-${day}-${scripted[0]}`,
      day,
      goods: scripted,
    };
    this.pending.push(row);
    return this.messageFor(row);
  }

  observe(model) {
    const discovered = possessionGoods(model, this.goodsIds)
      .filter(goods => !this.known.has(goods));
    for (const goods of discovered) this.known.add(goods);
    return {
      discovered: [...discovered],
      message: this.enqueue(discovered, Number.isSafeInteger(model?.day) ? model.day : 0),
    };
  }

  knownGoods() {
    return this.goodsIds.filter(goods => this.known.has(goods));
  }

  messageFor(row) {
    if (!row) return null;
    return Object.freeze({
      id: row.id,
      day: row.day,
      goods: [...row.goods],
      speech: discoverySpeech(row.goods),
    });
  }

  currentMessage() {
    return this.messageFor(this.pending[0] ?? null);
  }

  markAnnounced(id) {
    const index = this.pending.findIndex(row => row.id === id);
    if (index < 0) return false;
    const [row] = this.pending.splice(index, 1);
    for (const goods of row.goods) this.announced.add(goods);
    return true;
  }

  readState() {
    return clone({
      version: GOODS_DISCOVERY_STATE_VERSION,
      knownGoods: this.knownGoods(),
      announcedGoods: this.goodsIds.filter(goods => this.announced.has(goods)),
      pending: this.pending,
    });
  }
}

export function createGoodsDiscovery(options) {
  return new GoodsDiscovery(options);
}
