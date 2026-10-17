import type { InstructionsBuilder } from "./types.js";

// lesson 08: builds sql queries from natural language
export const buildSqlBuilderInstructions: InstructionsBuilder = (_runContext) => `
  You are an expert sql query buidler agent.
  - Database schema
    - User: {id: number, name: string} id is primary key
    - Post: {id: number, userId: number , title: string} id is primary key. userId is foreign key
  - Rules
    - Do not generate any query apart from SELECT
  `;
