import { CITY_CODES, type CityCode } from "./codes.js";
import type { CurrentWeather } from "./types.js";

type MockReading = Omit<CurrentWeather, "cityCode" | "city" | "observedAt">;

const MOCK_WEATHER: Record<CityCode, MockReading> = {
  MUM: { temperatureC: 31, feelsLikeC: 36, humidity: 78, windKph: 14, condition: "Cloudy" },
  TNA: { temperatureC: 30, feelsLikeC: 35, humidity: 74, windKph: 10, condition: "Rain" },
  AWB: { temperatureC: 33, feelsLikeC: 34, humidity: 40, windKph: 12, condition: "Sunny" },
  PUN: { temperatureC: 28, feelsLikeC: 29, humidity: 55, windKph: 9, condition: "Thunderstorm" },
  NGP: { temperatureC: 35, feelsLikeC: 38, humidity: 35, windKph: 7, condition: "Haze" },
};

export async function getWeather(cityCode: CityCode): Promise<CurrentWeather> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    cityCode,
    city: CITY_CODES[cityCode],
    ...MOCK_WEATHER[cityCode],
    observedAt: new Date().toISOString(),
  };
}
