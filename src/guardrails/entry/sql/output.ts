import { Agent, run } from "@openai/agents";
import type { OutputGuardrail } from "@openai/agents";
import { DEFAULT_MODEL } from "../../../constants/index.js";
import type { UserContext } from "../../../core/index.js";
import { buildSqlClassifierInstructions } from "../../../instructions/index.js";
import { SqlCheckSchema } from "./types.js";
import type { SqlAnswerSchema } from "./types.js";

const guardrailAgent = new Agent<UserContext, typeof SqlCheckSchema>({
  name: "SQL Query Guardrail Agent",
  instructions: buildSqlClassifierInstructions,
  model: DEFAULT_MODEL,
  outputType: SqlCheckSchema,
});

// an output guardrail that ensures the query is a read query.
export const readQueryGuardrail: OutputGuardrail<typeof SqlAnswerSchema, UserContext> = {
  name: "Query Guardrail",
  execute: async ({ agentOutput, context }) => {
    const result = await run(guardrailAgent, agentOutput.response, { context });
    return {
      outputInfo: result.finalOutput?.query,
      tripwireTriggered: !result.finalOutput?.isSafe,
    };
  },
};
