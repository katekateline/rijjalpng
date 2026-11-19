export type SearchId = "astar" | "dijkstra" | "bfs" | "dfs";

export interface SearchAlgorithm {
  id: SearchId;
  name: string;
  short: string;
  description: string;
  frontier: string;
  complexity: { time: string; space: string; optimal: boolean };
}

export interface Maze {
  cols: number;
  rows: number;
  walls: Uint8Array;
  start: number;
  end: number;
}

export interface SearchResult {
  order: number[];
  path: number[];
  visitIndex: Int32Array;
  found: boolean;
}

export const SEARCH_ALGORITHMS: SearchAlgorithm[] = [
  {
    id: "astar",
    name: "A* Search",
    short: "best-first + heuristic",
    description:
      "Expands the node with the lowest estimated total cost: steps taken plus Manhattan distance to the exit. With an admissible heuristic it still returns a shortest path.",
    frontier: "priority queue · f = g + h",
    complexity: { time: "O(E log V)", space: "O(V)", optimal: true },
  },
  {
    id: "dijkstra",
    name: "Dijkstra",
    short: "uniform-cost expansion",
    description:
      "Expands the cheapest known node first. On an unweighted grid it visits in rings, like BFS, but the priority queue makes it ready for weighted terrain.",
    frontier: "priority queue · g",
    complexity: { time: "O(E log V)", space: "O(V)", optimal: true },
  },
  {
    id: "bfs",
    name: "Breadth-First Search",
    short: "FIFO wavefront",
    description:
      "Sweeps the grid in expanding distance rings. The first arrival at the exit is guaranteed to be a shortest path on an unweighted grid.",
    frontier: "FIFO queue",
    complexity: { time: "O(V + E)", space: "O(V)", optimal: true },
  },
  {
    id: "dfs",
    name: "Depth-First Search",
    short: "LIFO dive",
    description:
      "Follows one corridor as far as it can before backtracking. Finds a path quickly in mazes but makes no promise that it is short.",
    frontier: "LIFO stack",
    complexity: { time: "O(V + E)", space: "O(V)", optimal: false },
  },
];

export function getSearchAlgorithm(id: string | null): SearchAlgorithm {
  return SEARCH_ALGORITHMS.find((algo) => algo.id === id) ?? SEARCH_ALGORITHMS[0];
}

/** Recursive-backtracker maze on odd cells. Always fully connected. */
export function generateMaze(cols = 45, rows = 21): Maze {
  const walls = new Uint8Array(cols * rows).fill(1);
  const stack: number[] = [1 * cols + 1];
  walls[1 * cols + 1] = 0;

  while (stack.length) {
    const current = stack[stack.length - 1];
    const cx = current % cols;
    const cy = (current / cols) | 0;
    const options: [number, number][] = [
      [cx, cy - 2],
      [cx + 2, cy],
      [cx, cy + 2],
      [cx - 2, cy],
    ].filter(([x, y]) => x > 0 && x < cols - 1 && y > 0 && y < rows - 1 && walls[y * cols + x] === 1) as [number, number][];

    if (!options.length) {
      stack.pop();
      continue;
    }

    const [nx, ny] = options[Math.floor(Math.random() * options.length)];
    const wallX = (cx + nx) / 2;
    const wallY = (cy + ny) / 2;
    walls[wallY * cols + wallX] = 0;
    walls[ny * cols + nx] = 0;
    stack.push(ny * cols + nx);
  }

  const start = 1 * cols + 1;
  const end = (rows - 2) * cols + (cols - 2);
  walls[start] = 0;
  walls[end] = 0;
  return { cols, rows, walls, start, end };
}

class MinHeap {
  private nodes: number[] = [];
  private priorities: number[] = [];

  get size() {
    return this.nodes.length;
  }

  push(node: number, priority: number) {
    this.nodes.push(node);
    this.priorities.push(priority);
    let i = this.nodes.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.priorities[parent] <= this.priorities[i]) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  pop() {
    const node = this.nodes[0];
    const lastNode = this.nodes.pop() as number;
    const lastPriority = this.priorities.pop() as number;
    if (this.nodes.length) {
      this.nodes[0] = lastNode;
      this.priorities[0] = lastPriority;
      let i = 0;
      for (;;) {
        const left = i * 2 + 1;
        const right = left + 1;
        let smallest = i;
        if (left < this.nodes.length && this.priorities[left] < this.priorities[smallest]) smallest = left;
        if (right < this.nodes.length && this.priorities[right] < this.priorities[smallest]) smallest = right;
        if (smallest === i) break;
        this.swap(i, smallest);
        i = smallest;
      }
    }
    return node;
  }

  private swap(a: number, b: number) {
    [this.nodes[a], this.nodes[b]] = [this.nodes[b], this.nodes[a]];
    [this.priorities[a], this.priorities[b]] = [this.priorities[b], this.priorities[a]];
  }
}

function manhattan(a: number, b: number, cols: number) {
  return Math.abs((a % cols) - (b % cols)) + Math.abs(((a / cols) | 0) - ((b / cols) | 0));
}

export function solveSearch(maze: Maze, algoId: SearchId): SearchResult {
  const { cols, rows, walls, start, end } = maze;
  const total = cols * rows;
  const parent = new Int32Array(total).fill(-1);
  const dist = new Float64Array(total).fill(Infinity);
  const discovered = new Uint8Array(total);
  const done = new Uint8Array(total);
  const order: number[] = [];
  const neighbours = (node: number) => {
    const x = node % cols;
    const y = (node / cols) | 0;
    const out: number[] = [];
    if (y > 0) out.push(node - cols);
    if (x < cols - 1) out.push(node + 1);
    if (y < rows - 1) out.push(node + cols);
    if (x > 0) out.push(node - 1);
    return out;
  };

  dist[start] = 0;
  discovered[start] = 1;

  if (algoId === "bfs" || algoId === "dfs") {
    const container: number[] = [start];
    let head = 0;
    while (algoId === "bfs" ? head < container.length : container.length > 0) {
      const node = algoId === "bfs" ? container[head++] : (container.pop() as number);
      if (done[node]) continue;
      done[node] = 1;
      order.push(node);
      if (node === end) break;
      for (const nb of neighbours(node)) {
        if (walls[nb] || discovered[nb]) continue;
        discovered[nb] = 1;
        parent[nb] = node;
        container.push(nb);
      }
    }
  } else {
    const heap = new MinHeap();
    heap.push(start, 0);
    while (heap.size) {
      const node = heap.pop();
      if (done[node]) continue;
      done[node] = 1;
      order.push(node);
      if (node === end) break;
      for (const nb of neighbours(node)) {
        if (walls[nb] || done[nb]) continue;
        const next = dist[node] + 1;
        if (next >= dist[nb]) continue;
        dist[nb] = next;
        parent[nb] = node;
        const h = algoId === "astar" ? manhattan(nb, end, cols) : 0;
        heap.push(nb, next + h);
      }
    }
  }

  const found = order.length > 0 && order[order.length - 1] === end;
  const path: number[] = [];
  if (found) {
    let node = end;
    while (node !== -1) {
      path.push(node);
      if (node === start) break;
      node = parent[node];
    }
    path.reverse();
  }

  const visitIndex = new Int32Array(total).fill(-1);
  order.forEach((node, i) => {
    visitIndex[node] = i;
  });

  return { order, path, visitIndex, found };
}
