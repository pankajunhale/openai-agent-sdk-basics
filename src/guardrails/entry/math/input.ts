import { Agent } from "@openai/agents";
import type { InputGuardrail } from "@openai/agents";
import { DEFAULT_MODEL } from "../../../constants/index.js";
import type { UserContext } from "../../../core/index.js";
import { buildMathClassifierInstructions } from "../../../instructions/index.js";
import { classifyLatestUserMessage } from "../../shared/classify.js";
import { MathCheckSchema } from "./types.js";

const mathClassifier = new Agent<UserContext, typeof MathCheckSchema>({
  name: "Math Input Classifier",
  instructions: buildMathClassifierInstructions,
  model: DEFAULT_MODEL,
  outputType: MathCheckSchema,
});

export const mathInputGuardrail: InputGuardrail = {
  name: "Math only",
  // block the agent until the check finishes, so off-topic input never reaches it
  runInParallel: false,
  execute: async (args) => {
    const { text, output } = await classifyLatestUserMessage(mathClassifier, args);
    return {
      tripwireTriggered: !output.isMath,
      outputInfo: { input: text, ...output },
    };
  },
};
