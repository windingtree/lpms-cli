import { writeFileSync } from 'fs';
import path from 'path';
import {
  Facility
} from '@windingtree/stays-models/dist/cjs/proto/facility';
import { ContactType } from '@windingtree/stays-models/dist/cjs/proto/contact';
import { Condition, LOSRateModifier, NoticeRequiredRule } from '@windingtree/stays-models/dist/cjs/proto/lpms';

const profileFileName = path.resolve(
  process.cwd(),
  'temp/0xaf2834d4bbf6d988986e1e3d32140bd9f19ef389562f62eeb1568d42f8afd902.json'
);

const modifierFileName = path.resolve(
  process.cwd(),
  'temp/modifierFacility.json'
);

const ruleFileName = path.resolve(
  process.cwd(),
  'temp/ruleFacility.json'
);

const facilityMetadata: Facility = {
  name: 'Awesome ski chalet',
  description: 'Some chalet in the best place of all! 🏔️',
  location: {
    latitude: 43.04246,
    longitude: 42.71865
  },
  policies: {
    currencyCode: 'xDAI',
    checkInTimeOneof: { oneofKind: 'checkInTime', checkInTime: '1500' },
    checkOutTimeOneof: { oneofKind: 'checkOutTime', checkOutTime: '1000' },
    timezone: 'Asia/Tbilisi'
  },
  photos: [
    { uri: '/image1.jpg', description: 'Chic guesthouse' },
    { uri: '/image2.jpg', description: 'Winter Wonderland' }
  ],
  uris: [
    {
      uri: 'https://wonderland.somewhere/',
      typeOneof: { oneofKind: 'type', type: ContactType.WORK }
    }
  ],
  emails: [
    {
      email: 'example@example.com',
      typeOneof: { oneofKind: 'type', type: ContactType.WORK }
    }
  ],
  phones: [
    {
      number: '0123456789',
      typeOneof: { oneofKind: 'type', type: ContactType.WORK }
    }
  ],
  connectivity: {
    wifiAvailableOneof: { oneofKind: 'wifiAvailable', wifiAvailable: true },
    wifiForFreeOneof: { oneofKind: 'wifiForFree', wifiForFree: true }
  }
};

const modifier: LOSRateModifier = {
  condition: Condition.GTE,
  los: 2,
  valueOneof: {
    oneofKind: 'fixed',
    fixed: 110
  }
};

const rule: NoticeRequiredRule = {
  value: 60 * 60
};

const main = async () => {
  const fileSource = JSON.stringify(facilityMetadata);
  writeFileSync(profileFileName, fileSource);

  const ruleSource = JSON.stringify(rule);
  writeFileSync(ruleFileName, ruleSource);

  const modifierSource = JSON.stringify(modifier);
  writeFileSync(modifierFileName, modifierSource);
};

main()
  .catch(console.log)
  .finally(() => {
    console.log(`The Facility profile is saved by path: ${profileFileName}`);
  });
