import { utils } from 'ethers';

// todo: upstream this to videre-sdk
export const genRole = (facilityId: string, role: number): string =>
  utils.keccak256(
    utils.defaultAbiCoder.encode(['bytes32', 'uint256'], [facilityId, role])
  );
