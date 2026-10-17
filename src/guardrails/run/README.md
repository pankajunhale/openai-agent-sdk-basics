# Run-level guardrails

Attached to a runner: `new Runner({ inputGuardrails: [...], outputGuardrails: [...] })`, then `runner.run(agent, input)`.

- They run on every run, whichever agent starts it, so they suit company-wide policy: PII (emails, phone and card numbers), jailbreak attempts, abusive language.
- They use the same `InputGuardrail` / `OutputGuardrail` types as entry-level guardrails.
- Keep topic rules ("math only") on the agent instead, in `entry/`.

Domains: none yet (planned: `pii/`).
