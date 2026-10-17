import { Agent } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import type { UserContext } from "#core";
import {
  buildAccountTeamInstructions,
  buildCustomerTeamInstructions,
  buildSupportManagerInstructions,
} from "#instructions";
import { accountTools, customerTools } from "#tools";

export const customerAgent = new Agent<UserContext>({
  name: "Customer Agent",
  instructions: buildCustomerTeamInstructions,
  model: DEFAULT_MODEL,
  tools: customerTools,
});

export const accountAgent = new Agent<UserContext>({
  name: "Account Agent",
  instructions: buildAccountTeamInstructions,
  model: DEFAULT_MODEL,
  tools: accountTools,
});

export const supportManager = new Agent<UserContext>({
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
