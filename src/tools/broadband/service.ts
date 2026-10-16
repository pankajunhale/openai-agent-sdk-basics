import { CUSTOMERS } from "./data.js";
import type { Cancellation, Customer, Refund, RefundEligibility, SpeedReport } from "./types.js";

const REFUND_SPEED_THRESHOLD = 50; // % of plan speed
const DAYS_IN_CYCLE = 30;
const MS_PER_DAY = 86_400_000;

export function getCustomer(customerId: string): Customer {
  const customer = CUSTOMERS[customerId];
  if (!customer) throw new Error(`Customer ${customerId} not found`);
  return customer;
}

export function getSpeedReport(customerId: string): SpeedReport {
  const { plan, speedTestsMbps } = getCustomer(customerId);
  const averageMbps = Math.round(
    speedTestsMbps.reduce((sum, speed) => sum + speed, 0) / speedTestsMbps.length,
  );
  return {
    planSpeedMbps: plan.speedMbps,
    averageMbps,
    latestMbps: speedTestsMbps.at(-1) ?? 0,
    percentOfPlan: Math.round((averageMbps / plan.speedMbps) * 100),
    testsCount: speedTestsMbps.length,
  };
}

export function checkRefundEligibility(customerId: string): RefundEligibility {
  const customer = getCustomer(customerId);
  const report = getSpeedReport(customerId);
  const daysUsed = Math.min(
    DAYS_IN_CYCLE,
    Math.floor((Date.now() - new Date(customer.billingCycleStart).getTime()) / MS_PER_DAY),
  );
  const refundAmountInr = Math.round(
    (customer.plan.monthlyPriceInr * (DAYS_IN_CYCLE - daysUsed)) / DAYS_IN_CYCLE,
  );

  if (customer.refund) {
    return { eligible: false, reason: "A refund was already issued", daysUsed, refundAmountInr: 0 };
  }
  if (report.percentOfPlan >= REFUND_SPEED_THRESHOLD) {
    return {
      eligible: false,
      reason: `Average speed is ${report.percentOfPlan}% of plan; refunds need below ${REFUND_SPEED_THRESHOLD}%`,
      daysUsed,
      refundAmountInr: 0,
    };
  }
  return {
    eligible: true,
    reason: `Average speed is only ${report.percentOfPlan}% of plan`,
    daysUsed,
    refundAmountInr,
  };
}

export function cancelService(customerId: string, reason: string): Cancellation {
  const customer = getCustomer(customerId);
  if (customer.status === "cancelled") throw new Error("Service is already cancelled");
  customer.status = "cancelled";
  console.log(`  (db) ${customerId} cancelled. Reason: ${reason}`);
  return {
    cancellationId: `CXL-${Date.now().toString().slice(-6)}`,
    effectiveDate: new Date().toISOString().slice(0, 10),
  };
}

export function issueRefund(customerId: string): Refund {
  const customer = getCustomer(customerId);
  if (customer.status !== "cancelled") {
    throw new Error("Cancel the service before issuing a refund");
  }
  const eligibility = checkRefundEligibility(customerId);
  if (!eligibility.eligible) throw new Error(`Not eligible: ${eligibility.reason}`);

  customer.refund = {
    refundId: `RF-${Date.now().toString().slice(-6)}`,
    amountInr: eligibility.refundAmountInr,
    processedAt: new Date().toISOString(),
  };
  return customer.refund;
}
