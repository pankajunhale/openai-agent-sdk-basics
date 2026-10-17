import "dotenv/config";
import { run, RunContext } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";
import { DEMO_USER as currentUser } from "../core/index.js";
import { buildHelloInstructions } from "../instructions/index.js";
import { helloAgent } from "./agents.js";

const rl = readline.createInterface({
  input,
  output,
});
let history: AgentInputItem[] = [];
console.log('Chat started. Type "exit" to quit.\n');
console.log(`System: ${buildHelloInstructions(new RunContext(currentUser))}\n`);

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
  const result = await run(helloAgent, history, { context: currentUser });
  console.log(`Assistant: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
console.log("Bye!");
