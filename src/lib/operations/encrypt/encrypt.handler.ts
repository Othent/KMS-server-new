import express from "express";
import { encrypt } from "./encrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { BaseOperationIdTokenData, LegacyBaseOperationIdTokenData, LegacyBufferData, LegacyBufferObject, normalizeBufferData, toLegacyBufferObject } from "../common.types";
import { B64String, B64UrlString } from "../../utils/arweave/arweaveUtils";
import { validateEncryptIdTokenOrThrow } from "./encrypt.validation";

/**
 * @deprecated
 */
export interface LegacyEncryptIdTokenData extends LegacyBaseOperationIdTokenData {
  plaintext: LegacyBufferData | string;
}

export interface EncryptIdTokenData extends BaseOperationIdTokenData<Route.ENCRYPT> {
  plaintext: B64String | B64UrlString;
}

export interface EncryptResponseData {
  data: LegacyBufferObject;
};

export function encryptHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<EncryptIdTokenData | LegacyEncryptIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;

    validateEncryptIdTokenOrThrow(idToken);

    const { data } = idToken;
    const isLegacyData = !data.hasOwnProperty("path");
    const treatStringAsB64 = !isLegacyData;

    logRequestStart(Route.ENCRYPT, idToken);

    const plaintextBuffer = normalizeBufferData(data.plaintext, treatStringAsB64);
    const ciphertext = await encrypt(idToken, plaintextBuffer);

    logRequestSuccess(Route.ENCRYPT, idToken);

    // TODO: Return new version directly as B64:
    res.send({ data: toLegacyBufferObject(ciphertext) } satisfies EncryptResponseData);
  };
}
