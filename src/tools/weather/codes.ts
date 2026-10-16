export const CITY_CODES = {
  MUM: "Mumbai",
  TNA: "Thane",
  AWB: "Aurangabad",
  PUN: "Pune",
  NGP: "Nagpur",
} as const;

export type CityCode = keyof typeof CITY_CODES;

// z.enum() needs a non-empty tuple, not a plain string[]
export const CITY_CODE_LIST = Object.keys(CITY_CODES) as [CityCode, ...CityCode[]];
