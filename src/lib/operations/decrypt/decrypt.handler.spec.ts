import {describe, expect, test} from '@jest/globals';
import { decryptHandlerFactory, DecryptIdTokenData, DecryptResponseData, LegacyDecryptIdTokenData, LegacyDecryptResponseData } from './decrypt.handler';
import httpMocks from "node-mocks-http";
import { ExpressRequestWithToken } from '../../utils/auth/auth0';
import { Route } from '../../server/server.constants';
import { B64String, B64UrlString, binaryDataTypeToString, stringToUint8Array, uint8ArrayTob64, uint8ArrayTob64Url } from '../../utils/arweave/arweaveUtils';
import { EMPTY_VALUES, LEGACY_TOKEN_DATA_FORMATS, LegacyBufferObject, LegacyBufferRecord, LegacyTokenDataFormat, normalizeBufferData, TOKEN_DATA_FORMATS, TokenDataFormat } from '../common.types';
import { encrypt } from '../encrypt/encrypt';

describe('decrypt handler', () => {
  const decryptHandler = decryptHandlerFactory();

  async function callDecryptHandlerWithToken(idTokenData: null | DecryptIdTokenData | LegacyDecryptIdTokenData) {
    const req = httpMocks.createRequest({}) satisfies ExpressRequestWithToken<DecryptIdTokenData | LegacyDecryptIdTokenData>;

    req.idToken = {
      sub: idTokenData ? "<SUB>" : undefined,
      data: idTokenData || undefined,
    } as any;

    const res = httpMocks.createResponse();

    await decryptHandler(req, res);

    return res._getData() as LegacyDecryptResponseData | DecryptResponseData;
  }

  const SECRET = "My secret.";

  let ENCRYPTED_SECRET_BUFFER = new Uint8Array();

  const getLegacyIdTokenData = (format: LegacyTokenDataFormat) => {
    let ciphertext: string | LegacyBufferObject | LegacyBufferRecord = "";

    if (format === "string") {
      // This has encoding issues, so we just ignore this case:
      ciphertext = "";
    } else if (format === "LegacyBufferObject") {
      ciphertext = {
        type: "Buffer",
        data: Array.from(ENCRYPTED_SECRET_BUFFER),
      };
    } else if (format === "LegacyBufferRecord") {
      ciphertext = { ...Array.from(ENCRYPTED_SECRET_BUFFER) };
    }

    return {
      keyName: "<KEYNAME>",
      ciphertext,
    } satisfies LegacyDecryptIdTokenData;
  };


  const getIdTokenData = (format: TokenDataFormat) => {
    let ciphertext: B64String | B64UrlString = "" as B64String;

    if (format === "B64String") {
      ciphertext = uint8ArrayTob64(ENCRYPTED_SECRET_BUFFER);
    } else if (format === "B64UrlString") {
      ciphertext = uint8ArrayTob64Url(ENCRYPTED_SECRET_BUFFER);
    }

    return {
      path: Route.DECRYPT,
      ciphertext,
    } satisfies DecryptIdTokenData;
  };

  beforeAll(async () => {
    const encryptedSecretBuffer = await encrypt({ sub: "<SUB>" } as any, stringToUint8Array(SECRET));

    ENCRYPTED_SECRET_BUFFER = encryptedSecretBuffer;
  });

  describe('(legacy format)', () => {
    describe('validates the ID JWT token data', () => {
      test('has a sub', async () => {
        await expect(callDecryptHandlerWithToken(null)).rejects.toThrow("Invalid token data for decrypt()");
      });

      test('has a keyName', async () => {
        await expect(callDecryptHandlerWithToken({
          ...getLegacyIdTokenData("LegacyBufferObject"),
          keyName: "",
        })).rejects.toThrow("Invalid token data for decrypt()");
      });

      LEGACY_TOKEN_DATA_FORMATS.forEach((format) => {
        test(`has ${ format } data`, async () => {
          await expect(callDecryptHandlerWithToken({
            ...getLegacyIdTokenData(format),
            ciphertext: EMPTY_VALUES[format],
          })).rejects.toThrow("Invalid token data for decrypt()");
        });
      });
    });

    LEGACY_TOKEN_DATA_FORMATS.forEach((format) => {
      // This has encoding issues, so we just ignore this case:
      if (format === "string") return;

      test(`accepts ${ format } and returns the right result`, async () => {
        const result = await callDecryptHandlerWithToken(getLegacyIdTokenData(format));
        const data = (result as LegacyDecryptResponseData).data || (result as DecryptResponseData).decryptedData;

        expect(data).toEqual(
          expect.objectContaining({
            type: "Buffer",
            data: expect.any(Array),
          }),
        );

        const resultDataBuffer = normalizeBufferData(data);
        const decryptedText = binaryDataTypeToString(resultDataBuffer);

        expect(decryptedText).toEqual(SECRET);
      });
    });
  });

  describe('(new format)', () => {
    describe('validates the ID JWT token data', () => {
      test('has a sub', async () => {
        await expect(callDecryptHandlerWithToken(null)).rejects.toThrow("Invalid token data for decrypt()");
      });

      test('has a path', async () => {
        await expect(callDecryptHandlerWithToken({
          ...getIdTokenData("B64String"),
          path: "" as any,
        })).rejects.toThrow("Invalid token data for decrypt()");
      });

      test(`has path = ${Route.DECRYPT}`, async () => {
        await expect(callDecryptHandlerWithToken({
          ...getIdTokenData("B64String"),
          path: Route.HOME as any,
        })).rejects.toThrow("Invalid token data for decrypt()");
      });

      TOKEN_DATA_FORMATS.forEach((format) => {
        test(`has ${ format } data`, async () => {
          await expect(callDecryptHandlerWithToken({
            ...getIdTokenData(format),
            ciphertext: EMPTY_VALUES[format],
          })).rejects.toThrow("Invalid token data for decrypt()");
        });
      });
    });

    TOKEN_DATA_FORMATS.forEach((format) => {
      test(`accepts ${ format } and returns the right result`, async () => {
        const result = await callDecryptHandlerWithToken(getIdTokenData(format));
        const data = (result as LegacyDecryptResponseData).data || (result as DecryptResponseData).decryptedData;

        expect(data).toMatch(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);

        const resultDataBuffer = normalizeBufferData(data, true);
        const decryptedText = binaryDataTypeToString(resultDataBuffer);

        expect(decryptedText).toEqual(SECRET);
      });
    });
  });

  test('legacy and new formats cannot be used at the same time', async () => {
    await expect(callDecryptHandlerWithToken({
      keyName: "<KEYNAME>",
      path: Route.DECRYPT,
      ciphertext: uint8ArrayTob64(ENCRYPTED_SECRET_BUFFER),
    })).rejects.toThrow("Invalid token data for decrypt()");
  });

});
