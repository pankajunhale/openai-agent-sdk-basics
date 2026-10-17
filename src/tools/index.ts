import { getWeatherTool } from "./weather/tool.js";
import { calculateTool } from "./math/tool.js";

export { getWeatherTool, calculateTool };
export { CurrentWeatherSchema, WeatherAnswerSchema } from "./weather/types.js";
export type { CurrentWeather, WeatherAnswer } from "./weather/types.js";

export const allTools = [getWeatherTool, calculateTool];

// not part of allTools: these need a logged-in user passed via run(..., { context }),
// see src/core for the context types
export { userTools } from "./jsonplaceholder/tool.js";
export { accountTools, customerTools } from "./broadband/index.js";
