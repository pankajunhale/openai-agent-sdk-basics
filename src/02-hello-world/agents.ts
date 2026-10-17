import { Agent } from "@openai/agents";
import { DEFAULT_MODEL } from "../constants/index.js";
import type { UserContext } from "../core/index.js";
import { buildHelloInstructions, buildMathTutorInstructions } from "../instructions/index.js";

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
