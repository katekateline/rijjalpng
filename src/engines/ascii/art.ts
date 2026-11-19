// Deterministic build-time ASCII artworks. No images, no randomness at runtime.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blank(w: number, h: number) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => " "));
}

function finish(buf: string[][]) {
  return buf.map((row) => row.join("").replace(/\s+$/, "")).join("\n");
}

export function barsArt(seed: number, w = 28, h = 8) {
  const rand = rng(seed);
  const cols = Math.floor(w / 2);
  const heights = Array.from({ length: cols }, (_, i) => 1 + Math.floor((i / cols) * (h - 2) + rand() * 3));
  const buf = blank(w, h);
  const ramp = "░▒▓█";
  for (let c = 0; c < cols; c++) {
    const hgt = Math.min(h, heights[c]);
    for (let r = 0; r < hgt; r++) {
      const y = h - 1 - r;
      buf[y][c * 2] = ramp[Math.min(3, Math.floor(r / 2))];
    }
    if (rand() > 0.86) buf[Math.max(0, h - 1 - hgt)][c * 2] = "@";
  }
  return finish(buf);
}

export function mazeArt(seed: number, w = 28, h = 8) {
  const rand = rng(seed);
  const buf = blank(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const border = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      buf[y][x] = border || rand() < 0.24 ? "#" : ".";
    }
  }
  // A real traversable staircase corridor, drawn wall-to-wall.
  let x = 1;
  let y = 1;
  buf[y][x] = "S";
  while (x < w - 2 || y < h - 2) {
    if (x < w - 2 && (y >= h - 2 || rand() > 0.4)) x++;
    else if (y < h - 2) y++;
    else x++;
    if (x >= w - 1 || y >= h - 1) break;
    buf[y][x] = rand() > 0.7 ? "+" : "*";
  }
  buf[h - 2][w - 2] = "E";
  return finish(buf);
}

export function lifeArt(seed: number, w = 28, h = 8) {
  const rand = rng(seed);
  let grid = Array.from({ length: h }, () => Array.from({ length: w }, () => (rand() > 0.58 ? 1 : 0)));
  for (let gen = 0; gen < 4; gen++) {
    const next = grid.map((row) => row.slice());
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            if (dx || dy) n += grid[(y + dy + h) % h][(x + dx + w) % w];
        next[y][x] = grid[y][x] ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
      }
    }
    grid = next;
  }
  return finish(grid.map((row) => row.map((c) => (c ? (rand() > 0.4 ? "█" : "▓") : " "))));
}

export function mandelbrotArt(seed: number, w = 28, h = 8) {
  const rand = rng(seed);
  const shift = Math.floor(rand() * 6);
  const ramp = " .:-=+*#%@";
  const rows: string[] = [];
  for (let py = 0; py < h; py++) {
    let line = "";
    for (let px = 0; px < w; px++) {
      const cx = -2.1 + (px / w) * 2.9;
      const cy = -1.05 + (py / h) * 2.1;
      let zx = 0;
      let zy = 0;
      let i = 0;
      while (zx * zx + zy * zy <= 4 && i < 24) {
        const t = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = t;
        i++;
      }
      line += i === 24 ? ramp[ramp.length - 1] : ramp[Math.min(ramp.length - 1, Math.floor((i / 10) * ramp.length) + shift) % ramp.length];
    }
    rows.push(line);
  }
  return rows.join("\n");
}

export function voidArt(seed: number, w = 60, h = 13) {
  const rand = rng(seed);
  const buf = blank(w, h);
  const cx = w / 2;
  const cy = h / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / (w / 2);
      const dy = (y - cy) / (h / 2);
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 0.24) continue;
      if (d > 1.08) {
        if (rand() > 0.88) buf[y][x] = rand() > 0.5 ? "." : "+";
        continue;
      }
      const band = Math.sin(d * 18 + Math.atan2(dy, dx) * 3) * 0.5 + 0.5;
      if (band < 0.18 && rand() < 0.55) continue;
      const ramp = d < 0.45 ? "█▓" : d < 0.72 ? "▓▒" : "▒░";
      buf[y][x] = ramp[Math.floor(rand() * ramp.length)];
    }
  }
  return finish(buf);
}

export function torusArt(seed: number, w = 28, h = 8) {
  const rand = rng(seed);
  const buf = blank(w, h);
  const ay = 0.5 + rand() * 2;
  const ax = 0.7 + rand() * 0.7;
  const R = 2.2;
  const r = 0.85;
  const ramp = "░▒▓█";
  const cosY = Math.cos(ay);
  const sinY = Math.sin(ay);
  const cosX = Math.cos(ax);
  const sinX = Math.sin(ax);
  for (let u = 0; u < Math.PI * 2; u += 0.13) {
    for (let v = 0; v < Math.PI * 2; v += 0.19) {
      const x0 = (R + r * Math.cos(v)) * Math.cos(u);
      const y0 = (R + r * Math.cos(v)) * Math.sin(u);
      const z0 = r * Math.sin(v);
      const x1 = x0 * cosY - z0 * sinY;
      const z1 = x0 * sinY + z0 * cosY;
      const y1 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;
      const px = Math.round(w / 2 + x1 * 2.9);
      const py = Math.round(h / 2 - y1 * 1.35 - z2 * 0.5);
      if (px < 0 || px >= w || py < 0 || py >= h) continue;
      const shade = Math.max(0, Math.min(3, Math.floor((z2 + 1.4) * 1.35)));
      buf[py][px] = ramp[shade];
    }
  }
  return finish(buf);
}

export function goldenArt(seed: number, w = 28, h = 8) {
  const buf = blank(w, h);
  const rand = rng(seed);
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const maxT = 5.2;
  const steps = w * h * 4;
  for (let i = 0; i < steps; i++) {
    const th = (i / steps) * maxT;
    const r = Math.exp(0.36 * th) / Math.exp(0.36 * maxT);
    const px = Math.round(cx + Math.cos(th + rand() * 0.05) * r * (w * 0.46));
    const py = Math.round(cy - Math.sin(th) * r * (h * 0.46));
    if (px < 0 || px >= w || py < 0 || py >= h) continue;
    buf[py][px] = r > 0.72 ? "+" : r > 0.4 ? "*" : ".";
  }
  return finish(buf);
}

export function piArt(seed: number, w = 28, h = 8) {
  const rand = rng(seed);
  const buf = blank(w, h);
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  for (let i = 0; i < w * h * 2; i++) {
    const px = Math.floor(rand() * w);
    const py = Math.floor(rand() * h);
    const dx = (px - cx) / (w / 2);
    const dy = ((py - cy) / (h / 2)) * 0.55;
    const d = Math.hypot(dx, dy);
    if (Math.abs(d - 1) < 0.09) buf[py][px] = "O";
    else if (d < 1) buf[py][px] = rand() > 0.35 ? "#" : "*";
    else if (buf[py][px] === " ") buf[py][px] = ".";
  }
  return finish(buf);
}

export function lissajousArt(seed: number, w = 28, h = 8) {
  const buf = blank(w, h);
  const phase = (seed % 10) / 10 * Math.PI;
  for (let i = 0; i < 1200; i++) {
    const t = (i / 1200) * Math.PI * 2 * 4;
    const px = Math.round((w - 1) / 2 + Math.sin(3 * t + phase) * (w * 0.44));
    const py = Math.round((h - 1) / 2 + Math.sin(2 * t) * (h * 0.44));
    if (px < 0 || px >= w || py < 0 || py >= h) continue;
    buf[py][px] = "*";
  }
  return finish(buf);
}

export function fourierArt(seed: number, w = 28, h = 8) {
  const buf = blank(w, h);
  const cy = (h - 1) / 2;
  for (let px = 1; px < w; px++) {
    const t = (px / (w - 1)) * Math.PI * 6;
    let y = 0;
    for (let n = 1; n <= 9; n += 2) y += Math.sin(n * t + seed) / n;
    const py = Math.round(cy - (y / 1.4) * (h * 0.42));
    if (py >= 0 && py < h) buf[py][px] = "#";
    if ((px * 3 + seed) % 11 < 2 && py > 0 && py < h - 1) buf[py + 1][px] = ".";
  }
  return finish(buf);
}
