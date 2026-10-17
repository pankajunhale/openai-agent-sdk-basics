import "dotenv/config";
import { DEMO_USER } from "#core";
import { runChatLoop } from "#shared/chat-loop";
import { allTools } from "#tools";
import { assistantAgent } from "./agents.js";

// finalOutput is a { weather, message } object, so the loop prints it as JSON
await runChatLoop(assistantAgent, {
  context: DEMO_USER,
  intro: [`Tools: ${allTools.map((t) => t.name).join(", ")}`],
});
