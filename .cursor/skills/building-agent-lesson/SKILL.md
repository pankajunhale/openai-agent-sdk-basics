---
name: building-agent-lesson
description: Builds or completes a lesson folder (src/NN-topic) in the OpenAI Agents SDK study app, with a chat-loop agent, verification and README update. Use when the user asks to build, start, implement or continue a lesson or video from the series (e.g. "lesson 7", "input guardrails", "streaming", "human in loop", "MCP").
---

# Building an agent lesson

## Workflow

```
- [ ] 1. Plan: read the lesson's index.ts (it has starter imports) and pick a scenario
- [ ] 2. Reuse or add tools in src/tools (see the adding-agent-tool skill)
- [ ] 3. Write the prompt(s) in src/instructions, the agent(s) in agents.ts, the chat loop in index.ts
- [ ] 4. npm run check
- [ ] 5. Verify with a temporary _try.ts script, then delete it
- [ ] 6. Update the README "Learning topics" table and section
```

**1. Plan.** Prefer the existing scenarios so lessons connect: weather + math (`allTools`), JSONPlaceholder user (`userTools` + `UserContext`), broadband refund (`customerTools`, `accountTools`, `DEMO_CUSTOMER`). Every lesson has `agents.ts` (agents) + `index.ts` (chat loop), so `_try.ts` scripts can import the agents.

**3. Write.** Start from the templates below. Put each prompt in its own `src/instructions/<agent>.ts` as a `build<Agent>Instructions: InstructionsBuilder` function of the run context, and export it from `src/instructions/index.ts`. Type the agent with its context and pass `{ context: DEMO_USER }` to every run. Use `DEFAULT_MODEL` from `src/constants` and demo logins from `src/core`.

**5. Verify.** Chat loops read stdin, so piping input fails. Write `src/NN-topic/_try.ts` that runs 3–5 fixed questions (including a failure case, e.g. unsupported input or another user's data) through the real loop: `await runChatLoop(agent, { context: DEMO_USER, input: Readable.from(["q1\n", "q2\n"]) })` (import `Readable` from `node:stream`). Then run `npx tsx src/NN-topic/_try.ts`. Fix any prompt or code issues, rerun, then delete `_try.ts`.

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
// src/NN-topic/agents.ts
import { Agent } from "@openai/agents";
import { DEFAULT_MODEL } from "#constants";
import type { UserContext } from "#core";
import { buildLessonAgentInstructions } from "#instructions";
import { allTools } from "#tools";

export const agent = new Agent<UserContext>({
  name: "Lesson Agent",
  instructions: buildLessonAgentInstructions,
  model: DEFAULT_MODEL,
  tools: allTools,
});
```

```ts
// src/NN-topic/index.ts
import "dotenv/config";
import { DEMO_USER } from "#core";
import { runChatLoop } from "#shared/chat-loop";
import { agent } from "./agents.js";

await runChatLoop(agent, { context: DEMO_USER, intro: ["Lesson agent started."] });
```

`runChatLoop` already keeps `result.history`, logs tool calls and handoffs, continues with `result.lastAgent` after a handoff, and catches input/output guardrail tripwires (shows the `outputInfo.reason`, drops the blocked message).

Variations:

- Broadband lessons: same `UserContext`, but pass `{ context: DEMO_CUSTOMER }` (a user with a `broadband` account)
- `outputType`: objects print as JSON by default; pass `formatOutput: (o) => Schema.parse(o).field` to print one field
