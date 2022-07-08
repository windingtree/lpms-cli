import { Space } from '@windingtree/stays-models/dist/cjs/proto/facility';
import type {
  ActionController, ApiSuccessResponse, Availability, ModifierKey, RuleKey
} from '../types';
import { promises as fs } from 'fs';
import ora, { Ora } from 'ora';
import axios from 'axios';
import { green, printObject } from '../utils/print';
import { getConfig, requiredConfig } from './config';
import { getAuthHeader } from './login';
import { readJsonFromFile, saveToFile } from '../utils/files';
import {
  getAvailability,
  addAvailability,
  removeAvailability
} from './availability';
import {
  getModifierOrRule,
  addModifierOrRule,
  removeModifierOrRule
} from './modifierOrRule';

export const getMetadata = async (
  facilityId: string,
  itemId: string,
  spinner: Ora
): Promise<Space> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text =
    `Getting the metadata of the item ${itemId} of the facility: ${facilityId}...`

  const { data } = await axios.get(
    `${getConfig('apiUrl')}/api/facility/${facilityId}/spaces/${itemId}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  green(`Space ${facilityId} metadata:`);
  printObject(data);

  return data as Space;
};

export const updateMetadata = async (
  facilityId: string,
  itemId: string,
  metadataPath: string,
  spinner: Ora
): Promise<void> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();
  let metadata: undefined | Space;

  spinner.start();
  spinner.text = `Reading the metadata from ${metadataPath}`;

  try {
    const fileBuffer = await fs.readFile(metadataPath);
    metadata = JSON.parse(fileBuffer.toString()) as Space;
  } catch (e) {
    throw new Error(`Unable to read metadata from file`);
  }

  spinner.text = `Uploading ${metadataPath}`;

  const { data } = await axios.post(
    `${getConfig('apiUrl')}/api/facility/${facilityId}/spaces/${itemId}`,
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
    `Metadata of the item ${itemId} of the facility ${facilityId} has been updated successfully`
  );
};

export const removeSpace = async (
  facilityId: string,
  itemId: string,
  spinner: Ora
): Promise<void> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Removing of the item ${itemId} of the facility: ${facilityId}...`

  const { data } = await axios.delete<ApiSuccessResponse>(
    `${getConfig('apiUrl')}/api/facility/${facilityId}/spaces/${itemId}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  if (!data.success) {
    throw new Error(
      `Something went wrong during removal of the item`
    );
  }

  green(
    `The space ${itemId} of the facility ${facilityId} has been removed successfully`
  );
};

export const itemController: ActionController = async (
  { facilityId, itemId, out, remove, metadata, modifier, rule, availability, data },
  program
) => {
  const spinner = ora('Running the item management operation...');

  try {
    if (!facilityId) {
      throw new Error(
        'The facility Id must be provided with --facilityId option'
      );
    }

    if (!itemId) {
      throw new Error('The space Id must be provided with --itemId option');
    }

    if (!metadata && !modifier && !rule && !availability) {
      // Just get and return the item metadata
      const data = await getMetadata(facilityId, itemId, spinner);

      if (out) {
        await saveToFile(out, data, spinner);
      }

      return;
    }

    if (remove) {

      if (!modifier && !rule) {
        await removeSpace(facilityId, itemId, spinner);
      } else if (modifier || rule) {
        await removeModifierOrRule(
          facilityId,
          'items',
          itemId,
          (modifier || rule) as ModifierKey | RuleKey,
          spinner,
          !!rule
        );
      }
      return;
    }

    if (metadata) {
      // Adding/updating of the item metadata
      await updateMetadata(facilityId, itemId, metadata, spinner);
    }

    if (availability) {

      if (remove) {
        await removeAvailability(facilityId, itemId, availability, spinner);
        return;
      }

      if (!data) {
        await getAvailability(
          facilityId,
          itemId,
          availability,
          spinner
        );
      } else {
        const availabilityData = await readJsonFromFile<Availability>(data);

        await addAvailability(
          facilityId,
          itemId,
          availability,
          availabilityData,
          spinner
        );
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
          'items',
          itemId,
          (modifier || rule) as ModifierKey | RuleKey,
          spinner,
          !!rule
        );
      } else {
        await addModifierOrRule(
          facilityId,
          'items',
          itemId,
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
