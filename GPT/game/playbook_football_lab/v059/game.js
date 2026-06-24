(() => {
  "use strict";

  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d");
  const playList = document.getElementById("playList");
  const defenseList = document.getElementById("defenseList");
  const defenseEditButton = document.getElementById("defenseEditButton");
  const dutyEditButton = document.getElementById("dutyEditButton");
  const targetEditButton = document.getElementById("targetEditButton");
  const previewLayerToggle = document.getElementById("previewLayerToggle");
  const manLayerToggle = document.getElementById("manLayerToggle");
  const zoneLayerToggle = document.getElementById("zoneLayerToggle");
  const defenderSelect = document.getElementById("defenderSelect");
  const dutySelect = document.getElementById("dutySelect");
  const targetSelect = document.getElementById("targetSelect");
  const applyDefenderButton = document.getElementById("applyDefenderButton");
  const defenseNameInput = document.getElementById("defenseNameInput");
  const defenseSlotList = document.getElementById("defenseSlotList");
  const saveDefenseButton = document.getElementById("saveDefenseButton");
  const newDefenseButton = document.getElementById("newDefenseButton");
  const duplicateDefenseButton = document.getElementById("duplicateDefenseButton");
  const moveDefenseUpButton = document.getElementById("moveDefenseUpButton");
  const moveDefenseDownButton = document.getElementById("moveDefenseDownButton");
  const resetDefenseButton = document.getElementById("resetDefenseButton");
  const deleteLookStatus = document.getElementById("deleteLookStatus");
  const snapButton = document.getElementById("snapButton");
  const editButton = document.getElementById("editButton");
  const addPointButton = document.getElementById("addPointButton");
  const deletePointButton = document.getElementById("deletePointButton");
  const savePlayButton = document.getElementById("savePlayButton");
  const saveNameInput = document.getElementById("saveNameInput");
  const saveSlotButton = document.getElementById("saveSlotButton");
  const moveSlotUpButton = document.getElementById("moveSlotUpButton");
  const moveSlotDownButton = document.getElementById("moveSlotDownButton");
  const deleteSlotButton = document.getElementById("deleteSlotButton");
  const slotList = document.getElementById("slotList");
  const speedButtons = Array.from(document.querySelectorAll(".speedButton"));
  const pauseButton = document.getElementById("pauseButton");
  const replayButton = document.getElementById("replayButton");
  const replayScrubber = document.getElementById("replayScrubber");
  const frameBackButton = document.getElementById("frameBackButton");
  const frameForwardButton = document.getElementById("frameForwardButton");
  const markerStrip = document.getElementById("markerStrip");
  const resetButton = document.getElementById("resetButton");
  const resultCard = document.getElementById("resultCard");
  const eventLog = document.getElementById("eventLog");
  const modeText = document.getElementById("modeText");
  const scoutCard = document.getElementById("scoutCard");
  const matchupCard = document.getElementById("matchupCard");
  const coverageCard = document.getElementById("coverageCard");
  const throwSlider = document.getElementById("throwSlider");
  const throwValue = document.getElementById("throwValue");
  const downText = document.getElementById("downText");
  const fieldText = document.getElementById("fieldText");
  const driveText = document.getElementById("driveText");
  const scoreText = document.getElementById("scoreText");

  const W = canvas.width;
  const H = canvas.height;
  const field = { x: 54, y: 58, w: 1012, h: 584 };
  const losX = field.x + field.w * 0.34;
  const yardPx = field.w / 100;
  const routeDuration = 3.6;
  const maxPlayTime = 6.2;
  const sackRadius = 22;
  const hitThrowRadius = 34;
  const blockRadius = 28;
  const deleteLookConfirmTimeoutMs = 3200;
  const replayMarkerActiveWindowFrames = 4;
  let deleteLookConfirmTimer = null;
  let deleteLookConfirmInterval = null;
  let deleteLookConfirmDeadline = 0;

  const plays = [
    {
      name: "Mesh Slant",
      note: "交差する短いルートでマンカバーを剥がす",
      routes: {
        X: [[0, 0], [98, -64], [234, -50]],
        Z: [[0, 0], [94, 56], [236, 44]],
        Y: [[0, 0], [82, -6], [176, -8]],
        H: [[0, 0], [74, 38], [166, 86]],
      },
    },
    {
      name: "Flood Boot",
      note: "右サイドに深中浅の3層を作る",
      routes: {
        X: [[0, 0], [78, -118], [236, -150]],
        Z: [[0, 0], [126, 20], [324, 14]],
        Y: [[0, 0], [96, -28], [220, -56]],
        H: [[0, 0], [58, 84], [196, 118]],
      },
    },
    {
      name: "Draw Screen",
      note: "ラッシュを誘ってRBへ遅いスクリーン",
      routes: {
        X: [[0, 0], [70, -92], [130, -142]],
        Z: [[0, 0], [60, 94], [126, 138]],
        Y: [[0, 0], [64, -8], [116, -16]],
        H: [[0, 0], [28, 60], [154, 96], [300, 116]],
      },
    },
  ];

  const defenseCalls = [
    { name: "Nickel Zone", note: "ゾーンが中間を締める。深い Flood に弱い", call: "zone" },
    { name: "Press Man", note: "外のWRに密着。交差ルートに弱い", call: "press" },
    { name: "Edge Blitz", note: "早い圧力。遅い展開を潰す", call: "blitz" },
  ];

  const counters = {
    "Mesh Slant": "press",
    "Flood Boot": "zone",
    "Draw Screen": "blitz",
  };

  const defenseScript = ["press", "zone", "blitz", "press", "blitz", "zone", "zone", "press", "blitz"];

  const baseOffense = [
    { id: "QB", role: "QB", x: losX - 46, y: field.y + field.h * 0.5, speed: 128, catch: 0 },
    { id: "X", role: "WR", x: losX - 4, y: field.y + field.h * 0.24, speed: 178, catch: 84 },
    { id: "Y", role: "TE", x: losX - 6, y: field.y + field.h * 0.43, speed: 142, catch: 80 },
    { id: "H", role: "RB", x: losX - 42, y: field.y + field.h * 0.63, speed: 154, catch: 76, power: 66 },
    { id: "Z", role: "WR", x: losX - 4, y: field.y + field.h * 0.78, speed: 184, catch: 82 },
  ];

  const baseLine = [
    { id: "LT", role: "OL", x: losX - 16, y: field.y + field.h * 0.43, speed: 76, power: 76 },
    { id: "C", role: "OL", x: losX - 18, y: field.y + field.h * 0.5, speed: 72, power: 82 },
    { id: "RT", role: "OL", x: losX - 16, y: field.y + field.h * 0.57, speed: 76, power: 76 },
  ];

  const defenseBase = [
    { id: "CB1", role: "CB", x: losX + 60, y: field.y + field.h * 0.24, speed: 170 },
    { id: "S", role: "S", x: losX + 208, y: field.y + field.h * 0.5, speed: 160 },
    { id: "LB", role: "LB", x: losX + 94, y: field.y + field.h * 0.47, speed: 134 },
    { id: "N", role: "N", x: losX + 34, y: field.y + field.h * 0.56, speed: 114 },
    { id: "CB2", role: "CB", x: losX + 60, y: field.y + field.h * 0.78, speed: 174 },
  ];

  const state = {
    selectedPlay: 0,
    selectedDefense: 0,
    actualDefense: null,
    edit: false,
    defenseEdit: false,
    dutyEdit: false,
    targetEdit: false,
    selectedDefender: "CB1",
    showPreviewLines: true,
    showManLinks: true,
    showZonePads: true,
    addPoint: false,
    deletePoint: false,
    running: false,
    t: 0,
    last: 0,
    throwTime: 2.2,
    ball: null,
    carrier: null,
    catchInfo: null,
    qbContact: null,
    offense: [],
    line: [],
    defense: [],
    logs: [],
    result: null,
    dragging: null,
    routeOverrides: {},
    savedRoutes: {},
    defenseOverrides: {},
    reads: [],
    down: 2,
    distance: 6,
    ballOn: 38,
    drive: 1,
    snap: 0,
    coachScore: 0,
    streak: 0,
    lastPlay: null,
    repeatCount: 0,
    speedScale: 0.45,
    paused: false,
    banner: null,
    replayFrames: [],
    replayMarkers: [],
    replayIndex: 0,
    replaying: false,
    replayLast: 0,
    previewDeltaMarker: null,
    previewDeltaBadge: null,
    screenReleaseLogged: false,
    preSnapPreview: null,
  };

  function activePlay() {
    return plays[state.selectedPlay];
  }

  function storageKey() {
    return "playbook-football-lab-routes-v059";
  }

  function defenseStorageKey() {
    return "playbook-football-lab-defense-v059";
  }

  function overlayStorageKey() {
    return "playbook-football-lab-overlays-v059";
  }

  function legacyStorageKey() {
    return "playbook-football-lab-routes-v058";
  }

  function cloneRoutes(routes) {
    const copy = {};
    for (const [id, pts] of Object.entries(routes || {})) {
      copy[id] = pts.map((pt) => [Number(pt[0]) || 0, Number(pt[1]) || 0]);
    }
    return copy;
  }

  function normalizeSavedRoutes(raw) {
    const normalized = {};
    for (const [playName, value] of Object.entries(raw || {})) {
      if (value && Array.isArray(value.slots)) {
        const slots = value.slots
          .filter((slot) => slot && slot.routes)
          .map((slot, index) => ({
            id: String(slot.id || `slot-${Date.now()}-${index}`),
            name: String(slot.name || `Variation ${index + 1}`).slice(0, 24),
            routes: cloneRoutes(slot.routes),
          }));
        normalized[playName] = {
          activeId: slots.some((slot) => slot.id === value.activeId) ? value.activeId : (slots[0] && slots[0].id) || null,
          slots,
        };
      } else if (value && typeof value === "object") {
        normalized[playName] = {
          activeId: "legacy-1",
          slots: [{ id: "legacy-1", name: "Saved 1", routes: cloneRoutes(value) }],
        };
      }
    }
    return normalized;
  }

  function normalizeDefenseOverrides(raw) {
    const normalized = {};
    for (const [callName, value] of Object.entries(raw || {})) {
      if (value && Array.isArray(value.slots)) {
        const slots = value.slots
          .filter((slot) => slot && slot.layout)
          .map((slot, index) => ({
            id: String(slot.id || `def-${Date.now()}-${index}`),
            name: String(slot.name || `Look ${index + 1}`).slice(0, 24),
            layout: slot.layout,
          }));
        normalized[callName] = {
          activeId: slots.some((slot) => slot.id === value.activeId) ? value.activeId : (slots[0] && slots[0].id) || null,
          slots,
        };
      } else if (value && typeof value === "object") {
        normalized[callName] = {
          activeId: "legacy-defense-1",
          slots: [{ id: "legacy-defense-1", name: "Saved 1", layout: value }],
        };
      }
    }
    return normalized;
  }

  function loadSavedRoutes() {
    try {
      const raw = localStorage.getItem(storageKey());
      const legacy = !raw ? localStorage.getItem(legacyStorageKey()) : null;
      state.savedRoutes = normalizeSavedRoutes(raw ? JSON.parse(raw) : legacy ? JSON.parse(legacy) : {});
    } catch {
      state.savedRoutes = {};
    }
  }

  function persistSavedRoutes() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state.savedRoutes));
      return true;
    } catch {
      return false;
    }
  }

  function loadDefenseOverrides() {
    try {
      const raw = localStorage.getItem(defenseStorageKey());
      state.defenseOverrides = normalizeDefenseOverrides(raw ? JSON.parse(raw) : {});
    } catch {
      state.defenseOverrides = {};
    }
  }

  function loadOverlayPrefs() {
    try {
      const raw = localStorage.getItem(overlayStorageKey());
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.reads === "boolean") state.showPreviewLines = data.reads;
      if (typeof data.man === "boolean") state.showManLinks = data.man;
      if (typeof data.zone === "boolean") state.showZonePads = data.zone;
    } catch (error) {
      console.warn("Failed to load overlay prefs", error);
    }
  }

  function persistOverlayPrefs() {
    try {
      localStorage.setItem(overlayStorageKey(), JSON.stringify({
        reads: state.showPreviewLines,
        man: state.showManLinks,
        zone: state.showZonePads,
      }));
      return true;
    } catch (error) {
      console.warn("Failed to persist overlay prefs", error);
      return false;
    }
  }

  function syncOverlayToggles() {
    if (previewLayerToggle) previewLayerToggle.checked = state.showPreviewLines;
    if (manLayerToggle) manLayerToggle.checked = state.showManLinks;
    if (zoneLayerToggle) zoneLayerToggle.checked = state.showZonePads;
  }

  function persistDefenseOverrides() {
    try {
      localStorage.setItem(defenseStorageKey(), JSON.stringify(state.defenseOverrides));
      return true;
    } catch {
      return false;
    }
  }

  function savedBookForPlay(playName = activePlay().name) {
    if (!state.savedRoutes[playName]) {
      state.savedRoutes[playName] = { activeId: null, slots: [] };
    }
    return state.savedRoutes[playName];
  }

  function activeSavedSlot(playName = activePlay().name) {
    const book = savedBookForPlay(playName);
    return book.slots.find((slot) => slot.id === book.activeId) || book.slots[0] || null;
  }

  function defenseBookForCall(callName = activeDefense().name) {
    if (!state.defenseOverrides[callName]) {
      state.defenseOverrides[callName] = { activeId: null, slots: [] };
    }
    return state.defenseOverrides[callName];
  }

  function activeDefenseSlot(callName = activeDefense().name) {
    const book = state.defenseOverrides[callName];
    if (!book) return null;
    return book.slots.find((slot) => slot.id === book.activeId) || book.slots[0] || null;
  }

  function nextDefenseSlotName(book = defenseBookForCall()) {
    return `Look ${book.slots.length + 1}`;
  }

  function uniqueDefenseSlotName(baseName, book = defenseBookForCall()) {
    const cleanBase = String(baseName || "Look").replace(/\s+Copy(?:\s+\d+)?$/, "").trim() || "Look";
    const names = new Set(book.slots.map((slot) => slot.name));
    const first = `${cleanBase} Copy`.slice(0, 24);
    if (!names.has(first)) return first;
    for (let index = 2; index < 100; index += 1) {
      const suffix = ` Copy ${index}`;
      const candidate = `${cleanBase.slice(0, Math.max(1, 24 - suffix.length))}${suffix}`;
      if (!names.has(candidate)) return candidate;
    }
    return nextDefenseSlotName(book);
  }

  function clampValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function defenseSlotSummary(slot) {
    if (!slot) return "No saved look";
    const layout = slot.layout || {};
    const duties = Object.values(layout).map((entry) => normalizeDuty(entry.trait)).filter(Boolean);
    const rushers = duties.filter((duty) => duty === "rush").length;
    const zones = duties.filter(isZoneDuty).length;
    const mans = duties.filter((duty) => duty === "man" || duty === "press").length;
    return `${rushers} rush / ${mans} man / ${zones} zone`;
  }

  function nextSlotName(book = savedBookForPlay()) {
    return `Variation ${book.slots.length + 1}`;
  }

  function routeSlotSummary(slot) {
    if (!slot) return "No saved route";
    const count = Object.values(slot.routes || {}).reduce((sum, pts) => sum + pts.length, 0);
    return `${Object.keys(slot.routes || {}).length} routes / ${count} points`;
  }

  function activeDefense() {
    const index = state.actualDefense === null ? state.selectedDefense : state.actualDefense;
    return defenseCalls[index];
  }

  function defenseLayoutForCall(callName = activeDefense().name) {
    const slot = activeDefenseSlot(callName);
    const saved = slot ? slot.layout || {} : {};
    return defenseBase.map((p) => {
      const override = saved[p.id];
      return override ? { ...p, x: override.x, y: override.y, trait: normalizeDuty(override.trait), manTarget: override.manTarget || defaultManTarget(p.id) } : p;
    });
  }

  function predictedDefense() {
    return defenseCalls[state.selectedDefense];
  }

  function callIndexByName(call) {
    return defenseCalls.findIndex((entry) => entry.call === call);
  }

  function clonePlayer(p) {
    return {
      ...p,
      angle: p.angle || 0,
      turnRate: p.turnRate || 7,
      stride: 0,
      vx: 0,
      vy: 0,
      open: 0,
      trail: [],
      cutFlash: 0,
    };
  }

  function defenseTrait(id) {
    const call = activeDefense().call;
    if (id === "N") return "rush";
    if (call === "blitz" && id === "LB") return "rush";
    if (call === "press" && (id === "CB1" || id === "CB2")) return "press";
    if (id === "CB1" || id === "CB2") return "man";
    if (id === "S") return "deep";
    return "hook";
  }

  function defaultManTarget(id) {
    if (id === "CB1") return "X";
    if (id === "CB2") return "Z";
    if (id === "LB") return "H";
    if (id === "S") return "Y";
    return "Y";
  }

  function targetableReceivers() {
    return ["X", "Y", "H", "Z"];
  }

  function manTargetFor(defender) {
    const targetId = defender.manTarget || defaultManTarget(defender.id);
    return state.offense.find((p) => p.id === targetId) || state.offense.find((p) => p.id === defaultManTarget(defender.id)) || state.offense.find((p) => p.id === "Y");
  }

  function normalizeDuty(trait) {
    return trait === "zone" ? "hook" : trait;
  }

  function isZoneDuty(trait) {
    return trait === "hook" || trait === "curl" || trait === "flat" || trait === "deep";
  }

  function zoneLandmark(defender) {
    const high = defender.y < field.y + field.h * 0.5;
    if (defender.trait === "flat") return { x: losX + 82, y: high ? field.y + field.h * 0.26 : field.y + field.h * 0.74 };
    if (defender.trait === "curl") return { x: losX + 154, y: high ? field.y + field.h * 0.36 : field.y + field.h * 0.64 };
    if (defender.trait === "deep") return { x: losX + 280, y: defender.id === "S" ? field.y + field.h * 0.5 : defender.y };
    return { x: losX + 132, y: defender.id === "LB" ? field.y + field.h * 0.48 : defender.y };
  }

  function routeRelative(id) {
    const saved = activeSavedSlot();
    const src = state.routeOverrides[id] || (saved && saved.routes && saved.routes[id]) || activePlay().routes[id] || [[0, 0]];
    return src.map((pt) => [pt[0], pt[1]]);
  }

  function routeAbs(id) {
    const origin = baseOffense.find((p) => p.id === id);
    return routeRelative(id).map((pt) => ({ x: origin.x + pt[0], y: origin.y + pt[1] }));
  }

  function isScreenPlay() {
    return activePlay().name === "Draw Screen";
  }

  function screenReleaseTime() {
    return activeDefense().call === "blitz" ? 1.2 : 1.35;
  }

  function screenReleased() {
    return !isScreenPlay() || state.t >= screenReleaseTime() || state.ball || state.carrier;
  }

  function screenProtectPoint() {
    return { x: losX - 22, y: field.y + field.h * 0.58 };
  }

  function activeScreenCatch() {
    return isScreenPlay() && state.carrier && state.carrier.id === "H";
  }

  function screenWallTarget(ol) {
    const carrier = state.carrier || state.offense.find((p) => p.id === "H");
    const lane = ol.id === "LT" ? -40 : ol.id === "RT" ? 42 : 0;
    return {
      x: Math.min(field.x + field.w - 74, carrier.x + 48 + (ol.id === "C" ? 18 : 0)),
      y: Math.max(field.y + 62, Math.min(field.y + field.h - 62, carrier.y + lane)),
    };
  }

  function facingDot(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    return Math.cos(from.angle || 0) * (dx / dist) + Math.sin(from.angle || 0) * (dy / dist);
  }

  function blockContactQuality(blocker, defender) {
    const dist = Math.hypot(defender.x - blocker.x, defender.y - blocker.y);
    const shoulder = facingDot(blocker, defender);
    const defenderFacing = facingDot(defender, blocker);
    const ahead = defender.x >= blocker.x - 8;
    const leverage = Math.max(0, shoulder) * 0.58 + Math.max(0, defenderFacing) * 0.18 + (ahead ? 0.24 : -0.22);
    const quality = Math.max(0, Math.min(1, leverage * Math.max(0, 1 - (dist - 12) / 42)));
    return { dist, shoulder, defenderFacing, ahead, quality };
  }

  function classifyBlockResult(blocker, defender, contact) {
    const timer = defender.blockTimer || 0;
    if (contact.quality > 0.72 && contact.ahead) return "drive";
    if (timer > 1.1 && contact.quality < 0.38) return "holding";
    if (timer > 0.72 && contact.quality < 0.24) return "shed";
    return "engaged";
  }

  function setBlockResult(blocker, defender, result) {
    blocker.blockResult = result;
    defender.blockResult = result;
    if (result === "drive") blocker.driveBlock = true;
    if (result === "holding") blocker.holdingBlock = true;
    if (result === "shed") defender.shedFlash = 0.28;
  }

  function holdingPlayers() {
    return [...state.line, ...state.offense].filter((p) => p.blockResult === "holding").map((p) => p.id);
  }

  function hasHolding() {
    return holdingPlayers().length > 0;
  }

  function enforceHoldingPenalty() {
    const penalty = 10;
    state.ballOn = Math.max(1, state.ballOn - penalty);
    state.down = Math.min(4, state.down + 1);
    state.distance = Math.min(30, state.distance + penalty);
    return `Holding: ${holdingPlayers().join("/")}。${penalty} yd 罰退、${ordinal(state.down)} & ${state.distance}。`;
  }

  function setRoutePoint(id, index, x, y) {
    const origin = baseOffense.find((p) => p.id === id);
    const rel = routeRelative(id);
    rel[index][0] = Math.max(26, Math.min(430, x - origin.x));
    rel[index][1] = Math.max(-230, Math.min(230, y - origin.y));
    state.routeOverrides[id] = rel;
  }

  function selectedDefender() {
    return state.defense.find((p) => p.id === state.selectedDefender) || state.defense[0];
  }

  function syncDefenderControls() {
    const defender = selectedDefender();
    if (!defender) return;
    if (defenderSelect) defenderSelect.value = defender.id;
    if (dutySelect) dutySelect.value = normalizeDuty(defender.trait || defenseTrait(defender.id));
    if (targetSelect) targetSelect.value = defender.manTarget || defaultManTarget(defender.id);
  }

  function setSelectedDefender(id) {
    if (!state.defense.some((p) => p.id === id)) return;
    state.selectedDefender = id;
    syncDefenderControls();
    draw();
  }

  function applyDefenderControls() {
    const defender = selectedDefender();
    if (!defender) return;
    if (dutySelect) defender.trait = normalizeDuty(dutySelect.value);
    if (targetSelect) defender.manTarget = targetSelect.value;
    defender.cutFlash = 0.45;
    logEvent(`${defender.id} set: ${defender.trait} > ${defender.manTarget || defaultManTarget(defender.id)}`);
    syncDefenderControls();
    renderMatchupPreview();
    draw();
  }

  function setDefensePoint(id, x, y) {
    const defender = state.defense.find((p) => p.id === id);
    if (!defender) return;
    state.selectedDefender = id;
    defender.x = Math.max(losX + 18, Math.min(field.x + field.w - 36, x));
    defender.y = Math.max(field.y + 36, Math.min(field.y + field.h - 36, y));
    defender.trail = [];
    syncDefenderControls();
  }

  function cycleDefenseDuty(id) {
    const defender = state.defense.find((p) => p.id === id);
    if (!defender) return;
    const order = ["rush", "press", "man", "hook", "curl", "flat", "deep"];
    const current = order.includes(defender.trait) ? defender.trait : normalizeDuty(defenseTrait(id));
    defender.trait = order[(order.indexOf(current) + 1) % order.length];
    defender.cutFlash = 0.45;
    state.selectedDefender = id;
    logEvent(`${defender.id} duty: ${defender.trait}`);
    syncDefenderControls();
    renderMatchupPreview();
    draw();
  }

  function cycleManTarget(id) {
    const defender = state.defense.find((p) => p.id === id);
    if (!defender) return;
    const options = targetableReceivers();
    const current = defender.manTarget || defaultManTarget(id);
    defender.manTarget = options[(Math.max(0, options.indexOf(current)) + 1) % options.length];
    defender.cutFlash = 0.45;
    state.selectedDefender = id;
    logEvent(`${defender.id} target: ${defender.manTarget}`);
    syncDefenderControls();
    renderMatchupPreview();
    draw();
  }

  function captureDefenseLayout() {
    const layout = {};
    for (const p of state.defense) {
      layout[p.id] = { x: Math.round(p.x), y: Math.round(p.y), trait: p.trait || defenseTrait(p.id), manTarget: p.manTarget || defaultManTarget(p.id) };
    }
    return layout;
  }

  function saveCurrentDefense(forceNew = false) {
    const book = defenseBookForCall();
    let slot = !forceNew ? activeDefenseSlot() : null;
    if (!slot) {
      slot = {
        id: `def-${Date.now()}-${book.slots.length}`,
        name: (defenseNameInput && defenseNameInput.value.trim()) || nextDefenseSlotName(book),
        layout: {},
      };
      book.slots.push(slot);
    } else if (defenseNameInput && defenseNameInput.value.trim()) {
      slot.name = defenseNameInput.value.trim().slice(0, 24);
    }
    slot.layout = captureDefenseLayout();
    book.activeId = slot.id;
    const ok = persistDefenseOverrides();
    logEvent(ok ? `${activeDefense().name} / ${slot.name} saved.` : "Defense save failed. Check browser storage.");
    setDeleteLookConfirming(false);
    renderDefenseList();
    renderDefenseSlotList();
    renderMatchupPreview();
    draw();
  }

  function resetCurrentDefense() {
    const book = defenseBookForCall();
    const slot = activeDefenseSlot();
    if (slot) {
      book.slots = book.slots.filter((entry) => entry.id !== slot.id);
      book.activeId = (book.slots[0] && book.slots[0].id) || null;
      if (!book.slots.length) delete state.defenseOverrides[activeDefense().name];
    }
    persistDefenseOverrides();
    logEvent(slot ? `${activeDefense().name} / ${slot.name} look deleted.` : `${activeDefense().name} has no saved look to delete.`);
    renderDefenseList();
    renderDefenseSlotList();
    renderMatchupPreview();
    resetFormation();
  }

  function setDeleteLookConfirming(confirming) {
    if (!resetDefenseButton) return;
    if (deleteLookConfirmTimer) {
      window.clearTimeout(deleteLookConfirmTimer);
      deleteLookConfirmTimer = null;
    }
    if (deleteLookConfirmInterval) {
      window.clearInterval(deleteLookConfirmInterval);
      deleteLookConfirmInterval = null;
    }
    deleteLookConfirmDeadline = confirming ? Date.now() + deleteLookConfirmTimeoutMs : 0;
    resetDefenseButton.dataset.confirming = confirming ? "true" : "false";
    resetDefenseButton.classList.toggle("confirming", confirming);
    resetDefenseButton.setAttribute("aria-pressed", String(confirming));
    if (!confirming) resetDefenseButton.style.removeProperty("--confirm-progress");
    updateDeleteLookConfirmText();
    if (confirming) {
      deleteLookConfirmInterval = window.setInterval(updateDeleteLookConfirmText, 250);
      deleteLookConfirmTimer = window.setTimeout(() => {
        setDeleteLookConfirming(false);
        logEvent("削除確認の時間切れ。");
      }, deleteLookConfirmTimeoutMs);
    }
  }

  function deleteLookConfirmRemainingMs() {
    return Math.max(0, deleteLookConfirmDeadline - Date.now());
  }

  function updateDeleteLookConfirmText() {
    if (!resetDefenseButton) return;
    if (resetDefenseButton.dataset.confirming === "true") {
      const seconds = Math.max(1, Math.ceil(deleteLookConfirmRemainingMs() / 1000));
      const progress = clampValue(deleteLookConfirmRemainingMs() / deleteLookConfirmTimeoutMs, 0, 1);
      resetDefenseButton.textContent = `確認 ${seconds}秒`;
      resetDefenseButton.setAttribute("aria-label", `現在の守備セットを削除します。残り${seconds}秒以内にもう一度押してください`);
      resetDefenseButton.style.setProperty("--confirm-progress", `${Math.round(progress * 100)}%`);
      if (deleteLookStatus) deleteLookStatus.textContent = `守備セット削除の確認中。残り${seconds}秒。`;
    } else {
      resetDefenseButton.textContent = "守備削除";
      resetDefenseButton.setAttribute("aria-label", "現在の守備セットを削除");
      resetDefenseButton.style.removeProperty("--confirm-progress");
      if (deleteLookStatus) deleteLookStatus.textContent = "";
    }
  }

  function requestDeleteCurrentDefense() {
    const slot = activeDefenseSlot();
    if (!slot) {
      logEvent(`${activeDefense().name} には削除できる保存済み守備セットがありません。`);
      if (deleteLookStatus) deleteLookStatus.textContent = "削除できる保存済み守備セットがありません。";
      setDeleteLookConfirming(false);
      return;
    }
    if (resetDefenseButton && resetDefenseButton.dataset.confirming === "true") {
      if (deleteLookStatus) deleteLookStatus.textContent = `${activeDefense().name} / ${slot.name} を削除しました。`;
      resetCurrentDefense();
      setDeleteLookConfirming(false);
      return;
    }
    setDeleteLookConfirming(true);
    logEvent(`${activeDefense().name} / ${slot.name} を削除するには確認中にもう一度押してください。`);
  }

  function duplicateCurrentDefense() {
    const source = activeDefenseSlot();
    const book = defenseBookForCall();
    const layout = source ? source.layout : captureDefenseLayout();
    const baseName = source ? source.name : "Current look";
    const slot = {
      id: `def-${Date.now()}-${book.slots.length}`,
      name: uniqueDefenseSlotName(baseName, book),
      layout: JSON.parse(JSON.stringify(layout)),
    };
    book.slots.push(slot);
    book.activeId = slot.id;
    if (defenseNameInput) defenseNameInput.value = slot.name;
    const ok = persistDefenseOverrides();
    logEvent(ok ? `${activeDefense().name} / ${slot.name} duplicated.` : "Defense duplicate failed. Check browser storage.");
    renderDefenseList();
    renderDefenseSlotList();
    setDeleteLookConfirming(false);
    renderMatchupPreview();
    resetFormation();
  }

  function selectDefenseSlot(slotId) {
    const book = defenseBookForCall();
    if (!book.slots.some((slot) => slot.id === slotId)) return;
    book.activeId = slotId;
    const slot = activeDefenseSlot();
    if (defenseNameInput && slot) defenseNameInput.value = slot.name;
    persistDefenseOverrides();
    setDeleteLookConfirming(false);
    renderDefenseList();
    renderDefenseSlotList();
    renderMatchupPreview();
    resetFormation();
  }

  function moveActiveDefenseSlot(delta) {
    const book = defenseBookForCall();
    const slot = activeDefenseSlot();
    if (!slot || book.slots.length < 2) {
      logEvent("No saved defensive look to reorder.");
      setDeleteLookConfirming(false);
      return;
    }
    const index = book.slots.findIndex((entry) => entry.id === slot.id);
    const nextIndex = clampValue(index + delta, 0, book.slots.length - 1);
    if (nextIndex === index) {
      logEvent(`${slot.name} is already ${delta < 0 ? "first" : "last"}.`);
      setDeleteLookConfirming(false);
      return;
    }
    book.slots.splice(index, 1);
    book.slots.splice(nextIndex, 0, slot);
    book.activeId = slot.id;
    const ok = persistDefenseOverrides();
    logEvent(ok ? `${activeDefense().name} / ${slot.name} moved to ${nextIndex + 1}.` : "Defense reorder failed. Check browser storage.");
    renderDefenseList();
    renderDefenseSlotList();
    setDeleteLookConfirming(false);
    renderMatchupPreview();
    resetFormation();
  }

  function captureRoutes() {
    const routes = {};
    for (const p of baseOffense) {
      if (p.id === "QB") continue;
      routes[p.id] = routeRelative(p.id);
    }
    return routes;
  }

  function saveCurrentPlay() {
    state.savedRoutes[activePlay().name] = captureRoutes();
    const ok = persistSavedRoutes();
    if (savePlayButton) {
      savePlayButton.classList.toggle("saved", ok);
      savePlayButton.textContent = ok ? "Saved" : "Save failed";
      window.setTimeout(() => {
        savePlayButton.classList.remove("saved");
        savePlayButton.textContent = "Save play";
      }, 900);
    }
    logEvent(ok ? `${activePlay().name} の編集ルートを保存。` : "ルート保存に失敗。ブラウザ設定を確認。");
    renderPlayList();
    draw();
  }

  function flashSaveButton(text, ok) {
    if (!savePlayButton) return;
    savePlayButton.classList.toggle("saved", ok);
    savePlayButton.textContent = text;
    window.setTimeout(() => {
      savePlayButton.classList.remove("saved");
      savePlayButton.textContent = "Quick save";
    }, 900);
  }

  function saveCurrentPlay(forceNew = false) {
    const book = savedBookForPlay();
    let slot = !forceNew ? activeSavedSlot() : null;
    if (!slot) {
      slot = {
        id: `slot-${Date.now()}-${book.slots.length}`,
        name: (saveNameInput && saveNameInput.value.trim()) || nextSlotName(book),
        routes: {},
      };
      book.slots.push(slot);
    } else if (saveNameInput && saveNameInput.value.trim()) {
      slot.name = saveNameInput.value.trim().slice(0, 24);
    }
    slot.routes = captureRoutes();
    book.activeId = slot.id;
    const ok = persistSavedRoutes();
    flashSaveButton(ok ? "Saved" : "Save failed", ok);
    logEvent(ok ? `${activePlay().name} / ${slot.name} saved.` : "Route save failed. Check browser storage.");
    renderPlayList();
    renderSlotList();
    renderMatchupPreview();
    draw();
  }

  function selectSavedSlot(slotId) {
    const book = savedBookForPlay();
    if (!book.slots.some((slot) => slot.id === slotId)) return;
    book.activeId = slotId;
    const slot = activeSavedSlot();
    if (saveNameInput && slot) saveNameInput.value = slot.name;
    state.routeOverrides = {};
    persistSavedRoutes();
    renderPlayList();
    renderSlotList();
    renderMatchupPreview();
    resetFormation();
  }

  function deleteActiveSlot() {
    const book = savedBookForPlay();
    const slot = activeSavedSlot();
    if (!slot) return;
    book.slots = book.slots.filter((entry) => entry.id !== slot.id);
    book.activeId = (book.slots[0] && book.slots[0].id) || null;
    const next = activeSavedSlot();
    if (saveNameInput) saveNameInput.value = next ? next.name : nextSlotName(book);
    persistSavedRoutes();
    state.routeOverrides = {};
    logEvent(`${activePlay().name} / ${slot.name} deleted.`);
    renderPlayList();
    renderSlotList();
    renderMatchupPreview();
    resetFormation();
  }

  function moveActiveRouteSlot(delta) {
    const book = savedBookForPlay();
    const slot = activeSavedSlot();
    if (!slot || book.slots.length < 2) {
      logEvent("No saved route slot to reorder.");
      return;
    }
    const index = book.slots.findIndex((entry) => entry.id === slot.id);
    const nextIndex = clampValue(index + delta, 0, book.slots.length - 1);
    if (nextIndex === index) {
      logEvent(`${slot.name} is already ${delta < 0 ? "first" : "last"}.`);
      return;
    }
    book.slots.splice(index, 1);
    book.slots.splice(nextIndex, 0, slot);
    book.activeId = slot.id;
    const ok = persistSavedRoutes();
    logEvent(ok ? `${activePlay().name} / ${slot.name} moved to ${nextIndex + 1}.` : "Route reorder failed. Check browser storage.");
    renderPlayList();
    renderSlotList();
    renderMatchupPreview();
    draw();
  }

  function deletePointNear(pos) {
    let best = null;
    for (const p of baseOffense) {
      if (p.id === "QB") continue;
      const pts = routeAbs(p.id);
      for (let i = 1; i < pts.length - 1; i += 1) {
        const dist = Math.hypot(pos.x - pts[i].x, pos.y - pts[i].y);
        if (!best || dist < best.dist) best = { id: p.id, index: i, dist };
      }
    }
    if (!best || best.dist > 24) return false;
    const rel = routeRelative(best.id);
    if (rel.length <= 2) return false;
    rel.splice(best.index, 1);
    state.routeOverrides[best.id] = rel;
    logEvent(`${best.id} の中間点を削除。`);
    return true;
  }

  function resetFormation(keepResult = false) {
    state.running = false;
    state.paused = false;
    state.replaying = false;
    state.replayIndex = 0;
    state.replayLast = 0;
    state.t = 0;
    state.last = 0;
    state.ball = null;
    state.carrier = null;
    state.catchInfo = null;
    state.qbContact = null;
    state.banner = null;
    state.previewDeltaMarker = null;
    state.previewDeltaBadge = null;
    state.screenReleaseLogged = false;
    if (!keepResult) state.replayFrames = [];
    if (!keepResult) state.replayMarkers = [];
    state.offense = baseOffense.map((p) => ({ ...clonePlayer(p), angle: 0 }));
    state.line = baseLine.map((p) => ({ ...clonePlayer(p), angle: 0, engaged: null }));
    state.defense = defenseLayoutForCall().map((p) => ({ ...clonePlayer(p), angle: Math.PI, trait: p.trait || defenseTrait(p.id) }));
    if (!state.defense.some((p) => p.id === state.selectedDefender)) state.selectedDefender = "CB1";
    syncDefenderControls();
    state.logs = [];
    state.reads = [];
    if (!keepResult) state.result = null;
    updateTopline();
    if (pauseButton) {
      pauseButton.setAttribute("aria-pressed", "false");
      pauseButton.textContent = "Pause";
    }
    if (!keepResult) updateReplayControls(0);
    renderReplayMarkers();
    renderResult();
    draw();
  }

  function updateTopline() {
    downText.textContent = `${ordinal(state.down)} & ${state.distance}`;
    fieldText.textContent = `Ball on ${state.ballOn}`;
    driveText.textContent = `Drive ${state.drive}`;
    scoreText.textContent = `Coach ${state.coachScore}`;
    modeText.textContent = state.targetEdit ? "対象編集" : state.dutyEdit ? "責任編集" : state.defenseEdit ? "守備編集" : state.edit ? (state.deletePoint ? "点を削除" : state.addPoint ? "点を追加" : "ルート編集") : state.replaying ? "再生中" : state.paused ? "停止中" : state.carrier ? "RAC" : state.running ? "実行中" : state.result ? "分析中" : "設計中";
    renderScout();
  }

  function ordinal(n) {
    return ["", "1st", "2nd", "3rd", "4th"][n] || `${n}th`;
  }

  function setPlay(index) {
    state.selectedPlay = index;
    state.routeOverrides = {};
    state.result = null;
    const slot = activeSavedSlot();
    if (saveNameInput) saveNameInput.value = slot ? slot.name : nextSlotName();
    renderPlayList();
    renderSlotList();
    resetFormation();
  }

  function setDefense(index) {
    state.selectedDefense = index;
    state.actualDefense = null;
    state.result = null;
    renderDefenseList();
    renderDefenseSlotList();
    renderMatchupPreview();
    resetFormation();
  }

  function logEvent(text) {
    state.logs.unshift(text);
    state.logs = state.logs.slice(0, 7);
    eventLog.innerHTML = state.logs.map((entry) => `<li>${entry}</li>`).join("");
  }

  function addReplayMarker(kind, label, detail = "", frame = Math.max(0, state.replayFrames.length - 1)) {
    if (!state.replaying && state.running) {
      state.replayMarkers.push({
        kind,
        label,
        detail,
        frame,
      });
      state.replayMarkers = state.replayMarkers.slice(-8);
      renderReplayMarkers();
    }
  }

  function showBanner(kind, main, detail = "") {
    state.banner = {
      kind,
      main,
      detail,
      until: state.t + 1.15,
    };
    addReplayMarker(kind, main, detail);
  }

  function markPreviewDeltaMarker(outcome, detail = "", badgeText = "") {
    const frame = Math.max(0, state.replayFrames.length - 1);
    const kind = outcome === "complete" ? "good" : outcome === "penalty" || outcome === "sack" ? "bad" : "warn";
    state.previewDeltaMarker = {
      label: "予測差分",
      outcome,
      frame,
    };
    state.previewDeltaBadge = {
      outcome,
      text: badgeText || previewDeltaBadgeText(outcome, detail || state.result.previewDelta || ""),
      frame,
    };
    const frameState = state.replayFrames[frame];
    if (frameState) frameState.previewDeltaBadge = { ...state.previewDeltaBadge };
    addReplayMarker(kind, "予測差分", detail || state.result.previewDelta || "Preview vs result delta", frame);
  }

  function previewDeltaBadgeText(outcome, fallback = "") {
    const expected = state.preSnapPreview && state.preSnapPreview.rows && state.preSnapPreview.rows[0];
    const liked = expected ? `予測は${expected.id}推し` : "予測読み";
    if (outcome === "sack") return `${liked}; ラッシュが先に到達。`;
    if (outcome === "incomplete") return `${liked}; カバーで窓が閉じた。`;
    if (outcome === "penalty") return `${liked}; ホールディングでゲイン取消。`;
    if (outcome === "complete") return `${liked}; 捕球後にタックルまで到達。`;
    return fallback.length > 88 ? `${fallback.slice(0, 85)}...` : fallback;
  }

  function setSpeedScale(value) {
    state.speedScale = value;
    speedButtons.forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.speed) === value);
    });
  }

  function setPaused(paused) {
    state.paused = paused;
    if (pauseButton) {
      pauseButton.setAttribute("aria-pressed", String(paused));
      pauseButton.textContent = paused ? "Resume" : "Pause";
    }
    updateTopline();
    draw();
  }

  function updateReplayControls(index = state.replayIndex) {
    const ready = state.replayFrames.length > 1;
    if (replayButton) replayButton.disabled = !ready;
    if (frameBackButton) frameBackButton.disabled = !ready;
    if (frameForwardButton) frameForwardButton.disabled = !ready;
    if (replayScrubber) {
      replayScrubber.disabled = !ready;
      replayScrubber.max = String(Math.max(0, state.replayFrames.length - 1));
      replayScrubber.value = String(Math.min(Math.max(0, index), Math.max(0, state.replayFrames.length - 1)));
    }
    syncReplayMarkerActive(index);
  }

  function renderReplayMarkers() {
    if (!markerStrip) return;
    if (state.replayMarkers.length === 0) {
      markerStrip.innerHTML = "";
      return;
    }
    markerStrip.innerHTML = "";
    state.replayMarkers.forEach((marker) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.kind = marker.kind;
      button.dataset.frame = String(marker.frame);
      button.textContent = `${marker.label} @${marker.frame}`;
      button.title = marker.detail || marker.label;
      button.addEventListener("click", () => showReplayFrame(marker.frame));
      markerStrip.appendChild(button);
    });
    syncReplayMarkerActive(state.replayIndex);
  }

  function syncReplayMarkerActive(index = state.replayIndex) {
    if (!markerStrip) return;
    const activeMarker = activeReplayMarkerForIndex(index);
    Array.from(markerStrip.querySelectorAll("button")).forEach((button) => {
      const active = activeMarker && Number(button.dataset.frame) === activeMarker.frame;
      button.classList.toggle("active", active);
      if (active) {
        button.setAttribute("aria-current", "step");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function activeReplayMarkerForIndex(index = state.replayIndex) {
    let closest = null;
    let closestDistance = Infinity;
    state.replayMarkers.forEach((marker) => {
      const distance = Math.abs(marker.frame - index);
      if (distance <= replayMarkerActiveWindowFrames && distance < closestDistance) {
        closest = marker;
        closestDistance = distance;
      }
    });
    return closest;
  }

  function framePlayer(p) {
    return {
      id: p.id,
      role: p.role,
      x: p.x,
      y: p.y,
      angle: p.angle,
      stride: p.stride,
      trait: p.trait,
      open: p.open,
      trail: p.trail ? p.trail.slice(-18).map((pt) => ({ x: pt.x, y: pt.y })) : [],
      cutFlash: p.cutFlash,
      engaged: p.engaged,
      held: p.held,
      shedFlash: p.shedFlash,
      screenBlock: p.screenBlock,
      screenLead: p.screenLead,
      screenPick: p.screenPick,
      screenPicked: p.screenPicked,
      blockQuality: p.blockQuality || 0,
      blockResult: p.blockResult,
      driveBlock: p.driveBlock,
      holdingBlock: p.holdingBlock,
    };
  }

  function recordReplayFrame() {
    if (state.replaying) return;
    state.replayFrames.push({
      t: state.t,
      actualDefense: state.actualDefense,
      running: state.running,
      offense: state.offense.map(framePlayer),
      line: state.line.map(framePlayer),
      defense: state.defense.map(framePlayer),
      ball: state.ball ? { x: state.ball.x, y: state.ball.y } : null,
      catchInfo: state.catchInfo ? { x: state.catchInfo.x, y: state.catchInfo.y } : null,
      reads: state.reads.map((r) => ({ id: r.id, defender: r.defender, score: r.score, separation: r.separation })),
      banner: state.banner ? { ...state.banner } : null,
      previewDeltaBadge: state.previewDeltaBadge ? { ...state.previewDeltaBadge } : null,
    });
    state.replayFrames = state.replayFrames.slice(-420);
    updateReplayControls(state.replayFrames.length - 1);
  }

  function drawReplayFrame(frame) {
    const saved = {
      offense: state.offense,
      line: state.line,
      defense: state.defense,
      ball: state.ball,
      catchInfo: state.catchInfo,
      reads: state.reads,
      banner: state.banner,
      previewDeltaBadge: state.previewDeltaBadge,
      actualDefense: state.actualDefense,
      t: state.t,
      running: state.running,
    };
    state.offense = frame.offense;
    state.line = frame.line;
    state.defense = frame.defense;
    state.ball = frame.ball;
    state.catchInfo = frame.catchInfo;
    state.reads = frame.reads.map((r) => ({
      ...r,
      player: frame.offense.find((p) => p.id === r.id),
    }));
    state.banner = frame.banner;
    state.previewDeltaBadge = frame.previewDeltaBadge;
    state.actualDefense = frame.actualDefense;
    state.t = frame.t;
    state.running = true;
    draw();
    Object.assign(state, saved);
  }

  function replayLoop(now) {
    if (!state.replaying) return;
    if (!state.replayLast) state.replayLast = now;
    const elapsed = Math.max(0, (now - state.replayLast) / 1000);
    state.replayLast = now;
    const step = Math.max(1, Math.round((elapsed * 60 * state.speedScale) / 0.45));
    const frame = state.replayFrames[state.replayIndex];
    if (frame) drawReplayFrame(frame);
    updateReplayControls(state.replayIndex);
    state.replayIndex += step;
    if (state.replayIndex >= state.replayFrames.length) {
      state.replaying = false;
      state.replayIndex = 0;
      state.replayLast = 0;
      updateReplayControls(state.replayFrames.length - 1);
      draw();
      return;
    }
    requestAnimationFrame(replayLoop);
  }

  function startReplay() {
    if (state.replayFrames.length < 2) return;
    state.replaying = true;
    state.paused = false;
    state.replayIndex = 0;
    state.replayLast = 0;
    updateTopline();
    requestAnimationFrame(replayLoop);
  }

  function showReplayFrame(index) {
    if (state.replayFrames.length < 2) return;
    const max = state.replayFrames.length - 1;
    const clamped = Math.max(0, Math.min(max, index));
    state.replaying = false;
    state.paused = false;
    state.replayIndex = clamped;
    state.replayLast = 0;
    updateReplayControls(clamped);
    drawReplayFrame(state.replayFrames[clamped]);
    updateTopline();
  }

  function renderPlayList() {
    playList.innerHTML = "";
    plays.forEach((play, index) => {
      const button = document.createElement("button");
      button.className = `play-card${index === state.selectedPlay ? " active" : ""}`;
      button.type = "button";
      const book = savedBookForPlay(play.name);
      const saved = book.slots.length ? ` / ${book.slots.length} saved` : "";
      button.innerHTML = `<strong>${index + 1}. ${play.name}</strong><span>${play.note}${saved}</span>`;
      button.addEventListener("click", () => setPlay(index));
      playList.appendChild(button);
    });
  }

  function renderSlotList() {
    if (!slotList) return;
    const book = savedBookForPlay();
    const active = activeSavedSlot();
    const activeIndex = active ? book.slots.findIndex((slot) => slot.id === active.id) : -1;
    syncRouteReorderButtons(book, activeIndex);
    if (saveNameInput && active) saveNameInput.value = active.name;
    if (!book.slots.length) {
      slotList.innerHTML = `<div class="slot-empty">No saved variants for ${activePlay().name}.</div>`;
      return;
    }
    slotList.innerHTML = "";
    book.slots.forEach((slot, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `slot-card${slot.id === book.activeId ? " active" : ""}`;
      button.innerHTML = `<strong>${index + 1}. ${slot.name}</strong><span>${routeSlotSummary(slot)}</span>`;
      button.addEventListener("click", () => selectSavedSlot(slot.id));
      slotList.appendChild(button);
    });
  }

  function syncRouteReorderButtons(book = savedBookForPlay(), activeIndex = -1) {
    const canMove = book.slots.length > 1 && activeIndex >= 0;
    if (moveSlotUpButton) moveSlotUpButton.disabled = !canMove || activeIndex === 0;
    if (moveSlotDownButton) moveSlotDownButton.disabled = !canMove || activeIndex === book.slots.length - 1;
  }

  function renderDefenseSlotList() {
    if (!defenseSlotList) return;
    const book = defenseBookForCall();
    const active = activeDefenseSlot();
    const activeIndex = active ? book.slots.findIndex((slot) => slot.id === active.id) : -1;
    syncDefenseReorderButtons(book, activeIndex);
    if (defenseNameInput) defenseNameInput.value = active ? active.name : nextDefenseSlotName(book);
    if (!book.slots.length) {
      defenseSlotList.innerHTML = '<p class="slot-empty">No saved defensive looks for this call.</p>';
      return;
    }
    defenseSlotList.innerHTML = "";
    book.slots.forEach((slot, index) => {
      const button = document.createElement("button");
      button.className = `slot-card${slot.id === book.activeId || (!book.activeId && index === 0) ? " active" : ""}`;
      button.type = "button";
      button.innerHTML = `<strong>${index + 1}. ${slot.name}</strong><span>${defenseSlotSummary(slot)}</span>`;
      button.addEventListener("click", () => selectDefenseSlot(slot.id));
      defenseSlotList.appendChild(button);
    });
  }

  function syncDefenseReorderButtons(book = defenseBookForCall(), activeIndex = -1) {
    const canMove = book.slots.length > 1 && activeIndex >= 0;
    if (moveDefenseUpButton) moveDefenseUpButton.disabled = !canMove || activeIndex === 0;
    if (moveDefenseDownButton) moveDefenseDownButton.disabled = !canMove || activeIndex === book.slots.length - 1;
  }

  function renderDefenseList() {
    defenseList.innerHTML = "";
    defenseCalls.forEach((call, index) => {
      const button = document.createElement("button");
      button.className = `defense-card${index === state.selectedDefense ? " active" : ""}`;
      button.type = "button";
      button.innerHTML = `<strong>${call.name}</strong><span>予想: ${call.note}</span>`;
      button.addEventListener("click", () => setDefense(index));
      defenseList.appendChild(button);
    });
  }

  function renderDefenseList() {
    defenseList.innerHTML = "";
    defenseCalls.forEach((call, index) => {
      const button = document.createElement("button");
      button.className = `defense-card${index === state.selectedDefense ? " active" : ""}`;
      button.type = "button";
      const savedCount = state.defenseOverrides[call.name] && state.defenseOverrides[call.name].slots ? state.defenseOverrides[call.name].slots.length : 0;
      const saved = savedCount ? ` / ${savedCount} saved` : "";
      button.innerHTML = `<strong>${call.name}</strong><span>${call.note}${saved}</span>`;
      button.addEventListener("click", () => setDefense(index));
      defenseList.appendChild(button);
    });
  }

  function renderScout() {
    if (!scoutCard) return;
    const next = nextScout();
    const counter = plays.find((play) => counters[play.name] === next.likely);
    scoutCard.innerHTML = `<strong>Scout report</strong>${next.text}<br>推奨カウンター: ${counter ? counter.name : "不明"}<br>同じプレー連打: ${state.repeatCount > 0 ? "読まれやすい" : "なし"}`;
    renderMatchupPreview();
  }

  function previewDefenders() {
    return defenseLayoutForCall(predictedDefense().name).map((p) => ({ ...p, trait: p.trait || defenseTrait(p.id), manTarget: p.manTarget || defaultManTarget(p.id) }));
  }

  function previewRoutePoint(id) {
    const pts = routeAbs(id);
    const targetTime = Math.min(routeDuration, Math.max(1.4, state.throwTime));
    const segment = Math.max(1, pts.length - 1);
    const scaled = Math.min(segment - 0.01, (targetTime / routeDuration) * segment);
    const i = Math.floor(scaled);
    const f = scaled - i;
    const a = pts[i] || pts[0];
    const b = pts[i + 1] || pts[pts.length - 1];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  function defenderLeverage(defender, receiverId, point) {
    const dist = Math.hypot(defender.x - point.x, defender.y - point.y);
    let pressure = Math.max(0, 120 - dist);
    if (defender.trait === "press" && defender.manTarget === receiverId) pressure += 32;
    if (defender.trait === "man" && defender.manTarget === receiverId) pressure += 26;
    if (defender.trait === "hook" && point.x > losX + 70 && Math.abs(point.y - (field.y + field.h * 0.5)) < 130) pressure += 18;
    if (defender.trait === "curl" && point.x > losX + 90 && point.x < losX + 230) pressure += 22;
    if (defender.trait === "flat" && point.x < losX + 135 && (point.y < field.y + field.h * 0.34 || point.y > field.y + field.h * 0.66)) pressure += 28;
    if (defender.trait === "deep" && point.x > losX + 190) pressure += 30;
    if (defender.trait === "rush") pressure -= 32;
    return pressure;
  }

  function computeMatchupPreview() {
    const defenders = previewDefenders();
    const receivers = baseOffense.filter((p) => p.id !== "QB");
    const rows = receivers.map((receiver) => {
      const point = previewRoutePoint(receiver.id);
      const nearest = defenders
        .map((defender) => ({ defender, score: defenderLeverage(defender, receiver.id, point), dist: Math.hypot(defender.x - point.x, defender.y - point.y) }))
        .sort((a, b) => b.score - a.score)[0];
      const depth = Math.max(0, Math.round((point.x - losX) / yardPx));
      const routeBend = routeRelative(receiver.id).length - 2;
      const openness = Math.round(receiver.catch / 2 + depth * 1.4 + routeBend * 6 - (nearest ? nearest.score * 0.45 : 0));
      return {
        id: receiver.id,
        depth,
        defender: nearest ? nearest.defender.id : "?",
        duty: nearest ? nearest.defender.trait : "?",
        leverage: nearest ? Math.round(nearest.score) : 0,
        grade: Math.max(0, Math.min(99, openness)),
        point,
        defenderPoint: nearest ? { x: nearest.defender.x, y: nearest.defender.y } : null,
      };
    }).sort((a, b) => b.grade - a.grade);
    const rushers = defenders.filter((d) => d.trait === "rush").length;
    const hot = rushers >= 2 || (predictedDefense().call === "blitz" && rushers >= 1);
    return { rows, hot, rushers };
  }

  function currentCoverageStrength() {
    const receiverPoints = baseOffense
      .filter((p) => p.id !== "QB")
      .map((receiver) => ({ receiver, point: previewRoutePoint(receiver.id) }));
    return state.defense.map((defender) => {
      const duty = normalizeDuty(defender.trait || defenseTrait(defender.id));
      if (duty === "rush") {
        const qb = state.offense.find((p) => p.id === "QB") || baseOffense[0];
        const dist = Math.hypot(defender.x - qb.x, defender.y - qb.y);
        const grade = Math.max(12, Math.min(99, Math.round(104 - dist * 0.44)));
        return { id: defender.id, duty, grade, note: `${Math.round(dist)} px to QB`, targetId: "QB", targetPoint: { x: qb.x, y: qb.y } };
      }
      if (duty === "man" || duty === "press") {
        const targetId = defender.manTarget || defaultManTarget(defender.id);
        const target = receiverPoints.find((row) => row.receiver.id === targetId) || receiverPoints[0];
        const dist = target ? Math.hypot(defender.x - target.point.x, defender.y - target.point.y) : 180;
        const pressBonus = duty === "press" ? 10 : 0;
        const grade = Math.max(8, Math.min(99, Math.round(92 + pressBonus - dist * 0.34)));
        return { id: defender.id, duty, grade, note: `${targetId} ${Math.round(dist)} px`, targetId, targetPoint: target ? target.point : null };
      }
      const zone = zoneLandmark(defender);
      const nearest = receiverPoints
        .map((row) => ({ id: row.receiver.id, point: row.point, dist: Math.hypot(zone.x - row.point.x, zone.y - row.point.y) }))
        .sort((a, b) => a.dist - b.dist)[0];
      const grade = Math.max(10, Math.min(99, Math.round(94 - (nearest ? nearest.dist : 210) * 0.28)));
      return { id: defender.id, duty, grade, note: `${nearest ? nearest.id : "route"} ${nearest ? Math.round(nearest.dist) : "?"} px`, targetId: nearest ? nearest.id : "route", targetPoint: nearest ? nearest.point : null, zonePoint: zone };
    }).sort((a, b) => b.grade - a.grade);
  }

  function renderCoverageCard() {
    if (!coverageCard) return;
    const rows = currentCoverageStrength();
    const best = rows[0];
    const weak = rows[rows.length - 1];
    coverageCard.innerHTML = `
      <strong>Defender strength</strong>
      <p>${best ? `Best: ${best.id} ${best.duty} (${best.grade}). Weak spot: ${weak.id} ${weak.duty} (${weak.grade}).` : "No defenders."}</p>
      <div class="coverage-grid">
        ${rows.map((row) => `<span>${row.id}</span><b>${row.grade}</b><em>${row.duty} / ${row.note}</em>`).join("")}
      </div>
    `;
  }

  function renderMatchupPreview() {
    if (!matchupCard) return;
    const preview = computeMatchupPreview();
    const best = preview.rows[0];
    matchupCard.innerHTML = `
      <strong>Matchup preview</strong>
      <p>${best ? `Best: ${best.id} at ${best.depth} yd vs ${best.defender} ${best.duty} (${best.grade})` : "No route read."}</p>
      <p>Field lines show the top three preview reads. Toggle Reads, Man, and Zone layers to keep the field readable.</p>
      <div class="preview-grid">
        ${preview.rows.map((row) => `<span>${row.id}</span><b>${row.grade}</b><em>${row.defender}/${row.duty}</em>`).join("")}
      </div>
      <p>${preview.hot ? `Hot risk: ${preview.rushers} rushers. Throw earlier or keep H in protection.` : `Rush count: ${preview.rushers}. Route depth is playable.`}</p>
    `;
    renderCoverageCard();
  }

  function nextScout() {
    const scripted = defenseScript[state.snap % defenseScript.length];
    if (state.down >= 3 && state.distance >= 6) {
      return { likely: "blitz", text: "3rd long傾向: pressure多め。ただしscreenに弱い。" };
    }
    if (state.distance <= 3) {
      return { likely: "press", text: "short yardage傾向: 外をpressで潰しにくる。" };
    }
    if (scripted === "zone") return { likely: "zone", text: "直近傾向: safetyが深く、中間zoneが厚い。" };
    if (scripted === "press") return { likely: "press", text: "直近傾向: cornerがLOS近くに立つ。" };
    return { likely: "blitz", text: "直近傾向: LBが前傾、edge pressure警戒。" };
  }

  function chooseActualDefense() {
    const scout = nextScout();
    return callIndexByName(scout.likely);
  }

  function renderResult() {
    if (!state.result) {
      resultCard.innerHTML = "<strong>未実行</strong><p>プレー、守備、投球タイミングを決めて Snap。Edit routes 中はルート点をドラッグできます。</p>";
      eventLog.innerHTML = "";
      return;
    }
    const color = state.result.success ? "var(--green)" : "var(--red)";
    const delta = state.result.previewDelta ? `<p class="preview-delta">${state.result.previewDelta}</p>` : "";
    resultCard.innerHTML = `<strong style="color:${color}">${state.result.title}</strong><p>${state.result.detail}</p>${delta}`;
  }

  function previewDeltaText(actualId, outcome, reason = "") {
    const preview = state.preSnapPreview;
    if (!preview || !preview.rows || !preview.rows.length) return "";
    const expected = preview.rows[0];
    const actual = actualId ? preview.rows.find((row) => row.id === actualId) : null;
    const expectedText = `Preview liked ${expected.id} (${expected.grade}) vs ${expected.defender}/${expected.duty}.`;
    if (outcome === "sack") return `${expectedText} Result broke because pressure arrived before the route could matter.`;
    if (!actual) return `${expectedText} Result did not reach a previewed target${reason ? `: ${reason}` : "."}`;
    if (actual.id === expected.id) return `${expectedText} Result followed the preview${reason ? `, but ${reason}` : "."}`;
    return `${expectedText} QB chose ${actual.id} (${actual.grade}); ${reason || "the live read moved away from the pre-snap look."}`;
  }

  function downDistanceUrgency() {
    const downPressure = state.down >= 4 ? 0.26 : state.down === 3 ? 0.18 : state.down === 2 ? 0.08 : 0;
    const distancePressure = state.distance <= 2 ? 0.22 : state.distance <= 5 ? 0.14 : state.distance <= 8 ? 0.06 : -0.04;
    const fieldPositionPressure = fieldPositionUrgency();
    return clampValue(downPressure + distancePressure + fieldPositionPressure, 0, 0.5);
  }

  function fieldPositionUrgency() {
    if (state.ballOn >= 90) return 0.12;
    if (state.ballOn >= 75) return 0.08;
    if (state.ballOn >= 60) return 0.04;
    return 0;
  }

  function routePointAt(id, t) {
    const pts = routeAbs(id);
    if (pts.length === 1) return pts[0];
    const total = pts.length - 1;
    const scaled = Math.min(total - 0.001, Math.max(0, t / routeDuration * total));
    const i = Math.floor(scaled);
    const a = pts[i];
    const b = pts[i + 1];
    const f = scaled - i;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  function angleLerp(current, target, amount) {
    let delta = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (delta < -Math.PI) delta += Math.PI * 2;
    return current + delta * Math.min(1, amount);
  }

  function moveToward(p, target, speed, dt, options = {}) {
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    const desiredAngle = Math.atan2(dy, dx);
    const previousAngle = p.angle;
    const turnScale = options.turnScale || 1;
    p.angle = angleLerp(p.angle, desiredAngle, dt * p.turnRate * turnScale);
    const turnDelta = Math.abs(((p.angle - previousAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
    if (turnDelta > 0.045) p.cutFlash = 0.18;

    const alignment = Math.max(0.36, Math.cos(desiredAngle - p.angle));
    const slowRadius = options.slowRadius || 38;
    const slow = Math.min(1, Math.max(0.42, dist / slowRadius));
    const step = Math.min(dist, speed * alignment * slow * dt);
    const nx = Math.cos(p.angle);
    const ny = Math.sin(p.angle);
    p.x += nx * step;
    p.y += ny * step;
    p.vx = nx * step / Math.max(dt, 0.001);
    p.vy = ny * step / Math.max(dt, 0.001);
    p.stride += step * 0.18;
    p.cutFlash = Math.max(0, p.cutFlash - dt);
  }

  function backpedalToward(p, target, speed, dt) {
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    const faceBall = Math.atan2(field.y + field.h * 0.5 - p.y, losX - p.x);
    p.angle = angleLerp(p.angle, faceBall, dt * p.turnRate * 0.8);
    const step = Math.min(dist, speed * 0.72 * dt);
    p.x += (dx / dist) * step;
    p.y += (dy / dist) * step;
    p.vx = (dx / dist) * step / Math.max(dt, 0.001);
    p.vy = (dy / dist) * step / Math.max(dt, 0.001);
    p.stride += step * 0.16;
  }

  function nearestDefender(receiver) {
    let best = null;
    let bestDist = Infinity;
    for (const d of state.defense) {
      const dist = Math.hypot(d.x - receiver.x, d.y - receiver.y);
      if (dist < bestDist) {
        best = d;
        bestDist = dist;
      }
    }
    return { defender: best, dist: bestDist };
  }

  function pressureDistance() {
    const qb = state.offense.find((p) => p.id === "QB");
    return Math.min(...state.defense.filter((d) => d.trait === "rush").map((d) => Math.hypot(d.x - qb.x, d.y - qb.y)));
  }

  function pocketWidth() {
    const qb = state.offense.find((p) => p.id === "QB");
    const rushers = state.defense.filter((d) => d.trait === "rush");
    if (!rushers.length) return 99;
    const left = Math.min(...rushers.map((r) => r.y));
    const right = Math.max(...rushers.map((r) => r.y));
    const interior = rushers.filter((r) => Math.abs(r.y - qb.y) < 70 && r.x < qb.x + 56);
    return Math.max(0, 120 - interior.length * 34 - Math.max(0, 90 - (right - left)));
  }

  function blockerFor(rusher) {
    if (isScreenPlay() && !screenReleased() && rusher.id === "LB") return state.offense.find((p) => p.id === "H");
    if (rusher.id === "N") return state.line.find((p) => p.id === "C");
    if (rusher.id === "LB") return state.line.find((p) => p.id === "RT") || state.line[1];
    return rusher.y < field.y + field.h * 0.5 ? state.line.find((p) => p.id === "LT") : state.line.find((p) => p.id === "RT");
  }

  function updatePassProtection(dt) {
    const qb = state.offense.find((p) => p.id === "QB");
    const rb = state.offense.find((p) => p.id === "H");
    if (rb) {
      rb.screenBlock = false;
      rb.engaged = null;
      rb.blockQuality = 0;
      rb.blockResult = null;
      rb.driveBlock = false;
      rb.holdingBlock = false;
    }
    for (const ol of state.line) {
      ol.engaged = null;
      ol.screenLead = false;
      ol.screenPick = false;
      ol.blockQuality = 0;
      ol.blockResult = null;
      ol.driveBlock = false;
      ol.holdingBlock = false;
      if (activeScreenCatch()) {
        ol.screenLead = true;
        moveToward(ol, screenWallTarget(ol), ol.speed * 1.02, dt, { turnScale: 0.72, slowRadius: 42 });
        ol.trail.push({ x: ol.x, y: ol.y });
        ol.trail = ol.trail.slice(-22);
        continue;
      }
      const home = baseLine.find((p) => p.id === ol.id);
      moveToward(ol, { x: home.x - 10, y: home.y }, ol.speed, dt, { turnScale: 0.55, slowRadius: 30 });
      ol.trail.push({ x: ol.x, y: ol.y });
      ol.trail = ol.trail.slice(-18);
    }

    for (const rusher of state.defense.filter((d) => d.trait === "rush")) {
      rusher.blockResult = null;
      const blocker = blockerFor(rusher);
      if (!blocker) continue;
      const contact = blockContactQuality(blocker, rusher);
      const laneCollision = rusher.x < losX + 18 && Math.abs(rusher.y - blocker.y) < 48 && contact.shoulder > 0.2;
      if (contact.quality > 0.18 || laneCollision) {
        blocker.engaged = rusher.id;
        rusher.blockedBy = blocker.id;
        rusher.blockTimer = (rusher.blockTimer || 0) + dt;
        blocker.blockQuality = contact.quality;
        rusher.blockQuality = contact.quality;
        const blockResult = classifyBlockResult(blocker, rusher, contact);
        setBlockResult(blocker, rusher, blockResult);
        const blockStrength = 0.62 + contact.quality * 0.82;
        const leverage = (rusher.speed - (blocker.power || 62) * blockStrength) * 0.012 + (activeDefense().call === "blitz" ? 0.35 : 0);
        const shedTime = Math.max(0.65, 1.35 - leverage);
        const anchorX = Math.max(qb.x + 22, losX + 12 + rusher.blockTimer * 10);
        const laneY = blocker.y + (rusher.id === "LB" ? 18 : rusher.id === "N" ? 0 : -18);
        const rusherRate = blockResult === "drive" ? 0.18 : blockResult === "holding" ? 0.24 : 0.52 - contact.quality * 0.24;
        const blockerRate = blockResult === "drive" ? 0.66 : blockResult === "holding" ? 0.2 : 0.3 + contact.quality * 0.24;
        moveToward(rusher, { x: anchorX, y: laneY }, rusher.speed * rusherRate, dt, { turnScale: 0.35, slowRadius: 24 });
        moveToward(blocker, { x: rusher.x - 14, y: rusher.y }, blocker.speed * blockerRate, dt, { turnScale: 0.4, slowRadius: 24 });
        if (blocker.id === "H") blocker.screenBlock = true;
        if (blockResult === "shed") {
          rusher.held = false;
        } else if (rusher.blockTimer < shedTime || blockResult === "drive" || blockResult === "holding") {
          rusher.held = true;
        } else {
          rusher.held = false;
          rusher.shedFlash = 0.22;
        }
      } else {
        rusher.held = false;
        rusher.blockedBy = null;
        rusher.blockQuality = 0;
        rusher.blockTimer = Math.max(0, (rusher.blockTimer || 0) - dt * 0.5);
      }
      rusher.shedFlash = Math.max(0, (rusher.shedFlash || 0) - dt);
    }
  }

  function nearestRusherToQB() {
    const qb = state.offense.find((p) => p.id === "QB");
    let best = null;
    let bestDist = Infinity;
    for (const d of state.defense.filter((p) => p.trait === "rush")) {
      const dist = Math.hypot(d.x - qb.x, d.y - qb.y);
      if (dist < bestDist) {
        best = d;
        bestDist = dist;
      }
    }
    return { rusher: best, dist: bestDist };
  }

  function screenWallSlowdown(defender) {
    if (!activeScreenCatch()) return 1;
    let factor = 1;
    for (const ol of state.line) {
      if (!ol.screenLead) continue;
      const contact = blockContactQuality(ol, defender);
      const between = ol.x > state.carrier.x - 4 && defender.x > state.carrier.x - 18 && contact.ahead;
      if (between && contact.quality > 0.16) {
        factor = Math.min(factor, 0.72 - contact.quality * 0.42);
        defender.screenPicked = true;
        defender.blockQuality = contact.quality;
        ol.screenPick = true;
        ol.blockQuality = contact.quality;
        const result = classifyBlockResult(ol, defender, contact);
        setBlockResult(ol, defender, result);
      }
    }
    return factor;
  }

  function evaluateReceivers(pressure) {
    const pressurePenalty = Math.max(0, 72 - pressure) * 0.45;
    return state.offense
      .filter((p) => p.id !== "QB")
      .map((p) => {
        const nearest = nearestDefender(p);
        const depth = Math.max(0, p.x - losX);
        const middleBonus = 18 - Math.abs(p.y - (field.y + field.h * 0.5)) * 0.045;
        const screenBonus = isScreenPlay() && p.id === "H" ? (screenReleased() ? (activeDefense().call === "blitz" ? 56 : 24) : -95) : 0;
        const score = nearest.dist * 1.45 + depth * 0.18 + p.catch * 0.26 + middleBonus + screenBonus - pressurePenalty;
        p.open = nearest.dist;
        return { id: p.id, player: p, defender: nearest.defender.id, separation: nearest.dist, depth, score };
      })
      .sort((a, b) => b.score - a.score);
  }

  function startSnap() {
    if (state.running) return;
    state.preSnapPreview = computeMatchupPreview();
    state.actualDefense = chooseActualDefense();
    state.result = null;
    resetFormation(false);
    state.running = true;
    state.paused = false;
    state.t = 0;
    state.last = 0;
    state.logs = [];
    state.reads = [];
    state.carrier = null;
    state.catchInfo = null;
    state.qbContact = null;
    state.banner = null;
    state.replayFrames = [];
    state.replayMarkers = [];
    state.previewDeltaMarker = null;
    state.previewDeltaBadge = null;
    state.replaying = false;
    state.replayIndex = 0;
    state.replayLast = 0;
    state.screenReleaseLogged = false;
    updateReplayControls(0);
    renderReplayMarkers();
    if (pauseButton) {
      pauseButton.setAttribute("aria-pressed", "false");
      pauseButton.textContent = "Pause";
    }
    updateTopline();
    const readText = predictedDefense().call === activeDefense().call ? "読み的中" : `読み外れ: 実際は ${activeDefense().name}`;
    logEvent(`${activePlay().name} vs ${activeDefense().name}。${readText}。投球予定 ${state.throwTime.toFixed(2)} 秒。`);
    requestAnimationFrame(loop);
  }

  function update(dt) {
    state.t += dt;
    const qb = state.offense[0];
    const boot = activePlay().name === "Flood Boot" ? 28 : 6;
    qb.x = losX - 48 + Math.min(boot, state.t * boot * 0.8);
    qb.y = field.y + field.h * 0.5 + Math.sin(state.t * 1.8) * 5;

    if (isScreenPlay() && screenReleased() && !state.screenReleaseLogged && !state.carrier) {
      state.screenReleaseLogged = true;
      showBanner("good", "SCREEN RELEASE", "H slips out");
      logEvent("H がパスプロから遅れてスクリーンへリリース。");
    }

    for (const p of state.offense) {
      if (state.carrier && p.id === state.carrier.id) {
        moveToward(p, { x: Math.min(field.x + field.w - 42, p.x + 120), y: p.y + Math.sin(state.t * 3) * 18 }, p.speed * 0.92, dt, { turnScale: 0.82, slowRadius: 60 });
      } else if (p.id === "H" && isScreenPlay() && !screenReleased()) {
        moveToward(p, screenProtectPoint(), p.speed * 0.72, dt, { turnScale: 0.52, slowRadius: 30 });
      } else if (p.id !== "QB") {
        moveToward(p, routePointAt(p.id, state.t), p.speed, dt, { turnScale: p.role === "RB" ? 0.72 : 1, slowRadius: 48 });
      }
      p.trail.push({ x: p.x, y: p.y });
      p.trail = p.trail.slice(-24);
    }

    updatePassProtection(dt);

    for (const d of state.defense) {
      d.screenPicked = false;
      d.blockQuality = 0;
      d.blockResult = null;
      if (state.carrier) {
        moveToward(d, state.carrier, d.speed * 1.05 * screenWallSlowdown(d), dt, { turnScale: 0.86, slowRadius: 52 });
      } else if (d.trait === "rush") {
        if (!d.held) {
          moveToward(d, qb, d.speed * (d.id === "LB" ? 1.18 : 1.02), dt, { turnScale: 0.9, slowRadius: 42 });
        }
      } else if (d.trait === "press" || d.trait === "man") {
        const target = manTargetFor(d);
        const cushion = d.trait === "press" ? -8 : 16;
        moveToward(d, { x: target.x + cushion, y: target.y }, d.speed * (d.trait === "press" ? 1.02 : 0.98), dt, { turnScale: 0.72, slowRadius: 56 });
      } else if (isZoneDuty(d.trait)) {
        const zone = zoneLandmark(d);
        const nearest = state.offense.slice(1).sort((a, b) => Math.hypot(a.x - zone.x, a.y - zone.y) - Math.hypot(b.x - zone.x, b.y - zone.y))[0];
        const target = Math.hypot(nearest.x - zone.x, nearest.y - zone.y) < 128 ? nearest : zone;
        backpedalToward(d, target, d.speed * 0.92, dt);
      } else {
        backpedalToward(d, zoneLandmark({ ...d, trait: "hook" }), d.speed * 0.88, dt);
      }
      d.trail.push({ x: d.x, y: d.y });
      d.trail = d.trail.slice(-20);
    }

    if (!state.ball && !state.carrier) {
      const rush = nearestRusherToQB();
      if (rush.rusher && rush.dist < sackRadius) {
        finishSack(rush.rusher, rush.dist);
        return;
      }
      if (rush.rusher && rush.dist < hitThrowRadius) {
        state.qbContact = { rusher: rush.rusher, dist: rush.dist, t: state.t };
      }
    }

    if (state.carrier) {
      const nearest = nearestDefender(state.carrier);
      const runTime = state.t - state.catchInfo.t;
      if (nearest.dist < 20 || runTime > 1.55 || state.carrier.x >= field.x + field.w - 48) {
        finishRunAfterCatch(nearest);
      }
      return;
    }

    const pressure = pressureDistance();
    const pocketPenalty = Math.max(0, 42 - pocketWidth()) * 0.45;
    if (!state.ball && (state.t >= state.throwTime || pressure < 18)) {
      const reads = evaluateReceivers(pressure);
      state.reads = reads;
      const target = reads[0].player;
      const airDistance = Math.hypot(target.x - qb.x, target.y - qb.y);
      const flightTime = Math.max(0.75, Math.min(1.25, airDistance / 260));
      const contactPenalty = state.qbContact && state.t - state.qbContact.t < 0.22 ? 22 : 0;
      const hitPenalty = contactPenalty + pocketPenalty;
      state.ball = { x: qb.x, y: qb.y, target, progress: 0, flightTime, pressure, read: reads[0], hitPenalty };
      logEvent(contactPenalty > 0 ? `${state.qbContact.rusher.id} が接触、崩れた投球。` : pocketPenalty > 0 ? `ポケットが狭く、足場の悪い投球。` : pressure < 18 ? "圧力が近すぎて早投げ。" : `${target.id} を選択。2番手は ${reads[1].id}。`);
      if (contactPenalty > 0) {
        showBanner("bad", "HIT AS THROWN", `${state.qbContact.rusher.id} contact`);
      } else if (pocketPenalty > 0) {
        showBanner("warn", "POCKET COLLAPSE", `width ${Math.round(pocketWidth())}`);
      } else {
        showBanner("info", "PASS", `to ${target.id}`);
      }
    }

    if (state.ball) {
      state.ball.progress += dt / state.ball.flightTime;
      const f = Math.min(1, state.ball.progress);
      state.ball.x += (state.ball.target.x - state.ball.x) * Math.min(1, dt * 5);
      state.ball.y += (state.ball.target.y - state.ball.y) * Math.min(1, dt * 5);
      if (f >= 1) resolveCatch(state.ball.target, state.ball.pressure, state.ball.read, state.ball.hitPenalty);
    }

    if (state.t > maxPlayTime && !state.result) {
      const pressure = pressureDistance();
      const reads = evaluateReceivers(pressure);
      resolveCatch(reads[0].player, pressure, reads[0], 0);
    }
  }

  function catchCheck(receiver, pressure, hitPenalty = 0) {
    const nearest = nearestDefender(receiver);
    const pressurePenalty = Math.max(0, 72 - pressure) * 0.52;
    const trafficPenalty = nearest.defender.role === "S" ? 6 : 0;
    const catchWindow = nearest.dist + receiver.catch * 0.38 - pressurePenalty - trafficPenalty - hitPenalty;
    const success = catchWindow > 43;
    return { nearest, catchWindow, success };
  }

  function resolveCatch(receiver, pressure, read, hitPenalty = 0) {
    const check = catchCheck(receiver, pressure, hitPenalty);
    state.ball = null;
    if (check.success) {
      state.carrier = receiver;
      state.catchInfo = {
        receiver,
        pressure,
        read,
        t: state.t,
        x: receiver.x,
        y: receiver.y,
        catchWindow: check.catchWindow,
        hitPenalty,
        nearestAtCatch: check.nearest,
      };
      showBanner("good", isScreenPlay() && receiver.id === "H" ? "SCREEN WALL" : "CATCH", `${receiver.id} secured`);
      logEvent(isScreenPlay() && receiver.id === "H" ? "H がスクリーンを捕球。LT/C/RT が前へ抜けて壁を作る。" : `${receiver.id} が捕球。キャッチ後ランへ。`);
      updateTopline();
      return;
    }
    finishIncomplete(receiver, pressure, read, check);
  }

  function finishSack(rusher, dist) {
    const loss = Math.max(2, Math.round((losX - state.offense[0].x + 18) / 12));
    state.ballOn = Math.max(1, state.ballOn - loss);
    state.down += 1;
    let next;
    if (state.down > 4) {
      state.drive += 1;
      state.down = 1;
      state.distance = 10;
      state.ballOn = 25;
      next = "4th downでサック、新しいドライブへ。";
    } else {
      state.distance += loss;
      next = `${ordinal(state.down)} & ${state.distance}。`;
    }
    const grade = gradeCall(false, -loss);
    state.result = {
      success: false,
      title: `${rusher.id} がQBサック`,
      detail: `QBは投げられない。接触距離 ${Math.round(dist)} px、loss ${loss} yd。${grade} ${next}`,
    };
    state.result.previewDelta = previewDeltaText(null, "sack", `${rusher.id} reached the QB at ${Math.round(dist)} px.`);
    showBanner("bad", "SACK", `${rusher.id} stops QB`);
    markPreviewDeltaMarker("sack", state.result.previewDelta, previewDeltaBadgeText("sack"));
    logEvent(`${rusher.id} がQBを潰してサック。投球は発生しない。`);
    state.running = false;
    state.ball = null;
    state.carrier = null;
    state.catchInfo = null;
    state.qbContact = null;
    state.actualDefense = null;
    updateTopline();
    renderResult();
  }

  function finishIncomplete(receiver, pressure, read, check) {
    const nearest = check.nearest;
    const next = advanceDrive(false, 0);
    const grade = gradeCall(false, 0);
    state.result = {
      success: false,
      title: "パス失敗",
      detail: `${receiver.id} へのパスは incomplete。${nearest.defender.id} が近く、セパレーション ${Math.round(nearest.dist)}、プレッシャー距離 ${Math.round(pressure)}、捕球窓 ${Math.round(check.catchWindow)}。${grade} ${next}`,
    };
    state.result.previewDelta = previewDeltaText(receiver.id, "incomplete", `${nearest.defender.id} closed the window to ${Math.round(nearest.dist)} px.`);
    showBanner("bad", "INCOMPLETE", `${nearest.defender.id} closed window`);
    markPreviewDeltaMarker("incomplete", state.result.previewDelta, `${previewDeltaBadgeText("incomplete")} ${nearest.defender.id} within ${Math.round(nearest.dist)} px.`);
    logEvent(`${nearest.defender.id} が投球窓を潰した。投球時刻かルートの幅を見直す。`);
    if (read) logEvent(`QB評価: ${read.id} score ${Math.round(read.score)} / sep ${Math.round(read.separation)} / depth ${Math.round(read.depth / 12)}yd`);
    state.running = false;
    state.ball = null;
    state.carrier = null;
    state.qbContact = null;
    state.actualDefense = null;
    updateTopline();
    renderResult();
  }

  function finishRunAfterCatch(nearest) {
    const receiver = state.carrier;
    const info = state.catchInfo;
    const depth = Math.max(0, receiver.x - losX);
    const catchDepth = Math.max(0, info.x - losX);
    const rac = Math.max(0, Math.round((depth - catchDepth) / 12));
    const yards = Math.max(1, Math.round(depth / 12));
    const penaltyText = hasHolding() ? enforceHoldingPenalty() : null;
    const next = penaltyText || advanceDrive(true, yards);
    const grade = gradeCall(true, yards);
    const title = penaltyText ? `${receiver.id} 捕球後 Holding` : `${receiver.id} が捕球、${yards} yd`;
    state.result = {
      success: !penaltyText,
      title,
      detail: `${activeScreenCatch() ? "スクリーン壁あり。 " : ""}捕球窓 ${Math.round(info.catchWindow)}、キャッチ後 ${rac} yd。${nearest.defender.id} が ${Math.round(nearest.dist)} px まで詰めてタックル。${grade} ${next}`,
    };
    state.result.previewDelta = previewDeltaText(receiver.id, penaltyText ? "penalty" : "complete", penaltyText ? "the route worked but holding erased the gain." : `${nearest.defender.id} tackled after ${rac} RAC yards.`);
    showBanner(penaltyText ? "bad" : "info", penaltyText ? "HOLDING" : "TACKLE", penaltyText || `${nearest.defender.id} ends play`);
    markPreviewDeltaMarker(penaltyText ? "penalty" : "complete", state.result.previewDelta, penaltyText ? previewDeltaBadgeText("penalty") : `${previewDeltaBadgeText("complete")} ${nearest.defender.id} ended RAC.`);
    logEvent(penaltyText ? `${receiver.id} の獲得はHoldingで取り消し。${next}` : `${receiver.id} がタックルされて終了。${next}`);
    if (info.read) logEvent(`QB評価: ${info.read.id} score ${Math.round(info.read.score)} / sep ${Math.round(info.read.separation)} / depth ${Math.round(info.read.depth / 12)}yd`);
    state.running = false;
    state.ball = null;
    state.carrier = null;
    state.catchInfo = null;
    state.qbContact = null;
    state.actualDefense = null;
    updateTopline();
    renderResult();
  }

  function gradeCall(success, yards) {
    const play = activePlay();
    const actual = activeDefense();
    const predicted = predictedDefense();
    const readBonus = predicted.call === actual.call ? 3 : -2;
    const counterBonus = counters[play.name] === actual.call ? 4 : -2;
    const repeatPenalty = state.lastPlay === play.name ? Math.min(4, state.repeatCount + 1) : 0;
    const holdingPenalty = [...state.line, ...state.offense].some((p) => p.blockResult === "holding") ? 2 : 0;
    const gainScore = success ? Math.min(8, Math.max(1, Math.round(yards / 2))) : -3;
    const delta = readBonus + counterBonus + gainScore - repeatPenalty - holdingPenalty;
    state.coachScore = Math.max(0, state.coachScore + delta);
    state.streak = delta > 0 ? state.streak + 1 : 0;
    state.repeatCount = state.lastPlay === play.name ? state.repeatCount + 1 : 0;
    state.lastPlay = play.name;
    state.snap += 1;
    const read = readBonus > 0 ? "読み+3" : "読み-2";
    const counter = counterBonus > 0 ? "相性+4" : "相性-2";
    const repeat = repeatPenalty ? `連打-${repeatPenalty}` : "連打0";
    const holding = holdingPenalty ? `Holding-${holdingPenalty}` : "Holding0";
    return `Coach ${delta >= 0 ? "+" : ""}${delta} (${read}, ${counter}, ${repeat}, ${holding})。`;
  }

  function advanceDrive(success, yards) {
    if (success && yards >= state.distance) {
      state.ballOn = Math.min(99, state.ballOn + yards);
      state.down = 1;
      state.distance = Math.min(10, 100 - state.ballOn);
      if (state.ballOn >= 90) return "レッドゾーン突入。1st down。";
      return "1st down 更新。";
    }
    if (success) {
      state.ballOn += yards;
      state.distance = Math.max(1, state.distance - yards);
      state.down += 1;
      if (state.down > 4) {
        state.drive += 1;
        state.down = 1;
        state.distance = 10;
        state.ballOn = 25;
        return "4th downで届かず、新しいドライブへ。";
      }
      return `${ordinal(state.down)} & ${state.distance}。`;
    }
    state.down += 1;
    if (state.down > 4) {
      state.drive += 1;
      state.down = 1;
      state.distance = 10;
      state.ballOn = 25;
      return "4th down 失敗で新しいドライブへ。";
    }
    return `${ordinal(state.down)} & ${state.distance}。`;
  }

  function loop(now) {
    if (!state.last) state.last = now;
    const dt = Math.min(0.033, (now - state.last) / 1000);
    state.last = now;
    if (state.running) {
      if (!state.paused) {
        update(dt * state.speedScale);
        recordReplayFrame();
      }
      draw();
      requestAnimationFrame(loop);
    }
  }

  function drawField() {
    const grad = ctx.createLinearGradient(field.x, field.y, field.x + field.w, field.y);
    grad.addColorStop(0, "#173722");
    grad.addColorStop(0.5, "#245132");
    grad.addColorStop(1, "#17351f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.055)";
    ctx.font = "14px Segoe UI, sans-serif";
    for (let i = 0; i <= 10; i += 1) {
      const x = field.x + (field.w / 10) * i;
      ctx.fillRect(x, field.y, 2, field.h);
      ctx.fillText(String(Math.abs(50 - i * 10)), x + 6, field.y + 28);
    }

    ctx.strokeStyle = "rgba(245,242,233,0.9)";
    ctx.lineWidth = 3;
    ctx.strokeRect(field.x, field.y, field.w, field.h);
    ctx.strokeStyle = "rgba(231,191,90,0.95)";
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(losX, field.y);
    ctx.lineTo(losX, field.y + field.h);
    ctx.stroke();
    ctx.setLineDash([]);
    const firstDownX = Math.min(field.x + field.w - 24, losX + state.distance * yardPx);
    ctx.strokeStyle = "rgba(83,192,122,0.7)";
    ctx.beginPath();
    ctx.moveTo(firstDownX, field.y);
    ctx.lineTo(firstDownX, field.y + field.h);
    ctx.stroke();
  }

  function drawRoutes() {
    for (const p of state.offense) {
      if (p.id === "QB") continue;
      const pts = routeAbs(p.id);
      ctx.strokeStyle = p.id === "H" ? "rgba(111,182,232,0.94)" : "rgba(231,191,90,0.86)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      pts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.stroke();
      pts.forEach((pt, i) => {
        if (i === 0) return;
        ctx.fillStyle = state.edit ? "#f5f2e9" : "rgba(245,242,233,0.72)";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, state.edit ? 8 : 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  function drawTrails() {
    for (const p of [...state.offense, ...state.line, ...state.defense]) {
      if (!p.trail || p.trail.length < 3) continue;
      ctx.strokeStyle = state.offense.includes(p) ? "rgba(245,242,233,0.24)" : "rgba(232,104,95,0.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      p.trail.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.stroke();
    }
  }

  function drawMatchups() {
    if (!state.reads.length) return;
    for (const read of state.reads.slice(0, 3)) {
      const defender = state.defense.find((d) => d.id === read.defender);
      ctx.strokeStyle = read.id === state.reads[0].id ? "rgba(83,192,122,0.62)" : "rgba(245,242,233,0.16)";
      ctx.lineWidth = read.id === state.reads[0].id ? 3 : 1;
      ctx.beginPath();
      ctx.moveTo(read.player.x, read.player.y);
      ctx.lineTo(defender.x, defender.y);
      ctx.stroke();
    }
  }

  function drawPreviewLines() {
    if (!state.showPreviewLines) return;
    if (state.running || state.replaying || state.result || !matchupCard) return;
    const preview = computeMatchupPreview();
    preview.rows.slice(0, 3).forEach((row, index) => {
      if (!row.defenderPoint) return;
      const strong = row.grade >= 66;
      const risky = row.grade < 42;
      ctx.strokeStyle = strong ? "rgba(83,192,122,0.72)" : risky ? "rgba(232,104,95,0.62)" : "rgba(231,191,90,0.62)";
      ctx.fillStyle = strong ? "rgba(83,192,122,0.92)" : risky ? "rgba(232,104,95,0.92)" : "rgba(231,191,90,0.92)";
      ctx.lineWidth = index === 0 ? 3 : 2;
      ctx.setLineDash(index === 0 ? [] : [8, 6]);
      ctx.beginPath();
      ctx.moveTo(row.point.x, row.point.y);
      ctx.lineTo(row.defenderPoint.x, row.defenderPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(row.point.x, row.point.y, index === 0 ? 12 : 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#101316";
      ctx.font = "bold 11px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(row.id, row.point.x, row.point.y + 0.5);

      ctx.fillStyle = "rgba(16,19,22,0.84)";
      ctx.fillRect(row.point.x + 12, row.point.y - 18, 76, 24);
      ctx.fillStyle = "#f5f2e9";
      ctx.textAlign = "left";
      ctx.fillText(`${row.grade} vs ${row.defender}`, row.point.x + 17, row.point.y - 6);
    });
  }

  function drawManTargetLines() {
    if (!state.showManLinks) return;
    if (state.running || state.replaying || state.result) return;
    const defenders = state.defense.filter((p) => p.trait === "man" || p.trait === "press");
    if (!defenders.length) return;
    ctx.save();
    defenders.forEach((defender) => {
      const target = manTargetFor(defender);
      if (!target) return;
      const selected = defender.id === state.selectedDefender;
      ctx.strokeStyle = selected ? "rgba(111,182,232,0.94)" : "rgba(111,182,232,0.46)";
      ctx.fillStyle = selected ? "rgba(111,182,232,0.96)" : "rgba(111,182,232,0.74)";
      ctx.lineWidth = selected ? 3 : 2;
      ctx.setLineDash(defender.trait === "press" ? [] : [7, 5]);
      ctx.beginPath();
      ctx.moveTo(defender.x, defender.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const midX = (defender.x + target.x) / 2;
      const midY = (defender.y + target.y) / 2;
      ctx.beginPath();
      ctx.arc(midX, midY, selected ? 13 : 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#101316";
      ctx.font = "bold 10px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${defender.id}>${target.id}`, midX, midY + 0.5);
    });
    ctx.restore();
  }

  function drawZoneLandmarks() {
    if (!state.showZonePads) return;
    if (state.running || state.replaying || state.result) return;
    const defenders = state.defense.filter((p) => isZoneDuty(p.trait));
    if (!defenders.length) return;
    ctx.save();
    defenders.forEach((defender) => {
      const zone = zoneLandmark(defender);
      const selected = defender.id === state.selectedDefender;
      ctx.fillStyle = selected ? "rgba(231,191,90,0.2)" : "rgba(231,191,90,0.12)";
      ctx.strokeStyle = selected ? "rgba(231,191,90,0.95)" : "rgba(231,191,90,0.58)";
      ctx.lineWidth = selected ? 3 : 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.ellipse(zone.x, zone.y, defender.trait === "deep" ? 54 : 42, defender.trait === "flat" ? 34 : 42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = selected ? "#f5f2e9" : "#e7bf5a";
      ctx.font = "bold 11px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${defender.id} ${defender.trait}`, zone.x, zone.y);
      ctx.strokeStyle = selected ? "rgba(231,191,90,0.72)" : "rgba(231,191,90,0.34)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(defender.x, defender.y);
      ctx.lineTo(zone.x, zone.y);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawWeakCoverageCue() {
    if (state.running || state.replaying || state.result) return;
    const rows = currentCoverageStrength();
    drawSecondWeakCoverageCue(rows);
    const weak = rows[rows.length - 1];
    if (!weak) return;
    const defender = state.defense.find((p) => p.id === weak.id);
    if (!defender) return;
    ctx.save();
    drawWeakCoverageThreat(defender, weak);
    ctx.strokeStyle = "rgba(232,104,95,0.92)";
    ctx.fillStyle = "rgba(232,104,95,0.92)";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(defender.x, defender.y, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "bold 11px Segoe UI, sans-serif";
    const title = `weak ${weak.grade}`;
    const labelWidth = Math.max(128, ctx.measureText(title).width + 18, ctx.measureText(weak.note).width + 18);
    const labelHeight = 32;
    const labelX = clampValue(defender.x + 18, field.x + 8, field.x + field.w - labelWidth - 8);
    const labelY = clampValue(defender.y - 38, field.y + 8, field.y + field.h - labelHeight - 8);
    ctx.fillStyle = "rgba(16,19,22,0.9)";
    ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
    ctx.fillStyle = "#f5f2e9";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(title, labelX + 9, labelY + 11);
    ctx.fillStyle = "#aeb7b4";
    ctx.font = "10px Segoe UI, sans-serif";
    ctx.fillText(weak.note, labelX + 9, labelY + 24);
    ctx.restore();
  }

  function drawSecondWeakCoverageCue(rows = currentCoverageStrength()) {
    const weak = rows[rows.length - 1];
    const second = rows.length > 1 ? rows[rows.length - 2] : null;
    if (!second || (weak && second.id === weak.id)) return;
    const defender = state.defense.find((p) => p.id === second.id);
    if (!defender) return;
    const target = second.targetPoint;
    const style = secondWeakThreatStyle(second);
    ctx.save();
    ctx.strokeStyle = `rgba(231,191,90,${style.lineAlpha})`;
    ctx.fillStyle = `rgba(231,191,90,${style.targetAlpha})`;
    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash([6, 7]);
    ctx.beginPath();
    ctx.arc(defender.x, defender.y, style.ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    if (target) {
      ctx.beginPath();
      ctx.moveTo(defender.x, defender.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(target.x, target.y, style.targetRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.setLineDash([]);
    const label = secondWeakCoverageLabelBounds(second);
    ctx.fillStyle = "rgba(16,19,22,0.78)";
    ctx.fillRect(label.x, label.y, label.w, label.h);
    ctx.fillStyle = "#e7bf5a";
    ctx.font = "bold 10px Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`next weak ${second.grade}`, label.x + 6, label.y + label.h * 0.5);
    ctx.restore();
  }

  function secondWeakThreatStyle(second) {
    const urgency = downDistanceUrgency() * 0.72;
    const danger = clampValue((72 - second.grade) / 62 + urgency, 0.18, 0.86);
    return {
      danger,
      urgency,
      lineWidth: 1.2 + danger * 2.2,
      lineAlpha: 0.3 + danger * 0.42,
      targetAlpha: 0.38 + danger * 0.36,
      ringRadius: 22 + danger * 9,
      targetRadius: 4.5 + danger * 4,
    };
  }

  function secondWeakCoverageLabelBounds(second) {
    if (!second) return null;
    const defender = state.defense.find((p) => p.id === second.id);
    if (!defender) return null;
    const width = 92;
    const height = 18;
    return {
      x: Math.round(clampValue(defender.x + 14, field.x + 8, field.x + field.w - width - 8)),
      y: Math.round(clampValue(defender.y + 20, field.y + 8, field.y + field.h - height - 8)),
      w: width,
      h: height,
    };
  }

  function drawWeakCoverageThreat(defender, weak) {
    const target = weak.targetPoint;
    if (!target) return;
    const style = weakThreatStyle(weak);
    ctx.save();
    ctx.setLineDash([9, 6]);
    ctx.lineWidth = style.lineWidth;
    if (weak.zonePoint) {
      ctx.strokeStyle = `rgba(231,191,90,${style.zoneAlpha})`;
      ctx.beginPath();
      ctx.moveTo(defender.x, defender.y);
      ctx.lineTo(weak.zonePoint.x, weak.zonePoint.y);
      ctx.stroke();
      ctx.strokeStyle = `rgba(232,104,95,${style.threatAlpha})`;
      ctx.beginPath();
      ctx.moveTo(weak.zonePoint.x, weak.zonePoint.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
      ctx.fillStyle = `rgba(231,191,90,${style.zoneAlpha})`;
      ctx.beginPath();
      ctx.arc(weak.zonePoint.x, weak.zonePoint.y, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = `rgba(232,104,95,${style.threatAlpha})`;
      ctx.beginPath();
      ctx.moveTo(defender.x, defender.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(232,104,95,${style.targetAlpha})`;
    ctx.beginPath();
    ctx.arc(target.x, target.y, style.targetRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f5f2e9";
    ctx.font = "bold 10px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(weak.targetId || "route", target.x, target.y - 17);
    ctx.restore();
  }

  function weakThreatStyle(weak) {
    const urgency = downDistanceUrgency();
    const danger = clampValue((66 - weak.grade) / 54 + urgency, 0.24, 1);
    return {
      danger,
      urgency,
      lineWidth: 1.6 + danger * 3.2,
      threatAlpha: 0.42 + danger * 0.5,
      zoneAlpha: 0.34 + danger * 0.42,
      targetAlpha: 0.62 + danger * 0.32,
      targetRadius: 7 + danger * 5,
    };
  }

  function weakCoverageLabelBounds() {
    const rows = currentCoverageStrength();
    const weak = rows[rows.length - 1];
    if (!weak) return null;
    const defender = state.defense.find((p) => p.id === weak.id);
    if (!defender) return null;
    ctx.save();
    ctx.font = "bold 11px Segoe UI, sans-serif";
    const title = `weak ${weak.grade}`;
    const width = Math.max(128, ctx.measureText(title).width + 18, ctx.measureText(weak.note).width + 18);
    ctx.restore();
    const height = 32;
    return {
      x: Math.round(clampValue(defender.x + 18, field.x + 8, field.x + field.w - width - 8)),
      y: Math.round(clampValue(defender.y - 38, field.y + 8, field.y + field.h - height - 8)),
      w: Math.round(width),
      h: height,
    };
  }

  function drawPocket() {
    const qb = state.offense.find((p) => p.id === "QB");
    if (!qb || !state.running) return;
    const width = pocketWidth();
    ctx.fillStyle = width > 58 ? "rgba(83,192,122,0.09)" : width > 24 ? "rgba(231,191,90,0.1)" : "rgba(232,104,95,0.12)";
    ctx.strokeStyle = width > 58 ? "rgba(83,192,122,0.45)" : width > 24 ? "rgba(231,191,90,0.5)" : "rgba(232,104,95,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(qb.x + 34, qb.y, 74, 82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function drawPlayer(p, side) {
    const color = side === "offense" ? "#f5f2e9" : "#24313a";
    const stroke = side === "offense" ? "#101316" : p.trait === "rush" ? "#e7bf5a" : "#e8685f";
    const radius = p.id === "QB" ? 17 : 15;
    ctx.fillStyle = color;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = side === "offense" ? "#101316" : "#f5f2e9";
    ctx.beginPath();
    ctx.moveTo(radius + 7, 0);
    ctx.lineTo(radius - 3, -6);
    ctx.lineTo(radius - 3, 6);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = side === "offense" ? "rgba(16,19,22,0.72)" : "rgba(245,242,233,0.72)";
    ctx.lineWidth = 2;
    const leg = Math.sin(p.stride) * 4;
    ctx.beginPath();
    ctx.moveTo(-2, -radius + 2);
    ctx.lineTo(-10 - leg, -radius - 5);
    ctx.moveTo(-2, radius - 2);
    ctx.lineTo(-10 + leg, radius + 5);
    ctx.moveTo(4, -radius + 3);
    ctx.lineTo(13, -radius + 8);
    ctx.moveTo(4, radius - 3);
    ctx.lineTo(13, radius - 8);
    ctx.stroke();
    if (p.cutFlash > 0) {
      ctx.strokeStyle = "rgba(231,191,90,0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 24, -0.4, 0.8);
      ctx.stroke();
    }
    if (side === "defense" && p.id === state.selectedDefender && !state.running) {
      ctx.strokeStyle = "rgba(111,182,232,0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 9, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (p.engaged || p.held || p.shedFlash > 0 || p.screenBlock || p.screenLead || p.screenPicked) {
      ctx.strokeStyle = p.blockResult === "holding" ? "rgba(232,104,95,0.95)" : p.blockResult === "drive" ? "rgba(83,192,122,0.95)" : p.blockResult === "shed" ? "rgba(231,191,90,0.96)" : p.screenPicked ? "rgba(232,104,95,0.9)" : p.screenLead ? "rgba(83,192,122,0.9)" : p.screenBlock ? "rgba(111,182,232,0.92)" : p.shedFlash > 0 ? "rgba(232,104,95,0.9)" : "rgba(231,191,90,0.85)";
      ctx.lineWidth = 2 + Math.max(0, p.blockQuality || 0) * 4;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (p.screenLead) {
      ctx.strokeStyle = "rgba(83,192,122,0.56)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-radius - 4, -radius - 4);
      ctx.lineTo(radius + 8, 0);
      ctx.lineTo(-radius - 4, radius + 4);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = side === "offense" ? "#101316" : "#f5f2e9";
    ctx.font = "bold 12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.id, p.x, p.y + 1);
  }

  function drawHud() {
    ctx.fillStyle = "rgba(16,19,22,0.84)";
    ctx.fillRect(70, 72, 560, 116);
    ctx.fillStyle = "#e7bf5a";
    ctx.font = "bold 18px Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${activePlay().name} vs ${activeDefense().name}`, 88, 101);
    ctx.fillStyle = "#aeb7b4";
    ctx.font = "14px Segoe UI, sans-serif";
    const editHelp = state.deletePoint ? "中間点をクリックして削除" : state.addPoint ? "フィールドのルート上をクリックして中間点を追加" : "白い点をドラッグしてルートを変える";
    const screenHelp = isScreenPlay() ? `H release ${screenReleaseTime().toFixed(2)} 秒。` : "";
    ctx.fillText(state.edit ? editHelp : `${screenHelp}投球 ${state.throwTime.toFixed(2)} 秒。緑線が1st down`, 88, 127);
    if (state.reads.length) {
      ctx.fillText(`Read: ${state.reads.map((r) => `${r.id} ${Math.round(r.score)}`).join(" / ")}`, 88, 149);
    }
    ctx.fillStyle = "#f5f2e9";
    const mode = state.replaying ? " / REPLAY" : state.paused ? " / PAUSED" : "";
    const bestBlock = Math.max(0, ...[...state.line, ...state.offense, ...state.defense].map((p) => p.blockQuality || 0));
    const blockResult = [...state.line, ...state.offense, ...state.defense].find((p) => p.blockResult)?.blockResult || "none";
    const duties = state.defense.map((p) => `${p.id}:${p.trait}${p.manTarget ? `>${p.manTarget}` : ""}`).join(" ");
    ctx.fillText(`Speed ${state.speedScale.toFixed(2)}x${mode}  Block ${bestBlock.toFixed(2)} ${blockResult}`, 330, 149);
    ctx.fillText(`Duties ${duties}`, 88, 166);
  }

  function drawBanner() {
    if (!state.banner) return;
    const active = state.paused || state.result || state.t <= state.banner.until;
    if (!active) return;
    const palette = {
      good: ["rgba(83,192,122,0.94)", "#101316"],
      bad: ["rgba(232,104,95,0.94)", "#101316"],
      warn: ["rgba(231,191,90,0.94)", "#101316"],
      info: ["rgba(16,19,22,0.9)", "#f5f2e9"],
    };
    const [bg, fg] = palette[state.banner.kind] || palette.info;
    const x = W / 2 - 210;
    const y = 92;
    ctx.fillStyle = bg;
    ctx.strokeStyle = "rgba(245,242,233,0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, 420, 82, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.font = "bold 30px Segoe UI, sans-serif";
    ctx.fillText(state.banner.main, W / 2, y + 36);
    if (state.banner.detail) {
      ctx.font = "14px Segoe UI, sans-serif";
      ctx.fillText(state.banner.detail, W / 2, y + 61);
    }
  }

  function drawPreviewDeltaBadge() {
    if (!state.previewDeltaBadge || !state.replaying && !state.result) return;
    const text = state.previewDeltaBadge.text;
    const shortText = text.length > 88 ? `${text.slice(0, 85)}...` : text;
    const x = field.x + field.w - 386;
    const y = field.y + 20;
    const w = 356;
    const h = 74;
    const palette = {
      complete: ["rgba(83,192,122,0.92)", "#101316"],
      penalty: ["rgba(232,104,95,0.92)", "#101316"],
      sack: ["rgba(232,104,95,0.92)", "#101316"],
      incomplete: ["rgba(231,191,90,0.92)", "#101316"],
    };
    const [accent, fg] = palette[state.previewDeltaBadge.outcome] || palette.incomplete;
    ctx.save();
    ctx.fillStyle = "rgba(16,19,22,0.9)";
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = "bold 12px Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("予測差分", x + 14, y + 12);
    ctx.fillStyle = fg === "#101316" ? "#f5f2e9" : fg;
    ctx.font = "12px Segoe UI, sans-serif";
    ctx.fillText(shortText, x + 14, y + 34);
    ctx.restore();
  }

  function drawBall() {
    if (!state.ball) return;
    ctx.fillStyle = "#8b4a2b";
    ctx.strokeStyle = "#f5f2e9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(state.ball.x, state.ball.y, 11, 7, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function drawCatchMarker() {
    if (!state.catchInfo) return;
    ctx.fillStyle = "rgba(83,192,122,0.14)";
    ctx.strokeStyle = "rgba(83,192,122,0.82)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.catchInfo.x, state.catchInfo.y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f5f2e9";
    ctx.font = "bold 12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CATCH", state.catchInfo.x, state.catchInfo.y - 31);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawField();
    drawRoutes();
    drawPreviewLines();
    drawManTargetLines();
    drawZoneLandmarks();
    drawWeakCoverageCue();
    drawPocket();
    drawTrails();
    drawMatchups();
    state.defense.forEach((p) => drawPlayer(p, "defense"));
    state.line.forEach((p) => drawPlayer(p, "offense"));
    state.offense.forEach((p) => drawPlayer(p, "offense"));
    drawBall();
    drawCatchMarker();
    drawHud();
    drawPreviewDeltaBadge();
    drawBanner();
  }

  function pointerPos(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * W, y: ((event.clientY - rect.top) / rect.height) * H };
  }

  function addPointNear(pos) {
    let best = null;
    for (const p of baseOffense) {
      if (p.id === "QB") continue;
      const pts = routeAbs(p.id);
      for (let i = 0; i < pts.length - 1; i += 1) {
        const a = pts[i];
        const b = pts[i + 1];
        const len2 = Math.max(1, (b.x - a.x) ** 2 + (b.y - a.y) ** 2);
        const t = Math.max(0, Math.min(1, ((pos.x - a.x) * (b.x - a.x) + (pos.y - a.y) * (b.y - a.y)) / len2));
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        const dist = Math.hypot(pos.x - x, pos.y - y);
        if (!best || dist < best.dist) best = { id: p.id, index: i + 1, x: pos.x, y: pos.y, dist };
      }
    }
    if (!best || best.dist > 28) return false;
    const origin = baseOffense.find((p) => p.id === best.id);
    const rel = routeRelative(best.id);
    rel.splice(best.index, 0, [best.x - origin.x, best.y - origin.y]);
    state.routeOverrides[best.id] = rel;
    return true;
  }

  canvas.addEventListener("pointerdown", (event) => {
    if ((!state.edit && !state.defenseEdit && !state.dutyEdit && !state.targetEdit) || state.running) return;
    const pos = pointerPos(event);
    if (state.targetEdit) {
      for (const p of state.defense) {
        if (Math.hypot(pos.x - p.x, pos.y - p.y) < 28) {
          setSelectedDefender(p.id);
          cycleManTarget(p.id);
          return;
        }
      }
      return;
    }
    if (state.dutyEdit) {
      for (const p of state.defense) {
        if (Math.hypot(pos.x - p.x, pos.y - p.y) < 28) {
          setSelectedDefender(p.id);
          cycleDefenseDuty(p.id);
          return;
        }
      }
      return;
    }
    if (state.defenseEdit) {
      for (const p of state.defense) {
        if (Math.hypot(pos.x - p.x, pos.y - p.y) < 26) {
          setSelectedDefender(p.id);
          state.dragging = { kind: "defense", id: p.id };
          canvas.setPointerCapture(event.pointerId);
          return;
        }
      }
      return;
    }
    if (state.deletePoint && deletePointNear(pos)) {
      draw();
      return;
    }
    if (state.addPoint && addPointNear(pos)) {
      draw();
      return;
    }
    for (const p of baseOffense) {
      if (p.id === "QB") continue;
      const pts = routeAbs(p.id);
      for (let i = 1; i < pts.length; i += 1) {
        if (Math.hypot(pos.x - pts[i].x, pos.y - pts[i].y) < 24) {
          state.dragging = { id: p.id, index: i };
          canvas.setPointerCapture(event.pointerId);
          return;
        }
      }
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.dragging) return;
    const pos = pointerPos(event);
    if (state.dragging.kind === "defense") {
      setDefensePoint(state.dragging.id, pos.x, pos.y);
    } else {
      setRoutePoint(state.dragging.id, state.dragging.index, pos.x, pos.y);
    }
    renderMatchupPreview();
    draw();
  });

  canvas.addEventListener("pointerup", () => {
    state.dragging = null;
  });

  snapButton.addEventListener("click", startSnap);
  resetButton.addEventListener("click", () => {
    resetDrive();
  });
  editButton.addEventListener("click", () => {
    state.edit = !state.edit;
    if (state.edit) {
      state.defenseEdit = false;
      state.dutyEdit = false;
      state.targetEdit = false;
      if (defenseEditButton) defenseEditButton.setAttribute("aria-pressed", "false");
      if (dutyEditButton) dutyEditButton.setAttribute("aria-pressed", "false");
      if (targetEditButton) targetEditButton.setAttribute("aria-pressed", "false");
    }
    editButton.setAttribute("aria-pressed", String(state.edit));
    if (!state.edit) {
      state.addPoint = false;
      state.deletePoint = false;
      addPointButton.setAttribute("aria-pressed", "false");
      deletePointButton.setAttribute("aria-pressed", "false");
    }
    updateTopline();
    draw();
  });
  addPointButton.addEventListener("click", () => {
    state.addPoint = !state.addPoint;
    if (state.addPoint) state.deletePoint = false;
    if (state.addPoint && !state.edit) {
      state.edit = true;
      editButton.setAttribute("aria-pressed", "true");
    }
    addPointButton.setAttribute("aria-pressed", String(state.addPoint));
    deletePointButton.setAttribute("aria-pressed", "false");
    updateTopline();
    draw();
  });
  deletePointButton.addEventListener("click", () => {
    state.deletePoint = !state.deletePoint;
    if (state.deletePoint) state.addPoint = false;
    if (state.deletePoint && !state.edit) {
      state.edit = true;
      editButton.setAttribute("aria-pressed", "true");
    }
    deletePointButton.setAttribute("aria-pressed", String(state.deletePoint));
    addPointButton.setAttribute("aria-pressed", "false");
    updateTopline();
    draw();
  });
  savePlayButton.addEventListener("click", () => saveCurrentPlay(false));
  if (saveSlotButton) {
    saveSlotButton.addEventListener("click", () => saveCurrentPlay(true));
  }
  if (moveSlotUpButton) {
    moveSlotUpButton.addEventListener("click", () => moveActiveRouteSlot(-1));
  }
  if (moveSlotDownButton) {
    moveSlotDownButton.addEventListener("click", () => moveActiveRouteSlot(1));
  }
  if (deleteSlotButton) {
    deleteSlotButton.addEventListener("click", deleteActiveSlot);
  }
  if (defenseEditButton) {
    defenseEditButton.addEventListener("click", () => {
      state.defenseEdit = !state.defenseEdit;
      if (state.defenseEdit) {
        state.edit = false;
        state.dutyEdit = false;
        state.targetEdit = false;
        state.addPoint = false;
        state.deletePoint = false;
        editButton.setAttribute("aria-pressed", "false");
        addPointButton.setAttribute("aria-pressed", "false");
        deletePointButton.setAttribute("aria-pressed", "false");
        if (dutyEditButton) dutyEditButton.setAttribute("aria-pressed", "false");
        if (targetEditButton) targetEditButton.setAttribute("aria-pressed", "false");
      }
      defenseEditButton.setAttribute("aria-pressed", String(state.defenseEdit));
      updateTopline();
      draw();
    });
  }
  if (dutyEditButton) {
    dutyEditButton.addEventListener("click", () => {
      state.dutyEdit = !state.dutyEdit;
      if (state.dutyEdit) {
        state.edit = false;
        state.defenseEdit = false;
        state.targetEdit = false;
        state.addPoint = false;
        state.deletePoint = false;
        editButton.setAttribute("aria-pressed", "false");
        addPointButton.setAttribute("aria-pressed", "false");
        deletePointButton.setAttribute("aria-pressed", "false");
        if (defenseEditButton) defenseEditButton.setAttribute("aria-pressed", "false");
        if (targetEditButton) targetEditButton.setAttribute("aria-pressed", "false");
      }
      dutyEditButton.setAttribute("aria-pressed", String(state.dutyEdit));
      updateTopline();
      draw();
    });
  }
  if (targetEditButton) {
    targetEditButton.addEventListener("click", () => {
      state.targetEdit = !state.targetEdit;
      if (state.targetEdit) {
        state.edit = false;
        state.defenseEdit = false;
        state.dutyEdit = false;
        state.addPoint = false;
        state.deletePoint = false;
        editButton.setAttribute("aria-pressed", "false");
        addPointButton.setAttribute("aria-pressed", "false");
        deletePointButton.setAttribute("aria-pressed", "false");
        if (defenseEditButton) defenseEditButton.setAttribute("aria-pressed", "false");
        if (dutyEditButton) dutyEditButton.setAttribute("aria-pressed", "false");
      }
      targetEditButton.setAttribute("aria-pressed", String(state.targetEdit));
      updateTopline();
      draw();
    });
  }
  if (saveDefenseButton) {
    saveDefenseButton.addEventListener("click", () => saveCurrentDefense(false));
  }
  if (newDefenseButton) {
    newDefenseButton.addEventListener("click", () => saveCurrentDefense(true));
  }
  if (duplicateDefenseButton) {
    duplicateDefenseButton.addEventListener("click", duplicateCurrentDefense);
  }
  if (moveDefenseUpButton) {
    moveDefenseUpButton.addEventListener("click", () => moveActiveDefenseSlot(-1));
  }
  if (moveDefenseDownButton) {
    moveDefenseDownButton.addEventListener("click", () => moveActiveDefenseSlot(1));
  }
  if (resetDefenseButton) {
    resetDefenseButton.addEventListener("click", requestDeleteCurrentDefense);
  }
  if (defenderSelect) {
    defenderSelect.addEventListener("change", () => setSelectedDefender(defenderSelect.value));
  }
  if (dutySelect) {
    dutySelect.addEventListener("change", applyDefenderControls);
  }
  if (targetSelect) {
    targetSelect.addEventListener("change", applyDefenderControls);
  }
  if (applyDefenderButton) {
    applyDefenderButton.addEventListener("click", applyDefenderControls);
  }
  if (previewLayerToggle) {
    previewLayerToggle.addEventListener("change", () => {
      state.showPreviewLines = previewLayerToggle.checked;
      persistOverlayPrefs();
      draw();
    });
  }
  if (manLayerToggle) {
    manLayerToggle.addEventListener("change", () => {
      state.showManLinks = manLayerToggle.checked;
      persistOverlayPrefs();
      draw();
    });
  }
  if (zoneLayerToggle) {
    zoneLayerToggle.addEventListener("change", () => {
      state.showZonePads = zoneLayerToggle.checked;
      persistOverlayPrefs();
      draw();
    });
  }
  speedButtons.forEach((button) => {
    button.addEventListener("click", () => setSpeedScale(Number(button.dataset.speed)));
  });
  if (pauseButton) {
    pauseButton.addEventListener("click", () => {
      if (!state.running && !state.result) return;
      if (state.replaying) return;
      setPaused(!state.paused);
    });
  }
  if (replayButton) {
    replayButton.addEventListener("click", startReplay);
  }
  if (frameBackButton) {
    frameBackButton.addEventListener("click", () => showReplayFrame(state.replayIndex - 1));
  }
  if (frameForwardButton) {
    frameForwardButton.addEventListener("click", () => showReplayFrame(state.replayIndex + 1));
  }
  if (replayScrubber) {
    replayScrubber.addEventListener("input", () => showReplayFrame(Number(replayScrubber.value)));
  }
  throwSlider.addEventListener("input", () => {
    state.throwTime = Number(throwSlider.value);
    throwValue.textContent = `${state.throwTime.toFixed(2)}s`;
    renderMatchupPreview();
    draw();
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      startSnap();
    }
    if (event.key === "r" || event.key === "R") {
      resetDrive();
    }
    if (event.key === "p" || event.key === "P") {
      if (state.replaying) return;
      setPaused(!state.paused);
    }
    if (event.key === "l" || event.key === "L") {
      startReplay();
    }
    if (event.key === "," || event.key === "<") {
      showReplayFrame(state.replayIndex - 1);
    }
    if (event.key === "." || event.key === ">") {
      showReplayFrame(state.replayIndex + 1);
    }
    const n = Number(event.key);
    if (n >= 1 && n <= plays.length) setPlay(n - 1);
  });

  function resetDrive() {
    state.routeOverrides = {};
    state.down = 2;
    state.distance = 6;
    state.ballOn = 38;
    state.drive = 1;
    state.snap = 0;
    state.coachScore = 0;
    state.streak = 0;
    state.lastPlay = null;
    state.repeatCount = 0;
    resetFormation();
  }

  window.__playbookLab = {
    snapshot() {
      return {
        selectedPlay: activePlay().name,
        predictedDefense: predictedDefense().name,
        activeDefense: activeDefense().name,
        running: state.running,
        defenseEdit: state.defenseEdit,
        dutyEdit: state.dutyEdit,
        selectedDefender: state.selectedDefender,
        overlayLayers: { reads: state.showPreviewLines, man: state.showManLinks, zone: state.showZonePads },
        overlayStorageKey: overlayStorageKey(),
        manTargetLinks: state.defense.filter((p) => p.trait === "man" || p.trait === "press").map((p) => `${p.id}>${p.manTarget || defaultManTarget(p.id)}`),
        zoneLandmarks: state.defense.filter((p) => isZoneDuty(p.trait)).map((p) => ({ id: p.id, duty: p.trait, x: Math.round(zoneLandmark(p).x), y: Math.round(zoneLandmark(p).y) })),
        coverageStrength: currentCoverageStrength(),
        downDistanceUrgency: downDistanceUrgency(),
        fieldPositionUrgency: fieldPositionUrgency(),
        weakCoverage: currentCoverageStrength().slice(-1)[0] || null,
        secondWeakCoverage: currentCoverageStrength().length > 1 ? currentCoverageStrength().slice(-2)[0] : null,
        secondWeakCoverageLabel: secondWeakCoverageLabelBounds(currentCoverageStrength().length > 1 ? currentCoverageStrength().slice(-2)[0] : null),
        secondWeakThreatStyle: (() => {
          const second = currentCoverageStrength().length > 1 ? currentCoverageStrength().slice(-2)[0] : null;
          return second ? secondWeakThreatStyle(second) : null;
        })(),
        weakCoverageNote: (currentCoverageStrength().slice(-1)[0] || {}).note || null,
        weakCoverageLabel: weakCoverageLabelBounds(),
        weakCoverageTarget: (() => {
          const weak = currentCoverageStrength().slice(-1)[0];
          return weak && weak.targetPoint ? { id: weak.targetId, x: Math.round(weak.targetPoint.x), y: Math.round(weak.targetPoint.y), zone: weak.zonePoint ? { x: Math.round(weak.zonePoint.x), y: Math.round(weak.zonePoint.y) } : null } : null;
        })(),
        weakCoverageThreatStyle: (() => {
          const weak = currentCoverageStrength().slice(-1)[0];
          return weak ? weakThreatStyle(weak) : null;
        })(),
        activeDefenseSlot: activeDefenseSlot() ? activeDefenseSlot().name : null,
        deleteLookConfirming: resetDefenseButton ? resetDefenseButton.dataset.confirming === "true" : false,
        deleteLookAriaLabel: resetDefenseButton ? resetDefenseButton.getAttribute("aria-label") : null,
        deleteLookStatus: deleteLookStatus ? deleteLookStatus.textContent : "",
        deleteLookConfirmTimeoutMs,
        deleteLookConfirmRemainingMs: deleteLookConfirmRemainingMs(),
        deleteLookConfirmProgress: resetDefenseButton ? resetDefenseButton.style.getPropertyValue("--confirm-progress") : "",
        defenseSlots: Object.fromEntries(Object.entries(state.defenseOverrides).map((entry) => [entry[0], entry[1].slots.map((slot) => slot.name)])),
        activeDefenseSlotIndex: (() => {
          const book = defenseBookForCall();
          const slot = activeDefenseSlot();
          return slot ? book.slots.findIndex((entry) => entry.id === slot.id) : -1;
        })(),
        defenseReorderDisabled: {
          up: moveDefenseUpButton ? moveDefenseUpButton.disabled : null,
          down: moveDefenseDownButton ? moveDefenseDownButton.disabled : null,
        },
        savedDefenseCalls: Object.keys(state.defenseOverrides),
        defenseShape: state.defense.map((p) => ({ id: p.id, x: Math.round(p.x), y: Math.round(p.y), trait: p.trait, manTarget: p.manTarget || defaultManTarget(p.id) })),
        preSnapPreview: state.preSnapPreview ? state.preSnapPreview.rows.slice(0, 3).map((row) => ({ id: row.id, grade: row.grade, defender: row.defender })) : [],
        throwTime: state.throwTime,
        speedScale: state.speedScale,
        paused: state.paused,
        banner: state.banner ? state.banner.main : null,
        replayFrames: state.replayFrames.length,
        replayMarkers: state.replayMarkers.map((marker) => ({ label: marker.label, frame: marker.frame })),
        activeReplayMarker: activeReplayMarkerForIndex(state.replayIndex),
        replayMarkerActiveWindowFrames,
        previewDeltaMarker: state.previewDeltaMarker,
        previewDeltaBadge: state.previewDeltaBadge,
        replayIndex: state.replayIndex,
        replaying: state.replaying,
        screenReleased: screenReleased(),
        screenReleaseTime: screenReleaseTime(),
        screenWall: state.line.filter((p) => p.screenLead).map((p) => p.id),
        screenPicks: state.defense.filter((p) => p.screenPicked).map((p) => p.id),
        blockQuality: Math.max(0, ...[...state.line, ...state.offense, ...state.defense].map((p) => p.blockQuality || 0)),
        blockResults: [...state.line, ...state.offense, ...state.defense].filter((p) => p.blockResult).map((p) => ({ id: p.id, result: p.blockResult })),
        holdingPlayers: holdingPlayers(),
        savedPlayNames: Object.entries(state.savedRoutes).filter((entry) => entry[1].slots && entry[1].slots.length).map((entry) => entry[0]),
        savedSlots: savedBookForPlay().slots.map((slot) => ({ id: slot.id, name: slot.name, points: routeSlotSummary(slot) })),
        activeSavedSlot: activeSavedSlot() ? activeSavedSlot().name : null,
        activeSavedSlotIndex: (() => {
          const book = savedBookForPlay();
          const slot = activeSavedSlot();
          return slot ? book.slots.findIndex((entry) => entry.id === slot.id) : -1;
        })(),
        routeReorderDisabled: {
          up: moveSlotUpButton ? moveSlotUpButton.disabled : null,
          down: moveSlotDownButton ? moveSlotDownButton.disabled : null,
        },
        routeOverrides: Object.keys(state.routeOverrides),
        down: state.down,
        distance: state.distance,
        ballOn: state.ballOn,
        coachScore: state.coachScore,
        pocketWidth: Math.round(pocketWidth()),
        snap: state.snap,
        result: state.result,
        previewDelta: state.result && state.result.previewDelta ? state.result.previewDelta : null,
        reads: state.reads.map((r) => ({ id: r.id, score: Math.round(r.score), separation: Math.round(r.separation) })),
      };
    },
    snap: startSnap,
    setPlay,
    setDefense,
    finishFast() {
      if (!state.running) startSnap();
      for (let i = 0; i < 420 && state.running; i += 1) update(1 / 60);
      draw();
      return state.result;
    },
  };

  loadSavedRoutes();
  loadDefenseOverrides();
  loadOverlayPrefs();
  syncOverlayToggles();
  renderPlayList();
  renderSlotList();
  renderDefenseList();
  renderDefenseSlotList();
  renderMatchupPreview();
  throwValue.textContent = `${state.throwTime.toFixed(2)}s`;
  resetFormation();
})();
