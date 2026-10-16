import type { MathOperation } from "./operations.js";

export interface MathResult {
  operation: MathOperation;
  a: number;
  b: number;
  result: number;
  expression: string;
}
