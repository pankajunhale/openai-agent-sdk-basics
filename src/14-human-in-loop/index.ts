import 'dotenv/config';
import { Agent, run, tool, RunState } from '@openai/agents';
import type { RunToolApprovalItem } from '@openai/agents';
import { z } from 'zod';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
