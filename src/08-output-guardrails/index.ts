import "dotenv/config";
import { DEMO_USER } from "#core";
import { SqlAnswerSchema } from "#guardrails";
import { runChatLoop } from "#shared/chat-loop";
import { mainAgent } from "./agents.js";

// the loop catches OutputGuardrailTripwireTriggered, so an unsafe query is never shown
await runChatLoop(mainAgent, {
  context: DEMO_USER,
  intro: [`${mainAgent.name} (read-only SELECT queries).`],
  formatOutput: (output) => SqlAnswerSchema.parse(output).response,
});
