import { z } from "zod";

// the output this guardrail checks: the SQL builder agent's outputType
export const SqlAnswerSchema = z.object({
  response: z.string(),
});

export type SqlAnswer = z.infer<typeof SqlAnswerSchema>;

// what the SQL classifier returns; reason is shown to the user when the answer is blocked
export const SqlCheckSchema = z.object({
  isSafe: z.boolean().describe("true if the reply has no SQL, or only read-only SELECT queries"),
  reason: z.string().describe("one short sentence explaining the decision"),
  query: z.string().describe("the SQL found in the reply, or an empty string"),
});

export type SqlCheck = z.infer<typeof SqlCheckSchema>;
