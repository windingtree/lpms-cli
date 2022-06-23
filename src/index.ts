#!/usr/bin/env -S node --no-deprecation

import { Command } from 'commander';
import { red } from 'kleur';
import pack from '../package.json';
import { configController } from './api/config';
import { mnemonicController } from './api/mnemonic';
import { loginController } from './api/login';
import { walletController } from './api/wallet';
import { storageController } from './api/storage';
import { addressesController } from './api/addresses';
import { serviceProviderController } from './api/serviceProvider';
import { saltController } from './api/salt';
import { facilityController } from './api/facility';
import { spaceController } from './api/space';

const program = new Command();

program
  .name('lpms')
  .description('LPMS API CLI')
  .version(pack.version)
  .configureOutput({
    outputError: (str, write) => write(red(str))
  });

program
  .command('config')
  .description('Adds or removes configuration properties')
  .option('--get <property>', 'View a specific property value')
  .option('--add <property>', 'Specify a property to add')
  .option('--value <value>', 'Specify a property value to add')
  .option('--remove <property>', 'Specify a property to remove from config')
  .action(configController);

program
  .command('mnemonic')
  .description('Generates random 24 word mnemonic')
  .option('--save', 'Save generated mnemonic to config')
  .option(
    '--index <index>',
    'specifies the default account index. "0" by default'
  )
  .action(mnemonicController);

program
  .command('salt')
  .description('Returns a random salt string (bytes32)')
  .option('--save', 'Save generated salt to config')
  .action(saltController);

program
  .command('wallet')
  .description('Wallet account information')
  .option(
    '--index <index>',
    'specifies an account index to show. "0" by default'
  )
  .option('--keys', 'Export public and private keys of account by index')
  .action(walletController);

program
  .command('login')
  .description('Makes login with password')
  .option('--login <login>', 'Specify the login')
  .option('--password <password>', 'Specify the password')
  .action(loginController);

program
  .command('storage')
  .description('Uploads files to storage')
  .option('--file <path>', 'Specify a path to the file')
  .action(storageController);

program
  .command('addresses')
  .description('Returns addresses of service provider roles')
  .action(addressesController);

program
  .command('sp')
  .description('Service provider operations')
  .option(
    '--id',
    'returns a service provider Id based on salt and signer address'
  )
  .option('--salt <salt>', 'Specify a salt string')
  .option('--register', 'Initiate registration of service provider')
  .option(
    '--reset',
    'wipe saved information about the registered service provider'
  )
  .option('--gasPrice <value>', 'Gas price in wei')
  .action(serviceProviderController);

program
  .command('facility')
  .description('Operation with the facility')
  .option('--facilityId <value>', 'Specify the facility Id')
  .option('--out <path>', 'Path of the file to save')
  .option('--activate', 'Activates the facility')
  .option('--deactivate', 'Deactivates the facility')
  .option('--metadata <path>', 'Path to metadata file to add/update')
  .option('--remove', 'Remove the facility')
  .action(facilityController)

program
  .command('space')
  .description('Operations with a space')
  .option('--facilityId <value>', 'specifies the facility Id')
  .option('--spaceId <value>', 'Specify the space Id')
  .option('--out <path>', 'Path of the file to save')
  .option('--metadata <path>', 'Path to metadata file to add/update')
  .option(
    '--availability <type>',
    'specify availability-related type of operation'
  )
  .option('--numSpaces <value>', 'specifies number of available spaces')
  .option('--get', 'get operation modifier (when manage availability, etc)')
  .option(
    '--add',
    'add/update operation modifier (when manage availability, etc)'
  )
  .action(spaceController);

program.parse();
