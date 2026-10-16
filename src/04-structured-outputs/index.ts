import "dotenv/config";
import { Agent, run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";
import { allTools } from "../tools/index.js";
import { CurrentWeatherSchema } from "../tools/weather/types.js";

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
  outputType: CurrentWeatherSchema, // structured output
});

// tool arguments arrive as a JSON string, tool outputs as objects or plain strings
const toPrettyJson = (value: unknown): string => {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return value as string;
    }
  }
  return JSON.stringify(value, null, 2);
};

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

  for (const item of result.newItems) {
    if (
      item.type === "tool_call_item" &&
      item.rawItem.type === "function_call"
    ) {
      console.log(
        `[tool input] ${item.rawItem.name}\n${toPrettyJson(item.rawItem.arguments)}`,
      );
    }
    if (
      item.type === "tool_call_output_item" &&
      item.rawItem.type === "function_call_result"
    ) {
      console.log(
        `[tool output] ${item.rawItem.name}\n${toPrettyJson(item.output)}`,
      );
    }
  }

  console.log(`Assistant:\n${toPrettyJson(result.finalOutput)}\n`);
  history = result.history;
  rl.prompt();
}
console.log("Bye!");
