import { Agent } from "@openai/agents";
import { DEFAULT_MODEL } from "../constants/index.js";
import type { UserContext } from "../core/index.js";
import { readQueryGuardrail, SqlAnswerSchema } from "../guardrails/index.js";
import { buildSqlBuilderInstructions } from "../instructions/index.js";

// i am creating sql query builder agent, it will take a natural language query and return a sql query.
export const mainAgent = new Agent<UserContext, typeof SqlAnswerSchema>({
  name: "Query Builder Agent",
  instructions: buildSqlBuilderInstructions,
  model: DEFAULT_MODEL,
  outputGuardrails: [readQueryGuardrail],
  outputType: SqlAnswerSchema,
});
