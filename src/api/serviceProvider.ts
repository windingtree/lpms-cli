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

export interface SpRegistrationResponse {
  serviceProviderId: string;
  messages: string[];
}

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

export const getLineRegistryContract = (
  wallet: Wallet
): LineRegistry => {
  requiredConfig(['lineRegistry']);
  return LineRegistry__factory.connect(
    getConfig('lineRegistry') as string,
    wallet
  )
}

export const getServiceProviderRegistryContract = async (
  wallet: Wallet
): Promise<ServiceProviderRegistry> => {
  const lineRegistryContract = getLineRegistryContract(wallet);
  const spRegistryAddress = await lineRegistryContract.serviceProviderRegistry();
  return ServiceProviderRegistry__factory.connect(
    spRegistryAddress,
    wallet
  );
};

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
  line: string,
  salt: string,
  spinnerCallback: SpinnerCallback,
  options?: CallOverrides
): Promise<SpRegistrationResponse> => {
  const addressesMap = await getMappedAddresses();



  const serviceProviderId = getServiceProviderIdLocal(
    salt,
    await serviceProviderRegistryContract.signer.getAddress()
  );

  let grantRolesMulticallTx: string;

  if (!await serviceProviderRegistryContract.exists(serviceProviderId)) {
    spinnerCallback('Registering of the service provider');

    const sender = await serviceProviderRegistryContract.signer.getAddress();
    const isAuthorized = await serviceProviderRegistryContract.hasRole(
      utils.keccak256(utils.toUtf8Bytes('videre.roles.whitelist')),
      sender
    );

    if (!isAuthorized) {
      throw new Error(
        `Sender's address ${sender} has not whitelisted in the protocol and cannot register providers`
      );
    }

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

    grantRolesMulticallTx = tx.hash;

    await tx.wait();
  } else {
    throw new Error(
      `Service provider with id ${serviceProviderId} is already exists`
    );
  }

  let registerTx: string;

  const lineId = utils.formatBytes32String(line);
  if (!await lineRegistryContract.exists(lineId)) {
    throw new Error(
      `Line with id "${line}" does not exists`
    );
  }

  if(!await lineRegistryContract.can(lineId, serviceProviderId)) {
    // Register (agree) to the terms in the LineRegistry
    const tx = await lineRegistryContract.register(lineId, serviceProviderId);

    registerTx = tx.hash;

    // wait for confirmation
    await tx.wait();
  } else {
    throw new Error(
      `Service provider with id ${serviceProviderId} cannot be registered in ${line} line`
    );
  }

  return {
    serviceProviderId,
    messages: [
      `grantRole transaction: ${grantRolesMulticallTx}`,
      `Server addresses registered: [${Object.entries(addressesMap).map(v => v[1]).join(', ')}]`,
      `register transaction: ${registerTx}`
    ]
  };
};

export const serviceProviderController: ActionController = async (
  { line, salt, id, gasPrice },
  program
) => {
  const spinner = ora('Registering of the service provider...');

  try {
    requiredConfig(['defaultAccountIndex']);

    spinner.start();

    const wallet = getWalletByAccountIndex(
      getConfig('defaultAccountIndex') as number
    );
    const owner = await wallet.getAddress();
    const lineRegistryContract = getLineRegistryContract(wallet);
    const serviceProviderRegistryContract =
      await getServiceProviderRegistryContract(wallet);

    if (!line) {
      throw new Error(
        'Line id must be provided with the --line option'
      );
    }

    if (!salt) {
      throw new Error(
        'Unique bytes32 formatted salt string must be provided with the --salt option'
      );
    }

    if (id) {
      const localId = getServiceProviderIdLocal(
        salt,
        await serviceProviderRegistryContract.signer.getAddress()
      );

      spinner.stop();

      green(`Service provider Id: ${localId}`);
      green(`Unique salt string: ${salt}`);
      green(`Owner address: ${owner}`);
      return;
    }

    let txOptions: CallOverrides = {};

    if (gasPrice) {
      txOptions = {
        gasPrice: gasPrice
      };
    }

    const { serviceProviderId, messages } = await registerServiceProvider(
      serviceProviderRegistryContract,
      lineRegistryContract,
      line,
      salt,
      (text) => {
        spinner.text = text;
      },
      txOptions
    );

    spinner.stop();

    green('Service provider has been registered successfully.\n');
    green(messages.join('\n'));
    green(`Service provider Id: ${serviceProviderId}`);
    green(`Unique salt string: ${salt}`);
    green(`Owner address: ${owner}`);
  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
};
