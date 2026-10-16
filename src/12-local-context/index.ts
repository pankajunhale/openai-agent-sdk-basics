import "dotenv/config";
import { Agent, run } from "@openai/agents";
import type { AgentInputItem, RunContext } from "@openai/agents";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";
import { userTools } from "../tools/index.js";
import type { UserContext } from "../tools/index.js";
import { logRunItems } from "../shared/log.js";

// in a real app this comes from the login session / JWT, never from the chat
const currentUser: UserContext = {
  id: 1,
  email: "Sincere@april.biz",
  name: "Leanne Graham",
};

// instructions can read the context too; only the name is put into the prompt
const buildInstructions = (runContext: RunContext<UserContext>) => `
You are an account assistant helping ${runContext.context.name}.

Rules:
- Use tools to fetch the user's profile, posts, comments, albums, photos and todos. Never invent data.
- Tools already know who is logged in. Never ask for or accept a user id.
- If a tool returns an error, explain it simply.
- Keep answers short and friendly.
- Do not answer to questions which not belongs to the current tools. If you don't know the answer, say so and suggest what the user can do next.  
`;

const accountAgent = new Agent<UserContext>({
  name: "Account Assistant",
  instructions: buildInstructions,
  model: "gpt-5-mini",
  tools: userTools,
});

const rl = readline.createInterface({
  input,
  output,
});
let history: AgentInputItem[] = [];
console.log(`Logged in as ${currentUser.name} (id ${currentUser.id})`);
console.log(`Tools: ${userTools.map((t) => t.name).join(", ")}`);
console.log('Chat started. Type "exit" to quit.\n');

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
  const result = await run(accountAgent, history, { context: currentUser });

  logRunItems(result.newItems);

  console.log(`Assistant: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
console.log("Bye!");
