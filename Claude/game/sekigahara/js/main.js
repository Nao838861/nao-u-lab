// 関ヶ原 1600 — 描画と再生（部隊シミュは sim.js、史実シナリオは scenario.js）
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { UNITS, SIDE } from './units.js';
import { createSim, stepSim, prepare, hhmm, koku, sideTotals, T_START, T_END, SIM_DT } from './sim.js';
import { cardMaps } from './maps.js';
import { officerProfile, loadOfficerPortrait } from './officers.js';
import { applyGroundDetail, nearbyStubble } from './terrain.js';
import { PARAMS, makeBrain, retarget, EVENTS, DEFAULT_OPTS, OPTIONS, ROUT_EVENTS, routText } from './scenario.js';

// ───────────────── 地形データ ─────────────────
const M = window.DEM_META;
const DW = M.width, DH = M.height, SX = M.meters_x, SY = M.meters_y;
const DEM = (() => {
  const bin = atob(window.DEM_B64);
  const u16 = new Uint16Array(DW * DH);
  for (let i = 0; i < u16.length; i++) u16[i] = bin.charCodeAt(i * 2) | (bin.charCodeAt(i * 2 + 1) << 8);
  const f = new Float32Array(u16.length);
  for (let i = 0; i < f.length; i++) f[i] = u16[i] / 10;
  return f;
})();
const CLON = (M.west + M.east) / 2, CLAT = (M.north + M.south) / 2;
export function ll2xz(lon, lat) {
  return [(lon - CLON) / (M.east - M.west) * SX, (CLAT - lat) / (M.north - M.south) * SY];
}
export function heightAt(x, z) {
  const u = Math.min(Math.max((x / SX + 0.5) * (DW - 1), 0), DW - 1.001);
  const v = Math.min(Math.max((z / SY + 0.5) * (DH - 1), 0), DH - 1.001);
  const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j;
  const a = DEM[j * DW + i], b = DEM[j * DW + i + 1], c = DEM[(j + 1) * DW + i], d = DEM[(j + 1) * DW + i + 1];
  return (a * (1 - fu) + b * fu) * (1 - fv) + (c * (1 - fu) + d * fu) * fv;
}

// ───────────────── レンダラ ─────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.getElementById('view').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xc8ccc6, 0.00016);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 2, 60000);
const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minDistance = 8;
controls.maxDistance = 16000;
controls.screenSpacePanning = false;
controls.zoomToCursor = true;

// 空（朝の薄曇り）
{
  const g = new THREE.SphereGeometry(30000, 32, 16);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x8fa6bd) }, hor: { value: new THREE.Color(0xdad8cf) } },
    vertexShader: 'varying vec3 p; void main(){ p = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top, hor; varying vec3 p; void main(){ float h = clamp(normalize(p).y*2.2,0.,1.); gl_FragColor = vec4(mix(hor, top, h),1.); }',
  });
  const sky = new THREE.Mesh(g, m);
  sky.renderOrder = -1;
  scene.add(sky);
  scene.userData.sky = sky;
}
// 光：朝8時頃、東南東の低い太陽
const sun = new THREE.DirectionalLight(0xfff1dc, 2.4);
sun.position.set(6000, 3800, 2600);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xc4d0dc, 0x5a5040, 1.15));

// ───────────────── 地形 ─────────────────
let updateStubble, terrain;
{
  const geo = new THREE.PlaneGeometry(SX, SY, DW - 1, DH - 1);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, DEM[i]);
  geo.computeVertexNormals();
  const loader = new THREE.TextureLoader();
  const grain = loader.load(window.GROUND_DETAIL);
  const tex = loader.load(window.GROUND_JPG, () => { buildTrees(tex.image, grain); });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const mat = new THREE.MeshLambertMaterial({ map: tex });
  const cover = loader.load(window.GROUND_MASK, (texture) => {
    updateStubble = nearbyStubble(THREE, scene, texture.image, SX, SY, heightAt);
  });
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.anisotropy = tex.anisotropy;
  applyGroundDetail(mat, cover, grain, SX, SY);
  terrain = new THREE.Mesh(geo, mat);
  scene.add(terrain);
  // 外周の地面（地図の外を霧に溶かす）
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(80000, 80000), new THREE.MeshLambertMaterial({ color: 0x6f6a4c }));
  outer.rotateX(-Math.PI / 2); outer.position.y = 5;
  scene.add(outer);
}

// ───────────────── 形状ユーティリティ ─────────────────
const C = (h) => new THREE.Color(h);
function part(g, color, armor, x, y, z, rx = 0, ry = 0, rz = 0) {
  g = g.index ? g.toNonIndexed() : g;
  g.deleteAttribute('uv');
  if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); if (rz) g.rotateZ(rz);
  g.translate(x, y, z);
  const n = g.attributes.position.count, col = new Float32Array(n * 3), am = new Float32Array(n);
  const c = C(color).convertSRGBToLinear();
  for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; am[i] = armor; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('armor', new THREE.BufferAttribute(am, 1));
  return g;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const SKIN = '#c49a76', CLOTH = '#2e2822', WOOD = '#5a4128', IRON = '#9a9a9a', WHITE = '#ffffff';

// 足軽（正面 = +Z）
function footman(weapon) {
  const ps = [
    part(box(0.36, 0.74, 0.24), CLOTH, 0, 0, 0.37, 0),
    part(box(0.52, 0.22, 0.36), WHITE, 1, 0, 0.80, 0),            // 草摺
    part(box(0.46, 0.50, 0.30), WHITE, 1, 0, 1.15, 0),            // 胴
    part(box(0.14, 0.42, 0.14), WHITE, 1, 0.30, 1.12, 0.04),      // 腕
    part(box(0.14, 0.42, 0.14), WHITE, 1, -0.30, 1.12, 0.04),
    part(box(0.20, 0.22, 0.22), SKIN, 0, 0, 1.50, 0),             // 顔
    part(new THREE.ConeGeometry(0.31, 0.15, 6), WHITE, 1, 0, 1.66, 0), // 陣笠
    part(box(0.025, 1.0, 0.025), WOOD, 0, 0, 1.85, -0.17),        // 指物竿
  ];
  if (weapon === 'yari') {
    ps.push(part(box(0.035, 4.8, 0.035), WOOD, 0, 0.34, 2.2, 0.05));
    ps.push(part(new THREE.ConeGeometry(0.04, 0.32, 4), IRON, 0, 0.34, 4.75, 0.05));
  } else if (weapon === 'teppo') {
    ps.push(part(box(0.05, 1.35, 0.05), '#3a2a1a', 0, 0.30, 1.30, 0.10, 0, 0, -0.25));
  } else if (weapon === 'yumi') {
    ps.push(part(box(0.03, 2.1, 0.05), '#4a2e18', 0, 0.33, 1.25, 0.05, 0, 0, 0.12));
  } else if (weapon === 'nimotsu') {
    ps.push(part(box(0.5, 0.4, 0.4), '#7a6a4a', 0, 0, 1.25, -0.3)); // 背負い荷
  }
  return mergeGeometries(ps);
}
function footFlag() {
  const g = new THREE.PlaneGeometry(0.34, 0.6, 2, 1);
  g.translate(0.17, 2.08, -0.19);
  return flagify(g, 0);
}
function horseman() {
  const H = '#4a3526';
  const ps = [
    part(box(0.52, 0.62, 1.75), H, 0, 0, 1.30, 0),
    part(box(0.30, 0.78, 0.36), H, 0, 0, 1.78, 0.88, -0.55),
    part(box(0.24, 0.26, 0.56), H, 0, 0, 2.05, 1.22, 0.25),
    part(box(0.12, 1.0, 0.12), H, 0, 0.17, 0.5, 0.65), part(box(0.12, 1.0, 0.12), H, 0, -0.17, 0.5, 0.65),
    part(box(0.12, 1.0, 0.12), H, 0, 0.17, 0.5, -0.65), part(box(0.12, 1.0, 0.12), H, 0, -0.17, 0.5, -0.65),
    part(box(0.09, 0.7, 0.10), '#2a1d14', 0, 0, 1.25, -0.98, 0.35),
    part(box(0.62, 0.28, 0.40), CLOTH, 0, 0, 1.70, 0.05),
    part(box(0.48, 0.56, 0.32), WHITE, 1, 0, 2.05, 0.05),
    part(box(0.20, 0.22, 0.22), SKIN, 0, 0, 2.44, 0.05),
    part(box(0.30, 0.16, 0.30), WHITE, 1, 0, 2.60, 0.05),
    part(box(0.025, 1.3, 0.025), WOOD, 0, 0, 2.95, -0.16),
    part(box(0.035, 3.6, 0.035), WOOD, 0, 0.34, 2.6, 0.2),
  ];
  return mergeGeometries(ps);
}
function horseFlag() {
  const g = new THREE.PlaneGeometry(0.38, 0.7, 2, 1);
  g.translate(0.19, 3.22, -0.18);
  return flagify(g, 0);
}
function noboriPole() {
  return mergeGeometries([part(box(0.07, 6.0, 0.07), '#3b2a1a', 0, 0, 3.0, 0), part(box(0.75, 0.05, 0.05), '#3b2a1a', 0, 0.38, 5.95, 0)]);
}
function noboriFlag() {
  const g = new THREE.PlaneGeometry(0.72, 3.4, 3, 6);
  g.translate(0.40, 4.2, 0);
  return flagify(g, 0);
}
// 旗のなびき用: 竿からの距離 flex
function flagify(g) {
  g = g.toNonIndexed();
  const p = g.attributes.position, fx = new Float32Array(p.count);
  let minX = Infinity; for (let i = 0; i < p.count; i++) minX = Math.min(minX, p.getX(i));
  for (let i = 0; i < p.count; i++) fx[i] = p.getX(i) - minX;
  g.setAttribute('flex', new THREE.BufferAttribute(fx, 1));
  return g;
}

// 胴・笠だけを部隊の具足色に染めるマテリアル
function bodyMaterial() {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true });
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float armor;')
      .replace('#include <color_vertex>', `
        vColor = vec3(1.0);
        #ifdef USE_COLOR
          vColor *= color;
        #endif
        #ifdef USE_INSTANCING_COLOR
          vColor.rgb *= mix(vec3(1.0), instanceColor.rgb, armor);
        #endif`);
  };
  return m;
}
const windU = { value: 0 };
function flagMaterial() {
  const m = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTime = windU;
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float flex;\nuniform float uTime;')
      .replace('#include <begin_vertex>', `
        vec3 transformed = vec3(position);
        float ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.23;
        transformed.z += sin(uTime * 3.2 + ph + flex * 5.0 + position.y * 1.3) * 0.18 * flex;`);
  };
  return m;
}

const GEO = {
  yari: footman('yari'), teppo: footman('teppo'), yumi: footman('yumi'), nimotsu: footman('nimotsu'),
  kiba: horseman(), footFlag: footFlag(), horseFlag: horseFlag(), nobPole: noboriPole(), nobFlag: noboriFlag(),
};
const MAT = { body: bodyMaterial(), flag: flagMaterial() };


// ───────────────── 動く部隊のシェーダ ─────────────────
// 兵一人ひとりの「部隊内の位置」を instanceMatrix に持ち、部隊の中心・向き・散開・損耗は uniform で渡す。
// 地面の高さは DEM テクスチャから頂点シェーダで引く。
const demTex = new THREE.DataTexture(DEM, DW, DH, THREE.RedFormat, THREE.FloatType);
demTex.needsUpdate = true;
const SHARED = {
  uDem: { value: demTex }, uDemInfo: { value: new THREE.Vector4(DW, DH, SX, SY) }, uTime: { value: 0 },
};
const UNIT_PARS = `
uniform vec2 uCenter; uniform float uYaw; uniform float uSpread; uniform float uLost; uniform float uVis; uniform float uMove;
uniform float uTime; uniform sampler2D uDem; uniform vec4 uDemInfo;
attribute float aRank;
float demH(vec2 p) {
  vec2 g = clamp((p / uDemInfo.zw + 0.5) * (uDemInfo.xy - 1.0), vec2(0.0), uDemInfo.xy - 1.001);
  ivec2 i = ivec2(floor(g)); vec2 f = fract(g);
  float a = texelFetch(uDem, i, 0).r, b = texelFetch(uDem, i + ivec2(1, 0), 0).r;
  float c = texelFetch(uDem, i + ivec2(0, 1), 0).r, d = texelFetch(uDem, i + ivec2(1, 1), 0).r;
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
vec2 rotY(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x + s * v.y, -s * v.x + c * v.y); }
`;
const UNIT_NORMAL = `
vec3 transformedNormal = mat3(instanceMatrix) * objectNormal;
transformedNormal.xz = rotY(transformedNormal.xz, uYaw);
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
  transformedNormal = - transformedNormal;
#endif
`;
const UNIT_PROJECT = `
vec4 lp = instanceMatrix * vec4(transformed, 1.0);
vec2 foot = vec2(instanceMatrix[3].x, instanceMatrix[3].z);
vec2 so = foot * (uSpread - 1.0) * 0.6 + vec2(sin(aRank * 913.0), cos(aRank * 517.0)) * (uSpread - 1.0) * 9.0;
vec2 footW = uCenter + rotY(foot + so, uYaw);
vec2 pw = uCenter + rotY(lp.xz + so, uYaw);
float bob = uMove * abs(sin(uTime * 9.0 + aRank * 60.0)) * 0.15;
vec3 wpos = vec3(pw.x, lp.y + demH(footW) + bob, pw.y);
if (aRank < uLost || uVis < 0.02) wpos = vec3(0.0, -500.0, 0.0);
vec4 mvPosition = viewMatrix * vec4(wpos, 1.0);
gl_Position = projectionMatrix * mvPosition;
`;
function unitMaterials(color) {
  const uni = {
    uCenter: { value: new THREE.Vector2() }, uYaw: { value: 0 }, uSpread: { value: 1 }, uLost: { value: 0 }, uVis: { value: 1 }, uMove: { value: 0 },
  };
  const hook = (s) => { Object.assign(s.uniforms, SHARED, uni); };
  const body = new THREE.MeshLambertMaterial({ vertexColors: true });
  body.onBeforeCompile = (s) => {
    hook(s);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float armor;' + UNIT_PARS)
      .replace('#include <color_vertex>', `vColor = vec3(1.0);
        #ifdef USE_COLOR
          vColor *= color;
        #endif
        #ifdef USE_INSTANCING_COLOR
          vColor.rgb *= mix(vec3(1.0), instanceColor.rgb, armor);
        #endif`)
      .replace('#include <defaultnormal_vertex>', UNIT_NORMAL)
      .replace('#include <project_vertex>', UNIT_PROJECT);
  };
  body.customProgramCacheKey = () => 'unit-body';
  const flag = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
  flag.onBeforeCompile = (s) => {
    hook(s);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float flex;' + UNIT_PARS)
      .replace('#include <begin_vertex>', `vec3 transformed = vec3(position);
        transformed.z += sin(uTime * 3.2 + aRank * 50.0 + flex * 5.0 + position.y * 1.3) * 0.18 * flex;`)
      .replace('#include <defaultnormal_vertex>', UNIT_NORMAL)
      .replace('#include <project_vertex>', UNIT_PROJECT);
  };
  flag.customProgramCacheKey = () => 'unit-flag';
  const foot = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false });
  foot.onBeforeCompile = (s) => {
    hook(s);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>' + UNIT_PARS)
      .replace('#include <project_vertex>', `
        vec2 pw = uCenter + rotY(transformed.xz * (1.0 + (uSpread - 1.0) * 0.8), uYaw);
        vec4 mvPosition = viewMatrix * vec4(pw.x, demH(pw) + 2.5, pw.y, 1.0);
        gl_Position = projectionMatrix * mvPosition;`);
  };
  foot.customProgramCacheKey = () => 'unit-foot';
  return { uni, body, flag, foot };
}

// ───────────────── 部隊の隊形 ─────────────────
// 1つの「備」の構成（前から）: 鉄砲 → 弓 → 長柄（槍） → 騎馬 → 旗本 → 小荷駄
const BLOCKS = [
  { type: 'teppo', frac: 0.12, sx: 1.4, sz: 2.2, wf: 1.0 },
  { type: 'yumi', frac: 0.05, sx: 1.4, sz: 2.2, wf: 0.8 },
  { type: 'yari', frac: 0.45, sx: 1.15, sz: 1.7, wf: 0.9 },
  { type: 'kiba', frac: 0.10, sx: 2.6, sz: 3.6, wf: 0.75 },
  { type: 'yari', frac: 0.15, sx: 1.5, sz: 2.0, wf: 0.45, honjin: true },
  { type: 'nimotsu', frac: 0.13, sx: 1.9, sz: 2.5, wf: 0.55 },
];
const SONAE_MAX = 6500;
function rand(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function estimateDepth(per, F, sp) {
  let d = 0;
  for (const bl of BLOCKS) {
    const files = Math.max(1, Math.floor(F * bl.wf / (bl.sx * sp)));
    d += Math.ceil(per * bl.frac / (sp * sp) / files) * bl.sz * sp + 5 * sp;
  }
  return d;
}

const state = { ratio: 1, scale: 1.6, labels: 'all' };
const armyGroup = new THREE.Group();
scene.add(armyGroup);
let VIS = []; // 部隊ごとの描画データ

// 倒れた兵（遺体）のプール
const fallenGeo = (() => { const g = footman('none'); g.rotateX(-Math.PI / 2); g.translate(0, 0.18, 0); return g; })();
let corpses = null, corpseN = 0;
function resetCorpses() {
  if (corpses) { scene.remove(corpses); corpses.dispose(); }
  const max = Math.ceil(UNITS.reduce((s, u) => s + u.n, 0) / state.ratio * 0.45) + 200;
  corpses = new THREE.InstancedMesh(fallenGeo, MAT.body, max);
  corpses.count = 0; corpseN = 0; corpses.frustumCulled = false;
  corpses.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  corpses.setColorAt(0, new THREE.Color());
  scene.add(corpses);
}
const _d = new THREE.Object3D(), _c = new THREE.Color();
function addCorpse(x, z, yaw, color) {
  if (corpseN >= corpses.instanceMatrix.count) return;
  _d.position.set(x, heightAt(x, z), z);
  _d.rotation.set(0, yaw, 0);
  _d.scale.setScalar(state.scale);
  _d.updateMatrix();
  corpses.setMatrixAt(corpseN, _d.matrix);
  _c.copy(color).multiplyScalar(0.7);
  corpses.setColorAt(corpseN, _c);
  corpseN++;
  corpses.count = corpseN;
  corpses.instanceMatrix.needsUpdate = true;
  corpses.instanceColor.needsUpdate = true;
}

function buildArmies() {
  armyGroup.traverse((o) => { if (o.isInstancedMesh) o.dispose(); });
  armyGroup.clear();
  VIS = [];
  const jm = [];
  let total = 0, drawn = 0;
  const r = state.ratio, sp = Math.sqrt(r), S = state.scale;
  const dummy = new THREE.Object3D();
  for (const u of UNITS) {
    const rnd = rand(u.id.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
    const [cx, cz] = ll2xz(u.lon, u.lat);
    const b = THREE.MathUtils.degToRad(u.face);
    const fx = Math.sin(b), fz = -Math.cos(b), rx = Math.cos(b), rz = Math.sin(b);
    const k = Math.ceil(u.n / SONAE_MAX);
    const per = u.n / k;
    const F = THREE.MathUtils.clamp(Math.sqrt(per) * 2.5, 28, 240);
    const lists = { yari: [], teppo: [], yumi: [], nimotsu: [], kiba: [], nob: [] };
    let honjinAt = null;
    const bb = [Infinity, -Infinity, Infinity, -Infinity];
    let depthAcc = 0;
    const sonaeDepth = estimateDepth(per, F, sp);
    for (let si = 0; si < k; si++) {
      const row = Math.floor(si / 2), inRow = Math.min(2, k - row * 2), col = si % 2;
      const ou = inRow === 1 ? 0 : (col === 0 ? -1 : 1) * (F / 2 + 18);
      let v = -row * (sonaeDepth + 45);
      const isMain = si === k - 1;
      for (const bl of BLOCKS) {
        if (bl.honjin && !isMain) continue;
        const frac = bl.honjin ? bl.frac : bl.frac + (isMain ? 0 : BLOCKS[4].frac / 5);
        const count = Math.max(bl.type === 'kiba' ? 1 : 0, Math.round(per * frac / r));
        if (!count) continue;
        const sx = bl.sx * sp, sz = bl.sz * sp;
        const files = Math.max(1, Math.floor(F * bl.wf / sx));
        const rows = Math.ceil(count / files);
        for (let q = 0; q < count; q++) {
          const fi = q % files, ri = Math.floor(q / files);
          const inThisRow = Math.min(files, count - ri * files);
          const lu = ou + (fi - (inThisRow - 1) / 2) * sx + (rnd() - 0.5) * sx * 0.45;
          const lv = v - ri * sz + (rnd() - 0.5) * sz * 0.35;
          lists[bl.type].push([lu, lv, (rnd() - 0.5) * 0.5]);
          if (lu < bb[0]) bb[0] = lu; if (lu > bb[1]) bb[1] = lu; if (lv < bb[2]) bb[2] = lv; if (lv > bb[3]) bb[3] = lv;
        }
        const nob = Math.round(per * frac / 60 / Math.max(1, sp * 0.7));
        for (let q = 0; q < nob; q++) lists.nob.push([ou + (rnd() - 0.5) * F * bl.wf, v - rnd() * rows * sz, (rnd() - 0.5) * 0.3]);
        if (bl.honjin) honjinAt = [ou, v - rows * sz / 2, F * bl.wf / 2 + 6, rows * sz / 2 + 6];
        v -= rows * sz + 5 * sp;
      }
      depthAcc = Math.max(depthAcc, -v);
    }
    // 笹尾山の座標は備の中央ではなく三成本陣の跡。陣幕・馬印・名札の原点を合わせる。
    const hq = PARAMS[u.id]?.fixedHQ && honjinAt;
    const originU = hq ? hq[0] : 0, originV = hq ? hq[1] : -depthAcc / 2;
    // 部隊ローカル座標（x=左右, z=前後, 前が+z）
    const L = (lu, lv) => [originU - lu, lv - originV];
    const front = bb[3], back = bb[2];
    const rankOf = (lv) => Math.min(0.999, 0.5 * rnd() + 0.5 * (1 - (lv - back) / Math.max(1, front - back)));
    const toWorld = (lu, lv) => {
      const [lx, lz] = L(lu, lv);
      const x = cx - rx * lx + fx * lz, z = cz - rz * lx + fz * lz;
      return [x, heightAt(x, z), z];
    };
    const mats = unitMaterials(u.color);
    const armorCol = C(u.armor || '#3a302a');
    const flagCol = C(u.color);
    const soldiers = []; // 遺体を置くための記録 [lx, lz, rank, yaw]
    const add = (geoKey, list, ranks, colFn, sc, isFlag) => {
      if (!list.length) return;
      const g = GEO[geoKey].clone();
      g.setAttribute('aRank', new THREE.InstancedBufferAttribute(ranks, 1));
      const mesh = new THREE.InstancedMesh(g, isFlag ? mats.flag : mats.body, list.length);
      const col = new THREE.Color();
      list.forEach((p, i) => {
        const [lx, lz] = L(p[0], p[1]);
        dummy.position.set(lx, 0, lz);
        dummy.rotation.set(0, p[2], 0);
        dummy.scale.setScalar(sc);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        colFn(col, i);
        mesh.setColorAt(i, col);
      });
      mesh.frustumCulled = false;
      armyGroup.add(mesh);
    };
    const vary = (base, amt) => (c) => { const t = 1 + (rnd() - 0.5) * amt; c.copy(base).multiplyScalar(t); };
    let n = 0;
    const rankLists = {};
    for (const t of ['yari', 'teppo', 'yumi', 'nimotsu', 'kiba']) {
      const rk = new Float32Array(lists[t].map((p) => rankOf(p[1])));
      rankLists[t] = rk;
      add(t, lists[t], rk, vary(armorCol, 0.35), S, false);
      lists[t].forEach((p, i) => { const [lx, lz] = L(p[0], p[1]); soldiers.push([lx, lz, rk[i], p[2]]); });
      n += lists[t].length;
    }
    const foot = [...lists.yari, ...lists.teppo, ...lists.yumi];
    const footRk = new Float32Array([...rankLists.yari, ...rankLists.teppo, ...rankLists.yumi]);
    add('footFlag', foot, footRk, vary(flagCol, 0.12), S, true);
    add('horseFlag', lists.kiba, rankLists.kiba, vary(flagCol, 0.12), S, true);
    const nobRk = new Float32Array(lists.nob.map((p) => rankOf(p[1])));
    add('nobPole', lists.nob, nobRk, (c) => c.set(1, 1, 1), 1 + (S - 1) * 0.5, false);
    add('nobFlag', lists.nob, nobRk, vary(flagCol, 0.08), 1 + (S - 1) * 0.5, true);
    if (!u.hidden) { total += u.n; drawn += n; }
    soldiers.sort((a, b) => a[2] - b[2]);
    // 本陣（大将と馬印）: 部隊とともに動く。陣幕は陣所に残る
    let anchorL = [0, 0];
    if (honjinAt) {
      const [hu, hv, hw, hd] = honjinAt;
      const corners = [[hu - hw, hv + hd], [hu + hw, hv + hd], [hu + hw, hv - hd], [hu - hw, hv - hd], [hu - hw, hv + hd]];
      for (let e = 0; e < 4; e++) {
        const [a0, b0] = corners[e], [a1, b1] = corners[e + 1];
        const len = Math.hypot(a1 - a0, b1 - b0), seg = Math.max(1, Math.ceil(len / 4));
        for (let s = 0; s < seg; s++) {
          if (e === 0 && Math.abs((s + 0.5) / seg - 0.5) < 0.12) continue;
          jm.push([toWorld(a0 + (a1 - a0) * s / seg, b0 + (b1 - b0) * s / seg), toWorld(a0 + (a1 - a0) * (s + 1) / seg, b0 + (b1 - b0) * (s + 1) / seg), flagCol]);
        }
      }
      anchorL = L(hu, hv);
      const ug = umaGeo(u);
      ug.setAttribute('aRank', new THREE.InstancedBufferAttribute(new Float32Array([2]), 1));
      const um = new THREE.InstancedMesh(ug, mats.body, 1);
      dummy.position.set(anchorL[0], 0, anchorL[1]); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(Math.max(1.4, S * 1.1)); dummy.updateMatrix();
      um.setMatrixAt(0, dummy.matrix); um.setColorAt(0, flagCol); um.frustumCulled = false;
      armyGroup.add(um);
    }
    // 遠景用の色面
    const N = 6, pad = 8, P = [], I = [];
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
      const [lx, lz] = L(bb[0] - pad + (bb[1] - bb[0] + pad * 2) * i / N, bb[2] - pad + (bb[3] - bb[2] + pad * 2) * j / N);
      P.push(lx, 0, lz);
    }
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const a = j * (N + 1) + i; I.push(a, a + N + 1, a + 1, a + 1, a + N + 1, a + N + 2); }
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); fg.setIndex(I);
    const fm = new THREE.Mesh(fg, mats.foot);
    fm.frustumCulled = false; fm.renderOrder = 1;
    armyGroup.add(fm);
    if (!u.hidden) { total += 0; }
    VIS.push({ id: u.id, def: u, mats, soldiers, ptr: 0, armorCol, spread: 1, vis: u.hidden ? 0 : 1, anchorL, radius: Math.max(bb[1] - bb[0], bb[3] - bb[2]) / 2 });
  }
  // 陣幕
  const P = [], CC = [];
  const white = C('#e8e4da').convertSRGBToLinear();
  for (const [p0, p1, fc] of jm) {
    const lc = fc.clone().convertSRGBToLinear();
    for (const [y0, y1, cc] of [[0.15, 0.55, white], [0.55, 0.95, lc], [0.95, 1.6, white]]) {
      const q = [[p0[0], p0[1] + y0, p0[2]], [p1[0], p1[1] + y0, p1[2]], [p1[0], p1[1] + y1, p1[2]], [p0[0], p0[1] + y1, p0[2]]];
      for (const idx of [0, 1, 2, 0, 2, 3]) { P.push(...q[idx]); CC.push(cc.r, cc.g, cc.b); }
    }
  }
  const jg = new THREE.BufferGeometry();
  jg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  jg.setAttribute('color', new THREE.Float32BufferAttribute(CC, 3));
  jg.computeVertexNormals();
  armyGroup.add(new THREE.Mesh(jg, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));
  document.getElementById('count').textContent = `兵 ${total.toLocaleString()} 人 → 描画 ${drawn.toLocaleString()} 体（1体 = ${r}人）`;
  resetCorpses();
  buildLabels();
}
function umaGeo(u) {
  const ps = [horseman(), part(new THREE.CylinderGeometry(0.08, 0.1, 9, 6), '#3b2a1a', 0, 1.2, 4.5, -1.5)];
  if (u.leaderMark === 'fan') ps.push(part(new THREE.CircleGeometry(1.9, 16, Math.PI * 0.15, Math.PI * 0.7), '#e8b828', 0, 1.2, 7.6, -1.5));
  else ps.push(part(new THREE.PlaneGeometry(1.4, 2.6), WHITE, 1, 1.95, 7.4, -1.5));
  return mergeGeometries(ps.map((g) => { if (g.attributes.uv) g.deleteAttribute('uv'); return g; }));
}

// 硝煙
const SMOKE_N = 6000;
const smoke = (() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SMOKE_N * 3), 3));
  g.setAttribute('aBirth', new THREE.BufferAttribute(new Float32Array(SMOKE_N).fill(-1e9), 1));
  g.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(SMOKE_N).map(() => Math.random()), 1));
  g.setAttribute('aBig', new THREE.BufferAttribute(new Float32Array(SMOKE_N), 1));
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const x = cv.getContext('2d'); const gr = x.createRadialGradient(32, 32, 2, 32, 32, 31);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uNow: { value: 0 }, uPx: { value: 800 }, uTex: { value: new THREE.CanvasTexture(cv) } },
    vertexShader: `attribute float aBirth; attribute float aSeed; attribute float aBig; uniform float uNow; uniform float uPx; varying float vA;
      void main() {
        float age = uNow - aBirth; float life = 160.0 + aBig * 300.0; float k = clamp(age / life, 0.0, 1.0);
        vec3 p = position + vec3(sin(aSeed * 40.0) * k * 25.0 + k * 30.0, k * (20.0 + aBig * 40.0), cos(aSeed * 31.0) * k * 25.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        gl_PointSize = min(512.0, (5.0 + (24.0 + aBig * 50.0) * sqrt(k)) * uPx / -mv.z);
        vA = (age < 0.0 || age > life) ? 0.0 : (1.0 - k) * min(1.0, age / 3.0) * (0.42 + aBig * 0.2);
      }`,
    fragmentShader: `uniform sampler2D uTex; varying float vA; void main() { float a = texture2D(uTex, gl_PointCoord).a * vA; if (a < 0.01) discard; gl_FragColor = vec4(vec3(0.86, 0.86, 0.84), a); }`,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false; pts.renderOrder = 2;
  scene.add(pts);
  return { g, m, i: 0 };
})();
function puff(x, z, t, big = 0) {
  const i = smoke.i = (smoke.i + 1) % SMOKE_N;
  smoke.g.attributes.position.setXYZ(i, x, heightAt(x, z) + 2.5, z);
  smoke.g.attributes.aBirth.setX(i, t);
  smoke.g.attributes.aBig.setX(i, big);
  smoke.dirty = true;
}
function clearSmoke() { smoke.g.attributes.aBirth.array.fill(-1e9); smoke.dirty = true; }


// ───────────────── 樹木と集落 ─────────────────
function buildTrees(img, grain) {
  const cv = document.createElement('canvas');
  cv.width = img.width; cv.height = img.height;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, cv.width, cv.height).data;
  const rnd = rand(1600);
  // 枝が段を作る針葉樹。頂点を増やすのは樹冠の輪郭だけにする。
  const profile = [[.25,2.2],[2.7,2.5],[1.35,5.0],[2.0,4.5],[.82,7.1],[1.24,6.6],[0,10.5]];
  const pineCrown = new THREE.LatheGeometry(profile.map(([r,y]) => new THREE.Vector2(r,y)), 6);
  const leafCrown = new THREE.SphereGeometry(3.4, 8, 5);
  const crownPos = leafCrown.attributes.position;
  for (let i = 0; i < crownPos.count; i++) {
    const x = crownPos.getX(i), y = crownPos.getY(i), z = crownPos.getZ(i);
    const shape = 1 + .14 * Math.sin(1.8*x + 1.2*y) * Math.cos(z + .8*y);
    crownPos.setXYZ(i, x*shape + .15*y, y*.91 + .22*Math.sin(z), z*shape);
  }
  leafCrown.computeVertexNormals();
  const conifer = mergeGeometries([
    part(pineCrown, '#ffffff', 1, 0, 0, 0),
    part(new THREE.CylinderGeometry(0.25, 0.3, 2.5, 4), '#907860', 0, 0, 1.25, 0),
  ]);
  const broad = mergeGeometries([
    part(leafCrown, '#ffffff', 1, 0, 5.8, 0),
    part(new THREE.CylinderGeometry(0.3, 0.35, 3.5, 4), '#907860', 0, 0, 1.75, 0),
  ]);
  const CH = 6, chunks = {};
  const step = 13;
  for (let z = -SY / 2; z < SY / 2; z += step) {
    for (let x = -SX / 2; x < SX / 2; x += step) {
      const jx = x + rnd() * step, jz = z + rnd() * step;
      const ix = Math.floor((jx / SX + 0.5) * cv.width), iz = Math.floor((jz / SY + 0.5) * cv.height);
      const o = (iz * cv.width + ix) * 4;
      const R = px[o], G = px[o + 1], B = px[o + 2];
      const forest = G > R * 1.02 && G < 110 && (R + G + B) < 215;
      const lone = !forest && rnd() < 0.0012;
      if (!forest && !lone) continue;
      if (forest && rnd() < 0.25) continue;
      const kind = (forest && G > R * 1.15) || rnd() < 0.35 ? 'c' : 'b';
      const key = kind + Math.floor((jx / SX + 0.5) * CH) + '_' + Math.floor((jz / SY + 0.5) * CH);
      (chunks[key] ||= []).push([jx, jz, R, G, B]);
    }
  }
  const dummy = new THREE.Object3D(), col = new THREE.Color();
  const foliage = bodyMaterial();
  const tintCrown = foliage.onBeforeCompile;
  foliage.onBeforeCompile = (shader) => {
    tintCrown(shader);
    shader.uniforms.leafGrain = { value: grain };
    const varyings = 'varying vec3 treePoint; varying float treeDepth; varying float crown;\n';
    shader.vertexShader = varyings + shader.vertexShader.replace('#include <project_vertex>', `
      #include <project_vertex>
      treePoint = (instanceMatrix * vec4(position,1.0)).xyz;
      treeDepth = -mvPosition.z;
      crown = armor;
    `);
    shader.fragmentShader = varyings + 'uniform sampler2D leafGrain;\n' +
      shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      if (treeDepth < 220.0) {
        vec2 q = treePoint.xy + treePoint.z * vec2(.71,.42);
        float fine = texture2D(leafGrain, q / 1.55).b;
        float clump = texture2D(leafGrain, q / 5.3).r;
        float nearTree = 1.0 - smoothstep(75.0,220.0,treeDepth);
        float leaves = fine * .66 + clump * .34;
        if (crown > .5 && leaves < .27 * nearTree) discard;
        float bark = texture2D(leafGrain,q * vec2(1.6,.28)).g;
        diffuseColor.rgb *= 1.0 + nearTree * mix((bark-.5)*1.1,(leaves-.40)*2.2,crown);
      }`);
  };
  let count = 0;
  for (const [key, list] of Object.entries(chunks)) {
    const mesh = new THREE.InstancedMesh(key[0] === 'c' ? conifer : broad, foliage, list.length);
    list.forEach(([x, z, R, G, B], i) => {
      dummy.position.set(x, heightAt(x, z) - 0.5, z);
      dummy.rotation.set(0, rnd() * 6.28, 0);
      const s = 0.7 + rnd() * 0.8;
      dummy.scale.set(s, s * (0.8 + rnd() * 0.5), s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      col.setRGB((R + 21) / 255, (G + 26) / 255, (B + 13) / 255, THREE.SRGBColorSpace);
      mesh.setColorAt(i, col);
    });
    mesh.computeBoundingSphere();
    scene.add(mesh);
    count += list.length;
  }
  document.getElementById('trees').textContent = `樹木 ${count.toLocaleString()} 本`;
}

function buildVillages() {
  const G = window.GEO;
  const house = mergeGeometries([
    part(box(8, 2.6, 5.5), '#8a7a62', 0, 0, 1.3, 0),
    part(roofGeo(9.2, 3.2, 6.6), '#ffffff', 1, 0, 2.6, 0),
  ]);
  const roads = Object.fromEntries(G.roads.map((r) => {
    const points = r.pts.map(([lo, la]) => ll2xz(lo, la));
    let length = 0;
    const segments = points.slice(1).map(([x, z], i) => {
      const [ax, az] = points[i], dx = x - ax, dz = z - az;
      const span = Math.hypot(dx, dz), start = length;
      length += span;
      return { ax, az, ux: dx / span, uz: dz / span, start, end: length };
    });
    return [r.name, segments];
  }));
  const rnd = rand(42);
  const items = [];
  for (const v of G.villages) {
    const [vx, vz] = ll2xz(v.lon, v.lat);
    const road = roads[v.along];
    let center = 0, nearest = Infinity;
    for (const s of road || []) {
      const along = THREE.MathUtils.clamp((vx - s.ax) * s.ux + (vz - s.az) * s.uz, 0, s.end - s.start);
      const d = Math.hypot(vx - s.ax - along * s.ux, vz - s.az - along * s.uz);
      if (d < nearest) { nearest = d; center = s.start + along; }
    }
    for (let i = 0; i < v.n; i++) {
      let x, z, ang;
      if (road) {
        const distance = THREE.MathUtils.clamp(center + (rnd() - .5) * 2 * v.r, 0, road[road.length-1].end);
        const s = road.find((s) => distance <= s.end);
        const offset = (i % 2 ? 1 : -1) * (9 + rnd() * 11);
        x = s.ax + (distance - s.start) * s.ux - offset * s.uz;
        z = s.az + (distance - s.start) * s.uz + offset * s.ux;
        ang = Math.atan2(s.ux, s.uz);
      } else {
        const a = rnd() * 6.28, d = Math.sqrt(rnd()) * v.r;
        x = vx + Math.cos(a) * d; z = vz + Math.sin(a) * d; ang = rnd() * 3.14;
      }
      items.push([x, z, ang]);
    }
  }
  const mesh = new THREE.InstancedMesh(house, MAT.body, items.length);
  const dummy = new THREE.Object3D(), col = new THREE.Color();
  items.forEach(([x, z, a], i) => {
    dummy.position.set(x, heightAt(x, z), z);
    dummy.rotation.set(0, a + Math.PI / 2, 0);
    dummy.scale.setScalar(0.9 + rnd() * 0.4);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    col.set('#7a6648').multiplyScalar(0.85 + rnd() * 0.3); // 茅葺き
    mesh.setColorAt(i, col);
  });
  scene.add(mesh);
}
function roofGeo(w, h, d) {
  const g = new THREE.BufferGeometry();
  const x = w / 2, z = d / 2;
  const v = [
    -x, 0, z, x, 0, z, x, h, 0, -x, 0, z, x, h, 0, -x, h, 0,
    x, 0, -z, -x, 0, -z, -x, h, 0, x, 0, -z, -x, h, 0, x, h, 0,
    -x, 0, -z, -x, 0, z, -x, h, 0, x, 0, z, x, 0, -z, x, h, 0,
  ];
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}


// ───────────────── シミュレーション（再生） ─────────────────
const HALF = { hx: SX / 2, hz: SY / 2 };
const play = { opts: { ...DEFAULT_OPTS }, speed: 60, playing: false, gameT: T_START, slowUntil: 0, holdUntil: 0, seeking: false, autoCam: true, slowEv: true, weather: 'auto' };
let SIM = null, BRAIN = null;
function newSim() {
  SIM = prepare(createSim(UNITS, ll2xz, PARAMS, HALF));
  SIM.retarget = retarget;
  BRAIN = makeBrain(play.opts);
  SIM.listeners.push(onEvent);
  for (const u of SIM.units) { u.px = u.x; u.pz = u.z; u.pface = u.face; }
  play.gameT = SIM.t;
}
function simStep() {
  for (const u of SIM.units) { u.px = u.x; u.pz = u.z; u.pface = u.face; }
  stepSim(SIM, BRAIN);
  // 硝煙
  for (const u of SIM.units) {
    if (!u.fighting || u.status === 'gone') continue;
    const nPuff = u.status === 'rout' ? 0 : Math.min(3, 1 + Math.floor(u.fire * 2));
    const b = u.face * Math.PI / 180, fx = Math.sin(b), fz = -Math.cos(b);
    for (let i = 0; i < nPuff; i++) {
      if (Math.random() > 0.6) continue;
      const lat = (Math.random() - 0.5) * u.r * 1.5, fw = u.r * (0.4 + Math.random() * 0.4);
      puff(u.x + fx * fw - fz * lat, u.z + fz * fw + fx * lat, SIM.t);
    }
  }
  if (SIM.flags.cannon && SIM.t - SIM.flags.cannon < 900 && Math.random() < 0.25) {
    const u = SIM.byId.ishida; puff(u.x + 60, u.z + (Math.random() - 0.5) * 80, SIM.t, 1);
  }
  if (SIM.flags.noroshi && SIM.t - SIM.flags.noroshi < 1200 && Math.random() < 0.5) {
    const [x, z] = ll2xz(136.4587, 35.3720); puff(x, z, SIM.t, 1.5);
  }
  spawnCorpses();
}
function spawnCorpses() {
  for (const V of VIS) {
    const u = SIM.byId[V.id];
    const lost = Math.min(1, u.killed / u.n0);
    const yaw = Math.PI - u.face * Math.PI / 180;
    const c = Math.cos(yaw), s = Math.sin(yaw);
    while (V.ptr < V.soldiers.length && V.soldiers[V.ptr][2] < lost) {
      const [lx, lz, rk, ry] = V.soldiers[V.ptr++];
      const sp = V.spread - 1;
      const ox = lx + lx * sp * 0.6 + Math.sin(rk * 913) * sp * 9, oz = lz + lz * sp * 0.6 + Math.cos(rk * 517) * sp * 9;
      addCorpse(u.x + c * ox + s * oz, u.z - s * ox + c * oz, yaw + ry + (rk * 37 % 1 - 0.5) * 2, V.armorCol);
    }
  }
}
function seek(t) {
  pendingCards.length = 0;
  closeCard();
  play.seeking = true;
  for (const V of VIS) { V.ptr = 0; V.spread = 1; V.vis = V.def.hidden ? 0 : 1; }
  resetCorpses(); clearSmoke();
  newSim();
  logEl.innerHTML = '';
  while (SIM.t < t && !SIM.over) simStep();
  play.gameT = SIM.t;
  play.seeking = false;
}

// ───────────────── イベント表示 ─────────────────
const cardEl = document.getElementById('card'), logEl = document.getElementById('log');
let cardTimer = 0;
let inCardExtension = false;
let waitingForNext = false;
const pendingCards = [];
function evInfo(e) {
  if (EVENTS[e.id]) return EVENTS[e.id];
  if (e.id.startsWith('gone:')) {
    // 潰走を経ずに消えた（全滅した）部隊
    const u = SIM.byId[e.unit];
    if (e.fled || SIM.fired.has('rout:' + u.id) || u.hidden || ['shimazu', 'toyohisa', 'gamo'].includes(u.id) || ROUT_EVENTS[u.id]) return null;
    return { title: `${u.name}隊、壊滅`, tag: '戦況', focus: [u.id], slow: true, body: `${u.name}隊は最後まで踏みとどまり、討ち死にした（死傷 約${Math.round(u.killed).toLocaleString()}人）。` };
  }
  if (e.id.startsWith('rout:')) {
    const u = SIM.byId[e.unit];
    if (ROUT_EVENTS[u.id] || u.id === 'shimazu' || u.id === 'toyohisa') return null;
    return routText(SIM, e);
  }
  return null;
}
function onEvent(e) {
  const info = evInfo(e);
  if (!info) return;
  const li = document.createElement('li');
  li.className = 'tag-' + info.tag;
  li.innerHTML = `<time>${hhmm(e.t)}</time>${info.title}`;
  li.onclick = () => { seek(e.t); showCard(info, e); };
  logEl.prepend(li);
  if (play.seeking) return;
  const totals = ['east_win', 'west_win', 'draw'].includes(e.id) ? sideTotals(SIM) : null;
  if (cardEl.hidden) showCard(info, e, totals);
  else {
    pendingCards.push({ info, e, totals });
    if (inCardExtension) pauseForCard();
  }
}
function showCard(info, e, totals = null) {
  if (play.slowEv && info.slow) {
    // 寄って、しばらくゆっくり進める
    play.slowUntil = performance.now() + 9000;
  }
  if (play.autoCam) focusEvent(info);
  const extra = e.id === 'shimazu_escape' && e.n !== undefined ? `<p class="num">戦場を離れた島津勢：約${e.n}人（この再現での値）</p>` : '';
  cardEl.innerHTML = `<div class="meta"><time>${hhmm(e.t)}　${koku(e.t)}</time><i class="tag tag-${info.tag}">${info.tag}</i></div>
    <h2>${info.title}</h2>${info.map ? `<div class="withmap">${cardMaps(info.map)}<div class="map-copy"><p>${info.body}</p>${extra}</div></div>` : `<p>${info.body}</p>${extra}`}
    <div class="card-actions"><span role="status"></span><button type="button">次に進む</button></div>`;
  cardEl.classList.toggle('wide', !!info.map);
  cardEl.hidden = false;
  cardEl.scrollTop = 0;
  cardEl.querySelector('button').onclick = () => {
    closeCard();
    if (totals) showSummary(totals);
    const next = pendingCards.shift();
    if (next) showCard(next.info, next.e, next.totals);
  };
  const readTime = Math.max(9000, info.body.length * 110);
  const duringBattle = e.t >= 8 * 3600 && e.id !== 'kubi' && !e.id.startsWith('epi_');
  cardTimer = setTimeout(() => {
    if (duringBattle && pendingCards.length === 0) {
      inCardExtension = true;
      cardTimer = setTimeout(pauseForCard, 2 * readTime);
    } else {
      pauseForCard();
    }
  }, readTime);
}
function pauseForCard() {
  clearTimeout(cardTimer);
  inCardExtension = false;
  waitingForNext = true;
  cardEl.querySelector('[role="status"]').textContent = '読み終わるまで一時停止';
  syncPlayButton();
}
function closeCard() {
  clearTimeout(cardTimer);
  inCardExtension = false;
  waitingForNext = false;
  cardEl.hidden = true;
  syncPlayButton();
}
function showSummary(T) {
  const w = SIM.result?.winner;
  const head = w === 'E' ? '東軍の勝利' : w === 'W' ? '西軍の勝利' : '決着つかず';
  document.getElementById('summary').innerHTML = `<button class="x">×</button><h2>${head}</h2>
    <p>決着 ${SIM.result ? hhmm(SIM.result.t) : '-'}（${SIM.result ? koku(SIM.result.t) : ''}）</p>
    <dl><dt>西軍の死傷（この再現）</dt><dd>${Math.round(T.W.killed).toLocaleString()} 人</dd><dt>東軍の死傷（この再現）</dt><dd>${Math.round(T.E.killed).toLocaleString()} 人</dd></dl>
    <p class="caveat">死傷者数には諸説ある（西軍約8千、東軍約4千などとされる）。この数字は簡易モデルによる再現値。</p>
    <p>右のパネルの「もしも」で条件を変えて、もう一度見てみよう。</p>`;
  const el = document.getElementById('summary'); el.hidden = false;
  el.querySelector('.x').onclick = () => { el.hidden = true; };
}

// ───────────────── 名札 ─────────────────
const labelLayer = document.getElementById('labels');
const preview = document.getElementById('officer-preview');
let previewLabel = null;
function hideOfficer() {
  if (previewLabel) previewLabel.removeAttribute('aria-describedby');
  previewLabel = null;
  preview.hidden = true;
}
function positionOfficer(rect) {
  const gap = 8, width = preview.offsetWidth, height = preview.offsetHeight;
  const left = rect.right + gap + width <= innerWidth ? rect.right + gap : rect.left - width - gap;
  preview.style.left = Math.max(gap, Math.min(left, innerWidth - width - gap)) + 'px';
  preview.style.top = Math.max(gap, Math.min(rect.top, innerHeight - height - gap)) + 'px';
}
function previewOfficer(el, def) {
  if (previewLabel === el) return;
  hideOfficer();
  const profile = officerProfile(def);
  if (!profile) return;
  previewLabel = el;
  el.setAttribute('aria-describedby', preview.id);
  preview.innerHTML = `<strong>${def.name}</strong>${profile}`;
  preview.hidden = false;
  loadOfficerPortrait(preview, def);
  positionOfficer(el.getBoundingClientRect());
}
addEventListener('blur', hideOfficer);
addEventListener('keydown', (e) => { if (e.key === 'Escape') hideOfficer(); });
let labels = [];
function buildLabels() {
  hideOfficer();
  labelLayer.innerHTML = '';
  labels = VIS.map((V) => {
    const u = V.def;
    const el = document.createElement('button');
    el.type = 'button';
    el.setAttribute('aria-label', u.name + 'の解説');
    el.className = 'lbl';
    el.style.setProperty('--c', u.color);
    el.innerHTML = `<i class="sd"></i><b>${u.name}</b><span class="n"></span><em><u></u></em>`;
    el.onpointerenter = (e) => { if (e.pointerType !== 'touch') previewOfficer(el, u); };
    el.onfocus = () => { if (el.matches(':focus-visible')) previewOfficer(el, u); };
    el.onpointerleave = el.onblur = () => { if (previewLabel === el) hideOfficer(); };
    el.onclick = () => { hideOfficer(); select(V); };
    labelLayer.appendChild(el);
    return { V, el, sd: el.querySelector('.sd'), n: el.querySelector('.n'), bar: el.querySelector('u'), last: '' };
  });
}
const tmp = new THREE.Vector3();
function updateLabels() {
  const w = innerWidth, h = innerHeight, camPos = camera.position;
  for (const L of labels) {
    const u = SIM.byId[L.V.id];
    const st = u.status === 'gone' ? 'gone' : u.status === 'rout' ? 'rout' : '';
    const key = u.side + st + (u.side !== u.origSide ? 't' : '') + (u.order.type === 'aloof' ? 'a' : '') + (u.order.type === 'idle' ? 'i' : '') + (u.fighting ? 'f' : '');
    if (key !== L.last) {
      L.last = key;
      L.el.className = `lbl ${u.side} ${st} ${u.side !== u.origSide ? 'turn' : ''} ${u.fighting && !st ? 'fight' : ''} ${u.order.type === 'idle' ? 'idle' : ''}`;
      L.sd.textContent = u.side === 'W' ? '西' : '東';
      L.sd.title = u.side !== u.origSide ? '寝返り' : SIDE[u.side];
    }
    L.n.textContent = st === 'gone' ? (u.id === 'shimazu' ? '離脱' : u.id === 'toyohisa' ? '討死' : u.hidden ? '全滅' : '潰走') : Math.round(u.n).toLocaleString();
    L.bar.style.width = (Math.max(0, u.n / u.n0) * 100).toFixed(0) + '%';
    const V = L.V;
    const c = Math.cos(Math.PI - u.face * Math.PI / 180), s = Math.sin(Math.PI - u.face * Math.PI / 180);
    const ax = u.x + c * V.anchorL[0] + s * V.anchorL[1], az = u.z - s * V.anchorL[0] + c * V.anchorL[1];
    tmp.set(ax, heightAt(ax, az) + 40, az);
    const d = camPos.distanceTo(tmp);
    tmp.project(camera);
    const minor = u.n0 < 3000 && d > 3500;
    const hide = tmp.z > 1 || state.labels === 'none' || (state.labels === 'major' && minor) || (st === 'gone' && V.vis < 0.05);
    if (hide || Math.abs(tmp.x) > 1.2 || Math.abs(tmp.y) > 1.2) {
      L.el.style.display = 'none';
      if (previewLabel === L.el) hideOfficer();
      continue;
    }
    L.el.style.display = '';
    const sc = THREE.MathUtils.clamp(2600 / d, 0.6, 1.15);
    L.el.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px, ${(-tmp.y * 0.5 + 0.5) * h}px) translate(-50%, -100%) scale(${sc})`;
    L.el.style.zIndex = String(100000 - Math.round(d));
  }
  if (previewLabel) positionOfficer(previewLabel.getBoundingClientRect());
}
function select(V) {
  const d = V.def, u = SIM.byId[V.id];
  const p = document.getElementById('info');
  const tags = [d.betray ? '<i class="tag b">合戦中に寝返り</i>' : '', d.idle ? '<i class="tag i">戦わず</i>' : ''].join('');
  p.innerHTML = `<button class="x" title="閉じる">×</button><div class="hd ${d.side}"><span class="side">${SIDE[d.side]}</span><h2>${d.name}</h2>${tags}</div>
    ${officerProfile(d)}
    <dl><dt>兵数（通説）</dt><dd>${d.n.toLocaleString()}</dd><dt>いま</dt><dd>${Math.round(u.n).toLocaleString()}（士気 ${Math.round(Math.max(0, u.morale) * 100)}）</dd><dt>陣所</dt><dd>${d.place}</dd></dl>
    <p>${d.note}</p><p class="caveat">位置・兵数は通説に基づく概略。</p>
    <button id="goto">この隊へ寄る</button>`;
  p.hidden = false;
  loadOfficerPortrait(p, d);
  p.querySelector('.x').onclick = () => { p.hidden = true; };
  document.getElementById('goto').onclick = () => focusUnits([V.id], 420);
}

// ───────────────── 視点 ─────────────────
let fly = null;
const movementKeys = new Set();
let draggingMap = false;
const editingControl = (el) => el?.isContentEditable || el?.matches?.('select, input, textarea');
addEventListener('keydown', (e) => {
  if (!['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code) || e.ctrlKey || e.metaKey || e.altKey ||
      e.isComposing || editingControl(e.target)) return;
  e.preventDefault();
  movementKeys.add(e.code);
  fly = null;
});
addEventListener('keyup', (e) => movementKeys.delete(e.code));
addEventListener('focusin', (e) => { if (editingControl(e.target)) movementKeys.clear(); });
function releaseCameraInputs() {
  movementKeys.clear();
  draggingMap = false;
}
addEventListener('blur', releaseCameraInputs);
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseCameraInputs(); });
controls.addEventListener('start', () => { draggingMap = true; fly = null; });
controls.addEventListener('end', () => { draggingMap = false; });
renderer.domElement.addEventListener('pointercancel', () => { draggingMap = false; });

function moveCamera(dt) {
  if (!movementKeys.size) return;
  const forward = Number(movementKeys.has('KeyW')) - Number(movementKeys.has('KeyS'));
  const right = Number(movementKeys.has('KeyD')) - Number(movementKeys.has('KeyA'));
  if (!forward && !right) return;
  fly = null;
  const heading = controls.getAzimuthalAngle();
  const speed = THREE.MathUtils.clamp(controls.getDistance() * 0.45, 5, 2200);
  const step = speed * dt / Math.hypot(forward, right);
  const dx = (right * Math.cos(heading) - forward * Math.sin(heading)) * step;
  const dz = (-right * Math.sin(heading) - forward * Math.cos(heading)) * step;
  const eye = camera.position;
  const dy = heightAt(eye.x + dx, eye.z + dz) - heightAt(eye.x, eye.z);
  eye.x += dx; eye.y += dy; eye.z += dz;
  controls.target.x += dx; controls.target.y += dy; controls.target.z += dz;
}

renderer.domElement.addEventListener('dblclick', (e) => {
  const rect = renderer.domElement.getBoundingClientRect();
  const cursor = new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1,
                                   1 - (e.clientY - rect.top) / rect.height * 2);
  const ray = new THREE.Raycaster();
  ray.setFromCamera(cursor, camera);
  const hit = ray.intersectObject(terrain, false)[0];
  if (!hit) return;
  const offset = camera.position.clone().sub(controls.target);
  offset.setLength(THREE.MathUtils.clamp(hit.distance * 0.5, controls.minDistance, controls.maxDistance));
  flyCam(offset.add(hit.point), hit.point, 0.65);
});
function flyCam(p1, t1, dur = 2.2) { fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1, t1, k: 0, dur }; }
function presetFrom(lon, lat, eyeH, lookLon, lookLat) {
  const [x, z] = ll2xz(lon, lat), [lx, lz] = ll2xz(lookLon, lookLat);
  flyCam(new THREE.Vector3(x, heightAt(x, z) + eyeH, z), new THREE.Vector3(lx, heightAt(lx, lz), lz));
}
const PRESETS = {
  overview: () => presetFrom(136.4990, 35.3560, 2100, 136.4630, 35.3640),
  east: () => presetFrom(136.4830, 35.3640, 500, 136.4620, 35.3660),
  south: () => presetFrom(136.4750, 35.3300, 2400, 136.4650, 35.3620),
  top: () => presetFrom(136.4800, 35.3600, 7600, 136.4800, 35.3602),
  ishida: () => presetFrom(136.4579, 35.3722, 60, 136.4710, 35.3650),
  matsuo: () => presetFrom(136.4547, 35.3466, 60, 136.4600, 35.3610),
  ieyasu: () => presetFrom(136.4905, 35.3642, 50, 136.4620, 35.3660),
  nangu: () => presetFrom(136.5066, 35.3498, 40, 136.4800, 35.3660),
  road: () => presetFrom(136.47537, 35.36290, 4.7, 136.47503, 35.36285),
};
function focusUnits(ids, minDist = 600) {
  const us = ids.map((id) => SIM.byId[id]).filter(Boolean);
  if (!us.length) return;
  let cx = 0, cz = 0; for (const u of us) { cx += u.x; cz += u.z; } cx /= us.length; cz /= us.length;
  let ext = 0; for (const u of us) ext = Math.max(ext, Math.hypot(u.x - cx, u.z - cz) + u.r);
  const d = THREE.MathUtils.clamp(ext * 2.2 + 250, minDist, 3200), pitch = 0.62, brg = 1.92; // 東南東から
  const t = new THREE.Vector3(cx, heightAt(cx, cz), cz);
  const p = t.clone().add(new THREE.Vector3(Math.sin(brg) * Math.cos(pitch) * d, Math.sin(pitch) * d, -Math.cos(brg) * Math.cos(pitch) * d));
  flyCam(p, t);
}
function focusEvent(info) {
  if (movementKeys.size || draggingMap) return;
  if (info.cam && PRESETS[info.cam]) PRESETS[info.cam]();
  else if (info.focus) focusUnits(info.focus);
}

// ───────────────── 時刻による霧と光 ─────────────────
const FOG = { clear: 0.00005, haze: 0.00014, mist: 0.00024 };
function updateEnvironment(t) {
  let dens;
  if (play.weather !== 'auto') dens = FOG[play.weather];
  else {
    const h = t / 3600;
    dens = h < 7.93 ? FOG.mist : h < 9 ? FOG.mist + (FOG.haze - FOG.mist) * (h - 7.93) / 1.07 : FOG.haze;
  }
  scene.fog.density = dens;
  const h = t / 3600;
  const az = THREE.MathUtils.degToRad(95 + (h - 7) / 10 * 160);
  const el = THREE.MathUtils.degToRad(Math.max(3, 42 - Math.abs(h - 11.8) * 7.5));
  sun.position.set(Math.sin(az) * Math.cos(el) * 8000, Math.sin(el) * 8000, -Math.cos(az) * Math.cos(el) * 8000);
  const eve = THREE.MathUtils.clamp((h - 15) / 2, 0, 1);
  sun.color.setRGB(1, 0.95 - eve * 0.2, 0.86 - eve * 0.35);
  sun.intensity = 2.4 - eve * 0.9;
}

// ───────────────── UI ─────────────────
const $ = (id) => document.getElementById(id);
function bindUI() {
  $('ratio').onchange = (e) => { state.ratio = +e.target.value; buildArmies(); for (const V of VIS) V.ptr = 0; spawnCorpses(); };
  $('scale').oninput = (e) => { $('scaleV').textContent = (+e.target.value).toFixed(1) + '倍'; };
  $('scale').onchange = (e) => { state.scale = +e.target.value; buildArmies(); for (const V of VIS) V.ptr = 0; spawnCorpses(); };
  $('fog').onchange = (e) => { play.weather = e.target.value; };
  $('labelsSel').onchange = (e) => { state.labels = e.target.value; };
  $('autoCam').onchange = (e) => { play.autoCam = e.target.checked; };
  $('slowEv').onchange = (e) => { play.slowEv = e.target.checked; };
  document.querySelectorAll('[data-view]').forEach((b) => (b.onclick = () => PRESETS[b.dataset.view]()));
  $('playBtn').onclick = togglePlay;
  $('startBtn').onclick = () => { $('start').hidden = true; setPlaying(true); };
  $('speed').onchange = (e) => { play.speed = +e.target.value; };
  $('seek').oninput = (e) => { $('clock').textContent = hhmm(+e.target.value); };
  $('seek').onchange = (e) => { seek(+e.target.value); };
  $('seek').min = T_START; $('seek').max = T_END;
  // もしも
  const box = $('ifs');
  for (const o of OPTIONS) {
    const l = document.createElement('label');
    // 通説／異説（史料の読み方の違い）／もしも（起きたことを変える）を分けて並べる
    const grp = (name, cs) => cs.length ? `<optgroup label="${name}">${cs.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</optgroup>` : '';
    const [hist, ...rest] = o.choices;
    l.innerHTML = `${o.label}<select data-opt="${o.id}">${grp('通説', [hist])}${grp('異説（史料の読み方の違い）', rest.filter((c) => c[2] === 'alt'))}${grp('もしも（起きたことを変える）', rest.filter((c) => c[2] !== 'alt'))}</select>`;
    box.appendChild(l);
  }
  $('ifRun').onclick = () => {
    box.querySelectorAll('select').forEach((s) => { play.opts[s.dataset.opt] = s.value; });
    $('summary').hidden = true;
    seek(T_START); buildMarkers(); setPlaying(true);
  };
  addEventListener('keydown', (e) => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); togglePlay(); } });
}
function syncPlayButton() {
  $('playBtn').disabled = waitingForNext;
  $('playBtn').textContent = play.playing && !waitingForNext ? '❚❚' : '▶';
}
function setPlaying(v) { play.playing = v; syncPlayButton(); $('start').hidden = true; }
function togglePlay() { if (!waitingForNext) setPlaying(!play.playing); }
// 先に最後まで計算して、年表に主な出来事の印をつける
function buildMarkers() {
  const S2 = prepare(createSim(UNITS, ll2xz, PARAMS, HALF));
  S2.retarget = retarget;
  const br = makeBrain(play.opts);
  while (!S2.over && S2.t < T_END) stepSim(S2, br);
  const box = $('marks'); box.innerHTML = '';
  for (const e of S2.log) {
    let info = EVENTS[e.id];
    if (e.id.startsWith('rout:') && !ROUT_EVENTS[e.unit] && !['shimazu', 'toyohisa'].includes(e.unit)) info = { title: S2.byId[e.unit].name + '隊、崩れる', tag: '戦況', slow: true };
    if (!info || !info.slow) continue;
    const m = document.createElement('i');
    m.style.left = ((e.t - T_START) / (T_END - T_START) * 100) + '%';
    m.title = `${hhmm(e.t)} ${info.title}`;
    m.className = 'tag-' + info.tag;
    m.onclick = () => { seek(Math.max(T_START, e.t - 40)); setPlaying(true); };
    box.appendChild(m);
  }
}

// ───────────────── ループ ─────────────────
const clock = new THREE.Clock();
let frames = 0, fpsT = 0;
function loop() {
  const dt = Math.min(0.1, clock.getDelta());
  SHARED.uTime.value += dt;
  const running = play.playing && !waitingForNext && !SIM.over;
  if (running) {
    const now = performance.now();
    const sp = now < play.holdUntil ? 0 : now < play.slowUntil ? Math.min(play.speed, 12) : play.speed;
    $('timeline').classList.toggle('hold', now < play.holdUntil);
    play.gameT += dt * sp;
    let guard = 0;
    while (SIM.t < play.gameT && !waitingForNext && !SIM.over && guard++ < 400) simStep();
    if (waitingForNext) play.gameT = SIM.t;
    if (SIM.over) { play.gameT = SIM.t; setPlaying(false); }
  }
  // 部隊の描画を更新（シム2秒刻みの間を補間）
  const a = THREE.MathUtils.clamp(1 - (SIM.t - play.gameT) / SIM_DT, 0, 1);
  for (const V of VIS) {
    const u = SIM.byId[V.id], U = V.mats.uni;
    const x = u.px + (u.x - u.px) * a, z = u.pz + (u.z - u.pz) * a;
    let df = ((u.face - u.pface + 540) % 360) - 180;
    const face = u.pface + df * a;
    U.uCenter.value.set(x, z);
    U.uYaw.value = Math.PI - face * Math.PI / 180;
    V.spread += ((u.status === 'rout' || u.status === 'gone' ? 2.6 : 1) - V.spread) * Math.min(1, dt * 0.8);
    U.uSpread.value = V.spread;
    U.uLost.value = Math.min(1, u.killed / u.n0);
    V.vis += ((u.status === 'gone' ? 0 : 1) - V.vis) * Math.min(1, dt * 0.7);
    U.uVis.value = V.vis;
    U.uMove.value = running && u.moving ? 1 : 0;
    const d = camera.position.distanceTo(tmp.set(x, heightAt(x, z), z));
    V.mats.foot.opacity = THREE.MathUtils.clamp((d - 700) / 2200, 0, 0.6) * V.vis * (u.status === 'rout' ? 0.5 : 1);
    V.mats.foot.visible = V.mats.foot.opacity > 0.01;
  }
  if (smoke.dirty) { smoke.g.attributes.position.needsUpdate = true; smoke.g.attributes.aBirth.needsUpdate = true; smoke.g.attributes.aBig.needsUpdate = true; smoke.dirty = false; }
  smoke.m.uniforms.uNow.value = play.gameT;
  smoke.m.uniforms.uPx.value = renderer.domElement.height / (2 * Math.tan(camera.fov * Math.PI / 360));
  updateEnvironment(play.gameT);
  moveCamera(dt);
  if (fly) {
    fly.k = Math.min(1, fly.k + dt / fly.dur);
    const e = fly.k < 0.5 ? 2 * fly.k * fly.k : 1 - Math.pow(-2 * fly.k + 2, 2) / 2;
    camera.position.lerpVectors(fly.p0, fly.p1, e);
    controls.target.lerpVectors(fly.t0, fly.t1, e);
    if (fly.k >= 1) fly = null;
  }
  controls.update();
  const gh = heightAt(camera.position.x, camera.position.z) + 6;
  if (camera.position.y < gh) camera.position.y = gh;
  scene.userData.sky.position.copy(camera.position);
  if (updateStubble) updateStubble(camera.position.x, camera.position.y, camera.position.z);
  renderer.render(scene, camera);
  updateLabels();
  $('clock').textContent = `${hhmm(play.gameT)}`;
  $('koku').textContent = koku(play.gameT);
  if (!$('seek').matches(':active')) $('seek').value = play.gameT;
  frames++; fpsT += dt;
  if (fpsT > 0.5) { $('fps').textContent = Math.round(frames / fpsT) + ' fps'; frames = 0; fpsT = 0; }
  requestAnimationFrame(loop);
}
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ───────────────── 起動 ─────────────────
bindUI();
buildVillages();
newSim();
buildArmies();
buildMarkers();
{
  const [x, z] = ll2xz(136.4990, 35.3560), [lx, lz] = ll2xz(136.4630, 35.3640);
  camera.position.set(x, heightAt(x, z) + 2100, z);
  controls.target.set(lx, heightAt(lx, lz), lz);
  controls.update();
}
// 検証用 URL パラメータ: t=秒 or hh:mm, play=1, view=, cam=lon,lat,h,lookLon,lookLat, ratio=, sel=
{
  const q = new URLSearchParams(location.search);
  if (q.get('ratio')) { state.ratio = +q.get('ratio'); $('ratio').value = q.get('ratio'); buildArmies(); }
  if (q.get('if')) { for (const kv of q.get('if').split(',')) { const [k, v] = kv.split('='); play.opts[k] = v; } newSim(); buildMarkers(); }
  if (q.get('t')) { const [hh, mm] = q.get('t').split(':').map(Number); seek(hh * 3600 + (mm || 0) * 60); $('start').hidden = true; }
  const fin = () => { if (fly) { fly.k = 1; camera.position.copy(fly.p1); controls.target.copy(fly.t1); fly = null; controls.update(); } };
  if (q.get('view') && PRESETS[q.get('view')]) { PRESETS[q.get('view')](); fin(); }
  if (q.get('cam')) { presetFrom(...q.get('cam').split(',').map(Number)); fin(); }
  if (q.get('focus')) { focusUnits(q.get('focus').split(',')); fin(); }
  if (q.get('play')) { setPlaying(true); }
  if (q.get('speed')) { play.speed = +q.get('speed'); }
}
window.__ready = true;
window.__sim = () => SIM;
loop();
