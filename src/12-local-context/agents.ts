import { Agent } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import type { UserContext } from "#core";
import { buildAccountAssistantInstructions } from "#instructions";
import { userTools } from "#tools";

export const accountAgent = new Agent<UserContext>({
  name: "Account Assistant",
  instructions: buildAccountAssistantInstructions,
  model: DEFAULT_MODEL,
  tools: userTools,
});
