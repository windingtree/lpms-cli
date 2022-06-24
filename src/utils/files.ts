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

export const readJsonFromFile = async <T>(path: string): Promise<T> => {
  try {
    const fileBuffer = await fs.readFile(path);
    return JSON.parse(fileBuffer.toString()) as T;
  } catch (_) {
    throw new Error(`Unable to read metadata from file`);
  }
};
