import "dotenv/config";
import { DEMO_USER } from "#core";
import { runChatLoop } from "#shared/chat-loop";
import { mathAgent } from "./agents.js";

// the loop catches InputGuardrailTripwireTriggered, shows the reason and drops the blocked message
await runChatLoop(mathAgent, {
  context: DEMO_USER,
  intro: [`${mathAgent.name} (math questions only).`],
});
