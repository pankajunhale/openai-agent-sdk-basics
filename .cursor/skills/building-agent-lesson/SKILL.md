---
name: building-agent-lesson
description: Builds or completes a lesson folder (src/NN-topic) in the OpenAI Agents SDK study app, with a chat-loop agent, verification and README update. Use when the user asks to build, start, implement or continue a lesson or video from the series (e.g. "lesson 7", "input guardrails", "streaming", "human in loop", "MCP").
---

# Building an agent lesson

## Workflow

```
- [ ] 1. Plan: read the lesson's index.ts (it has starter imports) and pick a scenario
- [ ] 2. Reuse or add tools in src/tools (see the adding-agent-tool skill)
- [ ] 3. Write the prompt(s) in src/instructions, then the agent(s) and the chat loop in index.ts (the lesson's only file)
- [ ] 4. npm run check
- [ ] 5. Verify with a temporary _try.ts script, then delete it
- [ ] 6. Update the README "Learning topics" table and section
```

**1. Plan.** Prefer the existing scenarios so lessons connect: weather + math (`allTools`), JSONPlaceholder user (`userTools` + `UserContext`), broadband refund (`customerTools`, `accountTools`, `DEMO_CUSTOMER`). Every lesson is a single `index.ts` (agents + chat loop) that prints only the agent's answer.

**3. Write.** Start from the templates below. Put each prompt in its own `src/instructions/<agent>.ts` as a `build<Agent>Instructions: InstructionsBuilder` function of the run context, and export it from `src/instructions/index.ts`. Type the agent with its context and pass `{ context: DEMO_USER }` to every run. Use `DEFAULT_MODEL` from `src/constants` and demo logins from `src/core`.

**5. Verify.** Chat loops read stdin, so don't pipe input. Importing `index.ts` would start the chat, so write `src/NN-topic/_try.ts` that defines a copy of the lesson's agent (same prompt builder, tools, guardrails), runs 3–5 fixed questions with `run(agent, question, { context: DEMO_USER })` (including a failure case, e.g. unsupported input or another user's data), prints `finalOutput` (and `logRunItems(result.newItems)` with `DEBUG=true` to see tool calls), then run `npx tsx src/NN-topic/_try.ts`. Fix any prompt or code issues, rerun, then delete `_try.ts`.

**6. README.** Change the lesson's status to ✅ and describe what was built and what was learned (pitfalls included).

## Templates

```ts
// src/instructions/lesson-agent.ts
import type { InstructionsBuilder } from "./types.js";

export const buildLessonAgentInstructions: InstructionsBuilder = (runContext) => `
You are ... helping ${runContext.context.name}.

Rules:
- ...
`;
```

```ts
// src/NN-topic/index.ts
import "dotenv/config";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { Agent, run } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import { DEMO_USER as currentUser } from "#core";
import type { UserContext } from "#core";
import { buildLessonAgentInstructions } from "#instructions";
import { allTools } from "#tools";

const agent = new Agent<UserContext>({
  name: "Lesson Agent",
  instructions: buildLessonAgentInstructions,
  model: DEFAULT_MODEL,
  tools: allTools,
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
  const result = await run(agent, history, { context: currentUser });

  console.log(`${agent.name}: ${result.finalOutput}\n`);
  history = result.history;
  rl.prompt();
}
rl.close();
```

Variations:

- Broadband lessons: same `UserContext`, but run with `{ context: DEMO_CUSTOMER }` (a user with a `broadband` account)
- Debug output: `logRunItems(result.newItems)` or `debugLog("label", value)` from `#shared/log`; both print only with `DEBUG=true` in `.env`
- Handoffs: keep `let currentAgent: Agent<UserContext>`, then `currentAgent = result.lastAgent ?? currentAgent` (see `src/06-handoffs/index.ts`)
- Guardrails: wrap `run()` in try/catch for `InputGuardrailTripwireTriggered` / `OutputGuardrailTripwireTriggered`, `history.pop()`, print the reason (see lessons 07 and 08)
- `outputType`: print with `toPrettyJson(result.finalOutput)` or a single field
