const MONEY_EPSILON = 1e-9;

function requireFiniteMoney(value, label) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${label} must be finite`);
  }
}

export function createCompanyState(initialMoney = 0) {
  requireFiniteMoney(initialMoney, "initialMoney");
  return {
    money: initialMoney,
    openingMoney: initialMoney,
    ledger: [],
  };
}

export function postCompanyLedger(company, { day, amount, reason }) {
  if (!Number.isSafeInteger(day) || day < 0) {
    throw new TypeError("ledger day must be a non-negative safe integer");
  }
  requireFiniteMoney(amount, "ledger amount");
  if (typeof reason !== "string" || reason.length === 0) {
    throw new TypeError("ledger reason must be a non-empty string");
  }

  company.money += amount;
  company.ledger.push({ day, amount, reason, balance: company.money });
  return company.money;
}

export function assertCompanyLedger(company) {
  let expected = company.openingMoney;
  requireFiniteMoney(expected, "company.openingMoney");

  for (const [index, entry] of company.ledger.entries()) {
    requireFiniteMoney(entry.amount, `company.ledger[${index}].amount`);
    expected += entry.amount;
    if (Math.abs(entry.balance - expected) > MONEY_EPSILON) {
      throw new Error(`会社台帳の残高不一致 index=${index}`);
    }
  }

  if (Math.abs(company.money - expected) > MONEY_EPSILON) {
    throw new Error(`会社資金に台帳外の変更があります expected=${expected} actual=${company.money}`);
  }
  return true;
}

export function recordExternalMoneyFlow(economy, { amount, reason }) {
  requireFiniteMoney(amount, "external flow amount");
  if (typeof reason !== "string" || reason.length === 0) {
    throw new TypeError("external flow reason must be a non-empty string");
  }
  if (amount === 0) return;

  if (amount > 0) economy.moneyBoundary.in += amount;
  else economy.moneyBoundary.out += -amount;
  economy.moneyBoundary.ledger.push({ amount, reason });
}

export function moneyTotal(economy) {
  const householdMoney = (economy.households ?? []).reduce((total, household) => {
    requireFiniteMoney(household.purse, "household.purse");
    return total + household.purse;
  }, 0);
  return economy.company.money + householdMoney;
}

export function assertMoneyConservation(economy) {
  assertCompanyLedger(economy.company);
  const actual = moneyTotal(economy);
  const expected =
    economy.moneyBoundary.openingTotal +
    economy.moneyBoundary.in -
    economy.moneyBoundary.out;
  const drift = actual - expected;
  if (Math.abs(drift) > 1e-4) {
    throw new Error(`貨幣保存則違反 drift=${drift}`);
  }
  return true;
}

export function createEconomicState({ initialCompanyMoney = 0 } = {}) {
  return {
    company: createCompanyState(initialCompanyMoney),
    moneyBoundary: {
      openingTotal: initialCompanyMoney,
      in: 0,
      out: 0,
      ledger: [],
    },
  };
}
