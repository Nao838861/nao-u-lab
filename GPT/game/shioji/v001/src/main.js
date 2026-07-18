import { BUILDINGS, BUILD_ORDER, GOODS, MERCHANT_SEAL_TARGET, SAVE_KEY, VERSION } from "./config.js";
import { Soundscape } from "./audio.js";
import { orthogonalLine } from "./pathfinding.js";
import { Renderer } from "./render.js";
import { World } from "./world.js";

const elements = Object.fromEntries([
  "world-canvas", "hud", "funds-value", "population-value", "ship-days-value", "ship-progress-fill",
  "pause-button", "pause-icon", "speed-down", "speed-up", "speed-label", "sound-button", "home-button",
  "advisor", "advisor-title", "advisor-text", "advisor-close", "chapter-ribbon", "build-dock", "build-card-list",
  "cancel-tool", "detail-drawer", "detail-content", "detail-close", "toast-stack", "title-screen",
  "new-game-button", "continue-button", "modal", "modal-kicker", "modal-title", "modal-copy", "modal-results", "modal-actions"
].map((id) => [id, document.getElementById(id)]));

const urlSeed = Number(new URLSearchParams(location.search).get("seed")) || 11;
let world = new World({ seed: urlSeed });
const renderer = new Renderer(elements["world-canvas"]);
const sound = new Soundscape();

const state = {
  screen: "title",
  running: false,
  speedIndex: 0,
  speeds: [1, 2, 4],
  selectedTool: null,
  selectedBuildingId: null,
  hoverTile: null,
  previewBuilding: null,
  previewRoad: null,
  previewValid: false,
  pointerDown: null,
  roadStart: null,
  draggingMap: false,
  lastFrame: performance.now(),
  accumulator: 0,
  lastEventKey: "",
  lastShipWarning: null,
  dismissedAdvisorKey: null,
  lastUiUpdate: 0,
  independenceAnnounced: false,
  modalDismissible: true
};

const dayMilliseconds = () => 920 / state.speeds[state.speedIndex];
const money = (value) => Math.max(0, value).toLocaleString("ja-JP", { maximumFractionDigits: 0 });
const quantity = (value) => value.toLocaleString("ja-JP", { maximumFractionDigits: 1 });
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));

function hasSave() {
  try {
    return Boolean(localStorage.getItem(SAVE_KEY));
  } catch {
    return false;
  }
}

function saveGame() {
  if (state.screen !== "game") return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(world.toJSON()));
  } catch (error) {
    console.warn("save failed", error);
  }
}

function loadGame() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY));
    world = World.fromJSON(data);
    return true;
  } catch (error) {
    console.warn("load failed", error);
    localStorage.removeItem(SAVE_KEY);
    return false;
  }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* storage may be unavailable */ }
}

function startGame(mode) {
  sound.unlock();
  if (mode === "continue" && !loadGame()) world = new World({ seed: urlSeed });
  if (mode === "new") {
    clearSave();
    world = new World({ seed: urlSeed });
  }
  state.screen = "game";
  state.running = false;
  state.selectedTool = null;
  state.selectedBuildingId = null;
  state.lastEventKey = "";
  state.accumulator = 0;
  state.dismissedAdvisorKey = null;
  elements["title-screen"].classList.add("hidden");
  elements.hud.classList.remove("hidden");
  elements["chapter-ribbon"].classList.remove("hidden");
  elements["build-dock"].classList.remove("hidden");
  buildCards();
  renderer.centerOn(world.port());
  updateUi(true);
  showToast("地図は止まっています。畑を置いてから Space で動かせます。", "story");
}

function setRunning(value) {
  if (world.pausedForDecision || world.won && !world.continuedAfterWin) return;
  state.running = value;
  elements["pause-icon"].textContent = value ? "Ⅱ" : "▶";
  elements["pause-button"].setAttribute("aria-label", value ? "一時停止" : "再開");
}

function toggleRunning() {
  sound.unlock();
  if (state.screen === "title") {
    startGame(hasSave() ? "continue" : "new");
    return;
  }
  if (!elements.modal.classList.contains("hidden")) return;
  setRunning(!state.running);
}

function buildCards() {
  const cards = BUILD_ORDER.map((type, index) => {
    const definition = BUILDINGS[type];
    const unlocked = definition.unlock <= world.unlockTier;
    return `<button class="build-card ${unlocked ? "" : "locked"}" data-tool="${type}" data-testid="build-${type}" type="button" aria-label="${definition.name}">
      <span class="build-icon">${definition.icon}</span><span>${definition.name}</span><small>${definition.cost}金</small>
    </button>`;
  }).join("");
  elements["build-card-list"].innerHTML = cards;
  elements["build-card-list"].querySelectorAll(".build-card").forEach((card) => {
    card.addEventListener("click", () => selectTool(card.dataset.tool));
  });
  document.querySelector("[data-tool='road']").onclick = () => selectTool("road");
  refreshToolSelection();
}

function selectTool(tool) {
  sound.unlock();
  if (tool !== "road" && BUILDINGS[tool].unlock > world.unlockTier) {
    showToast(`「${BUILDINGS[tool].name}」は第${BUILDINGS[tool].unlock}章で開きます。`, "warning");
    return;
  }
  state.selectedTool = state.selectedTool === tool ? null : tool;
  state.selectedBuildingId = null;
  state.previewRoad = null;
  state.previewBuilding = null;
  state.roadStart = null;
  elements["detail-drawer"].classList.add("hidden");
  refreshToolSelection();
}

function cancelTool() {
  state.selectedTool = null;
  state.previewRoad = null;
  state.previewBuilding = null;
  state.roadStart = null;
  refreshToolSelection();
}

function refreshToolSelection() {
  document.querySelectorAll(".build-card").forEach((card) => card.classList.toggle("selected", card.dataset.tool === state.selectedTool));
  elements["cancel-tool"].classList.toggle("hidden", !state.selectedTool);
  elements["world-canvas"].style.cursor = state.selectedTool ? "crosshair" : "grab";
}

function updatePreview(tile) {
  state.hoverTile = tile;
  if (!tile || !state.selectedTool) {
    state.previewBuilding = null;
    if (!state.roadStart) state.previewRoad = null;
    return;
  }
  if (state.selectedTool === "road") {
    if (!state.roadStart) return;
    const points = orthogonalLine(state.roadStart, tile);
    const validation = world.validateRoad(points);
    state.previewRoad = points;
    state.previewValid = validation.ok;
  } else {
    const validation = world.validateBuilding(state.selectedTool, tile.x, tile.y);
    state.previewBuilding = tile;
    state.previewValid = validation.ok;
  }
}

function handlePlacement(tile) {
  if (!tile || !state.selectedTool) return;
  if (state.selectedTool === "road") return;
  const result = world.placeBuilding(state.selectedTool, tile.x, tile.y);
  if (!result.ok) {
    showToast(result.reason, "warning");
    sound.play("warning");
    return;
  }
  sound.play("build");
  renderer.addEffect("ring", tile, { color: "#f2cd66" });
  renderer.addEffect("text", tile, { color: "#fff0a2", text: `−${BUILDINGS[state.selectedTool].cost}` });
  showNewEvents();
  saveGame();
  updateUi(true);
}

function finishRoad(tile) {
  if (!state.roadStart || !tile) return;
  const result = world.planRoad(state.roadStart, tile);
  if (!result.ok) {
    showToast(result.reason, "warning");
    sound.play("warning");
  } else {
    sound.play("build");
    renderer.addEffect("ring", tile, { color: "#f2cd66" });
    showNewEvents();
    saveGame();
  }
  state.roadStart = null;
  state.previewRoad = null;
  updateUi(true);
}

function pointerTile(event) {
  return renderer.screenToTile(event.clientX, event.clientY);
}

elements["world-canvas"].addEventListener("pointerdown", (event) => {
  if (state.screen !== "game" || !elements.modal.classList.contains("hidden")) return;
  sound.unlock();
  const tile = pointerTile(event);
  state.pointerDown = { x: event.clientX, y: event.clientY, tile };
  state.draggingMap = false;
  elements["world-canvas"].setPointerCapture(event.pointerId);
  if (state.selectedTool === "road") {
    state.roadStart = tile;
    updatePreview(tile);
  }
});

elements["world-canvas"].addEventListener("pointermove", (event) => {
  const tile = pointerTile(event);
  if (state.pointerDown && !state.selectedTool) {
    const dx = event.clientX - state.pointerDown.x;
    const dy = event.clientY - state.pointerDown.y;
    if (Math.hypot(dx, dy) > 5) {
      state.draggingMap = true;
      renderer.panBy(dx, dy);
      state.pointerDown.x = event.clientX;
      state.pointerDown.y = event.clientY;
    }
  }
  updatePreview(tile);
});

elements["world-canvas"].addEventListener("pointerup", (event) => {
  const tile = pointerTile(event);
  if (state.selectedTool === "road") finishRoad(tile);
  else if (state.selectedTool) handlePlacement(tile);
  else if (!state.draggingMap && tile) selectBuildingAt(tile);
  state.pointerDown = null;
  state.draggingMap = false;
});

elements["world-canvas"].addEventListener("pointercancel", () => {
  state.pointerDown = null;
  state.roadStart = null;
  state.previewRoad = null;
});

elements["world-canvas"].addEventListener("contextmenu", (event) => {
  event.preventDefault();
  cancelTool();
});

elements["world-canvas"].addEventListener("wheel", (event) => {
  event.preventDefault();
  const oldZoom = renderer.zoom;
  renderer.zoom = Math.max(.8, Math.min(1.65, renderer.zoom * (event.deltaY > 0 ? .9 : 1.1)));
  if (oldZoom !== renderer.zoom) renderer.resize();
}, { passive: false });

function selectBuildingAt(tile) {
  const building = world.buildingAt(tile.x, tile.y);
  state.selectedBuildingId = building?.id || null;
  if (!building) {
    elements["detail-drawer"].classList.add("hidden");
    return;
  }
  renderBuildingDetail(building);
}

function flowGoodLabel(building, key) {
  const good = BUILDINGS[building.type][key];
  return good ? `${GOODS[good].icon} ${GOODS[good].name}` : "—";
}

function renderBuildingDetail(building) {
  const definition = BUILDINGS[building.type];
  const household = building.household;
  const market = building.marketId ? world.buildingById(building.marketId) : null;
  let body = `<div class="detail-head"><span class="detail-emblem" style="background:${definition.color}">${definition.icon}</span><div><h2>${definition.name}</h2><p>${definition.description}</p></div></div>`;

  if (building.type === "market") {
    const largestShortage = Object.entries(building.market.prices).sort((a, b) => b[1] / GOODS[b[0]].basePrice - a[1] / GOODS[a[0]].basePrice)[0];
    body += `<div class="flow-line"><div class="flow-node"><small>最大の品薄</small><strong>${GOODS[largestShortage[0]].icon} ${GOODS[largestShortage[0]].name}</strong></div><div class="flow-arrow">→</div><div class="flow-node"><small>直近価格</small><strong>${quantity(largestShortage[1])}金</strong></div><div class="flow-arrow">→</div><div class="flow-node"><small>今日の取引</small><strong>${quantity(building.market.dayVolume[largestShortage[0]])}荷</strong></div></div>`;
    body += `<div class="detail-grid">${Object.entries(building.market.prices).map(([good, price]) => `<div class="detail-stat"><span>${GOODS[good].icon} ${GOODS[good].name}</span><strong>${quantity(price)}金</strong><small>${building.market.lastTradeDay[good] === world.day ? "本日の成約" : `前回 Day ${building.market.lastTradeDay[good] || "—"}`}</small></div>`).join("")}</div>`;
  } else if (building.type === "port") {
    const contract = world.activeContract;
    const stored = contract ? contract.goods.reduce((sum, good) => sum + building.inventory[good], 0) : 0;
    body += `<div class="flow-line"><div class="flow-node"><small>次便契約</small><strong>${contract ? contract.title : "選択待ち"}</strong></div><div class="flow-arrow">→</div><div class="flow-node"><small>港に到着</small><strong>${quantity(stored)}荷</strong></div><div class="flow-arrow">→</div><div class="flow-node ${contract && stored < contract.target ? "stopped" : ""}"><small>必要量</small><strong>${contract ? contract.target : "—"}荷</strong></div></div>`;
    body += `<div class="detail-grid"><div class="detail-stat"><span>島内商い</span><strong>${Math.round(world.residentTradeShare * 100)}%</strong></div><div class="detail-stat"><span>食卓安定</span><strong>${world.hungerFreeDays}日</strong></div><div class="detail-stat"><span>空き区画待ち</span><strong>${world.waitingSettlers.length}家</strong></div></div>`;
    if (!world.emergencyCreditUsed && world.funds <= 90) body += `<button class="detail-action warning" data-emergency-credit type="button">本土へ緊急信用180金を申請する<small>一度だけ。島史に記録されます</small></button>`;
  } else if (building.warehouse) {
    const stored = Object.entries(building.inventory).filter(([, amount]) => amount > 0.05);
    body += `<div class="flow-line"><div class="flow-node"><small>余剰を買う</small><strong>市場より控えめ</strong></div><div class="flow-arrow">→</div><div class="flow-node"><small>最低備蓄</small><strong>${stored.length ? stored.map(([good, amount]) => `${GOODS[good].icon}${quantity(amount)}`).join(" ") : "空"}</strong></div><div class="flow-arrow">→</div><div class="flow-node"><small>不足時に売る</small><strong>住民を優先</strong></div></div>`;
    body += `<div class="detail-grid"><div class="detail-stat"><span>組合資金</span><strong>${money(building.warehouse.cash)}金</strong></div><div class="detail-stat"><span>所属市場</span><strong>${market ? `第${market.id}市` : "なし"}</strong></div><div class="detail-stat"><span>役割</span><strong>価格と在庫の緩衝</strong></div></div>`;
  } else {
    const inputLabel = flowGoodLabel(building, "input");
    const outputLabel = flowGoodLabel(building, "output");
    body += `<div class="flow-line"><div class="flow-node ${building.idleReason ? "stopped" : ""}"><small>入力</small><strong>${inputLabel}</strong></div><div class="flow-arrow">→</div><div class="flow-node ${building.idleReason ? "stopped" : ""}"><small>いま</small><strong>${escapeHtml(building.activity || building.idleReason || (building.vacant ? "入植待ち" : "準備中"))}</strong></div><div class="flow-arrow">→</div><div class="flow-node"><small>出力</small><strong>${outputLabel}</strong></div></div>`;
    body += `<div class="detail-grid"><div class="detail-stat"><span>世帯</span><strong>${household ? escapeHtml(household.name) : "空き"}</strong><small>${household ? `${household.members}人・${money(household.cash)}金` : "次の船で入植"}</small></div><div class="detail-stat"><span>所属市場</span><strong>${market ? `第${market.id}市` : "なし"}</strong></div><div class="detail-stat"><span>本日の生産</span><strong>${quantity(building.lastOutput)}荷</strong><small>${building.idleReason || ""}</small></div></div>`;
    if (building.merchant) body += `<div class="detail-grid"><div class="detail-stat"><span>荷馬車</span><strong>${building.merchant.trip ? "移動中" : "待機"}</strong></div><div class="detail-stat"><span>運んだ荷</span><strong>${quantity(building.merchant.lifetimeGoods)}荷</strong></div><div class="detail-stat"><span>判断</span><strong>${escapeHtml(building.merchant.lastDecision)}</strong></div></div>`;
  }
  elements["detail-content"].innerHTML = body;
  const emergency = elements["detail-content"].querySelector("[data-emergency-credit]");
  if (emergency) emergency.onclick = () => {
    if (!world.requestEmergencyCredit()) return;
    sound.play("warning");
    showToast("緊急信用180金を受け取りました。立て直しは島の流れで。", "warning");
    saveGame();
    renderBuildingDetail(building);
    updateUi(true);
  };
  elements["detail-drawer"].classList.remove("hidden");
}

function showToast(text, kind = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${kind}`;
  toast.textContent = text;
  elements["toast-stack"].append(toast);
  while (elements["toast-stack"].children.length > 4) elements["toast-stack"].firstElementChild.remove();
  setTimeout(() => toast.remove(), 4300);
}

function showNewEvents() {
  const event = world.events[0];
  if (!event) return;
  const key = `${event.day}:${event.text}`;
  if (key === state.lastEventKey) return;
  state.lastEventKey = key;
  showToast(event.text, event.kind);
  if (["build", "success", "warning", "ship", "victory"].includes(event.kind)) sound.play(event.kind);
  if (event.point) renderer.addEffect("ring", event.point, { color: event.kind === "warning" ? "#de6753" : "#f2cf65" });
}

function advisorMessage() {
  const hasFarm = world.buildings.some((building) => building.type === "farm") || world.constructions.some((item) => item.type === "farm");
  if (!hasFarm) return { key: "farm", title: "最初の一手", text: "黄色い肥沃地に畑区画を置きましょう。近場は早く、遠場は後で大きな市になります。" };
  if (world.funds <= 90 && !world.emergencyCreditUsed) return { key: "credit", title: "金庫が薄い時", text: "港の帆印を開くと、一度だけ本土信用を申請できます。使った事実は島史に残ります。" };
  if (!state.running && world.day < 4) return { key: "start", title: "時間を動かす", text: "Spaceか中央の▶で時間を進めます。建設隊と本物の荷が動き始めます。" };
  if (!world.seals.life) return { key: "first", title: "最初の食卓", text: "港が穀物を買い集めています。残り10日で荷の流れを確かめましょう。" };
  const hasLogger = world.buildings.some((building) => building.type === "logger") || world.constructions.some((item) => item.type === "logger");
  if (!hasLogger) return { key: "logger", title: "森への道", text: "第一章印が灯りました。森の近くへ木こり小屋を置き、道をつなぎましょう。" };
  const hasSawmill = world.buildings.some((building) => building.type === "sawmill") || world.constructions.some((item) => item.type === "sawmill");
  if (!hasSawmill) return { key: "sawmill", title: "丸太を材木へ", text: "製材所がなければ丸太は契約の材木になりません。市場への近さも大切です。" };
  if (!world.seals.timber) return { key: "timber", title: "造船材の勅許", text: "丸太が製材所へ届いているか、建物を選んで一本線を確認できます。" };
  if (world.markets().length < 2) return { key: "market2", title: "二つ目の市", text: "森側に市場を置くと現地価格が生まれます。港市場とは別の暮らしが始まります。" };
  const hasTradehouse = world.buildings.some((building) => building.type === "tradehouse") || world.constructions.some((item) => item.type === "tradehouse");
  if (!hasTradehouse) return { key: "tradehouse", title: "商家を迎える", text: "商家区画を置けば、世帯が自分の荷馬車で価格差を探し始めます。" };
  if (!world.seals.trade) return { key: "trade", title: "荷馬車の道", text: "二つの市場が道で連続していれば、商人が相場を見に走ります。経路は命令できません。" };
  if (!world.independenceStatus.ready) return { key: "independence", title: "独立まで", text: `暮らし${world.hungerFreeDays}/30日・島内商い${Math.round(world.residentTradeShare * 100)}/55%。流れを安定させましょう。` };
  return { key: "ready", title: "旗を選ぶ時", text: "三つの章印が揃いました。港の帆印から独立を申請できます。" };
}

function updateAdvisor() {
  const message = advisorMessage();
  if (!message || state.dismissedAdvisorKey === message.key) {
    elements.advisor.classList.add("hidden");
    return;
  }
  elements["advisor-title"].textContent = message.title;
  elements["advisor-text"].textContent = message.text;
  elements.advisor.classList.remove("hidden");
  elements["chapter-ribbon"].style.opacity = window.innerWidth < 760 && !elements.advisor.classList.contains("hidden") ? ".2" : "1";
}

function updateUi(force = false) {
  const now = performance.now();
  if (!force && now - state.lastUiUpdate < 160) return;
  state.lastUiUpdate = now;
  elements["funds-value"].textContent = money(world.funds);
  elements["population-value"].textContent = world.population;
  const remaining = Math.max(0, world.nextShipDay - world.day);
  elements["ship-days-value"].textContent = remaining;
  elements["ship-progress-fill"].style.width = `${Math.round(world.shipAtSea * 100)}%`;
  elements["speed-label"].textContent = `×${state.speeds[state.speedIndex]}`;
  elements["pause-icon"].textContent = state.running ? "Ⅱ" : "▶";
  for (const [seal, lit] of Object.entries(world.seals)) {
    const button = document.querySelector(`[data-seal='${seal}']`);
    button.classList.toggle("lit", lit);
  }
  elements["home-button"].classList.toggle("ready", world.independenceStatus.ready && !world.won);
  updateAdvisor();
  if (state.selectedBuildingId) {
    const building = world.buildingById(state.selectedBuildingId);
    if (building) renderBuildingDetail(building);
  }
}

function openModal({ kicker = "", title = "", copy = "", results = "", actions = "", dismissible = true }) {
  setRunning(false);
  state.modalDismissible = dismissible;
  elements["modal-kicker"].textContent = kicker;
  elements["modal-title"].textContent = title;
  elements["modal-copy"].textContent = copy;
  elements["modal-results"].innerHTML = results;
  elements["modal-actions"].innerHTML = actions;
  elements.modal.classList.remove("hidden");
  requestAnimationFrame(() => elements["modal-actions"].querySelector("button")?.focus());
}

function closeModal(force = false) {
  if (!force && !state.modalDismissible) return false;
  elements.modal.classList.add("hidden");
  state.modalDismissible = true;
  return true;
}

function showShipModal() {
  const result = world.lastShipResult;
  if (!result) return;
  const contractTitle = result.contract?.title || "定期船";
  const results = `<div class="result-chip"><span>積荷</span><strong>${quantity(result.delivered)}荷</strong></div><div class="result-chip"><span>報酬</span><strong>${result.reward}金</strong></div><div class="result-chip"><span>新しい家族</span><strong>${result.arrivals}家</strong></div>`;
  const choices = world.pendingContractChoices.map((contract) => `<button class="contract-choice" data-contract="${contract.id}" type="button"><em>${contract.reward}金</em><strong>${contract.badge}　${contract.title}</strong><small>${contract.subtitle}・${contract.target}荷</small></button>`).join("");
  openModal({
    kicker: `第${result.shipNumber}便・${result.success ? "契約達成" : "未達"}`,
    title: result.success ? `${contractTitle}、積込完了` : `${contractTitle}、届かず`,
    copy: result.success ? "港へ集まった実在の荷を積みました。次の便まで、島に残す流れを選びます。" : "不足した荷は水増しされません。島は続きます。要求を見直して次便へ備えましょう。",
    results,
    actions: choices,
    dismissible: false
  });
  elements["modal-actions"].querySelectorAll("[data-contract]").forEach((button) => {
    button.addEventListener("click", () => {
      world.chooseContract(button.dataset.contract);
      closeModal(true);
      buildCards();
      saveGame();
      updateUi(true);
      setRunning(true);
    });
  });
  sound.play(result.success ? "ship" : "warning");
}

function showSealModal(seal) {
  const copyBySeal = {
    life: ["食卓の章印", "船へ食を届けるだけでなく、島民の食卓を切らさない流れ。", world.seals.life ? "灯っています" : "最初の食卓を達成する"],
    timber: ["森の道の章印", "木こりから製材所、港まで、材木が実際に届く流れ。", world.seals.timber ? "灯っています" : "造船材の勅許を達成する"],
    trade: ["二つの市の章印", `商人が自分の荷馬車で市場間を${MERCHANT_SEAL_TARGET}荷以上運ぶ。`, world.seals.trade ? "灯っています" : `${quantity(world.stats.merchantGoods)}/${MERCHANT_SEAL_TARGET}荷`]
  };
  const [title, copy, progress] = copyBySeal[seal];
  const independence = world.independenceStatus;
  let actions = `<button class="modal-main-action" data-close-modal type="button">地図へ戻る</button>`;
  if (independence.ready && !world.won) actions = `<button class="modal-main-action" data-independence type="button">会社旗を降ろし、独立を申請する</button>${actions}`;
  openModal({ kicker: "港の旗章", title, copy, results: `<div class="result-chip"><span>現在</span><strong>${progress}</strong></div><div class="result-chip"><span>食卓安定</span><strong>${world.hungerFreeDays}/30日</strong></div><div class="result-chip"><span>島内商い</span><strong>${Math.round(world.residentTradeShare * 100)}/55%</strong></div>`, actions });
  bindCommonModalActions();
}

function showIndependenceModal() {
  openModal({
    kicker: "三つの章印が揃いました",
    title: "この島の旗を選ぶ",
    copy: "食卓、森への道、二つの市。会社が用意した区画ではなく、島民同士の流れが島を支えています。申請はあなたが決めます。",
    results: `<div class="result-chip"><span>食卓安定</span><strong>${world.hungerFreeDays}日</strong></div><div class="result-chip"><span>島内商い</span><strong>${Math.round(world.residentTradeShare * 100)}%</strong></div>`,
    actions: `<button class="modal-main-action" data-independence type="button">独立を申請する</button><button class="contract-choice" data-close-modal type="button"><strong>まだ島を整える</strong><small>地図へ戻ります</small></button>`
  });
  bindCommonModalActions();
}

function showVictoryModal() {
  openModal({
    kicker: "INDEPENDENCE",
    title: "潮路は、島のものになった",
    copy: "会社旗は降りました。畑から食卓へ、森から工房へ、市場から市場へ。命令ではなく、つながった流れが島を動かしています。",
    results: `<div class="result-chip"><span>島民</span><strong>${world.population}人</strong></div><div class="result-chip"><span>運んだ商荷</span><strong>${quantity(world.stats.merchantGoods)}荷</strong></div><div class="result-chip"><span>島の日々</span><strong>${world.day}日</strong></div>`,
    actions: `<button class="modal-main-action" data-continue-free type="button">この島を続ける</button><button class="contract-choice" data-new-island type="button"><strong>新しい島をひらく</strong><small>現在の島は保存されています</small></button>`,
    dismissible: false
  });
  elements["modal-actions"].querySelector("[data-continue-free]").onclick = () => {
    world.continueAfterVictory();
    closeModal(true);
    saveGame();
    setRunning(true);
  };
  elements["modal-actions"].querySelector("[data-new-island]").onclick = () => {
    saveGame();
    world = new World({ seed: urlSeed + 1 });
    closeModal(true);
    buildCards();
    updateUi(true);
    setRunning(false);
  };
  sound.play("victory");
}

function bindCommonModalActions() {
  const close = elements["modal-actions"].querySelector("[data-close-modal]");
  if (close) close.onclick = closeModal;
  const independence = elements["modal-actions"].querySelector("[data-independence]");
  if (independence) independence.onclick = () => {
    if (world.declareIndependence()) {
      renderer.addEffect("ring", world.port(), { duration: 2.2, color: "#ffe18a" });
      saveGame();
      showVictoryModal();
    }
  };
}

function onDayAdvanced() {
  showNewEvents();
  if (world.day % 5 === 0) saveGame();
  const remaining = world.nextShipDay - world.day;
  if (remaining === 10 && state.lastShipWarning !== world.nextShipDay) {
    state.lastShipWarning = world.nextShipDay;
    sound.play("bell");
    showToast("鐘が鳴りました。船まであと10日。港へ向かう荷を確かめましょう。", "ship");
    renderer.addEffect("ring", world.port(), { duration: 1.8, color: "#ffe27b" });
  }
  if (world.pausedForDecision && world.lastShipResult) showShipModal();
  if (world.independenceStatus.ready && !state.independenceAnnounced && !world.won) {
    state.independenceAnnounced = true;
    showToast("三つの章印が揃いました。港の帆印から独立を申請できます。", "success");
    sound.play("success");
  }
  updateUi(true);
}

function animate(now) {
  const delta = Math.min(100, now - state.lastFrame);
  state.lastFrame = now;
  if (state.screen === "game" && state.running && !world.pausedForDecision) {
    state.accumulator += delta;
    const step = dayMilliseconds();
    let safety = 0;
    while (state.accumulator >= step && safety < 5 && !world.pausedForDecision) {
      state.accumulator -= step;
      world.tickDay();
      onDayAdvanced();
      safety += 1;
    }
  }
  renderer.draw(world, state);
  updateUi();
  requestAnimationFrame(animate);
}

elements["new-game-button"].onclick = () => startGame("new");
elements["continue-button"].onclick = () => startGame("continue");
elements["continue-button"].classList.toggle("hidden", !hasSave());
elements["pause-button"].onclick = toggleRunning;
elements["speed-down"].onclick = () => { state.speedIndex = Math.max(0, state.speedIndex - 1); updateUi(true); };
elements["speed-up"].onclick = () => { state.speedIndex = Math.min(state.speeds.length - 1, state.speedIndex + 1); updateUi(true); };
elements["sound-button"].onclick = () => { sound.unlock(); elements["sound-button"].textContent = sound.toggle() ? "音" : "無"; };
elements["home-button"].onclick = () => {
  sound.unlock();
  renderer.centerOn(world.port());
  if (world.independenceStatus.ready && !world.won) showIndependenceModal();
  else selectBuildingAt(world.port());
};
elements["advisor-close"].onclick = () => { state.dismissedAdvisorKey = advisorMessage()?.key; elements.advisor.classList.add("hidden"); elements["chapter-ribbon"].style.opacity = "1"; };
elements["cancel-tool"].onclick = cancelTool;
elements["detail-close"].onclick = () => { state.selectedBuildingId = null; elements["detail-drawer"].classList.add("hidden"); };
document.querySelectorAll("[data-seal]").forEach((button) => button.addEventListener("click", () => showSealModal(button.dataset.seal)));

window.addEventListener("resize", () => renderer.resize());
window.addEventListener("beforeunload", saveGame);
window.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  if (event.code === "Space") {
    event.preventDefault();
    toggleRunning();
  } else if (event.key === "Escape") {
    cancelTool();
    closeModal();
  } else if (event.key === "+" || event.key === "=") {
    state.speedIndex = Math.min(state.speeds.length - 1, state.speedIndex + 1);
  } else if (event.key === "-") {
    state.speedIndex = Math.max(0, state.speedIndex - 1);
  } else if (/^[1-9]$/.test(event.key) && state.screen === "game") {
    const tools = ["road", ...BUILD_ORDER];
    const tool = tools[Number(event.key) - 1];
    if (tool) selectTool(tool);
  }
});

window.__SHIOJI__ = {
  get world() { return world; },
  get state() { return state; },
  get renderer() { return renderer; },
  startGame,
  saveGame,
  VERSION
};

renderer.draw(world, state);
requestAnimationFrame(animate);
