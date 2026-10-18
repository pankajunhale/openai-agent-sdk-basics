import "dotenv/config";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { Agent, run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import { DEMO_CUSTOMER as currentCustomer } from "#core";
import type { UserContext } from "#core";
import {
  buildAccountTeamInstructions,
  buildCustomerTeamInstructions,
  buildSupportManagerInstructions,
} from "#instructions";
import { accountTools, customerTools } from "#tools";

const customerAgent = new Agent<UserContext>({
  name: "Customer Agent",
  instructions: buildCustomerTeamInstructions,
  model: DEFAULT_MODEL,
  tools: customerTools,
});

const accountAgent = new Agent<UserContext>({
  name: "Account Agent",
  instructions: buildAccountTeamInstructions,
  model: DEFAULT_MODEL,
  tools: accountTools,
});

const supportManager = new Agent<UserContext>({
  name: "Support Manager",
  instructions: buildSupportManagerInstructions,
  model: DEFAULT_MODEL,
  tools: [
    customerAgent.asTool({
      toolName: "customer_team",
      toolDescription:
        "Ask the customer team about the customer's plan, service status and speed test results.",
    }),
    accountAgent.asTool({
      toolName: "account_team",
      toolDescription:
        "Ask the accounts team to check refund eligibility, cancel the service or issue a refund.",
    }),
  ],
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
  // always the manager: specialists only run inside its tool calls
  const result = await run(supportManager, history, { context: currentCustomer });

  console.log(`${supportManager.name}: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
rl.close();
