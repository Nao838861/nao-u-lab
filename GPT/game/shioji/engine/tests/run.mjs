import assert from "node:assert/strict";

import {
  assertCompanyLedger,
  assertMoneyConservation,
  createCompanyState,
  postCompanyLedger,
  recordExternalMoneyFlow,
} from "../src/econ.js";
import { mulberry32 } from "../src/prng.js";
import {
  assertMaterialBalance,
  createMaterialFlowLedger,
  recordMaterialFlow,
} from "../src/physical.js";
import { createWorld } from "../src/world.js";

const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

test("mulberry32は同じシードから同じ列を返す", () => {
  const a = mulberry32(12345);
  const b = mulberry32(12345);
  const sequenceA = Array.from({ length: 16 }, () => a());
  const sequenceB = Array.from({ length: 16 }, () => b());
  assert.deepEqual(sequenceA, sequenceB);
});

test("worldは同じシードと操作から同じJSON状態になる", () => {
  const run = () => {
    const world = createWorld({ seed: 17 });
    const randomValues = [world.random(), world.random(), world.random()];
    world.step();
    world.step();
    return { randomValues, state: world.state };
  };

  assert.deepEqual(run(), run());
  assert.doesNotThrow(() => JSON.stringify(run().state));
});

test("会社資金の増減は台帳に残り残高と一致する", () => {
  const company = createCompanyState(5_500);
  postCompanyLedger(company, { day: 1, amount: -250, reason: "支度金" });
  postCompanyLedger(company, { day: 1, amount: 40, reason: "市場口銭" });

  assert.equal(company.money, 5_290);
  assert.deepEqual(company.ledger, [
    { day: 1, amount: -250, reason: "支度金", balance: 5_250 },
    { day: 1, amount: 40, reason: "市場口銭", balance: 5_290 },
  ]);
  assert.equal(assertCompanyLedger(company), true);
});

test("会社資金を直接変更すると台帳検査が赤くなる", () => {
  const company = createCompanyState(5_500);
  company.money -= 1;
  assert.throws(() => assertCompanyLedger(company), /台帳外の変更/);
});

test("testConservation: 3シード×360日の貨幣保存則違反がゼロ", () => {
  for (const seed of [11, 13, 14]) {
    const world = createWorld({ seed, initialCompanyMoney: 5_500 });
    for (let day = 0; day < 360; day += 1) {
      assert.doesNotThrow(() => world.step());
    }
    assert.equal(world.state.day, 360);
    assert.equal(assertMoneyConservation(world.state.economy), true);
  }
});

test("本土との境界記帳だけを増やすと貨幣保存則が赤くなる", () => {
  const world = createWorld({ seed: 11, initialCompanyMoney: 5_500 });
  recordExternalMoneyFlow(world.state.economy, {
    amount: 100,
    reason: "検査用の未反映流入",
  });
  assert.throws(() => world.step(), /貨幣保存則違反/);
});

test("物資出納は生産・消費と輸送中cargoを含めて一致する", () => {
  const flows = createMaterialFlowLedger();
  recordMaterialFlow(flows, "wheat", "prod", 10);
  recordMaterialFlow(flows, "wheat", "cons", 2);

  const reports = assertMaterialBalance({
    before: { inventory: { wheat: 100 }, cargo: { wheat: 0 } },
    after: { inventory: { wheat: 98 }, cargo: { wheat: 10 } },
    flows,
  });
  assert.equal(reports[0].actualDelta, 8);
  assert.equal(reports[0].expectedDelta, 8);
  assert.equal(reports[0].residual, 0);
});

test("物資フローを1件わざと記帳し忘れると嘘発見器が赤くなる", () => {
  const flows = createMaterialFlowLedger();
  assert.throws(
    () => assertMaterialBalance({
      before: { inventory: { wheat: 100 }, cargo: {} },
      after: { inventory: { wheat: 90 }, cargo: {} },
      flows,
    }),
    /物資出納違反.*wheat/,
  );
});

let failures = 0;
for (const { name, run } of tests) {
  try {
    await run();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`not ok - ${name}`);
    console.error(error);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`\n${tests.length} tests passed`);
}
