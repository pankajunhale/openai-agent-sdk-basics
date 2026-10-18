import "dotenv/config";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { Agent, handoff, run } from "@openai/agents";
import type { AgentInputItem, HandoffInputData } from "@openai/agents";
import { removeAllTools } from "@openai/agents-core/extensions";
import { DEFAULT_MODEL } from "#constants";
import { DEMO_CUSTOMER as currentCustomer } from "#core";
import type { UserContext } from "#core";
import { buildAccountAgentInstructions, buildCustomerAgentInstructions } from "#instructions";
import { accountTools, customerTools } from "#tools";

// Gives the next agent a plain chat (user + assistant text only). removeAllTools drops
// reasoning items, but gpt-5 models reject assistant messages whose id points at a
// dropped reasoning item, so those ids are stripped too.
const plainChatHistory = (data: HandoffInputData): HandoffInputData => {
  const filtered = removeAllTools(data);
  if (!Array.isArray(filtered.inputHistory)) return filtered;
  return {
    ...filtered,
    inputHistory: filtered.inputHistory.map((item) => {
      if ("role" in item && item.role === "assistant") {
        const { id: _id, providerData: _providerData, ...message } = item;
        return message;
      }
      return item;
    }),
  };
};

const accountAgent = new Agent<UserContext>({
  name: "Account Agent",
  // the customer agent reads this to decide when to transfer
  handoffDescription: "Refunds, cancellations and billing for the logged-in customer.",
  instructions: buildAccountAgentInstructions,
  model: DEFAULT_MODEL,
  tools: accountTools,
});

const customerAgent = new Agent<UserContext>({
  name: "Customer Agent",
  instructions: buildCustomerAgentInstructions,
  model: DEFAULT_MODEL,
  tools: customerTools,
  handoffs: [handoff(accountAgent, { inputFilter: plainChatHistory })],
});

const rl = readline.createInterface({ input, output });
let history: AgentInputItem[] = [];
// after a handoff, the next turn must continue with the agent the customer was transferred to
let currentAgent: Agent<UserContext> = customerAgent;

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
  const result = await run(currentAgent, history, { context: currentCustomer });

  currentAgent = result.lastAgent ?? currentAgent;
  console.log(`${currentAgent.name}: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
rl.close();
