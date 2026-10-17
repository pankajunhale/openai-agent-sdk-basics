import "dotenv/config";
import { DEMO_CUSTOMER } from "#core";
import { runChatLoop } from "#shared/chat-loop";
import { customerAgent } from "./agents.js";

// starts with the customer agent; after a handoff the loop continues with result.lastAgent
await runChatLoop(customerAgent, {
  context: DEMO_CUSTOMER,
  intro: [`SpeedNet support (handoffs) - logged in as ${DEMO_CUSTOMER.name}`],
});
