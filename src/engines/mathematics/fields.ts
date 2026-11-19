// Generative ASCII fields. Each frame is a fresh string; the DOM sees one text update.

const RAMP = " .:-=+*#%@";

function frameFrom(rows: string[][]) {
  return rows.map((row) => row.join("").replace(/\s+$/, "")).join("\n");
}

function colorFor(i: number, iterations: number) {
  if (i >= iterations) return RAMP[RAMP.length - 1];
  return RAMP[Math.floor((i / iterations) * (RAMP.length - 1))];
}

function mandelbrotPoint(re: number, im: number, iterations: number) {
  let zx = 0;
  let zy = 0;
  let i = 0;
  while (zx * zx + zy * zy <= 4 && i < iterations) {
    const next = zx * zx - zy * zy + re;
    zy = 2 * zx * zy + im;
    zx = next;
    i++;
  }
  return i;
}

export function mandelbrotFrame(cols: number, rows: number, t: number, seed: number) {
  const zoom = 1 + 0.32 * (0.5 + 0.5 * Math.sin(t * 0.12 + seed));
  const span = 3.1 / zoom;
  const centerX = -0.62 + Math.sin(seed * 1.7) * 0.045;
  const centerY = Math.cos(seed * 2.3) * 0.035;
  const ySpan = span * (rows / cols) * 2.15;
  const iterations = 42;
  const buf: string[][] = [];

  for (let y = 0; y < rows; y++) {
    const row: string[] = [];
    const im = centerY + ((y + 0.5) / rows - 0.5) * ySpan;
    for (let x = 0; x < cols; x++) {
      const re = centerX + ((x + 0.5) / cols - 0.5) * span;
      const i = mandelbrotPoint(re, im, iterations);
      row.push(colorFor(i, iterations));
    }
    buf.push(row);
  }
  return frameFrom(buf);
}

export function juliaFrame(cols: number, rows: number, t: number, seed: number) {
  const angle = seed + t * 0.22;
  const cx = 0.7885 * Math.cos(angle);
  const cy = 0.7885 * Math.sin(angle);
  const span = 2.9;
  const ySpan = span * (rows / cols) * 2.15;
  const iterations = 40;
  const buf: string[][] = [];

  for (let y = 0; y < rows; y++) {
    const row: string[] = [];
    const zy0 = ((y + 0.5) / rows - 0.5) * ySpan;
    for (let x = 0; x < cols; x++) {
      let zx = ((x + 0.5) / cols - 0.5) * span;
      let zy = zy0;
      let i = 0;
      while (zx * zx + zy * zy <= 4 && i < iterations) {
        const next = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = next;
        i++;
      }
      row.push(colorFor(i, iterations));
    }
    buf.push(row);
  }
  return frameFrom(buf);
}

export function sineFrame(cols: number, rows: number, t: number, seed: number) {
  const buf: string[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: string[] = [];
    const v = (y / (rows - 1) - 0.5) * 2;
    for (let x = 0; x < cols; x++) {
      const u = (x / (cols - 1) - 0.5) * 2;
      const radius = Math.hypot(u * 1.15, v * 0.92);
      const value =
        Math.sin(radius * 7 - t * 0.9 + seed) * 0.55 +
        Math.sin(u * 3.2 + t * 0.45) * 0.25 +
        Math.sin(v * 4.6 - t * 0.55) * 0.25;
      const level = Math.max(0, Math.min(1, value * 0.5 + 0.5));
      const index = Math.floor(Math.pow(level, 1.15) * (RAMP.length - 1));
      row.push(RAMP[index]);
    }
    buf.push(row);
  }
  return frameFrom(buf);
}

export function torusFrame(cols: number, rows: number, t: number, seed: number) {
  const buf = Array.from({ length: rows }, () => Array.from({ length: cols }, () => " "));
  const depth = new Float32Array(cols * rows).fill(-Infinity);
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const R = 2.15;
  const r = 0.92;
  const angY = seed + t * 0.42;
  const angX = 0.62 + Math.sin(t * 0.22 + seed) * 0.35;
  const cosY = Math.cos(angY);
  const sinY = Math.sin(angY);
  const cosX = Math.cos(angX);
  const sinX = Math.sin(angX);

  for (let u = 0; u < Math.PI * 2; u += 0.085) {
    for (let v = 0; v < Math.PI * 2; v += 0.11) {
      const ring = R + r * Math.cos(v);
      const x0 = ring * Math.cos(u);
      const y0 = ring * Math.sin(u);
      const z0 = r * Math.sin(v);
      const x1 = x0 * cosY - z0 * sinY;
      const z1 = x0 * sinY + z0 * cosY;
      const y1 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;

      const sx = Math.round(cx + x1 * cols * 0.15);
      const sy = Math.round(cy - y1 * rows * 0.2 - z2 * 1.6);
      if (sx < 0 || sx >= cols || sy < 0 || sy >= rows) continue;
      const cell = sy * cols + sx;
      if (z2 <= depth[cell]) continue;
      depth[cell] = z2;

      const shade = Math.max(0.08, Math.min(1, (z2 + 1.5) / 3));
      const stripe = 0.78 + 0.22 * Math.sin(u * 6 + t * 0.8);
      const index = Math.min(RAMP.length - 1, 1 + Math.floor(shade * stripe * (RAMP.length - 2)));
      buf[sy][sx] = RAMP[index];
    }
  }
  return frameFrom(buf);
}
