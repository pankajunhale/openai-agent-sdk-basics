import "dotenv/config";
import { run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";
import { supportManager } from "./agents.js";
import { logRunItems } from "../shared/log.js";
import { DEMO_CUSTOMER as currentCustomer } from "../core/index.js";

const rl = readline.createInterface({
  input,
  output,
});
let history: AgentInputItem[] = [];
console.log(`SpeedNet support (agents as tools) - logged in as ${currentCustomer.name}`);
console.log('Type "exit" to quit.\n');

rl.setPrompt("User: ");
rl.prompt();

// for-await ends the loop (and closes readline) on "exit", Ctrl+C or end of input
for await (const line of rl) {
  const userInput = line.trim();
  if (userInput.toLowerCase() === "exit") {
    break;
  }
  if (!userInput) {
    rl.prompt();
    continue;
  }

  history.push({ role: "user", content: userInput });
  // always the manager: specialists only run inside its tool calls
  const result = await run(supportManager, history, { context: currentCustomer });

  logRunItems(result.newItems);
  console.log(`${supportManager.name}: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
console.log("Bye!");
