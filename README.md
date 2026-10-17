# openai-agent-sdk-basics

A hands-on study project for learning how to build **agentic apps in TypeScript** with the [OpenAI Agents SDK](https://github.com/openai/openai-agents-js), from a simple "hello world" agent up to multi-agent systems, guardrails, memory, human approval and MCP.

The lessons follow Piyush Garg's [OpenAI Agent SDK series](https://www.youtube.com/playlist?list=PLinedj3B30sA-XUqy01s8yrZ0r0QZMpQT) ([reference repo](https://github.com/piyushgarg-dev/OpenAI-Agent-SDK-Series-with-Typescript)), rewritten in TypeScript against the latest SDK with my own examples.

## What is an agent?

An **agent** is an LLM plus:

- **Instructions**: a system prompt that defines its role and rules.
- **Tools**: functions it can call to fetch data or take actions.
- **A loop**: the SDK's `run()` keeps calling the model, executing any tools it asks for and feeding the results back, until the model produces a final answer.

```ts
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Hello Agent",
  instructions: "You are a friendly assistant.",
  model: "gpt-5-mini",
});

const result = await run(agent, "Hi, my name is Pankaj");
console.log(result.finalOutput);
```

## Setup

Requirements: **Node.js 22+** and an OpenAI API key.

```bash
git clone https://github.com/pankajunhale/openai-agent-sdk-basics.git
cd openai-agent-sdk-basics
npm install
```

Copy `.env.example` to `.env` and add your key:

```text
OPENAI_API_KEY=sk-your-key-here
```

On Windows, create `.env` in your editor rather than with `echo > .env`; PowerShell writes UTF-16, which `dotenv` can't read.

## Running a lesson

```bash
npm start src/03-tool-calling/index.ts      # run once
npm run dev src/03-tool-calling/index.ts    # re-run on save (not for chat lessons)
npm run typecheck                           # type-check the whole project
npm run lint                                # ESLint (lint:fix to auto-fix)
npm run format                              # Prettier (format:check to only check)
npm run check                               # typecheck + lint + format check
```

Most lessons are interactive chats: type a message, and type `exit` to quit.

## Learning topics

| #   | Lesson                        | Folder                        | Status |
| --- | ----------------------------- | ----------------------------- | ------ |
| 1   | Introduction                  | (no code)                     | ✅     |
| 2   | Hello World agent             | `src/02-hello-world`          | ✅     |
| 3   | Tool calling                  | `src/03-tool-calling`         | ✅     |
| 4   | Structured outputs with Zod   | `src/04-structured-outputs`   | ✅     |
| 5   | Multi-agent: agents as tools  | `src/05-agents-as-tools`      | ✅     |
| 6   | Agent handoffs                | `src/06-handoffs`             | ✅     |
| 7   | Input guardrails              | `src/07-input-guardrails`     | ✅     |
| 8   | Output guardrails             | `src/08-output-guardrails`    | ✅     |
| 9   | Phase 1 checkpoint            | (recap, no code)              | ✅     |
| 10  | Conversation and chat threads | `src/10-chat-threads`         | ⏳     |
| 11  | Server conversations          | `src/11-server-conversations` | ⏳     |
| 12  | Runtime local context         | `src/12-local-context`        | ✅     |
| 13  | Streaming responses           | `src/13-streaming`            | ⏳     |
| 14  | Human in the loop             | `src/14-human-in-loop`        | ⏳     |
| 15  | MCP (Model Context Protocol)  | `src/15-mcp`                  | ⏳     |

### 2. Hello World agent

The smallest working agent: a name, instructions and a model. It shows:

- **Dynamic instructions**: the system prompt changes with a `USER_LOCATION` env variable.
- **A chat loop**: `readline` with `for await`, so the agent keeps chatting until you type `exit`.
- **Conversation history**: each turn sends the previous messages, so the agent remembers your name. After a run, `history = result.history` keeps the whole conversation, so you don't have to rebuild assistant messages by hand.

`math-agent.ts` runs a second agent whose system prompt (`src/instructions/math-tutor.ts`) limits it to step-by-step math tutoring.

### 3. Tool calling

Tools let the model act instead of guessing. A tool is a name, a description, a **Zod schema** for its input, and an `execute` function.

```ts
const getWeatherTool = tool({
  name: "get_weather",
  description: "Get the current weather for a city.",
  parameters: z.object({ cityCode: z.enum(["MUM", "PUN", "NGP"]) }),
  execute: async ({ cityCode }) => getWeather(cityCode),
});
```

The lesson's general assistant has a mock **weather** tool and a **calculator** tool, and decides by itself which to call. Things to notice:

- The model chooses a tool **only from its description and schema**, so write those clearly.
- One question can trigger several tool calls in sequence (weather → subtract → multiply). That loop is what makes it an agent.
- `errorFunction` sends the real error message (e.g. "Cannot divide by zero") back to the model instead of a generic one.
- Every tool input and output is logged as JSON, so you can watch the agent think.

### 4. Structured outputs with Zod

Instead of free text, the agent returns a **typed object** that matches a Zod schema, so your code can use `result.finalOutput.weather?.temperatureC` directly instead of parsing a sentence.

The lesson reuses the weather + calculator assistant and sets `outputType` to an answer schema that wraps the weather schema:

```ts
const WeatherAnswerSchema = z.object({
  weather: CurrentWeatherSchema.nullable(), // null when there's no tool result
  message: z.string(),
});

const assistantAgent = new Agent<UserContext, typeof WeatherAnswerSchema>({
  name: "General Assistant",
  instructions: buildGeneralAssistantInstructions,
  model: DEFAULT_MODEL,
  tools: allTools,
  outputType: WeatherAnswerSchema,
});
```

Things to notice:

- **A schema, not an interface.** Passing a TypeScript `interface` fails with _"only refers to a type, but is being used as a value"_, because interfaces disappear at runtime. The SDK needs a real Zod schema to turn into JSON Schema for the model and to validate the reply.
- **One definition for both.** `src/tools/weather/types.ts` defines `CurrentWeatherSchema` once and derives the type with `z.infer<typeof CurrentWeatherSchema>`, so the tool's service and the agent's output always agree.
- **`finalOutput` is now an object**, so it's printed as formatted JSON; a template string would show `[object Object]`.
- **Every answer must fit the schema.** The first version used `CurrentWeatherSchema` directly as the `outputType`. Asked about Delhi (not supported), the agent skipped the tool and invented a Mumbai reading with all zeros, because the schema had no way to say "no weather". A nullable `weather` plus a `message` lets it decline honestly, and non-weather answers like "12 × 12" fit too.

### 5 & 6. Multi-agent: agents as tools vs handoffs

Both lessons use the same scenario: **a broadband customer with slow internet who wants to cancel and get a refund**. There are two specialists, a **Customer Agent** (plan and speed checks) and an **Account Agent** (refund eligibility, cancellation, refund), sharing the mock tools in `src/tools/broadband`.

| Pattern                        | Use it when                                                                   | What happens                                                                                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agents as tools** (lesson 5) | A manager should stay in control and call specialists as bounded capabilities | A **Support Manager** calls the specialists via `agent.asTool()` and writes every reply itself, like a support person who puts you on hold and checks with the refunds team |
| **Handoffs** (lesson 6)        | A specialist should take over the conversation                                | The Customer Agent **transfers** you to the Account Agent, who then talks to you directly, like being routed to the refunds department                                      |

Lessons learned while building these:

- With handoffs, the chat loop must continue with `result.lastAgent`, or the next message goes back to the first agent.
- A handoff `inputFilter` controls what history the next agent sees. Here it gets a plain text-only chat so it acts instead of repeating "I'm transferring you".
- Refund amounts are always calculated in code, never by the model.

### 7. Input guardrails

Guardrails are checks that run **before** the agent (on the user's input) or **after** it (on the agent's answer). If one trips, the run stops with an `InputGuardrailTripwireTriggered` error.

The lesson's **Math Agent** only answers math. A small classifier agent (with a Zod `outputType`) decides whether each message is a math question, and the guardrail trips when it isn't:

```ts
export const mathInputGuardrail: InputGuardrail = {
  name: "Math only",
  runInParallel: false, // the Math Agent waits for the check
  execute: async (args) => {
    const { text, output } = await classifyLatestUserMessage(mathClassifier, args);
    return { tripwireTriggered: !output.isMath, outputInfo: { input: text, ...output } };
  },
};

const mathAgent = new Agent({ name: "Math Agent", ..., inputGuardrails: [mathInputGuardrail] });
```

The shared chat loop (`runChatLoop`) catches `InputGuardrailTripwireTriggered`, shows the classifier's reason and removes the blocked message from the history.

Guardrails live in `src/guardrails/`, split by where they attach:

| Level                    | Attach to                         | Use for                          |
| ------------------------ | --------------------------------- | -------------------------------- |
| `entry/`                 | `new Agent({ inputGuardrails })`  | Topic checks ("math only")       |
| `run/`                   | `new Runner({ inputGuardrails })` | Company policy (PII, jailbreaks) |
| `tool/` (argument level) | `tool({ inputGuardrails })`       | Risky tool arguments (refunds)   |

Things to notice:

- **Input guardrails only run on the first agent of a run.** With handoffs, put them on the entry agent.
- **`runInParallel: false`** blocks the agent until the check passes. Blocked questions took about 2 s instead of about 6 s, and the Math Agent never ran.
- **Check only the latest message.** The guardrail receives the whole history, so checking all of it would let one old off-topic message block every later turn.
- **Two layers.** The guardrail blocks off-topic messages, and the agent's prompt ignores the off-topic part of mixed ones ("tell me a joke, also what is 5 + 5?").

Pitfalls hit while building it:

- "Write a poem teaching how to add 2 numbers" (the video's example) was first **allowed**, because the topic is math. The fix was to decide by **what the user wants back** (a solution vs a poem or code), not by the topic.
- "Now explain step 2 again" was **blocked**, because the classifier only saw that one message. The fix was to pass the previous assistant reply as context only. "Now turn that into a poem" is still blocked.

### 8. Output guardrails

Output guardrails check the agent's **answer** before it reaches the user. If one trips, the run throws `OutputGuardrailTripwireTriggered` and the answer is never shown.

The lesson's **Query Builder Agent** turns plain English into SQL (`outputType: SqlAnswerSchema`). A classifier agent checks every reply, and the guardrail trips unless the SQL is read-only:

```ts
export const readQueryGuardrail: OutputGuardrail<typeof SqlAnswerSchema, UserContext> = {
  name: "Query Guardrail",
  execute: async ({ agentOutput, context }) => {
    const result = await run(guardrailAgent, agentOutput.response, { context });
    return { outputInfo: result.finalOutput, tripwireTriggered: !result.finalOutput?.isSafe };
  },
};

const mainAgent = new Agent<UserContext, typeof SqlAnswerSchema>({ ..., outputGuardrails: [readQueryGuardrail] });
```

Things to notice:

- **`agentOutput` is typed.** `OutputGuardrail<typeof SqlAnswerSchema>` makes `agentOutput.response` a string, with no parsing needed.
- **Two layers again.** The builder's prompt allows only `SELECT`, so "Delete all users" is refused by the agent itself. The guardrail catches the cases where the prompt fails; a cloned agent forced to answer `DELETE FROM User;` was blocked.
- **Explain the block.** `SqlCheckSchema` has `isSafe`, `reason` and `query`. The shared chat loop prints the reason ("Query Guardrail blocked the answer: ...") and drops the blocked turn from the history.
- **The classifier judges the reply, not instructions inside it.** The prompt lists the unsafe statements (`INSERT`, `UPDATE`, `DELETE`, `DROP`, ...), and a reply with several statements is unsafe if any one of them is.

Pitfalls hit while building it:

- `new Tool(...)` doesn't exist. Tools are created with `tool({ ..., execute })`, and agents take `instructions`, not `prompt`.
- An output guardrail must **return** `{ tripwireTriggered, outputInfo }`. Writing the type as `typeof { ... }` doesn't compile; use `OutputGuardrail<typeof Schema, Context>`.

### 9. Phase 1 checkpoint

A recap video with no new code. Phase 1 (lessons 2–8) covered agents, tools, structured outputs, agents as tools, handoffs, and input and output guardrails.

### 10 & 11. Conversations and chat threads

How an agent remembers earlier messages:

- **Local history** (lesson 10): you keep `result.history` yourself, or use a `MemorySession`.
- **Server conversations** (lesson 11): OpenAI stores the thread (`OpenAIConversationsSession`) and you only send the new message.

### 12. Runtime local context

Pass app data, such as the logged-in user, to tools via `run(agent, input, { context })`. **The context is never sent to the model**, so it's the safe place for user ids, database clients or tokens.

The lesson's account assistant calls the free [JSONPlaceholder](https://jsonplaceholder.typicode.com) API (users, posts, comments, albums, photos, todos):

- No tool accepts a user id from the model; every tool reads it from the context, so "my user id is 5" can't fetch someone else's data.
- Tools that take a post or album id check that it belongs to the logged-in user.
- Tool results are trimmed: list views return only ids and titles, and other people's emails aren't sent to the model.

### 13. Streaming

Print the answer token by token as it's generated (`run(agent, input, { stream: true })`) instead of waiting for the whole response.

### 14. Human in the loop

Mark risky tools (cancel, refund, delete) as needing approval. The run pauses with an **interruption**, a human approves or rejects it, and the run resumes from its saved `RunState`.

### 15. MCP (Model Context Protocol)

Connect the agent to external MCP servers (local via stdio, remote via HTTP, or hosted by OpenAI), so it can use tools you didn't write yourself.

## Project structure

```text
src/
├── 02-hello-world/ … 15-mcp/   # one folder per lesson
│   ├── agents.ts               # the lesson's agents
│   └── index.ts                # entry point: the chat loop
├── instructions/               # one file per agent prompt (math-tutor.ts, sql-builder.ts, ...)
├── constants/                  # DEFAULT_MODEL, USER_LOCATION
├── core/                       # global auth and context
│   ├── context.ts              # UserContext: the one run context (optional broadband account)
│   ├── auth.ts                 # requireUser, requireCustomer
│   └── session.ts              # demo logins: DEMO_USER, DEMO_CUSTOMER
├── tools/                      # reusable tools, shared across lessons
│   ├── index.ts                # allTools, userTools exports
│   ├── weather/                # mock weather (5 cities)
│   ├── math/                   # calculator
│   ├── jsonplaceholder/        # real API calls for the logged-in user
│   └── broadband/              # mock customers, refund rules
├── guardrails/                 # checks the SDK runs around an agent
│   ├── index.ts                # guardrail exports
│   ├── shared/classify.ts      # run a classifier on the latest user message
│   ├── entry/math/             # Agent-level: math-only input guardrail
│   ├── entry/sql/              # Agent-level: read-only SQL output guardrail
│   ├── run/                    # Runner-level (planned: PII)
│   └── tool/                   # tool arguments (planned: refund amount)
└── shared/
    ├── chat-loop.ts            # runChatLoop: the chat loop every lesson uses
    └── log.ts                  # pretty logging of tool calls and handoffs
```

Every lesson is built the same way:

- The prompt lives in `src/instructions` as a function of the run context, so every agent can read the logged-in user the same way:

  ```ts
  export const buildAccountAssistantInstructions: InstructionsBuilder = (runContext) => `
  You are an account assistant helping ${runContext.context.name}. ...`;
  ```

- The agent lives in the lesson's `agents.ts` (`new Agent<UserContext>({ ..., model: DEFAULT_MODEL })`).
- `index.ts` is one call to the shared chat loop, which passes the logged-in user to every run:

  ```ts
  await runChatLoop(assistantAgent, { context: DEMO_USER, intro: ["Tools: ..."] });
  ```

- Each folder exports through its `index.ts`, and other folders import it with a short alias from `package.json` `"imports"`: `#constants`, `#core`, `#guardrails`, `#instructions`, `#tools`, `#shared/<file>`.

Each tool folder follows the same layout:

| File                                     | Purpose                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `tool.ts`                                | `tool()` definition and Zod schema, which is what the model sees |
| `service.ts`                             | The actual logic or API call, which knows nothing about agents   |
| `types.ts`                               | TypeScript types                                                 |
| `codes.ts` / `operations.ts` / `data.ts` | Constants or mock data                                           |

## Tech stack

- [`@openai/agents`](https://www.npmjs.com/package/@openai/agents) 0.20, the OpenAI Agents SDK
- [`zod`](https://zod.dev) 4 for tool and output schemas
- TypeScript 6, run directly with [`tsx`](https://github.com/privatenumber/tsx)
- ESLint 9 + [`typescript-eslint`](https://typescript-eslint.io) for linting, Prettier for formatting
- `axios` for HTTP calls and `dotenv` for the API key

## References

- [OpenAI Agents SDK docs](https://developers.openai.com/api/docs/guides/agents/sdk)
- [openai-agents-js on GitHub](https://github.com/openai/openai-agents-js) and its `examples/` folder
- [Piyush Garg's YouTube series](https://www.youtube.com/playlist?list=PLinedj3B30sA-XUqy01s8yrZ0r0QZMpQT)
