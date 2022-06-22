import type { ActionController, SpinnerCallback } from '../types';
import type { LineRegistry, ServiceProviderRegistry } from 'typechain/registries';
import { CallOverrides, utils, Wallet } from 'ethers';
import ora from 'ora';
import { LineRegistry__factory, ServiceProviderRegistry__factory } from '../../typechain/factories/registries';
import { getWalletByAccountIndex } from './wallet';
import { green, yellow } from '../utils/print';
import { getAddresses, Role } from './addresses';
import { getConfig, removeConfig, requiredConfig, saveConfig } from './config';
import { genRole } from '../utils/roles';

export const getServiceProviderIdLocal = (
  salt: string,
  address: string
): string => utils.keccak256(
  utils.defaultAbiCoder.encode(
    // Do **NOT** use solidityPack due to abi coder differences.
    ['bytes32', 'address'],
    [salt, address]
  )
);

export const getServiceProviderId = (
  contract: ServiceProviderRegistry,
  salt: string
): Promise<string> => contract.callStatic.enroll(salt);

export const getServiceProviderRegistryContract = (
  wallet: Wallet
): ServiceProviderRegistry => {
  requiredConfig(['serviceProviderRegistry']);
  return ServiceProviderRegistry__factory.connect(
    getConfig('serviceProviderRegistry') as string,
    wallet
  );
};

export const getLineRegistryContract = (
  wallet: Wallet
): LineRegistry => {
  requiredConfig(['lineRegistry']);
  return LineRegistry__factory.connect(
    getConfig('lineRegistry') as string,
    wallet
  )
}

export const getMappedAddresses = async (): Promise<Record<number, string>> => {
  const addresses = await getAddresses();
  return addresses.reduce(
    (a, v) => ({
      ...a,
      [Number(v.id)]: v.address
    }),
    {}
  );
};

export const registerServiceProvider = async (
  serviceProviderRegistryContract: ServiceProviderRegistry,
  lineRegistryContract: LineRegistry,
  salt: string,
  spinnerCallback: SpinnerCallback,
  options?: CallOverrides
): Promise<string> => {
  const addressesMap = await getMappedAddresses();

  const serviceProviderId = getServiceProviderIdLocal(
    salt,
    await serviceProviderRegistryContract.signer.getAddress()
  );

  if (!await serviceProviderRegistryContract.exists(serviceProviderId)) {
    spinnerCallback('Registering of the service provider');

    // enroll the service provider in the ServiceProviderRegistry
    const tx = await serviceProviderRegistryContract.multicall(
      [
        // enroll
        ServiceProviderRegistry__factory.createInterface().encodeFunctionData(
          'enroll',
          [salt]
        ),
        // api-role
        ServiceProviderRegistry__factory.createInterface().encodeFunctionData(
          'grantRole',
          [genRole(serviceProviderId, Role.API), addressesMap[Role.API - 1]]
        ),
        // bidder-role
        ServiceProviderRegistry__factory.createInterface().encodeFunctionData(
          'grantRole',
          [
            genRole(serviceProviderId, Role.BIDDER),
            addressesMap[Role.BIDDER - 1]
          ]
        ),
        // manager-role
        ServiceProviderRegistry__factory.createInterface().encodeFunctionData(
          'grantRole',
          [
            genRole(serviceProviderId, Role.MANAGER),
            addressesMap[Role.MANAGER - 1]
          ]
        ),
        // staff-role
        ServiceProviderRegistry__factory.createInterface().encodeFunctionData(
          'grantRole',
          [genRole(serviceProviderId, Role.STAFF), addressesMap[Role.STAFF - 1]]
        )
      ],
      options
    );

    // wait for confirmations
    await tx.wait(1);
  }

  if(!await lineRegistryContract.can(utils.formatBytes32String('stays'), serviceProviderId)) {
    // Register (agree) to the terms in the LineRegistry
    const tx = await lineRegistryContract.register(utils.formatBytes32String('stays'), serviceProviderId);

    // wait for confirmation
    await tx.wait(1);
  }

  return serviceProviderId;
};

export const serviceProviderController: ActionController = async (
  { salt, id, register, reset, gasPrice },
  program
) => {
  const spinner = ora('Registering of the service provider...');

  try {
    if (reset) {
      removeConfig('serviceProviderId');
      removeConfig('salt');
      yellow('Information about the service provider is wiped out');
      return;
    }

    requiredConfig(['defaultAccountIndex']);

    const wallet = getWalletByAccountIndex(
      getConfig('defaultAccountIndex') as number
    );
    const owner = await wallet.getAddress();
    const serviceProviderRegistryContract =
      getServiceProviderRegistryContract(wallet);
    const lineRegistryContract = getLineRegistryContract(wallet);

    if (!salt) {
      requiredConfig(['salt']);
      salt = getConfig('salt') as string;
    }

    if (id) {
      const localId = getServiceProviderIdLocal(
        salt,
        await serviceProviderRegistryContract.signer.getAddress()
      );
      green(`Service provider Id: ${localId}`);
      return;
    }

    let serviceProviderId: string;

    let txOptions: CallOverrides = {};

    if (gasPrice) {
      txOptions = {
        gasPrice: gasPrice
      };
    }

    if (register) {
      spinner.start();

      const serviceProviderId = await registerServiceProvider(
        serviceProviderRegistryContract,
        lineRegistryContract,
        salt,
        (text) => {
          spinner.text = text;
        },
        txOptions
      );

      saveConfig('salt', salt);
      saveConfig('serviceProviderId', serviceProviderId);

      spinner.stop();

      green(
        `Service provider with Id: ${serviceProviderId} has been registered successfully`
      );
    } else {
      requiredConfig(['serviceProviderId']);
      serviceProviderId = getConfig('serviceProviderId') as string;
      salt = getConfig('salt') as string;

      spinner.stop();

      green(`Service provider Id: ${serviceProviderId}`);
      green(`Unique salt string: ${salt}`);
      green(`Owner address: ${owner}`);
    }
  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
};
