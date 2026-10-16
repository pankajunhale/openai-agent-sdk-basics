import 'dotenv/config';
import { Agent, run, user, MemorySession } from '@openai/agents';
import type { AgentInputItem } from '@openai/agents';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
