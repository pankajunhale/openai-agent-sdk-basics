import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import { z } from "zod";
import { requireCustomer } from "./context.js";
import type { BroadbandContext } from "./types.js";
import * as svc from "./service.js";

const toErrorMessage = (_context: unknown, error: unknown) =>
  `Error: ${error instanceof Error ? error.message : String(error)}`;

export const checkRefundEligibilityTool = tool({
  name: "check_refund_eligibility",
  description: "Check whether the logged-in customer qualifies for a refund, and the pro-rated amount.",
  parameters: z.object({}),
  async execute(_args, runContext?: RunContext<BroadbandContext>) {
    const { customerId } = requireCustomer(runContext);
    return svc.checkRefundEligibility(customerId);
  },
  errorFunction: toErrorMessage,
});

export const cancelServiceTool = tool({
  name: "cancel_service",
  description: "Cancel the logged-in customer's broadband service. Only call after the customer explicitly confirmed.",
  parameters: z.object({
    reason: z.string().describe("Short reason for cancellation, e.g. 'low speed'"),
  }),
  async execute({ reason }, runContext?: RunContext<BroadbandContext>) {
    const { customerId } = requireCustomer(runContext);
    return svc.cancelService(customerId, reason);
  },
  errorFunction: toErrorMessage,
});

export const issueRefundTool = tool({
  name: "issue_refund",
  description: "Issue the pro-rated refund. The service must be cancelled first. The amount is calculated by the system.",
  parameters: z.object({}),
  async execute(_args, runContext?: RunContext<BroadbandContext>) {
    const { customerId } = requireCustomer(runContext);
    return svc.issueRefund(customerId);
  },
  errorFunction: toErrorMessage,
});

export const accountTools = [checkRefundEligibilityTool, cancelServiceTool, issueRefundTool];
