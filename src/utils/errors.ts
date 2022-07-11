import { Command } from 'commander';

export const onError = (program: Command, error: any): void => {
  const message = error?.response?.data?.message;
  program.error(message || error, { exitCode: 1 });
}
