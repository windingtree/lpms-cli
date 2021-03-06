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
export type DateKey = `${number}-${number}-${number}`;
export type DefaultKey = 'default';
export type DefaultOrDateKey = DefaultKey | DateKey;
export type FacilitySubLevels = 'stubs' | 'items' | 'terms';
export type RuleKey = 'notice_required' | 'length_of_stay';
export type RuleValues = NoticeRequiredRule | DayOfWeekLOSRule;
export type ModifierKey = 'day_of_week' | 'occupancy' | 'length_of_stay';
export type ModifierValues =
  | DayOfWeekRateModifier
  | OccupancyRateModifier
  | LOSRateModifier;
export type ItemTypes = 'space' | 'item';
export type RateTypes = 'items' | 'terms';

export interface CliOptions {
  save?: boolean;
  get?: ConfigKeys;
  set?: ConfigKeys;
  remove?: ConfigKeys;
  value?: ConfigOptions[ConfigKeys];
  reset?: boolean;
  login?: string;
  password?: string;
  metadata?: string;
  file?: string;
  line?: string;
  salt?: string;
  meta?: string;
  register?: boolean;
  update?: boolean;
  index?: number;
  keys?: number;
  id?: boolean;
  facilityId?: string;
  itemId?: string;
  itemType?: ItemTypes;
  availability?: DefaultOrDateKey;
  numSpaces?: number;
  gasPrice?: number;
  activate: boolean;
  deactivate: boolean;
  rule?: string;
  rate?: string;
  rateType?: RateTypes;
  modifier?: string;
  term?: string;
  data?: string;
  out?: string;
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
