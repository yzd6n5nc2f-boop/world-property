/**
 * TODO: Add runtime validation schemas for property domain inputs/outputs.
 * Prefer lightweight, dependency-free guards until a schema library is selected.
 */

import type { PropertyStub } from "./property.types";

export interface PropertySchemaResult {
  success: boolean;
  issues: string[];
}

export const validatePropertyStub = (input: PropertyStub): PropertySchemaResult => {
  void input;

  return {
    success: true,
    issues: [],
  };
};
