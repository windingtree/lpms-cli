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
): string => {
  const encoder = new utils.AbiCoder();
  return utils.solidityKeccak256(
    ['bytes'],
    [encoder.encode(['bytes32', 'address'], [salt, address])]
  );
};

export const getServiceProviderId = (
  contract: ServiceProviderRegistry,
  salt: string,
  metadataUri: string
): Promise<string> => contract.callStatic.enroll(salt, metadataUri);

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

export const registerServiceProvider = async (
  serviceProviderRegistryContract: ServiceProviderRegistry,
  lineRegistryContract: LineRegistry,
  salt: string,
  metadataUri: string,
  spinnerCallback: SpinnerCallback,
  options?: CallOverrides
): Promise<string> => {
  const addresses = await getAddresses();
  const addressesMap = addresses.reduce(
    (a, v) => ({
      ...a,
      [Number(v.id)]: v.address
    }),
    {}
  );

  const serviceProviderId = utils.keccak256(
    utils.defaultAbiCoder.encode(
      // Do **NOT** use solidityPack due to abi coder differences.
      ['bytes32', 'address'],
      [salt, await serviceProviderRegistryContract.signer.getAddress()]
    )
  );

  // spinnerCallback(`Granting ${addressesMap[Role.API]} the API role`);
  // const VIDERE_API_ROLE = genRole(serviceProviderId, Role.API);
  // if (!(await contract.hasRole(VIDERE_API_ROLE, addressesMap[Role.API - 1]))) {
  //   await contract.grantRole(VIDERE_API_ROLE, addressesMap[Role.API - 1], options)
  // }

  // spinnerCallback(`Granting ${addressesMap[Role.BIDDER]} the BIDDER role`);
  // const VIDERE_BIDDER_ROLE = genRole(serviceProviderId, Role.BIDDER);
  // if (!(await contract.hasRole(VIDERE_BIDDER_ROLE, addressesMap[Role.BIDDER - 1]))) {
  //   await contract.grantRole(VIDERE_BIDDER_ROLE, addressesMap[Role.BIDDER - 1], options)
  // }

  // spinnerCallback(`Granting ${addressesMap[Role.MANAGER]} the MANAGER role`);
  // const VIDERE_MANAGER_ROLE = genRole(serviceProviderId, Role.MANAGER);
  // if (!(await contract.hasRole(VIDERE_MANAGER_ROLE, addressesMap[Role.MANAGER - 1]))) {
  //   await contract.grantRole(VIDERE_MANAGER_ROLE, addressesMap[Role.MANAGER - 1], options)
  // }

  // spinnerCallback(`Granting ${addressesMap[Role.STAFF]} the STAFF role`);
  // const VIDERE_STAFF_ROLE = genRole(serviceProviderId, Role.STAFF);
  // if (!(await contract.hasRole(VIDERE_STAFF_ROLE, addressesMap[Role.STAFF - 1]))) {
  //   await contract.grantRole(VIDERE_STAFF_ROLE, addressesMap[Role.STAFF - 1], options)
  // }

  if (!await serviceProviderRegistryContract.exists(serviceProviderId)) {
    spinnerCallback('Registering of the service provider');

    // enroll the service provider in the ServiceProviderRegistry
    await serviceProviderRegistryContract.multicall(
      [
        // enroll
        ServiceProviderRegistry__factory.createInterface().encodeFunctionData(
          'enroll',
          [salt, metadataUri]
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
  }

  if(!await lineRegistryContract.can(utils.formatBytes32String('stays'), serviceProviderId)) {
    // Register (agree) to the terms in the LineRegistry
    await lineRegistryContract.register(utils.formatBytes32String('stays'), serviceProviderId)
  }

  return serviceProviderId;
};

export const updateServiceProvider = async (
  contract: ServiceProviderRegistry,
  serviceProviderId: string,
  metadataUri: string,
  spinnerCallback: SpinnerCallback,
  options?: CallOverrides
): Promise<void> => {
  spinnerCallback('Updating the dataURI of the service provider...');
  await contract['file(bytes32,bytes32,string)'](
    serviceProviderId,
    utils.formatBytes32String('dataURI'),
    metadataUri
  );
};

export const serviceProviderController: ActionController = async (
  { salt, id, meta, register, update, reset, gasPrice },
  program
) => {
  const spinner = ora('Registering of the service provider...');

  try {
    if (reset) {
      removeConfig('serviceProviderId');
      removeConfig('salt');
      removeConfig('metadataUri');
      yellow('Information about the service provider is wiped out');
      return;
    }

    requiredConfig(['defaultAccountIndex']);

    const wallet = getWalletByAccountIndex(
      getConfig('defaultAccountIndex') as number
    );
    const owner = await wallet.getAddress();
    const serviceProviderRegistryContract = getServiceProviderRegistryContract(wallet);
    const lineRegistryContract = getLineRegistryContract(wallet);

    if (!salt) {
      requiredConfig(['salt']);
      salt = getConfig('salt') as string;
    }

    if (id) {
      const localId = getServiceProviderIdLocal(salt, owner);
      green(`Service provider Id: ${localId}`);
      return;
    }

    if (!meta) {
      requiredConfig(['metadataUri']);
      meta = getConfig('metadataUri') as string;
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
        meta,
        (text) => {
          spinner.text = text;
        },
        txOptions
      );

      saveConfig('salt', salt);
      saveConfig('metadataUri', meta);
      saveConfig('serviceProviderId', serviceProviderId);

      spinner.stop();

      green(
        `Service provider with Id: ${serviceProviderId} has been registered successfully`
      );
    } else if (update) {
      requiredConfig(['serviceProviderId']);

      spinner.start();

      serviceProviderId = getConfig('serviceProviderId') as string;
      await updateServiceProvider(
        serviceProviderRegistryContract,
        serviceProviderId,
        meta,
        (text) => {
          spinner.text = text;
        },
        txOptions
      );

      saveConfig('metadataUri', meta);

      spinner.stop();

      green(
        `Service provider with Id: ${serviceProviderId} has been updated successfully`
      );
      green(`The new "dataURI" is: ${meta}`);
    } else {
      requiredConfig(['serviceProviderId']);
      serviceProviderId = getConfig('serviceProviderId') as string;
      salt = getConfig('salt') as string;
      meta = await serviceProviderRegistryContract.datastores(serviceProviderId);

      spinner.stop();

      green(`Service provider Id: ${serviceProviderId}`);
      green(`Unique salt string: ${salt}`);
      green(`Metadata storage Id: ${meta}`);
      green(`Owner address: ${owner}`);
    }
  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
};
