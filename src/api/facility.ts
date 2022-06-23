import type {
  Facility
} from '@windingtree/stays-models/dist/cjs/proto/facility';
import type {
  ActionController
} from '../types';
import { promises as fs } from 'fs';
import ora, { Ora } from 'ora';
import axios from 'axios';
import { getConfig, requiredConfig } from './config';
import { getAuthHeader } from './login';
import { green, printObject } from '../utils/print';
import { saveToFile } from '../utils/files';

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
  let metadata: undefined | Facility;

  spinner.start();
  spinner.text = `Reading the metadata from ${metadataPath}`;

  try {
    const fileBuffer = await fs.readFile(metadataPath);
    metadata = JSON.parse(fileBuffer.toString()) as Facility;
  } catch (e) {
    throw new Error(`Unable to read metadata from file`);
  }

  spinner.text = `Uploading ${metadataPath}`;

  const { data } = await axios.post(
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

  const { data } = await axios.post(
    `${getConfig(
      'apiUrl'
    )}/api/facility/${facilityId}/${
      operationKind ? 'activate-service' : 'deactivate-service'
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

  const { data } = await axios.delete(
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
  { facilityId, out, activate, deactivate, metadata, remove },
  program
) => {
  const spinner = ora('Running the facility management operation...');

  try {
    if (!facilityId) {
      throw new Error(
        'The facility Id must be provided with --facilityId option'
      );
    }

    if (!activate && !deactivate && !metadata && !remove) {
      // No options provided, so, just get the facility metadata from the server
      const data = await getMetadata(facilityId, spinner);

      if (out) {
        await saveToFile(out, data, spinner);
      }

      return;
    }

    if (metadata) {
      // save metadata of the facility
      await updateMetadata(facilityId, metadata, spinner);
    }

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

    if (remove) {
      await removeFacility(facilityId, spinner);
    }
  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
};
