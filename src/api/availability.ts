import type {
  ApiSuccessResponse,
  Availability,
  AvailabilityKey
} from '../types';
import { Ora } from 'ora';
import axios from 'axios';
import { green, printObject } from '../utils/print';
import { getConfig, requiredConfig } from './config';
import { getAuthHeader } from './login';

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

export const removeAvailability = async (
  facilityId: string,
  spaceId: string,
  availability: AvailabilityKey,
  spinner: Ora
): Promise<void> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Removing of availability...`;

  const { data } = await axios.delete(
    `${getConfig(
      'apiUrl'
    )}/api/facility/${facilityId}/space/${spaceId}/availability/${availability}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  if (!data.success) {
    throw new Error('Something went wrong. Unable to remove availability');
  }

  green(`Availability of the space: ${spaceId} has been removed successfully`);
};
