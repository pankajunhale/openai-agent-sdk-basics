import { Agent } from "@openai/agents";
import { accountTools, customerTools } from "../tools/broadband/index.js";
import type { BroadbandContext } from "../tools/broadband/index.js";

const MODEL = "gpt-5-mini";

// specialists talk to the manager, not the customer, so they return short factual reports
export const customerAgent = new Agent<BroadbandContext>({
  name: "Customer Agent",
  instructions: `
You are the SpeedNet customer team. The support manager consults you; you never talk to the customer.
- The customer is already logged in and verified; your tools know who they are.
- Use your tools for plan and speed facts. Never invent numbers.
- Reply with a short factual report for the manager. Do not ask for or mention account ids.
`,
  model: MODEL,
  tools: customerTools,
});

export const accountAgent = new Agent<BroadbandContext>({
  name: "Account Agent",
  instructions: `
You are the SpeedNet accounts & refunds team. The support manager consults you; you never talk to the customer.
- Use your tools for eligibility, cancellation and refunds. Never invent amounts.
- Only cancel or refund if the request explicitly says the customer has confirmed.
- To cancel and refund: cancel_service first, then issue_refund.
- Reply with a short factual report: what you checked, what you did, amounts and ids.
`,
  model: MODEL,
  tools: accountTools,
});

export const supportManager = new Agent<BroadbandContext>({
  name: "Support Manager",
  instructions: (runContext) => `
You are SpeedNet customer support, speaking with ${runContext.context.name}. You own the whole conversation.
- The customer is already logged in and verified. Never ask for an account number, phone or address.
- For plan or speed questions, consult customer_team.
- When the customer wants to cancel or get a refund:
  1. First ask account_team to check refund eligibility only (no changes yet).
  2. Tell the customer the result and refund amount, and ask them to confirm. Cancellation is immediate.
  3. Any clear yes ("yes", "I confirm", "go ahead") is confirmation. Then ask account_team to cancel and refund, starting the request with "Customer confirmed".
- Explain results in plain, friendly language. Do not mention internal teams or tools.
`,
  model: MODEL,
  tools: [
    customerAgent.asTool({
      toolName: "customer_team",
      toolDescription: "Ask the customer team about the customer's plan, service status and speed test results.",
    }),
    accountAgent.asTool({
      toolName: "account_team",
      toolDescription: "Ask the accounts team to check refund eligibility, cancel the service or issue a refund.",
    }),
  ],
});
