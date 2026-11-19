export type CellMode = "life" | "rule30" | "rule90";

export const RULE_VALUE: Record<"rule30" | "rule90", number> = {
  rule30: 30,
  rule90: 90,
};

export function makeLife(cols: number, rows: number, density = 0.28) {
  const cells = new Uint8Array(cols * rows);
  for (let i = 0; i < cells.length; i++) cells[i] = Math.random() < density ? 1 : 0;
  return cells;
}

/** Toroidal Game of Life step, in place. */
export function stepLife(cells: Uint8Array, cols: number, rows: number) {
  const next = new Uint8Array(cells.length);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = (x + dx + cols) % cols;
          const ny = (y + dy + rows) % rows;
          n += cells[ny * cols + nx];
        }
      }
      const i = y * cols + x;
      next[i] = cells[i] ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
    }
  }
  cells.set(next);
}

export function randomRow(width: number) {
  const row = new Uint8Array(width);
  for (let i = 0; i < width; i++) row[i] = Math.random() > 0.5 ? 1 : 0;
  return row;
}

export function centerRow(width: number) {
  const row = new Uint8Array(width);
  row[Math.floor(width / 2)] = 1;
  return row;
}

/** One-dimensional elementary cellular automaton, zero-padded edges. */
export function nextRule(row: Uint8Array, rule: number) {
  const next = new Uint8Array(row.length);
  for (let i = 0; i < row.length; i++) {
    const left = i > 0 ? row[i - 1] : 0;
    const center = row[i];
    const right = i < row.length - 1 ? row[i + 1] : 0;
    const pattern = (left << 2) | (center << 1) | right;
    next[i] = (rule >> pattern) & 1;
  }
  return next;
}

export function liveCount(cells: Uint8Array) {
  let n = 0;
  for (let i = 0; i < cells.length; i++) n += cells[i];
  return n;
}
