import assert from 'node:assert/strict';

const CDP = process.env.SHIOJI_CDP ?? 'http://127.0.0.1:9226';
const GAME = process.env.SHIOJI_URL
  ?? 'http://127.0.0.1:8420/game/shioji/v004/?mode=test';
const TOTAL_DAYS = Number(process.env.SHIOJI_SOAK_DAYS ?? 600);
const SAMPLE_DAYS = 50;
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

class Page {
  constructor(target) {
    this.target = target;
    this.socket = new WebSocket(target.webSocketDebuggerUrl);
    this.pending = new Map();
    this.nextId = 1;
    this.errors = [];
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
      } else if (message.method === 'Runtime.exceptionThrown') {
        this.errors.push(message.params.exceptionDetails.exception?.description
          ?? message.params.exceptionDetails.text);
      }
    });
    await this.send('Runtime.enable');
    await this.send('Page.enable');
    await this.send('HeapProfiler.enable');
  }

  send(method, params = {}) {
    const id = this.nextId++;
    const promise = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description
        ?? result.exceptionDetails.text);
    }
    return result.result.value;
  }

  async close() {
    this.socket.close();
    await fetch(`${CDP}/json/close/${this.target.id}`).catch(() => null);
  }
}

const target = await fetch(`${CDP}/json/new?${encodeURIComponent('about:blank')}`, {
  method: 'PUT',
}).then(response => response.json());
const page = new Page(target);
const samples = [];

try {
  await page.connect();
  await page.send('Page.navigate', { url: GAME });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await wait(100);
    if (await page.evaluate("document.readyState === 'complete' && Boolean(window.__SHIOJI_V004__)")) break;
  }
  assert.equal(await page.evaluate('Boolean(window.__SHIOJI_V004__)'), true);
  await page.evaluate('window.__SHIOJI_V004__.setSpeed(0)');

  for (let expectedDay = SAMPLE_DAYS; expectedDay <= TOTAL_DAYS; expectedDay += SAMPLE_DAYS) {
    await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.advanceTicks(${SAMPLE_DAYS * 30}, { animate: true, baseSeconds: 0.001, batchSize: 3 });
      return game.model.day;
    })()`);
    await page.send('HeapProfiler.collectGarbage');
    const sample = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const memory = performance.memory ?? {};
      return {
        day: game.model.day,
        heapMB: Number.isFinite(memory.usedJSHeapSize)
          ? Number((memory.usedJSHeapSize / 1048576).toFixed(2)) : null,
        heapLimitMB: Number.isFinite(memory.jsHeapSizeLimit)
          ? Number((memory.jsHeapSizeLimit / 1048576).toFixed(0)) : null,
        historyRows: game.economyHistory.length,
        eventRows: game.eventLog.length,
        presentationQueue: game.presentation.queue.length,
        population: game.model.population,
        funds: game.model.companyMoney,
        foodText: document.querySelector('#food-days-value').textContent,
        runtimeErrors: 0,
      };
    })()`);
    assert.equal(sample.day, expectedDay);
    assert.ok(Number.isFinite(sample.population) && sample.population >= 0);
    assert.ok(Number.isFinite(sample.funds));
    assert.ok(sample.historyRows <= 180);
    assert.ok(sample.eventRows <= 24);
    assert.ok(sample.presentationQueue <= 12);
    assert.match(sample.foodText, /^あと\d+日分 (?:→|↘|↘↘)$/);
    samples.push(sample);
    console.log(JSON.stringify(sample));
  }

  assert.deepEqual(page.errors, []);
  const withMemory = samples.filter(sample => Number.isFinite(sample.heapMB));
  assert.ok(withMemory.length === 0 || withMemory.length === samples.length);
  if (withMemory.length) {
    const mature = withMemory.filter(sample => sample.day >= TOTAL_DAYS / 2);
    const matureRange = Math.max(...mature.map(row => row.heapMB))
      - Math.min(...mature.map(row => row.heapMB));
    assert.ok(matureRange <= 20,
      `後半ヒープが収束していない: range ${matureRange.toFixed(2)}MB`);
    assert.ok(withMemory.at(-1).heapMB - withMemory[0].heapMB <= 24,
      'ヒープが日数に比例して増え続けている');
  }
  console.log(`browser soak: PASS ${TOTAL_DAYS} days / ${samples.length} samples`);
} finally {
  await page.close();
}
