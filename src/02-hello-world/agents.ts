import { Agent } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import type { UserContext } from "#core";
import { buildHelloInstructions, buildMathTutorInstructions } from "#instructions";

export const helloAgent = new Agent<UserContext>({
  name: "Hello Agent",
  instructions: buildHelloInstructions,
  model: DEFAULT_MODEL,
});

export const mathAgent = new Agent<UserContext>({
  name: "Math Agent",
  instructions: buildMathTutorInstructions,
  model: DEFAULT_MODEL,
});
