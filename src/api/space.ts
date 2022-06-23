import { Space } from '@windingtree/stays-models/dist/cjs/proto/facility';
import type {
  ActionController,
  ApiSuccessResponse,
  AvailabilityKey
} from '../types';
import { promises as fs } from 'fs';
import ora, { Ora } from 'ora';
import { DateTime } from 'luxon';
import axios from 'axios';
import { green, printObject, yellow } from '../utils/print';
import { getConfig, requiredConfig } from './config';
import { getAuthHeader } from './login';
import { saveToFile } from '../utils/files';

export interface Availability {
  numSpaces: number;
}

export const getMetadata = async (
  facilityId: string,
  spaceId: string,
  spinner: Ora
): Promise<Space> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text =
    `Getting the metadata of the space ${spaceId} of the facility: ${facilityId}...`

  const { data } = await axios.get(
    `${getConfig('apiUrl')}/api/facility/${facilityId}/spaces/${spaceId}`,
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
  spaceId: string,
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
    `${getConfig('apiUrl')}/api/facility/${facilityId}/spaces/${spaceId}`,
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
    `Metadata of the space ${spaceId} of the facility ${facilityId} has been updated successfully`
  );
};

export const getAvailability = async (
  facilityId: string,
  spaceId: string,
  availability: AvailabilityKey,
  spinner: Ora
): Promise<Availability> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Getting of availability...`;

  const { data } = await axios.get(
    `${getConfig(
      'apiUrl'
    )}/api/facility/${facilityId}/space/${spaceId}/availability/${availability}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  green(`Availability of the space ${spaceId}:`);
  printObject(data);

  return data;
};

export const addAvailability = async (
  facilityId: string,
  spaceId: string,
  availability: AvailabilityKey,
  availabilityData: Availability,
  spinner: Ora
): Promise<ApiSuccessResponse> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Adding of the availability...`;

  const { data } = await axios.post(
    `${getConfig(
      'apiUrl'
    )}/api/facility/${facilityId}/space/${spaceId}/availability${
      availability !== 'default' ? '/' + availability : ''
    }`,
    availabilityData,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  if (!data.success) {
    throw new Error('Something went wrong. Server returned failure result');
  }

  green(`Availability of the space: ${spaceId} is added successfully`);

  return data;
};

export const spaceController: ActionController = async (
  { facilityId, spaceId, out, metadata, availability, numSpaces, get, add },
  program
) => {
  const spinner = ora('Running the space management operation...');

  try {
    if (!facilityId) {
      throw new Error(
        'The facility Id must be provided with --facilityId option'
      );
    }

    if (!spaceId) {
      throw new Error('The space Id must be provided with --spaceId option');
    }

    if (!metadata && !availability) {
      // Just get and return the space metadata
      const data = await getMetadata(facilityId, spaceId, spinner);

      if (out) {
        await saveToFile(out, data, spinner);
      }

      return;
    }

    if (metadata) {
      // Adding/updating of the space metadata
      await updateMetadata(facilityId, spaceId, metadata, spinner);
    }

    if (!get && !add) {
      throw new Error(
        'Operation type modifier must be provided with --get or --add options'
      );
    }

    if (availability) {

      if (get && add) {
        throw new Error('You cannot use --get and --add options together');
      }

      if (
        availability !== 'default' &&
        !DateTime.fromSQL(availability as string).isValid
      ) {
        throw new Error(
          'Invalid availability format. Must be either "default" or "yyyy-MM-DD"'
        );
      }

      if (get) {
        await getAvailability(
          facilityId,
          spaceId,
          availability,
          spinner
        );
        return;
      }

      if (add) {
        if (numSpaces === undefined) {
          throw new Error(
            'The number of available spaces must be provided with "--numSpaces" option'
          );
        }

        if (isNaN(numSpaces)) {
          throw new Error('Invalid --numSpaces value');
        }

        await addAvailability(
          facilityId,
          spaceId,
          availability,
          {
            numSpaces
          },
          spinner
        );
        return;
      }
    } else {
      throw new Error(
        'Operation type is required. You can specify operation type using one of options: --availability'
      );
    }
  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
};
