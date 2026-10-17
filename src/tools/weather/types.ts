import { z } from "zod";
import { CITY_CODE_LIST } from "./codes.js";

export const WeatherConditionSchema = z.enum(["Sunny", "Cloudy", "Rain", "Thunderstorm", "Haze"]);

export const CurrentWeatherSchema = z.object({
  cityCode: z.enum(CITY_CODE_LIST),
  city: z.string(),
  temperatureC: z.number(),
  feelsLikeC: z.number(),
  humidity: z.number(),
  windKph: z.number(),
  condition: WeatherConditionSchema,
  observedAt: z.string(),
});

// agent output: weather is null when the tool wasn't called or failed, so the model never invents a reading
export const WeatherAnswerSchema = z.object({
  weather: CurrentWeatherSchema.nullable().describe(
    "Copied exactly from the get_weather tool output, or null if the tool was not called or failed.",
  ),
  message: z.string().describe("Short reply to the user, e.g. why there is no weather."),
});

export type WeatherCondition = z.infer<typeof WeatherConditionSchema>;
export type CurrentWeather = z.infer<typeof CurrentWeatherSchema>;
export type WeatherAnswer = z.infer<typeof WeatherAnswerSchema>;
