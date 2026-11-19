// Animated ASCII particle sphere for the landing page.
// A single <pre> is the render target: one string per frame, no DOM churn.

export interface HeroStats {
  fps: number;
  particles: number;
}

const COLS = 76;
const ROWS = 26;
const CX = (COLS - 1) / 2;
const CY = (ROWS - 1) / 2;
const RX = COLS * 0.265;
const RY = ROWS * 0.415;
const RAMP = [".", ":", "-", "=", "+", "*", "#", "%", "█"];

function makeSphere(count: number) {
  const pts: [number, number, number][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = i * golden;
    pts.push([Math.cos(a) * r, y, Math.sin(a) * r]);
  }
  return pts;
}

export function mountSphere(
  el: HTMLPreElement,
  stage: HTMLElement,
  onStats?: (stats: HeroStats) => void,
) {
  const sphere = makeSphere(900);
  const halo = Array.from({ length: 46 }, (_, i) => {
    const a = (i / 46) * Math.PI * 2;
    return { a, r: 1.28 + (i % 5) * 0.075, speed: 0.00018 + (i % 7) * 0.00003 };
  });
  const stars = Array.from({ length: 34 }, (_, i) => ({
    x: (i * 37 + 11) % COLS,
    y: (i * 13 + 5) % ROWS,
    phase: (i * 1.7) % 6.28,
  }));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tilt = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let running = true;
  let raf = 0;
  let last = 0;
  let frames = 0;
  let fpsSince = 0;
  let start = 0;

  const depth = new Float32Array(COLS * ROWS);

  function draw(now: number) {
    if (!start) start = now;
    const t = reduced ? 0 : now - start;
    const grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => " "));
    depth.fill(-1);

    const angY = t * 0.00036 + tilt.x;
    const angX = 0.28 + Math.sin(t * 0.00019) * 0.16 + tilt.y;
    const cosY = Math.cos(angY);
    const sinY = Math.sin(angY);
    const cosX = Math.cos(angX);
    const sinX = Math.sin(angX);

    for (const [x0, y0, z0] of sphere) {
      const x1 = x0 * cosY + z0 * sinY;
      const z1 = -x0 * sinY + z0 * cosY;
      const y1 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;

      const sx = Math.round(CX + x1 * RX);
      const sy = Math.round(CY - y1 * RY - z2 * 0.7);
      if (sx < 0 || sx >= COLS || sy < 0 || sy >= ROWS) continue;
      const cell = sy * COLS + sx;

      if (z2 < 0) {
        if (depth[cell] < 0 && grid[sy][sx] === " ") grid[sy][sx] = ".";
        continue;
      }
      if (z2 <= depth[cell]) continue;
      depth[cell] = z2;

      const bands = 0.5 + 0.5 * Math.sin((y0 * 9 + x1 * 3) + t * 0.0004);
      const shade = Math.max(0.18, Math.min(1, (z2 * 0.72 + 0.28) * (0.78 + bands * 0.22)));
      grid[sy][sx] = RAMP[Math.min(RAMP.length - 1, Math.floor(shade * RAMP.length))];
    }

    for (const p of halo) {
      const a = p.a + t * p.speed;
      const x = Math.cos(a) * p.r;
      const z = Math.sin(a) * p.r;
      const y = Math.sin(a * 2.1) * 0.18;
      const sx = Math.round(CX + x * RX);
      const sy = Math.round(CY - y * RY - z * 1.4);
      if (sx < 0 || sx >= COLS || sy < 0 || sy >= ROWS) continue;
      if (grid[sy][sx] === " ") grid[sy][sx] = z > 0 && p.r < 1.4 ? "+" : ".";
    }

    for (const star of stars) {
      if (grid[star.y][star.x] !== " ") continue;
      const blink = Math.sin(t * 0.0016 + star.phase);
      grid[star.y][star.x] = blink > 0.75 ? "+" : blink > -0.2 ? "." : " ";
    }

    el.textContent = grid.map((row) => row.join("").replace(/\s+$/, "")).join("\n");

    if (!reduced) {
      frames++;
      if (!fpsSince) fpsSince = now;
      if (now - fpsSince >= 500) {
        const fps = Math.round((frames * 1000) / (now - fpsSince));
        frames = 0;
        fpsSince = now;
        onStats?.({ fps, particles: sphere.length + halo.length });
      }
    }
  }

  function loop(now: number) {
    if (!running) return;
    // Cap near 30fps: ASCII composition does not need 120.
    if (now - last >= 32) {
      tilt.x += (target.x - tilt.x) * 0.08;
      tilt.y += (target.y - tilt.y) * 0.08;
      draw(now);
      last = now;
    }
    raf = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (running || reduced) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(loop);
  }

  function stopLoop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.9;
    target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.6;
  });
  stage.addEventListener("pointerleave", () => {
    target.x = 0;
    target.y = 0;
  });

  draw(performance.now());
  if (reduced) {
    onStats?.({ fps: 0, particles: sphere.length + halo.length });
  } else {
    onStats?.({ fps: -1, particles: sphere.length + halo.length });
    raf = requestAnimationFrame(loop);
  }

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) startLoop();
    else stopLoop();
  });
  io.observe(el);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });
}
