import { Agent, handoff } from "@openai/agents";
import type { HandoffInputData } from "@openai/agents";
import { removeAllTools } from "@openai/agents-core/extensions";
import { DEFAULT_MODEL } from "../constants/index.js";
import type { UserContext } from "../core/index.js";
import {
  buildAccountAgentInstructions,
  buildCustomerAgentInstructions,
} from "../instructions/index.js";
import { accountTools, customerTools } from "../tools/broadband/index.js";

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

export const accountAgent = new Agent<UserContext>({
  name: "Account Agent",
  // the customer agent reads this to decide when to transfer
  handoffDescription: "Refunds, cancellations and billing for the logged-in customer.",
  instructions: buildAccountAgentInstructions,
  model: DEFAULT_MODEL,
  tools: accountTools,
});

export const customerAgent = new Agent<UserContext>({
  name: "Customer Agent",
  instructions: buildCustomerAgentInstructions,
  model: DEFAULT_MODEL,
  tools: customerTools,
  handoffs: [handoff(accountAgent, { inputFilter: plainChatHistory })],
});
