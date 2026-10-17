import * as readline from "node:readline";
import { stdin, stdout } from "node:process";
import {
  run,
  InputGuardrailTripwireTriggered,
  OutputGuardrailTripwireTriggered,
} from "@openai/agents";
import type { Agent, AgentInputItem, AgentOutputType } from "@openai/agents";
import type { UserContext } from "#core";
import { logRunItems, toPrettyJson } from "./log.js";

export interface ChatLoopOptions {
  // the logged-in user, passed to every run
  context: UserContext;
  // lines printed before the first prompt
  intro?: string[];
  // how to print finalOutput; by default strings as-is and objects as JSON
  formatOutput?: (output: unknown) => string;
  // _try scripts pass a Readable of fixed lines instead of stdin
  input?: NodeJS.ReadableStream;
}

const defaultFormat = (output: unknown) =>
  typeof output === "string" ? output : `\n${toPrettyJson(output)}`;

// guardrails put their classifier result in outputInfo; show its reason when there is one
function reasonOf(outputInfo: unknown): string {
  if (outputInfo && typeof outputInfo === "object" && "reason" in outputInfo) {
    return String(outputInfo.reason);
  }
  return "no reason given";
}

// returns a message for guardrail errors, undefined for anything else
export function describeGuardrailError(error: unknown): string | undefined {
  if (error instanceof InputGuardrailTripwireTriggered) {
    const { guardrail, output } = error.result;
    return `${guardrail.name} blocked your message: ${reasonOf(output.outputInfo)}`;
  }
  if (error instanceof OutputGuardrailTripwireTriggered) {
    const { guardrail, output } = error.result;
    return `${guardrail.name} blocked the answer: ${reasonOf(output.outputInfo)}`;
  }
  return undefined;
}

export async function runChatLoop<TOutput extends AgentOutputType>(
  startAgent: Agent<UserContext, TOutput>,
  options: ChatLoopOptions,
): Promise<void> {
  const { context, intro = [], formatOutput = defaultFormat, input = stdin } = options;
  const rl = readline.createInterface({ input, output: stdout });
  let history: AgentInputItem[] = [];
  // after a handoff, the next turn must continue with the agent the user was transferred to
  let agent = startAgent;

  for (const line of intro) console.log(line);
  console.log('Type "exit" to quit.\n');
  rl.setPrompt("User: ");
  rl.prompt();

  // for-await ends the loop (and closes readline) on "exit", Ctrl+C or end of input
  for await (const line of rl) {
    const userInput = line.trim();
    if (userInput.toLowerCase() === "exit") break;
    if (!userInput) {
      rl.prompt();
      continue;
    }

    history.push({ role: "user", content: userInput });
    try {
      const result = await run(agent, history, { context });
      const nextAgent = result.lastAgent ?? agent;
      // a handoff inputFilter can remove the handoff item from newItems, so compare agents too
      const loggedHandoff = result.newItems.some((item) => item.type === "handoff_output_item");
      if (nextAgent !== agent && !loggedHandoff) {
        console.log(`[handoff] ${agent.name} -> ${nextAgent.name}`);
      }
      logRunItems(result.newItems);
      agent = nextAgent;
      console.log(`${agent.name}: ${formatOutput(result.finalOutput)}\n`);
      history = result.history;
    } catch (error) {
      const blocked = describeGuardrailError(error);
      if (!blocked) throw error;
      // drop the blocked message, otherwise it is resent with every later turn
      history.pop();
      console.log(`[guardrail] ${blocked}\n`);
    }
    rl.prompt();
  }
  rl.close();
  console.log("Bye!");
}
