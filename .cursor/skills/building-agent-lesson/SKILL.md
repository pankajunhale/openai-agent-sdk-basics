---
name: building-agent-lesson
description: Builds or completes a lesson folder (src/NN-topic) in the OpenAI Agents SDK study app, with a chat-loop agent, verification and README update. Use when the user asks to build, start, implement or continue a lesson or video from the series (e.g. "lesson 7", "input guardrails", "streaming", "human in loop", "MCP").
---

# Building an agent lesson

## Workflow

```
- [ ] 1. Plan: read the lesson's index.ts (it has starter imports) and pick a scenario
- [ ] 2. Reuse or add tools in src/tools (see the adding-agent-tool skill)
- [ ] 3. Write the agent(s) and chat loop
- [ ] 4. npm run typecheck
- [ ] 5. Verify with a temporary _try.ts script, then delete it
- [ ] 6. Update the README "Learning topics" table and section
```

**1. Plan.** Prefer the existing scenarios so lessons connect: weather + math (`allTools`), JSONPlaceholder user (`userTools` + `UserContext`), broadband refund (`customerTools`, `accountTools`, `BroadbandContext`). For multi-file lessons, split into `agents.ts` + `index.ts`.

**3. Write.** Start from the template below. Keep the instructions as a `const` (or a function of `runContext` when it needs context).

**5. Verify.** Chat loops read stdin, so piping input fails. Write `src/NN-topic/_try.ts` that imports the agent, runs 3–5 fixed questions (including a failure case, e.g. unsupported input or another user's data), prints `logRunItems(result.newItems)` and `finalOutput`, then run `npx tsx src/NN-topic/_try.ts`. Fix any prompt or code issues, rerun, then delete `_try.ts`.

**6. README.** Change the lesson's status to ✅ and describe what was built and what was learned (pitfalls included).

## Chat-loop template

```ts
import "dotenv/config";
import { Agent, run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import * as readline from "readline";
import { stdin as input, stdout as output } from "node:process";
import { logRunItems } from "../shared/log.js";
import { allTools } from "../tools/index.js";

const INSTRUCTIONS = `
You are ...

Rules:
- ...
`;

const agent = new Agent({
  name: "Lesson Agent",
  instructions: INSTRUCTIONS,
  model: "gpt-5-mini",
  tools: allTools,
});

const rl = readline.createInterface({ input, output });
let history: AgentInputItem[] = [];
console.log('Chat started. Type "exit" to quit.\n');

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
  const result = await run(agent, history);

  logRunItems(result.newItems);
  console.log(`Assistant: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
console.log("Bye!");
```

Variations:
- Run context: `new Agent<Ctx>(...)` and `run(agent, history, { context })`
- Handoffs: keep `let currentAgent`, then `currentAgent = result.lastAgent ?? currentAgent`
- `outputType`: print with `toPrettyJson(result.finalOutput)`
