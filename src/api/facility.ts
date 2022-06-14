import type {
  ActionController,
  ApiSuccessResponse
} from '../types';
import ora from 'ora';
import axios from 'axios';
import { getConfig, requiredConfig } from './config';
import { getAuthHeader } from './login';
import { green } from '../utils/print';

export const toggleFacility = async (
  facilityId: string,
  operationKind: boolean
): Promise<ApiSuccessResponse> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

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

  return data;
};

export const facilityController: ActionController = async (
  { facilityId, activate, deactivate },
  program
) => {
  const spinner = ora('Running the facility operation...');

  try {
    if (!facilityId) {
      throw new Error(
        'The facility Id must be provided with --facilityId option'
      );
    }

    if (activate && deactivate) {
      throw new Error(
        'You cannot use --activate and --deactivate options together'
      );
    }

    if (activate) {
      spinner.start();
      spinner.text = `Activating the facility: ${facilityId}`
      await toggleFacility(facilityId, true);
      green(
        `The facility: ${facilityId} has been activated successfully`
      );
    } else if (deactivate) {
      spinner.start();
      spinner.text = `Deactivating the facility: ${facilityId}`
      await toggleFacility(facilityId, false);
      green(
        `The facility: ${facilityId} has been deactivated successfully`
      );
    }

    spinner.stop();
  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
};
