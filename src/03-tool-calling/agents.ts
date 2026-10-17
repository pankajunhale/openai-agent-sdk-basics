import { Agent } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import type { UserContext } from "#core";
import { buildGeneralAssistantInstructions } from "#instructions";
import { allTools } from "#tools";

export const assistantAgent = new Agent<UserContext>({
  name: "General Assistant",
  instructions: buildGeneralAssistantInstructions,
  model: DEFAULT_MODEL,
  tools: allTools,
});
