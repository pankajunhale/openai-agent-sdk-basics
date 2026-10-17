import { Agent } from "@openai/agents";
import { DEFAULT_MODEL } from "../constants/index.js";
import type { UserContext } from "../core/index.js";
import { buildAccountAssistantInstructions } from "../instructions/index.js";
import { userTools } from "../tools/index.js";

export const accountAgent = new Agent<UserContext>({
  name: "Account Assistant",
  instructions: buildAccountAssistantInstructions,
  model: DEFAULT_MODEL,
  tools: userTools,
});
