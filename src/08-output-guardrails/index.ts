import "dotenv/config";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { Agent, run, OutputGuardrailTripwireTriggered } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import { DEMO_USER as currentUser } from "#core";
import type { UserContext } from "#core";
import { readQueryGuardrail, SqlAnswerSchema, SqlCheckSchema } from "#guardrails";
import { buildSqlBuilderInstructions } from "#instructions";

// turns a plain-English question into SQL; the output guardrail only lets read-only queries through
const queryAgent = new Agent<UserContext, typeof SqlAnswerSchema>({
  name: "Query Builder Agent",
  instructions: buildSqlBuilderInstructions,
  model: DEFAULT_MODEL,
  outputGuardrails: [readQueryGuardrail],
  outputType: SqlAnswerSchema,
});

const rl = readline.createInterface({ input, output });
let history: AgentInputItem[] = [];

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
    const result = await run(queryAgent, history, { context: currentUser });
    console.log(`${queryAgent.name}: ${result.finalOutput?.response}\n`);
    history = result.history;
  } catch (error) {
    if (!(error instanceof OutputGuardrailTripwireTriggered)) throw error;
    // the unsafe answer is never shown; drop the question so it isn't resent next turn
    history.pop();
    const check = SqlCheckSchema.safeParse(error.result.output.outputInfo);
    const reason = check.success ? check.data.reason : "unsafe query";
    console.log(`[guardrail] ${error.result.guardrail.name} blocked the answer: ${reason}\n`);
  }
  rl.prompt();
}
rl.close();
