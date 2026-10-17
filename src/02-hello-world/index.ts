import "dotenv/config";
import { RunContext } from "@openai/agents";
import { DEMO_USER } from "#core";
import { buildHelloInstructions } from "#instructions";
import { runChatLoop } from "#shared/chat-loop";
import { helloAgent } from "./agents.js";

await runChatLoop(helloAgent, {
  context: DEMO_USER,
  intro: [`System: ${buildHelloInstructions(new RunContext(DEMO_USER))}`],
});
