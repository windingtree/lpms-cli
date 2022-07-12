import type {
  ApiSuccessResponse,
  DefaultOrDateKey,
  FacilitySubLevels,
  ModifierKey,
  ModifierValues,
  RateTypes,
  RuleKey,
  RuleValues
} from '../types';
import { Ora } from 'ora';
import axios from 'axios';
import { getConfig, requiredConfig } from './config';
import { getAuthHeader } from './login';
import { green, printObject } from '../utils/print';
import { readJsonFromFile } from '../utils/files';

export const keyTypes = ['rule', 'rate', 'modifier', 'term'];

export type KeyType = typeof keyTypes[number];
export type AllKeys = ModifierKey | RuleKey | DefaultOrDateKey | string;
export type GivenKeys = { [k in KeyType]?: AllKeys};
export type SelectedKey = { type: KeyType, value: AllKeys };

export const selectKey = (values: GivenKeys): SelectedKey => {
  const key = Object
    .entries(values)
    .reduce(
      (a, v) => ({
        ...a,
        ...(
          v[1]
            ? {
              type: v[0],
              value: v[1]
            }
            : {}
        )
      }),
      {
        type: '',
        value: ''
      }
    );

  if (key.type === '') {
    throw new Error(
      `One of ${keyTypes.map(k => '--' + k).join(', ')} must be provided as an option`
    );
  }

  return key;
};

export const getOneOfKey = async (
  facilityId: string,
  itemKey: FacilitySubLevels | undefined,
  itemId: string | undefined,
  keys: GivenKeys,
  rateType: RateTypes | undefined,
  spinner: Ora
): Promise<ModifierValues | RuleValues> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  const itemMessage = itemId ? ' of the item ' + itemId : '';
  const key = selectKey(keys);
  spinner.text = `Getting the ${key.type}${itemMessage} of the facility ${facilityId}...`;

  const itemUri = itemKey ? `/${itemId}` : '';
  const rateTypeValue = rateType ? `/${rateType}` : '';

  const { data } = await axios.get<ModifierValues | RuleValues>(
    `${getConfig('apiUrl')}/api/${key.type}/${facilityId}${itemUri}/${key.value}${rateTypeValue}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  printObject(data);

  return data;
};

export const addOneOfKey = async (
  facilityId: string,
  itemKey: FacilitySubLevels | undefined,
  itemId: string | undefined,
  keys: GivenKeys,
  rateType: RateTypes | undefined,
  dataPath: string,
  spinner: Ora
): Promise<void> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  const itemMessage = itemId ? ' of the item ' + itemId : '';
  const key = selectKey(keys);
  spinner.text = `Reading the ${key.type}${itemMessage} from ${dataPath}`;

  const keyData = await readJsonFromFile<ModifierValues | RuleValues>(
    dataPath
  );

  spinner.text = `Uploading ${dataPath}`;

  const itemUri = itemKey ? `/${itemId}` : '';
  const rateTypeValue = rateType ? `/${rateType}` : '';

  const { data } = await axios.post<ApiSuccessResponse>(
    `${getConfig('apiUrl')}/api/${key.type}/${facilityId}${itemUri}/${key.value}${rateTypeValue}`,
    {
      ...keyData,
      descriptor: key.value
    },
    {
      headers: {
        ...authHeader
      }
    }
  );

  spinner.stop();

  if (!data.success) {
    throw new Error(
      `Something went wrong during the adding of the ${key.type}`
    );
  }

  green(
    `The ${key.type}${itemMessage} of the facility ${facilityId} has been added successfully`
  );
};

export const removeOneOfKey = async (
  facilityId: string,
  itemKey: FacilitySubLevels | undefined,
  itemId: string | undefined,
  keys: GivenKeys,
  spinner: Ora
): Promise<void> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  const itemMessage = itemId ? ' of the item ' + itemId : '';
  const key = selectKey(keys);
  spinner.text = `Removing the ${key.type}${itemMessage} from ${facilityId}...`;

  const itemUri = itemKey ? `/${itemId}` : '';

  const { data } = await axios.delete<ApiSuccessResponse>(
    `${getConfig('apiUrl')}/api/${key.type}/${facilityId}${itemUri}/${key.value}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  if (!data.success) {
    throw new Error(
      `Something went wrong during removal of the ${key.type}`
    );
  }

  green(
    `The ${key.type}${itemMessage} of the facility ${facilityId} has been removed successfully`
  );
};
