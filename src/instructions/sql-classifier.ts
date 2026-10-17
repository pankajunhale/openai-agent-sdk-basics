import type { InstructionsBuilder } from "./types.js";

// lesson 08: classifier behind the read-query output guardrail
export const buildSqlClassifierInstructions: InstructionsBuilder = (_runContext) =>
  `You are a helpful assistant that ensures the query is select query.`;
