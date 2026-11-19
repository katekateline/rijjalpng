import { barsArt, fourierArt, goldenArt, lifeArt, lissajousArt, mandelbrotArt, mazeArt, piArt, torusArt } from "../engines/ascii/art";

export type Category = "SORTING" | "PATHFINDING" | "CELLULAR" | "MATHEMATICAL WONDERS" | "ASCII FIELDS" | "3D / RAYMARCHING";

export interface Experiment {
  id: string;
  name: string;
  href: string;
  category: Category;
  difficulty: "LOW" | "MED" | "HIGH";
  desc: string;
  art: string;
}

export const categories: { id: string; name: Category; blurb: string }[] = [
  { id: "sorting", name: "SORTING", blurb: "Order pulled out of noise, one comparison at a time." },
  { id: "pathfinding", name: "PATHFINDING", blurb: "Search fronts eating through a walled field." },
  { id: "cellular", name: "CELLULAR", blurb: "Local rules, global weather. Machines that grow." },
  { id: "wonders", name: "MATHEMATICAL WONDERS", blurb: "Constants, curves and fractals turned into interactive form." },
  { id: "ascii-fields", name: "ASCII FIELDS", blurb: "Iteration and waves sampled into a character grid." },
  { id: "3d", name: "3D / RAYMARCHING", blurb: "Volume without pixels. Geometry drawn in glyphs." },
];

export const experiments: Experiment[] = [
  { id: "bubble", name: "Bubble Sort", href: "/experiments/sorting/?algo=bubble", category: "SORTING", difficulty: "LOW", desc: "Adjacent swaps. The slowest way to find order.", art: barsArt(11) },
  { id: "selection", name: "Selection Sort", href: "/experiments/sorting/?algo=selection", category: "SORTING", difficulty: "LOW", desc: "Scan for the smallest. Pin it. Repeat.", art: barsArt(29) },
  { id: "insertion", name: "Insertion Sort", href: "/experiments/sorting/?algo=insertion", category: "SORTING", difficulty: "LOW", desc: "A sorted hand grows from left to right.", art: barsArt(43) },
  { id: "merge", name: "Merge Sort", href: "/experiments/sorting/?algo=merge", category: "SORTING", difficulty: "MED", desc: "Divide the field, then reconcile the halves.", art: barsArt(61) },
  { id: "quick", name: "Quick Sort", href: "/experiments/sorting/?algo=quick", category: "SORTING", difficulty: "MED", desc: "A pivot draws a border through the noise.", art: barsArt(73) },
  { id: "heap", name: "Heap Sort", href: "/experiments/sorting/?algo=heap", category: "SORTING", difficulty: "HIGH", desc: "A binary tree folded into a flat array.", art: barsArt(89) },
  { id: "shell", name: "Shell Sort", href: "/experiments/sorting/?algo=shell", category: "SORTING", difficulty: "MED", desc: "Insertion sort over shrinking gaps.", art: barsArt(101) },
  { id: "astar", name: "A* Search", href: "/experiments/pathfinding/?algo=astar", category: "PATHFINDING", difficulty: "MED", desc: "Heuristic-guided search. Greedy but exact.", art: mazeArt(7) },
  { id: "dijkstra", name: "Dijkstra", href: "/experiments/pathfinding/?algo=dijkstra", category: "PATHFINDING", difficulty: "MED", desc: "The frontier expands by cost alone.", art: mazeArt(23) },
  { id: "bfs", name: "Breadth-First", href: "/experiments/pathfinding/?algo=bfs", category: "PATHFINDING", difficulty: "LOW", desc: "Rings of discovery. Shortest path guaranteed.", art: mazeArt(41) },
  { id: "dfs", name: "Depth-First", href: "/experiments/pathfinding/?algo=dfs", category: "PATHFINDING", difficulty: "LOW", desc: "One thread, followed to its dead end.", art: mazeArt(59) },
  { id: "life", name: "Game of Life", href: "/experiments/cellular/?mode=life", category: "CELLULAR", difficulty: "LOW", desc: "Four rules. Infinite behaviour.", art: lifeArt(5) },
  { id: "rule30", name: "Rule 30", href: "/experiments/cellular/?mode=rule30", category: "CELLULAR", difficulty: "LOW", desc: "One row of bits. Deterministic chaos.", art: lifeArt(17) },
  { id: "rule90", name: "Rule 90", href: "/experiments/cellular/?mode=rule90", category: "CELLULAR", difficulty: "LOW", desc: "XOR neighbourhoods. Sierpinski echoes.", art: lifeArt(31) },
  { id: "golden", name: "Golden Ratio", href: "/experiments/wonders/?exp=golden", category: "MATHEMATICAL WONDERS", difficulty: "LOW", desc: "A proportion that spirals into itself.", art: goldenArt(4) },
  { id: "pi", name: "Pi / Monte Carlo", href: "/experiments/wonders/?exp=pi", category: "MATHEMATICAL WONDERS", difficulty: "LOW", desc: "Random rain inside a circle estimates π.", art: piArt(8) },
  { id: "fibonacci", name: "Fibonacci Sequence", href: "/experiments/wonders/?exp=fibonacci", category: "MATHEMATICAL WONDERS", difficulty: "LOW", desc: "Squares that grow toward the golden mean.", art: goldenArt(21) },
  { id: "fractal", name: "Mandelbrot Explorer", href: "/experiments/wonders/?exp=mandelbrot", category: "MATHEMATICAL WONDERS", difficulty: "MED", desc: "Pan and zoom into an infinite boundary.", art: mandelbrotArt(3) },
  { id: "julia-orbit", name: "Julia Explorer", href: "/experiments/wonders/?exp=julia", category: "MATHEMATICAL WONDERS", difficulty: "HIGH", desc: "Orbits of c, painted as organic density.", art: mandelbrotArt(13) },
  { id: "lissajous", name: "Lissajous Curves", href: "/experiments/wonders/?exp=lissajous", category: "MATHEMATICAL WONDERS", difficulty: "LOW", desc: "Two sines, one ribbon of light.", art: lissajousArt(6) },
  { id: "fourier", name: "Fourier Series", href: "/experiments/wonders/?exp=fourier", category: "MATHEMATICAL WONDERS", difficulty: "MED", desc: "Rotating circles that draw a waveform.", art: fourierArt(5) },
  { id: "mandelbrot-field", name: "Mandelbrot Field", href: "/experiments/mathematics/?exp=mandelbrot", category: "ASCII FIELDS", difficulty: "MED", desc: "The boundary that never resolves, in glyphs.", art: mandelbrotArt(23) },
  { id: "julia-field", name: "Julia Field", href: "/experiments/mathematics/?exp=julia", category: "ASCII FIELDS", difficulty: "MED", desc: "A family portrait in character density.", art: mandelbrotArt(33) },
  { id: "sine", name: "Sine Wave Field", href: "/experiments/mathematics/?exp=sine", category: "ASCII FIELDS", difficulty: "LOW", desc: "Interfering oscillations sampled into glyphs.", art: mandelbrotArt(43) },
  { id: "torus", name: "Rotating Torus", href: "/experiments/mathematics/?exp=torus", category: "3D / RAYMARCHING", difficulty: "HIGH", desc: "A donut of points, projected to a text grid.", art: torusArt(37) },
  { id: "sphere", name: "Void Sphere", href: "/#hero", category: "3D / RAYMARCHING", difficulty: "HIGH", desc: "The landing composition. A sphere of characters, always turning.", art: torusArt(53) },
];
