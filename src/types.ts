import type { Command } from 'commander';

export type SpinnerCallback = (text: string) => void;

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ConfigOptions {
  apiUrl?: string;
  providerUri?: string;
  mnemonic?: string;
  defaultAccountIndex?: number;
  login?: LoginTokens;
  salt?: string;
  metadataUri?: string;
  registry?: string;
  serviceProviderId?: string;
}

export type ConfigKeys = keyof ConfigOptions;
export type AvailabilityDateKey = `${number}-${number}-${number}`;
export type AvailabilityDefaultKey = 'default';
export type AvailabilityKey = AvailabilityDefaultKey | AvailabilityDateKey;
export interface CliOptions {
  save?: boolean;
  get?: ConfigKeys;
  add?: ConfigKeys;
  remove?: ConfigKeys;
  value?: ConfigOptions[ConfigKeys];
  reset?: boolean;
  login?: string;
  password?: string;
  metadata?: string;
  file?: string;
  salt?: string;
  meta?: string;
  register?: boolean;
  update?: boolean;
  index?: number;
  keys?: number;
  id?: boolean;
  facilityId?: string;
  spaceId?: string;
  availability?: AvailabilityKey;
  numSpaces?: number;
}

export type ActionController = (
  options: CliOptions,
  program: Command
) => void | Promise<void>;

export interface ApiSuccessResponse {
  success: boolean;
}
