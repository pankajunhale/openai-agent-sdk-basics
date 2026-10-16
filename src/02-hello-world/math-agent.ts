import "dotenv/config";
import { Agent, run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";

// this is system prompt for the agent
const MATH_INSTRUCTIONS = `
You are a patient math tutor.

Rules:
- Only answer math questions (arithmetic, algebra, geometry, calculus, statistics).
- If the question is not about math, politely say you can only help with math.
- Solve step by step, numbering each step.
- End with the final answer on its own line, like: "Answer: 42".
- Keep explanations simple, as if teaching a school student.
`;

const mathAgent = new Agent({
  name: "Math Agent",
  instructions: MATH_INSTRUCTIONS,
  model: "gpt-5-mini",
});
const rl = readline.createInterface({ input, output });
let history: AgentInputItem[] = [];
console.log('Math chat started. Type "exit" to quit.\n');

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
  const result = await run(mathAgent, history);
  console.log(`Assistant: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
console.log("Bye!");
