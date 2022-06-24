import type { Command } from 'commander';
import type {
  DayOfWeekLOSRule,
  DayOfWeekRateModifier,
  LOSRateModifier,
  NoticeRequiredRule,
  OccupancyRateModifier,
  StubStorage
} from '@windingtree/stays-models/dist/cjs/proto/lpms';

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
  serviceProviderRegistry?: string;
  lineRegistry?: string;
  serviceProviderId?: string;
}

export type ConfigKeys = keyof ConfigOptions;
export type AvailabilityDateKey = `${number}-${number}-${number}`;
export type AvailabilityDefaultKey = 'default';
export type AvailabilityKey = AvailabilityDefaultKey | AvailabilityDateKey;
export type FacilitySubLevels = 'stubs' | 'items';
export type FacilityIndexKey = FacilitySubLevels | 'spaces';
export type RuleKey = 'notice_required' | 'length_of_stay';
export type RuleValues = NoticeRequiredRule | DayOfWeekLOSRule;
export type ModifierKey = 'day_of_week' | 'occupancy' | 'length_of_stay';
export type ModifierValues =
  | DayOfWeekRateModifier
  | OccupancyRateModifier
  | LOSRateModifier;

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
  gasPrice?: number;
  activate: boolean;
  deactivate: boolean;
  out?: string;
  modifier?: string;
  rule?: string;
  data?: string;
  date?: string;
  perPage?: number;
}

export type ActionController = (
  options: CliOptions,
  program: Command
) => void | Promise<void>;

export interface ApiSuccessResponse {
  success: boolean;
}

export interface  ApiStubsResponse {
  stubs: StubStorage[];
  lastPage: number;
}

export interface Availability {
  numSpaces: number;
}

export interface PagingOptions {
  index: number;
  perPage: number;
}
