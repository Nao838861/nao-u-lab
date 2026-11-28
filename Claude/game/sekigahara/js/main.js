// 関ヶ原 1600 — M0: 地形と布陣の静的表示
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { UNITS, SIDE } from './units.js';

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
const FOG = { clear: 0.00005, haze: 0.00016, mist: 0.0009 };
scene.fog = new THREE.FogExp2(0xc8ccc6, FOG.haze);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 2, 60000);
const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minDistance = 8;
controls.maxDistance = 16000;
controls.screenSpacePanning = false;

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
{
  const geo = new THREE.PlaneGeometry(SX, SY, DW - 1, DH - 1);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, DEM[i]);
  geo.computeVertexNormals();
  const tex = new THREE.TextureLoader().load(window.GROUND_JPG, () => { buildTrees(tex.image); });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const mat = new THREE.MeshLambertMaterial({ map: tex });
  const terrain = new THREE.Mesh(geo, mat);
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

const state = { ratio: 1, scale: 1.6, labels: 'all' };
const armyGroup = new THREE.Group();
scene.add(armyGroup);
const unitAnchors = []; // {unit, pos:Vector3}

function buildArmies() {
  armyGroup.traverse((o) => { if (o.isInstancedMesh) o.dispose(); });
  armyGroup.clear();
  unitAnchors.length = 0;
  footMats.length = 0;
  const jm = []; // 陣幕の頂点
  let total = 0, drawn = 0;
  const r = state.ratio, sp = Math.sqrt(r), S = state.scale;
  const dummy = new THREE.Object3D();
  for (const u of UNITS) {
    const rnd = rand(u.id.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
    const [cx, cz] = ll2xz(u.lon, u.lat);
    const b = THREE.MathUtils.degToRad(u.face);
    const fx = Math.sin(b), fz = -Math.cos(b), rx = Math.cos(b), rz = Math.sin(b);
    const yaw = Math.PI - b;
    const k = Math.ceil(u.n / SONAE_MAX);
    const per = u.n / k;
    const F = THREE.MathUtils.clamp(Math.sqrt(per) * 2.5, 28, 240);
    // 備ごとの位置（2列ずつ前から後ろへ）
    const lists = { yari: [], teppo: [], yumi: [], nimotsu: [], kiba: [], nob: [] };
    let honjinAt = null;
    const bb = [Infinity, -Infinity, Infinity, -Infinity];
    let depthAcc = 0;
    const sonaeDepth = estimateDepth(per, F, sp);
    for (let si = 0; si < k; si++) {
      const row = Math.floor(si / 2), inRow = Math.min(2, k - row * 2), col = si % 2;
      const ou = inRow === 1 ? 0 : (col === 0 ? -1 : 1) * (F / 2 + 18);
      const ov = -row * (sonaeDepth + 45);
      let v = ov;
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
        // 幟（のぼり）: 約60人に1本
        const nob = Math.round(per * frac / 60 / Math.max(1, sp * 0.7));
        for (let q = 0; q < nob; q++) {
          lists.nob.push([ou + (rnd() - 0.5) * F * bl.wf, v - rnd() * rows * sz, (rnd() - 0.5) * 0.3]);
        }
        if (bl.honjin) {
          honjinAt = [ou, v - rows * sz / 2, F * bl.wf / 2 + 6, rows * sz / 2 + 6];
        }
        v -= rows * sz + 5 * sp;
      }
      depthAcc = Math.max(depthAcc, -v);
    }
    // 部隊中心に合わせる: 前端を中心から depth/2 だけ前へ
    const shift = depthAcc / 2;
    const toWorld = (lu, lv) => {
      const lvv = lv + shift;
      const x = cx + rx * lu + fx * lvv, z = cz + rz * lu + fz * lvv;
      return [x, heightAt(x, z), z];
    };
    const armorCol = C(u.armor || '#3a302a');
    const flagCol = C(u.color);
    const add = (geoKey, list, colFn, sc) => {
      if (!list.length) return null;
      const mesh = new THREE.InstancedMesh(GEO[geoKey], geoKey.includes('lag') ? MAT.flag : MAT.body, list.length);
      const col = new THREE.Color();
      list.forEach((p, i) => {
        const [x, y, z] = toWorld(p[0], p[1]);
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, yaw + p[2], 0);
        dummy.scale.setScalar(sc);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        colFn(col, i);
        mesh.setColorAt(i, col);
      });
      mesh.computeBoundingSphere();
      armyGroup.add(mesh);
      return mesh;
    };
    const vary = (base, amt) => (c) => { const t = 1 + (rnd() - 0.5) * amt; c.copy(base).multiplyScalar(t); };
    let n = 0;
    for (const t of ['yari', 'teppo', 'yumi', 'nimotsu']) { add(t, lists[t], vary(armorCol, 0.35), S); n += lists[t].length; }
    add('kiba', lists.kiba, vary(armorCol, 0.3), S); n += lists.kiba.length;
    const foot = [...lists.yari, ...lists.teppo, ...lists.yumi];
    add('footFlag', foot, vary(flagCol, 0.12), S);
    add('horseFlag', lists.kiba, vary(flagCol, 0.12), S);
    add('nobPole', lists.nob, (c) => c.set(1, 1, 1), 1 + (S - 1) * 0.5);
    add('nobFlag', lists.nob, vary(flagCol, 0.08), 1 + (S - 1) * 0.5);
    total += u.n; drawn += n;
    addFootprint(u, bb, toWorld);
    // 本陣: 陣幕・大将・馬印
    if (honjinAt) {
      const [hu, hv, hw, hd] = honjinAt;
      const corners = [[hu - hw, hv + hd], [hu + hw, hv + hd], [hu + hw, hv - hd], [hu - hw, hv - hd], [hu - hw, hv + hd]];
      for (let e = 0; e < 4; e++) {
        const [a0, b0] = corners[e], [a1, b1] = corners[e + 1];
        const len = Math.hypot(a1 - a0, b1 - b0), seg = Math.max(1, Math.ceil(len / 4));
        // 正面中央は開ける
        for (let s = 0; s < seg; s++) {
          if (e === 0 && Math.abs((s + 0.5) / seg - 0.5) < 0.12) continue;
          const p0 = toWorld(a0 + (a1 - a0) * s / seg, b0 + (b1 - b0) * s / seg);
          const p1 = toWorld(a0 + (a1 - a0) * (s + 1) / seg, b0 + (b1 - b0) * (s + 1) / seg);
          jm.push([p0, p1, flagCol]);
        }
      }
      const [lx, ly, lz] = toWorld(hu, hv);
      addUmajirushi(u, lx, ly, lz, yaw);
      unitAnchors.push({ unit: u, pos: new THREE.Vector3(lx, ly + 45, lz), base: new THREE.Vector3(lx, ly, lz) });
    }
  }
  // 陣幕をひとまとめのメッシュに
  const P = [], CC = [];
  const white = C('#e8e4da').convertSRGBToLinear();
  for (const [p0, p1, fc] of jm) {
    const lc = fc.clone().convertSRGBToLinear();
    const H1 = 0.6 * state.scale, H2 = 1.1 * state.scale, H3 = 1.8 * state.scale;
    const bands = [[0.15, H1, white], [H1, H2, lc], [H2, H3, white]];
    for (const [y0, y1, cc] of bands) {
      const q = [[p0[0], p0[1] + y0, p0[2]], [p1[0], p1[1] + y0, p1[2]], [p1[0], p1[1] + y1, p1[2]], [p0[0], p0[1] + y1, p0[2]]];
      for (const idx of [0, 1, 2, 0, 2, 3]) { P.push(...q[idx]); CC.push(cc.r, cc.g, cc.b); }
    }
  }
  const jg = new THREE.BufferGeometry();
  jg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  jg.setAttribute('color', new THREE.Float32BufferAttribute(CC, 3));
  jg.computeVertexNormals();
  armyGroup.add(new THREE.Mesh(jg, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));
  document.getElementById('count').textContent =
    `兵 ${total.toLocaleString()} 人 → 描画 ${drawn.toLocaleString()} 体（1体 = ${r}人）`;
  buildLabels();
}
// 遠景用: 部隊の占める地面を陣営色で塗る（近づくと消える）
const footMats = [];
function addFootprint(u, bb, toWorld) {
  const N = 10, pad = 8, P = [], I = [];
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
    const lu = bb[0] - pad + (bb[1] - bb[0] + pad * 2) * i / N, lv = bb[2] - pad + (bb[3] - bb[2] + pad * 2) * j / N;
    const [x, y, z] = toWorld(lu, lv);
    P.push(x, y + 1.5, z);
  }
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const a = j * (N + 1) + i; I.push(a, a + N + 1, a + 1, a + 1, a + N + 1, a + N + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I);
  const m = new THREE.MeshBasicMaterial({ color: u.color, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: -2, fog: false });
  const mesh = new THREE.Mesh(g, m);
  mesh.renderOrder = 1;
  footMats.push({ m, c: new THREE.Vector3().fromArray(toWorld((bb[0] + bb[1]) / 2, (bb[2] + bb[3]) / 2)) });
  armyGroup.add(mesh);
}
function estimateDepth(per, F, sp) {
  let d = 0;
  for (const bl of BLOCKS) {
    const files = Math.max(1, Math.floor(F * bl.wf / (bl.sx * sp)));
    d += Math.ceil(per * bl.frac / (sp * sp) / files) * bl.sz * sp + 5 * sp;
  }
  return d;
}
function addUmajirushi(u, x, y, z, yaw) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 9, 6), new THREE.MeshLambertMaterial({ color: 0x3b2a1a }));
  pole.position.y = 4.5;
  g.add(pole);
  let top;
  if (u.leaderMark === 'fan') {
    const fan = new THREE.CircleGeometry(1.9, 16, Math.PI * 0.15, Math.PI * 0.7);
    top = new THREE.Mesh(fan, new THREE.MeshStandardMaterial({ color: 0xe8b828, metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide }));
    top.position.y = 7.6;
  } else {
    top = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.6), new THREE.MeshLambertMaterial({ color: u.color, side: THREE.DoubleSide }));
    top.position.set(0.75, 7.4, 0);
  }
  g.add(top);
  // 大将（騎馬）
  const leader = new THREE.Mesh(GEO.kiba, MAT.body);
  leader.position.set(0, 0, 3);
  g.add(leader);
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  g.scale.setScalar(Math.max(1.4, state.scale * 1.1));
  armyGroup.add(g);
}

// ───────────────── 樹木と集落 ─────────────────
function buildTrees(img) {
  const cv = document.createElement('canvas');
  cv.width = img.width; cv.height = img.height;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, cv.width, cv.height).data;
  const rnd = rand(1600);
  const conifer = mergeGeometries([
    part(new THREE.ConeGeometry(2.6, 9, 6), '#ffffff', 1, 0, 6.5, 0),
    part(new THREE.CylinderGeometry(0.25, 0.3, 2.5, 4), '#4a3424', 0, 0, 1.25, 0),
  ]);
  const broad = mergeGeometries([
    part(new THREE.IcosahedronGeometry(3.4, 0), '#ffffff', 1, 0, 6.0, 0),
    part(new THREE.CylinderGeometry(0.3, 0.35, 3.5, 4), '#4a3424', 0, 0, 1.75, 0),
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
  let count = 0;
  for (const [key, list] of Object.entries(chunks)) {
    const mesh = new THREE.InstancedMesh(key[0] === 'c' ? conifer : broad, MAT.body, list.length);
    list.forEach(([x, z, R, G, B], i) => {
      dummy.position.set(x, heightAt(x, z) - 0.5, z);
      dummy.rotation.set(0, rnd() * 6.28, 0);
      const s = 0.7 + rnd() * 0.8;
      dummy.scale.set(s, s * (0.8 + rnd() * 0.5), s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      col.setRGB(R / 255 * 0.9, G / 255 * 0.95, B / 255 * 0.85, THREE.SRGBColorSpace);
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
  const roads = Object.fromEntries(G.roads.map((r) => [r.name, r.pts.map(([lo, la]) => ll2xz(lo, la))]));
  const rnd = rand(42);
  const items = [];
  for (const v of G.villages) {
    const [vx, vz] = ll2xz(v.lon, v.lat);
    for (let i = 0; i < v.n; i++) {
      let x, z, ang;
      if (v.along) {
        // 街道沿いに両側へ並べる
        const pts = roads[v.along];
        let best = 0, bd = Infinity;
        pts.forEach(([px, pz], k) => { const d = Math.hypot(px - vx, pz - vz); if (d < bd) { bd = d; best = k; } });
        const a = pts[Math.max(0, best - 1)], b = pts[Math.min(pts.length - 1, best + 1)];
        const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
        const t = (rnd() - 0.5) * 2 * v.r, side = rnd() < 0.5 ? -1 : 1, off = 12 + rnd() * 10;
        x = vx + dx / L * t - dz / L * off * side; z = vz + dz / L * t + dx / L * off * side;
        ang = Math.atan2(dx, dz);
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

// ───────────────── ラベルと解説 ─────────────────
const labelLayer = document.getElementById('labels');
function buildLabels() {
  labelLayer.innerHTML = '';
  for (const a of unitAnchors) {
    const el = document.createElement('div');
    el.className = 'lbl ' + a.unit.side + (a.unit.betray ? ' betray' : '') + (a.unit.idle ? ' idle' : '');
    el.innerHTML = `<b>${a.unit.name}</b><span>${a.unit.n.toLocaleString()}</span>`;
    el.style.setProperty('--c', a.unit.color);
    el.onclick = () => select(a);
    labelLayer.appendChild(el);
    a.el = el;
  }
}
const tmp = new THREE.Vector3();
function updateLabels() {
  const w = innerWidth, h = innerHeight;
  const camPos = camera.position;
  for (const a of unitAnchors) {
    tmp.copy(a.pos).project(camera);
    const d = camPos.distanceTo(a.pos);
    const hide = tmp.z > 1 || state.labels === 'none' || (state.labels === 'major' && a.unit.n < 3000 && !a.unit.parent && d > 3500) || (a.unit.parent && d > 5000 && state.labels !== 'all');
    if (hide || Math.abs(tmp.x) > 1.2 || Math.abs(tmp.y) > 1.2) { a.el.style.display = 'none'; continue; }
    a.el.style.display = '';
    const s = THREE.MathUtils.clamp(2600 / d, 0.62, 1.15);
    a.el.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px, ${(-tmp.y * 0.5 + 0.5) * h}px) translate(-50%, -100%) scale(${s})`;
    a.el.style.zIndex = String(100000 - Math.round(d));
  }
}
function select(a) {
  const u = a.unit;
  document.querySelectorAll('.lbl.sel').forEach((e) => e.classList.remove('sel'));
  a.el.classList.add('sel');
  const p = document.getElementById('info');
  const tags = [u.betray ? '<i class="tag b">合戦中に寝返り</i>' : '', u.idle ? '<i class="tag i">戦わず</i>' : ''].join('');
  p.innerHTML = `<button class="x" title="閉じる">×</button><div class="hd ${u.side}"><span class="side">${SIDE[u.side]}</span><h2>${u.name}</h2>${tags}</div>
    <dl><dt>兵数（通説）</dt><dd>${u.n.toLocaleString()}</dd><dt>陣所</dt><dd>${u.place}</dd></dl>
    <p>${u.note}</p><p class="caveat">位置・兵数は通説に基づく概略で、典拠の照合はこれから。</p>
    <button id="goto">この陣へ寄る</button>`;
  p.hidden = false;
  document.getElementById('goto').onclick = () => flyTo(a.base, u.face, 420, 0.95);
}

// ───────────────── 視点 ─────────────────
let fly = null;
function flyTo(target, faceDeg, dist, pitch) {
  // faceDeg の向きを見る位置（背後上空）にカメラを置く
  const b = THREE.MathUtils.degToRad(faceDeg);
  const dir = new THREE.Vector3(Math.sin(b), 0, -Math.cos(b));
  const camT = target.clone().addScaledVector(dir, -dist * Math.cos(pitch * 0.9));
  camT.y = target.y + dist * Math.sin(pitch * 0.9);
  const lookT = target.clone().addScaledVector(dir, dist * 0.5);
  fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1: camT, t1: lookT, k: 0 };
}
function presetFrom(lon, lat, eyeH, lookLon, lookLat) {
  const [x, z] = ll2xz(lon, lat), [lx, lz] = ll2xz(lookLon, lookLat);
  const p1 = new THREE.Vector3(x, heightAt(x, z) + eyeH, z);
  const t1 = new THREE.Vector3(lx, heightAt(lx, lz), lz);
  fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1, t1, k: 0 };
}
const PRESETS = {
  overview: () => presetFrom(136.4990, 35.3560, 2100, 136.4630, 35.3640),
  east: () => presetFrom(136.4830, 35.3640, 500, 136.4620, 35.3660),
  south: () => presetFrom(136.4750, 35.3300, 2400, 136.4650, 35.3620),
  ishida: () => presetFrom(136.4592, 35.3740, 60, 136.4720, 35.3660),
  matsuo: () => presetFrom(136.4547, 35.3466, 40, 136.4620, 35.3620),
  ieyasu: () => presetFrom(136.4905, 35.3642, 50, 136.4620, 35.3660),
  nangu: () => presetFrom(136.5066, 35.3498, 40, 136.4800, 35.3660),
  top: () => presetFrom(136.4700, 35.3610, 7000, 136.4700, 35.3612),
};
function initialView() {
  const [x, z] = ll2xz(136.4990, 35.3560), [lx, lz] = ll2xz(136.4630, 35.3640);
  camera.position.set(x, heightAt(x, z) + 2100, z);
  controls.target.set(lx, heightAt(lx, lz), lz);
  controls.update();
}

// ───────────────── UI ─────────────────
function bindUI() {
  const $ = (id) => document.getElementById(id);
  $('ratio').onchange = (e) => { state.ratio = +e.target.value; buildArmies(); };
  $('scale').oninput = (e) => { $('scaleV').textContent = (+e.target.value).toFixed(1) + '倍'; };
  $('scale').onchange = (e) => { state.scale = +e.target.value; buildArmies(); };
  $('fog').onchange = (e) => { scene.fog.density = FOG[e.target.value]; };
  $('labelsSel').onchange = (e) => { state.labels = e.target.value; };
  document.querySelectorAll('[data-view]').forEach((b) => (b.onclick = () => PRESETS[b.dataset.view]()));
  $('info').addEventListener('click', (e) => { if (e.target.classList.contains('x')) $('info').hidden = true; });
  // 外部から状態を設定できるように（スクリーンショット検証用）
  const q = new URLSearchParams(location.search);
  if (q.get('ratio')) { state.ratio = +q.get('ratio'); $('ratio').value = q.get('ratio'); }
  if (q.get('fog')) { scene.fog.density = FOG[q.get('fog')]; $('fog').value = q.get('fog'); }
}

// ───────────────── ループ ─────────────────
const clock = new THREE.Clock();
let frames = 0, fpsT = 0;
function loop() {
  const dt = clock.getDelta();
  windU.value += dt;
  if (fly) {
    fly.k = Math.min(1, fly.k + dt / 2.2);
    const e = fly.k < 0.5 ? 2 * fly.k * fly.k : 1 - Math.pow(-2 * fly.k + 2, 2) / 2;
    camera.position.lerpVectors(fly.p0, fly.p1, e);
    controls.target.lerpVectors(fly.t0, fly.t1, e);
    if (fly.k >= 1) fly = null;
  }
  controls.update();
  // カメラが地面に潜らないように
  const gh = heightAt(camera.position.x, camera.position.z) + 6;
  if (camera.position.y < gh) camera.position.y = gh;
  scene.userData.sky.position.copy(camera.position);
  for (const f of footMats) {
    const d = camera.position.distanceTo(f.c);
    f.m.opacity = THREE.MathUtils.clamp((d - 700) / 2200, 0, 0.6);
    f.m.visible = f.m.opacity > 0.01;
  }
  renderer.render(scene, camera);
  updateLabels();
  frames++; fpsT += dt;
  if (fpsT > 0.5) { document.getElementById('fps').textContent = Math.round(frames / fpsT) + ' fps'; frames = 0; fpsT = 0; }
  requestAnimationFrame(loop);
}
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

bindUI();
buildVillages();
buildArmies();
const q0 = new URLSearchParams(location.search);
initialView();
if (q0.get('view') && PRESETS[q0.get('view')]) { PRESETS[q0.get('view')](); if (fly) { fly.k = 1; camera.position.copy(fly.p1); controls.target.copy(fly.t1); fly = null; controls.update(); } }
if (q0.get('cam')) { const c = q0.get('cam').split(',').map(Number); presetFrom(...c); fly.k = 1; camera.position.copy(fly.p1); controls.target.copy(fly.t1); fly = null; controls.update(); }
if (q0.get('sel')) { const a = unitAnchors.find((x) => x.unit.id === q0.get('sel')); if (a) select(a); }
window.__ready = true;
loop();
