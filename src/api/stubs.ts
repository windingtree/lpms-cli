import type { ActionController, ApiStubsResponse, PagingOptions } from '../types';
import axios from 'axios';
import ora, { Ora } from 'ora';
import { requiredConfig, getConfig } from './config';
import { green, printObject, red } from '../utils/print';
import { getAuthHeader } from './login';
import { saveToFile } from '../utils/files';

// router.get(
//   '/facility/:facilityId/stub/:date',
//   authMiddleware,
//   param('facilityId').custom((v) => validateBytes32StringRule(v)),
//   facilityController.getFacilityStubsByDate
// );

// router.get(
//   '/facility/:facilityId/space/:itemId/stub/:date',
//   authMiddleware,
//   param('facilityId').custom((v) => validateBytes32StringRule(v)),
//   facilityItemController.delItem
// );

export const getAllFacilityStubs = async (
  facilityId: string,
  spaceId: string | undefined,
  paginator: PagingOptions,
  date: string | undefined,
  spinner: Ora
): Promise<ApiStubsResponse> => {
  requiredConfig(['apiUrl']);

  const authHeader = await getAuthHeader();

  spinner.start();
  spinner.text = `Getting stubs of the facility: ${facilityId}...`;

  const spaceUri = spaceId ? `/spaces/${spaceId}`: '';
  const dateUri = date ? `/${date}` : '';
  const query = `?index=${paginator.index || 0}&perPage=${paginator.perPage || 10}`;

  const { data } = await axios.get<ApiStubsResponse>(
    `${getConfig('apiUrl')}/api/facility/${facilityId}${spaceUri}/stub${dateUri}${query}`,
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
  { facilityId, spaceId, out, date, index, perPage },
  program
) => {
  const spinner = ora('Running the stubs management operation...').start();

  try {
    if (!facilityId) {
      throw new Error(
        'The facility Id must be provided with --facilityId option'
      );
    }

    const data = await getAllFacilityStubs(
      facilityId,
      spaceId,
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
