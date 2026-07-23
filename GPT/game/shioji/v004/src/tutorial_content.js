import {
  E_STABLE_JOBS,
  E_STABLE_POPULATION_BAND,
  E_STABLE_YEARS,
} from './engine_bridge.js?v=v004.13.0-elena-voice';
import { JOB_LABELS, toDenari } from './config.js?v=v004.13.0-elena-voice';

const LIVING_REQUIREMENT_LABELS = Object.freeze({
  food1: '食料1種', food2: '食料2種', food3: '食料3種', grain: '穀物',
  saltchar: '塩と燃料', tools: '道具', salt: '塩', char: '燃料', cloth: '布', iron: '鉄材',
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
export const SEASONAL_SURPLUS_MIN = 8;
export const SEASONAL_VALLEY_RATIO = 0.2;
export const SEASONAL_RESERVE_TARGET = 16;
export const ORDER_JUDGMENT_FALLBACK_OFFERS = 3;
export const TOOLS_PRICE_RISE_RATIO = 0.05;
export const TOOLS_PRICE_RISE_DELTA = 0.05;
export const CONVERSION_SURVIVAL_DAYS = 90;
export const TUTORIAL_LETTER_ATTENTION = Object.freeze({
  'tutorial-starvation-consequence': 'silent',
  'tutorial-bankruptcy-consequence': 'critical',
  'first-import-food': 'notice',
  'first-company-procurement': 'notice',
  'first-order-handling': 'notice',
  'first-order-complete': 'action',
  'accepted-order-expired': 'action',
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
  'tutorial-graduation': 'notice',
  'first-log-trade': 'notice',
});
const LOGGER_MULTIPLIER_RECOVERY = 0.1;
const FOOD_PRODUCTION_EMA_MIN = 0.25;
const FOOD_PRICE_CHANGE_MIN = 0.01;
const FOOD_IMPORT_EMA_CHANGE_MIN = 0.05;
const SEASONAL_FOOD_GOODS = ['fish', 'veg', 'wheat'];
const CONVERSION_JOB_DEFINITIONS = Object.freeze([
  Object.freeze({ job: 'woodshop', label: '木工房', goods: 'tools', inputGoods: 'log' }),
  Object.freeze({ job: 'charburner', label: '炭焼', goods: 'char', inputGoods: 'log' }),
  Object.freeze({ job: 'saltworks', label: '製塩所', goods: 'salt', inputGoods: 'char' }),
]);

// エレナは意味を伝え、こちらは押す場所・置く場所だけを伝える。
// 内部の判定語を goal 本体へ混ぜず、初見プレイヤーが見る文面を一か所で監査する。
export const TUTORIAL_PLAYER_TITLES = Object.freeze({
  'first-road-and-logger': '森の丸太を港へ運べる道をつくる',
  'market-for-logs': '丸太を売買できる市場を用意する',
  'connect-market-to-port': '本土からの荷が市場へ届く道をつくる',
  'request-first-aid': '食料づくりが始まるまでの一便を頼む',
  'first-settlers-arrive': '最初の家族が来るのを見届ける',
  'place-island-food': '島で魚と野菜をつくり始める',
  'first-woodshop': '丸太を道具へ変える仕事を用意する',
  'warehouse-for-order': '買い上げた品を置く蔵を用意する',
  'prepare-first-tools-stock': '最初の注文に備えて道具を集める',
  'accept-first-order': '最初の本国注文を引き受ける',
  'order-procurement-target': '注文に足りる買上げ量か確かめる',
  'first-order-procurement': '買い上げた品が蔵へ届くのを見る',
  'complete-first-order': '注文の残りを見ながら全量を納める',
  'close-first-chapter': '最初の輸出が島へ残したものを知る',
  'improve-logger-route': '木こりの往復を短くして仕事時間を戻す',
  'observe-island-food-change': '島の食料が市場へ流れ始めるのを見る',
  'reduce-food-imports': '本土に頼る食料を小さくする',
  'close-second-chapter': '島の食卓がどう変わったか知る',
  'observe-seasonal-food-valley': '食料が薄くなる季節を見つける',
  'set-seasonal-stock-target': '余る季節の食料を蔵へ備える',
  'fill-seasonal-reserve': '食料の備えが蔵へ届くのを見る',
  'release-seasonal-reserve': '品薄の市場へ蔵の備えを戻す',
  'close-third-chapter': '蔵出しが季節をつないだ結果を知る',
  'assess-profitable-order': '本国の支払と島で集める費用を比べる',
  'accept-profitable-order': '利益を見込める注文を引き受ける',
  'target-profitable-order': '注文分の品を買い上げる',
  'complete-profitable-order': '見立てが利益になったか確かめる',
  'observe-skippable-order': '引き受けない方がよい注文を見分ける',
  'let-skippable-order-expire': '注文を見送り、期限まで観察する',
  'close-fourth-chapter': '引き受ける判断と見送る判断を振り返る',
  'observe-tools-price-rise': '道具の値動きから需要の変化を読む',
  'place-conversion-workshops': '丸太から道具・木炭・塩へ仕事をつなぐ',
  'observe-conversion-cost-chain': '原料の値が加工品へ渡る様子を見る',
  'sustain-conversion-workshops': '三つの手仕事が続く町にする',
  'observe-household-level-up': '品物が暮らしを豊かにする様子を見る',
  'close-fifth-chapter': '仕事の連鎖が暮らしへ届いた結果を知る',
  'graduate-governor': '自分の島を読み続ける',
});

// エレナは操作手順を読み上げず、その一手が島にとって持つ意味を伝える。
// 具体的な押し場所・置き場所は TUTORIAL_SYSTEM_INSTRUCTIONS だけが受け持つ。
export const TUTORIAL_ELENA_MESSAGES = Object.freeze({
  'first-road-and-logger': '丸太は、森と港を結ぶ道があって初めて島の商いに加わります。',
  'market-for-logs': '木こりの荷を受け取る市場があれば、最初の家族は丸太を売って暮らし始められます。',
  'connect-market-to-port': '港と市場の道は、本土から届く食料と、島から出す荷の共通の通り道です。',
  'request-first-aid': '漁家と菜園が働き始めるまでの食卓だけ、本土へ頼みましょう。',
  'first-settlers-arrive': '市場と当座の食料は整いました。今なら、最初の家族を迎えられます。',
  'place-island-food': '一便の支援だけに頼らず、魚と野菜が毎日の食卓へ届く流れを作ります。',
  'first-woodshop': '丸太の行き先を増やし、島で道具へ変える仕事を始めましょう。',
  'warehouse-for-order': '会社が買い上げた品は、蔵があって初めて注文のために保管できます。',
  'prepare-first-tools-stock': '注文を受けてから集めるより、道具を先に備えれば期限に追われません。',
  'accept-first-order': '道具の備えができました。注文状の量と期限を確かめ、最初の取引を始めましょう。',
  'order-procurement-target': '注文の量と買上げの量は別です。足りる数を会社へ下命してください。',
  'first-order-procurement': '市場で買った道具が、会社の荷車で蔵へ移るところを見届けましょう。',
  'complete-first-order': '船が出るだけでは完遂ではありません。残りがなくなるまで、一荷ずつの流れを見ます。',
  'close-first-chapter': '森の丸太が道具になり、本国へ渡りました。その結果を帳簿と一緒に振り返ります。',
  'improve-logger-route': '遠回りは木こりの仕事時間を削ります。短い道が暮らしと生産をどう変えるか確かめましょう。',
  'observe-island-food-change': '魚と野菜が市場へ届けば、本土へ流れる銀と島の食卓が同時に変わります。',
  'reduce-food-imports': '島で作る食料が増えるほど、毎日の食卓を本土に頼らず保てるようになります。',
  'close-second-chapter': '食料を作る仕事と市場への道が、島の銀を島の中で巡らせ始めました。',
  'observe-seasonal-food-valley': '食料は一年中同じ量ではありません。市場の山が細る時期を見つけます。',
  'set-seasonal-stock-target': '余る時に買い上げておけば、品薄の季節へ実物の備えを残せます。',
  'fill-seasonal-reserve': '数字だけでなく、買い上げた食料が蔵へ積まれるところを見届けましょう。',
  'release-seasonal-reserve': '市場の品が薄い時こそ、蔵の備えを暮らしへ戻す時です。',
  'close-third-chapter': '余る季節の荷が、足りない季節の食卓へ届きました。蔵がつないだ流れを振り返ります。',
  'assess-profitable-order': '本国の支払が大きく見えても、島で集める費用を引かなければ利益は分かりません。',
  'accept-profitable-order': '見込みを比べたうえで、島に利益が残る注文を選びましょう。',
  'target-profitable-order': '引き受けた品は、注文数まで買い上げて初めて出荷の流れに乗ります。',
  'complete-profitable-order': '見立てが正しかったかは、完遂後の売上と仕入の差で確かめられます。',
  'observe-skippable-order': '注文状は命令ではありません。島に不利なら引き受けない判断もできます。',
  'let-skippable-order-expire': '見送ると決めた注文は、島の品と銀を動かさず期限まで観察します。',
  'close-fourth-chapter': '引き受ける自由と見送る自由の両方が、会社の帳簿を形づくります。',
  'observe-tools-price-rise': '道具を求める人が増えれば、相場の動きに町の変化が表れます。',
  'place-conversion-workshops': '一つの原料から仕事をつなげると、島の中で品と銀が巡る道が増えます。',
  'observe-conversion-cost-chain': '原料の値は消えず、加工された品の原価へ順に渡っていきます。',
  'sustain-conversion-workshops': '建物を置くだけでなく、原料と働く家族が途切れず届く町にしましょう。',
  'observe-household-level-up': '品物が毎日届く暮らしは、やがて建物の姿にも表れます。',
  'close-fifth-chapter': '仕事の連鎖が品を生み、その品が家族の暮らしを豊かにしました。',
  'graduate-governor': 'ここから先は、荷車と在庫と人の暮らしを見て、次の一手をご自身で見立てられます。',
});

export const TUTORIAL_SYSTEM_INSTRUCTIONS = Object.freeze({
  'first-road-and-logger': '下の［整備］で［道を敷く］を選び、港から森の隣まで引く。続けて［採取］の［木こり］を森と道の隣に置く。',
  'market-for-logs': '下の［流通］から［市場］を選び、木こりへ続く道の隣に置く。',
  'connect-market-to-port': '［整備］の［道を敷く］で、港の入口と市場の入口をつなぐ。',
  'request-first-aid': '上の［会社］を開き、［支援を要請する］を1回押す。',
  'first-settlers-arrive': '時間を進め、市場の近くに最初の家族が現れるまで盤面を見る。',
  'place-island-food': '下の［食料］から［漁家］を水際の道沿いへ、［菜園］を市場に近い道沿いへ置く。',
  'first-woodshop': '下の［加工］から［木工房］を選び、木こりと市場へ続く道沿いに置く。',
  'warehouse-for-order': '下の［流通］から［蔵］を置き、［道を敷く］で市場と港へつなぐ。',
  'prepare-first-tools-stock': '上の［会社］を開き、道具の買上げ目標へ80と入力してEnterを押す。',
  'accept-first-order': '注文状が届いたら上の［会社］を開き、注文カードの［受諾する］を押す。',
  'order-procurement-target': '［会社］の注文数と道具の買上げ目標を比べ、目標が少なければ注文数以上を入力してEnterを押す。',
  'first-order-procurement': '時間を進め、会社の荷車が市場から蔵へ着くのを見る。',
  'complete-first-order': '［会社］で「納品済み／残り／あと何日」を確認しながら時間を進め、残りが0荷になるまで蔵から港への荷車を追う。',
  'close-first-chapter': '',
  'improve-logger-route': '木こりを押して市場までの往復を読み、［整備］の［道を敷く］で遠回りを短くする。',
  'observe-island-food-change': '上の［島況］を開き、［食料の流れ］の三本の線を見ながら時間を進める。',
  'reduce-food-imports': '漁家・菜園と市場への道を整え、［島況］で島内生産が増え本土購入が小さくなるまで観察する。',
  'close-second-chapter': '',
  'observe-seasonal-food-valley': '［島況］の［食料と蔵の備え］を開いたまま時間を進め、食料在庫が細る時期を見る。',
  'set-seasonal-stock-target': '［会社］で古い道具目標を0にし、案内された食料の買上げ目標へ16と入力してEnterを押す。',
  'fill-seasonal-reserve': '時間を進め、［会社］または蔵を開いて食料が会社在庫へ届くのを見る。',
  'release-seasonal-reserve': '［会社］で案内された食料の［市場へ出す量］へ16と入力し、［市場へ出す］を押す。',
  'close-third-chapter': '',
  'assess-profitable-order': '［会社］を開き、注文カードの完遂決済単価と市場最安を比べる。',
  'accept-profitable-order': '比較した注文カードの［受諾する］を押す。',
  'target-profitable-order': '同じ品の買上げ目標へ注文数以上を入力し、Enterを押す。',
  'complete-profitable-order': '時間を進めて注文を納め、［島況］の会社収支で差引を確かめる。',
  'observe-skippable-order': '次の注文状を［会社］で読み、支払が仕入より不利な注文は［拒否する］で見送る。',
  'let-skippable-order-expire': '見送った注文を受諾せず、期限を過ぎるまで時間を進める。',
  'close-fourth-chapter': '',
  'observe-tools-price-rise': '［島況］の相場グラフで［道具］を選び、値の上向きを見る。',
  'place-conversion-workshops': '下の［加工］から［木工房］［炭焼］［製塩所］を、原料と市場へ続く道沿いに一棟ずつ置く。',
  'observe-conversion-cost-chain': '三棟を順に押し、原料棚と産出棚に品が入り、加工が始まるまで時間を進める。',
  'sustain-conversion-workshops': '三棟の道路と原料を保ち、90日間、働く世帯が途切れないよう観察する。',
  'observe-household-level-up': '働いている建物を押し、世帯の満たされた品と暮らしの変化を確かめる。',
  'close-fifth-chapter': '',
  'graduate-governor': '',
});

function marketGoodsAvailability(model, goods) {
  const stalls = model.stalls
    .filter(stall => stall.goods === goods)
    .reduce((total, stall) => total + (stall.qty ?? 0), 0);
  const market = marketBuilding(model);
  const inbound = (market?.shelves ?? [])
    .filter(shelf => shelf.section === 'inbound' && shelf.goods === goods)
    .reduce((total, shelf) => total + (shelf.amount ?? 0), 0);
  return stalls + inbound;
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
  const operation = events.find(event => event.type === 'operation'
    && event.ok && event.op?.type === 'release_stock'
    && (!expectedGoods || event.op.goods === expectedGoods));
  if (!operation) return null;
  const departure = events.find(event => event.type === 'departure'
    && event.carrier === 'cart' && event.goods === operation.op.goods);
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

function orderQuote(model) {
  const offer = model.orderOffer;
  if (!offer) return null;
  const observedLowest = model.marketLowest?.[offer.g];
  const marketLowest = Number.isFinite(observedLowest) ? observedLowest : null;
  const settlementPrice = offer.price * 1.25;
  const marginPerUnit = marketLowest === null ? null : settlementPrice - marketLowest;
  return {
    key: orderKey(offer),
    day: model.day,
    goods: offer.g,
    qty: offer.qty,
    due: offer.due,
    basePrice: offer.price,
    settlementPrice,
    marketLowest,
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
  const ledger = model.companyLedger.slice(facts.ledgerLength ?? 0);
  const revenue = ledger
    .filter(row => row.reason === `本国注文へ${facts.goods}を出荷`)
    .reduce((total, row) => total + row.amount, 0);
  const purchases = ledger
    .filter(row => row.reason?.endsWith(`から蔵へ${facts.goods}を買上げ`) && row.amount < 0)
    .reduce((total, row) => total - row.amount, 0);
  const startingStockCost = facts.startingStockCost ?? 0;
  const endingStock = model.companyStock?.[facts.goods] ?? 0;
  const endingAverageCost = model.companyStockAverageCosts?.[facts.goods] ?? 0;
  const endingStockCost = endingStock * endingAverageCost;
  const orderCost = Math.max(0, startingStockCost + purchases - endingStockCost);
  return {
    completed: Boolean(completion) || Boolean(prior.completed),
    completionDay: completion?.eventDay ?? completion?.day ?? prior.completionDay ?? model.day,
    goods: facts.goods,
    qty: facts.qty,
    revenue,
    purchases,
    startingStockCost,
    endingStockCost,
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
      if (quote.marketLowest === null) selected = { ...quote, reason: 'no_market' };
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
    const buildings = model.buildings.filter(building => building.type === definition.job);
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
  const level = Number(match[3]);
  const household = model.households.find(row => row.id === householdId);
  const building = model.buildings.find(row => row.id === household?.buildingId);
  return {
    day: event.eventDay ?? event.day ?? model.day,
    message: event.message,
    job: match[1],
    householdId,
    previousLevel: Math.max(0, level - 1),
    level,
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
  const companyIncome = model.companyLedger
    .filter(row => row.amount > 0)
    .reduce((total, row) => total + row.amount, 0);
  const companyExpense = model.companyLedger
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
    title: '市場と食料便を整えて、最初の入植世帯を迎える',
    evaluate({ model }) {
      const households = model.households.filter(household => household.job === 'logger').length;
      const daysToJudgment = 15 - (model.day % 15);
      return {
        complete: households > 0,
        progress: { done: Number(households > 0), total: 1 },
        detail: households > 0
          ? `木こりの入植世帯 ${households}世帯 / 島の人口 ${model.population}人`
          : `入植判定まで最大あと${daysToJudgment}日。市場と支援食料を整えたので、一日毎秒で進められます`,
        evidence: { households, population: model.population },
      };
    },
  }),
  Object.freeze({
    id: 'place-island-food',
    chapter: '第一章・最初の一荷',
    title: '木工房より先に、漁家と菜園を市場近くへ置く',
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
    id: 'warehouse-for-order',
    chapter: '第一章・最初の一荷',
    title: '注文を待つ間に蔵を置き、道で結ぶ',
    evaluate({ model }) {
      const warehouse = warehouseBuilding(model);
      const connected = warehouseConnected(model);
      const done = Number(Boolean(warehouse)) + Number(connected);
      return {
        complete: Boolean(warehouse) && connected,
        progress: { done, total: 2 },
        detail: warehouse
          ? (connected ? '蔵が道で結ばれました' : '蔵はありますが道の外です')
          : '注文を待つ間に、会社が買い集める蔵を用意します',
        evidence: { warehouse: Boolean(warehouse), connected },
      };
    },
  }),
  Object.freeze({
    id: 'prepare-first-tools-stock',
    chapter: '第一章・最初の一荷',
    title: '道具の買上げ目標を80荷にする',
    evaluate({ model }) {
      const target = model.stockTargets?.tools ?? 0;
      const stocked = model.companyStock?.tools ?? 0;
      const complete = target >= 80;
      return {
        complete,
        progress: { done: Math.min(target, 80), total: 80 },
        detail: `買上げ目標 ${target}荷 / 蔵の道具 ${stocked.toFixed(1)}荷（初注文の最大量80荷を先に準備）`,
        evidence: { target, stocked },
      };
    },
  }),
  Object.freeze({
    id: 'accept-first-order',
    chapter: '第一章・最初の一荷',
    title: '最初の適格日に届く本国注文を受ける',
    evaluate({ model }) {
      const accepted = Boolean(model.activeOrder);
      const offer = model.orderOffer;
      const daysToJudgment = 15 - (model.day % 15);
      const detail = accepted
        ? `受諾済み: ${goodsLabel(model.activeOrder.g)} ${model.activeOrder.qty}荷`
        : offer
          ? `注文状が届いています: ${goodsLabel(offer.g)} ${offer.qty}荷(${offer.due}日目まで)`
          : `蔵の道具 ${(model.companyStock?.tools ?? 0).toFixed(1)}荷 / 次の注文判定まで最大あと${daysToJudgment}日。一日毎秒で待てます`;
      return {
        complete: accepted,
        progress: { done: Number(accepted), total: 1 },
        detail,
        evidence: { accepted, offer: Boolean(offer), stocked: model.companyStock?.tools ?? 0 },
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
    title: '最初の買付品が蔵へ届くのを見届ける',
    evaluate({ model, state }) {
      const order = model.activeOrder;
      const stocked = order ? (model.companyStock?.[order.g] ?? 0) : 0;
      const expired = state?.letters?.find(letter => letter.id === 'accepted-order-expired') ?? null;
      return {
        complete: stocked > 0 || Boolean(expired),
        progress: { done: Number(stocked > 0 || Boolean(expired)), total: 1 },
        detail: expired
          ? '前の注文は期限切れになりました。原因を確認して次の章へ進めます'
          : order
          ? `蔵の${goodsLabel(order.g)} ${stocked.toFixed(1)}荷 / 注文 ${order.qty}荷`
          : '注文の受諾が先です',
        evidence: { stocked, goods: order?.g ?? null, expired: Boolean(expired) },
      };
    },
  }),
  Object.freeze({
    id: 'complete-first-order',
    chapter: '第一章・最初の一荷',
    title: '注文の船積みと船出を見届ける',
    evaluate({ model, events, state }) {
      const completion = orderCompletedEvent(events);
      const expiryLetter = state?.letters?.find(letter => letter.id === 'accepted-order-expired') ?? null;
      const previous = state?.goalResults?.['complete-first-order']?.evidence ?? {};
      const active = model.activeOrder;
      const completed = Boolean(completion);
      const expired = Boolean(expiryLetter);
      const exportHandling = events.filter(event => (
        event.type === 'handling' && event.direction === 'export'
      ));
      const lastOrder = active ? { ...active } : previous.lastOrder ?? null;
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
          expired,
          remaining,
          shipped,
          daysLeft,
          lastOrder,
          exportHandling: exportHandling.length,
          ledgerRows: model.companyLedger.length,
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
  Object.freeze({
    id: 'observe-seasonal-food-valley',
    chapter: '第三章・蔵の備え',
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
    chapter: '第三章・蔵の備え',
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
    chapter: '第三章・蔵の備え',
    title: '余剰が会社の蔵へ届くのを見届ける',
    evaluate({ model, state }) {
      const reserve = seasonalReserveFacts(model, state);
      const stock = model.companyStock?.[reserve.goods] ?? 0;
      return {
        complete: stock > 0,
        progress: { done: Number(stock > 0), total: 1 },
        detail: `蔵の${goodsLabel(reserve.goods)} ${stock.toFixed(1)}荷 / 目標 ${model.stockTargets?.[reserve.goods] ?? 0}荷`,
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
    chapter: '第三章・蔵の備え',
    title: '次の在庫谷で蔵の備えを市場へ出す',
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
            ? `${goodsLabel(valley.goods)}が再び薄くなりました。蔵出しできます`
            : `${goodsLabel(valley.goods)} ${marketGoodsAvailability(model, valley.goods).toFixed(1)}荷 / 蔵 ${stock.toFixed(1)}荷`)
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
    chapter: '第三章・蔵の備え',
    title: '第三章の蔵出し報告を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-three-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '仕入原価と蔵出し値の報告書が届きました' : '荷車が市場へ着くのを待っています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'assess-profitable-order',
    chapter: '第四章・本国の注文',
    title: '決済単価と市場最安値を比べる',
    evaluate({ model }) {
      const quote = orderQuote(model);
      const complete = Boolean(quote?.profitable);
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: quote
          ? `${goodsLabel(quote.goods)}: 決済 ${(quote.settlementPrice * 10).toFixed(1)} / 市場最安 ${quote.marketLowest === null ? '売り物なし' : (quote.marketLowest * 10).toFixed(1)}デナリ`
          : '次の注文状と、その時の市場最安値を待っています',
        evidence: {
          quote: quote ? {
            ...quote,
            ledgerLength: model.companyLedger.length,
            startingStock: model.companyStock?.[quote.goods] ?? 0,
            startingStockCost: (model.companyStock?.[quote.goods] ?? 0)
              * (model.companyStockAverageCosts?.[quote.goods] ?? 0),
          } : null,
        },
      };
    },
  }),
  Object.freeze({
    id: 'accept-profitable-order',
    chapter: '第四章・本国の注文',
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
    chapter: '第四章・本国の注文',
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
    chapter: '第四章・本国の注文',
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
          : '市場→蔵→港→船の実物流で注文を納めています',
        evidence: economics ?? { completed: false },
      };
    },
  }),
  Object.freeze({
    id: 'observe-skippable-order',
    chapter: '第四章・本国の注文',
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
    chapter: '第四章・本国の注文',
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
    chapter: '第四章・本国の注文',
    title: '第四章の商い判断報告を受け取る',
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
    chapter: '第五章・島の手仕事',
    title: '道具相場の立ち上がりを見届ける',
    evaluate({ model, state }) {
      const observation = toolsPriceRiseObservation(model, state);
      return {
        complete: observation.risen,
        progress: {
          done: Math.min(observation.ratio, TOOLS_PRICE_RISE_RATIO),
          total: TOOLS_PRICE_RISE_RATIO,
        },
        detail: `道具 ${(observation.minimumPrice * 10).toFixed(1)}→${(observation.currentPrice * 10).toFixed(1)}デナリ/荷（底から${(observation.ratio * 100).toFixed(1)}%）`,
        evidence: observation,
      };
    },
  }),
  Object.freeze({
    id: 'place-conversion-workshops',
    chapter: '第五章・島の手仕事',
    title: '木工房・炭焼・製塩所を揃える',
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
    chapter: '第五章・島の手仕事',
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
          `${row.label} ${row.occupied ? `生産EMA ${(row.economics?.productionEma ?? 0).toFixed(2)}` : '入植待ち'}`
        )).join(' / '),
        evidence: chain,
      };
    },
  }),
  Object.freeze({
    id: 'sustain-conversion-workshops',
    chapter: '第五章・島の手仕事',
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
          : '木工房・炭焼・製塩所の入植がすべて続くのを待っています',
        evidence: survival,
      };
    },
  }),
  Object.freeze({
    id: 'observe-household-level-up',
    chapter: '第五章・島の手仕事',
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
    chapter: '第五章・島の手仕事',
    title: '第五章の手仕事と暮らしの報告を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-five-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '90日の存続と暮らしの成長報告が届きました' : '第五章の報告をまとめています',
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
          ? '教程の目標を閉じ、同じ島で自由プレイが始まりました'
          : '第五章までの実測を卒業書状へまとめています',
        evidence: { issued },
      };
    },
  }),
]);

// 創発を待つ観察課題は教程の進行を止めない。条件が実際に起きた時だけ
// エレナの報告・助言として回収し、建設や設定など直接操作できる課題を背骨にする。
export const TUTORIAL_OPTIONAL_GOAL_IDS = Object.freeze([
  'observe-island-food-change',
  'reduce-food-imports',
  'observe-seasonal-food-valley',
  'fill-seasonal-reserve',
  'release-seasonal-reserve',
  'assess-profitable-order',
  'accept-profitable-order',
  'target-profitable-order',
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

function adviceEventSequence(event) {
  return event?.sequence ?? `${event?.day ?? 0}:${event?.message ?? ''}`;
}

export const TUTORIAL_ADVICE = Object.freeze([
  Object.freeze({
    id: 'seasonal-release-opportunity',
    channel: 'advice',
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
        detail: `市場 ${available.toFixed(1)}荷・蔵 ${stock.toFixed(1)}荷。会社を開き、市場へ出す量を決められます。`,
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
      return {
        active: hungerRun >= 30,
        completed: false,
        evidence: { householdId: household?.id ?? null, hungerRun },
        priority: 'action',
        kicker: 'エレナの早期警告',
        title: `${family}の食料が危険です`,
        detail: `必要な食料を${hungerRun}日連続で食べられていません。60日に達すると家族が亡くなります。家の食料庫、市場への道、漁家・菜園を確認してください。`,
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
        detail: `${requirementLabel}を含む暮らしを${45 * (report?.level ?? 1)}日積み重ねた成果です。建物を開くと、次の成長条件と日数が分かります。`,
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
      return {
        active: fresh,
        completed: false,
        evidence: { sequence },
        priority: 'info',
        kicker: 'エレナからの報告',
        title: '島の住民が亡くなりました',
        detail: death
          ? `${death.message}。必要な食料を60日連続で食べられなかったためです。家の食料庫、市場への道、漁家・菜園を確認すると次の死を防げます。`
          : `${model.day}日目の人口変化です。島況で食料と暮らしを確認できます。`,
        target: death?.sequence ? { kind: 'event', sequence: death.sequence } : null,
      };
    },
  }),
]);

function pendingTutorialGoal(state) {
  const goal = TUTORIAL_GOALS.find(candidate => isRequiredTutorialGoal(candidate)
    && !goalCompleted(state, candidate.id));
  return goal ? {
    id: goal.id,
    chapter: goal.chapter,
    title: TUTORIAL_PLAYER_TITLES[goal.id] ?? goal.title,
  } : null;
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
      const debtText = report.debt === null ? '—' : toDenari(report.debt).toFixed(0);
      const limitText = report.limit === null ? '—' : toDenari(report.limit).toFixed(0);
      const balanceText = toDenari(model.companyMoney).toFixed(1);
      return {
        kicker: '会社・最終通告',
        title: '帳簿は、教程の外でも閉じません',
        summary: `債務 ${debtText}デナリ・信用限度 ${limitText}デナリ・会社残高 ${balanceText}デナリ`,
        facts: { ...report, companyMoney: model.companyMoney, currentGoal },
        body: [
          `${model.day}日目。会社から最終通告が出ました。会社残高は${balanceText}デナリ、記録された債務は${debtText}デナリ、信用限度は${limitText}デナリです。`,
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
          '市場と食料便は先に整いました。木工房を急ぐ前に、水際へ漁家、市場近くの平地へ菜園を置き、島の食卓を立ち上げましょう。',
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
          `${model.day}日目。港と市場の道が通りました。入植者の持参食料だけでは、漁家と菜園が働き始めるまでの空白を安全には渡れません。`,
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
        && (model.stockTargets?.[order.g] ?? 0) < order.qty;
    },
    render({ model }) {
      const order = model.activeOrder;
      return {
        kicker: '会社の銀は総督のもの',
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
        summary: `${model.day}日目・残り${Number(remaining).toFixed(1)}荷を納め切れませんでした`,
        facts: { goods: order?.g ?? order?.goods ?? null, remaining, message: expired?.message ?? '' },
        body: [
          `${model.day}日目。船は出ましたが、注文の全量を期限までに納め切れず、残り${Number(remaining).toFixed(1)}荷で期限切れになりました。船出は一部の荷が動いた合図で、注文完遂とは別です。`,
          '次の注文では、会社画面の「納品済み／残り／あと何日」を見てください。買上げ目標、蔵への道、市場の在庫を整えれば、次の注文でやり直せます。',
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
        summary: `${completed.eventDay ?? completed.day}日目・売上 ${toDenari(revenue).toFixed(1)}デナリ・達成上乗せ ${toDenari(premium).toFixed(1)}デナリ`,
        facts: { goods: facts.goods, qty: facts.qty, revenue, premium },
        body: [
          `${completed.eventDay ?? completed.day}日目。最後の一荷が船へ移り、${goodsLabel(facts.goods)}${facts.qty}荷の注文を納めました。会社の実台帳に、本国注文売上として${toDenari(revenue).toFixed(1)}デナリが記帳されています。`,
          `このうち通常単価分は${toDenari(base).toFixed(1)}デナリ、完遂による上乗せは${toDenari(premium).toFixed(1)}デナリです。市場で作り手へ銀を払い、道と蔵と港を経て、島の品が初めて本国の売上になりました。`,
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
          `食料支援は${aidRequests}回要請しましたが、贈与なのでこの仕入額には含まれません。輸出で銀を得る道は通りました。次は、島の食卓を本土任せにせず、島の中で作る番です。`,
        ].join('\n\n') : [
          '最初の注文は納め切れませんでしたが、教程はここで止まりません。会社画面に残量と期限が見えるようになったので、次の注文では準備と進み具合を自分で確かめられます。',
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
          '第一章で置いた漁家と菜園が育てば、本土から買う量は自然に減っていきます。第二章では、その変化を見届けます。',
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
        kicker: '第三章・蔵の備え',
        title: '市場が空になる日があります',
        summary: `${goodsLabel(facts.goods)} ${facts.peakAvailability.toFixed(1)}→${facts.available.toFixed(1)}荷・相場 ${(facts.price * 10).toFixed(1)}デナリ`,
        facts: { ...facts, firstOrderGoods: firstGoods, staleTarget },
        body: [
          `${facts.peakDay}日目に市場で見えた${goodsLabel(facts.goods)}の余剰は${facts.peakAvailability.toFixed(1)}荷でしたが、${facts.day}日目には${facts.available.toFixed(1)}荷、ピークの${(facts.valleyRatio * 100).toFixed(1)}%まで薄くなりました。その日の相場EMAは1荷あたり${(facts.price * 10).toFixed(1)}デナリです。`,
          `${firstGoods ? `最初の注文で定めた${goodsLabel(firstGoods)}の買上げ目標は、いまも${staleTarget}荷のままです。役目を終えた命令は0へ戻し、` : ''}${goodsLabel(facts.goods)}の買上げ目標を${SEASONAL_RESERVE_TARGET}荷にしてください。目標は注文ではなく、余る季節の品を会社の蔵へ備えるためにも使えます。`,
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
        title: '余る季節の品を、蔵へ',
        summary: `${goodsLabel(facts.goods)}の買上げ目標 ${target}荷`,
        facts: { goods: facts.goods, target },
        body: [
          `${model.day}日目。${goodsLabel(facts.goods)}の買上げ目標を${target}荷と定めました。会社の荷車は価格と在庫のある時だけ市場で買い、実物を蔵へ運びます。`,
          '目標を書いただけでは品は増えません。作り手の余剰が市場に出て、会社が代金を払い、荷車が到着するまでを見届けましょう。',
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
        kicker: '蔵の入庫報告',
        title: '備えが実物になりました',
        summary: `${goodsLabel(facts.goods)} ${stock.toFixed(1)}荷・平均仕入 ${(averageCost * 10).toFixed(1)}デナリ`,
        facts: { goods: facts.goods, stock, averageCost },
        body: [
          `${model.day}日目。会社の蔵に${goodsLabel(facts.goods)}が${stock.toFixed(1)}荷入りました。実際の平均仕入原価は1荷あたり${(averageCost * 10).toFixed(1)}デナリです。`,
          '次に市場の余剰がふたたび薄くなった時、帳場の「蔵出し」でこの備えを市場へ戻せます。値付けも、その時の実帳面からご報告します。',
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
        kicker: '蔵出しの荷車',
        title: '備えを市場へ戻します',
        summary: `${goodsLabel(release.goods)} ${release.qty.toFixed(1)}荷・実荷車が出発`,
        facts: {
          ...release,
          averageCost: prior.averageCost,
          marketAvailability: marketGoodsAvailability(model, release.goods),
          marketPrice: model.marketPrices[release.goods],
        },
        body: [
          `${model.day}日目。市場で見える${goodsLabel(release.goods)}が${marketGoodsAvailability(model, release.goods).toFixed(1)}荷まで薄くなったため、蔵から${release.qty.toFixed(1)}荷を積んだ実荷車が出発しました。`,
          '品は瞬時に市場へ移りません。蔵から市場まで道を走り、棚へ到着した時に蔵出し値が立ちます。',
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
        kicker: '第三章・蔵の備え',
        title: '備えの命令を出しました',
        summary: `${goodsLabel(reserve.goods)}の買上げ目標 ${target}荷`,
        facts: { goods: reserve.goods, target },
        body: [
          `${model.day}日目。${goodsLabel(reserve.goods)}の買上げ目標を${target}荷にしました。市場に余りが出れば会社が買い、実物が蔵へ届きます。`,
          '品薄の好機は季節や住民の売買で変わるため、教程の必達条件にはしません。実際に好機が来た時だけ、エレナが会社画面を開くようお知らせします。見送っても教程は進みます。',
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
        kicker: '第四章・本国の注文',
        title: '決済の値と、仕入の値を並べます',
        summary: `${goodsLabel(quote.goods)}・決済 ${(quote.settlementPrice * 10).toFixed(1)} / 市場最安 ${(quote.marketLowest * 10).toFixed(1)}デナリ`,
        facts: quote,
        body: [
          `${quote.day}日目。${goodsLabel(quote.goods)}${quote.qty}荷の注文状です。本国の表示単価は${(quote.basePrice * 10).toFixed(1)}デナリですが、完遂時の実決済は1荷あたり${(quote.settlementPrice * 10).toFixed(1)}デナリ。いま市場で買える最安値は${(quote.marketLowest * 10).toFixed(1)}デナリです。`,
          `現時点の差は1荷あたり${(quote.marginPerUnit * 10).toFixed(1)}デナリ、全${quote.qty}荷なら${(quote.quotedMargin * 10).toFixed(1)}デナリの黒字見込みです。相場は動きますが、まず決済と仕入を同じ単位で並べる——その上で受けるかをお決めください。`,
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
        title: '受諾と買付は、別のご下命です',
        summary: `${goodsLabel(quote.goods)} ${quote.qty}荷・買上げ目標 ${model.stockTargets?.[quote.goods] ?? 0}荷`,
        facts: { ...quote, target: model.stockTargets?.[quote.goods] ?? 0 },
        body: [
          `${model.day}日目。${goodsLabel(quote.goods)}${quote.qty}荷の注文を受諾しました。第一章と同じく、受諾しただけでは会社の買付は始まりません。`,
          `帳場で${goodsLabel(quote.goods)}の買上げ目標を${quote.qty}荷以上に定めてください。会社の銀を使う命令は、いつも総督の選択です。`,
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
          `${facts.completionDay}日目。${goodsLabel(facts.goods)}${facts.qty}荷を納め、実売上は${toDenari(facts.revenue).toFixed(1)}デナリ、今回の出荷に対応する実在庫原価は${toDenari(facts.orderCost).toFixed(1)}デナリ、差し引き粗利は${toDenari(facts.realizedMargin).toFixed(1)}デナリでした。`,
          `注文状を見た時の市場最安は1荷あたり${(quote.marketLowest * 10).toFixed(1)}デナリ、完遂決済は${(quote.settlementPrice * 10).toFixed(1)}デナリでした。最初の見立てと、最後の実帳簿を分けて確かめるのが商いです。`,
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
      const market = quote.marketLowest === null
        ? '市場に売り物がなく、仕入値を確定できません'
        : `市場最安は1荷あたり${(quote.marketLowest * 10).toFixed(1)}デナリです`;
      const judgment = quote.reason === 'loss'
        ? `決済との差は1荷あたり${(quote.marginPerUnit * 10).toFixed(1)}デナリで、現在値では赤字です`
        : quote.reason === 'no_market'
          ? '調達できる数量も原価も見えず、完遂の見立てを立てられません'
          : `期間内に採算割れが来なかったため、${evidence.seenOffers.length}件目を比較根拠の確認課題にします。現在値では黒字見込みです`;
      return {
        kicker: '受けない注文の見立て',
        title: 'この注文は、受諾せずに見送ります',
        summary: `${goodsLabel(quote.goods)} ${quote.qty}荷・決済 ${(quote.settlementPrice * 10).toFixed(1)}デナリ / ${quote.marketLowest === null ? '市場在庫なし' : `市場最安 ${(quote.marketLowest * 10).toFixed(1)}デナリ`}`,
        facts: evidence,
        body: [
          `${quote.day}日目。${goodsLabel(quote.goods)}${quote.qty}荷、完遂決済は1荷あたり${(quote.settlementPrice * 10).toFixed(1)}デナリ。${market}。${judgment}。`,
          `会社欄の「拒否する」は世界や帳簿を書き換えず、この注文状を画面上で伏せるだけです。受諾せず期限まで置き、実際の失効を見届けてください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-four-close',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'close-third-chapter');
    },
    render({ state }) {
      const profit = state.goalResults['complete-profitable-order']?.evidence ?? null;
      const skipped = state.goalResults['let-skippable-order-expire']?.evidence ?? null;
      const selected = skipped?.selected ?? null;
      // profit は evidence フォールバック {completed:false} で常に truthy になるため、
      // 完遂実績と失効実績が両方揃った時だけ詳細文を出す（失効前は expired が null）
      const detailed = Boolean(profit?.completed && selected && skipped?.expired);
      return {
        kicker: '第四章・商い判断報告',
        title: '注文は、残量と期限を見て選べます',
        summary: detailed
          ? `利益注文の粗利 ${toDenari(profit.realizedMargin).toFixed(1)}デナリ / 見送り ${goodsLabel(selected.goods)} ${selected.qty}荷`
          : '注文の完遂と船出を分け、採算を比べる準備ができました',
        facts: { profit, skipped },
        body: detailed ? [
          `ひとつの注文は、実売上${toDenari(profit.revenue).toFixed(1)}デナリから出荷原価${toDenari(profit.orderCost).toFixed(1)}デナリを引き、粗利${toDenari(profit.realizedMargin).toFixed(1)}デナリで完遂しました。もうひとつの${goodsLabel(selected.goods)}${selected.qty}荷は受諾せず、${skipped.expired.day}日目に実際に失効しました。`,
          '注文状は命令ではありません。決済と市場を比べ、会社の銀を使うか決めること。引き受けない自由も総督のものです。',
        ].join('\n\n') : [
          '注文は届く時期も内容も島の生産によって変わります。好都合な注文を必達条件として待たせず、届いた時に会社画面で決済単価、市場最安、残量、期限を比べられるようにしました。',
          '利益を見込める注文や見送るべき注文が実際に来た時は、エレナが観測結果を報告します。教程を止めず、自分の島の商いとして判断できます。',
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
        kicker: '第五章・島の手仕事',
        title: '道具の値が上がっています',
        summary: `底値 ${(facts.minimumPrice * 10).toFixed(1)}→${(facts.currentPrice * 10).toFixed(1)}デナリ/荷（+${(facts.ratio * 100).toFixed(1)}%）`,
        facts,
        body: [
          `${facts.minimumDay}日目に1荷あたり${(facts.minimumPrice * 10).toFixed(1)}デナリだった道具相場EMAが、${facts.currentDay}日目には${(facts.currentPrice * 10).toFixed(1)}デナリ、底から${(facts.ratio * 100).toFixed(1)}%上がりました。台詞のための固定相場ではなく、この島で動いた実値です。`,
          '既設の木工房に加え、炭焼と製塩所をお置きください。木工と炭焼は丸太を、製塩所は木炭をinput棚へ買い、道具・木炭・塩へ作り替えます。',
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
          `${model.day}日目。${rows.map(row => `${row.label}${row.buildingCount}棟`).join('、')}が島に揃いました。建物を置いただけでは品は生まれません。移民が入り、原料を市場で買ってinput棚へ運ぶまでを待ちます。`,
          'input棚の中身、原料相場、作る品の原価と生産EMAを、同じ瞬間の実帳面で並べてご報告します。',
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
        title: '丸太から道具と木炭へ、木炭から塩へ',
        summary: `生産EMA 道具${woodshop.productionEma.toFixed(2)}・木炭${charburner.productionEma.toFixed(2)}・塩${saltworks.productionEma.toFixed(2)}`,
        facts,
        body: [
          `${model.day}日目。丸太相場は1荷あたり${(facts.logPrice * 10).toFixed(1)}デナリ。木工房のinput棚には${woodshop.inputAmount.toFixed(1)}荷あり、道具の実生産原価は${(woodshop.cost * 10).toFixed(1)}デナリ/荷、生産EMAは${woodshop.productionEma.toFixed(2)}です。炭焼のinput棚は丸太${charburner.inputAmount.toFixed(1)}荷、木炭原価${(charburner.cost * 10).toFixed(1)}デナリ/荷、生産EMA${charburner.productionEma.toFixed(2)}です。`,
          `その木炭相場は1荷あたり${(facts.charPrice * 10).toFixed(1)}デナリ。製塩所のinput棚には${saltworks.inputAmount.toFixed(1)}荷あり、塩の実生産原価は${(saltworks.cost * 10).toFixed(1)}デナリ/荷、生産EMAは${saltworks.productionEma.toFixed(2)}です。原料の値が次の作り手の原価へ渡る——これが島内の連鎖です。`,
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
        kicker: '第五章・手仕事と暮らしの報告',
        title: '三つの手仕事を観察できる町になりました',
        summary: survival && levelUp
          ? `三つの手仕事 ${survival.elapsedDays}日存続・${levelUp.job}#${levelUp.householdId} Lv${levelUp.level}`
          : '木工房・炭焼・製塩所を置き、原料と暮らしの変化を追えます',
        facts: { survival, levelUp, vacancy },
        body: survival && levelUp ? [
          `木工房・炭焼・製塩所は${survival.startDay}日目から${survival.currentDay}日目まで、連続${survival.elapsedDays}日存続しました。丸太は道具と木炭へ、木炭は塩へ渡り、三つの品の生産が続いています。`,
          `${levelUp.day}日目には${levelUp.job}#${levelUp.householdId}がLv${levelUp.level}へ上がり、建物${levelUp.buildingId}の外観にも反映されました。${vacancyBody}`,
        ].join('\n\n') : [
          '木工房・炭焼・製塩所が揃いました。入植、原料の入荷、相場の変化、90日の存続は創発する結果なので、教程の必達条件にはしません。',
          '建物を押せば原料棚と産出棚、実際にかかった原価を読めます。変化が実際に起きた時だけ、エレナが止めない報告としてお知らせします。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'tutorial-graduation',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'close-fifth-chapter');
    },
    render({ model }) {
      const facts = tutorialGraduationFacts(model);
      const netSign = facts.companyNet >= 0 ? '+' : '';
      const bankruptcy = facts.companyBankruptcyDay === null
        ? '破産なし'
        : `${facts.companyBankruptcyDay}日目に破産記録あり`;
      return {
        kicker: '終章・総督の島',
        title: 'あとは総督の思うままに',
        summary: `人口${facts.population}人・存続${facts.survivingJobCount}職・食料輸入EMA ${facts.foodImportEma.toFixed(3)}・会社収支 ${netSign}${toDenari(facts.companyNet).toFixed(1)}デナリ`,
        facts,
        body: [
          `${facts.day}日目。総督が育てた町は人口${facts.population}人、現に世帯が働く職は${facts.survivingJobCount}種です。安定監査の中核${facts.stableJobsRequired}職のうち${facts.stableJobsPresent}職が存続しています。食料輸入EMAは${facts.foodImportEma.toFixed(3)}、島内食料生産EMAは${facts.foodProductionEma.toFixed(2)}です。`,
          `会社の実台帳は収入${toDenari(facts.companyIncome).toFixed(1)}デナリ、支出${toDenari(facts.companyExpense).toFixed(1)}デナリ、差引${netSign}${toDenari(facts.companyNet).toFixed(1)}デナリ、残高${toDenari(facts.companyMoney).toFixed(1)}デナリ、${bankruptcy}。見本となるE-Stableは${facts.reference.years}年の各年に人口${facts.reference.populationBand[0]}〜${facts.reference.populationBand[1]}人、中核${facts.stableJobsRequired}職を各1以上、破産なしを確かめる参照帯です。食料自給の節目は、この島で較正した輸入EMA ${facts.reference.foodImportEmaMax.toFixed(2)}未満です。町の年齢も総督の選択も違うため、これは合否ではなく行く先を測る物差しとしてお読みください。`,
          '開始メニューの「テスト配置で観察」は、同じエンジンでこの安定帯を通った「見本の町」です。見比べることも、ここから別の産業を伸ばすこともできます。教程の目標はここで閉じますが、島も帳簿も作り直しません。エレナは重要な出来事だけをお届けします——あとは総督の思うままに。',
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
