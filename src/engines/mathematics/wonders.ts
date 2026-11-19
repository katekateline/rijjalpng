// Generative mathematics renderers. Canvas 2D only: no libraries, no images.

export const PHI = (1 + Math.sqrt(5)) / 2;

const BG = "#060a08";

function fillBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
}

/* --- golden ratio / fibonacci ------------------------------------------ */

interface Square {
  x: number;
  y: number;
  size: number;
}

function goldenSquares(depth: number): Square[] {
  let x = 0;
  let y = 0;
  let w = PHI;
  let h = 1;
  const out: Square[] = [];
  for (let i = 0; i < depth; i++) {
    // Cut the square off a different side each turn so the remainder always
    // stays a golden rectangle and the tiling spirals inward without gaps.
    let sq: Square;
    if (w >= h) {
      const s = h;
      if (i % 4 === 0) {
        sq = { x, y, size: s };
        x += s;
      } else {
        sq = { x: x + w - s, y, size: s };
      }
      w -= s;
    } else {
      const s = w;
      if (i % 4 === 1) {
        sq = { x, y, size: s };
        y += s;
      } else {
        sq = { x, y: y + h - s, size: s };
      }
      h -= s;
    }
    if (!Number.isFinite(sq.size) || sq.size <= 1e-6) break;
    out.push(sq);
  }
  return out;
}

function fitSquares(squares: Square[], w: number, h: number, pad: number) {
  const xs = squares.map((s) => s.x);
  const ys = squares.map((s) => s.y);
  const x1 = Math.max(...squares.map((s) => s.x + s.size));
  const y1 = Math.max(...squares.map((s) => s.y + s.size));
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const scale = Math.min((w - pad * 2) / (x1 - minX), (h - pad * 2) / (y1 - minY));
  return {
    scale,
    ox: (w - (x1 - minX) * scale) / 2 - minX * scale,
    oy: (h - (y1 - minY) * scale) / 2 - minY * scale,
  };
}

function drawSpiral(
  ctx: CanvasRenderingContext2D,
  squares: Square[],
  scale: number,
  ox: number,
  oy: number,
  shown: number,
) {
  if (shown < 2) return;
  const minX = Math.min(...squares.map((s) => s.x));
  const minY = Math.min(...squares.map((s) => s.y));
  const maxX = Math.max(...squares.map((s) => s.x + s.size));
  const maxY = Math.max(...squares.map((s) => s.y + s.size));

  // Fitted logarithmic spiral: r shrinks by φ every quarter turn.
  const cx = ox + ((minX + maxX) / 2) * scale;
  const cy = oy + ((minY + maxY) / 2) * scale;
  const maxR = Math.min(maxX - minX, maxY - minY) * 0.5 * scale * 0.96;
  const b = Math.log(PHI) / (Math.PI / 2);
  const turns = Math.PI * 4;

  ctx.beginPath();
  for (let t = 0; t <= turns; t += 0.04) {
    const r = maxR * Math.exp(-b * t);
    const x = cx + Math.cos(t - Math.PI / 2) * r;
    const y = cy + Math.sin(t - Math.PI / 2) * r;
    if (t === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.globalAlpha = Math.min(1, shown / squares.length);
  ctx.strokeStyle = "rgba(163, 255, 120, 0.85)";
  ctx.lineWidth = 1.3;
  ctx.shadowColor = "#4dff91";
  ctx.shadowBlur = 9;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function drawSquares(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  depth: number,
  reveal: number,
  labels: number[] | null,
) {
  const squares = goldenSquares(depth);
  if (!squares.length) return;
  const { scale, ox, oy } = fitSquares(squares, w, h, 26);
  const shown = Math.max(1, Math.ceil(squares.length * reveal));

  for (let i = 0; i < shown && i < squares.length; i++) {
    const s = squares[i];
    const x = ox + s.x * scale;
    const y = oy + s.y * scale;
    const size = s.size * scale;
    ctx.strokeStyle = i === shown - 1 ? "rgba(163, 255, 120, 0.9)" : "rgba(40, 75, 54, 0.85)";
    ctx.lineWidth = i === shown - 1 ? 1.4 : 1;
    ctx.strokeRect(x, y, size, size);

    if (labels && size > 22) {
      ctx.fillStyle = "rgba(102, 115, 107, 0.9)";
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(String(labels[i]), x + 4, y + 4);
    }
  }
  drawSpiral(ctx, squares, scale, ox, oy, shown);
}

export function drawGolden(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  opts: { depth: number; animate: boolean },
) {
  fillBg(ctx, w, h);
  const reveal = opts.animate ? (t * 0.18) % 1 : 1;
  drawSquares(ctx, w, h, opts.depth, reveal, null);

  ctx.fillStyle = "rgba(163, 255, 120, 0.65)";
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(`φ = ${PHI.toFixed(9)}`, 14, h - 12);
}

export function fibonacciNumbers(count: number) {
  const out = [1, 1];
  while (out.length < count) out.push(out[out.length - 1] + out[out.length - 2]);
  return out.slice(0, count);
}

export function drawFibonacci(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  opts: { count: number; animate: boolean },
) {
  fillBg(ctx, w, h);
  const reveal = opts.animate ? (t * 0.14) % 1 : 1;
  drawSquares(ctx, w, h, opts.count, reveal, fibonacciNumbers(opts.count));
}

/* --- monte carlo pi ---------------------------------------------------- */

export class MonteCarloPi {
  private buffer = document.createElement("canvas");
  private bctx: CanvasRenderingContext2D;
  inside = 0;
  total = 0;
  private w = 1;
  private h = 1;

  constructor() {
    this.bctx = this.buffer.getContext("2d") as CanvasRenderingContext2D;
  }

  get estimate() {
    return this.total ? (4 * this.inside) / this.total : 0;
  }

  resize(cssW: number, cssH: number) {
    const size = Math.max(1, Math.min(cssW, cssH));
    if (size === this.w) return;
    this.w = size;
    this.h = size;
    this.buffer.width = Math.round(size);
    this.buffer.height = Math.round(size);
    this.reset();
  }

  reset() {
    this.inside = 0;
    this.total = 0;
    this.bctx.clearRect(0, 0, this.w, this.h);
  }

  add(count: number) {
    const insideX: number[] = [];
    const insideY: number[] = [];
    const outsideX: number[] = [];
    const outsideY: number[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random();
      const y = Math.random();
      this.total++;
      if (x * x + y * y <= 1) {
        this.inside++;
        insideX.push(x);
        insideY.push(y);
      } else {
        outsideX.push(x);
        outsideY.push(y);
      }
    }
    const r = Math.max(1, Math.round(this.w * 0.004));
    const b = this.bctx;
    b.fillStyle = "rgba(163, 255, 120, 0.55)";
    for (let i = 0; i < insideX.length; i++) b.fillRect(insideX[i] * this.w, insideY[i] * this.h, r, r);
    b.fillStyle = "rgba(103, 232, 249, 0.3)";
    for (let i = 0; i < outsideX.length; i++) b.fillRect(outsideX[i] * this.w, outsideY[i] * this.h, r, r);
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    fillBg(ctx, w, h);
    const size = Math.min(w, h) * 0.84;
    const x = (w - size) / 2;
    const y = (h - size) / 2;

    ctx.strokeStyle = "rgba(40, 75, 54, 0.9)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(163, 255, 120, 0.55)";
    ctx.shadowColor = "#4dff91";
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();

    if (this.total) {
      ctx.drawImage(this.buffer, 0, 0, this.w, this.h, x, y, size, size);
    }

    ctx.fillStyle = "rgba(102, 115, 107, 0.8)";
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("MONTE CARLO / n POINTS", x + 2, y - 6);
  }
}

/* --- lissajous --------------------------------------------------------- */

export function drawLissajous(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  opts: { a: number; b: number; phase: number; amplitude: number },
) {
  fillBg(ctx, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const amp = Math.min(w, h) * 0.42 * opts.amplitude;

  ctx.strokeStyle = "rgba(23, 36, 28, 0.9)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, 20);
  ctx.lineTo(cx, h - 20);
  ctx.moveTo(20, cy);
  ctx.lineTo(w - 20, cy);
  ctx.stroke();

  ctx.beginPath();
  const phase = opts.phase + t * 0.5;
  for (let i = 0; i <= 1600; i++) {
    const u = (i / 1600) * Math.PI * 2;
    const px = cx + Math.sin(opts.a * u + phase) * amp;
    const py = cy + Math.sin(opts.b * u) * amp;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = "rgba(163, 255, 120, 0.9)";
  ctx.lineWidth = 1.4;
  ctx.shadowColor = "#4dff91";
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  const dotX = cx + Math.sin(opts.a * t * 1.4 + phase) * amp;
  const dotY = cy + Math.sin(opts.b * t * 1.4) * amp;
  ctx.fillStyle = "#67e8f9";
  ctx.beginPath();
  ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
  ctx.fill();
}

/* --- fourier ----------------------------------------------------------- */

export type Waveform = "square" | "saw" | "triangle";

function coefficients(waveform: Waveform, harmonics: number) {
  const out: { amp: number; freq: number }[] = [];
  if (waveform === "square") {
    for (let k = 1; out.length < harmonics; k += 2) out.push({ amp: 4 / (Math.PI * k), freq: k });
  } else if (waveform === "triangle") {
    for (let k = 1; out.length < harmonics; k += 2) {
      out.push({ amp: (8 / (Math.PI * Math.PI * k * k)) * (k % 4 === 1 ? 1 : -1), freq: k });
    }
  } else {
    for (let k = 1; out.length < harmonics; k++) {
      out.push({ amp: (2 / (Math.PI * k)) * (k % 2 === 1 ? 1 : -1), freq: k });
    }
  }
  return out;
}

const FOURIER_BUFFER = 460;

export function drawFourier(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  opts: { waveform: Waveform; harmonics: number },
  buffer: number[],
) {
  fillBg(ctx, w, h);
  const coeffs = coefficients(opts.waveform, opts.harmonics);
  const totalAmp = coeffs.reduce((sum, c) => sum + Math.abs(c.amp), 0) || 1;
  const scale = Math.min(h * 0.34, w * 0.15) / totalAmp;
  let x = w * 0.2;
  let y = h * 0.5;

  ctx.strokeStyle = "rgba(23, 36, 28, 0.9)";
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, w - 24, h - 24);

  for (const c of coeffs) {
    const radius = Math.abs(c.amp) * scale;
    const angle = c.freq * t + (c.amp < 0 ? Math.PI : 0);
    const nx = x + Math.cos(angle) * radius;
    const ny = y - Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(103, 232, 249, 0.22)";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = "rgba(103, 232, 249, 0.55)";
    ctx.stroke();
    x = nx;
    y = ny;
  }

  ctx.fillStyle = "#a3ff78";
  ctx.beginPath();
  ctx.arc(x, y, 2.4, 0, Math.PI * 2);
  ctx.fill();

  buffer.unshift(y);
  if (buffer.length > FOURIER_BUFFER) buffer.pop();

  const waveX = w * 0.4;
  const waveW = w - waveX - 18;
  const span = Math.max(1, buffer.length - 1);
  ctx.beginPath();
  buffer.forEach((py, i) => {
    const px = waveX + (i / span) * waveW;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = "rgba(163, 255, 120, 0.9)";
  ctx.lineWidth = 1.4;
  ctx.shadowColor = "#4dff91";
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(102, 115, 107, 0.85)";
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = "left";
  ctx.fillText(`${opts.harmonics} HARMONICS / ${opts.waveform.toUpperCase()}`, 18, 28);
}

/* --- fractals ---------------------------------------------------------- */

export type FractalPalette = "phosphor" | "ice" | "ember";

const STOPS: Record<FractalPalette, [number, number, number][]> = {
  phosphor: [
    [4, 8, 6],
    [10, 40, 25],
    [40, 160, 90],
    [120, 255, 150],
    [220, 255, 235],
  ],
  ice: [
    [4, 7, 10],
    [8, 30, 50],
    [20, 100, 150],
    [90, 220, 250],
    [225, 250, 255],
  ],
  ember: [
    [8, 5, 4],
    [45, 16, 8],
    [140, 50, 10],
    [240, 140, 40],
    [255, 235, 190],
  ],
};

function paletteColor(stops: [number, number, number][], t: number) {
  const scaled = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const i = Math.floor(scaled);
  const f = scaled - i;
  const a = stops[i];
  const b = stops[Math.min(stops.length - 1, i + 1)];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

let offscreen: HTMLCanvasElement | null = null;
let offctx: CanvasRenderingContext2D | null = null;
let lastKey = "";

export interface FractalView {
  type: "mandelbrot" | "julia";
  cx: number;
  cy: number;
  zoom: number;
  iterations: number;
  palette: FractalPalette;
  juliaRe: number;
  juliaIm: number;
}

export function drawFractal(
  ctx: CanvasRenderingContext2D,
  cssW: number,
  cssH: number,
  view: FractalView,
): number {
  // shortcut: render capped at 720px wide and upscaled. Deep zooms soften on
  // large screens; move to WebGL if crisp deep zoom becomes a requirement.
  const rw = Math.min(720, Math.max(240, Math.round(cssW)));  const rh = Math.max(180, Math.round(rw * (cssH / cssW)));
  if (!offscreen) {
    offscreen = document.createElement("canvas");
    offctx = offscreen.getContext("2d");
  }
  const key = `${rw}x${rh}`;
  if (lastKey !== key) {
    offscreen.width = rw;
    offscreen.height = rh;
    lastKey = key;
  }
  if (!offctx) return 0;

  const start = performance.now();
  const image = offctx.createImageData(rw, rh);
  const data = image.data;
  const aspect = rh / rw;
  const span = 3.2 / view.zoom;
  const stops = STOPS[view.palette];
  const maxIter = view.iterations;

  for (let py = 0; py < rh; py++) {
    const im = view.cy + (py / rh - 0.5) * span * aspect;
    for (let px = 0; px < rw; px++) {
      const re = view.cx + (px / rw - 0.5) * span;
      let zx: number;
      let zy: number;
      let cr: number;
      let ci: number;
      if (view.type === "julia") {
        zx = re;
        zy = im;
        cr = view.juliaRe;
        ci = view.juliaIm;
      } else {
        zx = 0;
        zy = 0;
        cr = re;
        ci = im;
      }
      let i = 0;
      while (i < maxIter && zx * zx + zy * zy <= 4) {
        const nx = zx * zx - zy * zy + cr;
        zy = 2 * zx * zy + ci;
        zx = nx;
        i++;
      }
      const idx = (py * rw + px) * 4;
      let r = 4;
      let g = 8;
      let b = 6;
      if (i < maxIter) {
        const mag = Math.sqrt(zx * zx + zy * zy);
        const smooth = i + 1 - Math.log(Math.log(Math.max(1.0001, mag))) / Math.LN2;
        const t = Math.pow(Math.min(1, smooth / maxIter), 0.85);
        [r, g, b] = paletteColor(stops, t);
      } else {
        [r, g, b] = stops[0];
      }
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  offctx.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(offscreen, 0, 0, rw, rh, 0, 0, cssW, cssH);
  return performance.now() - start;
}
