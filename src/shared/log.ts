import type { RunItem } from "@openai/agents";

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

export function logRunItems(items: RunItem[]) {
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
