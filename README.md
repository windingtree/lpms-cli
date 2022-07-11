[![@windingtree/lpms-cli](https://img.shields.io/npm/v/@windingtree/lpms-cli.svg)](https://www.npmjs.com/package/@windingtree/lpms-cli)

# @windingtree/lpms-cli

Console utility for ease access to LPMS APIs

## Setup

```bash
yarn add @windingtree/lpms-cli
lpms
```

```
Usage: lpms [options] [command]

LPMS API CLI

Options:
  -V, --version       output the version number
  -h, --help          display help for command

Commands:
  config [options]    Adds or removes configuration properties
  mnemonic [options]  Generates random 24 word mnemonic
  salt                Returns a random salt string (bytes32)
  wallet [options]    Wallet account information
  login [options]     Makes login with password
  storage [options]   Uploads files to storage
  addresses           Returns addresses of service provider roles
  register [options]  Registration of the service provider
  facility [options]  Operation with the facility
  item [options]      Operations with a item
  stub [options]      Operations with stubs
  help [command]      display help for command
```

## Configuration

```bash
lpms config --set apiUrl --value http://localhost:5000
lpms config --set providerUri --value https://sokol.poa.network
lpms config --get providerUri
```

### Full list of config properties

- `apiUrl`: `lpms-server` API URI
- `providerUri`: Blockchain provider URI
- `mnemonic`: Wallet mnemonic. Can be generated and saved with the `mnemonic` command
- `defaultAccountIndex`: Default wallet account index. `0` by default
- `salt`: Unique salt string, Required for creation and registration of the service provider. Can be generated and saved with the `sale` command
- `metadataUri`: Storage Id (IPFS CID) of the signed metadata file of the service provider. Obtained with `storage --save --metadata` command
- `lineRegistry`: Address of the smart contract of the Service PRoviders Registry (`Videre` protocol)

## Login

```bash
lpms login --login manager --password winwin
```

```
"manager" user has been successfully logged in
```

## Wallet mnemonic generation

```bash
lpms mnemonic
lpms mnemonic --save
lpms mnemonic --save --index 0
```

- `--save` saves the mnemonic to the CLI config
- `--index` sets the default account index

```
history pudding dynamic dynamic staff village pupil prison nut father goose column lonely meadow effort aunt sure biology surround echo bachelor mechanic artwork void

Mnemonic has been successfully saved to the CLI config
```

## Wallet status information

```bash
lpms wallet
lpms wallet --index 1
lpms wallet --index 1 --keys
```

- `--index` specifies the idex of the account to display
- `--keys` export of the public and private keys

```
Account idex: 0
Wallet account: 0xcF76325B47a0edF0723DC4071A73C41B4FBc44eA (0.0 xDAI)
Public key: 0x048498a9f26844c54f88...e6b7a836bd25487ef1994bf291979e9dbc8
Private key: 0xa0d132baf98616634f19a368bc99e8e4bc6f4f140eefb31dc8b80096c0c24f8b
```

## Getting addresses of servers roles

```bash
lpms addresses
```

```
┌─────────┬───────────┬──────────────────────────────────────────────┐
│ (index) │   role    │                   address                    │
├─────────┼───────────┼──────────────────────────────────────────────┤
│    0    │   'api'   │ '0x8c27Aa036fE743162A09Cbb46bf6AA98C60c103d' │
│    1    │ 'bidder'  │ '0x2760e234062C4a04494DE11b1521C36f947DbdE8' │
│    2    │ 'manager' │ '0xE67297b5556728499392B2fF72c3596A43d42800' │
│    3    │  'staff'  │ '0x8e811c0D0969865D6Cb632Fb820f2275396D7AA6' │
└─────────┴───────────┴──────────────────────────────────────────────┘
```

## Uploading files to storage

```bash
lpms storage --file ./path/to/README.md
```

```
./README.md has been uploaded successfully. Storage Id: bafkreiddp6nksmdoe6rw7rakpwrr3yosh6hnzzkwrc2nuuiemk74aa3mqy
```

## Salt string generation

```bash
lpms salt
```

```
Random salt string: 0x18b6369b08e7e3b3776ba41653c39d7ec3f4806eeab047518d1c06479d178ec7
```

## Registration of the service provider

### Getting Id

```bash
lpms register --line stays --salt 0xa47669298673f7d2c0d76cb399f902d2dddbe937040ecc40c550b2ed05da95ea --id
```

### Registration

> `stays` must be initialized and registered

```bash
lpms register --line stays --salt 0xa47669298673f7d2c0d76cb399f902d2dddbe937040ecc40c550b2ed05da95ea
```

## Facility management

### Activation

```bash
lpms facility --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --activate
```

### Deactivation

```bash
lpms facility --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --deactivate
```

### Adding/updating the facility metadata

```bash
lpms facility --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --data ./path/to/metadata.json
```

### Getting of the facility metadata

```bash
lpms facility --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7
```

### Removal of the facility

```bash
lpms facility --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --remove
```

### Adding of modifiers to the facility

> Modifiers keys: `day_of_week`, `occupancy`, `length_of_stay`

```bash
lpms facility --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --modifier <key> --data ./path/to/modifier.json
```

### Getting of modifiers from the facility

```bash
lpms facility --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --modifier <key>
```

### Deleting of modifiers from the facility

```bash
lpms facility --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --modifier <key> --remove
```

### Adding of rules to the facility

> Rules keys: `notice_required`, `length_of_stay`

```bash
lpms facility --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --rule <key> --data ./path/to/rule.json
```

### Getting of rules from the facility

```bash
lpms facility --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --rule <key>
```

### Deleting of rules from the facility

```bash
lpms facility --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --rule <key> --remove
```

## Items management

### Adding/updating item metadata

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --metadata ./path/to/metadata.json
```

### Getting of the item metadata

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b
```

### Removal of the item

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --remove
```

### Getting availability (`default` or on `date`) of the item

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --availability default
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --availability 2022-07-11
```

### Adding availability to the item

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --availability default --data ./path/to/availability.json
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --availability 2022-07-11 --data ./path/to/availability.json
```

### Removal of availability from the item

> Note: you cannot remove the `default` kind of availability from the item. To change `default` availability you should just add it

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --availability 2022-07-11 --numSpaces 1 --remove
```

### Adding of modifiers to the facility

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --modifier <key> --data ./path/to/modifier.json
```

### Getting of modifiers from the item

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --modifier <key>
```

### Deleting of modifiers from the item

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --modifier <key> --remove
```

### Adding of rules to the item

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --rule <key> --data ./path/to/rule.json
```

### Getting of rules from the item

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --rule <key>
```

### Deleting of rules from the item

```bash
lpms item --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --rule <key> --remove
```

## Stubs

### Getting all stubs of the facility

```bash
lpms stub --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --index 0 --perPage 10
```

### Getting a stub of the facility by date

```bash
lpms stub --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7 --date 2022-08-12 --index 0 --perPage 10
```

### Getting a stub of the item of the facility

```bash
lpms stub --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7  --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --index 0 --perPage 10
```

### Getting a stub of the item of the facility by date

```bash
lpms stub --facilityId 0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7  --itemId 0x01e5404aa35dfe2b33fe4a714bfd301e0b5723dbbaf48454ee44b741b484900b --date 2022-08-12 --index 0 --perPage 10
```
