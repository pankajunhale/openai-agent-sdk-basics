export const MATH_OPERATIONS = {
  add: "a + b",
  subtract: "a - b",
  multiply: "a × b",
  divide: "a ÷ b",
  power: "a raised to the power b",
  percentage: "a% of b",
} as const;

export type MathOperation = keyof typeof MATH_OPERATIONS;

// z.enum() needs a non-empty tuple, not a plain string[]
export const MATH_OPERATION_LIST = Object.keys(MATH_OPERATIONS) as [
  MathOperation,
  ...MathOperation[],
];
