import type { Order, SortStep, StepKind } from "./types";

/** Records every comparison, swap and write while an algorithm runs. */
export class Tracer {
  readonly arr: number[];
  readonly steps: SortStep[] = [];
  readonly sorted = new Set<number>();
  comparisons = 0;
  swaps = 0;
  writes = 0;
  line = 1;
  pivotIndex: number | null = null;

  constructor(values: number[], readonly order: Order) {
    this.arr = values.slice();
    this.push("init", [], "array initialised");
  }

  at(line: number) {
    this.line = line;
  }

  private push(kind: StepKind, indices: number[], note: string) {
    this.steps.push({
      values: this.arr.slice(),
      kind,
      indices: indices.slice(),
      sorted: [...this.sorted],
      pivot: this.pivotIndex,
      comparisons: this.comparisons,
      swaps: this.swaps,
      writes: this.writes,
      line: this.line,
      note,
    });
  }

  private sign(a: number, b: number) {
    const diff = this.order === "asc" ? a - b : b - a;
    return diff < 0 ? -1 : diff > 0 ? 1 : 0;
  }

  compare(i: number, j: number) {
    this.comparisons++;
    const a = this.arr[i];
    const b = this.arr[j];
    const sym = this.order === "asc" ? "<" : ">";
    this.push("compare", [i, j], `a[${i}]=${a} ${sym} a[${j}]=${b}`);
    return this.sign(a, b);
  }

  /** Compare values that are not (yet) at their final positions, e.g. merge buffers. */
  compareValues(i: number, j: number, a: number, b: number) {
    this.comparisons++;
    const sym = this.order === "asc" ? "<=" : ">=";
    this.push("compare", [i, j], `${a} ${sym} ${b}`);
    return this.sign(a, b);
  }

  swap(i: number, j: number) {
    const a = this.arr[i];
    const b = this.arr[j];
    this.arr[i] = b;
    this.arr[j] = a;
    this.writes += 2;
    this.swaps++;
    this.push("swap", [i, j], `swap a[${i}] ↔ a[${j}]`);
  }

  set(i: number, value: number) {
    this.arr[i] = value;
    this.writes++;
    this.push("write", [i], `a[${i}] ← ${value}`);
  }

  pivot(i: number) {
    this.pivotIndex = i;
    this.push("pivot", [i], `pivot a[${i}]=${this.arr[i]}`);
  }

  clearPivot() {
    this.pivotIndex = null;
  }

  markSorted(...indices: number[]) {
    for (const i of indices) this.sorted.add(i);
    this.push("sorted", indices, "position locked");
  }

  note(message: string) {
    this.push("note", [], message);
  }

  done() {
    for (let i = 0; i < this.arr.length; i++) this.sorted.add(i);
    this.pivotIndex = null;
    this.push("done", [], "sequence sorted");
  }
}
