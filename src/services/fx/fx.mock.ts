/**
 * TODO: Provide deterministic FX mocks for local development and tests.
 */

import type { FxQuoteStub } from "./fx.service";

export const FX_QUOTES_STUB: FxQuoteStub[] = [
  {
    base: "USD",
    counter: "EUR",
    rate: 1,
  },
];
