# Guardrails

Checks the SDK runs around an agent. The agent never calls them (that's what `src/tools` is for).

Pick the level by where the untrusted input enters:

| Folder   | Attach to                                           | SDK type                             | Runs on                              | Use for                          |
| -------- | --------------------------------------------------- | ------------------------------------ | ------------------------------------ | -------------------------------- |
| `entry/` | `new Agent({ inputGuardrails, outputGuardrails })`  | `InputGuardrail` / `OutputGuardrail` | The first agent of a run only        | Topic checks ("math only")       |
| `run/`   | `new Runner({ inputGuardrails, outputGuardrails })` | `InputGuardrail` / `OutputGuardrail` | Every run, whichever agent starts    | Company policy (PII, jailbreaks) |
| `tool/`  | `tool({ inputGuardrails, outputGuardrails })`       | `defineToolInputGuardrail`           | One tool's arguments, before it runs | Risky arguments (refund amount)  |

Layout: `<level>/<domain>/` with `types.ts` (zod schema of the check result), `input.ts` and later `output.ts`. Export everything from `index.ts`.

Shared helpers live in `shared/`.
