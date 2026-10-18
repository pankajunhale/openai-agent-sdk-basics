import "dotenv/config";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { Agent, run } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import { DEMO_USER as currentUser } from "#core";
import type { UserContext } from "#core";
import { buildMathTutorInstructions } from "#instructions";
import { generateConversationId } from "#shared/utility";

const mathAgent = new Agent<UserContext>({
  name: "Math Agent",
  instructions: buildMathTutorInstructions,
  model: DEFAULT_MODEL,
});

// OpenAI stores the conversation, so there is no local history: each turn sends only the new message
const conversationId = await generateConversationId();

const rl = readline.createInterface({ input, output });
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

  const result = await run(mathAgent, userInput, { context: currentUser, conversationId });

  console.log(`${mathAgent.name}: ${result.finalOutput}\n`);
  rl.prompt();
}
rl.close();
