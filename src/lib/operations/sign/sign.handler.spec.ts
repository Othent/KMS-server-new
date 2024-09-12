import {describe, expect, test} from '@jest/globals';
import { signHandlerFactory, SignIdTokenData, SignResponseData, LegacySignIdTokenData, LegacySignResponseData } from './sign.handler';
import httpMocks from "node-mocks-http";
import { ExpressRequestWithToken } from '../../utils/auth/auth0.utils';
import { Route } from '../../server/server.constants';
import { B64String, B64UrlString, stringToUint8Array, uint8ArrayTob64, uint8ArrayTob64Url } from '../../utils/arweave/arweaveUtils';
import { EMPTY_VALUES, LEGACY_TOKEN_DATA_FORMATS, LegacyBufferRecord, LegacyTokenDataFormat, normalizeBufferData, TOKEN_DATA_FORMATS, TokenDataFormat } from '../common.types';
import { LocalKeyManagementServiceClient } from '../../utils/kms/localKeyManagementServiceClient';

describe('sign handler', () => {
  const signHandler = signHandlerFactory();

  async function callSignHandlerWithToken(idTokenData: null | SignIdTokenData | LegacySignIdTokenData) {
    const req = httpMocks.createRequest({}) satisfies ExpressRequestWithToken<SignIdTokenData | LegacySignIdTokenData>;

    req.idToken = {
      sub: idTokenData ? "<SUB>" : undefined,
      data: idTokenData || undefined,
    } as any;

    const res = httpMocks.createResponse();

    await signHandler(req, res);

    return res._getData() as LegacySignResponseData | SignResponseData;
  }

  const DATA_TO_SIGN = "Sign this data.";

  let HASHED_DATA_TO_SIGN = new Uint8Array();

  const getLegacyIdTokenData = (format: LegacyTokenDataFormat) => {
    let data: LegacyBufferRecord = {};

    // `sing()` only accepts `LegacyBufferRecord`:
    if (format === "LegacyBufferRecord") {
      data = { ...Array.from(HASHED_DATA_TO_SIGN) };
    }

    return {
      keyName: "<KEYNAME>",
      data,
    } satisfies LegacySignIdTokenData;
  };

  const getIdTokenData = (format: TokenDataFormat) => {
    let data: B64String | B64UrlString = "" as B64String;

    if (format === "B64String") {
      data = uint8ArrayTob64(HASHED_DATA_TO_SIGN);
    } else if (format === "B64UrlString") {
      data = uint8ArrayTob64Url(HASHED_DATA_TO_SIGN);
    }

    return {
      path: Route.SIGN,
      data,
    } satisfies SignIdTokenData;
  };

  beforeAll(async () => {
    const dataToSignBuffer = Buffer.from(DATA_TO_SIGN);
    const dataToSignHash = await LocalKeyManagementServiceClient.hashDataToSign(dataToSignBuffer);
    const dataToSignHashBuffer = Buffer.from(dataToSignHash, "base64");

    HASHED_DATA_TO_SIGN = dataToSignHashBuffer;
  });

  describe('(legacy format)', () => {
    describe('validates the ID JWT token data', () => {
      test('has a sub', async () => {
        await expect(callSignHandlerWithToken(null)).rejects.toThrow("Invalid token data for sign()");
      });

      test('has a keyName', async () => {
        await expect(callSignHandlerWithToken({
          ...getLegacyIdTokenData("LegacyBufferRecord"),
          keyName: "",
        })).rejects.toThrow("Invalid token data for sign()");
      });

      LEGACY_TOKEN_DATA_FORMATS.forEach((format) => {
        // `sing()` only accepts `LegacyBufferRecord`:
        if (format !== "LegacyBufferRecord") return;

        test(`has ${ format } data`, async () => {
          await expect(callSignHandlerWithToken({
            ...getLegacyIdTokenData(format),
            data: EMPTY_VALUES[format],
          })).rejects.toThrow("Invalid token data for sign()");
        });
      });
    });

    LEGACY_TOKEN_DATA_FORMATS.forEach((format) => {
      // `sing()` only accepts `LegacyBufferRecord`:
      if (format !== "LegacyBufferRecord") return;

      test(`accepts ${ format } and returns the right result`, async () => {
        const result = await callSignHandlerWithToken(getLegacyIdTokenData(format));
        const data = (result as LegacySignResponseData).data || (result as SignResponseData).signature;

        expect(data).toEqual(
          expect.objectContaining({
            type: "Buffer",
            data: expect.any(Array),
          }),
        );

        const resultDataBuffer = normalizeBufferData(data);
        const isSignatureValid = await LocalKeyManagementServiceClient.verifySignature(
          Buffer.from(DATA_TO_SIGN),
          resultDataBuffer,
        );

        expect(isSignatureValid).toBe(true);
      });
    });
  });

  describe('(new format)', () => {
    describe('validates the ID JWT token data', () => {
      test('has a sub', async () => {
        await expect(callSignHandlerWithToken(null)).rejects.toThrow("Invalid token data for sign()");
      });

      test('has a path', async () => {
        await expect(callSignHandlerWithToken({
          ...getIdTokenData("B64String"),
          path: "" as any,
        })).rejects.toThrow("Invalid token data for sign()");
      });

      test(`has path = ${Route.SIGN}`, async () => {
        await expect(callSignHandlerWithToken({
          ...getIdTokenData("B64String"),
          path: Route.HOME as any,
        })).rejects.toThrow("Invalid token data for sign()");
      });

      TOKEN_DATA_FORMATS.forEach((format) => {
        test(`has ${ format } data`, async () => {
          await expect(callSignHandlerWithToken({
            ...getIdTokenData(format),
            data: EMPTY_VALUES[format],
          })).rejects.toThrow("Invalid token data for sign()");
        });
      });
    });

    TOKEN_DATA_FORMATS.forEach((format) => {
      test(`accepts ${ format } and returns the right result`, async () => {
        const result = await callSignHandlerWithToken(getIdTokenData(format));
        const data = (result as LegacySignResponseData).data || (result as SignResponseData).signature;

        expect(data).toMatch(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);

        const resultDataBuffer = normalizeBufferData(data, true);
        const isSignatureValid = await LocalKeyManagementServiceClient.verifySignature(
          Buffer.from(DATA_TO_SIGN),
          resultDataBuffer,
        );

        expect(isSignatureValid).toBe(true);
      });
    });
  });

  test('legacy and new formats cannot be used at the same time', async () => {
    await expect(callSignHandlerWithToken({
      keyName: "<KEYNAME>",
      path: Route.SIGN,
      data: uint8ArrayTob64(stringToUint8Array(DATA_TO_SIGN)),
    })).rejects.toThrow("Invalid token data for sign()");
  });

});
