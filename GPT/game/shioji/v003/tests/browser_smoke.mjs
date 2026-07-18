import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CDP = process.env.CHARTER_CDP || 'http://127.0.0.1:9226';
const GAME = process.env.CHARTER_URL || 'http://localhost:8431/game/shioji/v003/';
const artifacts = path.join(path.dirname(fileURLToPath(import.meta.url)), 'artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

class Page {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 1;
    this.pending = new Map();
    this.errors = [];
  }
  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result);
      } else if (message.method === 'Runtime.exceptionThrown') {
        this.errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      }
    });
    await this.send('Page.enable');
    await this.send('Runtime.enable');
  }
  send(method, params = {}) {
    const id = this.id++;
    const promise = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.ws.send(JSON.stringify({ id, method, params }));
    return promise;
  }
  async eval(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }
  async screenshot(file) {
    const result = await this.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(path.join(artifacts, file), Buffer.from(result.data, 'base64'));
  }
  async click(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }
  close() { this.ws.close(); }
}

async function newPage(width, height, mobile = false, url = GAME) {
  const pages = await fetch(`${CDP}/json/list`).then(response => response.json());
  const target = [...pages].reverse().find(page => page.type === 'page' && page.url.includes('/game/shioji/v003/'))
    || await fetch(`${CDP}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then(response => response.json());
  const page = new Page(target.webSocketDebuggerUrl);
  await page.connect();
  await page.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: mobile ? 2 : 1, mobile,
    screenWidth: width, screenHeight: height,
  });
  await page.send('Page.navigate', { url });
  for (let i = 0; i < 80; i++) {
    await wait(100);
    if (await page.eval("document.readyState === 'complete' && Boolean(window.__CHARTER__)")) return page;
  }
  throw new Error(`game did not load; runtime errors: ${page.errors.join(' | ') || 'none'}`);
}

async function desktop() {
  const page = await newPage(1440, 900);
  assert.equal(await page.eval('document.title'), 'CHARTER ISLE — 潮路の島 v003');
  assert.equal(await page.eval("document.querySelector('#opening').hidden"), false);
  assert.equal(await page.eval("document.querySelector('[data-testid=build-version]').textContent"), 'Build v003.2.0-material-shapes');
  const materialShapeCalls = await page.eval(`(() => {
    const renderer = window.__CHARTER__.renderer;
    const originalContext = renderer.ctx;
    const recorder = () => {
      const calls = [];
      const ctx = new Proxy({}, {
        set: () => true,
        get: (_, method) => (...args) => calls.push({ method, args }),
      });
      return { calls, ctx };
    };
    const logs = recorder();
    const boards = recorder();
    try {
      renderer.ctx = logs.ctx;
      renderer.drawLogsAt(40, 40, 4, 1);
      renderer.ctx = boards.ctx;
      renderer.drawBoardsAt(40, 40, 4, 1);
    } finally {
      renderer.ctx = originalContext;
    }
    const count = (record, method) => record.calls.filter(call => call.method === method).length;
    return {
      logEllipses: count(logs, 'ellipse'),
      logRectangles: count(logs, 'fillRect'),
      boardEllipses: count(boards, 'ellipse'),
      boardRectangles: count(boards, 'fillRect'),
    };
  })()`);
  assert.ok(materialShapeCalls.logEllipses >= 2, '丸太は円形の木口と年輪を持つ');
  assert.equal(materialShapeCalls.logRectangles, 0, '丸太を角材として描かない');
  assert.equal(materialShapeCalls.boardEllipses, 0, '製材を円柱として描かない');
  assert.ok(materialShapeCalls.boardRectangles >= 2, '製材は薄い角材を積んだ束として描く');
  assert.equal(await page.eval('document.documentElement.scrollWidth <= innerWidth'), true);
  await page.screenshot('opening-desktop.png');

  await page.eval("document.querySelector('#begin-button').click()");
  await page.eval('window.__CHARTER__.world.beginCharter(); window.__CHARTER__.world.setSpeed(1)');
  await wait(350);
  assert.equal(await page.eval("document.querySelector('#opening').hidden"), true);
  assert.equal(await page.eval("getComputedStyle(document.querySelector('#tracking')).display"), 'none', '追跡していない時は追跡帯を表示しない');
  assert.equal(await page.eval("document.body.innerText.includes('盤面')"), false, '世界内文言に開発語を出さない');
  assert.equal(await page.eval("document.querySelector('#funds-value').textContent"), '1,200');
  assert.equal(await page.eval("getComputedStyle(document.querySelector('#world')).cursor"), 'default', '通常時は手カーソルを表示しない');

  await page.eval("document.querySelector('[data-tool=road]').click()");
  assert.equal(await page.eval("getComputedStyle(document.querySelector('#world')).cursor"), 'crosshair', '建設時は照準カーソルを表示する');
  const roadStart = await page.eval('window.__CHARTER__.renderer.project(13.5,11.5)');
  const roadEnd = await page.eval('window.__CHARTER__.renderer.project(13.5,8.5)');
  await page.click(roadStart.x, roadStart.y);
  assert.deepEqual(await page.eval('window.__CHARTER__.state.roadAnchor'), { x: 13, y: 11 }, '一度目のタップが道路始点になる');
  await page.click(roadEnd.x, roadEnd.y);
  await page.eval('window.__CHARTER__.updateTutorial()');
  await wait(250);
  assert.equal(await page.eval("window.__CHARTER__.world.roads.has('13,8')"), true, '二度目のタップまで直線道路を延ばす');
  assert.ok(await page.eval('window.__CHARTER__.state.tutorial >= 1'));

  await page.eval("document.querySelector('[data-category=production]').click(); document.querySelector('[data-tool=logger]').click()");
  const loggerPoint = await page.eval('window.__CHARTER__.renderer.project(14.5,6.5)');
  await page.click(loggerPoint.x, loggerPoint.y);
  await wait(250);
  assert.equal(await page.eval("window.__CHARTER__.world.buildingsByType('logger').length"), 1);
  assert.equal(await page.eval("[...window.__CHARTER__.world.occupied.values()].filter(id => id === window.__CHARTER__.world.getBuildingByType('logger').id).length"), 9, '3×3を実占有する');

  await page.eval('for(let i=0;i<90;i++) window.__CHARTER__.world.update(.1)');
  await page.eval('window.__CHARTER__.updateTutorial()');
  await wait(300);
  assert.ok(await page.eval('window.__CHARTER__.state.tutorial >= 3'));
  await page.eval("document.querySelector('[data-category=production]').click(); document.querySelector('[data-tool=woodshop]').click()");
  const woodshopPoint = await page.eval('window.__CHARTER__.renderer.project(14.5,9.5)');
  await page.click(woodshopPoint.x, woodshopPoint.y);
  await wait(250);
  assert.equal(await page.eval("window.__CHARTER__.world.buildingsByType('woodshop').length"), 1);

  await page.eval(`(() => {
    const c=window.__CHARTER__, w=c.world, l=w.getBuildingByType('logger'), s=w.getBuildingByType('woodshop');
    w.addInventory(l,'output','log',8);
    w.dispatchOnce();
    for(let i=0;i<8;i++) w.update(.1);
    const shipment=w.shipments.find(x=>x.good==='log' && x.targetId===s.id);
    if(shipment) c.startTracking(shipment);
  })()`);
  await wait(300);
  assert.equal(await page.eval("document.querySelector('#tracking').hidden"), false, '任意操作で荷車追跡を開始する');
  assert.equal(await page.eval('window.__CHARTER__.world.speedIndex'), 1, '追跡中は読める通常速度へ落とす');
  await page.screenshot('tracked-log-desktop.png');

  await page.eval('for(let i=0;i<220;i++) window.__CHARTER__.world.update(.1)');
  await wait(450);
  assert.ok(await page.eval("(window.__CHARTER__.world.stats.deliveredTo['woodshop:log']||0)>0"));
  await page.eval("if(!document.querySelector('#tracking').hidden) window.__CHARTER__.stopTracking(true)");
  assert.equal(await page.eval("document.querySelector('#tracking').hidden"), true, '到着後に追跡を終え元のカメラへ戻る');

  await page.eval('for(let i=0;i<150;i++) window.__CHARTER__.world.update(.1)');
  await wait(350);
  await page.eval("window.__CHARTER__.selectBuilding(window.__CHARTER__.world.getBuildingByType('woodshop'))");
  await page.eval(`(() => {
    const c = window.__CHARTER__;
    const woodshop = c.world.getBuildingByType('woodshop');
    c.renderer.zoom = 1.45;
    c.renderer.focus(woodshop.x + 1.5, woodshop.y + 2.15, true);
  })()`);
  await wait(180);
  await page.screenshot('material-shapes-desktop.png');
  assert.match(await page.eval("document.querySelector('#selection-body').innerText"), /等級0/);
  assert.match(await page.eval("document.querySelector('#selection-body').innerText"), /入荷棚/);
  assert.match(await page.eval("document.querySelector('#selection-body').innerText"), /出荷場/);
  const upgradeEnabled = await page.eval("Boolean(document.querySelector('[data-selection-action=upgrade]') && !document.querySelector('[data-selection-action=upgrade]').disabled)");
  assert.equal(upgradeEnabled, true);
  await page.eval("document.querySelector('[data-selection-action=upgrade]').click()");
  await page.eval('for(let i=0;i<100;i++) window.__CHARTER__.world.update(.1)');
  await wait(350);
  assert.equal(await page.eval("window.__CHARTER__.world.getBuildingByType('woodshop').grade"), 1, '実在する木製品で増築する');
  await page.screenshot('grade-one-desktop.png');
  await page.eval("window.__CHARTER__.world.getBuildingByType('woodshop').grade=4; window.__CHARTER__.renderSelection()");
  await wait(180);
  assert.match(await page.eval("document.querySelector('#selection').innerText"), /等級4・石造工房/, '最終等級を石造工房として表示する');
  await page.screenshot('grade-four-desktop.png');

  await page.eval(`(() => {
    const c=window.__CHARTER__, w=c.world;
    w.setChapterStage(6); c.state.tutorial=6;
    w.ship.state='away'; w.ship.nextDay=w.day+999;
    for(let i=0;i<350;i++) w.update(.1);
  })()`);
  await wait(400);
  assert.ok(await page.eval("window.__CHARTER__.world.sectionAmount(window.__CHARTER__.world.getBuildingByType('port'),'outbound','boards')>0"), '港へ届いた木製品が輸出ヤードに積まれる');
  await page.eval("window.__CHARTER__.renderer.focus(4,15,true); window.__CHARTER__.selectBuilding(window.__CHARTER__.world.getBuildingByType('port'))");
  await wait(250);
  await page.screenshot('port-yard-desktop.png');
  await page.eval(`(() => {
    const w=window.__CHARTER__.world;
    w.ship.state='away'; w.ship.nextDay=w.day;
    for(let i=0;i<250;i++) w.update(.1);
  })()`);
  await wait(450);
  assert.ok(await page.eval("(window.__CHARTER__.world.stats.exported.boards||0)>0"), '船が港の山から木製品を積む');
  assert.ok(await page.eval("window.__CHARTER__.world.ledger.some(row=>row.kind==='export'&&row.amount>0)"));
  assert.ok(await page.eval("window.__CHARTER__.world.ledger.some(row=>row.kind==='import'&&row.amount<0)"));
  await page.eval("document.querySelector('[data-close=letter-view]').click(); document.querySelector('[data-close=selection]').click(); document.querySelector('#open-ledger').click()");
  await wait(250);
  assert.match(await page.eval("document.querySelector('#ledger').innerText"), /直近7日・収入/);
  assert.match(await page.eval("document.querySelector('#ledger').innerText"), /直近7日・支出/);
  await page.screenshot('ledger-desktop.png');

  assert.deepEqual(page.errors, []);
  page.close();
}

async function mobile() {
  const page = await newPage(390, 844, true);
  assert.equal(await page.eval('document.documentElement.scrollWidth <= innerWidth'), true);
  const openingRect = await page.eval(`(() => { const r=document.querySelector('.opening-card').getBoundingClientRect(); return {left:r.left,right:r.right,bottom:r.bottom}; })()`);
  assert.ok(openingRect.left >= 0 && openingRect.right <= 390, JSON.stringify(openingRect));
  await page.screenshot('opening-mobile.png');
  await page.eval("document.querySelector('#begin-button').click()");
  await wait(350);
  assert.equal(await page.eval("getComputedStyle(document.querySelector('#tracking')).display"), 'none', 'スマホでも未追跡の帯を隠す');
  assert.equal(await page.eval("document.querySelector('#hud').getBoundingClientRect().right <= innerWidth"), true);
  assert.equal(await page.eval("document.querySelector('#build-dock').getBoundingClientRect().right <= innerWidth"), true);
  assert.ok(await page.eval("document.querySelector('[data-tool=road]').getBoundingClientRect().height >= 44"), 'スマホの道路操作領域を44px以上にする');
  await page.eval("document.querySelector('[data-tool=road]').click()");
  const start = await page.eval('window.__CHARTER__.renderer.project(13.5,11.5)');
  await page.click(start.x, start.y);
  assert.deepEqual(await page.eval('window.__CHARTER__.state.roadAnchor'), { x: 13, y: 11 });
  assert.equal(await page.eval("document.querySelector('#tool-hint').getBoundingClientRect().right <= innerWidth"), true);
  await page.screenshot('game-mobile.png');
  assert.deepEqual(page.errors, []);
  page.close();
}

await desktop();
await mobile();
const redirectPage = await newPage(800, 600, false, 'http://localhost:8431/game/shioji/');
assert.match(await redirectPage.eval('location.pathname'), /\/game\/shioji\/v003\/$/, '公開入口はv003へ移動する');
redirectPage.close();
console.log('CHARTER ISLE v003 browser smoke: PASS');
