import { getWeatherTool } from "./weather/tool.js";
import { calculateTool } from "./math/tool.js";

export { getWeatherTool, calculateTool };

export const allTools = [getWeatherTool, calculateTool];

// not part of allTools: these need a logged-in user passed via run(..., { context })
export { userTools } from "./jsonplaceholder/tool.js";
export type { UserContext } from "./jsonplaceholder/types.js";
