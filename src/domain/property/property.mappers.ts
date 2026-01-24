/**
 * TODO: Centralize transformations between persistence models, API contracts,
 * and UI/domain representations for property data.
 */

import type { PropertyStub } from "./property.types";

export interface PropertyRecordStub {
  id: string;
  country_code: string;
  status: string;
}

export const mapPropertyRecordToDomain = (record: PropertyRecordStub): PropertyStub => {
  return {
    id: record.id,
    countryCode: record.country_code,
    status: (record.status as PropertyStub["status"]) ?? "draft",
  };
};
