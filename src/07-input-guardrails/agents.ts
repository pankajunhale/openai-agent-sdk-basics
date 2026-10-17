import { Agent } from "@openai/agents";
import { DEFAULT_MODEL } from "../constants/index.js";
import type { UserContext } from "../core/index.js";
import { mathInputGuardrail } from "../guardrails/index.js";
import { buildMathTutorInstructions } from "../instructions/index.js";

// two layers: the guardrail blocks non-math messages, the prompt handles mixed ones it lets through
export const mathAgent = new Agent<UserContext>({
  name: "Math Agent",
  instructions: buildMathTutorInstructions,
  model: DEFAULT_MODEL,
  inputGuardrails: [mathInputGuardrail],
});
