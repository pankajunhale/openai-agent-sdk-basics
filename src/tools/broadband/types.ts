export interface Plan {
  name: string;
  speedMbps: number;
  monthlyPriceInr: number;
}

export interface Refund {
  refundId: string;
  amountInr: number;
  processedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  plan: Plan;
  status: "active" | "cancelled";
  billingCycleStart: string;
  speedTestsMbps: number[];
  refund?: Refund;
}

export interface SpeedReport {
  planSpeedMbps: number;
  averageMbps: number;
  latestMbps: number;
  percentOfPlan: number;
  testsCount: number;
}

export interface RefundEligibility {
  eligible: boolean;
  reason: string;
  daysUsed: number;
  refundAmountInr: number;
}

export interface Cancellation {
  cancellationId: string;
  effectiveDate: string;
}
