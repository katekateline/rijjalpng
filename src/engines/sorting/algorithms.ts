import { Tracer } from "./engine";
import type { Order, SortAlgorithm } from "./types";

const bubble: SortAlgorithm = {
  id: "bubble",
  name: "Bubble Sort",
  blurb: "adjacent compare / swap",
  description:
    "Repeatedly walks the array and swaps neighbours that are out of order. After each pass the largest remaining value bubbles to the right and is locked in place. Exits early when a pass is clean.",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true },
  code: [
    "function bubbleSort(a: number[], order: Cmp) {",
    "  for (let end = a.length - 1; end > 0; end--) {",
    "    let swapped = false;",
    "    for (let i = 0; i < end; i++) {",
    "      if (order(a, i, i + 1) > 0) {",
    "        swap(a, i, i + 1);",
    "        swapped = true;",
    "      }",
    "    }",
    "    markSorted(end);",
    "    if (!swapped) {",
    "      markSorted(...range(0, end));",
    "      break;",
    "    }",
    "  }",
    "}",
  ],
  run(values, order) {
    const t = new Tracer(values, order);
    const a = t.arr;
    for (let end = a.length - 1; end > 0; end--) {
      t.at(2);
      let swapped = false;
      for (let i = 0; i < end; i++) {
        t.at(5);
        if (t.compare(i, i + 1) > 0) {
          t.at(6);
          t.swap(i, i + 1);
          swapped = true;
        }
      }
      t.at(10);
      t.markSorted(end);
      if (!swapped) {
        t.at(12);
        t.markSorted(...Array.from({ length: end }, (_, k) => k));
        break;
      }
    }
    t.done();
    return t.steps;
  },
};

const selection: SortAlgorithm = {
  id: "selection",
  name: "Selection Sort",
  blurb: "scan for minimum / pin",
  description:
    "Splits the array into a sorted prefix and an unsorted remainder. Each pass scans the remainder for the smallest value and swaps it into the boundary position. Every pass costs a full scan, even on sorted input.",
  complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: false },
  code: [
    "function selectionSort(a: number[], order: Cmp) {",
    "  for (let i = 0; i < a.length - 1; i++) {",
    "    let min = i;",
    "    for (let j = i + 1; j < a.length; j++) {",
    "      if (order(a, j, min) < 0) min = j;",
    "    }",
    "    if (min !== i) swap(a, i, min);",
    "    markSorted(i);",
    "  }",
    "  markSorted(a.length - 1);",
    "}",
  ],
  run(values, order) {
    const t = new Tracer(values, order);
    const a = t.arr;
    for (let i = 0; i < a.length - 1; i++) {
      t.at(2);
      let min = i;
      for (let j = i + 1; j < a.length; j++) {
        t.at(5);
        if (t.compare(j, min) < 0) min = j;
      }
      if (min !== i) {
        t.at(7);
        t.swap(i, min);
      }
      t.at(8);
      t.markSorted(i);
    }
    t.at(10);
    t.markSorted(a.length - 1);
    t.done();
    return t.steps;
  },
};

const insertion: SortAlgorithm = {
  id: "insertion",
  name: "Insertion Sort",
  blurb: "grow a sorted prefix",
  description:
    "Builds a sorted region from left to right. Each new element is walked backwards, swapping through larger neighbours until it lands. Near-sorted input makes it close to linear.",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true },
  code: [
    "function insertionSort(a: number[], order: Cmp) {",
    "  for (let i = 1; i < a.length; i++) {",
    "    let j = i;",
    "    while (j > 0 && order(a, j - 1, j) > 0) {",
    "      swap(a, j - 1, j);",
    "      j--;",
    "    }",
    "  }",
    "}",
  ],
  run(values, order) {
    const t = new Tracer(values, order);
    const a = t.arr;
    for (let i = 1; i < a.length; i++) {
      t.at(2);
      t.pivot(i);
      let j = i;
      while (j > 0) {
        t.at(4);
        if (t.compare(j - 1, j) <= 0) break;
        t.at(5);
        t.swap(j - 1, j);
        j--;
      }
      t.clearPivot();
    }
    t.done();
    return t.steps;
  },
};

const merge: SortAlgorithm = {
  id: "merge",
  name: "Merge Sort",
  blurb: "split / merge buffers",
  description:
    "Iteratively doubles the width of sorted runs and merges neighbouring runs through a buffer. Comparisons are recorded against buffer values while the destination array fills in. Guaranteed O(n log n).",
  complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)", stable: true },
  code: [
    "function mergeSort(a: number[], order: Cmp) {",
    "  const n = a.length;",
    "  for (let width = 1; width < n; width *= 2) {",
    "    for (let lo = 0; lo < n; lo += width * 2) {",
    "      const mid = Math.min(lo + width, n);",
    "      const hi = Math.min(lo + width * 2, n);",
    "      const left = a.slice(lo, mid);",
    "      const right = a.slice(mid, hi);",
    "      let i = 0, j = 0, k = lo;",
    "      while (i < left.length && j < right.length) {",
    "        if (order(left[i], right[j]) <= 0) a[k++] = left[i++];",
    "        else a[k++] = right[j++];",
    "      }",
    "      while (i < left.length) a[k++] = left[i++];",
    "      while (j < right.length) a[k++] = right[j++];",
    "    }",
    "  }",
    "}",
  ],
  run(values, order) {
    const t = new Tracer(values, order);
    const a = t.arr;
    const n = a.length;
    for (let width = 1; width < n; width *= 2) {
      t.at(3);
      for (let lo = 0; lo < n; lo += width * 2) {
        const mid = Math.min(lo + width, n);
        const hi = Math.min(lo + width * 2, n);
        if (mid >= hi) continue;
        t.at(7);
        const left = a.slice(lo, mid);
        t.at(8);
        const right = a.slice(mid, hi);
        let i = 0;
        let j = 0;
        let k = lo;
        t.at(10);
        while (i < left.length && j < right.length) {
          t.at(11);
          if (t.compareValues(lo + i, mid + j, left[i], right[j]) <= 0) {
            t.at(11);
            t.set(k++, left[i++]);
          } else {
            t.at(12);
            t.set(k++, right[j++]);
          }
        }
        t.at(14);
        while (i < left.length) {
          t.at(14);
          t.set(k++, left[i++]);
        }
        t.at(15);
        while (j < right.length) {
          t.at(15);
          t.set(k++, right[j++]);
        }
      }
    }
    t.done();
    return t.steps;
  },
};

const quick: SortAlgorithm = {
  id: "quick",
  name: "Quick Sort",
  blurb: "partition around pivot",
  description:
    "Chooses the last element as pivot and partitions smaller values to its left. The pivot index is then final. Recurses on both sides. Average O(n log n), worst case O(n²) on hostile input.",
  complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)", stable: false },
  code: [
    "function quickSort(a: number[], lo: number, hi: number, order: Cmp) {",
    "  if (lo >= hi) {",
    "    if (lo === hi) markSorted(lo);",
    "    return;",
    "  }",
    "  const pivot = hi;",
    "  markPivot(pivot);",
    "  let i = lo;",
    "  for (let j = lo; j < hi; j++) {",
    "    if (order(a, j, pivot) <= 0) {",
    "      if (i !== j) swap(a, i, j);",
    "      i++;",
    "    }",
    "  }",
    "  swap(a, i, hi);",
    "  markSorted(i);",
    "  quickSort(a, lo, i - 1, order);",
    "  quickSort(a, i + 1, hi, order);",
    "}",
  ],
  run(values, order) {
    const t = new Tracer(values, order);
    const a = t.arr;
    const qs = (lo: number, hi: number) => {
      t.at(2);
      if (lo >= hi) {
        if (lo === hi) {
          t.at(3);
          t.markSorted(lo);
        }
        return;
      }
      const pivot = hi;
      t.at(7);
      t.pivot(pivot);
      let i = lo;
      for (let j = lo; j < hi; j++) {
        t.at(10);
        if (t.compare(j, pivot) <= 0) {
          if (i !== j) {
            t.at(11);
            t.swap(i, j);
          }
          i++;
        }
      }
      t.at(16);
      t.swap(i, hi);
      t.clearPivot();
      t.at(17);
      t.markSorted(i);
      qs(lo, i - 1);
      qs(i + 1, hi);
    };
    qs(0, a.length - 1);
    t.done();
    return t.steps;
  },
};

const heap: SortAlgorithm = {
  id: "heap",
  name: "Heap Sort",
  blurb: "binary heap / extract max",
  description:
    "Treats the array as an implicit binary heap. Builds a max-heap in place, then repeatedly swaps the root to the end and sifts the new root down. The sorted region grows from the right.",
  complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)", stable: false },
  code: [
    "function heapSort(a: number[], order: Cmp) {",
    "  const n = a.length;",
    "  for (let i = (n >> 1) - 1; i >= 0; i--) heapify(a, n, i, order);",
    "  for (let end = n - 1; end > 0; end--) {",
    "    swap(a, 0, end);",
    "    markSorted(end);",
    "    heapify(a, end, 0, order);",
    "  }",
    "  markSorted(0);",
    "}",
    "",
    "function heapify(a: number[], n: number, i: number, order: Cmp) {",
    "  let largest = i;",
    "  const l = 2 * i + 1, r = 2 * i + 2;",
    "  if (l < n && order(a, l, largest) > 0) largest = l;",
    "  if (r < n && order(a, r, largest) > 0) largest = r;",
    "  if (largest !== i) {",
    "    swap(a, i, largest);",
    "    heapify(a, n, largest, order);",
    "  }",
    "}",
  ],
  run(values, order) {
    const t = new Tracer(values, order);
    const a = t.arr;
    const n = a.length;
    const heapify = (size: number, i: number) => {
      t.at(13);
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < size) {
        t.at(15);
        if (t.compare(l, largest) > 0) largest = l;
      }
      if (r < size) {
        t.at(16);
        if (t.compare(r, largest) > 0) largest = r;
      }
      if (largest !== i) {
        t.at(18);
        t.swap(i, largest);
        heapify(size, largest);
      }
    };
    for (let i = (n >> 1) - 1; i >= 0; i--) {
      t.at(3);
      heapify(n, i);
    }
    for (let end = n - 1; end > 0; end--) {
      t.at(4);
      t.swap(0, end);
      t.at(6);
      t.markSorted(end);
      heapify(end, 0);
    }
    t.at(9);
    t.markSorted(0);
    t.done();
    return t.steps;
  },
};

const shell: SortAlgorithm = {
  id: "shell",
  name: "Shell Sort",
  blurb: "insertion over shrinking gaps",
  description:
    "Generalises insertion sort to elements far apart. Large gaps move values long distances cheaply; the final gap of one finishes the job. Complexity depends on the gap sequence.",
  complexity: { best: "O(n log n)", average: "O(n^1.3)", worst: "O(n²)", space: "O(1)", stable: false },
  code: [
    "function shellSort(a: number[], order: Cmp) {",
    "  const n = a.length;",
    "  for (let gap = n >> 1; gap > 0; gap >>= 1) {",
    "    for (let i = gap; i < n; i++) {",
    "      let j = i;",
    "      while (j >= gap && order(a, j - gap, j) > 0) {",
    "        swap(a, j - gap, j);",
    "        j -= gap;",
    "      }",
    "    }",
    "  }",
    "}",
  ],
  run(values, order) {
    const t = new Tracer(values, order);
    const a = t.arr;
    const n = a.length;
    for (let gap = n >> 1; gap > 0; gap >>= 1) {
      t.at(3);
      for (let i = gap; i < n; i++) {
        let j = i;
        t.at(5);
        t.pivot(i);
        while (j >= gap) {
          t.at(6);
          if (t.compare(j - gap, j) <= 0) break;
          t.at(7);
          t.swap(j - gap, j);
          j -= gap;
        }
        t.clearPivot();
      }
    }
    t.done();
    return t.steps;
  },
};

export const SORT_ALGORITHMS: SortAlgorithm[] = [bubble, selection, insertion, merge, quick, heap, shell];

export function getAlgorithm(id: string | null): SortAlgorithm {
  return SORT_ALGORITHMS.find((algo) => algo.id === id) ?? SORT_ALGORITHMS[0];
}

export type { Order };
