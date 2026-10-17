import "dotenv/config";
import { DEMO_USER } from "#core";
import { runChatLoop } from "#shared/chat-loop";
import { userTools } from "#tools";
import { accountAgent } from "./agents.js";

// the context (logged-in user) is passed to every run but never sent to the model
await runChatLoop(accountAgent, {
  context: DEMO_USER,
  intro: [
    `Logged in as ${DEMO_USER.name} (id ${DEMO_USER.id})`,
    `Tools: ${userTools.map((t) => t.name).join(", ")}`,
  ],
});
