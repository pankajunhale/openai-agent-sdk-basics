import { run } from "@openai/agents";
import type { Agent, AgentOutputType, InputGuardrailFunctionArgs } from "@openai/agents";

type GuardrailInput = InputGuardrailFunctionArgs["input"];
type InputItem = Exclude<GuardrailInput, string>[number];

const MAX_CONTEXT_CHARS = 1000;

function textOf(item: InputItem | undefined, role: "user" | "assistant"): string | undefined {
  if (!item || !("role" in item) || item.role !== role) return undefined;
  if (typeof item.content === "string") return item.content;
  return item.content
    .flatMap((part) =>
      part.type === "input_text" || part.type === "output_text" ? [part.text] : [],
    )
    .join("\n");
}

// guardrails receive the whole chat history; only the newest user message should be judged,
// otherwise one old off-topic message would block every later turn
export function latestUserText(input: GuardrailInput): string {
  return latestTurn(input).text;
}

// the newest user message plus the assistant reply just before it, so follow-ups like
// "explain step 2 again" can be understood
export function latestTurn(input: GuardrailInput): { text: string; previousReply?: string } {
  if (typeof input === "string") return { text: input };
  for (let i = input.length - 1; i >= 0; i--) {
    const text = textOf(input[i], "user");
    if (text === undefined) continue;
    for (let j = i - 1; j >= 0; j--) {
      if (textOf(input[j], "user") !== undefined) break;
      const previousReply = textOf(input[j], "assistant");
      if (previousReply) return { text, previousReply: previousReply.slice(0, MAX_CONTEXT_CHARS) };
    }
    return { text };
  }
  return { text: "" };
}

// runs a small classifier agent (with a zod outputType) on the latest user message
export async function classifyLatestUserMessage<TContext, TOutput extends AgentOutputType>(
  classifier: Agent<TContext, TOutput>,
  { input, context }: InputGuardrailFunctionArgs,
) {
  const { text, previousReply } = latestTurn(input);
  const prompt = previousReply
    ? `Previous assistant reply (context only, do not judge it):\n${previousReply}\n\nMessage to judge:\n${text}`
    : `Message to judge:\n${text}`;
  const result = await run(classifier, prompt, { context });
  if (result.finalOutput === undefined) {
    throw new Error(`${classifier.name} returned no output`);
  }
  return { text, output: result.finalOutput };
}
