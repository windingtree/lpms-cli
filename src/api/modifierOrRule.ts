import type {
  ApiSuccessResponse,
  FacilitySubLevels,
  ModifierKey,
  ModifierValues,
  RuleKey,
  RuleValues
} from '../types';
import { Ora } from 'ora';
import axios from 'axios';
import { getConfig, requiredConfig } from './config';
import { getAuthHeader } from './login';
import { green, printObject } from '../utils/print';
import { readJsonFromFile } from '../utils/files';

export const getModifierOrRule = async (
  facilityId: string,
  itemKey: FacilitySubLevels | undefined,
  itemId: string | undefined,
  key: ModifierKey | RuleKey,
  spinner: Ora,
  isRule = false
): Promise<ModifierValues | RuleValues> => {
  requiredConfig(['apiUrl']);
  const subjLabel = isRule ? 'rule' : 'modifier';

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Getting the ${subjLabel} of the facility: ${facilityId}...`;

  const itemUri = itemKey ? `/${itemId}` : '';

  const { data } = await axios.get<ModifierValues | RuleValues>(
    `${getConfig('apiUrl')}/api/${subjLabel}/${facilityId}${itemUri}/${key}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  green(`Facility ${facilityId} ${subjLabel}:`);
  printObject(data);

  return data;
};

export const addModifierOrRule = async (
  facilityId: string,
  itemKey: FacilitySubLevels | undefined,
  itemId: string | undefined,
  key: ModifierKey | RuleKey,
  dataPath: string,
  spinner: Ora,
  isRule = false
): Promise<void> => {
  requiredConfig(['apiUrl']);
  const subjLabel = isRule ? 'rule' : 'modifier';

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Reading the ${subjLabel} from ${dataPath}`;

  const modifierData = await readJsonFromFile<ModifierValues | RuleValues>(
    dataPath
  );

  spinner.text = `Uploading ${dataPath}`;

  const itemUri = itemKey ? `/${itemId}` : '';

  const { data } = await axios.post<ApiSuccessResponse>(
    `${getConfig('apiUrl')}/api/${subjLabel}/${facilityId}${itemUri}/${key}`,
    {
      ...modifierData,
      descriptor: key
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
      `Something went wrong during the adding of the ${subjLabel}`
    );
  }

  green(
    `The ${subjLabel} of the facility ${facilityId} has been added successfully`
  );
};

export const removeModifierOrRule = async (
  facilityId: string,
  itemKey: FacilitySubLevels | undefined,
  itemId: string | undefined,
  key: ModifierKey | RuleKey,
  spinner: Ora,
  isRule = false
): Promise<void> => {
  requiredConfig(['apiUrl']);
  const subjLabel = isRule ? 'rule' : 'modifier';

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Removing of the ${subjLabel}: ${facilityId}...`;

  const itemUri = itemKey ? `/${itemId}` : '';

  const { data } = await axios.delete<ApiSuccessResponse>(
    `${getConfig('apiUrl')}/api/${subjLabel}/${facilityId}${itemUri}/${key}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  if (!data.success) {
    throw new Error(
      `Something went wrong during removal of the ${subjLabel}`
    );
  }

  green(
    `The ${subjLabel} of the facility ${facilityId} has been removed successfully`
  );
};
