import type { RunItem } from "@openai/agents";

// DEBUG=true in .env turns logging on; read on every call, so dotenv has loaded by then
export const isDebug = (): boolean => process.env.DEBUG?.toLowerCase() === "true";

// tool arguments arrive as a JSON string, tool outputs as objects or plain strings
export const toPrettyJson = (value: unknown): string => {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return value as string;
    }
  }
  return JSON.stringify(value, null, 2);
};

// debugLog("history", history): objects are printed as formatted JSON
export function debugLog(label: string, ...values: unknown[]) {
  if (!isDebug()) return;
  const details = values.map((value) => toPrettyJson(value)).join("\n");
  console.log(details ? `[debug] ${label}\n${details}` : `[debug] ${label}`);
}

// logRunItems(result.newItems): tool calls, tool results and handoffs from one run
export function logRunItems(items: RunItem[]) {
  if (!isDebug()) return;
  for (const item of items) {
    if (item.type === "tool_call_item" && item.rawItem.type === "function_call") {
      console.log(`[tool input] ${item.rawItem.name}\n${toPrettyJson(item.rawItem.arguments)}`);
    }
    if (item.type === "tool_call_output_item" && item.rawItem.type === "function_call_result") {
      console.log(`[tool output] ${item.rawItem.name}\n${toPrettyJson(item.output)}`);
    }
    if (item.type === "handoff_output_item") {
      console.log(`[handoff] ${item.sourceAgent.name} -> ${item.targetAgent.name}`);
    }
  }
}
