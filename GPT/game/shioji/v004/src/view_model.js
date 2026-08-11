import { JOB_LABELS, SECTION_LABELS } from './config.js?v=v004.46.3-boot-report';
import {
  FOOD_GOODS, perishableFreshness,
} from './food_readability.js?v=v004.46.3-boot-report';
import {
  LADDER, MAINLAND_AID, P, companyStockReleasePrice, householdClass,
  findTravelPath, householdProductionSummary, productionCost,
} from './engine_bridge.js?v=v004.46.3-boot-report';
import { analyzeRoadConnections } from './placement.js?v=v004.46.3-boot-report';
import {
  compileRenderScene, renderSceneTopology,
} from './render_scene.js?v=v004.46.3-boot-report';
import {
  buildingAppearance, buildingStructureLayout, displayCultureLevel, pileVisual, trailVisual,
  yardLayout, yardStockRows,
} from './visuals.js?v=v004.46.3-boot-report';

const INVENTORY_SECTIONS = Object.freeze([
  'input', 'output', 'storage', 'construction', 'repair', 'inbound', 'outbound', 'pickup',
]);

const CONVERSION_JOBS = Object.freeze({
  fisher2: Object.freeze({ goods: 'meal', inputGoods: 'fish' }),
  woodshop: Object.freeze({ goods: 'tools', inputGoods: 'log' }),
  charburner: Object.freeze({ goods: 'char', inputGoods: 'log' }),
  saltworks: Object.freeze({ goods: 'salt', inputGoods: 'char' }),
});

const MODEL_TOPOLOGY_REVISIONS = new WeakMap();
export const COMPANY_VISIBLE_PORTER_LIMIT = 6;
const FOOD_GOODS_SET = new Set(FOOD_GOODS);
export const FOOD_DELIVERY_ALERT_LABELS = Object.freeze({
  no_money: 'お金がなく買えない',
  too_expensive: '高くて買えない',
  no_capacity: '荷が多く運べない',
  no_route: '市場への道がない',
  no_stock: '市場に食料なし',
  not_released: '市場に出ていない',
  shopping: '買い出し中',
  waiting: '次の買い出し待ち',
  consumed: '今日分を食べ切った',
});

export function caravanStatePresentation(route) {
  if (route.fundingShortfall || route.lastFundingShortfall) {
    return { key: 'funds', label: route.currentTrip ? '運行中・資金不足' : '資金不足' };
  }
  if (route.state === 'outbound') return { key: 'running', label: '往路を運行中' };
  if (route.state === 'returning') return { key: 'running', label: '帰路を運行中' };
  if (route.state === 'waiting_crew') return { key: 'crew', label: '御者待ち' };
  if (['waiting_cart', 'waiting_cart_return'].includes(route.state)) {
    return { key: 'cart', label: '荷車待ち' };
  }
  if (['waiting_road', 'waiting_road_return'].includes(route.state)) {
    return { key: 'road', label: '道路待ち' };
  }
  return { key: 'idle', label: '待機中' };
}

export function caravanAccountingPresentation(route, day) {
  const rows = Object.entries(route.monthly ?? {}).map(([month, source]) => {
    const sales = source.sales ?? 0;
    const procurement = source.procurement ?? 0;
    const wages = source.wages ?? 0;
    const cartCosts = source.cartCosts ?? source.wear ?? 0;
    return {
      month: Number(month),
      sales,
      procurement,
      wages,
      cartCosts,
      profit: sales - procurement - wages - cartCosts,
    };
  }).sort((left, right) => left.month - right.month);
  const currentMonth = Math.floor(Math.max(0, day - 1) / 30);
  const current = rows.find(row => row.month === currentMonth) ?? {
    month: currentMonth, sales: 0, procurement: 0, wages: 0, cartCosts: 0, profit: 0,
  };
  const fiscalStartMonth = Math.floor(currentMonth / 12) * 12;
  return {
    currentMonth,
    current,
    fiscalProfit: rows.filter(row => (
      row.month >= fiscalStartMonth && row.month <= currentMonth
    )).reduce((total, row) => total + row.profit, 0),
    rows: rows.slice(-12),
  };
}

function caravanRouteQuotes(snapshot, terrain, building, owner) {
  if (building.type !== 'carter' || !owner) return [];
  const markets = snapshot.economy.marketNetwork?.markets ?? [];
  const baseMarketId = owner.marketId ?? 'main';
  const base = markets.find(market => market.id === baseMarketId);
  const crew = Math.min(building.caravanEmployment?.recruitment ?? 1, owner.members.length);
  return markets.filter(market => market.id !== baseMarketId).map(market => {
    const path = base?.entrance && market.entrance
      ? findTravelPath({ ...snapshot.physical, terrain }, base.entrance, market.entrance, 'cart')
      : null;
    return {
      marketId: market.id,
      marketName: market.name,
      reachable: Boolean(path),
      oneWayTicks: path?.cost ?? null,
      oneWayDays: path ? path.cost / 30 : null,
      crew,
      capacity: crew * P.CART_WOOD_CAPACITY,
    };
  });
}
const REQUIREMENT_GOODS = Object.freeze({
  food1: Object.freeze(['wheat']),
  food2: Object.freeze(['fish', 'veg']),
  food3: Object.freeze(['fish', 'veg', 'wheat']),
  grain: Object.freeze(['wheat']),
  saltchar: Object.freeze(['salt', 'char']),
  tools: Object.freeze(['tools']),
  salt: Object.freeze(['salt']),
  char: Object.freeze(['char']),
  cloth: Object.freeze(['cloth']),
  iron: Object.freeze(['iron']),
});

export function foodDeliveryAlertLabel(delivery) {
  return FOOD_DELIVERY_ALERT_LABELS[delivery?.kind] ?? '食料不足';
}

function stableVisualHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function walkingVisualProfile(id, seed = 0) {
  const hash = stableVisualHash(`${seed}:${id}`);
  const lane = [-0.18, -0.09, 0.09, 0.18][hash & 3];
  return {
    pace: 0.9 + (((hash >>> 8) & 0xff) / 255) * 0.2,
    lane,
    stepPhase: ((hash >>> 16) & 0xffff) / 0xffff * Math.PI * 2,
  };
}

export function terrainRevisionForModel(model) {
  return model ? MODEL_TOPOLOGY_REVISIONS.get(model)?.terrainRevision ?? null : null;
}

export function terrainTopologyForModel(model) {
  return model ? renderSceneTopology(model.renderScene)?.terrainLayer ?? null : null;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function shelfRows(building) {
  const rows = [];
  for (const section of INVENTORY_SECTIONS) {
    const amounts = building.inventory?.[section] ?? {};
    const capacities = building.caps?.[section] ?? {};
    const goods = new Set([...Object.keys(amounts), ...Object.keys(capacities)]);
    for (const goodsId of goods) {
      rows.push({
        section,
        goods: goodsId,
        amount: amounts[goodsId] ?? 0,
        capacity: capacities[goodsId] ?? 0,
        visual: pileVisual(amounts[goodsId] ?? 0, goodsId),
      });
    }
  }
  return rows;
}

function pantryRows(household) {
  return Object.entries(household.pantry ?? {}).map(([goods, amount]) => ({
    section: FOOD_GOODS_SET.has(goods) ? 'foodPantry' : 'householdGoods',
    goods, amount, capacity: null, visual: pileVisual(amount, goods),
  }));
}

function groupedStock(rows) {
  const groups = new Map();
  for (const row of rows.filter(item => item.visual.amount > 1e-9)) {
    if (!groups.has(row.section)) groups.set(row.section, []);
    groups.get(row.section).push(row);
  }
  return [...groups.entries()].map(([section, items]) => {
    const totalAmount = items.reduce((total, item) => total + item.visual.amount, 0);
    const primary = [...items].sort((left, right) => right.visual.amount - left.visual.amount)[0];
    return {
      section,
      items,
      goods: primary.goods,
      totalAmount,
      visual: pileVisual(totalAmount, primary.goods),
    };
  });
}

function cultureProgress(household) {
  const level = household.lv ?? 0;
  const requirements = LADDER[householdClass(household)] ?? [];
  const satisfaction = household.satLast ?? {};
  const nextRequirement = requirements[level] ?? null;
  const requiredDays = nextRequirement ? P.UP_DAYS * (level + 1) : 0;
  const missingForCurrent = requirements.slice(0, level).filter(key => !satisfaction[key]);
  return {
    level,
    displayLevel: displayCultureLevel(level),
    nextDisplayLevel: nextRequirement ? displayCultureLevel(level + 1) : null,
    upDays: household.up ?? 0,
    requiredDays,
    nextRequirement,
    nextSatisfied: nextRequirement ? Boolean(satisfaction[nextRequirement]) : true,
    achievedRequirement: level > 0 ? requirements[level - 1] ?? null : null,
    missingForCurrent,
    missingGoodsForCurrent: [...new Set(missingForCurrent.flatMap(
      requirement => REQUIREMENT_GOODS[requirement] ?? [],
    ))],
    downDays: household.down ?? 0,
    downgradeDays: P.DOWN_DAYS,
  };
}

function householdFoodAmount(household) {
  return FOOD_GOODS.reduce(
    (total, goods) => total + (household?.pantry?.[goods] ?? 0),
    0,
  );
}

function rawHouseholdFoodDays(household) {
  const familySize = Math.max(1, household?.members?.length ?? 0);
  return householdFoodAmount(household) / familySize;
}

function cargoFoodRows(household) {
  if (household?.cargo?.direction !== 'inbound') return [];
  return Object.entries(household.cargo.manifest ?? {})
    .filter(([goods, amount]) => FOOD_GOODS_SET.has(goods) && amount > 1e-9)
    .map(([goods, amount]) => ({ goods, amount }));
}

function marketFoodRows(economy) {
  return FOOD_GOODS.map(goods => ({
    goods,
    amount: (economy.stalls?.[goods] ?? []).reduce(
      (total, stall) => total + (stall.qty ?? 0),
      0,
    ) + (economy.marketStock?.[goods] ?? 0),
  })).filter(row => row.amount > 1e-9);
}

function foodDeliveryStatus(household, economy) {
  if (!household) return null;
  const foodDays = rawHouseholdFoodDays(household);
  const inbound = cargoFoodRows(household);
  const inboundAmount = inbound.reduce((total, row) => total + row.amount, 0);
  if (inboundAmount > 1e-9) {
    return {
      kind: 'returning',
      tone: 'transit',
      label: `食料${inboundAmount.toFixed(1)}荷を持ち帰り中`,
      detail: '市場で買えています。家に着くと食料庫へ入ります。',
      goods: inbound.map(row => row.goods).slice(0, 3),
    };
  }
  if (foodDays >= 3) return null;
  if (['arriving', 'building'].includes(household.state)) {
    return {
      kind: 'settling',
      tone: 'transit',
      label: '入居の普請中',
      detail: '家が完成すると市場へ買い出しに出ます。',
      goods: ['wheat'],
    };
  }
  if (['toMarket', 'atMarket'].includes(household.state)) {
    return {
      kind: 'shopping',
      tone: 'transit',
      label: household.state === 'atMarket' ? '市場で食料を探しています' : '市場へ買い出し中',
      detail: '食料はまだ家の食料庫へ届いていません。',
      goods: ['wheat'],
    };
  }
  // household.roadは未使用の初期化フィールドで常にfalse。到達可否は
  // 経路長(未到達はInfinity→snapshotのJSON化でnull)で判定する。
  if (household.marketOneWayTicks == null) {
    return {
      kind: 'no_route',
      tone: 'blocked',
      label: '市場までの経路がありません',
      detail: '建物の入口から市場まで通れる道をつないでください。',
      goods: ['wheat'],
    };
  }

  const lastVisit = household.lastMarketVisit ?? null;
  const boughtFood = Object.entries(lastVisit?.purchased ?? {})
    .filter(([goods, amount]) => FOOD_GOODS_SET.has(goods) && amount > 1e-9);
  if (lastVisit?.day === economy.currentDay && boughtFood.length > 0) {
    const amount = boughtFood.reduce((total, [, qty]) => total + qty, 0);
    return {
      kind: 'consumed',
      tone: 'warning',
      label: `今日${amount.toFixed(1)}荷を買い、ほぼ食べ切りました`,
      detail: '買っていないのではなく、家族一日分に届かない量でした。',
      goods: boughtFood.map(([goods]) => goods).slice(0, 3),
    };
  }

  const foodBlockers = Object.entries(lastVisit?.blockers ?? {})
    .filter(([goods]) => FOOD_GOODS_SET.has(goods))
    .map(([, reason]) => reason);
  const available = marketFoodRows(economy);
  const companyFood = FOOD_GOODS.reduce(
    (total, goods) => total + (economy.stock?.[goods] ?? 0),
    0,
  );
  const goods = available.map(row => row.goods).slice(0, 3);
  if (foodBlockers.includes('no_money')) {
    return {
      kind: 'no_money',
      tone: 'blocked',
      label: '食料を買うお金が足りません',
      detail: available.length
        ? '市場に食料はありますが、必要な一日分を買える所持金がありません。'
        : '前回の買い出しでは、必要な食料を買う所持金がありませんでした。',
      goods: goods.length ? goods : ['wheat'],
    };
  }
  if (foodBlockers.includes('no_capacity')) {
    return {
      kind: 'no_capacity',
      tone: 'blocked',
      label: '運べる量が足りません',
      detail: '前回はほかの荷で運搬枠が埋まり、食料を積み切れませんでした。',
      goods: goods.length ? goods : ['wheat'],
    };
  }
  if (foodBlockers.includes('too_expensive')) {
    return {
      kind: 'too_expensive',
      tone: 'blocked',
      label: '食料の値段が折り合いません',
      detail: '市場にはありますが、この家が払える価格を超えています。',
      goods: goods.length ? goods : ['wheat'],
    };
  }
  if (available.length > 0) {
    return {
      kind: 'waiting',
      tone: 'warning',
      label: '市場に食料あり・次の買い出し待ち',
      detail: '各世帯は朝に順番で市場へ向かいます。移動中は食料庫へまだ反映されません。',
      goods,
    };
  }
  if (companyFood > 1e-9) {
    return {
      kind: 'not_released',
      tone: 'blocked',
      label: '島にはあるが、市場に届いていません',
      detail: '会社倉庫の食料を「取引」から市場へ出すと、世帯が買えるようになります。',
      goods: FOOD_GOODS.filter(goodsId => (economy.stock?.[goodsId] ?? 0) > 1e-9).slice(0, 3),
    };
  }
  return {
    kind: 'no_stock',
    tone: 'blocked',
    label: '市場の食料棚が空です',
    detail: '生産や市場への搬入を待っています。',
    goods: ['wheat'],
  };
}

function marketRhythmStatus(household, economy) {
  const reason = household.marketCarrier?.reason ?? household.lastMarketTripReason ?? null;
  if (household.marketCarrier) {
    const copy = {
      routine_batch: {
        label: '2日分をまとめて市場へ運搬中',
        detail: '毎日の小口出荷を避け、家族がまとめて運んでいます。',
      },
      food_urgent: {
        label: '食料の緊急買い出し中',
        detail: '食料切れは出荷日を待たず、すぐ市場へ向かいます。',
      },
      input_urgent: {
        label: '止まった仕事の原料を調達中',
        detail: '生産停止中の原料だけは、出荷日を待たず買いに行きます。',
      },
      input_restocks: {
        label: '原料をまとめて補充中',
        detail: '出荷と同じ間隔で、数日分の原料を運んでいます。',
      },
      direct_input: {
        label: '近所の生産者へ原料を買付中',
        detail: '市場を経由せず、近い生産者から直接持ち帰ります。',
      },
      culture_restocks: {
        label: '暮らしの品をまとめて補充中',
        detail: '日々の小口買いを避け、必要な品をまとめて運んでいます。',
      },
      work_return: {
        label: '仕事帰りに市場へ立ち寄り中',
        detail: '働きに出た一便で、売買もまとめて済ませています。',
      },
    }[reason] ?? {
      label: '市場へ往復中',
      detail: '売り荷と買い荷を同じ一便で運んでいます。',
    };
    return { kind: 'travelling', ...copy };
  }
  if (!Number.isSafeInteger(household.marketBatchWaitSinceDay)) return null;
  const productionDays = Math.max(
    1,
    (economy.currentDay ?? 1) - household.marketBatchWaitSinceDay + 1,
  );
  return {
    kind: 'batching',
    label: `出荷をまとめ中 ${Math.min(P.MARKET_BATCH_DAYS, productionDays)}/${P.MARKET_BATCH_DAYS}日`,
    detail: '2日分がまとまると市場へ運びます。食料切れと生産停止は待ちません。',
  };
}

function householdStateSignals(household, economy) {
  const hungerDays = household?.hungerRun ?? 0;
  const insolvencyMonths = household?.insolvM ?? 0;
  const level = household?.lv ?? 0;
  const downDays = household?.down ?? 0;
  const upDays = household?.up ?? 0;
  const requiredDays = P.UP_DAYS * (level + 1);
  const culture = household ? cultureProgress(household) : null;
  const delivery = household ? foodDeliveryStatus(household, economy) : null;
  const foodDays = household ? rawHouseholdFoodDays(household) : Infinity;
  const crises = [
    hungerDays >= 30 ? {
      kind: 'hunger',
      severity: hungerDays >= 50 ? 'critical' : 'warning',
      label: hungerDays >= 50 ? '飢え・危険' : '食料不足',
    } : null,
    insolvencyMonths >= 3 ? {
      kind: 'dispersal',
      severity: insolvencyMonths >= 5 ? 'critical' : 'warning',
      label: insolvencyMonths >= 5 ? '離散間際' : '暮らしが苦しい',
    } : null,
    level > 0 && downDays >= P.DOWN_DAYS * 0.55 ? {
      kind: 'demotion',
      // 降格間際は重要だが死亡・離散ではない。点滅させず静的な警告に留める。
      severity: 'warning',
      label: downDays >= P.DOWN_DAYS * 0.84 ? '段階低下間際' : '暮らしが後退',
      goods: culture?.missingGoodsForCurrent ?? [],
    } : null,
    foodDays < 0.5 && !['arriving', 'building'].includes(household?.state)
      && delivery?.kind !== 'returning' ? {
        kind: 'delivery',
        severity: 'warning',
        label: foodDeliveryAlertLabel(delivery),
        goods: delivery?.goods?.slice(0, 2) ?? ['wheat'],
    } : null,
  ].filter(Boolean);
  const crisis = crises.sort((left, right) => (
    Number(right.severity === 'critical') - Number(left.severity === 'critical')
  ))[0] ?? null;
  const trend = level > 0 && downDays >= P.DOWN_DAYS * 0.25
    ? 'down'
    : requiredDays > 0 && upDays >= requiredDays * 0.45 ? 'up' : 'steady';
  return { crisis, trend, level, delivery };
}

function stockManifest(
  buildings, households, stalls, marketBuilding, companyStock = {}, companyStockCost = {},
) {
  const rows = [];
  for (const building of buildings) {
    for (const shelf of building.shelves) {
      if (shelf.amount <= 1e-9) continue;
      rows.push({
        source: 'building', sourceId: building.id,
        sourceLabel: `${JOB_LABELS[building.type] ?? building.type} #${building.id}・${SECTION_LABELS[shelf.section] ?? shelf.section}`,
        x: building.x, y: building.y,
        section: shelf.section, goods: shelf.goods, amount: shelf.amount,
      });
    }
  }
  for (const household of households) {
    for (const pantry of household.pantry) {
      if (pantry.amount <= 1e-9) continue;
      const family = household.familyName ? `${household.familyName}家` : `世帯#${household.id}`;
      rows.push({
        source: 'pantry', sourceId: household.id,
        sourceLabel: `${family} #${household.id}（${JOB_LABELS[household.job] ?? household.job}）`,
        x: household.homeX, y: household.homeY,
        section: 'pantry', goods: pantry.goods, amount: pantry.amount,
      });
    }
  }
  const householdById = new Map(households.map(household => [household.id, household]));
  for (const stall of stalls) {
    if (stall.qty <= 1e-9) continue;
    const household = householdById.get(stall.householdId);
    const family = household?.familyName ? `${household.familyName}家` : `世帯#${stall.householdId}`;
    rows.push({
      source: 'stall', sourceId: stall.householdId,
      sourceLabel: `市場の${family} #${stall.householdId}屋台`,
      x: marketBuilding?.x ?? 0, y: marketBuilding?.y ?? 0,
      section: 'stall', goods: stall.goods, amount: stall.qty,
    });
  }
  const warehouse = buildings.find(building => building.roles?.includes('warehouse'));
  if (warehouse) {
    for (const [goods, amount] of Object.entries(companyStock)) {
      if (amount <= 1e-9) continue;
      rows.push({
        source: 'company', sourceId: warehouse.id,
        sourceLabel: `会社の倉庫 #${warehouse.id}・保管`,
        x: warehouse.x, y: warehouse.y,
        section: 'companyStock', goods, amount,
        averageCost: (companyStockCost[goods] ?? 0) / amount,
      });
    }
  }
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.goods)) grouped.set(row.goods, []);
    grouped.get(row.goods).push(row);
  }
  const goods = [...grouped.entries()].map(([goodsId, locations]) => ({
    goods: goodsId,
    totalAmount: locations.reduce((total, location) => total + location.amount, 0),
    locations,
  })).sort((left, right) => right.totalAmount - left.totalAmount || left.goods.localeCompare(right.goods));
  return { rows, goods };
}

function buildingEndpoint(buildingById, endpoint) {
  const building = buildingById.get(endpoint?.buildingId);
  if (!building) return endpoint ? { ...endpoint, label: endpoint.buildingId } : null;
  const section = endpoint.section ? ` / ${SECTION_LABELS[endpoint.section] ?? endpoint.section}` : '';
  return {
    ...endpoint,
    type: building.type,
    x: building.entrance?.x ?? building.x + building.width / 2,
    y: building.entrance?.y ?? building.y + building.height / 2,
    label: `${JOB_LABELS[building.type] ?? building.type}${section}`,
  };
}

function positionAlongPath(path, progress) {
  if (!path?.length) return { x: 0, y: 0 };
  if (progress <= 0) return { ...path[0] };
  if (progress >= 1) return { ...path.at(-1) };
  const segments = path.slice(1).map((point, index) => ({
    from: path[index],
    to: point,
    length: Math.hypot(point.x - path[index].x, point.y - path[index].y),
  }));
  const total = segments.reduce((sum, segment) => sum + segment.length, 0);
  let remaining = progress * total;
  for (const segment of segments) {
    if (remaining >= segment.length) {
      remaining -= segment.length;
      continue;
    }
    const ratio = segment.length <= 1e-9 ? 1 : remaining / segment.length;
    return {
      x: segment.from.x + (segment.to.x - segment.from.x) * ratio,
      y: segment.from.y + (segment.to.y - segment.from.y) * ratio,
    };
  }
  return { ...path.at(-1) };
}

function progressAlongPath(path, position) {
  if (!path?.length || path.length === 1 || !position) return 0;
  const segments = path.slice(1).map((point, index) => {
    const from = path[index];
    const dx = point.x - from.x;
    const dy = point.y - from.y;
    return { from, to: point, dx, dy, length: Math.hypot(dx, dy) };
  });
  const total = segments.reduce((sum, segment) => sum + segment.length, 0);
  if (total <= 1e-9) return 0;
  let traversed = 0;
  let best = { distance: Infinity, progress: 0 };
  for (const segment of segments) {
    const lengthSquared = segment.length * segment.length;
    const projection = lengthSquared <= 1e-9 ? 0 : Math.max(0, Math.min(
      1,
      ((position.x - segment.from.x) * segment.dx
        + (position.y - segment.from.y) * segment.dy) / lengthSquared,
    ));
    const x = segment.from.x + segment.dx * projection;
    const y = segment.from.y + segment.dy * projection;
    const distance = (position.x - x) ** 2 + (position.y - y) ** 2;
    if (distance < best.distance) {
      best = {
        distance,
        progress: (traversed + segment.length * projection) / total,
      };
    }
    traversed += segment.length;
  }
  return best.progress;
}

function pathDirection(path, progress) {
  if (!path?.length || path.length === 1) return { x: 1, y: 0 };
  const segments = path.slice(1).map((point, index) => ({
    from: path[index],
    to: point,
    length: Math.hypot(point.x - path[index].x, point.y - path[index].y),
  }));
  const total = segments.reduce((sum, segment) => sum + segment.length, 0);
  let remaining = Math.max(0, Math.min(1, progress)) * total;
  for (const segment of segments) {
    if (remaining > segment.length && segment !== segments.at(-1)) {
      remaining -= segment.length;
      continue;
    }
    const length = Math.max(1e-9, segment.length);
    return {
      x: (segment.to.x - segment.from.x) / length,
      y: (segment.to.y - segment.from.y) / length,
    };
  }
  return { x: 1, y: 0 };
}

export function walkingVisualPosition({
  id, seed = 0, path, position, progress = null,
}) {
  const profile = walkingVisualProfile(id, seed);
  if (!path?.length || path.length < 2) {
    return {
      x: position?.x ?? path?.[0]?.x ?? 0,
      y: position?.y ?? path?.[0]?.y ?? 0,
      engineProgress: 0,
      visualProgress: 0,
      ...profile,
    };
  }
  const engineProgress = Math.max(0, Math.min(
    1,
    Number.isFinite(progress) ? progress : progressAlongPath(path, position),
  ));
  const visualProgress = engineProgress <= 0 || engineProgress >= 1
    ? engineProgress
    : engineProgress ** (1 / profile.pace);
  const point = positionAlongPath(path, visualProgress);
  const direction = pathDirection(path, visualProgress);
  const lane = profile.lane * Math.sin(Math.PI * engineProgress);
  return {
    x: point.x - direction.y * lane,
    y: point.y + direction.x * lane,
    engineProgress,
    visualProgress,
    ...profile,
  };
}

function carrierRows(snapshot, buildings) {
  const buildingById = new Map(buildings.map(building => [building.id, building]));
  const marketNames = new Map(
    (snapshot.economy.marketNetwork?.markets ?? []).map(market => [market.id, market.name]),
  );
  const marketBuilding = buildings.find(building => building.type === 'market');
  const marketEndpoint = marketBuilding
    ? {
      label: '市場',
      x: marketBuilding.entrance?.x ?? marketBuilding.x + marketBuilding.width / 2,
      y: marketBuilding.entrance?.y ?? marketBuilding.y + marketBuilding.height / 2,
    }
    : { label: '市場', x: snapshot.economy.market.x, y: snapshot.economy.market.y };
  let companyCrewUsed = 0;
  const hauls = snapshot.physical.haulJobs
    .filter(job => job.status !== 'completed' && job.carrier?.position)
    .flatMap(job => {
      const from = buildingEndpoint(buildingById, job.from);
      const to = buildingEndpoint(buildingById, job.to);
      const companyWalk = job.carrier.companyTransport && job.carrier.mode === 'walk';
      const sourcePorters = job.carrier.porters?.length
        ? job.carrier.porters
        : companyWalk
          ? [{
            id: `${job.id}:person1`,
            mode: 'walk',
            people: 1,
            departureDelay: 0,
            cargo: { goods: job.goods, qty: job.qty },
          }]
          : null;
      if (sourcePorters?.length) {
        const visibleCount = companyWalk
          ? Math.min(sourcePorters.length, COMPANY_VISIBLE_PORTER_LIMIT - companyCrewUsed)
          : sourcePorters.length;
        const visiblePorters = sourcePorters.slice(0, visibleCount);
        const firstCrewSlot = companyCrewUsed;
        if (companyWalk) companyCrewUsed += visibleCount;
        const rows = visiblePorters.map((porter, index) => {
          const progress = Math.max(0, Math.min(
            1,
            ((job.carrier.batchElapsed ?? 0) - porter.departureDelay)
              / Math.max(1e-9, job.carrier.batchTravelCost ?? job.carrier.routeCost ?? 1),
          ));
          const crewSlot = firstCrewSlot + index + 1;
          const id = companyWalk ? `company-porter:${crewSlot}` : `haul:${job.id}:${porter.id ?? index}`;
          const position = walkingVisualPosition({
            id,
            seed: snapshot.seed,
            path: porter.path ?? job.carrier.path ?? [],
            position: porter.position ?? job.carrier.position,
            progress: job.carrier.porters?.length ? progress : null,
          });
          return {
            id,
            haulJobId: job.id,
            porterId: porter.id ?? `${job.id}:${index}`,
            companyCrewSlot: companyWalk ? crewSlot : null,
            kind: 'walker',
            mode: 'walk',
            cartKind: null,
            assetId: null,
            x: position.x,
            y: position.y,
            visualPace: position.pace,
            laneOffset: position.lane,
            visualProgress: position.visualProgress,
            goods: job.goods,
            amount: porter.cargo?.qty ?? 0,
            cargoRows: [{ goods: job.goods, amount: porter.cargo?.qty ?? 0 }],
            people: 1,
            members: 1,
            peopleRows: [{
              id: companyWalk ? `company-person${crewSlot}` : porter.id ?? `${job.id}:${index}`,
              name: companyWalk ? `会社人足${crewSlot}` : '運び手',
            }],
            departureDelay: porter.departureDelay ?? 0,
            path: (porter.path ?? job.carrier.path ?? []).map(point => ({ ...point })),
            from,
            to,
          };
        });
        const queuedPorters = sourcePorters.slice(visibleCount);
        if (queuedPorters.length) {
          rows.push({
            id: `company-queue:${job.id}`,
            haulJobId: job.id,
            kind: 'porter_queue',
            mode: 'wait',
            x: from?.x ?? job.carrier.path?.[0]?.x ?? job.carrier.position.x,
            y: from?.y ?? job.carrier.path?.[0]?.y ?? job.carrier.position.y,
            goods: job.goods,
            amount: queuedPorters.reduce((total, porter) => total + (porter.cargo?.qty ?? 0), 0),
            cargoRows: [],
            people: 0,
            members: 0,
            peopleRows: [],
            queuedPeople: queuedPorters.length,
            selectable: false,
            path: [],
            from,
            to,
          });
        }
        return rows;
      }
      const position = job.carrier.mode === 'walk'
        ? walkingVisualPosition({
          id: `haul:${job.id}`,
          seed: snapshot.seed,
          path: job.carrier.path ?? [],
          position: job.carrier.position,
        })
        : { ...job.carrier.position, pace: 1, lane: 0, visualProgress: 0 };
      return [{
        id: `haul:${job.id}`,
        haulJobId: job.id,
        kind: job.carrier.mode === 'cart' ? 'cart' : 'walker',
        mode: job.carrier.mode,
        cartKind: job.carrier.cartKind ?? null,
        assetId: job.carrier.assetId ?? null,
        x: position.x,
        y: position.y,
        visualPace: position.pace,
        laneOffset: position.lane,
        visualProgress: position.visualProgress,
        goods: job.goods,
        amount: job.qty,
        cargoRows: [{ goods: job.goods, amount: job.qty }],
        people: job.carrier.people ?? 1,
        path: (job.carrier.path ?? []).map(point => ({ ...point })),
        from,
        to,
      }];
    });
  const households = snapshot.economy.households.flatMap(household => {
    const homeBuilding = buildingById.get(household.buildingId);
    const home = {
      label: `${JOB_LABELS[household.job] ?? household.job}の家`,
      x: household.x,
      y: household.y,
    };
    const work = Number.isFinite(household.wx) && Number.isFinite(household.wy)
      ? { label: '仕事場', x: household.wx, y: household.wy }
      : home;
    const supplierHousehold = household.marketCarrier?.directOffer
      ? snapshot.economy.households.find(
        row => row.id === household.marketCarrier.directOffer.sellerId,
      )
      : null;
    const supplierBuilding = supplierHousehold
      ? buildingById.get(supplierHousehold.buildingId)
      : null;
    const tradeEndpoint = supplierBuilding ? {
      label: `${JOB_LABELS[supplierHousehold.job] ?? supplierHousehold.job}の家`,
      x: supplierBuilding.entrance?.x ?? supplierHousehold.x,
      y: supplierBuilding.entrance?.y ?? supplierHousehold.y,
    } : marketEndpoint;
    const from = household.state === 'toHome'
      ? (household.marketCarrier ? tradeEndpoint : work)
      : home;
    const to = ['toMarket', 'atMarket'].includes(household.state)
      ? marketEndpoint
      : ['toSupplier', 'atSupplier'].includes(household.state)
        ? tradeEndpoint
      : household.state === 'toWork' ? work : home;
    const workingAtYard = household.state === 'home'
      && (household.productionMultiplier ?? 0) > 0
      && homeBuilding;
    const porters = household.marketCarrier?.porters ?? [];
    if (porters.length) {
      const travellingIds = new Set(porters.map(porter => porter.memberId));
      const travelling = porters.map((porter, index) => {
        const cargoRows = Object.entries(porter.cargo?.manifest ?? {})
          .filter(([, qty]) => qty > 1e-9);
        const member = (household.members ?? []).find(row => row.id === porter.memberId)
          ?? household.members?.[index]
          ?? null;
        const personId = porter.memberId ?? `${household.id}:${index}`;
        const visualPosition = walkingVisualPosition({
          id: `person:${personId}`,
          seed: snapshot.seed,
          path: porter.path ?? [],
          position: porter.position ?? { x: household.px ?? household.x, y: household.py ?? household.y },
        });
        return {
          id: `person:${personId}`,
          householdId: household.id,
          personId,
          personName: porter.memberName ?? member?.name ?? `住民${index + 1}`,
          kind: porter.mode === 'cart' ? 'cart'
            : porter.visualMode === 'backpack' ? 'backpack' : 'walker',
          mode: porter.mode,
          transportTier: porter.tier ?? porter.visualMode ?? 'hand',
          cartKind: porter.cartKind ?? null,
          assetId: porter.assetId ?? null,
          x: visualPosition.x,
          y: visualPosition.y,
          visualPace: visualPosition.pace,
          laneOffset: visualPosition.lane,
          visualProgress: visualPosition.visualProgress,
          state: household.state,
          job: household.job,
          members: 1,
          peopleRows: [{
            id: porter.memberId ?? `${household.id}:${index}`,
            name: porter.memberName ?? member?.name ?? `住民${index + 1}`,
          }],
          activity: ['atMarket', 'atSupplier'].includes(household.state)
            ? 'shopping' : 'carrying',
          productionMultiplier: Math.max(
            0,
            (household.productionMultiplier ?? 0)
              - ((household.members?.length ?? 0) - porters.length)
                / Math.max(1, household.members?.length ?? 1),
          ) / Math.max(1, porters.length),
          goods: cargoRows[0]?.[0] ?? null,
          amount: cargoRows.reduce((total, [, qty]) => total + qty, 0),
          cargoRows: cargoRows.map(([goods, amount]) => ({ goods, amount })),
          path: (porter.path ?? []).map(point => ({ ...point })),
          departureDelay: porter.departureDelay ?? 0,
          from,
          to,
        };
      });
      const stayed = (household.members ?? [])
        .filter(member => !travellingIds.has(member.id))
        .map((member, index) => ({
          id: `person:${member?.id ?? `${household.id}:home:${index}`}`,
          householdId: household.id,
          personId: member?.id ?? `${household.id}:home:${index}`,
          personName: member?.name ?? `住民${index + 1}`,
          kind: 'household',
          mode: 'walk',
          cartKind: null,
          assetId: null,
          x: homeBuilding
            ? homeBuilding.x + homeBuilding.width * 0.55 + (index % 3) * 0.22
            : household.x + (index % 3) * 0.12,
          y: homeBuilding
            ? homeBuilding.y + homeBuilding.height * 0.58 + Math.floor(index / 3) * 0.18
            : household.y + Math.floor(index / 3) * 0.12,
          state: 'home',
          job: household.job,
          members: 1,
          peopleRows: [{ id: member?.id, name: member?.name ?? `住民${index + 1}` }],
          activity: 'working',
          productionMultiplier: 1 / Math.max(1, household.members?.length ?? 1),
          goods: null,
          amount: 0,
          cargoRows: [],
          path: [],
          from: home,
          to: home,
        }));
      return [...travelling, ...stayed];
    }
    if (household.workCarrier) {
      const porter = household.workCarrier;
      const worker = (household.members ?? []).find(member => member.id === porter.memberId)
        ?? household.members?.[0]
        ?? null;
      const travellingId = porter.memberId ?? worker?.id ?? `${household.id}:worker`;
      const visualPosition = walkingVisualPosition({
        id: `person:${travellingId}`,
        seed: snapshot.seed,
        path: porter.path ?? [],
        position: porter.position ?? { x: household.px ?? household.x, y: household.py ?? household.y },
      });
      const workerRow = {
        id: `person:${travellingId}`,
        householdId: household.id,
        personId: travellingId,
        personName: porter.memberName ?? worker?.name ?? '住民',
        kind: 'walker',
        mode: 'walk',
        transportTier: 'worker',
        cartKind: null,
        assetId: null,
        x: visualPosition.x,
        y: visualPosition.y,
        visualPace: visualPosition.pace,
        laneOffset: visualPosition.lane,
        visualProgress: visualPosition.visualProgress,
        state: household.state,
        job: household.job,
        members: 1,
        peopleRows: [{ id: travellingId, name: porter.memberName ?? worker?.name ?? '住民' }],
        activity: 'working-away',
        productionMultiplier: 0,
        goods: null,
        amount: 0,
        cargoRows: [],
        path: (porter.path ?? []).map(point => ({ ...point })),
        from: home,
        to: work,
      };
      const stayed = (household.members ?? [])
        .filter(member => member.id !== travellingId)
        .map((member, index) => ({
          id: `person:${member.id ?? `${household.id}:home:${index}`}`,
          householdId: household.id,
          personId: member.id ?? `${household.id}:home:${index}`,
          personName: member.name ?? `住民${index + 1}`,
          kind: 'household',
          mode: 'walk',
          transportTier: 'worker',
          cartKind: null,
          assetId: null,
          x: homeBuilding
            ? homeBuilding.x + homeBuilding.width * 0.55 + (index % 3) * 0.22
            : household.x + (index % 3) * 0.12,
          y: homeBuilding
            ? homeBuilding.y + homeBuilding.height * 0.58 + Math.floor(index / 3) * 0.18
            : household.y + Math.floor(index / 3) * 0.12,
          state: 'home',
          job: household.job,
          members: 1,
          peopleRows: [{ id: member.id, name: member.name ?? `住民${index + 1}` }],
          activity: 'working',
          productionMultiplier: 1 / Math.max(1, household.members?.length ?? 1),
          goods: null,
          amount: 0,
          cargoRows: [],
          path: [],
          from: home,
          to: home,
        }));
      return [workerRow, ...stayed];
    }
    const resourceWork = household.productionSummary?.resourceWork ?? household.resourceWork;
    if (
      household.state === 'home'
      && Number.isFinite(resourceWork?.oneWayTicks)
      && resourceWork.path?.length > 1
      && household.members?.length
    ) {
      const member = household.members[0];
      const personId = member.id ?? `${household.id}:resource`;
      const oneWay = Math.max(0.5, resourceWork.oneWayTicks);
      const workTicks = Math.max(3, resourceWork.workTicks ?? 3);
      const schedule = oneWay * 2 + workTicks;
      const phase = (snapshot.tick % 30) / 30 * schedule;
      const outbound = phase < oneWay;
      const returning = phase >= oneWay + workTicks;
      const path = returning ? [...resourceWork.path].reverse() : resourceWork.path;
      const progress = outbound
        ? phase / oneWay
        : returning ? (phase - oneWay - workTicks) / oneWay : 1;
      const visualPosition = walkingVisualPosition({
        id: `person:${personId}`,
        seed: snapshot.seed,
        path,
        position: resourceWork.target,
        progress,
      });
      const resource = {
        label: household.job === 'logger' ? '伐採する森' : '漁場',
        x: resourceWork.target.x,
        y: resourceWork.target.y,
      };
      const worker = {
        id: `person:${personId}`,
        householdId: household.id,
        personId,
        personName: member.name ?? '住民',
        kind: 'walker',
        mode: 'walk',
        transportTier: 'worker',
        cartKind: null,
        assetId: null,
        x: visualPosition.x,
        y: visualPosition.y,
        visualPace: visualPosition.pace,
        laneOffset: visualPosition.lane,
        visualProgress: visualPosition.visualProgress,
        state: outbound ? 'toResource' : returning ? 'fromResource' : 'atResource',
        job: household.job,
        members: 1,
        peopleRows: [{ id: personId, name: member.name ?? '住民' }],
        activity: 'working-away',
        productionMultiplier: (resourceWork.efficiency ?? 1)
          / Math.max(1, household.members.length),
        goods: null,
        amount: 0,
        cargoRows: [],
        path: path.map(point => ({ ...point })),
        from: returning ? resource : home,
        to: returning ? home : resource,
      };
      const stayed = household.members.slice(1).map((stayedMember, index) => ({
        id: `person:${stayedMember.id ?? `${household.id}:home:${index}`}`,
        householdId: household.id,
        personId: stayedMember.id ?? `${household.id}:home:${index}`,
        personName: stayedMember.name ?? `住民${index + 2}`,
        kind: 'household',
        mode: 'walk',
        transportTier: 'worker',
        cartKind: null,
        assetId: null,
        x: homeBuilding
          ? homeBuilding.x + homeBuilding.width * 0.55 + (index % 3) * 0.22
          : household.x + (index % 3) * 0.12,
        y: homeBuilding
          ? homeBuilding.y + homeBuilding.height * 0.58 + Math.floor(index / 3) * 0.18
          : household.y + Math.floor(index / 3) * 0.12,
        state: 'home',
        job: household.job,
        members: 1,
        peopleRows: [{ id: stayedMember.id, name: stayedMember.name ?? `住民${index + 2}` }],
        activity: 'working',
        productionMultiplier: (resourceWork.efficiency ?? 1)
          / Math.max(1, household.members.length),
        goods: null,
        amount: 0,
        cargoRows: [],
        path: [],
        from: home,
        to: home,
      }));
      return [worker, ...stayed];
    }
    return (household.members ?? []).map((member, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const yardX = workingAtYard
        ? homeBuilding.x + homeBuilding.width * 0.56 + column * 0.22
        : household.px ?? household.x;
      const yardY = workingAtYard
        ? homeBuilding.y + homeBuilding.height * 0.56 + row * 0.18
        : household.py ?? household.y;
      const offset = workingAtYard ? 0 : index * 0.075;
      return {
        id: `person:${member?.id ?? `${household.id}:${index}`}`,
        householdId: household.id,
        personId: member?.id ?? `${household.id}:${index}`,
        personName: member?.name ?? `住民${index + 1}`,
        kind: 'household',
        mode: 'walk',
        transportTier: 'worker',
        cartKind: null,
        assetId: null,
        x: yardX - offset,
        y: yardY + offset,
        state: household.state,
        job: household.job,
        members: 1,
        peopleRows: [{
          id: member?.id ?? `${household.id}:${index}`,
          name: member?.name ?? `住民${index + 1}`,
        }],
        activity: workingAtYard ? 'working' : household.state,
        productionMultiplier: (household.productionMultiplier ?? 0)
          / Math.max(1, household.members?.length ?? 1),
        goods: null,
        amount: 0,
        cargoRows: [],
        path: [],
        from,
        to,
      };
    });
  });
  const idleHouseholdCarts = snapshot.economy.households
    .filter(household => household.cart && household.marketCarrier?.mode !== 'cart')
    .map(household => ({
      id: `asset:household-cart:${household.cart.id}`,
      kind: 'cart',
      mode: 'cart',
      cartKind: household.cart.kind,
      assetId: household.cart.id,
      x: household.x + 0.35,
      y: household.y + 0.2,
      goods: null,
      amount: 0,
      members: 0,
      idle: true,
      durability: household.cart.durability,
      maxDurability: household.cart.maxDurability,
    }));
  const warehouse = buildings.find(building => building.roles.includes('warehouse'));
  const idleCompanyCarts = (snapshot.economy.companyCarts ?? [])
    .filter(cart => !cart.busyJobId)
    .map((cart, index) => ({
      id: `asset:company-cart:${cart.id}`,
      kind: 'cart',
      mode: 'cart',
      cartKind: cart.kind,
      assetId: cart.id,
      x: (warehouse?.entrance?.x ?? snapshot.economy.market.x) + 0.25 + index * 0.18,
      y: (warehouse?.entrance?.y ?? snapshot.economy.market.y) - 0.15 + index * 0.12,
      goods: null,
      amount: 0,
      members: 0,
      idle: true,
      durability: cart.durability,
      maxDurability: cart.maxDurability,
    }));
  const caravanCarriers = (snapshot.economy.caravans ?? []).flatMap(route => (
    (route.carriers ?? [])
      .filter(carrier => carrier.active && carrier.position)
      .map(carrier => {
        const cargoRows = Object.entries(carrier.manifest ?? {})
          .filter(([, amount]) => amount > 1e-9)
          .map(([goods, amount]) => ({ goods, amount }));
        const outbound = route.state === 'outbound';
        const start = carrier.path?.[0] ?? carrier.position;
        const end = carrier.path?.at(-1) ?? carrier.position;
        return {
          id: `caravan:${route.id}:${carrier.id}`,
          caravanRouteId: route.id,
          kind: 'cart',
          mode: 'cart',
          cartKind: carrier.cartKind ?? 'wood',
          assetId: carrier.assetId ?? null,
          x: carrier.position.x,
          y: carrier.position.y,
          goods: cargoRows[0]?.goods ?? null,
          amount: cargoRows.reduce((total, row) => total + row.amount, 0),
          householdId: carrier.householdId ?? null,
          cargoRows,
          people: 1,
          members: 1,
          peopleRows: [{
            id: carrier.memberId ?? `${route.id}:driver:${carrier.assetId}`,
            name: carrier.memberName ?? '御者',
          }],
          activity: 'carrying',
          path: (carrier.path ?? []).map(point => ({ ...point })),
          from: {
            label: outbound
              ? marketNames.get(route.baseMarketId) ?? route.baseMarketId
              : marketNames.get(route.destMarketId) ?? route.destMarketId,
            x: start.x,
            y: start.y,
          },
          to: {
            label: outbound
              ? marketNames.get(route.destMarketId) ?? route.destMarketId
              : marketNames.get(route.baseMarketId) ?? route.baseMarketId,
            x: end.x,
            y: end.y,
          },
        };
      })
  ));
  return [
    ...hauls,
    ...caravanCarriers,
    ...households,
    ...idleHouseholdCarts,
    ...idleCompanyCarts,
  ];
}

function portBerth(building, terrain, width, height) {
  const candidates = [
    { side: 'north', dx: 0, dy: -1, x: building.x + building.width / 2, y: building.y - 0.7 },
    { side: 'south', dx: 0, dy: 1, x: building.x + building.width / 2, y: building.y + building.height + 0.7 },
    { side: 'west', dx: -1, dy: 0, x: building.x - 0.7, y: building.y + building.height / 2 },
    { side: 'east', dx: 1, dy: 0, x: building.x + building.width + 0.7, y: building.y + building.height / 2 },
  ];
  const waterScore = candidate => {
    let score = 0;
    for (let offset = -1; offset <= 1; offset += 1) {
      for (let distance = 1; distance <= 3; distance += 1) {
        const edgeX = candidate.dx === 0
          ? Math.floor(building.x + building.width / 2 + offset)
          : Math.floor(candidate.x + candidate.dx * distance);
        const edgeY = candidate.dy === 0
          ? Math.floor(building.y + building.height / 2 + offset)
          : Math.floor(candidate.y + candidate.dy * distance);
        if (edgeX >= 0 && edgeX < width && edgeY >= 0 && edgeY < height
          && terrain[edgeY]?.[edgeX]?.kind === 'water') score += 1;
      }
    }
    return score;
  };
  const selected = candidates
    .map(candidate => ({ ...candidate, score: waterScore(candidate) }))
    .sort((left, right) => right.score - left.score)[0];
  return {
    side: selected.side,
    dock: { x: selected.x, y: selected.y },
    away: { x: selected.x + selected.dx * 4, y: selected.y + selected.dy * 4 },
  };
}

function aggregateProductivity(rows) {
  const observed = rows.filter(row => row.productivity?.days > 0 && row.productivity.ideal > 1e-9);
  const actual = observed.reduce((total, row) => total + row.productivity.actual, 0);
  const ideal = observed.reduce((total, row) => total + row.productivity.ideal, 0);
  return {
    buildings: observed.length,
    actual,
    ideal,
    efficiency: ideal > 1e-9 ? actual / ideal : null,
  };
}

function productivityOverview({ snapshot, buildings, households }) {
  const market = buildings.find(building => building.roles?.includes('market'));
  const marketRows = market?.entrance
    ? households.filter(household => (
      Number.isFinite(household.marketOneWayTicks) && household.marketOneWayTicks <= 14
    ))
    : [];
  const dayFloor = Math.max(0, snapshot.day - 29);
  const recentDirectTrades = (snapshot.economy.directTrades ?? [])
    .filter(row => row.day >= dayFloor && row.qty > 1e-9)
    .map(row => ({ ...row }));
  const summarizeDirectTrades = rows => ({
    trades: rows.length,
    quantity: rows.reduce((total, row) => total + row.qty, 0),
    savedTicks: rows.reduce((total, row) => total + row.savedTicks, 0),
    rows,
  });
  const directSummary = summarizeDirectTrades(recentDirectTrades);
  const island = aggregateProductivity(households);
  island.resourceDistanceLoss = households.reduce((total, household) => {
    const productivity = household.productivity;
    const spatial = productivity?.resourceWork?.efficiency;
    return total + (
      Number.isFinite(spatial) && productivity.ideal > 0
        ? productivity.ideal * Math.max(0, 1 - spatial)
        : 0
    );
  }, 0);
  island.directTrade = directSummary;
  const neighborhood = {
    ...aggregateProductivity(marketRows),
    totalBuildings: households.filter(row => row.productivity?.ideal > 1e-9).length,
    directTrade: summarizeDirectTrades(recentDirectTrades.filter(row => (
      marketRows.some(household => household.id === row.buyerHouseholdId)
    ))),
    radiusTicks: 14,
  };
  return { island, neighborhood };
}

export function snapshotToViewModel(snapshot, { previousModel = null } = {}) {
  if (!snapshot?.physical || !snapshot?.economy) {
    throw new TypeError('full engine snapshot is required');
  }
  const terrainRevision = snapshot.physical.travelRevision ?? null;
  const roadRevision = snapshot.physical.roadRevision ?? null;
  const previousRevisions = previousModel
    ? MODEL_TOPOLOGY_REVISIONS.get(previousModel) ?? null
    : null;
  const canReuseTerrain = previousModel
    && terrainRevision !== null
    && previousRevisions?.terrainRevision === terrainRevision
    && previousModel.width === snapshot.physical.width
    && previousModel.height === snapshot.physical.height;
  const canReuseRoadTopology = canReuseTerrain
    && roadRevision !== null
    && previousRevisions?.roadRevision === roadRevision;
  if (!canReuseTerrain && !Array.isArray(snapshot.physical.terrain)) {
    throw new TypeError('terrain is required when its revision cannot be reused');
  }
  const terrain = canReuseTerrain
    ? previousModel.terrain
    : snapshot.physical.terrain.map(row => row.map(tile => ({ ...tile })));
  const householdById = new Map(snapshot.economy.households.map(household => [household.id, household]));
  const buildings = snapshot.physical.buildings.map(building => {
    const shelves = shelfRows(building);
    const owner = householdById.get(building.ownerHouseholdId);
    const roles = [...(building.roles ?? [])];
    const companyLogistics = roles.some(role => role === 'market' || role === 'warehouse');
    const companyStockShelves = roles.includes('warehouse')
      ? Object.entries(snapshot.economy.stock).flatMap(([goods, amount]) => amount > 1e-9 ? [{
        section: 'companyStock', goods, amount, capacity: null, visual: pileVisual(amount, goods),
      }] : [])
      : [];
    const row = {
      id: building.id,
      type: building.type,
      role: building.role,
      roles,
      x: building.x,
      y: building.y,
      width: building.w,
      height: building.h,
      entrance: building.entrance ? { ...building.entrance } : null,
      grade: building.grade ?? 0,
      condition: Number.isFinite(building.condition) ? building.condition : 100,
      conditionStatus: building.conditionStatus ?? 'good',
      repairPlan: building.repairPlan ? {
        openedDay: building.repairPlan.openedDay,
        dueDay: building.repairPlan.dueDay,
        required: { ...(building.repairPlan.required ?? {}) },
      } : null,
      constructionRequired: { ...(building.constructionRequired ?? {}) },
      constructionConsumed: Boolean(building.constructionConsumed),
      caravanEmployment: building.type === 'carter' ? {
        recruitment: building.caravanEmployment?.recruitment ?? 1,
        wage: building.caravanEmployment?.wage ?? 1,
      } : null,
      caravanCrew: building.type === 'carter' && owner
        ? Math.min(building.caravanEmployment?.recruitment ?? 1, owner.members.length)
        : 0,
      caravanRouteQuotes: caravanRouteQuotes(snapshot, terrain, building, owner),
      fixed: Boolean(building.fixed),
      ownerHouseholdId: building.ownerHouseholdId,
      occupied: building.ownerHouseholdId !== null,
      vacant: !building.fixed && !companyLogistics && building.ownerHouseholdId === null,
      cultureLeveled: !building.fixed && !companyLogistics,
      cultureLevel: owner?.lv ?? 0,
      stateSignals: householdStateSignals(owner, snapshot.economy),
      cartWork: owner?.cartWork ? { ...owner.cartWork } : null,
      cartStock: (owner?.cartStock ?? []).map(cart => ({ ...cart })),
      shelves,
      shelfGroups: groupedStock([...shelves, ...companyStockShelves]),
      shelfAmount: shelves.reduce((total, row) => total + row.amount, 0),
    };
    return { ...row, appearance: buildingAppearance(row) };
  });
  const households = snapshot.economy.households.map(household => {
    const pantry = pantryRows(household);
    const pantryGroups = groupedStock(pantry);
    const hungerHistory = [...(household.hungerHist ?? [])];
    const satisfaction = household.satLast ? { ...household.satLast } : null;
    const production = household.productionSummary ?? householdProductionSummary(
      snapshot.economy,
      household,
      { day: snapshot.day },
    );
    return {
      id: household.id,
      familyName: household.sur ?? '',
      memberNames: (household.members ?? []).map(member => member?.name ?? String(member)),
      job: household.job,
      x: household.px ?? household.x,
      y: household.py ?? household.y,
      homeX: household.x,
      homeY: household.y,
      members: household.members?.length ?? 0,
      cultureLevel: household.lv ?? 0,
      displayCultureLevel: displayCultureLevel(household.lv),
      cultureGrowth: cultureProgress(household),
      buildingId: household.buildingId,
      state: household.state,
      marketTripActive: Boolean(household.marketCarrier),
      marketTripTicks: household.marketTripTicks ?? 0,
      marketTripEfficiency: Math.max(0, (30 - (household.marketTripTicks ?? 0)) / 30),
      cart: household.cart ? { ...household.cart } : null,
      cartStock: (household.cartStock ?? []).map(cart => ({ ...cart })),
      cartWork: household.cartWork ? { ...household.cartWork } : null,
      workTool: household.workTool && household.workTool.durability > 1e-9
        ? { ...household.workTool }
        : { kind: 'bare', durability: 0, maxDurability: 0 },
      fishingRig: household.job === 'fisher' && household.fishingRig?.durability > 1e-9
        ? { ...household.fishingRig }
        : household.job === 'fisher'
          ? { kind: 'shore', durability: 0, maxDurability: 0 }
          : null,
      productionMultiplier: household.productionMultiplier ?? 1,
      productivity: {
        ...production,
        actualByGoods: { ...production.actualByGoods },
        idealByGoods: { ...production.idealByGoods },
        resourceWork: production.resourceWork ? {
          ...production.resourceWork,
          target: production.resourceWork.target ? { ...production.resourceWork.target } : null,
          path: (production.resourceWork.path ?? []).map(point => ({ ...point })),
        } : null,
        lastDirectTrade: production.lastDirectTrade ? { ...production.lastDirectTrade } : null,
      },
      tookMarketTripToday: Boolean(household.tookMarketTripToday),
      purse: Number.isFinite(household.purse) ? household.purse : null,
      recentIncome: Number.isFinite(household.incomeLog?.at(-1))
        ? household.incomeLog.at(-1) : (household.income30 ?? 0),
      satisfaction,
      satisfiedCount: satisfaction
        ? Object.values(satisfaction).filter(Boolean).length : null,
      satisfactionCount: satisfaction ? Object.keys(satisfaction).length : null,
      hungerDays: hungerHistory.reduce((total, hungry) => total + Number(Boolean(hungry)), 0),
      hungerWindow: hungerHistory.length,
      hungerRun: household.hungerRun ?? 0,
      insolvencyMonths: household.insolvM ?? 0,
      walkingDistance: household.walk ?? 0,
      marketOneWayTicks: household.marketOneWayTicks ?? null,
      marketTransactionTicks: household.marketTransactionTicks ?? 0,
      marketRhythm: marketRhythmStatus(household, snapshot.economy),
      foodDelivery: foodDeliveryStatus(household, snapshot.economy),
      pantry,
      pantryStock: pantryGroups[0] ?? null,
    };
  });
  const pantryByBuilding = new Map(households.map(household => [
    household.buildingId, household.pantry,
  ]));
  for (const building of buildings) {
    building.productivity = households.find(
      household => household.buildingId === building.id,
    )?.productivity ?? null;
    building.structure = buildingStructureLayout(building);
    building.yardStock = yardStockRows(building, pantryByBuilding.get(building.id) ?? []);
    building.yardPlaces = yardLayout(building, building.yardStock);
    building.yardSlots = Object.freeze(building.yardPlaces.filter(place => place.row));
  }
  const stalls = Object.entries(snapshot.economy.stalls).flatMap(([goods, rows]) => (
    rows.map(stall => ({
      goods,
      ...stall,
      visual: {
        ...pileVisual(stall.qty, goods),
        freshness: perishableFreshness(goods, stall.age),
      },
    }))
  ));
  const marketBuilding = buildings.find(building => building.type === 'market');
  const marketStallGroups = new Map();
  for (const stall of stalls.filter(row => row.visual.amount > 1e-9)) {
    if (!marketStallGroups.has(stall.householdId)) marketStallGroups.set(stall.householdId, []);
    marketStallGroups.get(stall.householdId).push(stall);
  }
  const marketStalls = [...marketStallGroups.entries()].map(([householdId, items], index) => ({
    id: `stall:${householdId}`,
    householdId,
    familyName: households.find(row => row.id === householdId)?.familyName ?? '',
    items,
    x: marketBuilding ? marketBuilding.x + 0.7 + (index % 4) * 1.05 : snapshot.economy.market.x,
    y: marketBuilding ? marketBuilding.y + 0.8 + (Math.floor(index / 4) % 4) * 1.0 : snapshot.economy.market.y,
    totalAmount: items.reduce((total, item) => total + item.visual.amount, 0),
  }));
  const manifest = stockManifest(
    buildings, households, stalls, marketBuilding,
    snapshot.economy.stock, snapshot.economy.stockCost,
  );
  const traffic = new Map(Object.entries(snapshot.economy.traffic ?? {}));
  for (const [key, value] of Object.entries(snapshot.physical.trails ?? {})) {
    if (value) traffic.set(key, Math.max(traffic.get(key) ?? 0, value === true ? 1 : value));
  }
  const trailRows = [...traffic.entries()]
    .map(([key, tread]) => ({ key, ...trailVisual(tread) }))
    .filter(row => row.stage > 0);
  const productivity = productivityOverview({ snapshot, buildings, households });
  if (marketBuilding) marketBuilding.marketProductivity = productivity.neighborhood;
  const portCalls = snapshot.physical.portCalls.map(call => {
    const port = snapshot.physical.buildings.find(building => building.id === call.portBuildingId);
    const section = call.direction === 'export' ? 'outbound' : 'inbound';
    return {
      ...call,
      metadata: { ...(call.metadata ?? {}) },
      yardSection: section,
      yardAmount: port?.inventory?.[section]?.[call.goods] ?? 0,
    };
  });
  const portBuilding = buildings.find(building => building.type === 'port');
  const marketLowest = Object.fromEntries(Object.entries(snapshot.economy.stalls).map(([goods, rows]) => [
    goods,
    rows.filter(row => row.qty > 1e-9).reduce((lowest, row) => Math.min(lowest, row.price), Infinity),
  ]));
  const companyStockAverageCosts = Object.fromEntries(Object.entries(snapshot.economy.stock).map(([goods, qty]) => [
    goods,
    qty > 1e-9 ? (snapshot.economy.stockCost[goods] ?? 0) / qty : null,
  ]));
  const companyMarketStockAverageCosts = Object.fromEntries(Object.entries(snapshot.economy.marketStock).map(([goods, qty]) => [
    goods,
    qty > 1e-9 ? (snapshot.economy.marketStockCost[goods] ?? 0) / qty : null,
  ]));
  const companyReleasePrices = Object.fromEntries(Object.entries(snapshot.economy.marketStock).map(([goods, qty]) => [
    goods,
    qty > 1e-9 ? companyStockReleasePrice(snapshot.economy, goods, { market: true }) : null,
  ]));
  const companyStockReleaseQuotes = Object.fromEntries(Object.entries(snapshot.economy.stock).map(([goods, qty]) => [
    goods,
    qty > 1e-9 ? companyStockReleasePrice(snapshot.economy, goods) : null,
  ]));
  const conversionEconomics = snapshot.economy.households.flatMap(household => {
    const definition = CONVERSION_JOBS[household.job];
    if (!definition) return [];
    const building = snapshot.physical.buildings.find(candidate => candidate.id === household.buildingId);
    const cost = productionCost(
      snapshot.economy,
      snapshot.physical,
      household,
      definition.goods,
      { day: snapshot.day },
    );
    return [{
      householdId: household.id,
      buildingId: household.buildingId,
      job: household.job,
      goods: definition.goods,
      inputGoods: definition.inputGoods,
      inputAmount: building?.inventory?.input?.[definition.inputGoods] ?? 0,
      outputAmount: building?.inventory?.output?.[definition.goods] ?? 0,
      inputPrice: snapshot.economy.px[definition.inputGoods] ?? 0,
      cost,
      marketPrice: snapshot.economy.px[definition.goods] ?? 0,
      productionEma: snapshot.economy.f30?.[definition.goods]?.prod ?? 0,
      consumptionEma: snapshot.economy.f30?.[definition.goods]?.cons ?? 0,
    }];
  });
  const base = {
    day: snapshot.day,
    tick: snapshot.tick,
    calendarOffsetDays: snapshot.calendarOffsetDays ?? 0,
    seed: snapshot.seed,
    companyMoney: snapshot.economy.company.money,
    productivity: productivity.island,
    marketProductivity: productivity.neighborhood,
    directTrades: productivity.island.directTrade.rows,
    companyBankruptcyDay: snapshot.economy.goDay ?? null,
    population: households.reduce((total, household) => total + household.members, 0),
    width: snapshot.physical.width,
    height: snapshot.physical.height,
    terrain,
    roadKeys: Object.keys(snapshot.physical.roads),
    pavedRoadKeys: Object.keys(snapshot.physical.pavedRoads ?? {}),
    trailRows,
    occupiedKeys: Object.keys(snapshot.physical.occupied),
    buildings,
    carriers: carrierRows(snapshot, buildings),
    households,
    stalls,
    marketStalls,
    stockLocations: manifest.rows,
    goodsManifest: manifest.goods,
    totalVisibleStock: buildings.reduce((total, building) => total + building.shelfAmount, 0)
      + households.reduce((total, household) => (
        total + household.pantry.reduce((sum, row) => sum + row.visual.amount, 0)
      ), 0)
      + stalls.reduce((total, stall) => total + stall.visual.amount, 0)
      + Object.values(snapshot.economy.stock).reduce((total, amount) => total + amount, 0),
    portCalls,
    portBerth: portBuilding
      ? portBerth(portBuilding, terrain, snapshot.physical.width, snapshot.physical.height)
      : null,
    economyMarket: { ...snapshot.economy.market },
    marketNetwork: snapshot.economy.marketNetwork
      ? {
        markets: (snapshot.economy.marketNetwork.markets ?? []).map(market => ({ ...market })),
        summary: (snapshot.economy.marketNetwork.summary ?? []).map(row => ({ ...row })),
        tradeReceipts: (snapshot.economy.marketNetwork.tradeReceipts ?? []).map(receipt => ({ ...receipt })),
      }
      : null,
    zones: snapshot.economy.zones.map(zone => ({ ...zone })),
    reservedBuildingSites: (snapshot.economy.reservedBuildingSites ?? []).map(site => ({ ...site })),
    roadWorksites: snapshot.physical.roadWorksites.map(site => ({ ...site })),
    companyLedger: snapshot.economy.company.ledger.map(row => ({ ...row })),
    companyLedgerCount: snapshot.economy.company.ledgerCount
      ?? snapshot.economy.company.ledger.length,
    companyLedgerIncome: snapshot.economy.company.ledgerIncome
      ?? snapshot.economy.company.ledger
        .filter(row => row.amount > 0)
        .reduce((total, row) => total + row.amount, 0),
    companyLedgerExpense: snapshot.economy.company.ledgerExpense
      ?? snapshot.economy.company.ledger
        .filter(row => row.amount < 0)
        .reduce((total, row) => total - row.amount, 0),
    companyLedgerByReason: { ...(snapshot.economy.company.ledgerByReason ?? {}) },
    companyDailyLedger: (snapshot.economy.company.ledgerDaily ?? []).map(row => ({ ...row })),
    caravans: (snapshot.economy.caravans ?? []).map(route => {
      const marketNames = new Map(
        (snapshot.economy.marketNetwork?.markets ?? []).map(market => [market.id, market.name]),
      );
      return {
        ...route,
        baseMarketName: marketNames.get(route.baseMarketId) ?? route.baseMarketId,
        destMarketName: marketNames.get(route.destMarketId) ?? route.destMarketId,
        goodsOut: [...(route.goodsOut ?? [])],
        goodsBack: [...(route.goodsBack ?? [])],
        cartAssetIds: [...(route.cartAssetIds ?? [])],
        recentTrips: (route.recentTrips ?? []).map(trip => ({ ...trip })),
        monthly: { ...(route.monthly ?? {}) },
        status: caravanStatePresentation(route),
        accounting: caravanAccountingPresentation(route, snapshot.day),
        daysUntilDeparture: Math.max(0, (route.nextDepartDay ?? snapshot.day) - snapshot.day),
      };
    }),
    companyCarts: (snapshot.economy.companyCarts ?? []).map(cart => ({ ...cart })),
    cartStats: { ...(snapshot.economy.cartStats ?? {}) },
    marketPrices: { ...snapshot.economy.px },
    flowEma: Object.fromEntries(Object.entries(snapshot.economy.f30 ?? {}).map(([goods, flow]) => [
      goods, { ...flow },
    ])),
    demandEma: Object.fromEntries(Object.entries(snapshot.economy.demand30 ?? {}).map(([goods, flow]) => [
      goods, {
        ...flow,
        sources: Object.fromEntries(Object.entries(flow.sources ?? {}).map(([source, values]) => [
          source, { ...values },
        ])),
      },
    ])),
    imported: { ...snapshot.economy.imported },
    moneyOutBy: { ...snapshot.economy.outBy },
    companyStock: { ...snapshot.economy.stock },
    companyStockAverageCosts,
    companyMarketStock: { ...snapshot.economy.marketStock },
    companyMarketStockAverageCosts,
    companyReleasePrices,
    companyStockReleaseQuotes,
    spoilTotal: snapshot.economy.spoil ?? 0,
    spoilByGoods: { ...(snapshot.economy.spoilByGoods ?? {}) },
    conversionEconomics,
    stockTargets: { ...snapshot.economy.stockTgt },
    mainlandAid: (() => {
      const requests = snapshot.economy.mainlandAid?.requests ?? 0;
      const refused = requests >= MAINLAND_AID.REFUSAL_AT;
      const nextQty = refused ? 0 : Math.round(MAINLAND_AID.BASE_WHEAT * (1 - MAINLAND_AID.DECAY * requests));
      return { requests, refused, nextQty };
    })(),
    orderOffer: snapshot.economy.orderOffer ? { ...snapshot.economy.orderOffer } : null,
    activeOrder: snapshot.economy.order ? { ...snapshot.economy.order } : null,
    marketLowest,
  };
  const withRoadConnection = {
    ...base,
    roadConnection: canReuseRoadTopology
      ? previousModel.roadConnection
      : analyzeRoadConnections(base),
  };
  const model = deepFreeze({
    ...withRoadConnection,
    renderScene: compileRenderScene(withRoadConnection, {
      previousScene: canReuseTerrain ? previousModel.renderScene : null,
      terrainRevision,
      roadRevision,
    }),
  });
  MODEL_TOPOLOGY_REVISIONS.set(model, Object.freeze({ terrainRevision, roadRevision }));
  return model;
}

export { INVENTORY_SECTIONS };
