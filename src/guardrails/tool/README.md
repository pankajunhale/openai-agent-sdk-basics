# Tool (argument-level) guardrails

Attached to a tool: `tool({ ..., inputGuardrails: [...], outputGuardrails: [...] })`.

- Built with `defineToolInputGuardrail` / `defineToolOutputGuardrail`, a different type from agent guardrails.
- They check the arguments the model chose, right before `execute` runs, so they suit risky tools that move money or delete data.
- Plain business rules (e.g. "cancel before refund") still belong in the tool's service; use a guardrail for checks you want to reuse or report separately.

Domains: none yet (planned: `refund/` for `issue_refund`).
