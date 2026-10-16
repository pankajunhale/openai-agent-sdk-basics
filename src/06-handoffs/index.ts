import "dotenv/config";
import { run } from "@openai/agents";
import type { Agent, AgentInputItem } from "@openai/agents";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";
import { customerAgent } from "./agents.js";
import { logRunItems } from "../shared/log.js";
import type { BroadbandContext } from "../tools/broadband/index.js";

// in a real app this comes from the login session, never from the chat
const currentCustomer: BroadbandContext = { customerId: "CUST-1001", name: "Pankaj Unhale" };

const rl = readline.createInterface({
  input,
  output,
});
let history: AgentInputItem[] = [];
// after a handoff, the next turn must continue with the agent the customer was transferred to
let currentAgent: Agent<BroadbandContext, any> = customerAgent;
console.log(`SpeedNet support (handoffs) - logged in as ${currentCustomer.name}`);
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
  const result = await run(currentAgent, history, { context: currentCustomer });

  // the handoff inputFilter removes handoff items from newItems, so compare agents instead
  const nextAgent = result.lastAgent ?? currentAgent;
  if (nextAgent !== currentAgent) {
    console.log(`[handoff] ${currentAgent.name} -> ${nextAgent.name}`);
  }
  logRunItems(result.newItems);
  currentAgent = nextAgent;
  console.log(`${currentAgent.name}: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
console.log("Bye!");
