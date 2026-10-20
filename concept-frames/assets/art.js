// Procedural invitation artwork shared by several frames (stand-ins for real client art).
export const C = {
  maroon:'#5C1A1B', green:'#1F3A2E', blush:'#E6CFC6', linen:'#F2E9E1', gold:'#C9A56B',
  goldDeep:'#7A5C2E', cocoa:'#5A4636', ink:'#2B1F1A', bloom:'#7A1F26', leaf:'#2F5240', marigold:'#E8962E', haldi:'#E3B23C'
};

export function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

export function rng(seed = 7) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }

// Cusped Mughal arch outline, drawn into the current path. (x, y) is the base-left corner.
export function archPath(g, x, y, w, h, cusps = 5) {
  const r = w / 2, cx = x + r, springY = y - h + r * 1.25;
  g.moveTo(x, y); g.lineTo(x, springY);
  // Scalloped crown: small lobes along an ogee-ish curve to a point.
  const pts = [];
  for (let i = 0; i <= cusps * 2; i++) {
    const t = i / (cusps * 2), a = Math.PI + t * Math.PI;
    pts.push([cx + Math.cos(a) * r, springY + Math.sin(a) * r * 1.05]);
  }
  pts[cusps][1] -= r * .32; // pointed apex
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0;
    g.quadraticCurveTo(mx + dy * .35, my - dx * .35, x1, y1);
  }
  g.lineTo(x + w, y); g.closePath();
}

// A chhatri (domed pavilion) silhouette.
export function chhatri(g, cx, base, s) {
  g.beginPath();
  g.rect(cx - s * .55, base - s * .9, s * 1.1, s * .9);           // pavilion body
  g.rect(cx - s * .7, base - s * .98, s * 1.4, s * .1);             // chajja (eave)
  g.moveTo(cx - s * .5, base - s * .98);
  g.bezierCurveTo(cx - s * .55, base - s * 1.55, cx + s * .55, base - s * 1.55, cx + s * .5, base - s * .98); // dome
  g.rect(cx - s * .03, base - s * 1.62, s * .06, s * .16);          // finial
  g.fill();
}

export function skyline(g, w, base, s, seed = 3) {
  const r = rng(seed);
  g.fillRect(0, base, w, 4000);
  for (let x = -s; x < w + s; x += s * (1.1 + r() * .9)) chhatri(g, x, base + 2, s * (.6 + r() * .7));
  // A grand central dome
  g.beginPath(); g.rect(w / 2 - s * 1.6, base - s * 1.5, s * 3.2, s * 1.6);
  g.moveTo(w / 2 - s * 1.4, base - s * 1.5);
  g.bezierCurveTo(w / 2 - s * 1.5, base - s * 3.1, w / 2 + s * 1.5, base - s * 3.1, w / 2 + s * 1.4, base - s * 1.5); g.fill();
  g.fillRect(w / 2 - s * .05, base - s * 3.25, s * .1, s * .5);
}

// Hanging marigold strings (toran / garlands).
export function garlands(g, w, h, seed = 11, colors = ['#E8962E', '#D9781E', '#F2B84B']) {
  const r = rng(seed);
  for (let i = 0; i < 9; i++) {
    const x = (i + .5) * w / 9 + (r() - .5) * 20, len = h * (.18 + r() * .22);
    for (let y = 0; y < len; y += 13) {
      g.fillStyle = colors[(i + (y / 13 | 0)) % colors.length];
      g.beginPath(); g.arc(x + Math.sin(y * .02) * 3, y, 7.5 - y / len * 2, 0, 7); g.fill();
    }
    g.fillStyle = '#C9A56B'; g.beginPath(); g.arc(x, len + 6, 4, 0, 7); g.fill();
  }
  // swag along the top
  for (let x = 0; x < w; x += 10) {
    const y = 18 + Math.abs(Math.sin(x / w * Math.PI * 4.5)) * 40;
    g.fillStyle = colors[(x / 10 | 0) % 3]; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill();
  }
}

// Gold filigree frame: double rule with corner flourishes and dots.
export function filigree(g, w, h, m = 40, color = '#C9A56B') {
  g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 2;
  g.strokeRect(m, m, w - m * 2, h - m * 2);
  g.lineWidth = 1; g.strokeRect(m + 10, m + 10, w - m * 2 - 20, h - m * 2 - 20);
  for (const [cx, cy, sx, sy] of [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]]) {
    g.save(); g.translate(cx, cy); g.scale(sx, sy); g.lineWidth = 2;
    for (let k = 0; k < 3; k++) {
      g.beginPath(); g.moveTo(10, 10);
      g.bezierCurveTo(60 + k * 20, 0, 70, 60 + k * 15, 30 + k * 10, 50 + k * 25); g.stroke();
    }
    g.beginPath(); g.arc(22, 22, 6, 0, 7); g.fill();
    g.restore();
  }
  for (let x = m + 60; x < w - m - 60; x += 24) { g.beginPath(); g.arc(x, m + 22, 1.6, 0, 7); g.arc(x, h - m - 22, 1.6, 0, 7); g.fill(); }
}

export function loadImage(src) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; }); }

// Full composed invitation still (used on phone screens and thumbnails). 900 x 1600.
export async function inviteStill({ w = 900, h = 1600, names = 'Ananya & Kabir', date = '14 · 02 · 2027' } = {}) {
  const [c, g] = canvas(w, h);
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#2a0d10'); sky.addColorStop(.55, '#5C1A1B'); sky.addColorStop(1, '#9E5A5C');
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  const glow = g.createRadialGradient(w / 2, h * .52, 10, w / 2, h * .52, w * .7);
  glow.addColorStop(0, 'rgba(242,190,120,.55)'); glow.addColorStop(1, 'rgba(242,190,120,0)');
  g.fillStyle = glow; g.fillRect(0, 0, w, h);
  g.fillStyle = '#F2E9E1'; g.beginPath(); g.arc(w * .72, h * .16, 46, 0, 7); g.fill();
  g.fillStyle = '#3a1213'; skyline(g, w, h * .68, 70);
  g.fillStyle = '#1F3A2E'; g.beginPath(); g.rect(0, 0, w, h); archPath(g, 110, h - 90, w - 220, h * .78); g.fill('evenodd');
  g.strokeStyle = '#C9A56B'; g.lineWidth = 3; g.beginPath(); archPath(g, 110, h - 90, w - 220, h * .78); g.stroke();
  garlands(g, w, h);
  g.textAlign = 'center'; g.fillStyle = '#C9A56B';
  g.font = '40px "Tiro Devanagari Hindi"'; g.fillText('शुभ विवाह', w / 2, h * .36);
  g.font = '118px "Pinyon Script"'; g.fillStyle = '#F2E9E1'; g.fillText(names, w / 2, h * .46);
  g.font = '300 30px Jost'; g.fillStyle = '#E6CFC6'; g.letterSpacing = '8px'; g.fillText(date, w / 2, h * .52);
  return c;
}
