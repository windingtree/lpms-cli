import type {
  Facility
} from '@windingtree/stays-models/dist/cjs/proto/facility';
import type {
  ActionController,
  ApiSuccessResponse,
  ModifierKey,
  RuleKey
} from '../types';
import ora, { Ora } from 'ora';
import axios from 'axios';
import { getConfig, requiredConfig } from './config';
import { getAuthHeader } from './login';
import { green, printObject } from '../utils/print';
import { readJsonFromFile, saveToFile } from '../utils/files';
import {
  getModifierOrRule,
  addModifierOrRule,
  removeModifierOrRule
} from './modifierOrRule';

export const getMetadata = async (
  facilityId: string,
  spinner: Ora
): Promise<Facility> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Getting the metadata of the facility: ${facilityId}...`

  const { data } = await axios.get(
    `${getConfig('apiUrl')}/api/facility/${facilityId}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  green(`Facility ${facilityId} metadata:`);
  printObject(data);

  return data as Facility;
};

export const updateMetadata = async (
  facilityId: string,
  metadataPath: string,
  spinner: Ora
): Promise<void> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Reading the metadata from ${metadataPath}`;

  const metadata = await readJsonFromFile<Facility>(metadataPath);

  spinner.text = `Uploading ${metadataPath}`;

  const { data } = await axios.post<ApiSuccessResponse>(
    `${getConfig('apiUrl')}/api/facility/${facilityId}`,
    metadata,
    {
      headers: {
        ...authHeader
      }
    }
  );

  spinner.stop();

  if (!data.success) {
    throw new Error(`Something went wrong during the update of the metadata`);
  }

  green(
    `Metadata of the facility ${facilityId} has been updated successfully`
  );
};

export const toggleFacility = async (
  facilityId: string,
  operationKind: boolean,
  spinner: Ora
): Promise<void> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `${
    operationKind ? 'Activating' : 'Deactivating'
  } the facility: ${facilityId}`;

  const { data } = await axios.post<ApiSuccessResponse>(
    `${getConfig(
      'apiUrl'
    )}/api/facility/${facilityId}/${
      operationKind ? 'activate' : 'deactivate'
    }`,
    undefined,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  if (!data.success) {
    throw new Error(
      `Something went wrong during toggling state of the facility`
    );
  }

  green(
    `The facility: ${facilityId} has been ${
      operationKind ? 'activated' : 'deactivated'
    } successfully`
  );
};

export const removeFacility = async (
  facilityId: string,
  spinner: Ora
): Promise<void> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Removing of the facility: ${facilityId}...`

  const { data } = await axios.delete<ApiSuccessResponse>(
    `${getConfig('apiUrl')}/api/facility/${facilityId}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  if (!data.success) {
    throw new Error(
      `Something went wrong during removal of the facility`
    );
  }

  green(
    `The facility ${facilityId} has been removed successfully`
  );
};

export const facilityController: ActionController = async (
  { facilityId, out, remove, activate, deactivate, metadata, modifier, rule, data },
  program
) => {
  const spinner = ora('Running the facility management operation...');

  try {
    if (!facilityId) {
      throw new Error(
        'The facility Id must be provided with --facilityId option'
      );
    }

    if (!activate && !deactivate && !metadata && !modifier && !rule && !remove) {
      // No options provided, so, just get the facility metadata from the server
      const data = await getMetadata(facilityId, spinner);

      if (out) {
        await saveToFile(out, data, spinner);
      }

      return;
    }

    if (remove) {

      if (!modifier && !rule) {
        await removeFacility(facilityId, spinner);
      } else if (modifier || rule) {
        await removeModifierOrRule(
          facilityId,
          undefined,
          undefined,
          (modifier || rule) as ModifierKey | RuleKey,
          spinner,
          !!rule
        );
      }
      return;
    }

    if (metadata) {
      // save metadata of the facility
      await updateMetadata(facilityId, metadata, spinner);
      return;
    }

    if (activate || deactivate) {

      if (activate && deactivate) {
        throw new Error(
          'You cannot use --activate and --deactivate options together'
        );
      }

      // Toggling of the active status of the facility
      if (activate) {
        await toggleFacility(facilityId, true, spinner);
      } else if (deactivate) {
        await toggleFacility(facilityId, false, spinner);
      }

      return;
    }

    if (modifier || rule) {

      if (modifier && rule) {
        throw new Error(
          'You cannot use --modifier and --rule options together'
        );
      }

      if (!data) {
        // Just getting of the modifier or rule
        await getModifierOrRule(
          facilityId,
          undefined,
          undefined,
          (modifier || rule) as ModifierKey | RuleKey,
          spinner,
          !!rule
        );
      } else {
        await addModifierOrRule(
          facilityId,
          undefined,
          undefined,
          (modifier || rule) as ModifierKey | RuleKey,
          data,
          spinner,
          !!rule
        );
      }

      return;
    }
  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
};
