// the model every agent uses unless a lesson needs a different one
export const DEFAULT_MODEL = "gpt-5-mini";

// lesson 02: changes the hello agent's prompt (set USER_LOCATION in .env)
export const USER_LOCATION = process.env.USER_LOCATION || "INDIA";
