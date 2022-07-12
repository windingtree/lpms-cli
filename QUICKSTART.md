# The LPMS CLI process overview

## LPMS server setup

Clone and setup the `lpms-server` code from `git@github.com:windingtree/lpms-server.git`

```bash
clone git@github.com:windingtree/lpms-server.git ./<your-lpms-directory>
cd ./<your-directory>
git checkout develop
yarn
```

Create `.env.local` file in the root of `./<your-lpms-directory>` with the following content:

```
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
PORT=5000
APP_ACCESS_TOKEN_KEY=123
APP_REFRESH_TOKEN_KEY=456
APP_WALLET_PASSPHRASE=123
DEBUG_LPMS_SERVER=true
APP_PROMETHEUS_PORT=9100
PROMETHEUS_ENABLED=false
APP_NETWORK_PROVIDER=http://127.0.0.1:8545
APP_VERIFYING_CONTRACT=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
APP_LINE=stays
APP_VERSION=1
```

Start the server:

```bash
yarn dev
```

## Setup the CLI

Setup the CLI package from the npm repository

```bash
npm i -g @windingtree/lpms-cli
```

Clone and setup the CLI repository from `git@github.com:windingtree/lpms-cli.git`

```bash
git clone git@github.com:windingtree/lpms-cli.git ./<your-cli-directory>
cd ./<your-cli-directory>
yarn
```

## The CLI configuration

Add configuration variables required for local testing

```bash
lpms config --set apiUrl --value http://localhost:5000
lpms config --set providerUri --value http://127.0.0.1:8545
lpms config --set mnemonic --value "test test test test test test test test test test test junk"
lpms config --set lineRegistry --value 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

Login to the `lpms-server`

```bash
lpms login --login manager --password winwin
```

Get system address from the `lpms-server`

```bash
lpms addresses
```

> During the next step you have to add `api` address (index: 0) to the script. See below

## Setup smart contracts

Clone and setup the `stays-contracts` code from `git@github.com:windingtree/stays-contracts.git`

```bash
git clone git@github.com:windingtree/stays-contracts.git ./<your-stays-contracts>
cd ./<your-stays-contracts>
git checkout main
yarn
```

Update contracts deployment script `./deploy/001.ts` at the line `113`. You should add `api` address there. This address will be credited with 1 ETH (required for the possibility of transactions sending).

Setup smart contracts environment using `hardhat` node

```bash
yarn hardhat node
```

## Generate an example of the facility metadata

```bash
cd ./<your-cli-directory>
mkdir temp
npx ts-node ./scripts/facility.ts
```

> The facility metadata file will be generated in the `./temp` directory.

This script will create:

- `./temp/0xaf2834d4bbf6d988986e1e3d32140bd9f19ef389562f62eeb1568d42f8afd902.json`
- `./temp/ruleFacility.json`
- `./temp/modifierFacility.json`

## Register the facility

```bash
lpms register --line stays --salt 0xa47669298673f7d2c0d76cb399f902d2dddbe937040ecc40c550b2ed05da95ea
```

> The facility Id `0xaf2834d4bbf6d988986e1e3d32140bd9f19ef389562f62eeb1568d42f8afd902` is generated from the given `salt` and admin wallet address (index: 0). If you change the `salt` or use another `mnemonic` (in the CLI config) then your facility Id will be different.

## Add the facility metadata

```bash
lpms facility --facilityId 0xaf2834d4bbf6d988986e1e3d32140bd9f19ef389562f62eeb1568d42f8afd902 --data ./temp/0xaf2834d4bbf6d988986e1e3d32140bd9f19ef389562f62eeb1568d42f8afd902.json
```

## Add `rule` to the facility

```bash
lpms facility --facilityId 0xaf2834d4bbf6d988986e1e3d32140bd9f19ef389562f62eeb1568d42f8afd902 --rule notice_required --data ./temp/ruleFacility.json
```

## Add `modifier` to the facility

```bash
lpms facility --facilityId 0xaf2834d4bbf6d988986e1e3d32140bd9f19ef389562f62eeb1568d42f8afd902 --modifier length_of_stay --data ./temp/modifierFacility.json
```

## Generate an example of the item of the facility metadata

```bash
cd ./<your-cli-directory>
npx ts-node ./scripts/space.ts
```

> The item (space) metadata file will be generated in the `./temp` directory.

This script will create:

- `./temp/0x7ccd15bc59ef5d782fed4ad73c84acd2f5e383f318333e5c5da336bf27066359.json`
- `./temp/rateSpace.json`
- `./temp/modifierSpace.json`

## Add item (space) metadata to the facility

```bash
lpms item --facilityId 0xaf2834d4bbf6d988986e1e3d32140bd9f19ef389562f62eeb1568d42f8afd902 --itemId 0x7ccd15bc59ef5d782fed4ad73c84acd2f5e383f318333e5c5da336bf27066359 --itemType space --data ./temp/0x7ccd15bc59ef5d782fed4ad73c84acd2f5e383f318333e5c5da336bf27066359.json
```

## Add `rate` to the item (space)

```bash
lpms item --facilityId 0xaf2834d4bbf6d988986e1e3d32140bd9f19ef389562f62eeb1568d42f8afd902 --itemId 0x7ccd15bc59ef5d782fed4ad73c84acd2f5e383f318333e5c5da336bf27066359 --rate default --rateType items --data ./temp/rateSpace.json
```

## Add `modifier` to the item (space)

```bash
lpms item --facilityId 0xaf2834d4bbf6d988986e1e3d32140bd9f19ef389562f62eeb1568d42f8afd902  --itemId 0x7ccd15bc59ef5d782fed4ad73c84acd2f5e383f318333e5c5da336bf27066359 --modifier length_of_stay --data ./temp/modifierSpace.json
```
