import "dotenv/config";
import { Agent, run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";
import { allTools } from "../tools/index.js";
import { logRunItems, toPrettyJson } from "../shared/log.js";

// this is system prompt for the agent
const ASSISTANT_INSTRUCTIONS = `
You are a helpful general assistant with access to tools.

Rules:
- If a tool can answer the request, use it instead of guessing.
- Never do arithmetic yourself; use a tool for every calculation.
- You may call several tools, or the same tool several times, to finish a task.
- If no tool fits the request, DO NOT AT ALL answer from your own knowledge.
- If a tool does not support the input, say so and tell the user what is supported.
- Keep answers short and friendly.
`;

const assistantAgent = new Agent({
  name: "General Assistant",
  instructions: ASSISTANT_INSTRUCTIONS,
  model: "gpt-5-mini",
  tools: allTools,
});

const rl = readline.createInterface({
  input,
  output,
});
let history: AgentInputItem[] = [];
console.log(`Tools: ${allTools.map((t) => t.name).join(", ")}`);
console.log('Chat started. Type "exit" to quit.\n');

rl.setPrompt("User: ");
rl.prompt();

// for-await ends the loop (and closes readline) on "exit", Ctrl+C or end of input
for await (const line of rl) {
  const userInput = line.trim();
  if (userInput.toLowerCase() === "exit") {
    rl.close();
    console.log("Chat ended.");
    break;
  }
  if (!userInput) {
    rl.prompt();
    continue;
  }

  history.push({ role: "user", content: userInput });
  const result = await run(assistantAgent, history);

  logRunItems(result.newItems);

  console.log(`Assistant:\n${toPrettyJson(result.finalOutput)}\n`);
  history = result.history;
  rl.prompt();
}
console.log("Bye!");
