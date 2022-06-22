import type { ActionController } from '../types';
import { createReadStream } from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import ora from 'ora';
import { requiredConfig, getConfig } from './config';
import { green, red } from '../utils/print';
import { getAuthHeader } from './login';

export const storageController: ActionController = async (
  { file },
  program
) => {
  const spinner = ora('Authenticating').start();

  try {
    requiredConfig(['apiUrl']);

    if (!file) {
      throw new Error('--file option must be provided');
    }

    const authHeader = await getAuthHeader();

    const filePath = file as string;
    const form = new FormData();
    form.append('file', createReadStream(filePath));
    const formHeaders = form.getHeaders();

    spinner.text = `Uploading ${filePath}`;

    const response = await axios.post(
      `${getConfig('apiUrl')}/api/storage/file`,
      form,
      {
        headers: {
          ...authHeader,
          ...formHeaders
        }
      }
    );

    spinner.stop();

    if (response.status === 200) {
      green(
        `${filePath} has been uploaded successfully. Storage Id (URI): ${response.data[0]}`
      );
      return;
    }

    red(
      `Something went wrong. Server responded with status: ${response.status}`
    );
  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
};
