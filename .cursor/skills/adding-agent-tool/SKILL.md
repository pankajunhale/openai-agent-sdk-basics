---
name: adding-agent-tool
description: Adds a new tool domain under src/tools (tool.ts, service.ts, types.ts, data/codes) following the study app's conventions, including run-context identity and ownership checks. Use when the user asks to add, create or mock a tool, connect an API to an agent, or give an agent a new capability.
---

# Adding an agent tool

## Workflow

```
- [ ] 1. Create src/tools/<domain>/ with types.ts, service.ts, tool.ts (+ codes.ts/data.ts, context.ts)
- [ ] 2. Export the tools array from src/tools/index.ts
- [ ] 3. npm run typecheck
- [ ] 4. Smoke-test service.ts directly (no LLM) with a temporary _try.ts, then delete it
```

## Decisions

- **Mock or real API?** Mock data goes in `data.ts` (dates relative to now). Real APIs use an `axios.create({ baseURL, timeout })` client in `service.ts`.
- **Does it need to know the user?** If yes, add `context.ts` with a `requireX(runContext)` helper, take no id parameter from the model, and keep the tools out of `allTools`.
- **Does it take an id from the model?** Then fetch the record and check it belongs to the context user before returning anything.

## tool.ts template

```ts
import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import { z } from "zod";
import { requireUser } from "./context.js";
import type { UserContext } from "./types.js";
import * as svc from "./service.js";

const toErrorMessage = (_context: unknown, error: unknown) =>
  `Error: ${error instanceof Error ? error.message : String(error)}`;

export const getMyThingsTool = tool({
  name: "get_my_things",
  description: "List the logged-in user's things (id and title). Use get_my_thing for details.",
  parameters: z.object({
    status: z.enum(["all", "open", "closed"]),
  }),
  async execute({ status }, runContext?: RunContext<UserContext>) {
    const user = requireUser(runContext);
    const things = await svc.getThings(user.id, status);
    return things.map(({ id, title }) => ({ id, title }));
  },
  errorFunction: toErrorMessage,
});

export const thingTools = [getMyThingsTool];
```

## Checklist

- [ ] Tool names are `snake_case` verbs; descriptions list supported values
- [ ] No `.optional()` in parameters (use enum, required field or `.nullable()`)
- [ ] Calculations happen in `service.ts`
- [ ] Outputs are trimmed; no third-party personal data
- [ ] Every tool has `errorFunction`
- [ ] Relative imports end in `.js`
