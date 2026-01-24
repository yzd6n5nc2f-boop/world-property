import type { PropertyType } from "@/types/listing";

const propertyTypeValues: PropertyType[] = [
  "apartment",
  "house",
  "villa",
  "condo",
  "cabin",
  "loft",
  "townhouse"
];

function parseNumber(value: string | null) {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export function parsePropertyTypes(value: string | null) {
  if (!value) return [] as PropertyType[];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry): entry is PropertyType => propertyTypeValues.includes(entry as PropertyType));
}

export function serializePropertyTypes(values: PropertyType[]) {
  return values.length ? values.join(",") : undefined;
}

export type ParsedFilters = {
  text: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  propertyTypes: PropertyType[];
};

export function parseFilters(params: URLSearchParams): ParsedFilters {
  return {
    text: params.get("text") ?? "",
    minPrice: parseNumber(params.get("minPrice")) ?? undefined,
    maxPrice: parseNumber(params.get("maxPrice")) ?? undefined,
    minBeds: parseNumber(params.get("minBeds")) ?? undefined,
    propertyTypes: parsePropertyTypes(params.get("types"))
  };
}

export function writeFiltersToParams(params: URLSearchParams, filters: ParsedFilters) {
  const next = new URLSearchParams(params);
  next.delete("mode");
  next.delete("startDate");
  next.delete("endDate");

  const assignments: Array<[string, string | undefined]> = [
    ["text", filters.text || undefined],
    ["minPrice", filters.minPrice?.toString()],
    ["maxPrice", filters.maxPrice?.toString()],
    ["minBeds", filters.minBeds?.toString()],
    ["types", serializePropertyTypes(filters.propertyTypes)]
  ];

  assignments.forEach(([key, value]) => {
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  });

  return next;
}
