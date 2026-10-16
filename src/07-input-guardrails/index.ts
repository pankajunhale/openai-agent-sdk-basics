import 'dotenv/config';
import { Agent, run, InputGuardrailTripwireTriggered } from '@openai/agents';
import type { InputGuardrail } from '@openai/agents';
import { z } from 'zod';
