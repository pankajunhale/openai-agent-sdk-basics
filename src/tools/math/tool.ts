import { tool } from "@openai/agents";
import { z } from "zod";
import { MATH_OPERATIONS, MATH_OPERATION_LIST } from "./operations.js";
import { calculate } from "./service.js";

const supportedOperations = Object.entries(MATH_OPERATIONS)
  .map(([name, meaning]) => `${name} (${meaning})`)
  .join(", ");

export const calculateTool = tool({
  name: "calculate",
  description: `Do exact arithmetic on two numbers. Supported operations: ${supportedOperations}. For multi-step problems, call this tool once per step.`,
  parameters: z.object({
    operation: z.enum(MATH_OPERATION_LIST),
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
  execute: async ({ operation, a, b }) => {
    return calculate(operation, a, b);
  },
  // by default the model only sees a generic "An error occurred" message
  errorFunction: (_context, error) =>
    `Error: ${error instanceof Error ? error.message : String(error)}`,
});
