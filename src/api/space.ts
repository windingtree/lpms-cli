import type { ActionController, ApiSuccessResponse, AvailabilityKey } from '../types';
import nodeUtils from 'node:util';
import ora from 'ora';
import { DateTime } from 'luxon';
import axios from 'axios';
import { green, yellow } from '../utils/print';
import { getConfig, requiredConfig } from './config';
import { getAuthHeader } from './login';

export interface Availability {
  numSpaces: number;
}

export const getAvailability = async (
  facilityId: string,
  spaceId: string,
  availability: AvailabilityKey
): Promise<Availability> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  const { data } = await axios.get(
    `${getConfig('apiUrl')}/api/facility/${facilityId}/space/${spaceId}/availability/${availability}`,
    {
      headers: authHeader
    }
  );

  return data;
};

export const addAvailability = async (
  facilityId: string,
  spaceId: string,
  availability: AvailabilityKey,
  availabilityData: Availability
): Promise<ApiSuccessResponse> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  const { data } = await axios.post(
    `${getConfig('apiUrl')}/api/facility/${facilityId}/space/${spaceId}/availability${availability !== 'default' ? '/' + availability : ''}`,
    availabilityData,
    {
      headers: authHeader
    }
  );

  return data;
};

export const spaceController: ActionController = async (
  { facilityId, spaceId, get, add, availability, numSpaces },
  program
) => {
  const spinner = ora('Running the space operation...');

  try {
    if (!facilityId) {
      throw new Error('The facility Id must be provided with --facilityId option');
    }

    if (!spaceId) {
      throw new Error('The space Id must be provided with --spaceId option');
    }

    if (!get && !add) {
      throw new Error(
        'Operation type modifier must be provided with --get or --add options'
      );
    }

    if (get && add) {
      throw new Error(
        'You cannot use --get and --add options together'
      );
    }

    if (availability) {

      if (availability !== 'default' && !DateTime.fromSQL(availability as string).isValid) {
        throw new Error(
          'Invalid availability format. Must be either "default" or "yyyy-MM-DD"'
        );
      }

      spinner.start();

      if (get) {
        const availabilityData = await getAvailability(
          facilityId,
          spaceId,
          availability
        );
        spinner.stop();

        green(`Availability of the space ${spaceId}:`);
        console.log(nodeUtils.inspect(availabilityData, { colors:true }));
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

        const { success } = await addAvailability(
          facilityId,
          spaceId,
          availability,
          {
            numSpaces
          }
        );
        spinner.stop();

        if (!success) {
          yellow('Something went wrong. Server returned failure result');
          return;
        }

        green(`Availability of the space: ${spaceId} is added successfully`);
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
