import type { ActionController } from '../types';
import axios from 'axios';
import ora from 'ora';
import { requiredConfig, getConfig } from './config';

// note: Role.ADMIN = 0 from solidity contract, hence start at index 1 here.
export enum Role {
  API = 1,
  BIDDER = 2,
  MANAGER = 3,
  STAFF = 4
}

export interface RoleAddress {
  id: number;
  role: Role;
  address: string;
}

export const getAddresses = async (): Promise<RoleAddress[]> => {
  requiredConfig(['apiUrl']);

  const { data } = await axios.get(`${getConfig('apiUrl')}/api/addresses`);

  return data;
};

export const addressesController: ActionController = async (_, program) => {
  const spinner = ora('Loading addresses').start();

  try {
    const addresses = await getAddresses();

    spinner.stop();

    console.table(
      addresses.reduce((acc, { id, ...x }) => {
        acc[id] = x;
        return acc;
      }, {})
    );
  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
};
