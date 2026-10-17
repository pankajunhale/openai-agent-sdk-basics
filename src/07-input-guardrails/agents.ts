import { Agent } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import type { UserContext } from "#core";
import { mathInputGuardrail } from "#guardrails";
import { buildMathTutorInstructions } from "#instructions";

// two layers: the guardrail blocks non-math messages, the prompt handles mixed ones it lets through
export const mathAgent = new Agent<UserContext>({
  name: "Math Agent",
  instructions: buildMathTutorInstructions,
  model: DEFAULT_MODEL,
  inputGuardrails: [mathInputGuardrail],
});
