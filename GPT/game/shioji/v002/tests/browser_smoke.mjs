import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CDP = process.env.CHARTER_CDP || 'http://127.0.0.1:9225';
const GAME = process.env.CHARTER_URL || 'http://localhost:8420/game/shioji/v002/';
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
      const msg = JSON.parse(event.data);
      if (msg.id) {
        const p = this.pending.get(msg.id);
        if (!p) return;
        this.pending.delete(msg.id);
        msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') this.errors.push(msg.params.exceptionDetails.text);
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
    const out = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (out.exceptionDetails) throw new Error(out.exceptionDetails.text);
    return out.result.value;
  }
  async screenshot(file) {
    const out = await this.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(path.join(artifacts, file), Buffer.from(out.data, 'base64'));
  }
  async click(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }
  close() { this.ws.close(); }
}

async function newPage(width, height, mobile = false) {
  const target = await fetch(`${CDP}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then(r => r.json());
  const page = new Page(target.webSocketDebuggerUrl);
  await page.connect();
  await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile, screenWidth: width, screenHeight: height });
  await page.send('Page.navigate', { url: GAME });
  for (let i = 0; i < 50; i++) {
    await wait(100);
    if (await page.eval("document.readyState === 'complete' && Boolean(window.__CHARTER__)")) return page;
  }
  throw new Error('game did not load');
}

const BASE = [
  ['fisher', 23, 32], ['fisher', 27, 32], ['veg', 22, 30], ['wheat', 21, 28],
  ['logger', 27, 26], ['woodshop', 24, 30], ['charburner', 26, 29], ['saltworks', 26, 31],
];

const BASE_ROADS = [
  ...Array.from({ length: 10 }, (_, i) => [25, 26 + i]),
  [24, 32], [26, 32], [24, 31], [23, 30], [22, 29],
  [26, 27], [24, 29], [23, 29], [22, 32], [23, 31],
];

async function desktop() {
  const page = await newPage(1440, 900);
  assert.equal(await page.eval('document.title'), 'CHARTER ISLE — 潮路の島');
  assert.equal(await page.eval("getComputedStyle(document.querySelector('#opening')).display !== 'none'"), true);
  assert.equal(await page.eval('document.documentElement.scrollWidth <= innerWidth'), true);
  await page.screenshot('opening-desktop.png');
  await page.eval("document.querySelector('#begin-button').click()");
  await wait(300);
  assert.equal(await page.eval("document.querySelector('#opening').hidden"), true);
  assert.equal(await page.eval('window.__CHARTER__.ship.state'), 'departing');

  assert.deepEqual(await page.eval('window.__CHARTER__.snapRoadEnd([25,32],[29,33])'), [29, 32], '浅い線は水平8方向へ吸着する');
  assert.deepEqual(await page.eval('window.__CHARTER__.snapRoadEnd([25,32],[29,35])'), [29, 36], '斜め線は45度方向へ吸着する');
  assert.deepEqual(await page.eval(`[[30,32],[20,32],[25,37],[25,27],[30,37],[20,27],[30,27],[20,37]].map(p => window.__CHARTER__.snapRoadEnd([25,32],p))`),
    [[30,32],[20,32],[25,37],[25,27],[30,37],[20,27],[30,27],[20,37]], '8方向すべてへ正確に吸着する');
  assert.equal(await page.eval("window.__CHARTER__.world.canPlace('veg',5,5)[0]"), false, '道路から離れた建物を拒否する');

  await page.eval("document.querySelector('[data-category=logistics]').click()");
  await page.eval("document.querySelector('[data-tool=road]').click()");
  const roadStart = await page.eval('window.__CHARTER__.renderer.project(24,32)');
  const roadEnd = await page.eval('window.__CHARTER__.renderer.project(18,26)');
  await page.click(roadStart.x, roadStart.y);
  assert.deepEqual(await page.eval('window.__CHARTER__.state.roadAnchor'), [24, 32], '一度目のタップで道路の始点を保持する');
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: roadEnd.x, y: roadEnd.y });
  await wait(180);
  assert.equal(await page.eval('window.__CHARTER__.state.roadPreview.connects'), true, '完成予定線の市場接続をプレビューする');
  assert.match(await page.eval("document.querySelector('#tool-hint').textContent"), /市場へ接続/);
  assert.match(await page.eval("document.querySelector('#tool-hint').textContent"), /賃金約1,440.*18人日/, '道路見積を会社資金と同じ換算で表示する');
  await page.screenshot('roads-preview-desktop.png');
  await page.click(roadEnd.x, roadEnd.y);
  assert.equal(await page.eval('window.__CHARTER__.world.sites.length'), 6, '二度目のタップで連続道路を計画する');
  await page.eval('window.__CHARTER__.removeRoadLine([23,31],[18,26])');
  assert.equal(await page.eval('window.__CHARTER__.world.sites.length'), 0, '計画道路も撤去ツールの対象になる');

  const point = await page.eval('window.__CHARTER__.renderer.project(23,32)');
  await page.eval("document.querySelector('[data-category=life]').click()");
  await page.eval("document.querySelector('[data-tool=fisher]').click()");
  await page.click(point.x, point.y);
  assert.equal(await page.eval("window.__CHARTER__.world.zones.some(z => z.job === 'fisher' && z.x === 23 && z.y === 32)"), true, 'canvas click places a zone');
  await page.eval(`(() => {
    const c = window.__CHARTER__;
    c.world.seedRoads(${JSON.stringify(BASE_ROADS)});
    const base = ${JSON.stringify(BASE.slice(1))};
    for (const [job,x,y] of base) c.placeBuilding(job,x,y);
    c.planRoadLine([25,32],[27,26]);
    for (let i=0;i<16;i++) c.world.step();
    window.__cameraBeforeArrival = {x:c.renderer.panX,y:c.renderer.panY};
    for (let i=0;i<100;i++) c.ship.update(.1,c.world.day);
    c.updateHud();
  })()`);
  await wait(500);
  assert.ok(await page.eval('window.__CHARTER__.world.pop() > 0'));
  assert.equal(await page.eval('window.__CHARTER__.ship.state'), 'docked');
  assert.deepEqual(await page.eval('({x:window.__CHARTER__.renderer.panX,y:window.__CHARTER__.renderer.panY})'), await page.eval('window.__cameraBeforeArrival'), '定期便はプレイヤーのカメラを奪わない');
  assert.equal(await page.eval("document.body.innerText.includes('デナリ')"), false, '不自然な通貨接尾辞を表示しない');
  assert.match(await page.eval("document.querySelector('#money-value').textContent"), /\d/);
  assert.equal(await page.eval("document.querySelector('#opening').hidden && document.querySelector('#letter-view').hidden"), true, '船の入港で強制モーダルを出さない');
  assert.match(await page.eval("document.querySelector('#desk-unread').textContent"), /書状 1/, '初回書状を文字付きで知らせる');
  assert.equal(await page.eval("document.querySelector('#open-desk').classList.contains('has-mail')"), true, '節目の未読中は秘書の肖像を脈動表示する');
  assert.equal(await page.eval("[...document.querySelectorAll('.toast-action')].some(b => b.textContent === '書状を読む')"), true, '初回書状に直接読む導線を出す');
  await page.screenshot('mail-notice-desktop.png');
  await page.eval("[...document.querySelectorAll('.toast-action')].find(b => b.textContent === '書状を読む').click()");
  assert.equal(await page.eval("document.querySelector('#letter-view').hidden"), false, '通知から書状を直接開ける');
  assert.match(await page.eval("document.querySelector('#letter-body').textContent"), /入植者名簿・第一陣/);
  assert.equal(await page.eval('window.__CHARTER__.state.speed'), 1, '書状を開いても時間速度を強制変更しない');
  await page.eval("document.querySelector('[data-close=letter-view]').click()");
  await page.screenshot('settlement-desktop.png');
  await page.eval(`(() => {
    const c = window.__CHARTER__;
    for (let i=0;i<150;i++) {
      if (c.world.order) c.world.stockTgt[c.world.order.g] = Math.max(c.world.stockTgt[c.world.order.g] || 0, Math.ceil((c.world.stock[c.world.order.g] || 0) + c.world.order.left));
      c.world.stockTgt.wheat = Math.max(c.world.stockTgt.wheat || 0, Math.round(c.world.pop() * 2));
      c.world.step();
      c.ship.update(.4,c.world.day);
    }
    c.renderer.focus(c.world.market.x,c.world.market.y,true);
    c.updateHud();
  })()`);
  await wait(700);
  assert.ok(await page.eval('window.__CHARTER__.world.pop() >= 40'), '成長後に40人以上が暮らす');
  assert.ok(await page.eval(`Object.values(window.__CHARTER__.world.stalls).reduce((n,a)=>n+a.length,0) > 0`), '市場に現物在庫が並ぶ');
  assert.ok(await page.eval('window.__CHARTER__.world.roadStats.cartTrips > 0'), '接続道路上を積荷付き手荷車が往復する');
  assert.ok(await page.eval('(window.__CHARTER__.world.roadStats.deliveredBy.log || 0) + (window.__CHARTER__.world.roadStats.deliveredBy.tools || 0) > 2'), '木材系の配送を魚の荷車と区別して記録する');
  await page.eval(`(() => {
    const c=window.__CHARTER__;
    c.state.mail.filter(m => m.spotlight).forEach(m => { m.unread=false; });
    c.updateHud();
  })()`);
  assert.equal(await page.eval('window.__CHARTER__.state.mail.some(m => m.unread && !m.spotlight)'), true, '通常の監査書状は未読件数へ残る');
  assert.equal(await page.eval("document.querySelector('#open-desk').classList.contains('has-mail')"), false, '通常書状だけでは秘書の肖像を脈動させない');
  await page.eval(`(() => {
    const c=window.__CHARTER__;
    c.state.objective=4;
    c.world.roadStats.cartTripsBy={fish:10};
    c.world.roadStats.deliveredBy={fish:100};
    c.updateHud();
  })()`);
  assert.equal(await page.eval('window.__CHARTER__.state.objective'), 4, '魚の荷車だけでは木材教程を達成しない');
  assert.equal(await page.eval("document.body.innerText.includes('島は盤面で先に困り始めます')"), false, '次の一手が不明な抽象案内を表示しない');
  await page.eval(`(() => { const c=window.__CHARTER__; c.world.roadStats.cartTripsBy.log=1; c.world.roadStats.deliveredBy.log=3; c.updateHud(); })()`);
  assert.ok(await page.eval('window.__CHARTER__.state.objective > 4'), '丸太の実配送で木材教程が進む');
  await page.eval(`(() => {
    const c=window.__CHARTER__;
    document.querySelector('#letter-view').hidden=true;
    c.state.objective=5;
    c.world.f30={fish:{prod:10,imp:0},veg:{prod:4,imp:0},wheat:{prod:4,imp:0},tools:{prod:2,imp:0}};
    c.updateHud();
  })()`);
  await wait(450);
  assert.equal(await page.eval("document.querySelector('#letter-view').hidden"), false, '章の達成書状だけは自動で開く');
  assert.match(await page.eval("document.querySelector('#letter-body').textContent"), /会社の店から、島の市場へ/);
  await page.eval("document.querySelector('[data-close=letter-view]').click()");
  await page.screenshot('flow-desktop.png');
  await page.eval(`(() => {
    const c = window.__CHARTER__;
    c.setSpeed(0);
    const h = c.world.hhs.find(x => x.roadConnected && x.state === 'home') || c.world.hhs.find(x => x.roadConnected);
    h.state = 'home'; h.px = h.x; h.py = h.y;
    const good = {fisher:'fish',veg:'veg',wheat:'wheat',logger:'log',woodshop:'tools',charburner:'char',saltworks:'salt'}[h.job] || 'wheat';
    h.pantry[good] += 80;
    c.world.startMarketTrip(h, {[good]: 40});
    c.world.stepToMarket(h); c.world.stepToMarket(h);
    c.state.selected = h;
    c.renderer.focus(h.px, h.py, true);
    c.updateHud();
  })()`);
  await wait(180);
  assert.equal(await page.eval('window.__CHARTER__.state.selected.tripVehicle'), 'cart');
  await page.screenshot('loaded-cart-desktop.png');
  assert.deepEqual(page.errors, []);
  page.close();
}

async function mobile() {
  const page = await newPage(390, 844, true);
  assert.equal(await page.eval('document.documentElement.scrollWidth <= innerWidth'), true, 'opening fits mobile width');
  const openingRect = await page.eval(`(() => { const r=document.querySelector('.opening-card').getBoundingClientRect(); return {left:r.left,right:r.right,width:r.width}; })()`);
  assert.ok(openingRect.left >= 0 && openingRect.right <= 390, JSON.stringify(openingRect));
  await page.screenshot('opening-mobile.png');
  await page.eval("document.querySelector('#begin-button').click()");
  await wait(350);
  assert.equal(await page.eval("document.querySelector('#build-dock').getBoundingClientRect().right <= innerWidth"), true);
  assert.equal(await page.eval("document.querySelector('#hud').getBoundingClientRect().right <= innerWidth"), true);
  assert.ok(await page.eval("document.querySelector('[data-tool=fisher]').getBoundingClientRect().height >= 44"));
  await page.eval("document.querySelector('[data-category=logistics]').click()");
  assert.ok(await page.eval("document.querySelector('[data-tool=road]').getBoundingClientRect().height >= 44"), 'スマホでも道路ボタンのタップ領域を確保する');
  assert.ok(await page.eval("document.querySelector('[data-tool=roadRemove]').getBoundingClientRect().height >= 44"), 'スマホでも撤去ボタンのタップ領域を確保する');
  await page.eval("document.querySelector('[data-tool=road]').click()");
  const start = await page.eval('window.__CHARTER__.renderer.project(24,32)');
  await page.click(start.x, start.y);
  assert.deepEqual(await page.eval('window.__CHARTER__.state.roadAnchor'), [24, 32], 'スマホ相当でも一タップ目を始点として保持する');
  assert.equal(await page.eval("document.querySelector('#tool-hint').textContent.includes('0区画')"), false, '始点指定時に無意味な0区画見積を出さない');
  const hintRect = await page.eval(`(() => { const r=document.querySelector('#tool-hint').getBoundingClientRect(); return {left:r.left,right:r.right,bottom:r.bottom}; })()`);
  assert.ok(hintRect.left >= 0 && hintRect.right <= 390, JSON.stringify(hintRect));
  await page.screenshot('game-mobile.png');
  assert.deepEqual(page.errors, []);
  page.close();
}

await desktop();
await mobile();
console.log('CHARTER ISLE browser smoke: PASS');
