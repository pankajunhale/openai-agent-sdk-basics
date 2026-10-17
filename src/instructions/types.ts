import type { RunContext } from "@openai/agents";
import type { UserContext } from "#core";

// every prompt is a function of the run context (the logged-in user), so all agents read it the same way
export type InstructionsBuilder = (runContext: RunContext<UserContext>) => string;
