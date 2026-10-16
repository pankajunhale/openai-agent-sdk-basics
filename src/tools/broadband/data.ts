import type { Customer } from "./types.js";

// billing cycle always starts on the 1st of the current month, so refund maths stays realistic.
// built as a plain string: toISOString() would shift local midnight to the previous day in IST
const now = new Date();
const cycleStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

export const CUSTOMERS: Record<string, Customer> = {
  "CUST-1001": {
    id: "CUST-1001",
    name: "Pankaj Unhale",
    plan: { name: "Fiber 100", speedMbps: 100, monthlyPriceInr: 999 },
    status: "active",
    billingCycleStart: cycleStart,
    speedTestsMbps: [22, 18, 25, 30, 19, 21, 24],
  },
  "CUST-1002": {
    id: "CUST-1002",
    name: "Riya Sharma",
    plan: { name: "Fiber 200", speedMbps: 200, monthlyPriceInr: 1499 },
    status: "active",
    billingCycleStart: cycleStart,
    speedTestsMbps: [180, 192, 175, 188],
  },
};
