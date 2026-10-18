import "dotenv/config";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { Agent, run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import { DEMO_USER as currentUser } from "#core";
import type { UserContext } from "#core";
import { buildHelloInstructions } from "#instructions";

const helloAgent = new Agent<UserContext>({
  name: "Hello Agent",
  instructions: buildHelloInstructions,
  model: DEFAULT_MODEL,
});

const rl = readline.createInterface({ input, output });
let history: AgentInputItem[] = [];

rl.setPrompt("User: ");
rl.prompt();

// for-await ends the loop (and closes readline) on "exit", Ctrl+C or end of input
for await (const line of rl) {
  const userInput = line.trim();
  if (userInput.toLowerCase() === "exit") break;
  if (!userInput) {
    rl.prompt();
    continue;
  }

  history.push({ role: "user", content: userInput });
  const result = await run(helloAgent, history, { context: currentUser });

  console.log(`${helloAgent.name}: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
rl.close();
