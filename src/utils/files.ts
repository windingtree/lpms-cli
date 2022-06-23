import { promises as fs } from 'fs';
import { resolve } from 'path';
import { Ora } from 'ora';

export const saveToFile = async (
  filePath: string,
  data: unknown,
  spinner: Ora
): Promise<void> => {
  spinner.text = `Saving the ${filePath}`;
  spinner.start();

  const fullPath = resolve(process.cwd(), filePath);
  const fileData = (typeof data === 'object'
    ? JSON.stringify(data)
    : data) as string;
  await fs.writeFile(fullPath, fileData);

  spinner.stop();
};
