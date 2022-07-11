import type { ActionController } from '../types';
import { utils } from 'ethers';
import { green } from '../utils/print';

export const generateRandomSalt = (): string =>
  utils.keccak256(utils.randomBytes(32));

export const saltController: ActionController = async (_, program) => {
  try {
    const salt = generateRandomSalt();
    green(`Random salt string: ${salt}`);
  } catch (error) {
    program.error(error, { exitCode: 1 });
  }
};
