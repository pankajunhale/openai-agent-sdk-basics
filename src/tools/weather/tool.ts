import { tool } from "@openai/agents";
import { z } from "zod";
import { CITY_CODES, CITY_CODE_LIST } from "./codes.js";
import { getWeather } from "./service.js";

const supportedCities = Object.entries(CITY_CODES)
  .map(([code, name]) => `${code} (${name})`)
  .join(", ");

export const getWeatherTool = tool({
  name: "get_weather",
  description: `Get the current weather for a city. Supported cities: ${supportedCities}.`,
  parameters: z.object({
    cityCode: z.enum(CITY_CODE_LIST).describe("City code, e.g. MUM for Mumbai"),
  }),
  execute: async ({ cityCode }) => {
    return getWeather(cityCode);
  },
});
