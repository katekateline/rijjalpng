export type Order = "asc" | "desc";

export type StepKind = "init" | "compare" | "swap" | "write" | "pivot" | "sorted" | "note" | "done";

export interface SortStep {
  values: number[];
  kind: StepKind;
  indices: number[];
  sorted: number[];
  pivot: number | null;
  comparisons: number;
  swaps: number;
  writes: number;
  line: number;
  note: string;
}

export interface Complexity {
  best: string;
  average: string;
  worst: string;
  space: string;
  stable: boolean;
}

export interface SortAlgorithm {
  id: string;
  name: string;
  blurb: string;
  description: string;
  complexity: Complexity;
  code: string[];
  run: (values: number[], order: Order) => SortStep[];
}
