import "dotenv/config";
import { Agent, run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";

const USER_LOCATION = process.env.USER_LOCATION || "INDIA";

// this is system prompt for the agent
const buildInstructionsByLocation = () => {
  const location = USER_LOCATION;
  switch (location.toUpperCase()) {
    case "INDIA":
      return "You are a friendly assistant. Greet the user by name in English.";
    case "USA":
      return "You are a friendly assistant. Greet the user by name in English.";
    default:
      return "You are a friendly assistant. Greet the user by name.";
  }
};

const helloAgent = new Agent({
  name: "Hello Agent",
  instructions: buildInstructionsByLocation(),
  model: "gpt-5-mini",
});
const rl = readline.createInterface({
  input,
  output,
});
let history: AgentInputItem[] = [];
console.log('Chat started. Type "exit" to quit.\n');
console.log(`System: ${buildInstructionsByLocation()}\n`);

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
  const result = await run(helloAgent, history);
  console.log(`Assistant: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
console.log("Bye!");
