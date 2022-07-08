import type { ActionController, ApiStubsResponse, PagingOptions } from '../types';
import axios from 'axios';
import ora, { Ora } from 'ora';
import { requiredConfig, getConfig } from './config';
import { green, printObject, red } from '../utils/print';
import { getAuthHeader } from './login';
import { saveToFile } from '../utils/files';

// router.get(
//   '/stub/:facilityId',
//   authMiddleware,
//   facilityController.getAllFacilityStubs
// );

// router.get(
//   '/stub/:facilityId/:date',
//   authMiddleware,
//   facilityController.getFacilityStubsByDate
// );

// router.get(
//   '/stub/:facilityId/:itemId/:date',
//   authMiddleware,
//   facilityItemController.getStubsByDate
// );

export const getAllFacilityOrItemStubs = async (
  facilityId: string,
  itemId: string | undefined,
  paginator: PagingOptions,
  date: string | undefined,
  spinner: Ora
): Promise<ApiStubsResponse> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Getting stubs of the facility: ${facilityId}...`;

  const itemUri = itemId ? `/${itemId}`: '';
  const dateUri = date ? `/${date}` : '';
  const query = `?index=${paginator.index || 0}&perPage=${paginator.perPage || 10}`;

  const { data } = await axios.get<ApiStubsResponse>(
    `${getConfig('apiUrl')}/api/stub/${facilityId}${itemUri}/${dateUri}${query}`,
    {
      headers: authHeader
    }
  );

  spinner.stop();

  green(
    `Facility ${facilityId} stubs from index ${paginator.index} (per page: ${paginator.perPage}):`
  );
  printObject(data);

  return data;
};

export const stubsController: ActionController = async (
  { facilityId, itemId, out, date, index, perPage },
  program
) => {
  const spinner = ora('Running the stubs management operation...').start();

  try {
    if (!facilityId) {
      throw new Error(
        'The facility Id must be provided with --facilityId option'
      );
    }

    const data = await getAllFacilityOrItemStubs(
      facilityId,
      itemId,
      {
        index: index || 0,
        perPage: perPage || 10
      },
      date,
      spinner
    );

    if (out) {
      await saveToFile(out, data, spinner);
    }

  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
};
