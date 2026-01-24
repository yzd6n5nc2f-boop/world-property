/**
 * TODO: Centralize environment variable parsing and validation.
 * Avoid accessing process.env directly outside this module.
 */

export interface EnvConfigStub {
  nodeEnv: string;
  appName: string;
}

export const envConfigStub: EnvConfigStub = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appName: "world-property",
};
