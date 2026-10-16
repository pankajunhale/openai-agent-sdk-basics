import { Agent, handoff } from "@openai/agents";
import type { HandoffInputData } from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX, removeAllTools } from "@openai/agents-core/extensions";
import { accountTools, customerTools } from "../tools/broadband/index.js";
import type { BroadbandContext } from "../tools/broadband/index.js";

const MODEL = "gpt-5-mini";

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

// RECOMMENDED_PROMPT_PREFIX explains handoffs to the model; without it the receiving
// agent tends to copy the history and reply "I'm transferring you" instead of acting
export const accountAgent = new Agent<BroadbandContext>({
  name: "Account Agent",
  // the customer agent reads this to decide when to transfer
  handoffDescription: "Refunds, cancellations and billing for the logged-in customer.",
  instructions: (runContext) => `${RECOMMENDED_PROMPT_PREFIX}

You are the SpeedNet accounts & refunds team, now talking directly to ${runContext.context.name}.
- The customer is already logged in and verified. Never ask for an account number, phone or address.
- In your first reply, call check_refund_eligibility, explain the result and refund amount simply, and ask them to confirm cancellation. Cancellation is immediate.
- Only cancel after the customer has seen the eligibility result and refund amount and replied with a clear yes ("yes", "I confirm", "go ahead").
- After confirmation: call cancel_service, then issue_refund, and share the cancellation and refund ids.
- Use tools for every fact. Never invent amounts.
`,
  model: MODEL,
  tools: accountTools,
});

export const customerAgent = new Agent<BroadbandContext>({
  name: "Customer Agent",
  instructions: (runContext) => `${RECOMMENDED_PROMPT_PREFIX}

You are SpeedNet customer support, the first point of contact for ${runContext.context.name}.
- The customer is already logged in and verified. Never ask for an account number, phone or address.
- Help with plan and speed questions using your tools.
- If the customer wants to cancel, get a refund, or has a billing issue, transfer them to the Account Agent. Do not handle refunds yourself.
`,
  model: MODEL,
  tools: customerTools,
  handoffs: [handoff(accountAgent, { inputFilter: plainChatHistory })],
});
