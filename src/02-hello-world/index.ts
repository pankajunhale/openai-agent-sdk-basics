import "dotenv/config";
import { Agent, run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";

const USER_LOCATION = process.env.USER_LOCATION || "INDIA";

// this is system prompt for the agent
const buildInstructionsByLocation = () => {
  const location = USER_LOCATION;
  switch (location.toUpperCase()) {
    case "INDIA":
      return "You are a friendly assistant. Greet the user by name in English.";
    case "USA":
      return "You are a friendly assistant. Greet the user by name in English.";
    default:
      return "You are a friendly assistant. Greet the user by name.";
  }
};

const helloAgent = new Agent({
  name: "Hello Agent",
  instructions: buildInstructionsByLocation(),
  model: "gpt-5-mini",
});
const rl = readline.createInterface({
  input,
  output,
});
const history: AgentInputItem[] = [];
console.log('Chat started. Type "exit" to quit.\n');
console.log(`System: ${buildInstructionsByLocation()}\n`);
while (true) {
  const userInput = await new Promise<string>((resolve) => {
    rl.question("User:", (answer) => {
      resolve(answer);
    });
  });
  if (userInput.toLowerCase() === "exit") {
    rl.close();
    console.log("Chat ended.");
    break;
  }
  history.push({ role: "user", content: userInput });
  const result = await run(helloAgent, history);
  console.log(`Assistant: ${result.finalOutput}\n`);
  history.push({
    role: "assistant",
    status: "completed",
    content: [{ type: "output_text", text: result.finalOutput || "" }],
  });
}
rl.close();
console.log("Bye!");
