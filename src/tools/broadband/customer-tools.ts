import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import { z } from "zod";
import { requireCustomer } from "./context.js";
import type { BroadbandContext } from "./types.js";
import * as svc from "./service.js";

const toErrorMessage = (_context: unknown, error: unknown) =>
  `Error: ${error instanceof Error ? error.message : String(error)}`;

export const getMyPlanTool = tool({
  name: "get_my_plan",
  description: "Get the logged-in customer's broadband plan, price and service status.",
  parameters: z.object({}),
  async execute(_args, runContext?: RunContext<BroadbandContext>) {
    const { customerId } = requireCustomer(runContext);
    const { plan, status, billingCycleStart } = svc.getCustomer(customerId);
    return { plan, status, billingCycleStart };
  },
  errorFunction: toErrorMessage,
});

export const getSpeedReportTool = tool({
  name: "get_speed_report",
  description:
    "Get recent speed test results for the logged-in customer's line compared to their plan speed.",
  parameters: z.object({}),
  async execute(_args, runContext?: RunContext<BroadbandContext>) {
    const { customerId } = requireCustomer(runContext);
    return svc.getSpeedReport(customerId);
  },
  errorFunction: toErrorMessage,
});

export const customerTools = [getMyPlanTool, getSpeedReportTool];
