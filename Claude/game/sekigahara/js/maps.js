// 解説カードに添える地図（SVG）。座標は経緯度で書き、正距円筒で投影する。
// 広域図は海岸線を省いた略図（琵琶湖・伊勢湾のみ概形）。

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
  ${note ? `<text x="8" y="${h - 7}" font-size="10" fill="#5a5040">${esc(note)}</text>` : ''}
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
const ISE = [[136.62, 35.06], [136.85, 35.09], [136.97, 34.95], [136.90, 34.75], [136.78, 34.58], [136.66, 34.68], [136.60, 34.86]];
const water = (P, poly) => `<path d="${path(P, poly)}z" fill="#9db4bf" stroke="#7a95a2" stroke-width="1"/>`;
const SEKI = [136.466, 35.364];

export const MAPS = {
  // 関ヶ原という土地（実際の地形の上に）
  fuwa() {
    const M = window.DEM_META, G = window.GEO, w = 420, h = 268;
    const b = { w: M.west, e: M.east, s: M.south, n: M.north };
    const P = proj(b, w, h);
    const [x0, y0] = P([b.w, b.n]), [x1, y1] = P([b.e, b.s]);
    let body = `<image href="${window.GROUND_JPG}" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" preserveAspectRatio="none" opacity="0.92"/>`;
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
    body += dot(P, SEKI, '関ヶ原', { bold: true, size: 13 });
    body += mtn(P, [136.4587, 35.3718], '笹尾山（三成）', { anchor: 'end', dx: -9, dy: -6 });
    body += mtn(P, [136.4541, 35.3464], '松尾山（小早川）', { dy: 14 });
    body += mtn(P, [136.5066, 35.3498], '南宮山（毛利）');
    body += mtn(P, [136.4884, 35.3654], '桃配山（家康）', { dy: 14 });
    return frame(w, h, body, '地形は国土地理院の標高から作成。街道は概略');
  },
  // 来ない3万8千（家康と秀忠の進路）
  hidetada() {
    const w = 420, h = 250;
    const P = proj({ w: 135.9, e: 140.1, s: 34.55, n: 36.75 }, w, h);
    let body = `<rect width="${w}" height="${h}" fill="#efe7d4"/>` + water(P, BIWA) + water(P, ISE);
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
    return frame(w, h, body, '略図（海岸線は省略）。経路は主な宿場を結んだ概略');
  },
  // もう一つの戦場、大津城
  otsu() {
    const w = 420, h = 260;
    const P = proj({ w: 135.40, e: 136.62, s: 34.56, n: 35.62 }, w, h);
    let body = `<rect width="${w}" height="${h}" fill="#efe7d4"/>` + water(P, BIWA);
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
    return frame(w, h, body, '略図（海岸線は省略）');
  },
  // 前夜の移動（大垣から関ヶ原へ）
  intro() {
    const w = 420, h = 250;
    const P = proj({ w: 136.42, e: 136.66, s: 35.315, n: 35.41 }, w, h);
    let body = `<rect width="${w}" height="${h}" fill="#efe7d4"/>`;
    // 南宮山の山塊（概形）
    body += `<path d="${path(P, [[136.483, 35.366], [136.50, 35.362], [136.52, 35.356], [136.535, 35.345], [136.54, 35.335], [136.525, 35.325], [136.505, 35.335], [136.49, 35.345], [136.478, 35.356]])}z" fill="#c9bf9f" stroke="#a89a70"/>`;
    body += `<path d="${path(P, [[136.42, 35.395], [136.45, 35.38], [136.48, 35.377], [136.50, 35.385], [136.52, 35.41], [136.42, 35.41]])}z" fill="#c9bf9f" stroke="#a89a70"/>`;
    body += route(P, [[136.42, 35.357], [136.447, 35.359], SEKI, [136.488, 35.366], [136.505, 35.3695], [136.528, 35.370], [136.575, 35.388], [136.611, 35.3635]], '#8a8070', { w: 2, op: 0.7 });
    // 西軍: 大垣から南宮山の南を回って関ヶ原へ（雨の夜）
    body += route(P, [[136.608, 35.357], [136.57, 35.335], [136.535, 35.326], [136.50, 35.328], [136.478, 35.345], [136.468, 35.358]], '#2f55b4', { w: 4, dash: '7 5', arrow: true });
    // 東軍: 赤坂から中山道を西へ
    body += route(P, [[136.572, 35.392], [136.53, 35.374], [136.505, 35.372], [136.49, 35.369]], '#c4511c', { w: 4, arrow: true });
    body += dot(P, [136.6118, 35.3635], '大垣城（西軍の本拠）', { fill: '#2f55b4', anchor: 'end', dx: -8, dy: 16, bold: true, size: 11 });
    body += dot(P, [136.574, 35.391], '赤坂・岡山（家康）', { fill: '#c4511c', dy: -8, anchor: 'middle', bold: true, size: 11 });
    body += dot(P, SEKI, '関ヶ原', { fill: '#8a2a1a', bold: true, size: 13, r: 5, dy: -8, anchor: 'middle' });
    body += mtn(P, [136.5066, 35.3498], '南宮山');
    body += label(P, [136.54, 35.318], '西軍：雨の夜、南宮山の南を迂回', { color: '#2f55b4', bold: true, size: 11 });
    body += label(P, [136.545, 35.397], '東軍：夜明け前に中山道を西へ', { color: '#c4511c', bold: true, size: 11, anchor: 'end' });
    return frame(w, h, body, '略図。経路は通説による概略');
  },
};
