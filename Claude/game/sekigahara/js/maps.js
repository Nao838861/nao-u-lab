// 解説カードに添える地図（SVG）。座標は経緯度で書き、正距円筒で投影する。
import { JAPAN_COAST } from './coast.js';

function proj(b, w, h) {
  const k = Math.cos(((b.s + b.n) / 2) * Math.PI / 180);
  const sx = w / ((b.e - b.w) * k), sy = h / (b.n - b.s), s = Math.min(sx, sy);
  const ox = (w - (b.e - b.w) * k * s) / 2, oy = (h - (b.n - b.s) * s) / 2;
  return ([lon, lat]) => [ox + (lon - b.w) * k * s, oy + (b.n - lat) * s];
}
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const path = (P, pts) => pts.map((p, i) => (i ? 'L' : 'M') + P(p).map((v) => v.toFixed(1)).join(' ')).join('');

function frame(w, h, body, note) {
  return `<svg class="cardmap" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker></defs>
  ${body}
  <g transform="translate(${w - 34},26)"><path d="M0 -14L5 2L0 -2L-5 2z" fill="#3a3024"/><text y="14" text-anchor="middle" font-size="10" fill="#3a3024">北</text></g>
  ${note ? `<text x="8" y="${h - 7}" font-size="10" fill="#423a2d" paint-order="stroke" stroke="#f6f1e6" stroke-width="3" stroke-linejoin="round">${esc(note)}</text>` : ''}
</svg>`;
}
function dot(P, ll, label, o = {}) {
  const [x, y] = P(ll);
  const r = o.r || 4, dx = o.dx ?? 7, dy = o.dy ?? 4, anchor = o.anchor || 'start';
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.fill || '#2a2218'}" stroke="#fff" stroke-width="1.2"/>
  <text x="${x + dx}" y="${y + dy}" font-size="${o.size || 12}" text-anchor="${anchor}" fill="${o.color || '#1d1a16'}" font-weight="${o.bold ? 700 : 400}" paint-order="stroke" stroke="rgba(246,241,230,.85)" stroke-width="3">${esc(label)}</text>`;
}
function mtn(P, ll, label, o = {}) {
  const [x, y] = P(ll);
  return `<path d="M${x - 7} ${y + 5}L${x} ${y - 7}L${x + 7} ${y + 5}z" fill="#6b5a3a" stroke="#fff" stroke-width="1"/>
  <text x="${x + (o.dx ?? 9)}" y="${y + (o.dy ?? 4)}" font-size="${o.size || 11}" text-anchor="${o.anchor || 'start'}" fill="#2a2218" paint-order="stroke" stroke="rgba(246,241,230,.9)" stroke-width="3">${esc(label)}</text>`;
}
function route(P, pts, color, o = {}) {
  return `<path d="${path(P, pts)}" fill="none" stroke="${color}" stroke-width="${o.w || 3}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} stroke-linecap="round" stroke-linejoin="round" ${o.arrow ? 'marker-end="url(#ar)"' : ''} opacity="${o.op || 1}"/>`;
}
function label(P, ll, text, o = {}) {
  const [x, y] = P(ll);
  return `<text x="${x}" y="${y}" font-size="${o.size || 11}" text-anchor="${o.anchor || 'middle'}" fill="${o.color || '#3a3024'}" font-style="${o.italic ? 'italic' : 'normal'}" font-weight="${o.bold ? 700 : 400}" paint-order="stroke" stroke="rgba(246,241,230,.85)" stroke-width="3">${esc(text)}</text>`;
}

const BIWA = [[136.08, 35.56], [136.17, 35.50], [136.25, 35.42], [136.27, 35.33], [136.22, 35.22], [136.12, 35.15], [136.00, 35.10], [135.93, 35.05], [135.88, 35.00], [135.86, 35.03], [135.92, 35.12], [135.98, 35.23], [136.02, 35.33], [136.00, 35.43], [136.03, 35.52]];
const water = (P, poly) => `<path d="${path(P, poly)}z" fill="#9db4bf" stroke="#7a95a2" stroke-width="1"/>`;
const SEKI = [136.466, 35.364];
const mapBounds = {
  intro: { w: 136.42, e: 136.66, s: 35.315, n: 35.41 },
  hidetada: { w: 135.9, e: 140.1, s: 34.55, n: 36.75 },
  otsu: { w: 135.40, e: 136.62, s: 34.56, n: 35.62 },
};
const mapTitles = {
  intro: '大垣から関ヶ原へ',
  fuwa: '関ヶ原で交わる三つの街道',
  hidetada: '江戸から西へ向かった二つの軍',
  otsu: '琵琶湖を挟む大津と関ヶ原',
};
function land(P) {
  const outline = JAPAN_COAST.map((ring) => path(P, ring) + 'Z').join('');
  return `<path d="${outline}" fill="#ded8b9" stroke="#818969" stroke-width=".8" stroke-linejoin="round"/>`;
}
function relief(P, area) {
  const { w, e, s, n, url } = window.CARD_RELIEF[area];
  const [left, top] = P([w, n]), [right, bottom] = P([e, s]);
  return `<image href="${url}" x="${left}" y="${top}" width="${right-left}" height="${bottom-top}" preserveAspectRatio="none"/>`;
}
function regionalMap() {
  const w = 322, h = 204;
  const P = proj({ w: 135.80, e: 137.10, s: 34.90, n: 35.60 }, w, h);
  // 番場・醒井・柏原・今須を経て、垂井・赤坂へ抜ける道筋の概略。
  const road = [[136.29,35.305],[136.318,35.319],[136.35,35.325],[136.369,35.343],
    [136.40,35.345],[136.425,35.348],[136.436,35.355],[136.45,35.357],SEKI,
    [136.49,35.366],[136.531,35.373],[136.549,35.381],[136.584,35.387]];
  return `<svg class="cardmap" role="img" aria-label="北の伊吹山地と南の鈴鹿山脈の間を、近江から濃尾平野へ向かう街道が通る。関ヶ原はその山あいにある。" viewBox="0 0 ${w} ${h}">
    ${relief(P, 'region')}
    ${route(P, road, '#fff9df', { w: 5 })}${route(P, road, '#8d3b24', { w: 2.5 })}
    ${label(P, [136.09,35.33], '琵琶湖', { color: '#284957', bold: true, size: 14 })}
    ${label(P, [136.44,35.52], '伊吹山地', { color: '#344d3c', size: 13 })}
    ${label(P, [136.38,35.16], '鈴鹿山脈', { color: '#344d3c', size: 13 })}
    ${label(P, [136.80,35.32], '濃尾平野', { color: '#695635', size: 14 })}
    ${dot(P, SEKI, '関ヶ原', { fill: '#962f25', color: '#81281f', bold: true, r: 4.5, size: 17, dx: 4, dy: -11 })}
    ${dot(P, [136.91,35.18], '名古屋', { anchor: 'end', dx: -7, dy: 7, size: 14 })}
    <g transform="translate(10,187)"><rect x="-4" y="-12" width="135" height="19" rx="3" fill="#fff9eb" opacity=".94"/><path d="M2 0h18" stroke="#8d3b24" stroke-width="3"/><text x="26" y="4" font-size="12" fill="#482d22">東西の街道（概略）</text></g>
  </svg>`;
}
export function cardMaps(key) {
  const region = key === 'intro'
    ? `<figure class="region"><figcaption>近江と濃尾平野をつなぐ関ヶ原</figcaption>${regionalMap()}</figure>` : '';
  const source = key === 'intro' || key === 'fuwa'
    ? '<small class="relief-credit">緑は山地、淡い黄は平地。地形は<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院の標高タイル</a>を加工</small>' : '';
  return `${region}<figure class="detail"><figcaption>${mapTitles[key]}</figcaption>${MAPS[key]()}${source}</figure>`;
}

export const MAPS = {
  // 関ヶ原という土地（実際の地形の上に）
  fuwa() {
    const M = window.DEM_META, G = window.GEO, w = 420, h = 268;
    const b = { w: M.west, e: M.east, s: M.south, n: M.north };
    const P = proj(b, w, h);
    let body = relief(P, 'local');
    const col = { '中山道': '#b0331f', '北国脇往還': '#2f55b4', '伊勢街道': '#2f6a3a' };
    for (const r of G.roads) body += route(P, r.pts, col[r.name] || '#333', { w: 4, op: 0.9 });
    body += label(P, [136.4315, 35.3545], '← 京・大坂へ', { color: '#b0331f', bold: true, anchor: 'start' });
    body += label(P, [136.5435, 35.3765], '大垣・江戸へ →', { color: '#b0331f', bold: true, anchor: 'end' });
    body += label(P, [136.431, 35.3850], '← 北国方面', { color: '#2f55b4', bold: true, anchor: 'start' });
    body += label(P, [136.490, 35.3330], '伊勢へ ↓', { color: '#2f6a3a', bold: true, anchor: 'start' });
    body += label(P, [136.508, 35.3685], '中山道', { color: '#b0331f', size: 10 });
    body += label(P, [136.451, 35.3778], '北国脇往還', { color: '#2f55b4', size: 10, anchor: 'end' });
    body += label(P, [136.484, 35.3445], '伊勢街道', { color: '#2f6a3a', size: 10, anchor: 'start' });
    body += dot(P, [136.4565, 35.3612], '不破関跡', { fill: '#7a3a8a', dy: 14, dx: -2, anchor: 'end', bold: true });
    body += dot(P, SEKI, '関ヶ原', { fill: '#962f25', bold: true, size: 13, r: 5 });
    body += mtn(P, [136.4587, 35.3718], '笹尾山（三成）', { anchor: 'end', dx: -9, dy: -6 });
    body += mtn(P, [136.4541, 35.3464], '松尾山（小早川）', { dy: 14 });
    body += mtn(P, [136.5066, 35.3498], '南宮山（毛利）');
    body += mtn(P, [136.4884, 35.3654], '桃配山（家康）', { dy: 14 });
    return frame(w, h, body, '色線は三つの街道の概略');
  },
  // 来ない3万8千（家康と秀忠の進路）
  hidetada() {
    const w = 420, h = 250;
    const P = proj(mapBounds.hidetada, w, h);
    let body = `<rect width="${w}" height="${h}" fill="#e1edf0"/>` + land(P) + water(P, BIWA);
    const tokaido = [[139.76, 35.68], [139.15, 35.25], [138.38, 34.97], [137.73, 34.71], [137.16, 34.95], [136.90, 35.15], [136.76, 35.42], [136.575, 35.39], SEKI];
    const nakasendo = [[139.76, 35.68], [139.00, 36.32], [138.60, 36.33], [138.25, 36.40], [138.08, 36.08], [137.72, 35.85], [137.50, 35.49], [137.20, 35.40], [136.76, 35.42]];
    body += route(P, tokaido, '#c4891c', { w: 4, arrow: true });
    body += route(P, nakasendo.slice(0, 4), '#b0331f', { w: 4, arrow: true });
    body += route(P, nakasendo.slice(3, 7), '#b0331f', { w: 3, dash: '6 5', op: 0.85 });
    body += route(P, nakasendo.slice(6), '#b0331f', { w: 2, dash: '2 6', op: 0.6 });
    body += label(P, [138.45, 35.03], '家康 約3万（東海道）', { color: '#8a5a10', bold: true });
    body += label(P, [138.85, 36.62], '秀忠 約3万8千（中山道）', { color: '#b0331f', bold: true, anchor: 'start' });
    body += label(P, [137.55, 35.95], '合戦の日はまだ木曽路の途中', { color: '#b0331f', size: 10, anchor: 'start' });
    body += dot(P, [139.76, 35.68], '江戸', { bold: true });
    body += dot(P, [139.80, 36.31], '小山（会津攻めから反転）', { anchor: 'end', dx: -7, size: 10 });
    body += dot(P, [138.25, 36.40], '上田城：真田昌幸が足止め', { fill: '#b0331f', dx: -8, anchor: 'end', bold: true, size: 11 });
    body += dot(P, [136.61, 35.36], '大垣（西軍）', { fill: '#2f55b4', dy: 15, dx: 2, size: 10 });
    body += dot(P, SEKI, '関ヶ原', { fill: '#8a2a1a', bold: true, anchor: 'middle', dx: 0, dy: -9, size: 13, r: 5 });
    return frame(w, h, body, '経路は概略。破線は秀忠が西へ向かう道筋');
  },
  // もう一つの戦場、大津城
  otsu() {
    const w = 420, h = 260;
    const P = proj(mapBounds.otsu, w, h);
    let body = `<rect width="${w}" height="${h}" fill="#e1edf0"/>` + land(P) + water(P, BIWA);
    const naka = [[135.76, 35.01], [135.86, 35.0], [135.96, 35.02], [136.0, 35.1], [136.2, 35.17], [136.27, 35.29], [136.33, 35.33], [136.42, 35.36], SEKI];
    body += route(P, naka, '#b0331f', { w: 3, op: 0.75 });
    body += label(P, [136.16, 35.09], '中山道 約60km', { color: '#b0331f', size: 10, anchor: 'start' });
    body += route(P, [[135.62, 35.16], [135.83, 35.03]], '#2f55b4', { w: 4, arrow: true });
    body += label(P, [135.55, 35.21], '立花宗茂ら 西軍1万5千', { color: '#2f55b4', bold: true, anchor: 'start', size: 11 });
    body += dot(P, [135.86, 35.0], '大津城（京極高次）', { fill: '#c4511c', bold: true, dy: 15, dx: 6 });
    body += dot(P, [135.76, 35.01], '京', { anchor: 'end', dx: -7 });
    body += dot(P, [135.52, 34.69], '大坂城（毛利輝元）', { size: 11 });
    body += dot(P, [136.27, 35.28], '佐和山城（三成の居城）', { size: 10, dx: 8 });
    body += dot(P, SEKI, '関ヶ原', { fill: '#8a2a1a', bold: true, size: 13, r: 5 });
    body += label(P, [136.10, 35.37], '琵琶湖', { color: '#4a6a7a', size: 11 });
    body += label(P, [136.02, 34.82], '15日に開城。この兵は関ヶ原に間に合わなかった', { color: '#3a3024', size: 10 });
    return frame(w, h, body, '城と街道の位置関係を示す略図');
  },
  // 前夜の移動（大垣から関ヶ原へ）
  intro() {
    const w = 420, h = 250;
    const P = proj(mapBounds.intro, w, h);
    let body = relief(P, 'local');
    // 西軍: 大垣から南宮山の南を回って関ヶ原へ（雨の夜）
    body += route(P, [[136.608, 35.357], [136.566, 35.334], [136.544, 35.325], [136.536, 35.327], [136.527, 35.333], [136.503, 35.335], [136.486, 35.342], [136.476, 35.352], [136.468, 35.358]], '#2f55b4', { w: 4, dash: '7 5', arrow: true });
    // 東軍: 赤坂から中山道を西へ
    body += route(P, [[136.572, 35.392], [136.53, 35.374], [136.505, 35.372], [136.49, 35.369]], '#c4511c', { w: 4, arrow: true });
    body += dot(P, [136.6118, 35.3635], '大垣城', { fill: '#2f55b4', dx: 8, dy: 5, bold: true, size: 14 });
    body += dot(P, [136.574, 35.391], '赤坂・岡山', { fill: '#c4511c', dy: -10, dx: 0, anchor: 'middle', bold: true, size: 14 });
    body += dot(P, SEKI, '関ヶ原', { fill: '#962f25', bold: true, size: 16, r: 5, dx: 0, dy: -10, anchor: 'middle' });
    body += mtn(P, [136.5066, 35.3498], '南宮山');
    body += label(P, [136.54, 35.3175], '西軍　大垣城から山の南を迂回', { color: '#24478a', bold: true, size: 13 });
    body += label(P, [136.531, 35.393], '東軍　赤坂から西へ', { color: '#994019', bold: true, size: 13, anchor: 'end' });
    return frame(w, h, body, '両軍の進路は通説に基づく概略');
  },
};
