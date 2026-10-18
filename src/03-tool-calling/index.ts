import "dotenv/config";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { Agent, run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import { DEMO_USER as currentUser } from "#core";
import type { UserContext } from "#core";
import { buildGeneralAssistantInstructions } from "#instructions";
import { allTools } from "#tools";

const assistantAgent = new Agent<UserContext>({
  name: "General Assistant",
  instructions: buildGeneralAssistantInstructions,
  model: DEFAULT_MODEL,
  tools: allTools,
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
  const result = await run(assistantAgent, history, { context: currentUser });

  console.log(`${assistantAgent.name}: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
rl.close();
