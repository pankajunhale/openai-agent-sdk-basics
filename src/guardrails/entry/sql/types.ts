import { z } from "zod";

// the output this guardrail checks: the SQL builder agent's outputType
export const SqlAnswerSchema = z.object({
  response: z.string(),
});

export type SqlAnswer = z.infer<typeof SqlAnswerSchema>;

// what the SQL classifier returns
export const SqlCheckSchema = z.object({
  isSafe: z.boolean(),
  query: z.string(),
});

export type SqlCheck = z.infer<typeof SqlCheckSchema>;
