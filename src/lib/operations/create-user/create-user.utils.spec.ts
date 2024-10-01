import {describe, expect, test} from '@jest/globals';
import { CreateUserIdTokenData } from './create-user.handler';
import { IdTokenWithData } from '../../utils/auth/auth0.types';
import { B64UrlString } from '../../utils/arweave/arweaveUtils';
import { kmsClient } from "../../utils/kms/kmsClient";
import { createKeyRing, createSignKey, createEncryptDecryptKey, createImportJob } from './create-user.utils';

describe('create user utils', () => {

  const idToken: IdTokenWithData<CreateUserIdTokenData | undefined> = {
    __raw: "",
    authSystem: "KMS",
    sub: "<SUB>",
    owner: "<OWNER>" as B64UrlString,
    walletAddress: "<WALLET_ADDRESS>" as B64UrlString,
    data: undefined,
  };

  describe("return valid KMS entities from", () => {
    test("createKeyRing()", async () => {
      expect(await createKeyRing(idToken)).toMatchObject({});
    });

    test("createSignKey()", async () => {
      expect(await createSignKey(idToken)).toMatchObject({});
    });

    test("createEncryptDecryptKey()", async () => {
      expect(await createEncryptDecryptKey(idToken)).toMatchObject({});
    });

    test("createImportJob()", async () => {
      expect(await createImportJob(idToken)).toMatchObject({});
    });
  });

  describe("return [null] for non-existent entities", () => {
    beforeAll(() => {
      jest.spyOn(kmsClient, "createKeyRing").mockImplementation(async () => {
        const err = new Error("<MOCK ERROR MESSAGE>");

        (err as any).code = 6;

        throw err;
      });

      jest.spyOn(kmsClient, "createCryptoKey").mockImplementation(async () => {
        const err = new Error("<MOCK ERROR MESSAGE>");

        (err as any).code = 6;

        throw err;
      });

      jest.spyOn(kmsClient, "createImportJob").mockImplementation(async () => {
        const err = new Error("<MOCK ERROR MESSAGE>");

        (err as any).code = 6;

        throw err;
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    test("createKeyRing()", async () => {
      expect(await createKeyRing(idToken)).toBe(null);
    });

    test("createSignKey()", async () => {
      expect(await createSignKey(idToken)).toBe(null);
    });

    test("createEncryptDecryptKey()", async () => {
      expect(await createEncryptDecryptKey(idToken)).toBe(null);
    });

    test("createImportJob()", async () => {
      expect(await createImportJob(idToken)).toBe(null);
    });
  });

  describe("throw an error otherwise", () => {
    beforeAll(() => {
      jest.spyOn(kmsClient, "createKeyRing").mockImplementation(async () => {
        const err = new Error("<MOCK ERROR MESSAGE>");

        (err as any).code = 1;

        throw err;
      });

      jest.spyOn(kmsClient, "createCryptoKey").mockImplementation(async () => {
        const err = new Error("<MOCK ERROR MESSAGE>");

        (err as any).code = 1;

        throw err;
      });

      jest.spyOn(kmsClient, "createImportJob").mockImplementation(async () => {
        const err = new Error("<MOCK ERROR MESSAGE>");

        (err as any).code = 1;

        throw err;
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    test("createKeyRing()", async () => {
      await expect(createKeyRing(idToken)).rejects.toThrow("<MOCK ERROR MESSAGE>");
    });

    test("createSignKey()", async () => {
      await expect(createSignKey(idToken)).rejects.toThrow("<MOCK ERROR MESSAGE>");
    });

    test("createEncryptDecryptKey()", async () => {
      await expect(createEncryptDecryptKey(idToken)).rejects.toThrow("<MOCK ERROR MESSAGE>");
    });

    test("createImportJob()", async () => {
      await expect(createImportJob(idToken)).rejects.toThrow("<MOCK ERROR MESSAGE>");
    });
  });

});
