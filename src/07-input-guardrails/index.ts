import "dotenv/config";
import { run, InputGuardrailTripwireTriggered } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";
import { MathCheckSchema } from "../guardrails/index.js";
import { DEMO_USER as currentUser } from "../core/index.js";
import { mathAgent } from "./agents.js";

const rl = readline.createInterface({ input, output });
let history: AgentInputItem[] = [];
console.log(`${mathAgent.name} (math questions only). Type "exit" to quit.\n`);

rl.setPrompt("User: ");
rl.prompt();

// for-await ends the loop (and closes readline) on "exit", Ctrl+C or end of input
for await (const line of rl) {
  const userInput = line.trim();
  if (userInput.toLowerCase() === "exit") {
    rl.close();
    console.log("Chat ended.");
    break;
  }
  if (!userInput) {
    rl.prompt();
    continue;
  }

  history.push({ role: "user", content: userInput });
  try {
    const result = await run(mathAgent, history, { context: currentUser });
    console.log(`Assistant: ${result.finalOutput}\n`);
    history = result.history;
  } catch (error) {
    if (!(error instanceof InputGuardrailTripwireTriggered)) throw error;
    // drop the blocked message, otherwise it is resent with every later turn
    history.pop();
    const check = MathCheckSchema.safeParse(error.result.output.outputInfo);
    const reason = check.success ? check.data.reason : "not a math question";
    console.log(`[guardrail] ${error.result.guardrail.name}: blocked (${reason})`);
    console.log("Assistant: I can only help with math questions.\n");
  }
  rl.prompt();
}
console.log("Bye!");
