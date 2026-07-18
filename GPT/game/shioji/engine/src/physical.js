export function createPhysicalState() {
  return {};
}

const FLOW_KINDS = new Set(["prod", "cons", "imp", "exp"]);

function requireQuantity(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label} must be a finite non-negative number`);
  }
}

function goodsKeys(...records) {
  return new Set(records.flatMap((record) => Object.keys(record ?? {})));
}

function quantity(record, goods) {
  const value = record?.[goods] ?? 0;
  requireQuantity(value, goods);
  return value;
}

export function createMaterialFlowLedger() {
  return {};
}

export function recordMaterialFlow(ledger, goods, kind, qty) {
  if (typeof goods !== "string" || goods.length === 0) {
    throw new TypeError("goods must be a non-empty string");
  }
  if (!FLOW_KINDS.has(kind)) {
    throw new TypeError(`unknown material flow kind: ${kind}`);
  }
  requireQuantity(qty, "material flow quantity");

  const entry = ledger[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
  entry[kind] += qty;
  ledger[goods] = entry;
}

export function inspectMaterialBalance({ before, after, flows, maxResidualRatio = 0.05 }) {
  if (!Number.isFinite(maxResidualRatio) || maxResidualRatio < 0) {
    throw new TypeError("maxResidualRatio must be a finite non-negative number");
  }

  const reports = [];
  const allGoods = goodsKeys(
    before?.inventory,
    before?.cargo,
    after?.inventory,
    after?.cargo,
    flows,
  );

  for (const goods of allGoods) {
    const opening = quantity(before?.inventory, goods) + quantity(before?.cargo, goods);
    const closing = quantity(after?.inventory, goods) + quantity(after?.cargo, goods);
    const flow = flows?.[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    for (const kind of FLOW_KINDS) quantity(flow, kind);

    const expectedDelta = flow.prod - flow.cons + flow.imp - flow.exp;
    const actualDelta = closing - opening;
    const residual = actualDelta - expectedDelta;
    // flow_island/audit.mjs E20と同じく、残差率の分母は生産+消費とする。
    const grossFlow = flow.prod + flow.cons;
    const residualRatio = Math.abs(residual) <= 1e-9
      ? 0
      : grossFlow > 1e-9
        ? Math.abs(residual) / grossFlow
        : Number.POSITIVE_INFINITY;
    reports.push({
      goods,
      opening,
      closing,
      actualDelta,
      expectedDelta,
      residual,
      grossFlow,
      residualRatio,
      ok: residualRatio < maxResidualRatio,
    });
  }

  return reports;
}

export function assertMaterialBalance(options) {
  const reports = inspectMaterialBalance(options);
  const failures = reports.filter((report) => !report.ok);
  if (failures.length > 0) {
    const detail = failures
      .map(({ goods, residual, residualRatio }) =>
        `${goods}: residual=${residual} ratio=${residualRatio}`)
      .join("; ");
    throw new Error(`物資出納違反 ${detail}`);
  }
  return reports;
}
