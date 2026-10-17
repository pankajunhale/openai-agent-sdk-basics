import type { RunContext } from "@openai/agents";
import type { BroadbandContext, UserContext } from "./context.js";

// runContext is optional in the SDK's types, so every tool goes through one of these

export function requireUser(runContext?: RunContext<UserContext>): UserContext {
  const user = runContext?.context;
  if (!user?.id) {
    throw new Error("No logged-in user. Pass { context } to run().");
  }
  return user;
}

export function requireCustomer(runContext?: RunContext<UserContext>): BroadbandContext {
  const user = requireUser(runContext);
  if (!user.broadband?.customerId) {
    throw new Error("The logged-in user has no broadband account.");
  }
  return user.broadband;
}
