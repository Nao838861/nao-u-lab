import assert from "node:assert/strict";
import {
  createMarketNetwork,
  assignMarketNetwork,
  marketNetworkSummary,
  quoteMarketTrade,
  executeMarketTrade,
} from "../src/market_network.js";
import { createPhysicalState, makeMultiMarketTerrain } from "../src/physical.js";
import { createWorld } from "../src/world.js";
import { createEngineApi } from "../src/api.js";

const expandedTerrain = makeMultiMarketTerrain(96, 64);
assert.equal(expandedTerrain.length, 64);
assert.equal(expandedTerrain[0].length, 96);
assert.ok(expandedTerrain.flat().some(tile => tile.kind === "ore"));
assert.ok(expandedTerrain.flat().some(tile => tile.kind === "forest"));

function physical() {
  const state = createPhysicalState({ width: 20, height: 12 });
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) state.terrain[y][x] = { kind: "grass", variant: 0 };
  }
  state.buildings = [
    { id: 1, type: "logger", entrance: { x: 4, y: 2 } },
    { id: 2, type: "miner", entrance: { x: 16, y: 2 } },
  ];
  return state;
}

const economy = {
  households: [
    { id: 1, buildingId: 1, x: 4, y: 2, members: [] },
    { id: 2, buildingId: 2, x: 16, y: 2, members: [] },
  ],
  market: { x: 2, y: 2 },
};
const network = createMarketNetwork({
  markets: [
    { id: "west", name: "西市場", entrance: { x: 2, y: 2 } },
    { id: "east", name: "東市場", entrance: { x: 18, y: 2 } },
  ],
});
const assigned = assignMarketNetwork(physical(), economy, network);
assert.equal(economy.households[0].marketId, "west");
assert.equal(economy.households[1].marketId, "east");
assert.equal(assigned.assignments["building:1"], "west");
assert.equal(assigned.assignments["building:2"], "east");

assigned.marketStates.west = { stock: { tools: 8 }, prices: { tools: 2 }, buyback: { tools: 2 } };
assigned.marketStates.east = { stock: {}, prices: { tools: 6 }, buyback: { tools: 5 } };
const quote = quoteMarketTrade(assigned, {
  fromMarketId: "west", toMarketId: "east", goods: "tools", quantity: 4,
  capacity: 8, transportTicks: 12, transportCostPerTick: 0.1,
});
assert.equal(quote.quantity, 4);
assert.equal(quote.profit, 10.8);
const result = executeMarketTrade(assigned, quote, { day: 30 });
assert.equal(result.ok, true);
assert.equal(assigned.marketStates.west.stock.tools, 4);
assert.equal(assigned.marketStates.east.stock.tools, 4);
assert.equal(assigned.tradeReceipts[0].day, 30);

const summary = marketNetworkSummary(physical(), economy, assigned);
assert.equal(summary.summary.length, 2);
assert.equal(summary.summary.find((row) => row.id === "west").households, 1);

const world = createWorld({
  physicalState: physical(),
  market: { x: 2, y: 2 },
  marketNetwork: { markets: [
    { id: "west", name: "西市場", entrance: { x: 2, y: 2 } },
    { id: "east", name: "東市場", entrance: { x: 18, y: 2 } },
  ] },
});
world.state.marketNetwork.marketStates = {
  west: { stock: { tools: 3 }, prices: { tools: 2 }, buyback: { tools: 2 } },
  east: { stock: {}, prices: { tools: 6 }, buyback: { tools: 5 } },
};
const api = createEngineApi(world);
const apiTrade = api.applyOperation({
  type: "market_trade", fromMarketId: "west", toMarketId: "east", goods: "tools",
  quantity: 2, capacity: 8, transportTicks: 4,
});
assert.equal(apiTrade.ok, true);
assert.equal(world.state.marketNetwork.marketStates.east.stock.tools, 2);
console.log("market network phase1: PASS");
