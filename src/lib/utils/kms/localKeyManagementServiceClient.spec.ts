import {describe, expect, test} from '@jest/globals';
import { LocalKeyManagementServiceClient } from './localKeyManagementServiceClient';

describe('LocalKeyManagementServiceClient', () => {
  test("passes its own test", async () => {
    console.log = jest.fn();

    const instance = new LocalKeyManagementServiceClient();

    await expect(instance.testLocalKeyManagementServiceClient()).resolves.not.toThrow;
  });
});
