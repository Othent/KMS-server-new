import {describe, expect, test} from '@jest/globals';
import { encryptHandlerFactory, EncryptIdTokenData, EncryptResponseData, LegacyEncryptIdTokenData, LegacyEncryptResponseData } from './encrypt.handler';
import httpMocks from "node-mocks-http";
import { ExpressRequestWithToken } from '../../utils/auth/auth0.types';
import { Route } from '../../server/server.constants';
import { decrypt } from '../decrypt/decrypt';
import { EMPTY_VALUES, LEGACY_TOKEN_DATA_FORMATS, LegacyTokenDataFormat, TOKEN_DATA_FORMATS, TokenDataFormat } from '../common.types';
import { B64String, B64UrlString } from '../../utils/lib/binary-data-types/binary-data-types.types';
import { LegacyBufferObject, LegacyBufferRecord } from '../../utils/lib/legacy-serialized-buffers/legacy-serialized-buffer.types';
import { B64, B64Url, BDT, UI8A } from '../../utils/lib/binary-data-types/binary-data-types.utils';
import { normalizeLegacyBufferDataOrB64 } from '../../utils/lib/legacy-serialized-buffers/legacy-serialized-buffer.utils';

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

    return res._getData() as LegacyEncryptResponseData | EncryptResponseData;
  }

  const SECRET = "My secret.";

  const getLegacyIdTokenData = (format: LegacyTokenDataFormat) => {
    let plaintext: LegacyBufferObject | LegacyBufferRecord | string = SECRET;

    if (format === "LegacyBufferObject") {
      plaintext = {
        type: "Buffer",
        data: Array.from(UI8A.from(SECRET, "string")),
      };
    } else if (format === "LegacyBufferRecord") {
      plaintext = { ...Array.from(UI8A.from(SECRET, "string")) };
    }

    return {
      keyName: "<KEYNAME>",
      plaintext,
    } satisfies LegacyEncryptIdTokenData;
  };


  const getIdTokenData = (format: TokenDataFormat) => {
    let plaintext: B64String | B64UrlString = "" as B64String;

    if (format === "B64String") {
      plaintext = B64.from(SECRET);
    } else if (format === "B64UrlString") {
      plaintext = B64Url.from(SECRET);
    }

    return {
      path: Route.ENCRYPT,
      plaintext,
    } satisfies EncryptIdTokenData;
  };

  describe('(legacy format)', () => {
    describe('validates the ID JWT token data', () => {
      test('has a sub', async () => {
        await expect(callEncryptHandlerWithToken(null)).rejects.toThrow("Invalid token data for encrypt()");
      });

      test('has a keyName', async () => {
        await expect(callEncryptHandlerWithToken({
          ...getLegacyIdTokenData("LegacyBufferObject"),
          keyName: "",
        })).rejects.toThrow("Invalid token data for encrypt()");
      });

      LEGACY_TOKEN_DATA_FORMATS.forEach((format) => {
        test(`has ${ format } data`, async () => {
          await expect(callEncryptHandlerWithToken({
            ...getLegacyIdTokenData(format),
            plaintext: EMPTY_VALUES[format],
          })).rejects.toThrow("Invalid token data for encrypt()");
        });
      });
    });

    LEGACY_TOKEN_DATA_FORMATS.forEach((format) => {
      test(`accepts ${ format } and returns the right result`, async () => {
        const result = await callEncryptHandlerWithToken(getLegacyIdTokenData(format));
        const data = (result as LegacyEncryptResponseData).data || (result as EncryptResponseData).encryptedData;

        expect(data).toEqual(
          expect.objectContaining({
            type: "Buffer",
            data: expect.any(Array),
          }),
        );

        const resultDataBuffer = normalizeLegacyBufferDataOrB64(data);
        const decrypted = await decrypt({ sub: "<SUB>" } as any, resultDataBuffer);
        const decryptedText = BDT.decode(decrypted);

        expect(decryptedText).toEqual(SECRET);
      });
    });
  });

  describe('(new format)', () => {
    describe('validates the ID JWT token data', () => {
      test('has a sub', async () => {
        await expect(callEncryptHandlerWithToken(null)).rejects.toThrow("Invalid token data for encrypt()");
      });

      test('has a path', async () => {
        await expect(callEncryptHandlerWithToken({
          ...getIdTokenData("B64String"),
          path: "" as any,
        })).rejects.toThrow("Invalid token data for encrypt()");
      });

      test(`has path = ${Route.DECRYPT}`, async () => {
        await expect(callEncryptHandlerWithToken({
          ...getIdTokenData("B64String"),
          path: Route.HOME as any,
        })).rejects.toThrow("Invalid token data for encrypt()");
      });

      TOKEN_DATA_FORMATS.forEach((format) => {
        test('has data', async () => {
          await expect(callEncryptHandlerWithToken({
            ...getIdTokenData(format),
            plaintext: EMPTY_VALUES[format],
          })).rejects.toThrow("Invalid token data for encrypt()");
        });
      });
    });

    TOKEN_DATA_FORMATS.forEach((format) => {
      test(`accepts ${ format } and returns the right result`, async () => {
        const result = await callEncryptHandlerWithToken(getIdTokenData(format));
        const data = (result as LegacyEncryptResponseData).data || (result as EncryptResponseData).encryptedData;

        expect(data).toMatch(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);

        const resultDataBuffer = normalizeLegacyBufferDataOrB64(data, true);
        const decrypted = await decrypt({ sub: "<SUB>" } as any, resultDataBuffer);
        const decryptedText = BDT.decode(decrypted);

        expect(decryptedText).toEqual(SECRET);
      });
    });
  });

  test('legacy and new formats cannot be used at the same time', async () => {
    await expect(callEncryptHandlerWithToken({
      ...getIdTokenData("B64String"),
      keyName: "<KEYNAME>",
    })).rejects.toThrow("Invalid token data for encrypt()");
  });

});
