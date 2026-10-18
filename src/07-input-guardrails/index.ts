import "dotenv/config";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { Agent, run, InputGuardrailTripwireTriggered } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import { DEMO_USER as currentUser } from "#core";
import type { UserContext } from "#core";
import { MathCheckSchema, mathInputGuardrail } from "#guardrails";
import { buildMathTutorInstructions } from "#instructions";

// two layers: the guardrail blocks non-math messages, the prompt handles mixed ones it lets through
const mathAgent = new Agent<UserContext>({
  name: "Math Agent",
  instructions: buildMathTutorInstructions,
  model: DEFAULT_MODEL,
  inputGuardrails: [mathInputGuardrail],
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
    const result = await run(mathAgent, history, { context: currentUser });
    console.log(`${mathAgent.name}: ${result.finalOutput}\n`);
    history = result.history;
  } catch (error) {
    if (!(error instanceof InputGuardrailTripwireTriggered)) throw error;
    // drop the blocked message, otherwise it is resent with every later turn
    history.pop();
    const check = MathCheckSchema.safeParse(error.result.output.outputInfo);
    const reason = check.success ? check.data.reason : "not a math question";
    console.log(`[guardrail] ${error.result.guardrail.name} blocked your message: ${reason}\n`);
  }
  rl.prompt();
}
rl.close();
