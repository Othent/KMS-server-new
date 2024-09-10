import {describe, expect, test} from '@jest/globals';
import { encryptHandlerFactory, EncryptIdTokenData, EncryptResponseData, LegacyEncryptIdTokenData } from './encrypt.handler';
import httpMocks from "node-mocks-http";
import { ExpressRequestWithToken } from '../../utils/auth/auth0';
import { Route } from '../../server/server.constants';
import { B64String, B64UrlString, binaryDataTypeToString, stringToUint8Array, uint8ArrayTob64, uint8ArrayTob64Url } from '../../utils/arweave/arweaveUtils';
import { decrypt } from '../decrypt/decrypt';
import { LegacyBufferObject, LegacyBufferRecord, normalizeBufferData } from '../common.types';

type LegacyTokenDataFormat = "LegacyBufferObject" | "LegacyBufferRecord" | "string";

const LEGACY_TOKEN_DATA_FORMATS = ["LegacyBufferObject", "LegacyBufferRecord", "string"] as const satisfies LegacyTokenDataFormat[];

type TokenDataFormat = "B64String" | "B64UrlString";

const TOKEN_DATA_FORMATS = ["B64String", "B64UrlString"] as const satisfies TokenDataFormat[];


describe('encrypt handler', () => {
  const encryptHandler = encryptHandlerFactory();

  async function callEncryptHandlerWithToken(idTokenData: null | EncryptIdTokenData | LegacyEncryptIdTokenData) {
    const req = httpMocks.createRequest({}) satisfies ExpressRequestWithToken<EncryptIdTokenData | LegacyEncryptIdTokenData>;

    req.idToken = {
      sub: idTokenData ? "<SUB>" : undefined,
      data: idTokenData || undefined,
    } as any;

    const res = httpMocks.createResponse();

    await encryptHandler(req, res);

    return res._getData() as EncryptResponseData;
  }

  const SECRET = "My secret.";

  const getLegacyIdTokenData = (format: LegacyTokenDataFormat) => {
    let plaintext: LegacyBufferObject | LegacyBufferRecord | string = SECRET;

    if (format === "LegacyBufferObject") {
      plaintext = {
        type: "Buffer",
        data: Array.from(stringToUint8Array(SECRET)),
      };
    } else if (format === "LegacyBufferRecord") {
      plaintext = { ...Array.from(stringToUint8Array(SECRET)) };
    }

    return {
      keyName: "<KEYNAME>",
      plaintext,
    } satisfies LegacyEncryptIdTokenData;
  };


  const getIdTokenData = (format: TokenDataFormat) => {
    let plaintext: B64String | B64UrlString = "" as B64String;

    if (format === "B64String") {
      plaintext = uint8ArrayTob64(stringToUint8Array(SECRET));
    } else if (format === "B64UrlString") {
      plaintext = uint8ArrayTob64Url(stringToUint8Array(SECRET));
    }

    return {
      path: Route.ENCRYPT,
      plaintext,
    } satisfies EncryptIdTokenData;
  };

  describe('(legacy format)', () => {
    describe('validates the ID JWT token data', () => {
      test('has a sub', async () => {
        await expect(callEncryptHandlerWithToken(null)).rejects.toThrow();
      });

      test('has a keyName', async () => {
        await expect(callEncryptHandlerWithToken({
          ...getLegacyIdTokenData("string"),
          keyName: "",
        })).rejects.toThrow();
      });

      test('has data', async () => {
        await expect(callEncryptHandlerWithToken({
          ...getLegacyIdTokenData("string"),
          plaintext: "",
        })).rejects.toThrow();
      });
    });

    LEGACY_TOKEN_DATA_FORMATS.forEach((format) => {
      test(`accepts ${ format } and returns the right result`, async () => {
        const result = await callEncryptHandlerWithToken(getLegacyIdTokenData(format));

        expect(result.data).toEqual(
          expect.objectContaining({
            type: "Buffer",
            data: expect.any(Array),
          }),
        );

        const resultDataBuffer = normalizeBufferData(result.data);
        const decrypted = await decrypt({ sub: "<SUB>" } as any, resultDataBuffer);
        const decryptedText = binaryDataTypeToString(decrypted);

        expect(decryptedText).toEqual(SECRET);
      });
    });
  });

  describe('encrypt handler', () => {
    describe('(new format)', () => {
      describe('validates the ID JWT token data', () => {
        test('has a sub', async () => {
          await expect(callEncryptHandlerWithToken(null)).rejects.toThrow();
        });

        test('has a path', async () => {
          await expect(callEncryptHandlerWithToken({
            ...getIdTokenData("B64String"),
            path: "" as any,
          })).rejects.toThrow();
        });

        test('has data', async () => {
          await expect(callEncryptHandlerWithToken({
            ...getIdTokenData("B64String"),
            plaintext: "" as B64String,
          })).rejects.toThrow();
        });
      });

      TOKEN_DATA_FORMATS.forEach((format) => {
        test(`accepts ${ format } and returns the right result`, async () => {
          const result = await callEncryptHandlerWithToken(getIdTokenData(format));

          expect(result.data).toEqual(
            expect.objectContaining({
              type: "Buffer",
              data: expect.any(Array),
            }),
          );

          const resultDataBuffer = normalizeBufferData(result.data);
          const decrypted = await decrypt({ sub: "<SUB>" } as any, resultDataBuffer);
          const decryptedText = binaryDataTypeToString(decrypted);

          expect(decryptedText).toEqual(SECRET);
        });
      });
    });
  });

  // Can't mix two formats
});
