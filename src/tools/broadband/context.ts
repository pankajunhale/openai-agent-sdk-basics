import type { RunContext } from "@openai/agents";
import type { BroadbandContext } from "./types.js";

// runContext is optional in the SDK's types, so every tool goes through this
export function requireCustomer(runContext?: RunContext<BroadbandContext>): BroadbandContext {
  const customer = runContext?.context;
  if (!customer?.customerId) {
    throw new Error("No logged-in customer. Pass { context } to run().");
  }
  return customer;
}
