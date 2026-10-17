// one file per agent prompt; every prompt is a build*Instructions(runContext) function

export type { InstructionsBuilder } from "./types.js";
export { buildHelloInstructions } from "./hello.js";
export { buildMathTutorInstructions } from "./math-tutor.js";
export { buildGeneralAssistantInstructions } from "./general-assistant.js";
export { buildCustomerTeamInstructions } from "./customer-team.js";
export { buildAccountTeamInstructions } from "./account-team.js";
export { buildSupportManagerInstructions } from "./support-manager.js";
export { buildCustomerAgentInstructions } from "./customer-agent.js";
export { buildAccountAgentInstructions } from "./account-agent.js";
export { buildMathClassifierInstructions } from "./math-classifier.js";
export { buildSqlBuilderInstructions } from "./sql-builder.js";
export { buildSqlClassifierInstructions } from "./sql-classifier.js";
export { buildAccountAssistantInstructions } from "./account-assistant.js";
