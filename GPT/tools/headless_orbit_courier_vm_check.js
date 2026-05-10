const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "game", "orbit_courier", "game.js"), "utf8");

const listeners = new Map();
const frameQueue = [];
let now = 1000;

function addListener(target, type, handler) {
  const key = `${target}:${type}`;
  if (!listeners.has(key)) listeners.set(key, []);
  listeners.get(key).push(handler);
}

function dispatch(target, type, event = {}) {
  const key = `${target}:${type}`;
  const handlers = listeners.get(key) || [];
  const e = {
    key: event.key || "",
    code: event.code || "",
    repeat: Boolean(event.repeat),
    bubbles: true,
    cancelable: true,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {
      this.stopped = true;
    },
    ...event,
  };
  for (const handler of handlers) handler(e);
}

function makeElement(id) {
  const classes = new Set();
  return {
    id,
    textContent: "",
    innerHTML: "",
    className: "",
    type: "",
    style: {},
    children: [],
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); },
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener(type, handler) {
      addListener(id, type, handler);
    },
    dispatchEvent(event) {
      dispatch(id, event.type || "event", event);
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 960, height: 640 };
    },
  };
}

function makeContext() {
  const gradient = { addColorStop() {} };
  return {
    globalAlpha: 1,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    clearRect() {},
    fillRect() {},
    strokeRect() {},
    fillText() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    arc() {},
    arcTo() {},
    fill() {},
    stroke() {},
    setLineDash() {},
    createRadialGradient() { return gradient; },
    getImageData() { return { data: [11, 15, 19, 255] }; },
  };
}

const elements = new Map();
for (const id of ["game", "overlay", "overlayText", "missionChoices", "startButton", "pauseButton", "resetButton", "score", "day", "cargo", "cargoStrip", "combo", "comboMeter", "mission", "weather", "hullMeter"]) {
  elements.set(id, makeElement(id));
}
elements.get("game").width = 960;
elements.get("game").height = 640;
elements.get("game").getContext = () => makeContext();

const document = {
  body: { appendChild() {} },
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, makeElement(id));
    return elements.get(id);
  },
  createElement(tag) {
    return makeElement(tag);
  },
};

const window = {
  location: { search: "" },
  addEventListener(type, handler) {
    addListener("window", type, handler);
  },
  dispatchEvent(event) {
    dispatch("window", event.type || "event", event);
  },
};

const context = vm.createContext({
  console,
  document,
  window,
  URLSearchParams,
  KeyboardEvent: class {
    constructor(type, init = {}) {
      this.type = type;
      Object.assign(this, init);
    }
  },
  PointerEvent: class {
    constructor(type, init = {}) {
      this.type = type;
      Object.assign(this, init);
    }
  },
  performance: {
    now() {
      return now;
    },
  },
  requestAnimationFrame(callback) {
    frameQueue.push(callback);
  },
  setTimeout,
  Math,
});

context.globalThis = context;

function step(frames = 1) {
  for (let i = 0; i < frames; i += 1) {
    const callback = frameQueue.shift();
    if (!callback) return;
    now += 16.67;
    callback(now);
  }
}

vm.runInContext(source, context, { filename: "game/orbit_courier/game.js" });

const before = context.window.__orbitCourier.snapshot();
dispatch("window", "keydown", { key: " ", code: "Space", repeat: false });
step(5);
const afterSpace = context.window.__orbitCourier.snapshot();
step(220);
const afterLongFlight = context.window.__orbitCourier.snapshot();

const report = {
  before,
  afterSpace,
  afterLongFlight,
  launchStartsFreeFlight: afterSpace.ship.freeTime > 0,
  remainsInGame: afterLongFlight.running && afterLongFlight.overlayHidden,
  noWallBounceLoop: afterLongFlight.ship.x >= -1 && afterLongFlight.ship.x <= 961 && afterLongFlight.ship.y >= -1 && afterLongFlight.ship.y <= 641,
};

console.log(JSON.stringify(report, null, 2));

if (!afterSpace.running || !afterSpace.overlayHidden || !report.launchStartsFreeFlight || !report.remainsInGame || !report.noWallBounceLoop) {
  process.exit(1);
}
