import type { RunContext } from "@openai/agents";
import type { UserContext } from "./types.js";

// runContext is optional in the SDK's types, so every tool goes through this
export function requireUser(runContext?: RunContext<UserContext>): UserContext {
  const user = runContext?.context;
  if (!user?.id) {
    throw new Error("No logged-in user. Pass { context } to run().");
  }
  return user;
}
