import { writeFileSync } from 'fs';
import path from 'path';
import {
  Exception,
  ItemType,
  Space,
  SpaceTier
} from '@windingtree/stays-models/dist/cjs/proto/facility';
import { ContactType } from '@windingtree/stays-models/dist/cjs/proto/contact';
import { Photo } from '@windingtree/stays-models/dist/cjs/proto/photo';
import { Condition, LOSRateModifier, Rates } from '@windingtree/stays-models/dist/cjs/proto/lpms';

interface SpaceInterface {
  name: string;
  description: string;
  photos: Photo[];
  type: ItemType;
  payload: Space;
}

const profileFileName = path.resolve(
  process.cwd(),
  'temp/0x7ccd15bc59ef5d782fed4ad73c84acd2f5e383f318333e5c5da336bf27066359.json'
);

const rateFileName = path.resolve(
  process.cwd(),
  'temp/rateSpace.json'
);

const modifierFileName = path.resolve(
  process.cwd(),
  'temp/modifierSpace.json'
);

export const spaceMetadata: SpaceInterface = {
  name: 'Mountain view room',
  description: 'Panoramic views of Ushba',
  photos: [
    {
      uri: '/image1.jpg',
      description: 'Chic guesthouse'
    }
  ],
  type: ItemType.SPACE,
  payload: {
    uris: [
      {
        uri: 'https://wonderland.somewhere/',
        typeOneof: { oneofKind: 'type', type: ContactType.WORK }
      }
    ],
    maxNumberOfAdultOccupantsOneof: {
      oneofKind: 'maxNumberOfAdultOccupants',
      maxNumberOfAdultOccupants: 2
    },
    maxNumberOfChildOccupantsOneof: {
      oneofKind: 'maxNumberOfChildOccupants',
      maxNumberOfChildOccupants: 2
    },
    maxNumberOfOccupantsOneof: {
      oneofKind: 'maxNumberOfOccupants',
      maxNumberOfOccupants: 2
    },
    privateHomeOneof: { oneofKind: 'privateHome', privateHome: false },
    suiteOneof: { oneofKind: 'suite', suite: false },
    tierOneof: { oneofKind: 'tier', tier: SpaceTier.DEFAULT_STANDARD },
    views: {
      viewOfValleyOneof: { oneofKind: 'viewOfValley', viewOfValley: true },
      viewOfBeachOneof: { oneofKind: 'viewOfBeach', viewOfBeach: false },
      viewOfCityOneof: { oneofKind: 'viewOfCity', viewOfCity: false },
      viewOfGardenOneof: { oneofKind: 'viewOfGarden', viewOfGarden: false },
      viewOfLakeOneof: { oneofKind: 'viewOfLake', viewOfLake: false },
      viewOfLandmarkOneof: {
        oneofKind: 'viewOfLandmark',
        viewOfLandmark: false
      },
      viewOfOceanOneof: { oneofKind: 'viewOfOcean', viewOfOcean: false },
      viewOfPoolOneof: { oneofKind: 'viewOfPool', viewOfPool: false }
    },
    totalLivingAreas: {
      sleeping: {
        numberOfBedsOneof: { oneofKind: 'numberOfBeds', numberOfBeds: 1 },
        kingBedsOneof: { oneofKind: 'kingBeds', kingBeds: 1 },
        queenBedsOneof: {
          oneofKind: 'queenBedsException',
          queenBedsException: Exception.UNSPECIFIED_REASON
        },
        doubleBedsOneof: {
          oneofKind: 'doubleBedsException',
          doubleBedsException: Exception.UNSPECIFIED_REASON
        },
        singleOrTwinBedsOneof: {
          oneofKind: 'singleOrTwinBedsException',
          singleOrTwinBedsException: Exception.UNSPECIFIED_REASON
        },
        bunkBedsOneof: {
          oneofKind: 'bunkBedsException',
          bunkBedsException: Exception.UNSPECIFIED_REASON
        },
        sofaBedsOneof: {
          oneofKind: 'sofaBedsException',
          sofaBedsException: Exception.UNSPECIFIED_REASON
        },
        otherBedsOneof: { oneofKind: 'otherBeds', otherBeds: 0 },
        cribsOneof: { oneofKind: 'cribs', cribs: false },
        cribsAvailableOneof: {
          oneofKind: 'cribsAvailableException',
          cribsAvailableException: Exception.UNSPECIFIED_REASON
        },
        cribCountOneof: {
          oneofKind: 'cribCountException',
          cribCountException: Exception.UNSPECIFIED_REASON
        },
        rollAwayBedsOneof: { oneofKind: 'rollAwayBeds', rollAwayBeds: false },
        rollAwayBedsAvailableOneof: {
          oneofKind: 'rollAwayBedsAvailableException',
          rollAwayBedsAvailableException: Exception.UNSPECIFIED_REASON
        },
        rollAwayBedCountOneof: {
          oneofKind: 'rollAwayBedCountException',
          rollAwayBedCountException: Exception.UNSPECIFIED_REASON
        }
      },
      features: {
        inSpaceWifiAvailableOneof: {
          oneofKind: 'inSpaceWifiAvailable',
          inSpaceWifiAvailable: true
        }
      }
    }
  }
};

const rate: Rates = {
  cost: 100
};

const modifier: LOSRateModifier = {
  condition: Condition.GTE,
  los: 2,
  valueOneof: {
    oneofKind: 'fixed',
    fixed: 110
  }
};

const main = async () => {
  const fileSource = JSON.stringify(spaceMetadata);
  writeFileSync(profileFileName, fileSource);

  const rateSource = JSON.stringify(rate);
  writeFileSync(rateFileName, rateSource);

  const modifierSource = JSON.stringify(modifier);
  writeFileSync(modifierFileName, modifierSource);
};

main()
  .catch(console.log)
  .finally(() => {
    console.log(`The space profile is saved by path: ${profileFileName}`);
  });
