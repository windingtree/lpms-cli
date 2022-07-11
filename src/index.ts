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
import { itemController } from './api/item';
import { stubsController } from './api/stubs';

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
  .option('--set <property>', 'Specify a property to add')
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
  .command('register')
  .description('Registration of the service provider')
  .option('--line <value>', 'Unique business line Id')
  .option('--salt <value>', 'Specify a salt string')
  .option(
    '--id',
    'Returns the facility Id based on salt and signer address'
  )
  .option('--gasPrice <value>', 'Gas price in wei')
  .action(serviceProviderController);

program
  .command('facility')
  .description('Operation with the facility')
  .option('--facilityId <value>', 'Specify the facility Id')
  .option('--activate', 'Activates the facility')
  .option('--deactivate', 'Deactivates the facility')
  .option('--modifier <key>', 'Specify a modifier key')
  .option('--rule <key>', 'Specify a rule key')
  .option('--data <path>', 'Local path to a file with data to send')
  .option('--remove', 'Remove the facility')
  .option('--out <path>', 'Path of the file to save')
  .action(facilityController)

program
  .command('item')
  .description('Operations with a item')
  .option('--facilityId <value>', 'Specifies the facility Id')
  .option('--itemId <value>', 'Specify the item Id')
  .option(
    '--availability <type>',
    'specify availability-related type of operation'
  )
  .option('--rate <key>', 'Specify a rate key')
  .option('--modifier <key>', 'Specify a modifier key')
  .option('--rule <key>', 'Specify a rule key')
  .option('--item <itemId>', 'Specify an item Id')
  .option('--term <itemId>', 'Specify a term Id')
  .option('--data <path>', 'Local path to a file with data to add/update')
  .option('--out <path>', 'Path of the file to save')
  .action(itemController);

program
  .command('stub')
  .description('Operations with stubs')
  .option('--facilityId <value>', 'Specify the facility Id')
  .option('--itemId <value>', 'Specify the item Id')
  .option('--date', 'Specify the sub date')
  .action(stubsController)

program.parse();
