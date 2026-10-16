import "dotenv/config";
import {
  Agent,
  run,
  tool,
  handoff,
  InputGuardrailTripwireTriggered,
  OutputGuardrailTripwireTriggered,
} from "@openai/agents";
import type { InputGuardrail, OutputGuardrail } from "@openai/agents";
import { z } from "zod";
import axios from "axios";
