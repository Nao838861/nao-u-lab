import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CDP = process.env.SHIOJI_CDP || "http://127.0.0.1:9224";
const GAME = process.env.SHIOJI_URL || "http://localhost:8420/?seed=11";
const here = path.dirname(fileURLToPath(import.meta.url));
const artifactDir = path.join(here, "artifacts");
fs.mkdirSync(artifactDir, { recursive: true });

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

class CdpPage {
  constructor(webSocketUrl) {
    this.ws = new WebSocket(webSocketUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.exceptions = [];
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
      } else if (message.method === "Runtime.exceptionThrown") {
        this.exceptions.push(message.params.exceptionDetails.text);
      }
    });
    await this.send("Page.enable");
    await this.send("Runtime.enable");
  }

  send(method, params = {}) {
    const id = this.nextId++;
    const promise = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.ws.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }

  async screenshot(filename) {
    const result = await this.send("Page.captureScreenshot", { format: "png", fromSurface: true });
    fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(result.data, "base64"));
  }

  async clickPoint(x, y) {
    await this.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await this.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await this.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  }

  async drag(start, end) {
    await this.send("Input.dispatchMouseEvent", { type: "mouseMoved", ...start });
    await this.send("Input.dispatchMouseEvent", { type: "mousePressed", ...start, button: "left", clickCount: 1 });
    await this.send("Input.dispatchMouseEvent", { type: "mouseMoved", ...end, button: "left", buttons: 1 });
    await this.send("Input.dispatchMouseEvent", { type: "mouseReleased", ...end, button: "left", clickCount: 1 });
  }

  close() {
    this.ws.close();
  }
}

async function newPage() {
  const target = await fetch(`${CDP}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" }).then((response) => response.json());
  const page = new CdpPage(target.webSocketDebuggerUrl);
  await page.connect();
  return page;
}

async function setViewport(page, width, height, mobile = false) {
  await page.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile,
    screenWidth: width,
    screenHeight: height
  });
}

async function navigate(page) {
  await page.send("Page.navigate", { url: GAME });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await wait(100);
    const ready = await page.evaluate("document.readyState === 'complete' && Boolean(window.__SHIOJI__)");
    if (ready) return;
  }
  throw new Error("game did not load");
}

async function desktopFlow() {
  const page = await newPage();
  await setViewport(page, 1440, 900);
  await navigate(page);
  assert.equal(await page.evaluate("document.title"), "潮路の島 — SHIOJI");
  assert.equal(await page.evaluate("!document.querySelector('#title-screen').classList.contains('hidden')"), true);
  await page.screenshot("title-desktop.png");

  await page.evaluate("document.querySelector('#new-game-button').click()");
  await wait(250);
  assert.equal(await page.evaluate("window.__SHIOJI__.state.screen"), "game");
  assert.equal(await page.evaluate("window.__SHIOJI__.world.funds"), 720);
  await page.screenshot("initial-desktop.png");

  await page.evaluate("document.querySelector('[data-tool=farm]').click()");
  const farmPoint = await page.evaluate("window.__SHIOJI__.renderer.tileCenter({x:10,y:13})");
  await page.clickPoint(farmPoint.x, farmPoint.y);
  assert.equal(await page.evaluate("window.__SHIOJI__.world.constructions.some(item => item.type === 'farm')"), true);

  await page.evaluate("document.querySelector('[data-tool=road]').click()");
  const roadStart = await page.evaluate("window.__SHIOJI__.renderer.tileCenter({x:8,y:14})");
  const roadEnd = await page.evaluate("window.__SHIOJI__.renderer.tileCenter({x:10,y:14})");
  await page.drag(roadStart, roadEnd);
  assert.equal(await page.evaluate("window.__SHIOJI__.world.roadProjects.length > 0"), true);

  await page.evaluate("window.__SHIOJI__.state.speeds[2] = 60; window.__SHIOJI__.state.speedIndex = 2; document.querySelector('#pause-button').click()");
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await wait(100);
    if (await page.evaluate("window.__SHIOJI__.world.pausedForDecision")) break;
  }
  assert.equal(await page.evaluate("window.__SHIOJI__.world.day"), 45);
  assert.equal(await page.evaluate("!document.querySelector('#modal').classList.contains('hidden')"), true);
  await page.screenshot("ship-modal-desktop.png");

  await page.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
  assert.equal(await page.evaluate("!document.querySelector('#modal').classList.contains('hidden')"), true, "船便の必須選択はEscで消えない");
  await page.evaluate("window.__SHIOJI__.state.speedIndex = 0; document.querySelector('[data-contract=timber_charter]').click()");
  assert.equal(await page.evaluate("document.querySelector('#modal').classList.contains('hidden')"), true);
  assert.equal(await page.evaluate("window.__SHIOJI__.world.pausedForDecision"), false);

  const chapterTwoBuild = await page.evaluate(`(() => {
    const world = window.__SHIOJI__.world;
    return {
      road: world.planRoad({x:8,y:9}, {x:22,y:9}).ok,
      logger: world.placeBuilding('logger', 19, 8).ok,
      sawmill: world.placeBuilding('sawmill', 15, 10).ok
    };
  })()`);
  assert.deepEqual(chapterTwoBuild, { road: true, logger: true, sawmill: true });
  await page.evaluate("window.__SHIOJI__.state.speedIndex = 2");
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await wait(100);
    if (await page.evaluate("window.__SHIOJI__.world.pausedForDecision")) break;
  }
  assert.equal(await page.evaluate("window.__SHIOJI__.world.day"), 90);
  if (!await page.evaluate("window.__SHIOJI__.world.seals.timber")) {
    console.error("chapter two diagnostic", await page.evaluate(`(() => {
      const world = window.__SHIOJI__.world;
      return {
        result: world.lastShipResult,
        funds: world.funds,
        buildings: world.buildings.filter(item => ['logger', 'sawmill'].includes(item.type)).map(item => ({
          type: item.type,
          household: item.household?.name || null,
          cash: item.household?.cash || null,
          marketId: item.marketId,
          inventory: item.inventory,
          activity: item.activity,
          idleReason: item.idleReason
        })),
        events: world.events.slice(0, 10)
      };
    })()`));
  }
  assert.equal(await page.evaluate("window.__SHIOJI__.world.seals.timber"), true);

  await page.evaluate("window.__SHIOJI__.state.speedIndex = 0; document.querySelector('[data-contract=timber_charter]').click()");
  const chapterThreeBuild = await page.evaluate(`(() => {
    const world = window.__SHIOJI__.world;
    const results = [
      world.placeBuilding('farm', 22, 14).ok,
      world.placeBuilding('farm', 24, 15).ok,
      world.placeBuilding('market', 20, 11).ok,
      world.placeBuilding('tradehouse', 18, 10).ok,
      world.placeBuilding('workshop', 12, 11).ok,
      world.planRoad({x:20,y:10}, {x:20,y:10}).ok,
      world.planRoad({x:22,y:10}, {x:22,y:13}).ok,
      world.planRoad({x:23,y:13}, {x:24,y:14}).ok,
      world.planRoad({x:12,y:10}, {x:12,y:10}).ok
    ];
    return results;
  })()`);
  assert.equal(chapterThreeBuild.every(Boolean), true);
  await page.evaluate("window.__SHIOJI__.state.speedIndex = 2");

  for (let attempt = 0; attempt < 120; attempt += 1) {
    await wait(100);
    const status = await page.evaluate(`({
      ready: window.__SHIOJI__.world.independenceStatus.ready,
      paused: window.__SHIOJI__.world.pausedForDecision,
      hasChoice: Boolean(document.querySelector('[data-contract=timber_charter]'))
    })`);
    if (status.ready) break;
    if (status.paused && status.hasChoice) {
      await page.evaluate("window.__SHIOJI__.state.speedIndex = 0; document.querySelector('[data-contract=timber_charter]').click(); window.__SHIOJI__.state.speedIndex = 2");
    }
  }
  assert.equal(await page.evaluate("window.__SHIOJI__.world.independenceStatus.ready"), true);
  assert.ok(await page.evaluate("window.__SHIOJI__.world.day <= 180"));
  await page.evaluate("window.__SHIOJI__.state.speeds[2] = 4; window.__SHIOJI__.state.speedIndex = 2");
  await wait(300);
  await page.screenshot("late-island-desktop.png");
  await page.evaluate("document.querySelector('#home-button').click()");
  assert.equal(await page.evaluate("Boolean(document.querySelector('[data-independence]'))"), true);
  await page.screenshot("independence-ready-desktop.png");
  await page.evaluate("document.querySelector('[data-independence]').click()");
  assert.equal(await page.evaluate("window.__SHIOJI__.world.won"), true);
  await page.screenshot("victory-desktop.png");
  assert.deepEqual(page.exceptions, []);
  page.close();
}

async function mobileFlow() {
  const page = await newPage();
  await setViewport(page, 390, 844, true);
  await navigate(page);
  await page.screenshot("title-mobile.png");
  assert.equal(await page.evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
  await page.evaluate("document.querySelector('#new-game-button').click()");
  await wait(250);
  await page.screenshot("initial-mobile.png");
  assert.equal(await page.evaluate("document.querySelector('#build-dock').getBoundingClientRect().width <= innerWidth"), true);
  assert.equal(await page.evaluate("document.querySelector('#pause-button').getBoundingClientRect().right <= innerWidth"), true);
  assert.deepEqual(page.exceptions, []);
  page.close();
}

await desktopFlow();
await mobileFlow();
console.log("SHIOJI Chrome interaction smoke: PASS");
