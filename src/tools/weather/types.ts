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

export type WeatherCondition = z.infer<typeof WeatherConditionSchema>;
export type CurrentWeather = z.infer<typeof CurrentWeatherSchema>;
