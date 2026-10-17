import { Agent } from "@openai/agents";
import { DEFAULT_MODEL } from "../constants/index.js";
import type { UserContext } from "../core/index.js";
import { buildGeneralAssistantInstructions } from "../instructions/index.js";
import { allTools } from "../tools/index.js";

export const assistantAgent = new Agent<UserContext>({
  name: "General Assistant",
  instructions: buildGeneralAssistantInstructions,
  model: DEFAULT_MODEL,
  tools: allTools,
});
