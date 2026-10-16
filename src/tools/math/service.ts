import type { MathOperation } from "./operations.js";
import type { MathResult } from "./types.js";

const SYMBOLS: Record<MathOperation, string> = {
  add: "+",
  subtract: "-",
  multiply: "×",
  divide: "÷",
  power: "^",
  percentage: "% of",
};

export function calculate(operation: MathOperation, a: number, b: number): MathResult {
  let result: number;

  switch (operation) {
    case "add":
      result = a + b;
      break;
    case "subtract":
      result = a - b;
      break;
    case "multiply":
      result = a * b;
      break;
    case "divide":
      if (b === 0) throw new Error("Cannot divide by zero");
      result = a / b;
      break;
    case "power":
      result = a ** b;
      break;
    case "percentage":
      result = (a / 100) * b;
      break;
  }

  return {
    operation,
    a,
    b,
    result,
    expression: `${a} ${SYMBOLS[operation]} ${b} = ${result}`,
  };
}
