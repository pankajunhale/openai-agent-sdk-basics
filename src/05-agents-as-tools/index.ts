import "dotenv/config";
import { DEMO_CUSTOMER } from "#core";
import { runChatLoop } from "#shared/chat-loop";
import { supportManager } from "./agents.js";

// always the manager: specialists only run inside its tool calls
await runChatLoop(supportManager, {
  context: DEMO_CUSTOMER,
  intro: [`SpeedNet support (agents as tools) - logged in as ${DEMO_CUSTOMER.name}`],
});
