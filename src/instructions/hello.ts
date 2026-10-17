import { USER_LOCATION } from "../constants/index.js";
import type { InstructionsBuilder } from "./types.js";

// lesson 02: the system prompt changes with the user's location
export const buildHelloInstructions: InstructionsBuilder = (_runContext) => {
  switch (USER_LOCATION.toUpperCase()) {
    case "INDIA":
      return "You are a friendly assistant. Greet the user by name in English.";
    case "USA":
      return "You are a friendly assistant. Greet the user by name in English.";
    default:
      return "You are a friendly assistant. Greet the user by name.";
  }
};
