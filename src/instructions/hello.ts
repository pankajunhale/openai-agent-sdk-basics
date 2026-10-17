import { USER_LOCATION } from "#constants";
import type { InstructionsBuilder } from "./types.js";

// lesson 02: the system prompt changes with the user's location
export const buildHelloInstructions: InstructionsBuilder = (runContext) => {
  const base = `You are a friendly assistant. The logged-in user is ${runContext.context.name}.`;
  switch (USER_LOCATION.toUpperCase()) {
    case "INDIA":
      return `${base} Greet the user by name in English.`;
    case "USA":
      return `${base} Greet the user by name in English.`;
    default:
      return `${base} Greet the user by name.`;
  }
};
