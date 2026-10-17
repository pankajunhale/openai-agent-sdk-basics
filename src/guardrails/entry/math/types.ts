import { z } from "zod";

// what the math classifier returns; reason is shown to the user when the input is blocked
export const MathCheckSchema = z.object({
  isMath: z.boolean().describe("true only if the message asks for help with a math problem"),
  reason: z.string().describe("one short sentence explaining the decision"),
});

export type MathCheck = z.infer<typeof MathCheckSchema>;
