import type {
  ApiSuccessResponse,
  Availability,
  DefaultOrDateKey
} from '../types';
import { Ora } from 'ora';
import axios from 'axios';
import { green, printObject } from '../utils/print';
import { getConfig, requiredConfig } from './config';
import { getAuthHeader } from './login';

export const getAvailability = async (
  facilityId: string,
  itemId: string,
  availability: DefaultOrDateKey,
  spinner: Ora
): Promise<Availability> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Getting of availability...`;

  const { data } = await axios.get(
    `${getConfig(
      'apiUrl'
    )}/api/availability/${facilityId}/${itemId}/${availability}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  green(`Availability of the item ${itemId}:`);
  printObject(data);

  return data;
};

export const addAvailability = async (
  facilityId: string,
  itemId: string,
  availability: DefaultOrDateKey,
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
    )}/api/availability/${facilityId}/${itemId}/${
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

  green(`Availability of the item: ${itemId} is added successfully`);

  return data;
};

export const removeAvailability = async (
  facilityId: string,
  itemId: string,
  availability: DefaultOrDateKey,
  spinner: Ora
): Promise<void> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Removing of availability...`;

  const { data } = await axios.delete(
    `${getConfig(
      'apiUrl'
    )}/api/availability/${facilityId}/${itemId}/${availability}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  if (!data.success) {
    throw new Error('Something went wrong. Unable to remove availability');
  }

  green(`Availability of the item: ${itemId} has been removed successfully`);
};
