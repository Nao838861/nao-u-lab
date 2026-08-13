import {
  COMPANY_ORDER_GOODS,
  acceptCompanyOrder,
  householdProductionSummary,
  purchaseCompanyWoodCart,
  requestCompanyImport,
  requestCompanyStockRelease,
  requestMainlandAid,
  setCaravanEmployment,
  setCompanyStockTarget,
} from "./econ.js?v=v004.53.0-second-market-tutorial";
import {
  activePortCalls,
  addRoadLine,
  buildingById,
  haulJobById,
  removeBuilding,
  removeRoadTile,
} from "./physical.js?v=v004.53.0-second-market-tutorial";
import { addAuditZone, findAuditSpot } from "./audit.js?v=v004.53.0-second-market-tutorial";
import {
  forgetCompanyLogisticsBuilding,
  placeCompanyLogisticsBuilding,
} from "./world.js?v=v004.53.0-second-market-tutorial";
import { executeMarketTrade, quoteMarketTrade } from "./market_network.js?v=v004.53.0-second-market-tutorial";
import { configureCaravanRoute } from "./routes.js?v=v004.53.0-second-market-tutorial";

function jsonClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function controllerSnapshot(state, { includePhysical = false } = {}) {
  const { economy, physical } = state;
  const snapshot = {
    day: state.day,
    tick: state.tick,
    economy: {
      market: { ...economy.market },
      company: { money: economy.company.money },
      households: economy.households.map((household) => ({
        id: household.id,
        job: household.job,
        x: household.x,
        y: household.y,
        px: household.px,
        py: household.py,
        state: household.state,
        buildingId: household.buildingId,
        memberCount: household.members.length,
      })),
      zones: economy.zones.map((zone) => ({ ...zone })),
      reservedBuildingSites: (economy.reservedBuildingSites ?? []).map((site) => ({ ...site })),
      orderOffer: economy.orderOffer ? { ...economy.orderOffer } : null,
      order: economy.order ? { ...economy.order } : null,
      stockTgt: { ...economy.stockTgt },
      stock: { ...economy.stock },
      stalls: Object.fromEntries(Object.entries(economy.stalls).map(([goods, stalls]) => [
        goods,
        stalls.map((stall) => ({ ...stall })),
      ])),
    },
  };
  if (includePhysical) {
    snapshot.physical = {
      width: physical.width,
      height: physical.height,
      terrain: physical.terrain,
      roads: physical.roads,
      pavedRoads: physical.pavedRoads ?? {},
      trails: physical.trails,
      roadWorksites: physical.roadWorksites,
      roadOrigin: physical.roadOrigin,
      buildings: physical.buildings,
      buildingIndex: physical.buildingIndex,
      roleBuildingIds: physical.roleBuildingIds,
      occupied: physical.occupied,
      roadRevision: physical.roadRevision,
      travelRevision: physical.travelRevision,
      connectionCache: physical.connectionCache,
    };
  }
  return includePhysical ? jsonClone(snapshot) : snapshot;
}

function viewSnapshot(state, { terrainAfterRevision = null } = {}) {
  const { economy, physical } = state;
  const travelRevision = physical.travelRevision ?? 0;
  return {
    day: state.day,
    tick: state.tick,
    calendarOffsetDays: state.calendarOffsetDays ?? 0,
    seed: state.seed,
    economy: {
      company: {
        ...economy.company,
        ledger: economy.company.ledger.slice(),
        ledgerDaily: (economy.company.ledgerDaily ?? []).map((row) => ({ ...row })),
        ledgerByReason: { ...(economy.company.ledgerByReason ?? {}) },
      },
      currentDay: economy.currentDay,
      directTrades: economy.directTrades ?? [],
      caravans: economy.caravans ?? [],
      caravanSalesPending: economy.caravanSalesPending ?? {},
      companyCarts: economy.companyCarts ?? [],
      cartStats: economy.cartStats ?? {},
      households: economy.households.map((household) => {
        const {
          productionHistory: _productionHistory,
          productionToday: _productionToday,
          resourceWork: _resourceWork,
          lastDirectTrade: _lastDirectTrade,
          ...viewHousehold
        } = household;
        return {
          ...viewHousehold,
          productionSummary: householdProductionSummary(
            economy,
            household,
            { day: state.day },
          ),
        };
      }),
      market: economy.market,
      f30: economy.f30,
      demand30: economy.demand30 ?? {},
      goDay: economy.goDay,
      imported: economy.imported,
      importStock: economy.importStock,
      importRequests: economy.importRequests,
      mainlandAid: economy.mainlandAid,
      marketStock: economy.marketStock,
      marketStockCost: economy.marketStockCost,
      marketStockM: economy.marketStockM ?? {},
      marketStockCostM: economy.marketStockCostM ?? {},
      natural: economy.natural,
      order: economy.order,
      orderOffer: economy.orderOffer,
      outBy: economy.outBy,
      px: economy.px,
      reservedBuildingSites: economy.reservedBuildingSites,
      stalls: economy.stalls,
      stock: economy.stock,
      stockCost: economy.stockCost,
      stockTgt: economy.stockTgt,
      spoil: Object.values(economy.led?.spoil ?? {}).reduce((
        total, amount,
      ) => total + Number(amount ?? 0), 0),
      spoilByGoods: { ...(economy.led?.spoil ?? {}) },
      traffic: economy.traffic,
      zones: economy.zones,
      marketNetwork: state.marketNetwork?.markets?.length > 1
        ? {
          markets: state.marketNetwork.markets,
          summary: state.marketNetwork.summary ?? [],
          tradeReceipts: (state.marketNetwork.tradeReceipts ?? []).slice(-16),
        }
        : null,
    },
    physical: {
      buildings: physical.buildings,
      // 描画側は移動中の人だけを使う。完了履歴まで毎tick複製すると、
      // 街が育つほど表示更新コストだけが増え続ける。
      haulJobs: (physical.activeHaulJobIds ?? [])
        .map((jobId) => haulJobById(physical, jobId))
        .filter(Boolean),
      height: physical.height,
      occupied: physical.occupied,
      portCalls: physical.portCalls.filter((call) => call.status === "docked")
        .concat(physical.portCalls.filter((call) => (
          call.status === "completed" || call.status === "cancelled"
        )).slice(-8)),
      roadWorksites: physical.roadWorksites,
      roadRevision: physical.roadRevision ?? 0,
      roads: physical.roads,
      pavedRoads: physical.pavedRoads ?? {},
      terrain: terrainAfterRevision === travelRevision ? null : physical.terrain,
      travelRevision,
      trails: physical.trails,
      width: physical.width,
    },
  };
}

function assertSafeCount(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative safe integer`);
  }
}

function householdPoint(economy, householdId) {
  const household = economy.households.find(({ id }) => id === householdId);
  return household
    ? { x: household.px ?? household.x, y: household.py ?? household.y }
    : { x: economy.market.x, y: economy.market.y };
}

function buildingPoint(physical, buildingId, fallback) {
  const building = buildingById(physical, buildingId);
  return building?.entrance ?? fallback;
}

function eventTypeForMessage(message) {
  if (message.includes("道が繋がっていません")) return "blocked";
  if (message.includes("餓えで亡くなった") || message.startsWith("☠")) return "death";
  if (message.startsWith("破綻転職:")) return "job_move";
  if (message.includes("分かれて") || message.includes("相続")) return "inheritance";
  return "notice";
}

function createEventTracker(world) {
  const { economy, physical } = world.state;
  return {
    households: new Map(economy.households.map((household) => [household.id, {
      state: household.state,
      members: household.members.length,
      sur: household.sur,
      job: household.job,
      buildingId: household.buildingId,
      x: household.px ?? household.x,
      y: household.py ?? household.y,
    }])),
    economyEventCount: economy.eventCount ?? economy.events.length,
    priceCounts: { ...(economy.priceCounts ?? Object.fromEntries(
      Object.entries(economy.prices).map(([goods, rows]) => [goods, rows.length]),
    )) },
    nextHaulJobId: physical.nextHaulJobId,
    activeHauls: new Map(physical.haulJobs
      .filter((job) => job.status !== "completed")
      .map((job) => [job.id, job])),
    activePortCalls: new Map(physical.portCalls
      .filter((call) => call.status === "docked")
      .map((call) => [call.id, { call, remaining: call.remaining }])),
  };
}

export function createEngineApi(
  world,
  { recordJournal = true, captureEventStream = true, initialJournal = [] } = {},
) {
  if (!world?.state || typeof world.tickOnce !== "function") {
    throw new TypeError("engine API requires a world with state and tickOnce");
  }
  if (!Array.isArray(initialJournal)) throw new TypeError("initial journal must be an array");
  const journal = jsonClone(initialJournal);
  const stream = [];
  let nextSequence = 1;
  let tracker = createEventTracker(world);
  const EVENT_STREAM_LIMIT = 128;

  const emit = (type, point, detail = {}) => {
    if (!captureEventStream) return;
    const fallback = world.state.economy.market;
    stream.push({
      sequence: nextSequence,
      day: world.state.day,
      tick: world.state.tick,
      type,
      x: Number.isFinite(point?.x) ? point.x : fallback.x,
      y: Number.isFinite(point?.y) ? point.y : fallback.y,
      ...detail,
    });
    nextSequence += 1;
    while (stream.length > EVENT_STREAM_LIMIT) {
      const transientIndex = stream.findIndex((event) => (
        event.type === "transaction"
        || event.type === "handling"
        || (
          ["departure", "arrival"].includes(event.type)
          && (event.haulJobId || event.fromState || event.toState)
        )
      ));
      stream.splice(transientIndex >= 0 ? transientIndex : 0, 1);
    }
  };

  const captureEvents = () => {
    if (!captureEventStream) return;
    const { economy, physical } = world.state;
    const newcomers = [];
    const memberDecreases = [];
    const seenHouseholds = new Set();
    let trackedSurs = null;
    for (const household of economy.households) {
      seenHouseholds.add(household.id);
      const point = { x: household.px ?? household.x, y: household.py ?? household.y };
      const previous = tracker.households.get(household.id);
      if (!previous) {
        if (trackedSurs === null) {
          trackedSurs = new Set(
            [...tracker.households.values()].map((row) => row.sur).filter(Boolean),
          );
        }
        newcomers.push({ household, point });
        tracker.households.set(household.id, {
          state: household.state,
          members: household.members.length,
          sur: household.sur,
          job: household.job,
          buildingId: household.buildingId,
          x: point.x,
          y: point.y,
        });
      } else {
        if (household.members.length > previous.members) {
          emit("birth", point, { householdId: household.id, count: household.members.length - previous.members });
        } else if (household.members.length < previous.members) {
          memberDecreases.push({ household, point, lost: previous.members - household.members.length });
        }
        if (household.job !== previous.job || household.buildingId !== previous.buildingId) {
          emit("job_move", point, {
            householdId: household.id,
            fromJob: previous.job,
            toJob: household.job,
            fromBuildingId: previous.buildingId,
            toBuildingId: household.buildingId,
          });
        }
        if (household.state !== previous.state) {
          if (["toMarket", "toWork", "arriving", "toHome"].includes(household.state)) {
            emit("departure", point, {
              householdId: household.id,
              fromState: previous.state,
              toState: household.state,
            });
          }
          if (["atMarket", "home", "building"].includes(household.state)) {
            emit("arrival", point, {
              householdId: household.id,
              fromState: previous.state,
              toState: household.state,
            });
          }
        }
        previous.state = household.state;
        previous.members = household.members.length;
        previous.sur = household.sur;
        previous.job = household.job;
        previous.buildingId = household.buildingId;
        previous.x = point.x;
        previous.y = point.y;
      }
    }
    // 家督分家は「人数減+同tickに同じ家名の新世帯」で識別し、死亡と区別して報告する
    const newcomerBySur = memberDecreases.length
      ? new Map(newcomers.map(({ household }) => [household.sur, household.id]))
      : null;
    for (const { household, point, lost } of memberDecreases) {
      const splitTo = newcomerBySur?.get(household.sur);
      if (splitTo !== undefined) {
        emit("departure", point, {
          householdId: household.id,
          reason: "household_split",
          toHouseholdId: splitTo,
          count: lost,
        });
      } else {
        emit("death", point, {
          householdId: household.id,
          buildingId: household.buildingId,
          job: household.job,
          familyName: household.sur,
          count: lost,
        });
      }
    }
    for (const { household, point } of newcomers) {
      emit("arrival", point, {
        householdId: household.id,
        reason: trackedSurs?.has(household.sur) ? "successor" : "new_household",
      });
    }
    for (const [householdId, previous] of tracker.households) {
      if (!seenHouseholds.has(householdId)) {
        emit("death", previous, {
          householdId,
          buildingId: previous.buildingId,
          job: previous.job,
          familyName: previous.sur,
          reason: "household_removed",
        });
        tracker.households.delete(householdId);
      }
    }

    for (const [goods, rows] of Object.entries(economy.prices)) {
      const totalCount = economy.priceCounts?.[goods] ?? rows.length;
      const addedCount = Math.max(0, totalCount - (tracker.priceCounts[goods] ?? 0));
      if (addedCount === 0) continue;
      for (const [day, price, qty] of rows.slice(-Math.min(addedCount, rows.length))) {
        emit("transaction", economy.market, { goods, price, qty, transactionDay: day });
      }
    }

    let nextHauls = tracker.activeHauls;
    const mutableHauls = () => {
      if (nextHauls === tracker.activeHauls) nextHauls = new Map(tracker.activeHauls);
      return nextHauls;
    };
    for (const [jobId, job] of tracker.activeHauls) {
      if (job.status !== "completed") continue;
      emit("arrival", buildingPoint(physical, job.to.buildingId, job.carrier.position), {
        haulJobId: job.id,
        goods: job.goods,
        qty: job.qty,
        carrier: job.carrier.mode,
      });
      mutableHauls().delete(jobId);
    }
    const newHaulJobs = physical.nextHaulJobId === tracker.nextHaulJobId
      ? []
      : physical.haulJobs.filter((candidate) => (
        Number(candidate.id.slice(1)) >= tracker.nextHaulJobId
      ));
    for (const job of newHaulJobs) {
      emit("departure", buildingPoint(physical, job.from.buildingId, job.carrier.position), {
        haulJobId: job.id,
        goods: job.goods,
        qty: job.qty,
        carrier: job.carrier.mode,
      });
      if (job.status === "completed") {
        emit("arrival", buildingPoint(physical, job.to.buildingId, job.carrier.position), {
          haulJobId: job.id,
          goods: job.goods,
          qty: job.qty,
          carrier: job.carrier.mode,
        });
      } else mutableHauls().set(job.id, job);
    }

    const port = buildingById(physical, physical.roleBuildingIds?.port);
    let nextPortCalls = tracker.activePortCalls;
    const mutablePortCalls = () => {
      if (nextPortCalls === tracker.activePortCalls) nextPortCalls = new Map(tracker.activePortCalls);
      return nextPortCalls;
    };
    for (const [callId, previous] of tracker.activePortCalls) {
      const { call } = previous;
      if (call.remaining < previous.remaining - 1e-9) {
        emit("handling", port?.entrance ?? economy.port, {
          portCallId: call.id,
          direction: call.direction,
          goods: call.goods,
          qty: previous.remaining - call.remaining,
        });
      }
      if (call.status === "docked") {
        if (call.remaining !== previous.remaining) {
          mutablePortCalls().set(callId, { call, remaining: call.remaining });
        }
      } else mutablePortCalls().delete(callId);
    }
    for (const call of activePortCalls(physical)) {
      if (nextPortCalls.has(call.id)) continue;
      emit("docking", port?.entrance ?? economy.port, {
        portCallId: call.id,
        direction: call.direction,
        goods: call.goods,
        qty: call.qty,
      });
      mutablePortCalls().set(call.id, { call, remaining: call.remaining });
    }

    const economyEventCount = economy.eventCount ?? economy.events.length;
    const addedEconomyEvents = Math.max(0, economyEventCount - tracker.economyEventCount);
    const newEconomyEvents = addedEconomyEvents === 0
      ? []
      : economy.events.slice(-Math.min(addedEconomyEvents, economy.events.length));
    for (const [eventDay, message] of newEconomyEvents) {
      const householdId = Number(message.match(/#(\d+)/)?.[1]);
      const household = economy.households.find(candidate => candidate.id === householdId);
      const previous = tracker.households.get(householdId);
      emit(eventTypeForMessage(message), householdPoint(economy, householdId), {
        eventDay,
        message,
        householdId: Number.isSafeInteger(householdId) ? householdId : undefined,
        buildingId: household?.buildingId ?? previous?.buildingId,
        job: household?.job ?? previous?.job,
        familyName: household?.sur ?? previous?.sur,
      });
    }

    tracker = {
      households: tracker.households,
      economyEventCount,
      priceCounts: { ...(economy.priceCounts ?? Object.fromEntries(
        Object.entries(economy.prices).map(([goods, rows]) => [goods, rows.length]),
      )) },
      nextHaulJobId: physical.nextHaulJobId,
      activeHauls: nextHauls,
      activePortCalls: nextPortCalls,
    };
  };

  const executeOperation = (operation) => {
    const op = jsonClone(operation);
    const { economy, physical } = world.state;
    switch (op.type) {
      case "place_building": {
        if (op.job === "market" || op.job === "warehouse") {
          const placed = placeCompanyLogisticsBuilding(
            economy,
            physical,
            op.job,
            { x: op.x, y: op.y },
            {
              day: world.state.day,
              buildingX: op.buildingX ?? null,
              buildingY: op.buildingY ?? null,
            },
          );
          if (placed.ok && op.job === "market") {
            const mainMarket = world.state.marketNetwork?.markets?.find(
              (market) => market.id === "main",
            );
            if (mainMarket) {
              mainMarket.entrance = { ...placed.building.entrance };
              mainMarket.buildingId = placed.building.id;
              placed.building.marketId = "main";
            }
          }
          return {
            ok: placed.ok,
            buildingId: placed.ok ? placed.building.id : null,
            reason: placed.reason ?? null,
          };
        }
        const ok = addAuditZone(
          world,
          op.job,
          op.x,
          op.y,
          op.buildingX ?? null,
          op.buildingY ?? null,
        );
        if (ok) {
          const building = buildingById(physical, economy.zones.at(-1).buildingId);
          if (building) {
            building.marketId = "main";
            const mainMarket = world.state.marketNetwork?.markets?.find(
              (market) => market.id === "main",
            );
            if (mainMarket?.buildingId) {
              const household = economy.households.find(
                (candidate) => candidate.id === building.ownerHouseholdId,
              );
              if (household) household.marketId = "main";
            }
          }
        }
        return { ok, buildingId: ok ? economy.zones.at(-1).buildingId : null };
      }
      case "remove_building": {
        const building = buildingById(physical, op.buildingId);
        if (!building || building.fixed || building.ownerHouseholdId !== null) return { ok: false };
        if (
          building.roles?.includes("market")
          && economy.households.some((household) => household.marketCarrier)
        ) return { ok: false };
        const activeTransport = (physical.activeHaulJobIds ?? []).some((jobId) => {
          const job = haulJobById(physical, jobId);
          return job?.status === "in_transit"
            && (job.from.buildingId === building.id || job.to.buildingId === building.id);
        });
        if (activeTransport) return { ok: false };
        const stored = Object.values(building.inventory ?? {}).some((section) => (
          Object.values(section).some((qty) => qty > 1e-9)
        ));
        if (stored) return { ok: false };
        const zoneIndex = economy.zones.findIndex(({ buildingId }) => buildingId === op.buildingId);
        if (zoneIndex >= 0 && economy.zones[zoneIndex].filled) return { ok: false };
        const ok = removeBuilding(physical, building);
        if (ok) {
          forgetCompanyLogisticsBuilding(economy, building);
          if (zoneIndex >= 0) economy.zones.splice(zoneIndex, 1);
        }
        return { ok };
      }
      case "add_road":
        return addRoadLine(physical, op.start, op.end);
      case "remove_road":
        return { ok: removeRoadTile(physical, op.x, op.y) };
      case "set_stock_target":
        return { ok: true, qty: setCompanyStockTarget(economy, op.goods, op.qty) };
      case "set_caravan_employment":
        return setCaravanEmployment(physical, {
          buildingId: op.buildingId,
          recruitment: op.recruitment,
          wage: op.wage,
        });
      case "set_caravan_route": {
        const actionDay = world.state.tick % 30 === 0
          ? world.state.day + 1
          : world.state.day;
        return configureCaravanRoute(economy, physical, {
          baseBuildingId: op.baseBuildingId,
          destMarketId: op.destMarketId,
          goodsOut: op.goodsOut,
          goodsBack: op.goodsBack,
          intervalDays: op.intervalDays,
          day: actionDay,
        });
      }
      case "release_stock": {
        const job = requestCompanyStockRelease(economy, physical, op.goods, {
          day: world.state.day,
          qty: op.qty,
        });
        return { ok: Boolean(job), jobId: job?.id ?? null };
      }
      case "accept_order": {
        // 操作は完了済みの日と次の日の境界で入る。日境界(tick%30===0)では
        // 次のシミュレーション日として記録し、day引数で動く基準操作と一致させる。
        const actionDay = world.state.tick % 30 === 0
          ? world.state.day + 1
          : world.state.day;
        const order = acceptCompanyOrder(economy, { day: actionDay });
        return { ok: Boolean(order), order };
      }
      case "request_aid": {
        const actionDay = world.state.tick % 30 === 0
          ? world.state.day + 1
          : world.state.day;
        return requestMainlandAid(economy, physical, { day: actionDay });
      }
      case "request_import": {
        const actionDay = world.state.tick % 30 === 0
          ? world.state.day + 1
          : world.state.day;
        let request = null;
        try {
          request = requestCompanyImport(economy, physical, op.goods, {
            day: actionDay,
            qty: op.qty,
          });
        } catch {
          return { ok: false, request: null, reason: "invalid_goods" };
        }
        return {
          ok: Boolean(request),
          request: request ? jsonClone(request) : null,
          reason: request ? null : "port_or_funds",
        };
      }
      case "purchase_company_cart": {
        const actionDay = world.state.tick % 30 === 0
          ? world.state.day + 1
          : world.state.day;
        const cart = purchaseCompanyWoodCart(economy, { day: actionDay });
        return { ok: Boolean(cart), cart };
      }
      case "market_trade": {
        const network = world.state.marketNetwork;
        if (!network?.markets?.some(market => market.id === op.fromMarketId)
          || !network.markets.some(market => market.id === op.toMarketId)) {
          return { ok: false, reason: "market_not_found" };
        }
        const quote = quoteMarketTrade(network, op);
        if (!quote.ok) return quote;
        return executeMarketTrade(network, quote, { day: world.state.day });
      }
      default:
        throw new Error(`unknown engine operation: ${op.type}`);
    }
  };

  const applyOperation = (operation, { record = recordJournal } = {}) => {
    const op = jsonClone(operation);
    const result = executeOperation(op);
    if (record) {
      journal.push({
        day: world.state.day,
        tick: world.state.tick,
        op,
      });
    }
    emit("operation", world.state.economy.market, { op, ok: result?.ok ?? true });
    captureEvents();
    return result;
  };

  const advanceTicks = (count = 1) => {
    assertSafeCount(count, "tick count");
    for (let index = 0; index < count; index += 1) {
      world.tickOnce();
      captureEvents();
    }
    return world.state;
  };

  return Object.freeze({
    applyOperation,
    advanceTicks,
    advanceDays(days = 1) {
      assertSafeCount(days, "day count");
      return advanceTicks(days * 30);
    },
    snapshot({ scope = "full", terrainAfterRevision = null } = {}) {
      if (scope === "controller") return controllerSnapshot(world.state);
      if (scope === "placement") return controllerSnapshot(world.state, { includePhysical: true });
      if (scope === "view") {
        return jsonClone(viewSnapshot(world.state, { terrainAfterRevision }));
      }
      if (scope !== "full") throw new Error(`unknown snapshot scope: ${scope}`);
      return jsonClone(world.state);
    },
    events({ afterSequence = 0 } = {}) {
      if (!stream.length || afterSequence >= stream.at(-1).sequence) return [];
      if (afterSequence < stream[0].sequence) return jsonClone(stream);
      // sequence の欠番や将来の履歴切詰めにも耐える、最初の未読位置の二分探索。
      let low = 0;
      let high = stream.length;
      while (low < high) {
        const middle = (low + high) >>> 1;
        if (stream[middle].sequence <= afterSequence) low = middle + 1;
        else high = middle;
      }
      return jsonClone(stream.slice(low));
    },
    inputJournal() {
      return jsonClone(journal);
    },
  });
}

function snapshotPopulation(economy) {
  return economy.households.reduce((total, household) => (
    total + (household.memberCount ?? household.members?.length ?? 0)
  ), 0);
}

function snapshotJobAndZones(economy, job) {
  return economy.households.filter((household) => household.job === job).length
    + economy.zones.filter((zone) => !zone.filled && zone.job === job).length;
}

export function mimicPlayerThroughApi(api, day) {
  let snapshot = api.snapshot({ scope: "controller" });
  let acceptedOrder = null;
  const offer = snapshot.economy.orderOffer;
  if (offer) {
    const cheapest = snapshot.economy.stalls[offer.g]
      .filter((stall) => stall.qty > 1e-9)
      .reduce((value, stall) => Math.min(value, stall.price), Infinity);
    if (cheapest <= offer.price * 1.25) {
      acceptedOrder = api.applyOperation({ type: "accept_order" }).order;
      snapshot = api.snapshot({ scope: "controller" });
    }
  }

  const staleOrderTarget = !snapshot.economy.order && COMPANY_ORDER_GOODS.some(
    (goods) => (snapshot.economy.stockTgt[goods] ?? 0) > 0,
  );
  let stockTargetsUpdated = false;
  if (day % 5 === 0 || acceptedOrder || staleOrderTarget) {
    for (const goods of COMPANY_ORDER_GOODS) {
      const target = snapshot.economy.order?.g === goods
        ? Math.ceil((snapshot.economy.stock[goods] ?? 0) + snapshot.economy.order.left)
        : 0;
      if ((snapshot.economy.stockTgt[goods] ?? 0) !== target) {
        api.applyOperation({ type: "set_stock_target", goods, qty: target });
      }
    }
    const wheatTarget = Math.round(snapshotPopulation(snapshot.economy) * 2);
    if ((snapshot.economy.stockTgt.wheat ?? 0) !== wheatTarget) {
      api.applyOperation({
        type: "set_stock_target",
        goods: "wheat",
        qty: wheatTarget,
      });
    }
    stockTargetsUpdated = true;
    snapshot = api.snapshot({ scope: "controller" });
  }

  let rebuilt = null;
  if (day % 90 === 0 && snapshot.economy.company.money * 10 > 8000) {
    const placementSnapshot = api.snapshot({ scope: "placement" });
    for (const job of ["woodshop", "charburner", "saltworks"]) {
      if (snapshotJobAndZones(snapshot.economy, job) >= 1) continue;
      const spot = findAuditSpot({ state: placementSnapshot }, job);
      if (spot) {
        const result = api.applyOperation({ type: "place_building", job, x: spot[0], y: spot[1] });
        if (result.ok) rebuilt = job;
      }
      if (spot) break;
    }
  }
  return { stockTargetsUpdated, acceptedOrder, rebuilt };
}

export function replayInputJournal(
  createWorld,
  inputJournal,
  { untilTick = Math.max(0, ...inputJournal.map(({ tick }) => tick)) } = {},
) {
  assertSafeCount(untilTick, "replay untilTick");
  const world = createWorld();
  const api = createEngineApi(world, { recordJournal: false, captureEventStream: false });
  const journal = jsonClone(inputJournal).sort((left, right) => (
    left.tick - right.tick || left.day - right.day
  ));
  let cursor = 0;
  while (world.state.tick <= untilTick) {
    while (cursor < journal.length && journal[cursor].tick === world.state.tick) {
      if (journal[cursor].day !== world.state.day) {
        throw new Error(`journal day/tick mismatch at ${journal[cursor].day}/${journal[cursor].tick}`);
      }
      api.applyOperation(journal[cursor].op, { record: false });
      cursor += 1;
    }
    if (world.state.tick === untilTick) break;
    api.advanceTicks(1);
  }
  if (cursor !== journal.length) throw new Error("journal contains operations after replay horizon");
  return { world, api };
}
