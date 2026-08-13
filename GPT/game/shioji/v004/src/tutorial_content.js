import {
  E_STABLE_JOBS,
  E_STABLE_POPULATION_BAND,
  E_STABLE_YEARS,
} from './engine_bridge.js?v=v004.53.0-second-market-tutorial';
import { JOB_LABELS, toDenari } from './config.js?v=v004.53.0-second-market-tutorial';
import { displayCultureLevel } from './visuals.js?v=v004.53.0-second-market-tutorial';
import {
  PLAYER_FACING_BANNED_TERMS,
  islandFoodSummary,
  winterFoodForecast,
} from './food_readability.js?v=v004.53.0-second-market-tutorial';
import { islandCalendar } from './ui_summary.js?v=v004.53.0-second-market-tutorial';

export { PLAYER_FACING_BANNED_TERMS };

const LIVING_REQUIREMENT_LABELS = Object.freeze({
  food1: '食料1種', food2: '食料2種', food3: '食料3種', grain: '穀物',
  saltchar: '塩と燃料', tools: '木製品', salt: '塩', char: '燃料', cloth: '布', iron: '鉄材',
});

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

function householdForBuilding(model, building) {
  return model.households.find(household => household.buildingId === building.id) ?? null;
}

function motherPortJobBuildings(model, job) {
  return model.buildings.filter(building => {
    if (building.type !== job) return false;
    const owner = householdForBuilding(model, building);
    return !owner || (owner.marketId ?? 'main') === 'main';
  });
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

function acceptedOrderExpiredEvent(events) {
  return events.find(event => event.type === 'notice'
    && event.message?.includes('注文の期限切れ')) ?? null;
}

function orderLedgerRevenue(model, goods) {
  return ledgerAmountMatching(model, reason => reason === `本国注文へ${goods}を出荷`);
}

function ledgerAmountMatching(model, predicate) {
  const totals = model.companyLedgerByReason;
  if (totals && Object.keys(totals).length > 0) {
    return Object.entries(totals)
      .filter(([reason]) => predicate(reason))
      .reduce((total, [, amount]) => total + amount, 0);
  }
  return model.companyLedger
    .filter(row => predicate(row.reason))
    .reduce((total, row) => total + row.amount, 0);
}

function foodImportOutflow(model) {
  const prefixes = new Set(FOOD_GOODS);
  return -ledgerAmountMatching(model, reason => {
    const goods = reason?.match(/^([^の]+)の本土仕入$/)?.[1];
    return Boolean(goods && prefixes.has(goods));
  });
}

function portConnectedToMarket(model) {
  const port = model.buildings.find(building => building.roles?.includes('port'));
  if (!port) return false;
  const row = model.roadConnection?.buildings?.find(entry => entry.id === port.id);
  return Boolean(row?.connected);
}

const FOOD_GOODS = ['fish', 'veg', 'wheat', 'pres', 'pick', 'meat'];

function tutorialFoodIntervention(model) {
  if (!model?.mainlandAid?.refused) {
    return Object.freeze({
      kind: 'aid',
      target: { kind: 'sheet', sheet: 'company-sheet' },
      speech: '食料支援を本国へ要請できます。届くまで時間がかかるので、必要なら早めに頼みましょう。',
    });
  }
  const fisherCount = motherPortJobBuildings(model, 'fisher').length;
  const farmCount = motherPortJobBuildings(model, 'veg').length;
  const job = fisherCount <= farmCount ? '漁師' : '野菜畑';
  return Object.freeze({
    kind: 'build',
    target: null,
    speech: `本国の支援はもう望めません。建築欄から${job}を増やし、市場へ道をつなぎましょう。`,
  });
}

function tutorialWinterFoodForecast(model) {
  const food = islandFoodSummary(model);
  const baseline = winterFoodForecast(model);
  const reserve = food.available;
  const shortage = Math.max(0, baseline.required - reserve);
  return Object.freeze({
    ...baseline,
    reserve,
    shortage,
    sufficient: shortage <= 0,
  });
}

const GOODS_LABELS = Object.freeze({
  tools: '木製品', char: '木炭', salt: '塩', pres: '保存食', pick: '漬物',
  cloth: '布', stone: '石材', log: '丸太', fish: '魚',
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
  const pavedRoads = new Set(model.pavedRoadKeys ?? []);
  const enterCost = (x, y) => {
    if (x < 0 || y < 0 || x >= model.width || y >= model.height) return Infinity;
    const kind = tileKind(model, x, y);
    if (kind === 'water') return Infinity;
    const key = `${x},${y}`;
    if (blocked.has(key) && !(x === to.x && y === to.y)) return Infinity;
    if (roads.has(key)) return pavedRoads.has(key) ? 0.45 : 0.6;
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
  return islandFoodSummary(model).runwayDays;
}

function farHouseholdFromMarket(model) {
  const market = marketBuilding(model);
  if (!market?.entrance) return null;
  for (const household of model.households.filter(row => (row.marketId ?? 'main') === 'main')) {
    const home = model.buildings.find(building => building.id === household.buildingId);
    if (!home?.entrance) continue;
    const walk = estimateWalkLen(model, home.entrance, market.entrance);
    if (walk > 14) return { household, home, walk };
  }
  return null;
}

export const LOGGER_TRIP_WARNING_TICKS = 24;
export const LOGGER_TRIP_RECOVERY_TICKS = 4;
export const FOOD_IMPORT_EMA_TARGET = 1.2;
export const SEASONAL_SURPLUS_MIN = 8;
export const SEASONAL_VALLEY_RATIO = 0.2;
export const SEASONAL_RESERVE_TARGET = 16;
export const ORDER_JUDGMENT_FALLBACK_OFFERS = 1;
export const TOOLS_PRICE_RISE_RATIO = 0.05;
export const TOOLS_PRICE_RISE_DELTA = 0.05;
export const CONVERSION_SURVIVAL_DAYS = 90;

// 会社在庫は意味を後日整理するまで、現行チュートリアルの学習項目から外す。
// 旧IDと定義は保存互換のため残すが、目標・書状・助言の公開配列には入れない。
export const TUTORIAL_DEFERRED_COMPANY_STOCK_GOAL_IDS = Object.freeze([
  'prepare-first-tools-stock',
  'order-procurement-target',
  'first-order-procurement',
  'observe-seasonal-food-valley',
  'set-seasonal-stock-target',
  'fill-seasonal-reserve',
  'release-seasonal-reserve',
  'close-third-chapter',
  'target-profitable-order',
]);
const TUTORIAL_DEFERRED_COMPANY_STOCK_GOALS = new Set(
  TUTORIAL_DEFERRED_COMPANY_STOCK_GOAL_IDS,
);
const TUTORIAL_DEFERRED_COMPANY_STOCK_LETTERS = new Set([
  'first-company-procurement',
  'order-needs-target',
  'seasonal-food-valley-report',
  'seasonal-stock-target-set',
  'seasonal-reserve-filled',
  'seasonal-release-dispatched',
  'chapter-three-close',
]);
const TUTORIAL_DEFERRED_COMPANY_STOCK_ADVICE = new Set([
  'seasonal-release-opportunity',
]);
export const TUTORIAL_LETTER_ATTENTION = Object.freeze({
  'tutorial-starvation-consequence': 'critical',
  'tutorial-bankruptcy-consequence': 'critical',
  'arrival-report': 'critical',
  'first-order-offer': 'critical',
  'first-import-food': 'notice',
  'first-company-procurement': 'notice',
  'first-order-handling': 'notice',
  'first-order-complete': 'action',
  'accepted-order-expired': 'critical',
  'chapter-one-close': 'notice',
  'logger-road-recovered': 'notice',
  'logger-road-already-good': 'notice',
  'food-dependence-report': 'notice',
  'island-food-change': 'notice',
  'food-import-target-reached': 'notice',
  'chapter-two-close': 'notice',
  'seasonal-stock-target-set': 'notice',
  'seasonal-reserve-filled': 'notice',
  'seasonal-release-dispatched': 'notice',
  'chapter-three-close': 'notice',
  'profitable-order-accepted': 'notice',
  'profitable-order-complete': 'notice',
  'chapter-four-close': 'notice',
  'conversion-workshops-placed': 'notice',
  'conversion-cost-chain': 'notice',
  'household-level-up': 'notice',
  'chapter-five-close': 'notice',
  'second-market-call': 'critical',
  'chapter-six-close': 'notice',
  'tutorial-graduation': 'critical',
  'first-log-trade': 'notice',
});

// 書状は「後から読む必然性」があるものだけを一覧へ残す。
// forced: エレナの予告後に自動開封 / letter: エレナから任意開封
// message: エレナの一言だけで伝え、書状一覧や未読数へ残さない。
export const TUTORIAL_LETTER_DELIVERY = Object.freeze({
  'tutorial-starvation-consequence': 'forced',
  'tutorial-bankruptcy-consequence': 'forced',
  'arrival-report': 'forced',
  'first-order-offer': 'forced',
  'accepted-order-expired': 'forced',
  'chapter-one-close': 'letter',
  'chapter-two-close': 'letter',
  'chapter-three-close': 'letter',
  'profitable-order-assessment': 'letter',
  'skippable-order-assessment': 'letter',
  'chapter-four-close': 'letter',
  'conversion-cost-chain': 'letter',
  'chapter-five-close': 'letter',
  'second-market-call': 'letter',
  'chapter-six-close': 'letter',
  'tutorial-graduation': 'forced',
});

export function tutorialLetterDelivery(id) {
  return TUTORIAL_LETTER_DELIVERY[id] ?? 'message';
}
const LOGGER_MULTIPLIER_RECOVERY = 0.1;
const FOOD_PRODUCTION_EMA_MIN = 0.25;
const FOOD_PRICE_CHANGE_MIN = 0.01;
const FOOD_IMPORT_EMA_CHANGE_MIN = 0.05;
const SEASONAL_FOOD_GOODS = ['fish', 'veg', 'wheat'];
const CONVERSION_JOB_DEFINITIONS = Object.freeze([
  Object.freeze({ job: 'woodshop', label: '木工房', goods: 'tools', inputGoods: 'log' }),
  Object.freeze({ job: 'charburner', label: '炭焼き小屋', goods: 'char', inputGoods: 'log' }),
  Object.freeze({ job: 'saltworks', label: '塩田', goods: 'salt', inputGoods: 'char' }),
]);

// エレナは意味を伝え、こちらは押す場所・置く場所だけを伝える。
// 内部の判定語を goal 本体へ混ぜず、初見プレイヤーが見る文面を一か所で監査する。
export const TUTORIAL_PLAYER_TITLES = Object.freeze({
  'first-road-and-logger': '港から森のそばまで道を敷く',
  'first-logger': '森と道のそばに木こりを建てる',
  'market-for-logs': '丸太を売買できる市場を用意する',
  'connect-market-to-port': '本土からの荷が市場へ届く道をつくる',
  'request-first-aid': '食料づくりが始まるまでの一便を頼む',
  'first-settlers-arrive': '最初の家族が来るのを見届ける',
  'place-island-food': '魚・野菜・丸太の生産基盤を整える',
  'first-woodshop': '丸太を木製品へ変える仕事を用意する',
  'warehouse-for-order': '注文品を港へ渡す物流拠点を用意する',
  'prepare-first-tools-stock': '最初の注文に備えて木製品を集める',
  'accept-first-order': '最初の本国注文を引き受ける',
  'order-procurement-target': '注文に足りる買上げ量か確かめる',
  'first-order-procurement': '買い上げた品が倉庫へ届くのを見る',
  'complete-first-order': '注文の残りを見ながら全量を納める',
  'close-first-chapter': '最初の輸出が島へ残したものを知る',
  'improve-logger-route': '木こりの往復を短くして仕事時間を戻す',
  'observe-island-food-change': '島の食料が市場へ流れ始めるのを見る',
  'reduce-food-imports': '本土に頼る食料を小さくする',
  'close-second-chapter': '島の食卓がどう変わったか知る',
  'observe-seasonal-food-valley': '食料が薄くなる季節を見つける',
  'set-seasonal-stock-target': '余る季節の食料を倉庫へ備える',
  'fill-seasonal-reserve': '食料の備えが倉庫へ届くのを見る',
  'release-seasonal-reserve': '品薄の市場へ倉庫の備えを戻す',
  'close-third-chapter': '倉庫の備えが季節をつないだ結果を知る',
  'assess-profitable-order': '本国の支払と島で集める費用を比べる',
  'accept-profitable-order': '利益を見込める注文を引き受ける',
  'target-profitable-order': '注文分の品を買い上げる',
  'complete-profitable-order': '見立てが利益になったか確かめる',
  'observe-skippable-order': '引き受けない方がよい注文を見分ける',
  'let-skippable-order-expire': '注文を見送り、期限まで観察する',
  'close-fourth-chapter': '引き受ける判断と見送る判断を振り返る',
  'observe-tools-price-rise': '木製品の値動きから需要の変化を読む',
  'place-conversion-workshops': '丸太から木製品・木炭・塩へ仕事をつなぐ',
  'observe-conversion-cost-chain': '原料の値が加工品へ渡る様子を見る',
  'sustain-conversion-workshops': '三つの手仕事が続く町にする',
  'observe-household-level-up': '品物が暮らしを豊かにする様子を見る',
  'close-fifth-chapter': '仕事の連鎖が暮らしへ届いた結果を知る',
  'inspect-second-market-road': '峠向こうの漁郷と道を確かめる',
  'build-caravan-inn': '市場間の定期便を担う隊商宿を建てる',
  'staff-caravan-inn': '募集人数と給料を決め、御者を迎える',
  'wait-main-wheat-stock': '母港市場に麦が並ぶ季節を待つ',
  'configure-first-caravan-route': '麦を送り、魚を持ち帰る路線を定める',
  'watch-first-caravan-depart': '初便の荷車が麦を積んで発つのを見る',
  'watch-first-caravan-arrive': '麦が漁郷市場へ届くのを見る',
  'read-first-caravan-receipt': '帰着した初便のレシートを読む',
  'observe-second-market-result': '漁郷の食卓と月次収支の変化を確かめる',
  'close-sixth-chapter': '二つの市場を結んだ結果を受け取る',
  'graduate-governor': '自分の島を読み続ける',
});

// エレナの言葉だけでも「何をするか」と「なぜするか」が分かるようにする。
// ボタン名・入力手順は TUTORIAL_SYSTEM_INSTRUCTIONS が備忘録として補う。
export const TUTORIAL_ELENA_MESSAGES = Object.freeze({
  'first-road-and-logger': 'まずは、港から森のそばまで道を敷きましょう。あとで木こりを建て、切った丸太を運ぶ道になります。',
  'first-logger': '今度は、道沿いの森のそばに木こりを建てましょう。どこにも置けますが、森が遠いほど歩く時間が増え、丸太の日産が落ちます。',
  'market-for-logs': '木こりが丸太を売れるよう、道沿いに市場を開きましょう。売れたお金で、家族は食料を買えるようになります。',
  'connect-market-to-port': '港と市場の入口を道でつなぎましょう。本土から届く食料も、島から出す荷も、この道を通ります。',
  'request-first-aid': '漁師と野菜畑が働き始めるまでの食料を、本国から一便だけ送ってもらいましょう。',
  'first-settlers-arrive': '市場と当座の食料が整いました。港から市場へ食料を運ぶ人を追いながら、最初の家族を迎えましょう。',
  'place-island-food': '最初の家族が着きました。漁師2軒、野菜畑1軒、麦畑1軒で食卓を支え、木こりは合計3軒にしましょう。木工房1軒を動かすには、木こり3軒ぶんの丸太が要ります。漁師も水辺から遠ければ、その分だけ日産が落ちます。',
  'first-woodshop': '木工房を木こりへ近い道沿いに建てましょう。近ければ市場を経ずに丸太を買い、短くなった時間で木製品を増やせます。',
  'warehouse-for-order': '市場と港へ道が通る場所に、倉庫を建てましょう。会社の運び手が、買い付けた注文品を港へ渡す中継所です。',
  'prepare-first-tools-stock': '注文が来る前に、木製品を12荷、倉庫に買い集めておきましょう。先に備えれば、期限に追われずに済みます。',
  'accept-first-order': '本国から注文が届いたら、品の量と期限を確かめて引き受けましょう。受諾すると、会社は必要数を市場で買い付け始めます。',
  'order-procurement-target': '注文を引き受けても、買い付ける量は自動では増えません。注文数に足りるだけ、木製品の買上げ目標を定めましょう。',
  'first-order-procurement': '会社の運び手が、市場の木製品を倉庫へ運びます。会社用の荷車を買えば、一度に運べる量を増やせます。',
  'complete-first-order': '買い付けた木製品は、物流拠点を経て港へ一荷ずつ運ばれます。残りがなくなり、船が出るまで見届けましょう。',
  'close-first-chapter': '最初の注文がどう終わったか、書状で振り返りましょう。丸太から船出までの流れをまとめています。',
  'improve-logger-route': '木こりから市場までの遠回りを、短い道へ直しましょう。歩く時間が減れば、その分だけ丸太を多く切れます。',
  'observe-island-food-change': '漁師と野菜畑の食料が市場へ届き始めました。本国から買う量がどう変わるか、しばらく見てみましょう。',
  'reduce-food-imports': '魚と野菜を作る家が働き続ければ、本国から買う食料は減っていきます。市場への道と食料の量を見守りましょう。',
  'close-second-chapter': '島で食料を作った結果を、書状で確かめましょう。次は、本国注文を受けるか見送るかを数字で判断します。',
  'observe-seasonal-food-valley': '食料の量は季節で変わります。市場の食料が多い時と少ない時を見比べ、備える時期を覚えましょう。',
  'set-seasonal-stock-target': '食料が多い季節のうちに、まず16荷を倉庫へ買い集めましょう。これは備蓄操作を覚える最初の一便です。冬全体の必要量は［統計］の予報で確かめられます。',
  'fill-seasonal-reserve': '買い上げた食料を、荷車が倉庫へ運びます。最初の備え16荷が実際に積まれるまで見届けましょう。',
  'release-seasonal-reserve': '市場の食料が少なくなりました。倉庫に備えた16荷を市場へ戻し、家族が買えるようにしましょう。',
  'close-third-chapter': '倉庫へ備えた食料が、品薄の時にどう役立ったか、書状で振り返りましょう。',
  'assess-profitable-order': '本国が払う一荷あたりの代金と、注文数すべてをそろえる平均原価を比べましょう。差が残る注文だけを引き受けます。',
  'accept-profitable-order': '仕入れより高く売れると見込める注文です。量と期限をもう一度確かめ、引き受けましょう。受諾後の買付は会社が始めます。',
  'target-profitable-order': '引き受けた品を注文数まで買い集めましょう。買上げ目標が少ないままでは、荷車は必要な分を運びません。',
  'complete-profitable-order': '会社が市場で買い付けた品が港へ運ばれていきます。納め終えたら、売上から仕入れを引いて利益を確かめましょう。',
  'observe-skippable-order': '届いた注文を、代金と全量の仕入原価で比べましょう。損になる注文や、必要数を集められない注文は見送れます。',
  'let-skippable-order-expire': 'この注文は引き受けず、期限が過ぎるまで待ちましょう。見送れば、品もお金も使わずに済みます。',
  'close-fourth-chapter': '引き受けた注文と、見送った注文を、書状で比べましょう。どちらも会社を守るための判断です。',
  'observe-tools-price-rise': '木製品の値段が上がり始めました。町で何が木製品を求めているのか、仕事と相場を見比べましょう。',
  'place-conversion-workshops': '木工房と炭焼き小屋は木こりの近くへ、塩田は炭焼き小屋の近くへ、一棟ずつ建てましょう。近い原料元から直接買えれば、仕事の連鎖が速くなります。',
  'observe-conversion-cost-chain': '三つの仕事場へ原料が届くのを待ちましょう。原料の値段が、作った品の原価にどう残るか確かめます。',
  'sustain-conversion-workshops': '三つの仕事場へ、家族と原料が届く状態を90日保ちましょう。道が切れたり原料が尽きたりしていないか見守ります。',
  'observe-household-level-up': '食料や暮らしの品が毎日届く家を見守りましょう。満たされた日が続くと、家と仕事場が一段育ちます。',
  'close-fifth-chapter': '三つの手仕事と家族の暮らしがどう変わったか、書状で振り返りましょう。',
  'inspect-second-market-road': '峠向こうの漁郷では魚が揚がっていますが、麦はありません。まず二つの市場と、その間に続く荷車道を地図で確かめましょう。',
  'build-caravan-inn': '市場は家族が売買する場所、隊商宿は市場と市場の間へ定期便を出す仕事場です。母港市場の近くへ隊商宿を建てましょう。',
  'staff-caravan-inn': '隊商宿で募集人数と一人一日あたりの給料を決めましょう。給料が低すぎれば、空き家のまま御者が集まりません。',
  'wait-main-wheat-stock': '行き荷にする麦は、母港の麦畑が収穫して市場へ出す実物です。市場に8荷以上並ぶまで季節を進めましょう。',
  'configure-first-caravan-route': '御者を迎えたら、目的地を漁郷市場、行き荷を麦、帰り荷を魚に定めましょう。',
  'watch-first-caravan-depart': '開拓会社から貸与された荷車があります。通常の速さに戻し、麦を積んだ初便が峠へ発つところを見届けましょう。',
  'watch-first-caravan-arrive': '荷車を追い、漁郷市場へ麦を降ろして魚を積むところを見届けましょう。',
  'read-first-caravan-receipt': '初便が母港へ帰りました。隊商のレシートで仕入、売上、給料、荷車費、差引を確かめましょう。',
  'observe-second-market-result': '漁郷の家族が届いた麦を実際に買えたか、隊商の今月収支と並べて確かめましょう。黒字だけが合格ではなく、数字から次便を直せることが大切です。',
  'close-sixth-chapter': '初便の荷と暮らしと収支を、書状にまとめました。この欄から直接開けます。',
  'graduate-governor': 'ここまでの報告を、最後の書状にまとめました。読み終えた後も、この島はそのまま続いていきます。',
});

export const TUTORIAL_ELENA_COMPLETIONS = Object.freeze({
  'first-road-and-logger': '森まで道が届きました。次は、その道沿いの森のそばに木こりを建てましょう。',
  'first-logger': '木こりが建ちました。建物を押すと、森までの片道と日産を確かめられます。まだ丸太を売る場所はありません。',
  'market-for-logs': '市場が開きました。木こりの丸太を売り、家族が食料を買える場所ができました。',
  'connect-market-to-port': '港と市場が道でつながりました。本国の食料を、市場まで運べるようになりました。',
  'request-first-aid': '本国へ食料支援を頼みました。この一便が届く間に、島で食料を作る支度を進められます。',
  'first-settlers-arrive': '最初の家族が島へ着きました。まずは、毎日食べる魚と野菜を島で作れるようにしましょう。',
  'place-island-food': '漁師2軒、野菜畑1軒、麦畑1軒、木こり3軒がそろいました。家族が働き始めれば、食料と丸太が市場へ届きます。',
  'first-woodshop': '木工房が建ちました。近い木こりに丸太があれば直接買いに行き、注文にも使える木製品へ変えます。',
  'warehouse-for-order': '物流拠点が道につながりました。市場で買い付けた注文品を、港へ受け渡せます。',
  'prepare-first-tools-stock': '木製品の買上げ目標を12荷に定めました。市場に木製品が並べば、会社の運び手が倉庫へ運びます。',
  'accept-first-order': '最初の注文を引き受けました。会社が必要数の買付を始めます。市場から港へ向かう運び手を追いましょう。',
  'order-procurement-target': '注文分の木製品を買い付けるよう定めました。あとは会社の運搬便が市場と倉庫を往復して集めます。',
  'first-order-procurement': '注文に必要な木製品が倉庫へそろいました。これから港へ運び、一荷ずつ船に積みます。',
  'complete-first-order': '最後の一荷を積んで、船が出ました。はじめての注文を、無事に届けられます。',
  'close-first-chapter': '最初の取引を振り返りました。次は、家族が歩く道と、毎日の食料を整えます。',
  'improve-logger-route': '木こりから市場までの道が短くなりました。歩く時間が減り、丸太を切る時間が増えます。',
  'observe-island-food-change': '島で作った魚と野菜が、市場へ届き始めました。家族が本国の食料だけに頼らず暮らせます。',
  'reduce-food-imports': '本国から買う食料が減りました。食事に使うお金を、島の家族へ回せています。',
  'close-second-chapter': '食料を島で作った結果を確かめました。次は、本国注文を受けるか見送るかを比べます。',
  'observe-seasonal-food-valley': '市場の食料が少なくなる時期を確かめました。多い季節に買い、倉庫へ残す理由が見えてきました。',
  'set-seasonal-stock-target': '食料を16荷買い上げるよう定めました。余っている間に、荷車が倉庫へ運びます。',
  'fill-seasonal-reserve': '倉庫に食料が16荷そろいました。市場が品薄になった時、この備えを戻せます。',
  'release-seasonal-reserve': '倉庫の食料を市場へ送り出しました。品薄の時期にも、家族が食べ物を買えます。',
  'close-third-chapter': '多い季節の食料を、少ない季節へ渡せました。倉庫は品を置くだけでなく、季節をまたぐ備えになります。',
  'assess-profitable-order': '本国の代金と、注文数すべての仕入原価を比べました。この差が、注文を受けるか決める根拠になります。',
  'accept-profitable-order': '利益を見込める注文を引き受けました。必要数の買付は会社が始めます。実際の支出と船出を見届けましょう。',
  'target-profitable-order': '注文分の品を買い付けるよう定めました。市場に品があれば、荷車が倉庫へ集めます。',
  'complete-profitable-order': '注文を納め終えました。売上と仕入れを比べれば、見込みどおり利益が残ったか分かります。',
  'observe-skippable-order': '受けない方がよい注文を見分けました。注文状は命令ではなく、会社が選べる取引です。',
  'let-skippable-order-expire': '注文を引き受けず、期限まで見送りました。品もお金も使わず、会社を守れました。',
  'close-fourth-chapter': '利益を見込んで受ける判断と、損を避けて見送る判断を確かめました。',
  'observe-tools-price-rise': '木製品の値上がりを確かめました。町の需要は、家族の動きだけでなく相場にも表れます。',
  'place-conversion-workshops': '木工房、炭焼き小屋、塩田がそろいました。家族と原料が届けば、三つの手仕事が動き始めます。',
  'observe-conversion-cost-chain': '三つの仕事場で生産が始まりました。原料の値段が、次の品の原価へ渡っています。',
  'sustain-conversion-workshops': '三つの手仕事が90日続きました。道と原料と働く家族が、途切れず届いた結果です。',
  'observe-household-level-up': '家と仕事場が一段育ちました。暮らしに必要な品が、毎日届き続けた成果です。',
  'close-fifth-chapter': '手仕事から生まれた品が、家族の暮らしへ届くところまで確かめました。',
  'inspect-second-market-road': '母港市場と漁郷市場、その間の峠道を確かめました。市場どうしを結ぶ仕事場を用意できます。',
  'build-caravan-inn': '隊商宿が建ちました。次は人数と給料を決め、御者が働きたい募集にしましょう。',
  'staff-caravan-inn': '隊商宿に御者が入りました。人数と日給は毎日の固定費として月次収支へ残ります。',
  'wait-main-wheat-stock': '母港市場に初便を満たせる麦が並びました。ここから路線を定めます。',
  'configure-first-caravan-route': '麦を行き荷、魚を帰り荷にする定期路線を定めました。次の出発を通常の速さで見届けましょう。',
  'watch-first-caravan-depart': '初便が実際の麦を積んで峠へ発ちました。荷車を追って漁郷まで見届けましょう。',
  'watch-first-caravan-arrive': '麦が漁郷市場へ届き、荷車は帰りの魚を仕入れました。母港へ戻るまで追いましょう。',
  'read-first-caravan-receipt': '初便が往復し、実際の仕入と運行結果がレシートへ残りました。次は漁郷の食卓と月次収支を読みます。',
  'observe-second-market-result': '漁郷の家族が届いた麦を買いました。路線が市場の数字だけでなく、家族の食卓まで変えています。',
  'close-sixth-chapter': '二つの市場を結んだ実便を振り返りました。荷物、暮らし、収支を一つの因果として読めます。',
  'graduate-governor': 'ここまでお疲れさまでした。案内は終わりますが、島も家族の暮らしも、このまま続いていきます。',
});

export const TUTORIAL_LETTER_MESSAGES = Object.freeze({
  'tutorial-starvation-consequence': '悲しい知らせです。食べ物が尽き、亡くなった人と島を離れた家族がいます。食料庫と市場への道を確かめましょう。',
  'tutorial-bankruptcy-consequence': '会社の借金が、これ以上は認められない額に達しました。残高と支出を、書状にまとめています。',
  'arrival-report': 'いま島にあるのは港だけです。まず港から森へ道を伸ばし、木こりが丸太を運べるようにしましょう。',
  'first-settlers-report': '最初の家族が島へ着きました。持参した食料が尽きる前に、漁師と野菜畑を建てましょう。',
  'logs-pile-no-market': '木こりの丸太が、売れずに積み上がっています。道沿いに市場を開き、家族が売買できる場所を作りましょう。',
  'market-distance-warning': '市場まで遠すぎて、買い物から一日のうちに戻れない家があります。道を短くするか、家の場所を改めましょう。',
  'market-needs-port-road': '市場は開きましたが、港からの道が切れています。このままでは本国の食料を市場へ運べません。',
  'initial-aid-plan': '島で食料を作れるようになるまで、一便だけ支援を頼みましょう。最初の家族を迎えるための備えです。',
  'first-import-food': '本国から届いた食料が、市場に並びました。この支えがある間に、島でも魚と野菜を作り始めましょう。',
  'first-log-stall': '木こりの丸太が、市場に並びました。買い手がつけば、売れたお金が木こりの家の財布へ入ります。',
  'first-tools': '木工房で、最初の木製品ができました。市場へ品が並べば、本国からの注文を受けられるようになります。',
  'aid-suggestion': '島の食料が心もとなくなっています。漁師と野菜畑が間に合わないなら、もう一便の支援も考えましょう。',
  'first-order-offer': '本国から、最初の注文が届きました。求められた品、量、期限を、書状で確かめてください。',
  'order-needs-warehouse': '注文の品を保管する倉庫がありません。市場と港へ道が通る場所に、倉庫を建てましょう。',
  'warehouse-unconnected': '倉庫の入口まで道が届いていません。市場から倉庫へ、さらに港へ運搬便が通れるようにつなぎましょう。',
  'order-needs-target': '注文を引き受けましたが、買い付ける量が足りません。注文数以上の買上げ目標を定めましょう。',
  'first-company-procurement': '会社の運搬便が、市場で買った品を倉庫へ運び始めました。注文分がそろうまで見届けましょう。',
  'first-order-handling': '港で船積みが始まりました。人足たちが注文の品を、一荷ずつ船へ運んでいます。',
  'accepted-order-expired': '受けた注文を、期限までに納め切れませんでした。何が足りなかったか、書状で振り返りましょう。',
  'first-order-complete': '最後の一荷を積んで、船が出ました。はじめての注文を、無事に届けられます。',
  'chapter-one-close': '最初の取引の収支を、書状にまとめました。この欄から直接開けます。',
  'logger-trip-warning': '木こりが市場まで歩く時間が長く、丸太を切る時間が減っています。もっと短い道に直しましょう。',
  'logger-road-recovered': '木こりから市場までの道が短くなりました。歩く時間が減り、丸太を切る時間が戻っています。',
  'logger-road-already-good': '森から市場まで、すでに短い道が通っています。木こりは十分な時間を伐採に使えています。',
  'food-dependence-report': '食料をまだ本国から買い続けています。漁師と野菜畑を増やし、市場への道を整えましょう。',
  'island-food-change': '島で作った魚と野菜が、市場へ届き始めました。本国から買う食料が減るか、しばらく見守りましょう。',
  'food-import-target-reached': '本国から買う食料が、十分に少なくなりました。島の家族が作る食料で、食卓を支えられています。',
  'chapter-two-close': '島の食料づくりと支出をまとめました。この欄から直接開けます。',
  'seasonal-food-valley-report': '市場の食料が、季節の変わり目に少なくなりました。多い時に倉庫へ備える理由を、書状で確かめましょう。',
  'seasonal-stock-target-set': '食料を倉庫へ買い集めるよう定めました。市場に余っている間に、荷車が備えを運びます。',
  'seasonal-reserve-filled': '買い上げた食料が、倉庫へそろいました。市場が品薄になった時、この備えを戻せます。',
  'seasonal-release-dispatched': '倉庫の食料を、市場へ送り出しました。荷車が着けば、家族がまた食料を買えるようになります。',
  'chapter-three-close': '倉庫の備えがどう役立つかをまとめました。この欄から直接開けます。',
  'profitable-order-assessment': '代金と仕入れ値を比べました。詳しい見込みは、この欄から開けます。',
  'profitable-order-accepted': '利益を見込める注文を引き受けました。次は、注文数に足りるだけ品を買い集めましょう。',
  'profitable-order-complete': '注文を納め、売上と仕入れが帳簿へ残りました。見込みどおり利益が出たか、書状で確かめましょう。',
  'skippable-order-assessment': '受けない方がよい理由をまとめました。この欄から直接開けます。',
  'chapter-four-close': '受けた注文と見送った注文を比べました。この欄から直接開けます。',
  'tools-price-rise': '木製品の値段が上がっています。町で木製品を求める家が増えたことが、相場にも表れています。',
  'conversion-workshops-placed': '木工房、炭焼き小屋、塩田がそろいました。家族と原料が届けば、三つの手仕事が動き始めます。',
  'conversion-cost-chain': '原料の値段が原価へ渡る様子をまとめました。この欄から直接開けます。',
  'household-level-up': 'お見事です。暮らしに必要な品が届き続け、家と仕事場が一段育ちました。',
  'no-vacancy-job-change': '仕事を替えたい家族がいますが、移り住める空き家がありません。育てたい仕事の建物を、一棟空けておきましょう。',
  'chapter-five-close': '手仕事と家族の暮らしをまとめました。この欄から直接開けます。',
  'second-market-call': '峠向こうの漁郷から、麦がないとの知らせです。魚はあっても、穀物の食事は市場の境界を越えなければ届きません。',
  'chapter-six-close': '二つの市場を結んだ初便の結果をまとめました。この欄から直接開けます。',
  'tutorial-graduation': 'ここまでの島の姿を、最後の書状にまとめました。読み終えた後も、同じ島をそのまま育てていけます。',
  'first-log-trade': '木こりの丸太が、市場で初めて売れました。売れたお金は、木こりの家の財布に入っています。',
});

// 後から読み返す必然がある14通だけを、書状として読みやすい文章へ整える。
// render() が保持する facts は検証・保存の証拠として残し、表示文だけをここで執筆する。
const TUTORIAL_AUTHORED_LETTERS = Object.freeze({
  'tutorial-starvation-consequence': ({ facts = {} }) => ({
    kicker: '島からの急報',
    title: '食料を立て直してください',
    summary: '住民をこれ以上失わないため、食料と市場への道を確かめてください。',
    body: [
      facts.peopleLost > 0
        ? `食べ物を得られず、${facts.peopleLost}人を失いました。亡くなった人は戻りません。`
        : '食べ物を得られず、亡くなった人と島を離れた家族がいます。',
      '漁師か野菜畑を増やし、それぞれの家から市場まで道が続いているか確かめてください。',
    ].join('\n\n'),
  }),
  'tutorial-bankruptcy-consequence': ({ facts = {} }) => ({
    kicker: '会社からの最終通告',
    title: '支出を止め、帳簿を立て直してください',
    summary: '会社の借金が信用の限度に達しました。',
    body: [
      Number.isFinite(facts.companyMoney)
        ? `会社の残高は${toDenari(facts.companyMoney).toFixed(0)}デナリです。これ以上の借金は認められません。`
        : '会社の借金が、これ以上は認められない額に達しました。',
      '新しい建設と買上げを止め、取引の収入と支出を比べてください。島の暮らしと帳簿は、この状態から続きます。',
    ].join('\n\n'),
  }),
  'arrival-report': () => ({
    kicker: 'エレナからの着任書',
    title: '港から最初の道を始めましょう',
    summary: '港から森のそばまで道を敷いてください。',
    body: [
      '総督、島には港だけがあります。丸太を得ることが、最初の暮らしと商いの始まりです。',
      'まず港から森のそばまで道を敷いてください。道が届いたら、その隣に木こりを建てましょう。',
    ].join('\n\n'),
  }),
  'first-order-offer': ({ facts = {} }) => ({
    kicker: '本国からの注文状',
    title: `${goodsLabel(facts.goods)}の注文が届きました`,
    summary: `${goodsLabel(facts.goods)}を${facts.qty ?? '指定の量'}荷、期限までに納める依頼です。`,
    body: [
      `本国が${goodsLabel(facts.goods)}を求めています。全量を期限までに納めた時だけ、注文は完遂になります。`,
      '引き受けるなら、取引で量と期限を確かめて受諾してください。受諾した数量を上限に、会社が市場で実際の買付を始めます。',
    ].join('\n\n'),
  }),
  'accepted-order-expired': ({ facts = {} }) => ({
    kicker: '本国注文の失効報告',
    title: '受けた注文を納め切れませんでした',
    summary: '船が出ても、残りがあれば注文は完遂ではありません。',
    body: [
      Number(facts.remaining) > 0
        ? `期限を迎えた時、まだ${Number(facts.remaining).toFixed(1)}荷が残っていました。注文は期限切れです。`
        : '期限までに全量を納め切れず、注文は期限切れになりました。',
      '次の注文では、残りの量とあと何日かを見ながら、物流拠点への道と市場の売物を早めに整えてください。',
    ].join('\n\n'),
  }),
  'chapter-one-close': ({ facts = {} }) => ({
    kicker: '第一章の報告',
    title: facts.expired ? '最初の注文から学んだこと' : '最初の輸出が結んだ道',
    summary: '丸太から木製品を作り、物流拠点と港を通して本国へ届ける流れを確かめました。',
    body: [
      facts.expired
        ? '最初の注文は期限切れになりました。それでも、残りと期限を見て準備する理由は確かめられました。'
        : '木こりの丸太が木製品になり、市場、倉庫、港を通って本国へ届きました。',
      'ご報告だけです。次は、家族の歩く距離を短くし、本土に頼っている食料を島で作る流れを見ていきましょう。',
    ].join('\n\n'),
  }),
  'chapter-two-close': () => ({
    kicker: '第二章の報告',
    title: '島の食卓が育ちました',
    summary: '魚と野菜が市場へ届き、本土から買う食料を減らせるようになりました。',
    body: [
      '漁師と野菜畑が働き、島で作った食料が家族の食卓へ届き始めました。本土へ出ていくお金も、これから抑えやすくなります。',
      'ご報告だけです。統計の食料グラフでは、島と会社が持つ食料を、冬越しに必要な量と見比べられます。',
    ].join('\n\n'),
  }),
  'chapter-three-close': ({ facts = {} }) => ({
    kicker: '第三章の報告',
    title: '倉庫へ備える命令を出しました',
    summary: `${goodsLabel(facts.goods)}を、余る時期から品薄の時期へ残す準備ができました。`,
    body: [
      `${goodsLabel(facts.goods)}の買上げ目標を定めました。市場に余りがあれば、会社が買って倉庫へ運びます。`,
      'いまは待つ時期です。市場の品が少なくなったらエレナがお知らせします。その時は倉庫の備えを市場へ戻せます。',
    ].join('\n\n'),
  }),
  'profitable-order-assessment': ({ facts = {} }) => ({
    kicker: '注文の見立て',
    title: `${goodsLabel(facts.goods)}の注文は利益を見込めます`,
    summary: '本国の支払が、市場で集める費用を上回る見込みです。',
    body: [
      '本国の一荷あたりの支払と、注文数すべてを買う加重仕入原価を比べました。いまの相場なら差が残ります。',
      'この注文を進めるなら受諾してください。相場は動くので、受諾後も残りの量と期限を見守りましょう。',
    ].join('\n\n'),
  }),
  'skippable-order-assessment': ({ facts = {} }) => ({
    kicker: '注文の見立て',
    title: `${goodsLabel(facts.goods)}の注文は見送れます`,
    summary: '注文状は命令ではありません。会社に合わない取引は受けなくて構いません。',
    body: [
      facts.reason === 'loss'
        ? '本国の支払より市場で集める費用が高く、受ければ損をする見込みです。'
        : '市場に必要な品がなく、期限までに集められる確かな見込みがありません。',
      '見送るなら受諾せず、期限まで待ってください。品もお金も使わず、次の注文を待てます。',
    ].join('\n\n'),
  }),
  'chapter-four-close': () => ({
    kicker: '第三章の報告',
    title: '受ける判断と見送る判断',
    summary: '支払と仕入を比べ、会社に残る取引だけを選べます。',
    body: [
      '利益を見込んで引き受けることも、損や品不足を避けて見送ることも、どちらも会社を守る判断です。',
      'ご報告だけです。取引では、受諾中の注文の残りと期限をいつでも確かめられます。',
    ].join('\n\n'),
  }),
  'conversion-cost-chain': () => ({
    kicker: '手仕事の報告',
    title: '原料の値は、次の品へ渡ります',
    summary: '丸太から木製品と木炭が生まれ、木炭から塩が生まれます。',
    body: [
      '木工房と炭焼き小屋が丸太を買い、塩田が木炭を買います。原料へ払った代金は、作った品の費用に含まれます。',
      'ご報告だけです。建物を選ぶと、原料棚、産出棚、作るのにかかった費用を確かめられます。',
    ].join('\n\n'),
  }),
  'chapter-five-close': () => ({
    kicker: '第四章の報告',
    title: '手仕事が暮らしへ届く町になりました',
    summary: '仕事場、原料、市場、家族の暮らしが一つの流れで結ばれました。',
    body: [
      '木工房、炭焼き小屋、塩田が、原料を買って品を作る受け皿になりました。品が家族へ届き続ければ、家と仕事場も育ちます。',
      'ご報告だけです。空いた仕事場は、困った家族が新しい仕事へ移るための受け皿にもなります。',
    ].join('\n\n'),
  }),
  'tutorial-graduation': ({ facts = {} }) => ({
    kicker: '総督への最後の書状',
    title: 'この先は、総督の島です',
    summary: '案内は終わりますが、島の暮らしと取引はこのまま続きます。',
    body: [
      Number.isFinite(facts.population)
        ? `いま島には${facts.population}人が暮らしています。道、仕事、市場、倉庫を結んだのは総督です。`
        : '道、仕事、市場、倉庫を結んだのは総督です。',
      'ご報告だけです。統計と地図を手がかりに、伸ばしたい仕事と守りたい暮らしを、ご自身で選んでください。',
    ].join('\n\n'),
  }),
});

export function authorTutorialLetter(id, rendered) {
  const author = TUTORIAL_AUTHORED_LETTERS[id];
  if (!author) return rendered;
  return {
    ...rendered,
    ...author(rendered),
    signature: rendered.signature ?? '会社秘書 エレナ',
  };
}

export const TUTORIAL_SYSTEM_INSTRUCTIONS = Object.freeze({
  'first-road-and-logger': '港から森の隣まで道を引く',
  'first-logger': '下の［資源］で［木こり］を選び、配置予測の日産が高い森近くの道沿いへ建てる。',
  'market-for-logs': '下の［流通］から［市場］を選び、木こりへ続く道の隣に置く。',
  'connect-market-to-port': '［整備］の［道を敷く］で、港の入口と市場の入口をつなぐ。',
  'request-first-aid': '上の［取引］を開き、［支援を要請する］を1回押す。',
  'first-settlers-arrive': '時間を進め、市場の近くに最初の家族が現れるまで盤面を見る。',
  'place-island-food': '［食料］から［漁師］を2軒、［野菜畑］と［麦畑］を1軒ずつ市場近くへ置き、［採取］の［木こり］を合計3軒にする。',
  'first-woodshop': '下の［加工］から［木工房］を選び、配置予測で木こりが近隣仕入の候補になる道沿いへ置く。',
  'warehouse-for-order': '下の［流通］から［倉庫］を置き、［道を敷く］で市場と港へつなぎ、物流中継を作る。',
  'prepare-first-tools-stock': '上の［取引］を開き、木製品の買上げ目標へ12と入力してEnterを押す。',
  'accept-first-order': '注文状が届いたら上の［取引］を開き、注文カードの［受諾する］を押す。',
  'order-procurement-target': '［取引］の注文数と木製品の買上げ目標を比べ、目標が少なければ注文数以上を入力してEnterを押す。',
  'first-order-procurement': '時間を進め、市場から倉庫へ買付品が届くのを見る。',
  'complete-first-order': '［取引］で「納品済み／残り／あと何日」を確認しながら時間を進め、市場から物流拠点を経て港へ向かう運搬便を追う。',
  'close-first-chapter': '',
  'improve-logger-route': '木こりを押して市場までの往復を読み、［整備］の［道を敷く］で遠回りを短くする。',
  'observe-island-food-change': '上の［統計］を開き、［食料］の線が時間とともに変わるのを確かめる。',
  'reduce-food-imports': '漁師・野菜畑と市場への道を整え、［需給］で魚と野菜の純増減を見ながら本土購入が小さくなるまで観察する。',
  'close-second-chapter': '',
  'observe-seasonal-food-valley': '［統計］の［食料と倉庫の備え］を開いたまま時間を進め、食料在庫が細る時期を見る。',
  'set-seasonal-stock-target': '［取引］で古い木製品目標を0にし、案内された食料の買上げ目標へ16と入力してEnterを押す。',
  'fill-seasonal-reserve': '時間を進め、［取引］または倉庫を開いて食料が会社在庫へ届くのを見る。',
  'release-seasonal-reserve': '［取引］で案内された食料の［市場へ出す量］へ16と入力し、［市場へ出す］を押す。',
  'close-third-chapter': '',
  'assess-profitable-order': '［取引］を開き、注文カードの完遂決済単価と注文全量の加重原価を比べる。',
  'accept-profitable-order': '比較した注文カードの［受諾する］を押す。',
  'target-profitable-order': '同じ品の買上げ目標へ注文数以上を入力し、Enterを押す。',
  'complete-profitable-order': '時間を進めて注文を納め、［統計］の取引収支で差引を確かめる。',
  'observe-skippable-order': '次の注文状を［取引］で読み、支払が仕入より不利な注文は［拒否する］で見送る。',
  'let-skippable-order-expire': '見送った注文を受諾せず、期限を過ぎるまで時間を進める。',
  'close-fourth-chapter': '',
  'observe-tools-price-rise': '［需給］の［木製品］を押し、統計に開く相場の上向きを見る。',
  'place-conversion-workshops': '下の［加工］から［木工房］［炭焼き小屋］［塩田］を、原料と市場へ続く道沿いに一棟ずつ置く。',
  'observe-conversion-cost-chain': '三棟を順に押し、原料棚と産出棚に品が入り、加工が始まるまで時間を進める。',
  'sustain-conversion-workshops': '三棟の道路と原料を保ち、90日間、働く世帯が途切れないよう観察する。',
  'observe-household-level-up': '働いている建物を押し、世帯の満たされた品と暮らしの変化を確かめる。',
  'close-fifth-chapter': '',
  'inspect-second-market-road': '地図で母港市場と漁郷市場を押し、入口どうしが途切れない荷車道で結ばれていることを確かめる。',
  'build-caravan-inn': '下の［流通］から［隊商宿］を選び、母港市場の道沿いへ建てる。',
  'staff-caravan-inn': '隊商宿を押し、募集を1人以上、日給を島の日当相場以上に設定して、家族が入るまで待つ。日給×人数×30が月額固定費になる。',
  'wait-main-wheat-stock': '時間を進め、母港市場の麦が8荷以上になるまで待つ。麦畑は9月半ばにまとめて収穫する。',
  'configure-first-caravan-route': '入居した隊商宿を押し、目的地を［漁郷市場］、行き荷を［麦］、帰り荷を［魚］にして路線を保存する。',
  'watch-first-caravan-depart': '速度を通常へ戻し、麦を積んだ荷車が母港市場を発つまで盤面を見る。',
  'watch-first-caravan-arrive': '荷車を選び、峠道を通って漁郷市場へ麦を降ろすまで追う。',
  'read-first-caravan-receipt': '帰着後に隊商宿を開き、第一便のレシートで往路麦・帰路魚・仕入額を確かめる。',
  'observe-second-market-result': '漁郷の家族を押して麦の購入を確かめ、隊商の今月欄で売上－仕入－給料－荷車費＝差引を読む。',
  'close-sixth-chapter': '',
  'graduate-governor': '',
});

function marketGoodsAvailability(model, goods) {
  const stalls = model.stalls
    .filter(stall => stall.goods === goods && (stall.marketId ?? 'main') === 'main')
    .reduce((total, stall) => total + (stall.qty ?? 0), 0);
  const market = marketBuilding(model);
  const inbound = (market?.shelves ?? [])
    .filter(shelf => shelf.section === 'inbound' && shelf.goods === goods)
    .reduce((total, shelf) => total + (shelf.amount ?? 0), 0);
  return stalls + inbound;
}

function marketStallAvailability(model, goods, marketId = 'main') {
  return model.stalls
    .filter(stall => stall.goods === goods
      && (stall.marketId ?? 'main') === marketId
      && (stall.age ?? 0) < 5)
    .reduce((total, stall) => total + (stall.qty ?? 0), 0);
}

function seasonalFoodValley(model, state, goalId = 'observe-seasonal-food-valley', goodsRows = SEASONAL_FOOD_GOODS) {
  const previous = state?.goalResults?.[goalId]?.evidence?.observations ?? {};
  const observations = {};
  const valleys = [];
  for (const goods of goodsRows) {
    const available = marketGoodsAvailability(model, goods);
    const price = model.marketPrices?.[goods] ?? 0;
    const prior = previous[goods] ?? {
      peakAvailability: 0,
      peakDay: null,
      peakPrice: price,
      lowestPrice: price,
    };
    const newPeak = available > prior.peakAvailability;
    const row = {
      goods,
      day: model.day,
      available,
      price,
      peakAvailability: newPeak ? available : prior.peakAvailability,
      peakDay: newPeak ? model.day : prior.peakDay,
      peakPrice: newPeak ? price : prior.peakPrice,
      lowestPrice: Math.min(prior.lowestPrice, price),
    };
    observations[goods] = row;
    if (row.peakAvailability >= SEASONAL_SURPLUS_MIN
      && model.day > row.peakDay
      && row.available <= row.peakAvailability * SEASONAL_VALLEY_RATIO) {
      valleys.push({
        ...row,
        valleyRatio: row.available / row.peakAvailability,
        priceChangeFromPeak: row.price - row.peakPrice,
      });
    }
  }
  valleys.sort((left, right) => left.valleyRatio - right.valleyRatio
    || SEASONAL_FOOD_GOODS.indexOf(left.goods) - SEASONAL_FOOD_GOODS.indexOf(right.goods));
  return { observations, valley: valleys[0] ?? null };
}

function seasonalValleyFacts(state) {
  return state?.goalResults?.['observe-seasonal-food-valley']?.evidence?.valley ?? null;
}

function seasonalReserveFacts(model, state) {
  const selected = state?.goalResults?.['set-seasonal-stock-target']?.evidence?.goods;
  if (selected) return { goods: selected };
  const valley = seasonalValleyFacts(state);
  if (valley?.goods) return valley;
  const rows = SEASONAL_FOOD_GOODS.map(goods => ({
    goods,
    available: marketGoodsAvailability(model, goods),
    price: model.marketPrices?.[goods] ?? Infinity,
  })).sort((left, right) => right.available - left.available
    || left.price - right.price || left.goods.localeCompare(right.goods));
  return rows[0] ?? { goods: 'wheat', available: 0, price: 0 };
}

function stockReleaseReport(events, expectedGoods = null) {
  const operationIndex = events.findIndex(event => event.type === 'operation'
    && event.ok && event.op?.type === 'release_stock'
    && (!expectedGoods || event.op.goods === expectedGoods));
  const operation = events[operationIndex];
  if (!operation) return null;
  const departure = events.slice(operationIndex + 1).find(event => event.type === 'departure'
    && ['walk', 'cart'].includes(event.carrier) && event.goods === operation.op.goods);
  if (!departure) return null;
  return {
    goods: operation.op.goods,
    requestedQty: operation.op.qty,
    qty: departure.qty,
    haulJobId: departure.haulJobId,
  };
}

function orderKey(order) {
  return order ? `${order.g}:${order.qty}:${order.due}` : null;
}

export function orderQuote(model) {
  const offer = model.orderOffer;
  if (!offer) return null;
  const observedLowest = model.marketLowest?.[offer.g];
  const marketLowest = Number.isFinite(observedLowest) ? observedLowest : null;
  let remaining = offer.qty;
  let procurementCost = 0;
  for (const stall of model.stalls
    .filter(row => row.goods === offer.g && row.qty > 1e-9)
    .sort((a, b) => a.price - b.price)) {
    const qty = Math.min(remaining, stall.qty);
    procurementCost += qty * stall.price;
    remaining -= qty;
    if (remaining <= 1e-9) break;
  }
  const marketUnitCost = remaining <= 1e-9
    ? procurementCost / Math.max(offer.qty, 1e-9)
    : null;
  const settlementPrice = offer.price * 1.25;
  const marginPerUnit = marketUnitCost === null ? null : settlementPrice - marketUnitCost;
  return {
    key: orderKey(offer),
    day: model.day,
    goods: offer.g,
    qty: offer.qty,
    due: offer.due,
    basePrice: offer.price,
    settlementPrice,
    marketLowest,
    marketUnitCost,
    marketAvailable: offer.qty - remaining,
    marginPerUnit,
    quotedMargin: marginPerUnit === null ? null : marginPerUnit * offer.qty,
    profitable: marginPerUnit !== null && marginPerUnit > 1e-9,
  };
}

function profitableOrderFacts(state) {
  return state?.goalResults?.['assess-profitable-order']?.evidence?.quote ?? null;
}

function orderMatches(order, facts) {
  return Boolean(order && facts && order.g === facts.goods
    && order.qty === facts.qty && order.due === facts.due);
}

function profitableOrderEconomics(model, state, events) {
  const facts = profitableOrderFacts(state);
  const prior = state?.goalResults?.['complete-profitable-order']?.evidence ?? {};
  const completion = orderCompletedEvent(events);
  if (!facts || (!completion && !prior.completed)) return null;
  const revenueTotal = orderLedgerRevenue(model, facts.goods);
  const purchaseTotal = -ledgerAmountMatching(
    model,
    reason => reason?.endsWith(`から倉庫へ${facts.goods}を買上げ`)
      || reason?.endsWith(`から倉庫へ${facts.goods}を買上げ`),
  );
  const revenue = revenueTotal - (facts.startingRevenueTotal ?? 0);
  const purchases = purchaseTotal - (facts.startingPurchaseTotal ?? 0);
  const orderCost = Math.max(0, purchases);
  return {
    completed: Boolean(completion) || Boolean(prior.completed),
    completionDay: completion?.eventDay ?? completion?.day ?? prior.completionDay ?? model.day,
    goods: facts.goods,
    qty: facts.qty,
    revenue,
    purchases,
    orderCost,
    realizedMargin: revenue - orderCost,
  };
}

function skippableOrderObservation(model, state) {
  const previous = state?.goalResults?.['observe-skippable-order']?.evidence ?? {};
  const seenOffers = [...(previous.seenOffers ?? [])];
  let selected = previous.selected ?? null;
  const quote = orderQuote(model);
  if (quote && !seenOffers.some(row => row.key === quote.key)) {
    seenOffers.push(quote);
    if (!selected) {
      if (quote.marketUnitCost === null) selected = { ...quote, reason: 'insufficient_supply' };
      else if (quote.marginPerUnit < -1e-9) selected = { ...quote, reason: 'loss' };
      else if (seenOffers.length >= ORDER_JUDGMENT_FALLBACK_OFFERS) {
        selected = { ...quote, reason: 'comparison_fallback' };
      }
    }
  }
  return { seenOffers, selected };
}

function offerExpiredEvent(events, expected = null) {
  return events.find(event => event.type === 'notice'
    && event.message?.includes('未受諾の注文状が失効')
    && (!expected || event.message.includes(
      `${goodsLabel(expected.goods)}${Math.round(expected.qty)}荷`,
    ))) ?? null;
}

function toolsPriceRiseObservation(model, state) {
  const previous = state?.goalResults?.['observe-tools-price-rise']?.evidence ?? {};
  const currentPrice = model.marketPrices?.tools ?? 0;
  const newMinimum = !Number.isFinite(previous.minimumPrice)
    || currentPrice < previous.minimumPrice;
  const minimumPrice = newMinimum ? currentPrice : previous.minimumPrice;
  const minimumDay = newMinimum ? model.day : previous.minimumDay;
  const delta = currentPrice - minimumPrice;
  const ratio = minimumPrice > 1e-9 ? currentPrice / minimumPrice - 1 : 0;
  return {
    startDay: previous.startDay ?? model.day,
    startPrice: previous.startPrice ?? currentPrice,
    minimumDay,
    minimumPrice,
    currentDay: model.day,
    currentPrice,
    delta,
    ratio,
    thresholdRatio: TOOLS_PRICE_RISE_RATIO,
    thresholdDelta: TOOLS_PRICE_RISE_DELTA,
    risen: ratio >= TOOLS_PRICE_RISE_RATIO && delta >= TOOLS_PRICE_RISE_DELTA,
  };
}

function conversionWorkshopStatus(model) {
  return CONVERSION_JOB_DEFINITIONS.map(definition => {
    const buildings = motherPortJobBuildings(model, definition.job);
    const occupied = buildings.find(building => building.occupied);
    const household = occupied
      ? model.households.find(row => row.buildingId === occupied.id && row.job === definition.job)
      : null;
    const economics = household
      ? model.conversionEconomics?.find(row => row.householdId === household.id)
      : null;
    return {
      ...definition,
      buildingCount: buildings.length,
      buildingId: occupied?.id ?? buildings[0]?.id ?? null,
      householdId: household?.id ?? null,
      occupied: Boolean(household),
      economics: economics ? { ...economics } : null,
    };
  });
}

function conversionCostChain(model) {
  const rows = conversionWorkshopStatus(model);
  const active = rows.every(row => row.occupied
    && Number.isFinite(row.economics?.cost)
    && row.economics.cost > 0
    && row.economics.productionEma > 0);
  return {
    active,
    rows,
    logPrice: model.marketPrices?.log ?? 0,
    charPrice: model.marketPrices?.char ?? 0,
  };
}

function conversionSurvival(model, state) {
  const previous = state?.goalResults?.['sustain-conversion-workshops']?.evidence ?? {};
  const rows = conversionWorkshopStatus(model);
  const active = rows.every(row => row.occupied);
  const signature = active
    ? rows.map(row => `${row.job}:${row.buildingId}`).join('|')
    : null;
  const continuous = active && previous.signature === signature;
  const startDay = active ? (continuous ? previous.startDay : model.day) : null;
  const elapsedDays = startDay === null ? 0 : model.day - startDay;
  return {
    active,
    signature,
    startDay,
    currentDay: model.day,
    elapsedDays,
    requiredDays: CONVERSION_SURVIVAL_DAYS,
    rows: rows.map(row => ({
      job: row.job,
      label: row.label,
      buildingId: row.buildingId,
      householdId: row.householdId,
      occupied: row.occupied,
    })),
  };
}

function householdLevelUpReport(model, events) {
  const event = events.find(candidate => candidate.type === 'notice'
    && /#\d+ ▲Lv\d+/.test(candidate.message ?? ''));
  if (!event) return null;
  const match = event.message.match(/^([^#]+)#(\d+) ▲Lv(\d+)$/);
  if (!match) return null;
  const householdId = Number(match[2]);
  const internalLevel = Number(match[3]);
  const level = displayCultureLevel(internalLevel);
  const household = model.households.find(row => row.id === householdId);
  const building = model.buildings.find(row => row.id === household?.buildingId);
  return {
    day: event.eventDay ?? event.day ?? model.day,
    message: `${match[1]}#${householdId} ▲Lv${level}`,
    job: match[1],
    householdId,
    internalLevel,
    previousLevel: displayCultureLevel(Math.max(0, internalLevel - 1)),
    level,
    requiredDays: 45 * Math.max(1, internalLevel),
    buildingId: building?.id ?? household?.buildingId ?? null,
    buildingType: building?.type ?? household?.job ?? match[1],
    appearance: building?.appearance ? { ...building.appearance } : null,
  };
}

function noVacancyReport(model, events) {
  const event = events.find(candidate => candidate.type === 'notice'
    && candidate.message?.startsWith('転職不可:')
    && /空.*建物がありません/.test(candidate.message));
  if (!event) return null;
  const match = event.message.match(/^転職不可: ([^#]+)#(\d+)——(.+)$/);
  const targetJob = match?.[3]?.match(/^([^の]+)の空き建物がありません$/)?.[1] ?? null;
  const vacant = model.buildings.filter(building => building.vacant);
  return {
    day: event.eventDay ?? event.day ?? model.day,
    message: event.message,
    previousJob: match?.[1] ?? null,
    householdId: match ? Number(match[2]) : null,
    targetJob,
    vacantBuildingCount: vacant.length,
    targetVacancyCount: targetJob
      ? vacant.filter(building => building.type === targetJob).length
      : vacant.length,
  };
}

function tutorialGraduationFacts(model) {
  const jobCounts = Object.fromEntries([...new Set(model.households.map(row => row.job))]
    .sort()
    .map(job => [job, model.households.filter(row => row.job === job).length]));
  const stableJobCounts = Object.fromEntries(E_STABLE_JOBS.map(job => [
    job,
    model.households.filter(row => row.job === job).length,
  ]));
  const stableJobsPresent = Object.values(stableJobCounts).filter(count => count > 0).length;
  const food = foodFlowMetrics(model);
  const companyIncome = Number.isFinite(model.companyLedgerIncome)
    ? model.companyLedgerIncome
    : model.companyLedger
      .filter(row => row.amount > 0)
      .reduce((total, row) => total + row.amount, 0);
  const companyExpense = Number.isFinite(model.companyLedgerExpense)
    ? model.companyLedgerExpense
    : model.companyLedger
      .filter(row => row.amount < 0)
      .reduce((total, row) => total - row.amount, 0);
  const companyNet = companyIncome - companyExpense;
  const populationBand = [...E_STABLE_POPULATION_BAND];
  return {
    day: model.day,
    population: model.population,
    survivingJobCount: Object.keys(jobCounts).length,
    jobCounts,
    stableJobCounts,
    stableJobsPresent,
    stableJobsRequired: E_STABLE_JOBS.length,
    foodImportEma: food.importEma,
    foodProductionEma: food.productionEma,
    companyIncome,
    companyExpense,
    companyNet,
    companyMoney: model.companyMoney,
    companyBankruptcyDay: model.companyBankruptcyDay,
    reference: {
      years: E_STABLE_YEARS,
      populationBand,
      stableJobs: [...E_STABLE_JOBS],
      foodImportEmaMax: FOOD_IMPORT_EMA_TARGET,
      companyRequiresNoBankruptcy: true,
    },
    comparison: {
      populationInBand: model.population >= populationBand[0]
        && model.population <= populationBand[1],
      allStableJobsPresent: stableJobsPresent === E_STABLE_JOBS.length,
      foodImportWithinTarget: food.importEma < FOOD_IMPORT_EMA_TARGET,
      companySolvent: model.companyBankruptcyDay === null,
    },
  };
}

function loggerTripObservation(model) {
  const household = model.households.find(row => row.job === 'logger'
    && row.tookMarketTripToday && row.marketTripTicks > 0);
  if (!household) return null;
  return {
    householdId: household.id,
    tripTicks: household.marketTripTicks,
    multiplier: household.marketTripEfficiency,
  };
}

function loggerWarningFacts(state) {
  return state?.letters?.find(letter => letter.id === 'logger-trip-warning')?.facts ?? null;
}

function goalCompleted(state, id) {
  return Boolean(state?.completedGoals?.includes(id));
}

function tutorialMarketRecord(model, marketId) {
  return model.marketNetwork?.markets?.find(market => market.id === marketId) ?? null;
}

function tutorialMarketBuilding(model, marketId) {
  return model.buildings.find(building => (
    marketId === 'main'
      ? building.roles?.includes('market')
      : building.marketId === marketId || building.roles?.includes(`market:${marketId}`)
  )) ?? null;
}

function tutorialCaravanRoute(model) {
  return model.caravans?.find(route => route.baseMarketId === 'main'
    && route.destMarketId === 'fishery') ?? null;
}

function tutorialMarketsRoadConnected(model, from, to) {
  if (!from || !to) return false;
  const roads = new Set(model.roadKeys ?? []);
  const start = `${from.x},${from.y}`;
  const finish = `${to.x},${to.y}`;
  if (!roads.has(start) || !roads.has(finish)) return false;
  const queue = [from];
  const visited = new Set();
  while (queue.length > 0) {
    const point = queue.shift();
    const key = `${point.x},${point.y}`;
    if (visited.has(key)) continue;
    if (key === finish) return true;
    visited.add(key);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if ((!dx && !dy) || !roads.has(`${point.x + dx},${point.y + dy}`)) continue;
        queue.push({ x: point.x + dx, y: point.y + dy });
      }
    }
  }
  return false;
}

function householdFoodAmountForTutorial(household) {
  return FOOD_GOODS.reduce((total, goods) => total + pantryAmount(household, goods), 0);
}

function fisheryMarketFacts(model) {
  const households = model.households.filter(household => household.marketId === 'fishery');
  const wheat = households.reduce((total, household) => total + pantryAmount(household, 'wheat'), 0);
  const fish = households.reduce((total, household) => total + pantryAmount(household, 'fish'), 0);
  const purchasedWheat = households.reduce((total, household) => (
    total + (household.lastMarketVisit?.purchased?.wheat ?? 0)
  ), 0);
  const foodDays = households.reduce((total, household) => (
    total + householdFoodAmountForTutorial(household)
  ), 0) / Math.max(1, households.reduce((total, household) => total + household.members, 0));
  return {
    households: households.length,
    population: households.reduce((total, household) => total + household.members, 0),
    wheat,
    fish,
    purchasedWheat,
    foodDays,
  };
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
  const fishers = motherPortJobBuildings(model, 'fisher');
  const vegetables = motherPortJobBuildings(model, 'veg');
  const wheatFarms = motherPortJobBuildings(model, 'wheat');
  const loggerCount = motherPortJobBuildings(model, 'logger').length;
  const fisherWalk = market && fishers.length > 0
    ? Math.max(...fishers.map(building => estimateWalkLen(model, building.entrance, market.entrance)))
    : Infinity;
  const vegWalk = market && vegetables.length > 0
    ? Math.max(...vegetables.map(building => estimateWalkLen(model, building.entrance, market.entrance)))
    : Infinity;
  const wheatWalk = market && wheatFarms.length > 0
    ? Math.max(...wheatFarms.map(building => estimateWalkLen(model, building.entrance, market.entrance)))
    : Infinity;
  return {
    fisher: fishers.length > 0,
    veg: vegetables.length > 0,
    fisherCount: fishers.length,
    vegCount: vegetables.length,
    wheatCount: wheatFarms.length,
    loggerCount,
    fisherWalk,
    vegWalk,
    wheatWalk,
    near: fishers.length >= 2 && vegetables.length >= 1 && wheatFarms.length >= 1
      && fisherWalk <= 14 && vegWalk <= 14 && wheatWalk <= 14,
  };
}

function islandFoodChange(model, state) {
  const before = foodDependenceFacts(state);
  if (!before) return null;
  const current = foodFlowMetrics(model);
  const priceChanged = Math.abs(current.fishPrice - before.fishPrice) >= FOOD_PRICE_CHANGE_MIN
    || Math.abs(current.vegPrice - before.vegPrice) >= FOOD_PRICE_CHANGE_MIN;
  const importChanged = Math.abs(current.importEma - before.importEma) >= FOOD_IMPORT_EMA_CHANGE_MIN;
  // 明示輸入化後は第二章開始時点から輸入EMAが0の島もある。その場合に
  // 「輸入が変化するまで待つ」と、存在しない自動輸入を教程が要求してしまう。
  // 島内生産の立ち上がりと実際の市場価格変化を観測できれば前へ進め、
  // 輸入変化は比較事実としてだけ残す。
  return current.productionEma >= FOOD_PRODUCTION_EMA_MIN && priceChanged
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

const TUTORIAL_GOAL_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'first-road-and-logger',
    chapter: '第一章・最初の一荷',
    title: '森の際まで道を敷く',
    evaluate({ model }) {
      const portRoads = portRoadComponent(model);
      const forestRoads = [...portRoads].filter(key => roadTouchesForest(model, key)).length;
      return {
        complete: forestRoads > 0,
        progress: { done: Number(forestRoads > 0), total: 1 },
        detail: `港から森の際へ届いた道 ${forestRoads}区画`,
        evidence: { connectedRoads: portRoads.size, forestRoads },
      };
    },
  }),
  Object.freeze({
    id: 'first-logger',
    chapter: '第一章・最初の一荷',
    title: '森と道のそばに木こりを置く',
    evaluate({ model }) {
      const loggers = model.buildings.filter(building => building.type === 'logger').length;
      return {
        complete: loggers > 0,
        progress: { done: Number(loggers > 0), total: 1 },
        detail: `木こり ${loggers}棟`,
        evidence: { loggers },
      };
    },
  }),
  Object.freeze({
    id: 'market-for-logs',
    chapter: '第一章・最初の一荷',
    title: '入植船を待つ前に市場を置く',
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
    id: 'request-first-aid',
    chapter: '第一章・最初の一荷',
    title: '最初の食料支援を1回要請する',
    evaluate({ model }) {
      const requests = model.mainlandAid?.requests ?? 0;
      const complete = requests >= 1;
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: complete
          ? `支援 ${requests}回要請済み（以後は逓減します）`
          : `会社の帳場から麦${model.mainlandAid?.nextQty ?? 240}荷を要請し、食料職の立ち上がりを繋ぎます`,
        evidence: { requests, nextQty: model.mainlandAid?.nextQty ?? 0 },
      };
    },
  }),
  Object.freeze({
    id: 'first-settlers-arrive',
    chapter: '第一章・最初の一荷',
    title: '港から市場へ食料を運ぶ人を見ながら、最初の家族を迎える',
    evaluate({ model }) {
      const households = model.households.filter(household => household.job === 'logger').length;
      const daysToJudgment = 15 - (model.day % 15);
      return {
        complete: households > 0,
        progress: { done: Number(households > 0), total: 1 },
        detail: households > 0
          ? `木こりの入植世帯 ${households}世帯 / 島の人口 ${model.population}人`
          : `入植判定まで最大あと${daysToJudgment}日。港から市場へ食料を運ぶ人を一人選び、積み荷が届くまで追ってみましょう`,
        evidence: { households, population: model.population },
      };
    },
  }),
  Object.freeze({
    id: 'place-island-food',
    chapter: '第一章・最初の一荷',
    title: '木工房より先に、漁師2・野菜畑1・麦畑1・木こり3を置く',
    evaluate({ model }) {
      const status = foodBuildingStatus(model);
      const done = Math.min(status.fisherCount, 2)
        + Math.min(status.vegCount, 1)
        + Math.min(status.wheatCount, 1)
        + Math.min(status.loggerCount, 3)
        + Number(status.near);
      return {
        complete: status.fisherCount >= 2 && status.vegCount >= 1
          && status.wheatCount >= 1 && status.loggerCount >= 3 && status.near,
        progress: { done, total: 8 },
        detail: `漁師 ${status.fisherCount}/2棟 / 野菜畑 ${status.vegCount}/1棟 / 麦畑 ${status.wheatCount}/1棟 / 木こり ${status.loggerCount}/3棟`,
        evidence: status,
      };
    },
  }),
  Object.freeze({
    id: 'first-woodshop',
    chapter: '第一章・最初の一荷',
    title: '木工房を置き、木製品づくりを始める',
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
    id: 'warehouse-for-order',
    chapter: '第一章・最初の一荷',
    title: '注文品を中継する物流拠点を置き、道で結ぶ',
    evaluate({ model }) {
      const warehouse = warehouseBuilding(model);
      const connected = warehouseConnected(model);
      const done = Number(Boolean(warehouse)) + Number(connected);
      return {
        complete: Boolean(warehouse) && connected,
        progress: { done, total: 2 },
        detail: warehouse
          ? (connected ? '倉庫が道で結ばれました' : '倉庫はありますが道の外です')
          : '市場で買った注文品を港へ渡す物流拠点を用意します',
        evidence: { warehouse: Boolean(warehouse), connected },
      };
    },
  }),
  Object.freeze({
    id: 'prepare-first-tools-stock',
    chapter: '第一章・最初の一荷',
    title: '木製品の買上げ目標を12荷にする',
    evaluate({ model }) {
      const target = model.stockTargets?.tools ?? 0;
      const stocked = model.companyStock?.tools ?? 0;
      const complete = target >= 12;
      return {
        complete,
        progress: { done: Math.min(target, 12), total: 12 },
        detail: `買上げ目標 ${target}荷 / 倉庫の木製品 ${stocked.toFixed(1)}荷（最初の試し荷12荷を先に準備）`,
        evidence: { target, stocked },
      };
    },
  }),
  Object.freeze({
    id: 'accept-first-order',
    chapter: '第一章・最初の一荷',
    title: '届いた最初の本国注文を受ける',
    evaluate({ model }) {
      const accepted = Boolean(model.activeOrder);
      const offer = model.orderOffer;
      const daysToJudgment = 15 - (model.day % 15);
      const detail = accepted
        ? `受諾済み: ${goodsLabel(model.activeOrder.g)} ${model.activeOrder.qty}荷`
        : offer
          ? `注文状が届いています: ${goodsLabel(offer.g)} ${offer.qty}荷(${offer.due}日目まで)`
          : `次の注文判定まで最大あと${daysToJudgment}日。木工房から市場へ木製品が届く様子を見ましょう`;
      return {
        complete: accepted,
        progress: { done: Number(accepted), total: 1 },
        detail,
        evidence: { accepted, offer: Boolean(offer) },
      };
    },
  }),
  Object.freeze({
    id: 'order-procurement-target',
    chapter: '第一章・最初の一荷',
    title: '注文量以上の買上げ目標を確認する',
    evaluate({ model, events, state }) {
      const order = model.activeOrder;
      const facts = firstOrderFacts(state);
      const goods = order?.g ?? facts?.goods ?? null;
      const required = order?.qty ?? facts?.qty ?? 0;
      const target = goods ? (model.stockTargets?.[goods] ?? 0) : 0;
      const shipped = Boolean(orderCompletedEvent(events));
      const done = shipped || (Boolean(order) && target >= required);
      return {
        complete: done,
        progress: { done: Number(done), total: 1 },
        detail: shipped
          ? '注文は納品済みです。買上げ目標の確認も完了しました'
          : order
          ? (done
            ? `${goodsLabel(order.g)}の買上げ目標 ${target}荷 / 注文 ${required}荷。備えは足りています`
            : `${goodsLabel(order.g)}の買上げ目標を${required}荷以上にしてください（現在${target}荷）`)
          : '注文状は15日ごとの判定日に届きます。受諾後に備えを確認します',
        evidence: { goods, target, required, shipped },
      };
    },
  }),
  Object.freeze({
    id: 'first-order-procurement',
    chapter: '第一章・最初の一荷',
    title: '最初の買付品が倉庫へ届くのを見届ける',
    evaluate({ model, events, state }) {
      const order = model.activeOrder;
      const facts = firstOrderFacts(state);
      const goods = order?.g ?? facts?.goods ?? null;
      const stocked = goods ? (model.companyStock?.[goods] ?? 0) : 0;
      const expired = state?.letters?.find(letter => letter.id === 'accepted-order-expired') ?? null;
      const completion = orderCompletedEvent(events);
      const observedProcurement = state?.letters?.find(letter => (
        ['first-company-procurement', 'first-order-handling', 'first-order-complete']
          .includes(letter.id)
      )) ?? null;
      // 一日をまとめて進めると、倉庫へ着いた品が同じ観測内で港へ出て
      // 在庫が再び0になる。瞬間在庫だけを条件にすると案内が永久停止するため、
      // 後続の船積み・完了記録も「調達を見届けた」確実な証拠として扱う。
      const finishedBetweenObservations = Boolean(facts) && !order
        && state?.completedGoals?.includes('order-procurement-target');
      const complete = stocked > 0 || Boolean(expired) || Boolean(completion)
        || Boolean(observedProcurement) || finishedBetweenObservations;
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: expired
          ? '前の注文は期限切れになりました。原因を確認して次の章へ進めます'
          : order
          ? `倉庫の${goodsLabel(order.g)} ${stocked.toFixed(1)}荷 / 注文 ${order.qty}荷`
          : complete
            ? '買付品は倉庫を経て、すでに港へ運ばれました'
            : '注文の受諾が先です',
        evidence: {
          stocked,
          goods,
          expired: Boolean(expired),
          completion: Boolean(completion),
          observedProcurement: observedProcurement?.id ?? null,
          finishedBetweenObservations,
        },
      };
    },
  }),
  Object.freeze({
    id: 'complete-first-order',
    chapter: '第一章・最初の一荷',
    title: '注文の船積みと船出を見届ける',
    evaluate({ model, events, state }) {
      const completion = orderCompletedEvent(events);
      const completionLetter = state?.letters?.find(letter => letter.id === 'first-order-complete') ?? null;
      const expiryLetter = state?.letters?.find(letter => letter.id === 'accepted-order-expired') ?? null;
      const previous = state?.goalResults?.['complete-first-order']?.evidence ?? {};
      const active = model.activeOrder;
      // まとめ進行では前の必達目標と同じ観測内に注文完遂まで起きる。
      // 完遂イベントから発行済みの書状も永続的な証拠として引き継ぐ。
      const completed = Boolean(completion || completionLetter);
      const expired = Boolean(expiryLetter);
      const exportHandling = events.filter(event => (
        event.type === 'handling' && event.direction === 'export'
      ));
      const acceptedFacts = firstOrderFacts(state);
      const lastOrder = active
        ? { ...active }
        : previous.lastOrder ?? (acceptedFacts ? { ...acceptedFacts, left: 0 } : null);
      const remaining = active?.left ?? lastOrder?.left ?? 0;
      const shipped = active ? Math.max(0, active.qty - active.left) : previous.shipped ?? 0;
      const daysLeft = active ? Math.max(0, active.due - model.day) : 0;
      return {
        complete: completed || expired,
        progress: active
          ? { done: shipped, total: active.qty }
          : { done: Number(completed || expired), total: 1 },
        detail: completed
          ? '最後の一荷を積み、本国注文を納めました'
          : expired
            ? '注文は期限切れになりました。船出だけでは完遂ではないことを確認しました'
            : active
              ? `納品済み ${shipped.toFixed(1)}/${active.qty}荷・残り ${remaining.toFixed(1)}荷・期限まであと${daysLeft}日`
              : '次の注文状を待っています。届いたら会社で受諾してください',
        evidence: {
          completed,
          completionLetter: Boolean(completionLetter),
          expired,
          remaining,
          shipped,
          daysLeft,
          lastOrder,
          exportHandling: exportHandling.length,
          ledgerRows: model.companyLedgerCount,
        },
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
      const previous = state?.goalResults?.['improve-logger-route']?.evidence ?? {};
      const startDay = previous.startDay ?? model.day;
      const observationEnded = model.day - startDay >= 30;
      const alreadyGood = Boolean(current && !warning
        && current.tripTicks <= LOGGER_TRIP_WARNING_TICKS);
      const complete = Boolean(recovered) || alreadyGood || observationEnded;
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: observationEnded && !current
          ? '30日観察して買い物が起きなかったため、これ以上待たず次へ進みます'
          : current
            ? `市場への往復 ${current.tripTicks.toFixed(1)}刻 / 丸太を切る時間 ${(current.multiplier * 100).toFixed(0)}%`
            : `木こりの次の買い物を観察中（あと最大${Math.max(0, 30 - (model.day - startDay))}日）`,
        evidence: {
          startDay,
          tripTicks: current?.tripTicks ?? null,
          multiplier: current?.multiplier ?? null,
          warned: Boolean(warning),
          recovered: Boolean(recovered),
          alreadyGood,
          observationEnded,
        },
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
        detail: `最近一日あたり: 島の食料 ${metrics.productionEma.toFixed(2)}荷 / 本土購入 ${metrics.importEma.toFixed(2)}荷`,
        evidence: { ...metrics, changed: Boolean(change) },
      };
    },
  }),
  Object.freeze({
    id: 'reduce-food-imports',
    chapter: '第二章・島の食卓',
    title: '本土から買う食料を一日0.60荷未満に保つ',
    evaluate({ model }) {
      const metrics = foodFlowMetrics(model);
      const complete = metrics.productionEma >= FOOD_PRODUCTION_EMA_MIN
        && metrics.importEma < FOOD_IMPORT_EMA_TARGET;
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: `最近一日あたり: 本土購入 ${metrics.importEma.toFixed(2)}荷 / 島の生産 ${metrics.productionEma.toFixed(2)}荷`,
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
        detail: issued ? '島の食卓についての報告書が届きました' : '本土から買う食料の減り方を確かめています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'observe-seasonal-food-valley',
    chapter: '第三章・倉庫の備え',
    title: '市場の余剰が薄くなる季節を見届ける',
    evaluate({ model, state }) {
      const observation = seasonalFoodValley(model, state);
      const valley = observation.valley;
      return {
        complete: Boolean(valley),
        progress: { done: Number(Boolean(valley)), total: 1 },
        detail: valley
          ? `${goodsLabel(valley.goods)} ${valley.peakAvailability.toFixed(1)}→${valley.available.toFixed(1)}荷 / 相場 ${(valley.price * 10).toFixed(1)}デナリ`
          : '魚・野菜・麦の余剰と相場を観測中です',
        evidence: observation,
      };
    },
  }),
  Object.freeze({
    id: 'set-seasonal-stock-target',
    chapter: '第三章・倉庫の備え',
    title: '注文の買付を閉じ、食料の備えを定める',
    evaluate({ model, state }) {
      const reserve = seasonalReserveFacts(model, state);
      const firstGoods = firstOrderFacts(state)?.goods ?? null;
      const target = model.stockTargets?.[reserve.goods] ?? 0;
      const staleTarget = firstGoods && firstGoods !== reserve.goods
        ? (model.stockTargets?.[firstGoods] ?? 0) : 0;
      const targetReady = target >= SEASONAL_RESERVE_TARGET;
      const oldTargetClosed = staleTarget <= 0;
      return {
        complete: targetReady && oldTargetClosed,
        progress: { done: Number(oldTargetClosed) + Number(targetReady), total: 2 },
        detail: `${goodsLabel(firstGoods)}の旧目標 ${staleTarget} / ${goodsLabel(reserve.goods)}の備え ${target}/${SEASONAL_RESERVE_TARGET}荷`,
        evidence: {
          goods: reserve.goods,
          target,
          requiredTarget: SEASONAL_RESERVE_TARGET,
          firstOrderGoods: firstGoods,
          staleTarget,
        },
      };
    },
  }),
  Object.freeze({
    id: 'fill-seasonal-reserve',
    chapter: '第三章・倉庫の備え',
    title: '余剰が会社の倉庫へ届くのを見届ける',
    evaluate({ model, state }) {
      const reserve = seasonalReserveFacts(model, state);
      const stock = model.companyStock?.[reserve.goods] ?? 0;
      return {
        complete: stock > 0,
        progress: { done: Number(stock > 0), total: 1 },
        detail: `倉庫の${goodsLabel(reserve.goods)} ${stock.toFixed(1)}荷 / 目標 ${model.stockTargets?.[reserve.goods] ?? 0}荷`,
        evidence: {
          goods: reserve.goods,
          stock,
          averageCost: model.companyStockAverageCosts?.[reserve.goods] ?? null,
        },
      };
    },
  }),
  Object.freeze({
    id: 'release-seasonal-reserve',
    chapter: '第三章・倉庫の備え',
    title: '次の在庫谷で倉庫の備えを市場へ出す',
    evaluate({ model, events, state }) {
      const valley = seasonalValleyFacts(state);
      const observation = valley
        ? seasonalFoodValley(model, state, 'release-seasonal-reserve', [valley.goods])
        : { observations: {}, valley: null };
      const prior = state?.goalResults?.['release-seasonal-reserve']?.evidence ?? {};
      const release = stockReleaseReport(events, valley?.goods ?? null);
      const averageCost = model.companyStockAverageCosts?.[valley?.goods] ?? prior.averageCost ?? null;
      const stock = model.companyStock?.[valley?.goods] ?? 0;
      const ready = Boolean(observation.valley) && (stock > 0 || prior.stock > 0);
      const complete = Boolean(release) && (ready || prior.ready);
      const reportedReady = release ? (ready || prior.ready) : ready;
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: valley
          ? (ready
            ? `${goodsLabel(valley.goods)}が再び薄くなりました。倉庫の備えを市場へ出せます`
            : `${goodsLabel(valley.goods)} ${marketGoodsAvailability(model, valley.goods).toFixed(1)}荷 / 倉庫 ${stock.toFixed(1)}荷`)
          : '市場の在庫谷を観測しています',
        evidence: {
          ...observation,
          goods: valley?.goods ?? null,
          stock,
          averageCost,
          ready: reportedReady,
          release,
        },
      };
    },
  }),
  Object.freeze({
    id: 'close-third-chapter',
    chapter: '第三章・倉庫の備え',
    title: '第三章の備蓄報告を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-three-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '仕入原価と実際の売値の報告書が届きました' : '荷車が市場へ着くのを待っています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'assess-profitable-order',
    chapter: '第三章・本国の注文',
    title: '決済単価と注文全量の加重原価を比べる',
    evaluate({ model }) {
      const quote = orderQuote(model);
      const complete = Boolean(quote?.profitable);
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: quote
          ? `${goodsLabel(quote.goods)}: 決済 ${(quote.settlementPrice * 10).toFixed(1)} / 全量仕入 ${quote.marketUnitCost === null ? `${quote.marketAvailable.toFixed(1)}/${quote.qty}荷` : `${(quote.marketUnitCost * 10).toFixed(1)}デナリ`}`
          : '次の注文状と、その時の全量仕入原価を待っています',
        evidence: {
          quote: quote ? {
            ...quote,
            ledgerCount: model.companyLedgerCount,
            startingRevenueTotal: orderLedgerRevenue(model, quote.goods),
            startingPurchaseTotal: -ledgerAmountMatching(
              model,
              reason => reason?.endsWith(`から倉庫へ${quote.goods}を買上げ`)
                || reason?.endsWith(`から倉庫へ${quote.goods}を買上げ`),
            ),
          } : null,
        },
      };
    },
  }),
  Object.freeze({
    id: 'accept-profitable-order',
    chapter: '第三章・本国の注文',
    title: '黒字を見込める注文を受諾する',
    evaluate({ model, state }) {
      const facts = profitableOrderFacts(state);
      const accepted = orderMatches(model.activeOrder, facts);
      return {
        complete: accepted,
        progress: { done: Number(accepted), total: 1 },
        detail: accepted
          ? `${goodsLabel(facts.goods)} ${facts.qty}荷を受諾しました`
          : '会社の注文欄で、比較した注文を受諾してください',
        evidence: { accepted, orderKey: orderKey(model.activeOrder) },
      };
    },
  }),
  Object.freeze({
    id: 'target-profitable-order',
    chapter: '第三章・本国の注文',
    title: '買上げ目標を注文数まで定める',
    evaluate({ model, state }) {
      const facts = profitableOrderFacts(state);
      const target = facts ? (model.stockTargets?.[facts.goods] ?? 0) : 0;
      const complete = Boolean(facts && orderMatches(model.activeOrder, facts)
        && target >= facts.qty);
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: facts
          ? `${goodsLabel(facts.goods)}の買上げ目標 ${target}/${facts.qty}荷`
          : '注文の比較を待っています',
        evidence: { goods: facts?.goods ?? null, target, required: facts?.qty ?? 0 },
      };
    },
  }),
  Object.freeze({
    id: 'complete-profitable-order',
    chapter: '第三章・本国の注文',
    title: '注文を完遂し、実現した粗利を確かめる',
    evaluate({ model, events, state }) {
      const economics = profitableOrderEconomics(model, state, events);
      const complete = Boolean(economics?.completed && economics.revenue > 0
        && economics.realizedMargin > 1e-9);
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: economics?.completed
          ? `実売上 ${toDenari(economics.revenue).toFixed(1)}デナリ / 出荷原価 ${toDenari(economics.orderCost).toFixed(1)}デナリ / 粗利 ${toDenari(economics.realizedMargin).toFixed(1)}デナリ`
          : '市場→倉庫→港→船の実物流で注文を納めています',
        evidence: economics ?? { completed: false },
      };
    },
  }),
  Object.freeze({
    id: 'observe-skippable-order',
    chapter: '第三章・本国の注文',
    title: '受けない注文を、数字から選ぶ',
    evaluate({ model, state }) {
      const observation = skippableOrderObservation(model, state);
      const { selected } = observation;
      return {
        complete: Boolean(selected),
        progress: {
          done: Math.min(observation.seenOffers.length, ORDER_JUDGMENT_FALLBACK_OFFERS),
          total: ORDER_JUDGMENT_FALLBACK_OFFERS,
        },
        detail: selected
          ? `${goodsLabel(selected.goods)}: ${selected.reason === 'loss' ? '採算割れ' : selected.reason === 'no_market' ? '市場在庫なし' : '比較確認の代替課題'}`
          : `注文を${observation.seenOffers.length}件比較しました。採算割れがなければ${ORDER_JUDGMENT_FALLBACK_OFFERS}件目を確認課題にします`,
        evidence: observation,
      };
    },
  }),
  Object.freeze({
    id: 'let-skippable-order-expire',
    chapter: '第三章・本国の注文',
    title: '注文を受諾せず、期限切れを見届ける',
    evaluate({ model, events, state }) {
      const selected = state?.goalResults?.['observe-skippable-order']?.evidence?.selected ?? null;
      const prior = state?.goalResults?.['let-skippable-order-expire']?.evidence ?? {};
      const candidateAccepted = Boolean(prior.candidateAccepted
        || orderMatches(model.activeOrder, selected));
      const exactExpiry = offerExpiredEvent(events, selected);
      const recoveryExpiry = candidateAccepted ? offerExpiredEvent(events) : null;
      const expired = exactExpiry ?? recoveryExpiry;
      return {
        complete: Boolean(expired),
        progress: { done: Number(Boolean(expired)), total: 1 },
        detail: expired
          ? `${expired.eventDay ?? expired.day}日目に未受諾の注文状が失効しました`
          : candidateAccepted
            ? '比較した注文は受諾済みです。決着後、次の注文を受けずに見送れます'
            : selected
              ? `${goodsLabel(selected.goods)} ${selected.qty}荷・期限${selected.due}日目まで受諾せずに待ちます`
              : '見送る注文を比較しています',
        evidence: {
          selected,
          candidateAccepted,
          expired: expired ? {
            day: expired.eventDay ?? expired.day,
            message: expired.message,
            exact: Boolean(exactExpiry),
          } : null,
        },
      };
    },
  }),
  Object.freeze({
    id: 'close-fourth-chapter',
    chapter: '第三章・本国の注文',
    title: '第三章の商い判断報告を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-four-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '利益を得た注文と、見送った注文の報告書が届きました' : '未受諾注文の失効報告を待っています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'observe-tools-price-rise',
    chapter: '第四章・島の手仕事',
    title: '木製品相場の立ち上がりを見届ける',
    evaluate({ model, state }) {
      const observation = toolsPriceRiseObservation(model, state);
      return {
        complete: observation.risen,
        progress: {
          done: Math.min(observation.ratio, TOOLS_PRICE_RISE_RATIO),
          total: TOOLS_PRICE_RISE_RATIO,
        },
        detail: `木製品 ${(observation.minimumPrice * 10).toFixed(1)}→${(observation.currentPrice * 10).toFixed(1)}デナリ/荷（底から${(observation.ratio * 100).toFixed(1)}%）`,
        evidence: observation,
      };
    },
  }),
  Object.freeze({
    id: 'place-conversion-workshops',
    chapter: '第四章・島の手仕事',
    title: '木工房・炭焼き小屋・塩田を揃える',
    evaluate({ model }) {
      const rows = conversionWorkshopStatus(model);
      const done = rows.filter(row => row.buildingCount > 0).length;
      return {
        complete: done === rows.length,
        progress: { done, total: rows.length },
        detail: rows.map(row => `${row.label} ${row.buildingCount}棟`).join(' / '),
        evidence: { rows },
      };
    },
  }),
  Object.freeze({
    id: 'observe-conversion-cost-chain',
    chapter: '第四章・島の手仕事',
    title: '三つの手仕事へ原料が流れるのを待つ',
    evaluate({ model }) {
      const chain = conversionCostChain(model);
      const done = chain.rows.filter(row => row.occupied
        && Number.isFinite(row.economics?.cost)
        && row.economics.cost > 0
        && row.economics.productionEma > 0).length;
      return {
        complete: chain.active,
        progress: { done, total: chain.rows.length },
        detail: chain.rows.map(row => (
          `${row.label} ${row.occupied ? `最近一日 ${(row.economics?.productionEma ?? 0).toFixed(2)}荷` : '働く家族を待っています'}`
        )).join(' / '),
        evidence: chain,
      };
    },
  }),
  Object.freeze({
    id: 'sustain-conversion-workshops',
    chapter: '第四章・島の手仕事',
    title: '三つの手仕事を90日存続させる',
    evaluate({ model, state }) {
      const survival = conversionSurvival(model, state);
      const complete = survival.active && survival.elapsedDays >= CONVERSION_SURVIVAL_DAYS;
      return {
        complete,
        progress: {
          done: Math.min(survival.elapsedDays, CONVERSION_SURVIVAL_DAYS),
          total: CONVERSION_SURVIVAL_DAYS,
        },
        detail: survival.active
          ? `連続 ${survival.elapsedDays}/${CONVERSION_SURVIVAL_DAYS}日`
          : '木工房・炭焼き小屋・塩田の入植がすべて続くのを待っています',
        evidence: survival,
      };
    },
  }),
  Object.freeze({
    id: 'observe-household-level-up',
    chapter: '第四章・島の手仕事',
    title: '暮らしの等級が上がった建物を確かめる',
    evaluate({ state }) {
      const letter = state?.letters?.find(candidate => candidate.id === 'household-level-up');
      return {
        complete: Boolean(letter),
        progress: { done: Number(Boolean(letter)), total: 1 },
        detail: letter
          ? `${letter.facts.job}#${letter.facts.householdId}がLv${letter.facts.level}へ上がりました`
          : '文化財が暮らしへ届き、実際のLv上昇が起きるのを待っています',
        evidence: { levelUp: letter?.facts ?? null },
      };
    },
  }),
  Object.freeze({
    id: 'close-fifth-chapter',
    chapter: '第四章・島の手仕事',
    title: '第四章の手仕事と暮らしの報告を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-five-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '90日の存続と暮らしの成長報告が届きました' : '第四章の報告をまとめています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'inspect-second-market-road',
    chapter: '第五章・二つ目の市場',
    title: '二市場と峠道を確認する',
    evaluate({ model, state }) {
      const main = tutorialMarketRecord(model, 'main');
      const fishery = tutorialMarketRecord(model, 'fishery');
      const issued = state?.letters?.some(letter => letter.id === 'second-market-call') ?? false;
      const mainBuilding = tutorialMarketBuilding(model, 'main');
      const fisheryBuilding = tutorialMarketBuilding(model, 'fishery');
      const roadReady = Boolean(mainBuilding && fisheryBuilding
        && tutorialMarketsRoadConnected(model, mainBuilding.entrance, fisheryBuilding.entrance));
      const complete = issued && roadReady;
      return {
        complete,
        progress: { done: Number(issued) + Number(roadReady), total: 2 },
        detail: roadReady
          ? '母港市場と漁郷市場の入口は荷車道で結ばれています'
          : '母港市場から漁郷市場まで、途切れた道路がないか確かめます',
        evidence: { issued, roadReady, main, fishery, fisheryFacts: fisheryMarketFacts(model) },
      };
    },
  }),
  Object.freeze({
    id: 'build-caravan-inn',
    chapter: '第五章・二つ目の市場',
    title: '母港市場圏へ隊商宿を建てる',
    evaluate({ model }) {
      const inns = motherPortJobBuildings(model, 'carter');
      return {
        complete: inns.length > 0,
        progress: { done: Number(inns.length > 0), total: 1 },
        detail: `母港市場圏の隊商宿 ${inns.length}棟`,
        evidence: { buildingIds: inns.map(building => building.id) },
      };
    },
  }),
  Object.freeze({
    id: 'staff-caravan-inn',
    chapter: '第五章・二つ目の市場',
    title: '募集人数と日給を決め、御者を迎える',
    evaluate({ model }) {
      const inn = motherPortJobBuildings(model, 'carter')[0] ?? null;
      const wage = inn?.caravanEmployment?.wage ?? 0;
      const recruitment = inn?.caravanEmployment?.recruitment ?? 0;
      const median = inn?.caravanWageMarket?.median ?? 0;
      const crew = inn?.caravanCrew ?? 0;
      const complete = crew > 0 && recruitment > 0 && wage + 1e-9 >= median;
      return {
        complete,
        progress: { done: Number(inn !== null) + Number(crew > 0), total: 2 },
        detail: inn
          ? `募集 ${recruitment}人・日給${toDenari(wage).toFixed(1)}デナリ・月額${toDenari(wage * recruitment * 30).toFixed(0)}デナリ / 島の日当中央値${toDenari(median).toFixed(1)}デナリ / 御者 ${crew}人`
          : '隊商宿を待っています',
        evidence: { buildingId: inn?.id ?? null, recruitment, wage, median, crew },
      };
    },
  }),
  Object.freeze({
    id: 'wait-main-wheat-stock',
    chapter: '第五章・二つ目の市場',
    title: '母港市場へ初便の麦が並ぶのを待つ',
    evaluate({ model }) {
      const wheat = marketStallAvailability(model, 'wheat', 'main');
      const complete = wheat >= 8;
      return {
        complete,
        progress: { done: Math.min(wheat, 8), total: 8 },
        detail: `母港市場の麦 ${wheat.toFixed(1)}/8.0荷（麦畑は9月半ばに収穫）`,
        evidence: { wheat, required: 8, day: model.day },
      };
    },
  }),
  Object.freeze({
    id: 'configure-first-caravan-route',
    chapter: '第五章・二つ目の市場',
    title: '麦を行き荷、魚を帰り荷にする',
    evaluate({ model }) {
      const route = tutorialCaravanRoute(model);
      const goodsReady = Boolean(route?.goodsOut?.includes('wheat') && route?.goodsBack?.includes('fish'));
      return {
        complete: goodsReady,
        progress: { done: Number(Boolean(route)) + Number(goodsReady), total: 2 },
        detail: route
          ? `行き荷 ${route.goodsOut.map(goodsLabel).join('・') || 'なし'} / 帰り荷 ${route.goodsBack.map(goodsLabel).join('・') || 'なし'}`
          : '隊商宿で漁郷市場への路線を定めます',
        evidence: { routeId: route?.id ?? null, goodsOut: route?.goodsOut ?? [], goodsBack: route?.goodsBack ?? [] },
      };
    },
  }),
  Object.freeze({
    id: 'watch-first-caravan-depart',
    chapter: '第五章・二つ目の市場',
    title: '麦を積んだ初便の出発を見る',
    evaluate({ model }) {
      const route = tutorialCaravanRoute(model);
      const current = route?.currentTrip ?? null;
      const wheat = current?.outbound?.wheat ?? 0;
      const complete = Boolean(current && route.state === 'outbound' && wheat > 1e-9);
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: current ? `第一便の行き荷 麦${wheat.toFixed(1)}荷 / ${route.status.label}` : '第一便の出発を待っています',
        evidence: { routeId: route?.id ?? null, state: route?.state ?? null, trip: current },
      };
    },
  }),
  Object.freeze({
    id: 'watch-first-caravan-arrive',
    chapter: '第五章・二つ目の市場',
    title: '漁郷へ麦が届くのを見る',
    evaluate({ model }) {
      const route = tutorialCaravanRoute(model);
      const current = route?.currentTrip ?? null;
      const wheat = current?.outbound?.wheat ?? 0;
      const arrived = Boolean(current && route.state === 'returning'
        && Number.isFinite(current.outboundTicks) && wheat > 1e-9);
      return {
        complete: arrived,
        progress: { done: Number(arrived), total: 1 },
        detail: arrived ? `麦${wheat.toFixed(1)}荷を降ろし、帰路へ入りました` : '麦を積んだ荷車が漁郷へ着くのを待っています',
        evidence: { routeId: route?.id ?? null, state: route?.state ?? null, trip: current },
      };
    },
  }),
  Object.freeze({
    id: 'read-first-caravan-receipt',
    chapter: '第五章・二つ目の市場',
    title: '帰着した第一便のレシートを読む',
    evaluate({ model }) {
      const route = tutorialCaravanRoute(model);
      const trip = route?.recentTrips?.[0] ?? null;
      return {
        complete: Boolean(trip),
        progress: { done: Number(Boolean(trip)), total: 1 },
        detail: trip
          ? `仕入${toDenari(trip.procurement ?? 0).toFixed(0)}・売上${toDenari(trip.retailSales ?? 0).toFixed(0)}・給料${toDenari(trip.wages ?? 0).toFixed(0)}・荷車${toDenari(trip.cartCosts ?? 0).toFixed(0)}デナリ`
          : '第一便が母港へ帰るのを待っています',
        evidence: { routeId: route?.id ?? null, trip },
      };
    },
  }),
  Object.freeze({
    id: 'observe-second-market-result',
    chapter: '第五章・二つ目の市場',
    title: '漁郷の麦購入と今月収支を確かめる',
    evaluate({ model }) {
      const route = tutorialCaravanRoute(model);
      const facts = fisheryMarketFacts(model);
      const receipt = route?.recentTrips?.[0] ?? null;
      const accounting = route?.accounting?.current ?? null;
      const receivedWheat = receipt?.outbound?.wheat ?? 0;
      const receivedAtMarket = (route?.diagnosis?.unsold ?? []).some(row => (
        row.marketId === 'fishery' && row.goods === 'wheat' && row.qty > 1e-9
      ));
      const purchased = facts.purchasedWheat > 1e-9;
      const complete = Boolean(receipt && receivedWheat > 1e-9 && purchased && accounting);
      return {
        complete,
        progress: { done: Number(Boolean(receipt)) + Number(purchased), total: 2 },
        detail: accounting
          ? `${purchased ? `漁郷の麦購入${facts.purchasedWheat.toFixed(1)}荷` : receivedAtMarket ? '麦は漁郷市場で買い手を待っています' : '漁郷への麦到着を確認中'} / 今月 売上${toDenari(accounting.sales).toFixed(0)}－仕入${toDenari(accounting.procurement).toFixed(0)}－給料${toDenari(accounting.wages).toFixed(0)}－荷車${toDenari(accounting.cartCosts).toFixed(0)}＝差引${toDenari(accounting.profit).toFixed(0)}デナリ`
          : '初便の帰着後に漁郷の家族と隊商収支を確かめます',
        evidence: { routeId: route?.id ?? null, receipt, accounting, fishery: facts, receivedAtMarket },
      };
    },
  }),
  Object.freeze({
    id: 'close-sixth-chapter',
    chapter: '第五章・二つ目の市場',
    title: '第五章の実便報告を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-six-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '初便の荷・暮らし・収支の報告が届きました' : '第一便の報告をまとめています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'graduate-governor',
    chapter: '終章・総督の島',
    title: '卒業書状を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'tutorial-graduation'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued
          ? '案内が終わり、同じ島で自由に続けられます'
          : '第五章までの実測を卒業書状へまとめています',
        evidence: { issued },
      };
    },
  }),
]);

export const TUTORIAL_GOALS = Object.freeze(TUTORIAL_GOAL_DEFINITIONS.filter(
  goal => !TUTORIAL_DEFERRED_COMPANY_STOCK_GOALS.has(goal.id),
));

// 創発を待つ観察課題は案内の進行を止めない。条件が実際に起きた時だけ
// エレナの報告・助言として回収し、建設や設定など直接操作できる課題を背骨にする。
export const TUTORIAL_OPTIONAL_GOAL_IDS = Object.freeze([
  'observe-island-food-change',
  'reduce-food-imports',
  'assess-profitable-order',
  'accept-profitable-order',
  'complete-profitable-order',
  'observe-skippable-order',
  'let-skippable-order-expire',
  'observe-tools-price-rise',
  'observe-conversion-cost-chain',
  'sustain-conversion-workshops',
  'observe-household-level-up',
]);

export function isRequiredTutorialGoal(goal) {
  return Boolean(goal) && !TUTORIAL_OPTIONAL_GOAL_IDS.includes(goal.id);
}

// 非必須の観察課題も、対応する章へ入るまでは評価しない。
// 必須/任意と開始時期を分離し、未来章の出来事が案内を先回りするのを防ぐ。
export const TUTORIAL_GOAL_START_AFTER = Object.freeze({
  'observe-island-food-change': 'close-first-chapter',
  'reduce-food-imports': 'close-first-chapter',
  'assess-profitable-order': 'close-second-chapter',
  'accept-profitable-order': 'assess-profitable-order',
  'complete-profitable-order': 'accept-profitable-order',
  'observe-skippable-order': 'complete-profitable-order',
  'let-skippable-order-expire': 'observe-skippable-order',
  'observe-tools-price-rise': 'close-fourth-chapter',
  'observe-conversion-cost-chain': 'place-conversion-workshops',
  'sustain-conversion-workshops': 'place-conversion-workshops',
  'observe-household-level-up': 'place-conversion-workshops',
  'wait-main-wheat-stock': 'staff-caravan-inn',
});

export function isTutorialGoalUnlocked(goal, state) {
  if (!goal) return false;
  const prerequisite = TUTORIAL_GOAL_START_AFTER[goal.id];
  return !prerequisite || Boolean(state?.completedGoals?.includes(prerequisite));
}

function adviceEventSequence(event) {
  return event?.sequence ?? `${event?.day ?? 0}:${event?.message ?? ''}`;
}

const TUTORIAL_ADVICE_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'annual-autumn-food-forecast',
    channel: 'message',
    repeatAfterDays: 300,
    evaluate({ model, previous = {} }) {
      const calendar = islandCalendar(model.day, model.calendarOffsetDays);
      const { month, year } = calendar;
      const active = month === 9 && previous.announcedYear !== year;
      const food = islandFoodSummary(model);
      const forecast = tutorialWinterFoodForecast(model);
      const intervention = tutorialFoodIntervention(model);
      return {
        active,
        completed: false,
        evidence: active ? { announcedYear: year } : previous,
        priority: 'info',
        kicker: '秋の冬支度',
        title: `冬までにあと${Math.ceil(forecast.shortage)}荷`,
        detail: `いまの食料は約${Math.floor(food.runwayDays)}日分。冬越しの目安は${forecast.required}荷、家と市場にある食料は${Math.floor(forecast.reserve)}荷です。`,
        speech: forecast.sufficient
          ? `冬が来ます。畑は休み、魚と蓄えで越します。いま食べられる分は約${Math.floor(food.runwayDays)}日分、冬越しの備えは足りています。`
          : `冬が来ます。畑は休み、魚と蓄えで越します。いま食べられる分は約${Math.floor(food.runwayDays)}日分、冬越しにはあと${Math.ceil(forecast.shortage)}荷必要です。${intervention.speech}`,
        target: null,
      };
    },
  }),
  Object.freeze({
    id: 'large-food-spoilage',
    channel: 'message',
    repeatAfterDays: 20,
    evaluate({ model, previous = {} }) {
      const current = Number(model.spoilTotal ?? 0);
      const before = Number(previous.spoilTotal);
      const lost = Number.isFinite(before) ? Math.max(0, current - before) : 0;
      return {
        active: lost >= 5,
        completed: false,
        evidence: { spoilTotal: current },
        priority: 'info',
        kicker: '食料の廃棄',
        title: `食料が${Math.floor(lost)}荷傷みました`,
        detail: '魚は約5日、野菜は約30日で傷みます。作る量と家族が買う量、市場への道を見直しましょう。',
        speech: `食料が${Math.floor(lost)}荷傷みました。［需給］で魚と野菜の供給と消費を比べ、余っている生産施設と市場への道を見直しましょう。`,
        target: { kind: 'sheet', sheet: 'supply-sheet' },
      };
    },
  }),
  Object.freeze({
    id: 'seasonal-release-opportunity',
    channel: 'advice',
    startAfter: 'set-seasonal-stock-target',
    repeatAfterDays: 5,
    evaluate({ model, events, state, previous = {} }) {
      const reserve = seasonalReserveFacts(model, state);
      const goods = reserve.goods;
      const available = marketGoodsAvailability(model, goods);
      const stock = model.companyStock?.[goods] ?? 0;
      const peakAvailability = Math.max(previous.peakAvailability ?? 0, available);
      const release = stockReleaseReport(events, goods);
      const completed = Boolean(release);
      const ready = !completed && stock > 0 && peakAvailability >= SEASONAL_SURPLUS_MIN
        && available <= peakAvailability * SEASONAL_VALLEY_RATIO;
      return {
        active: ready,
        completed,
        evidence: { goods, available, stock, peakAvailability, release },
        priority: 'action',
        kicker: 'エレナの適時アドバイス',
        title: `${goodsLabel(goods)}の備えを使う好機です`,
        detail: `市場 ${available.toFixed(1)}荷・倉庫 ${stock.toFixed(1)}荷。取引を開き、市場へ出す量を決められます。`,
        speech: `市場の${goodsLabel(goods)}が少なくなりました。倉庫にある${stock.toFixed(0)}荷を市場へ戻し、家族が買えるようにしましょう。`,
        target: { kind: 'sheet', sheet: 'company-sheet' },
      };
    },
  }),
  Object.freeze({
    id: 'household-hunger-warning',
    channel: 'advice',
    repeatAfterDays: 10,
    dismissWhenInactive: true,
    evaluate({ model }) {
      const household = [...model.households].sort(
        (left, right) => (right.hungerRun ?? 0) - (left.hungerRun ?? 0),
      )[0] ?? null;
      const hungerRun = household?.hungerRun ?? 0;
      const building = model.buildings.find(row => row.id === household?.buildingId) ?? null;
      const family = household?.familyName ? `${household.familyName}家` : `世帯#${household?.id ?? '—'}`;
      const job = JOB_LABELS[household?.job] ?? household?.job ?? '住民';
      const subject = `${job}の${family}`;
      const intervention = tutorialFoodIntervention(model);
      return {
        active: hungerRun >= 30,
        completed: false,
        evidence: { householdId: household?.id ?? null, hungerRun },
        priority: 'action',
        kicker: 'エレナの早期警告',
        title: `${subject}の食料が危険です`,
        detail: `必要な食料を${hungerRun}日連続で食べられていません。60日に達すると家族が亡くなります。${intervention.speech}`,
        speech: `${subject}は食べ物を得られない日が続いています。${intervention.speech}`,
        target: building ? { kind: 'building-detail', buildingId: building.id } : { kind: 'sheet', sheet: 'island-sheet' },
      };
    },
  }),
  Object.freeze({
    id: 'building-level-up-celebration',
    channel: 'message',
    repeatAfterDays: 0,
    evaluate({ model, events, previous = {} }) {
      const report = householdLevelUpReport(model, events);
      const event = events.find(candidate => candidate.type === 'notice'
        && /#\d+ ▲Lv\d+/.test(candidate.message ?? ''));
      const sequence = adviceEventSequence(event);
      const fresh = Boolean(report) && sequence !== previous.sequence;
      const household = model.households.find(row => row.id === report?.householdId);
      const requirement = household?.cultureGrowth?.achievedRequirement;
      const requirementLabel = LIVING_REQUIREMENT_LABELS[requirement] ?? requirement ?? '必要な暮らしの品';
      const job = JOB_LABELS[report?.buildingType] ?? report?.job ?? '建物';
      return {
        active: fresh,
        completed: false,
        evidence: { sequence },
        priority: 'info',
        kicker: '暮らしの成長',
        title: `${job}がLv${report?.level ?? '—'}へ成長しました！`,
        detail: `${requirementLabel}を含む暮らしを${report?.requiredDays ?? 45}日積み重ねた成果です。建物を開くと、次の成長条件と日数が分かります。`,
        speech: `お見事です。${job}がLv${report?.level ?? '—'}へ育ちました。${requirementLabel}のある暮らしが続いた成果です。`,
        target: report?.buildingId ? { kind: 'building-detail', buildingId: report.buildingId } : null,
      };
    },
  }),
  Object.freeze({
    id: 'resident-death-message',
    channel: 'message',
    repeatAfterDays: 0,
    evaluate({ model, events, previous = {} }) {
      const death = [...events].reverse().find(event => event.type === 'death');
      const sequence = adviceEventSequence(death);
      const fresh = Boolean(death) && sequence !== previous.sequence;
      const familyHead = death?.message?.match(/^☠\s*([^家]+)家/)?.[1];
      const household = model.households.find(row => row.id === death?.householdId);
      const family = household?.familyName ?? familyHead ?? death?.familyName ?? null;
      const job = JOB_LABELS[household?.job ?? death?.job] ?? household?.job ?? death?.job ?? '住民';
      const subject = family ? `${job}の${family}家` : `${job}の家族`;
      const happened = death?.message?.includes('離散')
        ? `${subject}が、島を出ていきました。`
        : `${subject}で、食べ物を得られず亡くなった方がいます。`;
      const intervention = tutorialFoodIntervention(model);
      return {
        active: fresh,
        completed: false,
        evidence: { sequence },
        priority: 'info',
        kicker: 'エレナからの報告',
        title: '島の住民が亡くなりました',
        detail: death
          ? `${death.message}。必要な食料を60日連続で食べられなかったためです。家の食料庫、市場への道、漁師・野菜畑を確認すると次の死を防げます。`
          : `${model.day}日目の人口変化です。統計で食料と暮らしを確認できます。`,
        speech: death
          ? `${happened}${intervention.speech}`
          : '',
        target: death?.sequence ? { kind: 'event', sequence: death.sequence } : null,
      };
    },
  }),
]);

export const TUTORIAL_ADVICE = Object.freeze(TUTORIAL_ADVICE_DEFINITIONS.filter(
  advice => !TUTORIAL_DEFERRED_COMPANY_STOCK_ADVICE.has(advice.id),
));

function pendingTutorialGoal(state) {
  const goal = TUTORIAL_GOALS.find(candidate => isRequiredTutorialGoal(candidate)
    && !goalCompleted(state, candidate.id));
  return goal ? {
    id: goal.id,
    chapter: goal.chapter,
    title: TUTORIAL_PLAYER_TITLES[goal.id] ?? goal.title,
  } : null;
}

const TUTORIAL_LETTER_DEFINITIONS = Object.freeze([
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
        kicker: '統計・飢餓報告',
        title: '食料を待つあいだにも、人は失われます',
        summary: `死亡・離散事象 ${report.events}件・人口 ${model.population}人・食料 ${runwayDays.toFixed(1)}日分`,
        facts: { ...report, population: model.population, runwayDays, currentGoal },
        body: [
          `${model.day}日目。観測された死亡・離散事象はこの報告で${report.events}件、人数が確定できる事象では${report.peopleLost}人です。現在人口は${model.population}人、島内で見える食料は人口1人あたり${runwayDays.toFixed(1)}日分です。${report.message ? `実記録は「${report.message}」。` : ''}`,
          `私は帳簿にない食料を足せず、亡くなった人を戻すこともできません。${currentGoal ? `まだ終えていない仕事「${currentGoal.title}」はそのままです。` : ''}市場と食料の流れを作るか、この帰結を抱えたまま別の道をお選びください。`,
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
      const debtText = report.debt === null ? '—' : toDenari(report.debt).toFixed(0);
      const limitText = report.limit === null ? '—' : toDenari(report.limit).toFixed(0);
      const balanceText = toDenari(model.companyMoney).toFixed(1);
      return {
        kicker: '会社・最終通告',
        title: '帳簿は、見ていない間も動きます',
        summary: `債務 ${debtText}デナリ・信用限度 ${limitText}デナリ・会社残高 ${balanceText}デナリ`,
        facts: { ...report, companyMoney: model.companyMoney, currentGoal },
        body: [
          `${model.day}日目。会社から最終通告が出ました。会社残高は${balanceText}デナリ、記録された債務は${debtText}デナリ、信用限度は${limitText}デナリです。`,
          `支出を取り消し、帳簿を巻き戻すことはできません。${currentGoal ? `まだ終えていない仕事「${currentGoal.title}」も消えていません。` : ''}この島は同じ規則のまま続きます。`,
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
        kicker: '着任時の統計',
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
        summary: `${household.members}人の世帯が着岸し、島の人口は${model.population}人になりました`,
        body: [
          `${event.day}日目。入植船から${household.members}人の世帯が降り、木こりの区画へ入りました。島の人口は${model.population}人です。`,
          '市場と食料便は先に整いました。木工房を急ぐ前に、水際へ漁師、市場近くの平地へ野菜畑を置き、島の食卓を立ち上げましょう。',
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
          '市場の区画をお決めください。港の近くの平地が良いでしょう——のちに会社の運搬便が市場と港を行き来します。入植者が持参した食料が尽きる前に、買い物のできる場を。',
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
    when({ model, state }) {
      return goalCompleted(state, 'market-for-logs')
        && !goalCompleted(state, 'connect-market-to-port')
        && Boolean(marketBuilding(model)) && !portConnectedToMarket(model);
    },
    render({ model }) {
      return {
        kicker: '空の輸入棚',
        title: '本土の食料が市場に届きません',
        summary: '市場は開きましたが、港と道が結ばれていません',
        body: [
          `${model.day}日目。市場は開きましたが、本土から届く食料は港のヤードに降りたまま——会社の運び手は道のない所を通れません。`,
          '港と市場を道でお結びください。結ばれるまで市場の輸入棚は空のままで、入植者たちは持参の食料を食べ尽くせば飢えます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'initial-aid-plan',
    source: 'snapshot',
    when({ model }) {
      return portConnectedToMarket(model) && (model.mainlandAid?.requests ?? 0) === 0;
    },
    render({ model }) {
      const nextQty = model.mainlandAid?.nextQty ?? 240;
      return {
        kicker: '入植前の備え',
        title: '食料職が育つまでの一便を',
        summary: `次の支援は麦${nextQty}荷・要請は重ねるほど逓減`,
        body: [
          `${model.day}日目。港と市場の道が通りました。入植者の持参食料だけでは、漁師と野菜畑が働き始めるまでの空白を安全には渡れません。`,
          `会社の帳場から、本国へ食料支援を1回要請してください。次の便は麦${nextQty}荷です。支援は要請を重ねるほど減り、5回目から拒まれます——今回は最初の立ち上がりを繋ぐ一便だけにします。`,
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
        summary: `市場の食料棚に${amount.toFixed(1)}荷が届きました`,
        body: [
          `${model.day}日目。港に降りた本土の食料が荷車で運ばれ、市場の棚に${amount.toFixed(1)}荷並びました。これで入植者たちは代金を払えば食べていけます。`,
          'ただし本土の食料は買うたびに島のお金が海を渡って出ていきます。いずれ、島の食卓は島で賄う日が要りましょう。',
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
        summary: `屋台に丸太が${amount.toFixed(1)}荷並びました`,
        body: [
          `${model.day}日目。木こりが市場まで歩き、屋台に丸太を${amount.toFixed(1)}荷並べました。`,
          '値付けは彼ら自身が行い、買い手がつけば商いになります。食料の区画が整ったら、丸太の買い手となる木工房を置きましょう。',
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
        title: '最初の木製品が挽かれました',
        summary: `木製品が${tools.toFixed(1)}荷できました`,
        body: [
          `${model.day}日目。木工房が${provenance}、最初の木製品を${tools.toFixed(1)}荷仕上げました。`,
          '棚の丸太が減れば、工房は市場で買い足します。物が育ち、代金が島を回り始めています。',
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
        title: '納めるには倉庫が要ります',
        summary: `${goodsLabel(order.g)} ${order.qty}荷の調達には会社の倉庫が必要です`,
        body: [
          `${model.day}日目。${goodsLabel(order.g)}${order.qty}荷の注文をお受けになりました。会社の運搬便は市場で買い付けた品を一度倉庫へ納め、そこから港へ運びます。`,
          'いまの島には倉庫がありません。市場と港を結ぶ道の沿いに、倉庫の区画をお決めください。',
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
        title: '倉庫まで道が繋がっていません',
        summary: '倉庫の入口は道路の外です',
        body: [
          `${model.day}日目。倉庫は建ちましたが、入口が市場からの道と繋がっていません。会社の運搬便は道のない所を通れず、買い付けた品を運び込めません。`,
          '倉庫の入口まで道をお延ばしください。',
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
        && (model.stockTargets?.[order.g] ?? 0) < order.qty;
    },
    render({ model }) {
      const order = model.activeOrder;
      return {
        kicker: '取引資金は総督のもの',
        title: '買付のご下命を',
        summary: `${goodsLabel(order.g)}の買上げ目標を${order.qty}荷以上にします`,
        body: [
          `${model.day}日目。受けた注文は${goodsLabel(order.g)}${order.qty}荷ですが、会社の買上げ目標は現在${model.stockTargets?.[order.g] ?? 0}荷です。`,
          `会社の帳場で${goodsLabel(order.g)}の買上げ目標を${order.qty}荷以上にしてください。すでにそれ以上を備えている場合は、下げる必要はありません。`,
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
        title: '会社の運搬便が倉庫へ届きました',
        summary: `倉庫の${goodsLabel(order.g)} ${stocked.toFixed(1)}荷/${order.qty}荷`,
        body: [
          `会社が市場の屋台から${goodsLabel(order.g)}を買い付け、運び手が倉庫へ${stocked.toFixed(1)}荷を納めました。注文の${order.qty}荷まで、買い付けは続きます。`,
          '作った者に代金が入り、島の品が本国へ向かう仕度が進んでいます。',
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
        summary: `${goodsLabel(handling.goods)}を${handling.qty.toFixed(1)}荷、船へ積みました`,
        body: [
          `${handling.day}日目。倉庫から港へ届いた${goodsLabel(handling.goods)}を、今回は${handling.qty.toFixed(1)}荷だけ船へ移しました。荷役は一度に終わらず、一荷ずつ進みます。`,
          `注文は${facts?.qty ?? '—'}荷。最後の荷を積み終えるまで、港のヤードと船をご覧ください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'accepted-order-expired',
    source: 'event',
    when({ events }) {
      return Boolean(acceptedOrderExpiredEvent(events));
    },
    render({ model, events, state }) {
      const expired = acceptedOrderExpiredEvent(events);
      const order = state?.goalResults?.['complete-first-order']?.evidence?.lastOrder
        ?? firstOrderFacts(state);
      const remaining = order?.left
        ?? Number(expired?.message?.match(/残([\d.]+)荷/)?.[1] ?? 0);
      return {
        kicker: '本国注文・要対応',
        title: '受けた注文が期限切れになりました',
        summary: `残り${Number(remaining).toFixed(1)}荷を納め切れませんでした`,
        facts: { goods: order?.g ?? order?.goods ?? null, remaining, message: expired?.message ?? '' },
        body: [
          `${model.day}日目。船は出ましたが、注文の全量を期限までに納め切れず、残り${Number(remaining).toFixed(1)}荷で期限切れになりました。船出は一部の荷が動いた合図で、注文完遂とは別です。`,
          '次の注文では、帳場に記した納品済みの量、残り、期限をご確認ください。物流拠点への道と市場の売物を整えれば、次の注文でやり直せます。',
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
        summary: `注文を納め、売上${toDenari(revenue).toFixed(1)}デナリが入りました`,
        facts: { goods: facts.goods, qty: facts.qty, revenue, premium },
        body: [
          `${completed.eventDay ?? completed.day}日目。最後の一荷が船へ移り、${goodsLabel(facts.goods)}${facts.qty}荷の注文を納めました。会社の実台帳に、本国注文売上として${toDenari(revenue).toFixed(1)}デナリが記帳されています。`,
          `このうち通常単価分は${toDenari(base).toFixed(1)}デナリ、完遂による上乗せは${toDenari(premium).toFixed(1)}デナリです。市場で作り手へ代金を払い、道と倉庫と港を経て、島の品が初めて本国の売上になりました。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-one-close',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'complete-first-order');
    },
    render({ model, state }) {
      const completion = state?.letters?.find(letter => letter.id === 'first-order-complete');
      const expiry = state?.letters?.find(letter => letter.id === 'accepted-order-expired');
      const revenue = completion?.facts?.revenue ?? 0;
      const foodOutflow = foodImportOutflow(model);
      const aidRequests = model.mainlandAid?.requests ?? 0;
      return {
        kicker: '第一章・収支報告',
        title: completion ? '最初の一荷、その向こう側' : '期限切れも、次の判断材料です',
        summary: completion
          ? `注文売上 ${toDenari(revenue).toFixed(1)}デナリ / 食料の本土仕入 ${toDenari(foodOutflow).toFixed(1)}デナリ`
          : `初回注文は期限切れ・食料の本土仕入 ${toDenari(foodOutflow).toFixed(1)}デナリ`,
        facts: { revenue, foodOutflow, aidRequests, expired: Boolean(expiry) },
        body: completion ? [
          `最初の注文で、会社の実台帳には売上${toDenari(revenue).toFixed(1)}デナリが入りました。同じ時点までに、本土から買った食料の仕入は累計${toDenari(foodOutflow).toFixed(1)}デナリです。`,
          `食料支援は${aidRequests}回要請しましたが、贈与なのでこの仕入額には含まれません。輸出で代金を得る道は通りました。次は、島の食卓を本土任せにせず、島の中で作る番です。`,
        ].join('\n\n') : [
          '最初の注文は納め切れませんでしたが、島の歩みはここで止まりません。帳場には残量と期限が残るので、次の注文では準備と進み具合を自分で確かめられます。',
          `同じ時点までに、本土から買った食料の仕入は累計${toDenari(foodOutflow).toFixed(1)}デナリです。次は島の食料づくりと道を整え、暮らしを立て直します。`,
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
        attention: 'notice',
        kicker: '第二章・島の食卓',
        title: '食料をまだ本土から買い続けています',
        summary: `本土から買う食料 1日あたり${facts.importEma.toFixed(2)}荷・支払い累計 ${toDenari(facts.outflow).toFixed(1)}デナリ`,
        facts,
        body: [
          `${model.day}日目。島はいま、食料を1日あたりおよそ${facts.importEma.toFixed(2)}荷、本土から買っています（直近30日のならし）。この支払いで、これまでに合計${toDenari(facts.outflow).toFixed(1)}デナリが島の外へ出ていきました。`,
          '第一章で置いた漁師と野菜畑が育てば、本土から買う量は自然に減っていきます。第二章では、その変化を見届けます。',
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
        attention: 'notice',
        kicker: '島内生産の報告',
        title: '島の魚と野菜が市場に出回りはじめました',
        summary: `島で作る食料 1日あたり${change.current.productionEma.toFixed(1)}荷`,
        facts: change,
        body: [
          `${model.day}日目。島の中で作る食料が1日あたりおよそ${change.current.productionEma.toFixed(1)}荷になりました（直近30日のならし）。市場では魚が1荷${(change.before.fishPrice * 10).toFixed(1)}デナリから${(change.current.fishPrice * 10).toFixed(1)}デナリへ、野菜が1荷${(change.before.vegPrice * 10).toFixed(1)}デナリから${(change.current.vegPrice * 10).toFixed(1)}デナリへ動いています。`,
          `本土から買う食料は、1日あたり${change.before.importEma.toFixed(2)}荷から${change.current.importEma.toFixed(2)}荷へ${change.current.importEma <= change.before.importEma ? '減りました' : '増えています。島の生産が皆の食べる量に追いつくまで、しばらく上下します'}。`,
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
        attention: 'notice',
        kicker: '自給の節目',
        title: '本土から買う食料が、目標より少なくなりました',
        summary: `本土から買う食料 1日あたり${current.importEma.toFixed(2)}荷（目標の${FOOD_IMPORT_EMA_TARGET.toFixed(2)}荷未満を達成）`,
        facts: { before, current, target: FOOD_IMPORT_EMA_TARGET },
        body: [
          `${model.day}日目。本土から買う食料は1日あたり${current.importEma.toFixed(2)}荷になり、目標の${FOOD_IMPORT_EMA_TARGET.toFixed(2)}荷を下回りました。${current.importEma <= before.importEma ? `第二章の始め（1日あたり${before.importEma.toFixed(2)}荷）から減っています。` : `日々の上下で第二章の始め（1日あたり${before.importEma.toFixed(2)}荷）より多い日もありますが、目標の範囲に収まっています。`}いま島で作る食料は1日あたりおよそ${current.productionEma.toFixed(1)}荷で、島の食卓はほぼ島の生産で賄えています。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-two-close',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'improve-logger-route');
    },
    render({ model, state }) {
      const reached = state?.letters?.find(letter => letter.id === 'food-import-target-reached');
      const before = foodDependenceFacts(state) ?? foodFlowMetrics(model);
      const current = foodFlowMetrics(model);
      return {
        attention: 'notice',
        kicker: '第二章・収支報告',
        title: '第二章が終わりました — 食料は島で作れています',
        summary: `島で作る食料 1日あたり${current.productionEma.toFixed(1)}荷・本土から買う食料 1日あたり${current.importEma.toFixed(2)}荷`,
        facts: { before, current, reached: Boolean(reached) },
        body: [
          `${model.day}日目。魚と野菜を作る暮らしが根付き、島で作る食料は1日あたりおよそ${current.productionEma.toFixed(1)}荷になりました。本土から買う食料は1日あたり${current.importEma.toFixed(2)}荷です${current.importEma <= before.importEma ? `（第二章の始めは${before.importEma.toFixed(2)}荷でした）` : '（日々上下しますが、目標の範囲内です）'}。`,
          `本土への食料の支払いは、これまでに合計${toDenari(current.outflow).toFixed(1)}デナリでした。島で作る量が増えたぶん、この出費はこれから増えにくくなります。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'seasonal-food-valley-report',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'observe-seasonal-food-valley');
    },
    render({ model, state }) {
      const facts = seasonalValleyFacts(state);
      const firstGoods = firstOrderFacts(state)?.goods ?? null;
      const staleTarget = firstGoods ? (model.stockTargets?.[firstGoods] ?? 0) : 0;
      return {
        kicker: '第三章・倉庫の備え',
        title: '市場が空になる日があります',
        summary: `${goodsLabel(facts.goods)} ${facts.peakAvailability.toFixed(1)}→${facts.available.toFixed(1)}荷・相場 ${(facts.price * 10).toFixed(1)}デナリ`,
        facts: { ...facts, firstOrderGoods: firstGoods, staleTarget },
        body: [
          `${facts.peakDay}日目に市場で見えた${goodsLabel(facts.goods)}の余剰は${facts.peakAvailability.toFixed(1)}荷でしたが、${facts.day}日目には${facts.available.toFixed(1)}荷、ピークの${(facts.valleyRatio * 100).toFixed(1)}%まで薄くなりました。その日のならした相場は1荷あたり${(facts.price * 10).toFixed(1)}デナリです。`,
          `${firstGoods ? `最初の注文で定めた${goodsLabel(firstGoods)}の買上げ目標は、いまも${staleTarget}荷のままです。役目を終えた命令は0へ戻し、` : ''}${goodsLabel(facts.goods)}の買上げ目標を${SEASONAL_RESERVE_TARGET}荷にしてください。目標は注文ではなく、余る季節の品を会社の倉庫へ備えるためにも使えます。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'seasonal-stock-target-set',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'set-seasonal-stock-target');
    },
    render({ model, state }) {
      const facts = seasonalReserveFacts(model, state);
      const target = model.stockTargets?.[facts.goods] ?? 0;
      return {
        kicker: '会社の買付命令',
        title: '余る季節の品を、倉庫へ',
        summary: `${goodsLabel(facts.goods)}の買上げ目標 ${target}荷`,
        facts: { goods: facts.goods, target },
        body: [
          `${model.day}日目。${goodsLabel(facts.goods)}の買上げ目標を${target}荷と定めました。会社は価格と在庫のある時だけ市場で買い、運搬便が実物を倉庫へ運びます。`,
          '目標を書いただけでは品は増えません。作り手の余剰が市場に出て、会社が代金を払い、運搬便が到着するまでを見届けましょう。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'seasonal-reserve-filled',
    source: 'snapshot',
    when({ model, state }) {
      const facts = seasonalReserveFacts(model, state);
      return goalCompleted(state, 'set-seasonal-stock-target')
        && Boolean(facts && (model.companyStock?.[facts.goods] ?? 0) > 0);
    },
    render({ model, state }) {
      const facts = seasonalReserveFacts(model, state);
      const stock = model.companyStock[facts.goods];
      const averageCost = model.companyStockAverageCosts?.[facts.goods] ?? 0;
      return {
        kicker: '倉庫の入庫報告',
        title: '備えが実物になりました',
        summary: `${goodsLabel(facts.goods)} ${stock.toFixed(1)}荷・平均仕入 ${(averageCost * 10).toFixed(1)}デナリ`,
        facts: { goods: facts.goods, stock, averageCost },
        body: [
          `${model.day}日目。会社の倉庫に${goodsLabel(facts.goods)}が${stock.toFixed(1)}荷入りました。実際の平均仕入原価は1荷あたり${(averageCost * 10).toFixed(1)}デナリです。`,
          '次に市場の余剰がふたたび薄くなった時、帳場の「市場へ出す」でこの備えを市場へ戻せます。値付けも、その時の実帳面からご報告します。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'seasonal-release-dispatched',
    source: 'event',
    when({ events, state }) {
      const facts = seasonalValleyFacts(state);
      const prior = state?.goalResults?.['release-seasonal-reserve']?.evidence;
      return Boolean(prior?.ready && stockReleaseReport(events, facts?.goods));
    },
    render({ model, events, state }) {
      const valley = seasonalValleyFacts(state);
      const prior = state.goalResults['release-seasonal-reserve'].evidence;
      const release = stockReleaseReport(events, valley.goods);
      return {
        kicker: '市場へ向かう運搬便',
        title: '備えを市場へ戻します',
        summary: `${goodsLabel(release.goods)} ${release.qty.toFixed(1)}荷・運搬便が出発`,
        facts: {
          ...release,
          averageCost: prior.averageCost,
          marketAvailability: marketGoodsAvailability(model, release.goods),
          marketPrice: model.marketPrices[release.goods],
        },
        body: [
          `${model.day}日目。市場で見える${goodsLabel(release.goods)}が${marketGoodsAvailability(model, release.goods).toFixed(1)}荷まで薄くなったため、倉庫から${release.qty.toFixed(1)}荷を積んだ実荷車が出発しました。`,
          '品は瞬時に市場へ移りません。倉庫から市場まで道を走り、棚へ到着すると実際の仕入原価をもとに売値が付きます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-three-close',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'set-seasonal-stock-target');
    },
    render({ model, state }) {
      const reserve = seasonalReserveFacts(model, state);
      const target = model.stockTargets?.[reserve.goods] ?? 0;
      return {
        kicker: '第三章・倉庫の備え',
        title: '備えの命令を出しました',
        summary: `${goodsLabel(reserve.goods)}の買上げ目標 ${target}荷`,
        facts: { goods: reserve.goods, target },
        body: [
          `${model.day}日目。${goodsLabel(reserve.goods)}の買上げ目標を${target}荷にしました。市場に余りが出れば会社が買い、実物が倉庫へ届きます。`,
          '品薄の好機は季節や住民の売買で変わるため、この章を終える条件にはしません。実際に好機が来た時だけ、エレナがお知らせします。見送っても次へ進めます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'profitable-order-assessment',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'assess-profitable-order');
    },
    render({ state }) {
      const quote = profitableOrderFacts(state);
      return {
        kicker: '第三章・本国の注文',
        title: '決済の値と、仕入の値を並べます',
        summary: `${goodsLabel(quote.goods)}・決済 ${(quote.settlementPrice * 10).toFixed(1)} / 全量仕入 ${(quote.marketUnitCost * 10).toFixed(1)}デナリ`,
        facts: quote,
        body: [
          `${quote.day}日目。${goodsLabel(quote.goods)}${quote.qty}荷の注文状です。本国の表示単価は${(quote.basePrice * 10).toFixed(1)}デナリですが、完遂時の実決済は1荷あたり${(quote.settlementPrice * 10).toFixed(1)}デナリ。いま市場に並ぶ品を安い屋台から全${quote.qty}荷買い集める加重仕入原価は、1荷あたり${(quote.marketUnitCost * 10).toFixed(1)}デナリです。`,
          `現時点の差は1荷あたり${(quote.marginPerUnit * 10).toFixed(1)}デナリ、全${quote.qty}荷なら${(quote.quotedMargin * 10).toFixed(1)}デナリの黒字見込みです。相場は動きますが、最安の一荷だけでなく必要数すべての仕入を見積もる——その上で受けるかをお決めください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'profitable-order-accepted',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'accept-profitable-order');
    },
    render({ model, state }) {
      const quote = profitableOrderFacts(state);
      return {
        kicker: '受諾後の仕度',
        title: '会社が市場で買付を始めます',
        summary: `${goodsLabel(quote.goods)} ${quote.qty}荷・期限${quote.due}日目まで`,
        facts: { ...quote },
        body: [
          `${model.day}日目。${goodsLabel(quote.goods)}${quote.qty}荷の注文を受諾しました。受諾した数量を上限に、会社が市場の安い屋台から実際に買い付けます。`,
          '作り手への支払い、物流拠点への運搬、港の荷役まで、実物と帳簿の両方を見届けましょう。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'profitable-order-complete',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'complete-profitable-order');
    },
    render({ state }) {
      const quote = profitableOrderFacts(state);
      const facts = state.goalResults['complete-profitable-order'].evidence;
      return {
        kicker: '利益を得た注文',
        title: '見立てを、実帳簿で確かめました',
        summary: `売上 ${toDenari(facts.revenue).toFixed(1)}デナリ / 出荷原価 ${toDenari(facts.orderCost).toFixed(1)}デナリ / 粗利 ${toDenari(facts.realizedMargin).toFixed(1)}デナリ`,
        facts: { ...facts, quote },
        body: [
          `${facts.completionDay}日目。${goodsLabel(facts.goods)}${facts.qty}荷を納め、実売上は${toDenari(facts.revenue).toFixed(1)}デナリ、今回の市場買付原価は${toDenari(facts.orderCost).toFixed(1)}デナリ、差し引き粗利は${toDenari(facts.realizedMargin).toFixed(1)}デナリでした。`,
          `注文状を見た時の全量加重原価は1荷あたり${(quote.marketUnitCost * 10).toFixed(1)}デナリ、完遂決済は${(quote.settlementPrice * 10).toFixed(1)}デナリでした。最初の見立てと、最後の実帳簿を分けて確かめるのが商いです。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'skippable-order-assessment',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'observe-skippable-order');
    },
    render({ state }) {
      const evidence = state.goalResults['observe-skippable-order'].evidence;
      const quote = evidence.selected;
      const procurement = quote.marketUnitCost === null
        ? `必要な${quote.qty}荷に対し、市場で現在そろえられるのは${quote.marketAvailable.toFixed(1)}荷です`
        : `全量の加重仕入原価は1荷あたり${(quote.marketUnitCost * 10).toFixed(1)}デナリです`;
      const judgment = quote.reason === 'loss'
        ? `決済との差は1荷あたり${(quote.marginPerUnit * 10).toFixed(1)}デナリで、現在値では赤字です`
        : quote.reason === 'insufficient_supply'
          ? '必要数を調達できないため、完遂の見立てを立てられません'
          : `期間内に採算割れが来なかったため、${evidence.seenOffers.length}件目を比較根拠の確認課題にします。現在値では黒字見込みです`;
      return {
        kicker: '受けない注文の見立て',
        title: 'この注文は、受諾せずに見送ります',
        summary: `${goodsLabel(quote.goods)} ${quote.qty}荷・決済 ${(quote.settlementPrice * 10).toFixed(1)}デナリ / ${quote.marketUnitCost === null ? `調達可能 ${quote.marketAvailable.toFixed(1)}荷` : `全量仕入 ${(quote.marketUnitCost * 10).toFixed(1)}デナリ`}`,
        facts: evidence,
        body: [
          `${quote.day}日目。${goodsLabel(quote.goods)}${quote.qty}荷、完遂決済は1荷あたり${(quote.settlementPrice * 10).toFixed(1)}デナリ。${procurement}。${judgment}。`,
          `注文状の「拒否する」は世界や帳簿を書き換えず、この注文状を伏せるだけです。受諾せず期限まで置き、実際の失効を見届けてください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-four-close',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'let-skippable-order-expire');
    },
    render({ state }) {
      const profit = state.goalResults['complete-profitable-order']?.evidence ?? null;
      const skipped = state.goalResults['let-skippable-order-expire']?.evidence ?? null;
      const selected = skipped?.selected ?? null;
      // profit は evidence フォールバック {completed:false} で常に truthy になるため、
      // 完遂実績と失効実績が両方揃った時だけ詳細文を出す（失効前は expired が null）
      const detailed = Boolean(profit?.completed && selected && skipped?.expired);
      return {
        kicker: '第三章・商い判断報告',
        title: '注文は、残量と期限を見て選べます',
        summary: detailed
          ? `利益注文の粗利 ${toDenari(profit.realizedMargin).toFixed(1)}デナリ / 見送り ${goodsLabel(selected.goods)} ${selected.qty}荷`
          : '注文の完遂と船出を分け、採算を比べる準備ができました',
        facts: { profit, skipped },
        body: detailed ? [
          `ひとつの注文は、実売上${toDenari(profit.revenue).toFixed(1)}デナリから出荷原価${toDenari(profit.orderCost).toFixed(1)}デナリを引き、粗利${toDenari(profit.realizedMargin).toFixed(1)}デナリで完遂しました。もうひとつの${goodsLabel(selected.goods)}${selected.qty}荷は受諾せず、${skipped.expired.day}日目に実際に失効しました。`,
          '注文状は命令ではありません。決済と市場を比べ、取引資金を使うか決めること。引き受けない自由も総督のものです。',
        ].join('\n\n') : [
          '注文は届く時期も内容も島の生産によって変わります。好都合な注文を必達条件として待たせず、届いた時に帳場で決済単価、全量仕入原価、残量、期限を比べられるようにしました。',
          '利益を見込める注文や見送るべき注文が実際に来た時は、エレナが観測結果を報告します。この章を止めず、自分の島の商いとして判断できます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'tools-price-rise',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'observe-tools-price-rise');
    },
    render({ state }) {
      const facts = state.goalResults['observe-tools-price-rise'].evidence;
      return {
        kicker: '第四章・島の手仕事',
        title: '木製品の値が上がっています',
        summary: `底値 ${(facts.minimumPrice * 10).toFixed(1)}→${(facts.currentPrice * 10).toFixed(1)}デナリ/荷（+${(facts.ratio * 100).toFixed(1)}%）`,
        facts,
        body: [
          `${facts.minimumDay}日目に1荷あたり${(facts.minimumPrice * 10).toFixed(1)}デナリだった、ならした木製品相場が、${facts.currentDay}日目には${(facts.currentPrice * 10).toFixed(1)}デナリ、底から${(facts.ratio * 100).toFixed(1)}%上がりました。台詞のための固定相場ではなく、この島で動いた実値です。`,
          '既設の木工房に加え、炭焼き小屋と塩田をお置きください。木工と炭焼き小屋は丸太を、塩田は木炭を原料棚へ買い、木製品・木炭・塩へ作り替えます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'conversion-workshops-placed',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'place-conversion-workshops');
    },
    render({ model, state }) {
      const rows = state.goalResults['place-conversion-workshops'].evidence.rows;
      return {
        kicker: '手仕事の受け皿',
        title: '三つの仕事場が揃いました',
        summary: rows.map(row => `${row.label}${row.buildingCount}棟`).join('・'),
        facts: { rows },
        body: [
          `${model.day}日目。${rows.map(row => `${row.label}${row.buildingCount}棟`).join('、')}が島に揃いました。建物を置いただけでは品は生まれません。移民が入り、原料を市場で買って原料棚へ運ぶまでを待ちます。`,
          '原料棚の中身、原料相場、作る品の原価と1日あたりの生産量を、同じ瞬間の実帳面で並べてご報告します。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'conversion-cost-chain',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'observe-conversion-cost-chain');
    },
    render({ model, state }) {
      const facts = state.goalResults['observe-conversion-cost-chain'].evidence;
      const woodshop = facts.rows.find(row => row.job === 'woodshop').economics;
      const charburner = facts.rows.find(row => row.job === 'charburner').economics;
      const saltworks = facts.rows.find(row => row.job === 'saltworks').economics;
      return {
        kicker: '原価連鎖の実測',
        title: '丸太から木製品と木炭へ、木炭から塩へ',
        summary: `1日あたりの生産 木製品${woodshop.productionEma.toFixed(2)}・木炭${charburner.productionEma.toFixed(2)}・塩${saltworks.productionEma.toFixed(2)}`,
        facts,
        body: [
          `${model.day}日目。丸太相場は1荷あたり${(facts.logPrice * 10).toFixed(1)}デナリ。木工房の原料棚には${woodshop.inputAmount.toFixed(1)}荷あり、木製品の実生産原価は${(woodshop.cost * 10).toFixed(1)}デナリ/荷、1日あたりの生産は${woodshop.productionEma.toFixed(2)}荷です。炭焼き小屋の原料棚は丸太${charburner.inputAmount.toFixed(1)}荷、木炭原価${(charburner.cost * 10).toFixed(1)}デナリ/荷、1日あたりの生産は${charburner.productionEma.toFixed(2)}荷です。`,
          `その木炭相場は1荷あたり${(facts.charPrice * 10).toFixed(1)}デナリ。塩田の原料棚には${saltworks.inputAmount.toFixed(1)}荷あり、塩の実生産原価は${(saltworks.cost * 10).toFixed(1)}デナリ/荷、1日あたりの生産は${saltworks.productionEma.toFixed(2)}荷です。原料の値が次の作り手の原価へ渡る——これが島内の連鎖です。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'household-level-up',
    source: 'event',
    when({ model, events, state }) {
      return goalCompleted(state, 'place-conversion-workshops')
        && Boolean(householdLevelUpReport(model, events));
    },
    render({ model, events }) {
      const facts = householdLevelUpReport(model, events);
      const appearance = facts.appearance;
      return {
        kicker: '暮らしの等級',
        title: '暮らしが、建物の姿を育てました',
        summary: `${facts.job}#${facts.householdId} Lv${facts.previousLevel}→Lv${facts.level}${appearance ? `・外観段階${appearance.tier}` : ''}`,
        facts,
        body: [
          `${facts.day}日目、実イベント「${facts.message}」。文化財を満たした世帯の暮らしがLv${facts.previousLevel}からLv${facts.level}へ上がりました。`,
          appearance
            ? `住まい兼仕事場${facts.buildingId}の描画も世帯Lvを受け、外観キーは${appearance.key}、外観段階${appearance.tier}、高さ${appearance.elevation}になりました。品の流れは、財布だけでなく町の姿にも残ります。`
            : '品の流れは、財布だけでなく暮らしの等級にも残ります。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'no-vacancy-job-change',
    source: 'event',
    when({ model, events, state }) {
      return goalCompleted(state, 'place-conversion-workshops')
        && Boolean(noVacancyReport(model, events));
    },
    render({ model, events }) {
      const facts = noVacancyReport(model, events);
      const target = facts.targetJob ? `${facts.targetJob}の` : '';
      return {
        kicker: '産業政策・転職',
        title: '仕事を替えるにも、空いた建物が要ります',
        summary: `${facts.message}・空き職建物 ${facts.vacantBuildingCount}棟`,
        facts,
        body: [
          `${facts.day}日目、実イベント「${facts.message}」。この時、島の空き職建物は${facts.vacantBuildingCount}棟、${target}空きは${facts.targetVacancyCount}棟でした。`,
          '困窮した世帯は、仕事だけを名前で替えるのではなく、空いている別職の建物へ実際に移り住みます。将来ほしい産業の建物を一棟空けておくことが、人の移れる道を用意する産業政策になります。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-five-close',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'place-conversion-workshops');
    },
    render({ state }) {
      const survival = state.goalResults['sustain-conversion-workshops']?.evidence ?? null;
      const levelUp = state.letters.find(letter => letter.id === 'household-level-up')?.facts ?? null;
      const vacancy = state.letters.find(letter => letter.id === 'no-vacancy-job-change')?.facts ?? null;
      const vacancyBody = vacancy
        ? `また、${vacancy.day}日目の「${vacancy.message}」から、転職には空き建物という受け皿が要ることも分かりました。`
        : '転職失敗はこの90日には観測されませんでした。起きた時だけ、その実記録と空き建物数をご報告します。';
      return {
        kicker: '第四章・手仕事と暮らしの報告',
        title: '三つの手仕事を観察できる町になりました',
        summary: survival && levelUp
          ? `三つの手仕事 ${survival.elapsedDays}日存続・${levelUp.job}#${levelUp.householdId} Lv${levelUp.level}`
          : '木工房・炭焼き小屋・塩田を置き、原料と暮らしの変化を追えます',
        facts: { survival, levelUp, vacancy },
        body: survival && levelUp ? [
          `木工房・炭焼き小屋・塩田は${survival.startDay}日目から${survival.currentDay}日目まで、連続${survival.elapsedDays}日存続しました。丸太は木製品と木炭へ、木炭は塩へ渡り、三つの品の生産が続いています。`,
          `${levelUp.day}日目には${levelUp.job}#${levelUp.householdId}がLv${levelUp.level}へ上がり、建物${levelUp.buildingId}の外観にも反映されました。${vacancyBody}`,
        ].join('\n\n') : [
          '木工房・炭焼き小屋・塩田が揃いました。入植、原料の入荷、相場の変化、90日の存続は島の営みから生まれる結果なので、この章を終える条件にはしません。',
          '建物を押せば原料棚と産出棚、実際にかかった原価を読めます。変化が実際に起きた時だけ、エレナが止めない報告としてお知らせします。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'second-market-call',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'close-fifth-chapter');
    },
    render({ model }) {
      const facts = fisheryMarketFacts(model);
      return {
        kicker: '第五章・峠向こうからの知らせ',
        title: '魚のある漁郷に、麦がありません',
        summary: `漁郷 ${facts.population}人・麦${facts.wheat.toFixed(1)}荷・魚${facts.fish.toFixed(1)}荷`,
        facts,
        body: [
          `峠向こうの漁郷には${facts.population}人が暮らし、魚${facts.fish.toFixed(1)}荷がありますが、麦は${facts.wheat.toFixed(1)}荷です。魚だけでは、穀物を望む食卓を満たせません。`,
          '母港市場と漁郷市場は別の市場です。市場は家族が売買する場所ですが、市場の境界を越えて品を運ぶ定期便は、まだありません。二つの市場と峠道を確かめてください。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-six-close',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'observe-second-market-result');
    },
    render({ model }) {
      const route = tutorialCaravanRoute(model);
      const trip = route?.recentTrips?.[0] ?? null;
      const accounting = route?.accounting?.current ?? null;
      const fishery = fisheryMarketFacts(model);
      const facts = { routeId: route?.id ?? null, trip, accounting, fishery };
      return {
        kicker: '第五章・二つの市場の報告',
        title: '初便は荷物と暮らしと収支を結びました',
        summary: trip
          ? `往路 麦${(trip.outbound?.wheat ?? 0).toFixed(1)}荷・帰路 魚${(trip.returning?.fish ?? 0).toFixed(1)}荷・漁郷購入 麦${fishery.purchasedWheat.toFixed(1)}荷`
          : '第一便の実績をまとめました',
        facts,
        body: [
          trip
            ? `第一便は麦${(trip.outbound?.wheat ?? 0).toFixed(1)}荷を漁郷へ送り、魚${(trip.returning?.fish ?? 0).toFixed(1)}荷を母港へ持ち帰りました。漁郷の家族は麦${fishery.purchasedWheat.toFixed(1)}荷を実際に買いました。`
            : '第一便の往復が終わりました。',
          accounting
            ? `今月の隊商収支は、売上${toDenari(accounting.sales).toFixed(0)}－仕入${toDenari(accounting.procurement).toFixed(0)}－給料${toDenari(accounting.wages).toFixed(0)}－荷車費${toDenari(accounting.cartCosts).toFixed(0)}＝差引${toDenari(accounting.profit).toFixed(0)}デナリです。赤字なら、空荷、給料、間隔、買い手の財布をこの順に確かめられます。`
            : '隊商宿を押せば、売上・仕入・給料・荷車費と差引を月ごとに確かめられます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'tutorial-graduation',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'close-sixth-chapter');
    },
    render({ model }) {
      const facts = tutorialGraduationFacts(model);
      return {
        kicker: '総督への最後の書状',
        title: 'この先は、総督の島です',
        summary: '案内は終わりますが、島の暮らしと取引はこのまま続きます。',
        facts,
        body: [
          `いま島には${facts.population}人が暮らしています。道、仕事、市場、倉庫を結んだのは総督です。`,
          'ご報告だけです。統計と地図を手がかりに、伸ばしたい仕事と守りたい暮らしを、ご自身で選んでください。',
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
        summary: `丸太${trade.qty}荷が、一荷${price}デナリで売れました`,
        body: [
          `${trade.transactionDay ?? model.day}日目。市場で丸太${trade.qty}荷が1荷あたり${price}デナリで商われました。木工房の棚が満ち、木こりの財布に代金が入りました。`,
          '値は私どもが決めたものではありません。売り手の言い値に買い手がついた、それだけのことです。市場とはそういう場所でございます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
]);

export const TUTORIAL_LETTERS = Object.freeze(TUTORIAL_LETTER_DEFINITIONS.filter(
  letter => !TUTORIAL_DEFERRED_COMPANY_STOCK_LETTERS.has(letter.id),
));
