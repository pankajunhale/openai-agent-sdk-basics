# Entry-level guardrails

Attached to an agent: `new Agent({ inputGuardrails: [...], outputGuardrails: [...] })`.

- Input guardrails only run when the agent is the **first** agent of a run. With handoffs, put them on the entry agent; the agents it hands off to never see raw user input.
- Use `runInParallel: false` for topic checks, so a blocked question never reaches the agent (and costs no tokens).
- Check only the latest user message, not the whole chat history.

Domains: `math/` (lesson 07, input), `sql/` (lesson 08, output).
