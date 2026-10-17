import "dotenv/config";
import { DEMO_USER } from "#core";
import { runChatLoop } from "#shared/chat-loop";
import { mathAgent } from "./agents.js";

await runChatLoop(mathAgent, { context: DEMO_USER, intro: ["Math chat started."] });
