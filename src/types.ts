export type FlagBoolean = { type: "boolean"; boolean: boolean };
export type FlagPercentage = { type: "percentage"; percentage: number };
export type FlagSet = { type: "set"; set: string[] };

export type FlagValue = FlagBoolean | FlagPercentage | FlagSet;

export interface FlagRecord {
  key: string;
  value: FlagValue;
}
