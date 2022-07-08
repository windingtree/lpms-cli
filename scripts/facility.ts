import { writeFileSync } from 'fs';
import path from 'path';
import {
  Facility
} from '@windingtree/stays-models/dist/cjs/proto/facility';
import { ContactType } from '@windingtree/stays-models/dist/cjs/proto/contact';

const profileFileName = path.resolve(
  process.cwd(),
  '0x8991ad64938cc0ceecc328dd28107facab94f509d1bd54ff3cf4511164edf1c7.json'
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

const main = async () => {
  const fileSource = JSON.stringify(facilityMetadata);
  writeFileSync(profileFileName, fileSource);
};

main()
  .catch(console.log)
  .finally(() => {
    console.log(`The Facility profile is saved by path: ${profileFileName}`);
  });
