import {
  COMPANY_ORDER_GOODS,
  acceptCompanyOrder,
  requestCompanyStockRelease,
  setCompanyStockTarget,
} from "./econ.js";
import {
  addRoadLine,
  buildingById,
  removeBuilding,
  removeRoadTile,
} from "./physical.js";
import { addAuditZone, findAuditSpot } from "./audit.js";

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
      job: household.job,
      buildingId: household.buildingId,
      x: household.px ?? household.x,
      y: household.py ?? household.y,
    }])),
    economyEventCount: economy.events.length,
    priceCounts: Object.fromEntries(Object.entries(economy.prices).map(([goods, rows]) => [
      goods,
      rows.length,
    ])),
    haulCount: physical.haulJobs.length,
    activeHauls: new Map(physical.haulJobs
      .filter((job) => job.status !== "completed")
      .map((job) => [job.id, job])),
    portCallCount: physical.portCalls.length,
    activePortCalls: new Map(physical.portCalls
      .filter((call) => call.status === "docked")
      .map((call) => [call.id, { call, remaining: call.remaining }])),
  };
}

export function createEngineApi(
  world,
  { recordJournal = true, captureEventStream = true } = {},
) {
  if (!world?.state || typeof world.tickOnce !== "function") {
    throw new TypeError("engine API requires a world with state and tickOnce");
  }
  const journal = [];
  const stream = [];
  let nextSequence = 1;
  let tracker = createEventTracker(world);

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
  };

  const captureEvents = () => {
    if (!captureEventStream) return;
    const { economy, physical } = world.state;
    const nextHouseholds = new Map();
    for (const household of economy.households) {
      const point = { x: household.px ?? household.x, y: household.py ?? household.y };
      const previous = tracker.households.get(household.id);
      if (!previous) emit("arrival", point, { householdId: household.id, reason: "new_household" });
      else {
        if (household.members.length > previous.members) {
          emit("birth", point, { householdId: household.id, count: household.members.length - previous.members });
        } else if (household.members.length < previous.members) {
          emit("death", point, { householdId: household.id, count: previous.members - household.members });
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
      }
      nextHouseholds.set(household.id, {
        state: household.state,
        members: household.members.length,
        job: household.job,
        buildingId: household.buildingId,
        x: point.x,
        y: point.y,
      });
    }
    for (const [householdId, previous] of tracker.households) {
      if (!nextHouseholds.has(householdId)) {
        emit("death", previous, { householdId, reason: "household_removed" });
      }
    }

    for (const [goods, rows] of Object.entries(economy.prices)) {
      const previousCount = tracker.priceCounts[goods] ?? 0;
      for (const [day, price, qty] of rows.slice(previousCount)) {
        emit("transaction", economy.market, { goods, price, qty, transactionDay: day });
      }
    }

    const nextHauls = new Map(tracker.activeHauls);
    for (const [jobId, job] of tracker.activeHauls) {
      if (job.status !== "completed") continue;
      emit("arrival", buildingPoint(physical, job.to.buildingId, job.carrier.position), {
        haulJobId: job.id,
        goods: job.goods,
        qty: job.qty,
        carrier: job.carrier.mode,
      });
      nextHauls.delete(jobId);
    }
    for (const job of physical.haulJobs.slice(tracker.haulCount)) {
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
      } else nextHauls.set(job.id, job);
    }

    const port = buildingById(physical, physical.roleBuildingIds?.port);
    const nextPortCalls = new Map(tracker.activePortCalls);
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
      if (call.status === "docked") nextPortCalls.set(callId, { call, remaining: call.remaining });
      else nextPortCalls.delete(callId);
    }
    for (const call of physical.portCalls.slice(tracker.portCallCount)) {
      emit("docking", port?.entrance ?? economy.port, {
        portCallId: call.id,
        direction: call.direction,
        goods: call.goods,
        qty: call.qty,
      });
      if (call.status === "docked") nextPortCalls.set(call.id, { call, remaining: call.remaining });
    }

    const newEconomyEvents = economy.events.slice(tracker.economyEventCount);
    for (const [eventDay, message] of newEconomyEvents) {
      const householdId = Number(message.match(/#(\d+)/)?.[1]);
      emit(eventTypeForMessage(message), householdPoint(economy, householdId), {
        eventDay,
        message,
      });
    }

    tracker = {
      households: nextHouseholds,
      economyEventCount: economy.events.length,
      priceCounts: Object.fromEntries(Object.entries(economy.prices).map(([goods, rows]) => [
        goods,
        rows.length,
      ])),
      haulCount: physical.haulJobs.length,
      activeHauls: nextHauls,
      portCallCount: physical.portCalls.length,
      activePortCalls: nextPortCalls,
    };
  };

  const executeOperation = (operation) => {
    const op = jsonClone(operation);
    const { economy, physical } = world.state;
    switch (op.type) {
      case "place_building": {
        const ok = addAuditZone(
          world,
          op.job,
          op.x,
          op.y,
          op.buildingX ?? null,
          op.buildingY ?? null,
        );
        return { ok, buildingId: ok ? economy.zones.at(-1).buildingId : null };
      }
      case "remove_building": {
        const building = buildingById(physical, op.buildingId);
        if (!building || building.fixed || building.ownerHouseholdId !== null) return { ok: false };
        const zoneIndex = economy.zones.findIndex(({ buildingId }) => buildingId === op.buildingId);
        if (zoneIndex >= 0 && economy.zones[zoneIndex].filled) return { ok: false };
        const ok = removeBuilding(physical, building);
        if (ok && zoneIndex >= 0) economy.zones.splice(zoneIndex, 1);
        return { ok };
      }
      case "add_road":
        return addRoadLine(physical, op.start, op.end);
      case "remove_road":
        return { ok: removeRoadTile(physical, op.x, op.y) };
      case "set_stock_target":
        return { ok: true, qty: setCompanyStockTarget(economy, op.goods, op.qty) };
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
    snapshot({ scope = "full" } = {}) {
      if (scope === "controller") return controllerSnapshot(world.state);
      if (scope === "placement") return controllerSnapshot(world.state, { includePhysical: true });
      if (scope !== "full") throw new Error(`unknown snapshot scope: ${scope}`);
      return jsonClone(world.state);
    },
    events({ afterSequence = 0 } = {}) {
      return jsonClone(stream.filter(({ sequence }) => sequence > afterSequence));
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
