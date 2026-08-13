const query = typeof location === 'undefined' ? new URLSearchParams() : new URLSearchParams(location.search);

export const ART_SLICE_MODE = ['before', 'after'].includes(query.get('art-slice'))
  ? query.get('art-slice') : null;

const background = typeof Image === 'undefined' ? null : new Image();
if (background) {
  background.decoding = 'async';
  background.src = new URL('../assets/art_slice/mother_port_painterly_v1.png', import.meta.url).href;
}
const cargoShip = typeof Image === 'undefined' ? null : new Image();
if (cargoShip) {
  cargoShip.decoding = 'async';
  cargoShip.src = new URL('../assets/art_slice/cargo_ship_painterly_v1.png', import.meta.url).href;
}
const caravan = typeof Image === 'undefined' ? null : new Image();
if (caravan) {
  caravan.decoding = 'async';
  caravan.src = new URL('../assets/art_slice/caravan_painterly_v1.png', import.meta.url).href;
}

function coverRect(image, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  return {
    sx: (image.naturalWidth - sourceWidth) * 0.5,
    sy: (image.naturalHeight - sourceHeight) * 0.5,
    sw: sourceWidth,
    sh: sourceHeight,
  };
}

function smoothLoop(value) {
  const wrapped = ((value % 1) + 1) % 1;
  return wrapped * wrapped * (3 - 2 * wrapped);
}

function drawWake(ctx, x, y, scale, phase) {
  ctx.save();
  ctx.globalAlpha = 0.48;
  ctx.strokeStyle = '#d9eee2';
  ctx.lineCap = 'round';
  for (let index = 0; index < 4; index += 1) {
    const offset = index * 13 * scale;
    ctx.lineWidth = Math.max(1, (2.2 - index * 0.3) * scale);
    ctx.beginPath();
    ctx.moveTo(x - 42 * scale - offset, y + 10 * scale + Math.sin(phase * 2 + index) * 2);
    ctx.quadraticCurveTo(
      x - 56 * scale - offset, y + 17 * scale,
      x - 69 * scale - offset, y + 13 * scale,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawPainterlyShip(ctx, width, height, seconds) {
  const progress = smoothLoop(seconds / 12);
  const scale = Math.max(0.7, Math.min(1.08, width / 1440));
  const x = width * (0.06 + progress * 0.34);
  const y = height * (0.80 - progress * 0.19) + Math.sin(seconds * 1.7) * 2.2 * scale;
  drawWake(ctx, x, y, scale, seconds);
  if (cargoShip?.complete && cargoShip.naturalWidth > 0) {
    const drawWidth = 176 * scale;
    const drawHeight = drawWidth * cargoShip.naturalHeight / cargoShip.naturalWidth;
    ctx.save();
    ctx.globalAlpha = 0.98;
    ctx.translate(x, y);
    ctx.rotate(-0.05);
    ctx.drawImage(cargoShip, -drawWidth * 0.5, -drawHeight * 0.72, drawWidth, drawHeight);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.12);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(14, 32, 35, .38)';
  ctx.shadowBlur = 8 * scale;
  ctx.shadowOffsetY = 7 * scale;
  const hull = ctx.createLinearGradient(0, -12 * scale, 0, 22 * scale);
  hull.addColorStop(0, '#a56842');
  hull.addColorStop(0.48, '#75452f');
  hull.addColorStop(1, '#352c27');
  ctx.fillStyle = hull;
  ctx.strokeStyle = 'rgba(58, 43, 33, .86)';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(-46 * scale, -3 * scale);
  ctx.lineTo(51 * scale, -10 * scale);
  ctx.lineTo(35 * scale, 18 * scale);
  ctx.lineTo(-33 * scale, 21 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(221, 166, 85, .8)';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(-38 * scale, 4 * scale);
  ctx.quadraticCurveTo(2 * scale, 13 * scale, 38 * scale, 1 * scale);
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#49382a';
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(0, 7 * scale);
  ctx.lineTo(0, -78 * scale);
  ctx.stroke();
  const sail = ctx.createLinearGradient(0, -70 * scale, 35 * scale, -24 * scale);
  sail.addColorStop(0, '#fff0ca');
  sail.addColorStop(0.72, '#dcc69d');
  sail.addColorStop(1, '#b39a77');
  ctx.fillStyle = sail;
  ctx.strokeStyle = 'rgba(89, 68, 50, .78)';
  ctx.lineWidth = 1.25 * scale;
  ctx.beginPath();
  ctx.moveTo(4 * scale, -73 * scale);
  ctx.quadraticCurveTo(48 * scale, -49 * scale, 38 * scale, -22 * scale);
  ctx.lineTo(4 * scale, -27 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const redSail = ctx.createLinearGradient(-30 * scale, -62 * scale, -4 * scale, -28 * scale);
  redSail.addColorStop(0, '#c66d53');
  redSail.addColorStop(1, '#843d35');
  ctx.fillStyle = redSail;
  ctx.beginPath();
  ctx.moveTo(-4 * scale, -65 * scale);
  ctx.quadraticCurveTo(-34 * scale, -45 * scale, -30 * scale, -25 * scale);
  ctx.lineTo(-4 * scale, -29 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(78, 60, 45, .72)';
  ctx.lineWidth = Math.max(0.7, 0.9 * scale);
  ctx.beginPath();
  ctx.moveTo(0, -73 * scale);
  ctx.lineTo(50 * scale, -10 * scale);
  ctx.moveTo(0, -66 * scale);
  ctx.lineTo(-42 * scale, -2 * scale);
  ctx.stroke();
  ctx.fillStyle = '#c59b52';
  for (let index = 0; index < 3; index += 1) {
    ctx.beginPath();
    ctx.ellipse((-18 + index * 18) * scale, 0, 7 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#d8b867';
  ctx.beginPath();
  ctx.moveTo(2 * scale, -76 * scale);
  ctx.lineTo(18 * scale, -72 * scale);
  ctx.lineTo(2 * scale, -68 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCart(ctx, x, y, scale, wheelPhase, shade) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.47);
  ctx.strokeStyle = 'rgba(67, 50, 37, .86)';
  ctx.fillStyle = '#795338';
  ctx.lineWidth = Math.max(1, 1.35 * scale);
  ctx.beginPath();
  ctx.moveTo(-22 * scale, -7 * scale);
  ctx.lineTo(19 * scale, -7 * scale);
  ctx.lineTo(15 * scale, 9 * scale);
  ctx.lineTo(-19 * scale, 9 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = shade;
  for (const [cargoX, cargoY, radius] of [[-12, -8, 8], [0, -11, 10], [12, -7, 7]]) {
    ctx.beginPath();
    ctx.ellipse(cargoX * scale, cargoY * scale, radius * scale, radius * 0.68 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  for (const wheelX of [-14, 13]) {
    ctx.save();
    ctx.translate(wheelX * scale, 12 * scale);
    ctx.rotate(wheelPhase);
    ctx.fillStyle = '#392d24';
    ctx.beginPath();
    ctx.arc(0, 0, 7 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b48a51';
    ctx.beginPath();
    ctx.moveTo(-5 * scale, 0);
    ctx.lineTo(5 * scale, 0);
    ctx.moveTo(0, -5 * scale);
    ctx.lineTo(0, 5 * scale);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawPainterlyCaravan(ctx, width, height, seconds) {
  const progress = (Math.sin(seconds * Math.PI / 8 - 0.7) + 1) * 0.5;
  const scale = Math.max(0.42, Math.min(0.72, width / 2100));
  // 背景板の港→市場→峠街道に沿う二次曲線。屋根の上を横切らせない。
  const start = { x: width * 0.88, y: height * 0.91 };
  const control = { x: width * 0.66, y: height * 0.70 };
  const end = { x: width * 0.49, y: height * 0.39 };
  const inverse = 1 - progress;
  const baseX = inverse * inverse * start.x + 2 * inverse * progress * control.x
    + progress * progress * end.x;
  const baseY = inverse * inverse * start.y + 2 * inverse * progress * control.y
    + progress * progress * end.y;
  if (caravan?.complete && caravan.naturalWidth > 0) {
    const scale = Math.max(0.7, Math.min(1, width / 1440));
    const drawWidth = 152 * scale;
    const drawHeight = drawWidth * caravan.naturalHeight / caravan.naturalWidth;
    ctx.save();
    ctx.globalAlpha = 0.98;
    ctx.shadowColor = 'rgba(58, 45, 30, .24)';
    ctx.shadowBlur = 5 * scale;
    ctx.shadowOffsetY = 4 * scale;
    ctx.drawImage(caravan, baseX - drawWidth * 0.5, baseY - drawHeight * 0.55, drawWidth, drawHeight);
    ctx.restore();
    return;
  }
  const direction = progress < 0.5 ? 1 : -1;
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#3b3327';
  ctx.beginPath();
  ctx.ellipse(baseX + 14 * scale, baseY + 18 * scale, 54 * scale, 13 * scale, 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const wheelPhase = seconds * 4.8 * direction;
  drawCart(ctx, baseX, baseY, scale, wheelPhase, '#a84f3e');
  drawCart(ctx, baseX + 42 * scale, baseY + 25 * scale, scale * 0.92, wheelPhase, '#c2964e');
  ctx.save();
  ctx.translate(baseX - 33 * scale, baseY - 15 * scale);
  ctx.fillStyle = '#d1ae73';
  ctx.strokeStyle = '#44372b';
  ctx.lineWidth = 1.4 * scale;
  ctx.beginPath();
  ctx.arc(0, -9 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#6c4631';
  ctx.lineWidth = 5 * scale;
  ctx.beginPath();
  ctx.moveTo(0, -4 * scale);
  ctx.lineTo(1 * scale, 12 * scale);
  ctx.stroke();
  ctx.lineWidth = 2.4 * scale;
  const stride = Math.sin(seconds * 6) * 5 * scale;
  ctx.beginPath();
  ctx.moveTo(1 * scale, 11 * scale);
  ctx.lineTo(-6 * scale + stride, 23 * scale);
  ctx.moveTo(1 * scale, 11 * scale);
  ctx.lineTo(8 * scale - stride, 23 * scale);
  ctx.stroke();
  ctx.restore();
}

function drawAmbientLife(ctx, width, height, seconds) {
  const scale = Math.max(0.7, width / 1440);
  ctx.save();
  ctx.strokeStyle = 'rgba(235, 230, 197, .72)';
  ctx.lineWidth = Math.max(1, 1.4 * scale);
  for (let index = 0; index < 3; index += 1) {
    const x = width * 0.12 + ((seconds * 18 + index * 43) % (width * 0.34));
    const y = height * (0.15 + index * 0.035) + Math.sin(seconds + index) * 5;
    ctx.beginPath();
    ctx.arc(x - 4 * scale, y, 5 * scale, Math.PI * 1.05, Math.PI * 1.9);
    ctx.arc(x + 4 * scale, y, 5 * scale, Math.PI * 1.1, Math.PI * 1.95);
    ctx.stroke();
  }
  ctx.restore();
}

export function renderArtSlice(ctx, width, height, seconds) {
  if (ART_SLICE_MODE !== 'after') return false;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  if (background?.complete && background.naturalWidth > 0) {
    const source = coverRect(background, width, height);
    ctx.drawImage(background, source.sx, source.sy, source.sw, source.sh, 0, 0, width, height);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#677b3e');
    gradient.addColorStop(1, '#0c4d5e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  drawAmbientLife(ctx, width, height, seconds);
  drawPainterlyShip(ctx, width, height, seconds);
  drawPainterlyCaravan(ctx, width, height, seconds);
  ctx.restore();
  return true;
}
