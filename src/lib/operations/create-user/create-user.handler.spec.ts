import {describe, expect, test} from '@jest/globals';
import { createUserHandlerFactory, CreateUserIdTokenData, CreateUserResponseData, LegacyCreateUserIdTokenData, LegacyCreateUserResponseData } from './create-user.handler';
import httpMocks from "node-mocks-http";
import { ExpressRequestWithToken, UserMetadata } from '../../utils/auth/auth0.types';
import { Route } from '../../server/server.constants';
import { B64UrlString } from '../../utils/arweave/arweaveUtils';
import * as auth0Utils from "../../utils/auth/auth0.utils";
import { CONFIG } from '../../server/config/config.utils';

describe('createUser handler', () => {
  const createUserHandler = createUserHandlerFactory();

  async function callCreateUserHandlerWithToken(sub: boolean, idTokenData?: null | CreateUserIdTokenData | LegacyCreateUserIdTokenData) {
    const req = httpMocks.createRequest({}) satisfies ExpressRequestWithToken<CreateUserIdTokenData | LegacyCreateUserIdTokenData>;

    req.idToken = {
      sub: sub ? "<SUB>" : undefined,
      data: idTokenData,
    } as any;

    const res = httpMocks.createResponse();

    await createUserHandler(req, res);

    return res._getData() as LegacyCreateUserResponseData | CreateUserResponseData;
  }

  const idTokenData: CreateUserIdTokenData = {
    path: Route.CREATE_USER,
    importOnly: false,
  };

  beforeAll(() => {
    jest.spyOn(auth0Utils, "updateAuth0User").mockImplementation(() => {
      return Promise.resolve({
        authSystem: CONFIG.AUTH_SYSTEM,
        owner: "<OWNER>" as B64UrlString,
        walletAddress: "<WALLET_ADDRESS>" as B64UrlString,
      } satisfies UserMetadata);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('(legacy format)', () => {
    describe('validates the ID JWT token data', () => {
      test('has a sub', async () => {
        await expect(callCreateUserHandlerWithToken(false)).rejects.toThrow("Invalid token data for createUser()");
      });

      test('has no data', async () => {
        await expect(callCreateUserHandlerWithToken(true, {} as unknown as LegacyCreateUserIdTokenData)).rejects.toThrow("Invalid token data for createUser()");
      });
    });

    test("accepts `undefined` data and returns the right result", async () => {
      const result = await callCreateUserHandlerWithToken(true, undefined);
      const data = (result as LegacyCreateUserResponseData).data || (result as CreateUserResponseData).idTokenWithData;

      expect(data).toEqual(true);
    });

    test("accepts `null` data and returns the right result", async () => {
      const result = await callCreateUserHandlerWithToken(true, null);
      const data = (result as LegacyCreateUserResponseData).data || (result as CreateUserResponseData).idTokenWithData;

      expect(data).toEqual(true);
    });
  });

  describe('(new format)', () => {
    describe('validates the ID JWT token data', () => {
      test('has a sub', async () => {
        await expect(callCreateUserHandlerWithToken(false)).rejects.toThrow("Invalid token data for createUser()");
      });

      test('has a path', async () => {
        await expect(callCreateUserHandlerWithToken(true, {
          ...idTokenData,
          path: "" as any,
        })).rejects.toThrow("Invalid token data for createUser()");
      });

      test(`has path = ${Route.DECRYPT}`, async () => {
        await expect(callCreateUserHandlerWithToken(true, {
          ...idTokenData,
          path: Route.HOME as any,
        })).rejects.toThrow("Invalid token data for createUser()");
      });

      test('has data', async () => {
        await expect(callCreateUserHandlerWithToken(true, {
          ...idTokenData,
          importOnly: undefined as any,
        })).rejects.toThrow("Invalid token data for createUser()");
      });
    });

    test(`accepts data and returns the right result`, async () => {
      const result = await callCreateUserHandlerWithToken(true, idTokenData);
      const data = (result as LegacyCreateUserResponseData).data || (result as CreateUserResponseData).idTokenWithData;

      expect(data).toEqual({
        sub: "<SUB>",
        data: null,
        authSystem: "KMS",
        owner: "<OWNER>",
        walletAddress: "<WALLET_ADDRESS>",
      });
    });
  });

});
