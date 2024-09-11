import express from "express";
import { decrypt } from "./decrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { BaseOperationIdTokenData, LegacyBaseOperationIdTokenData, LegacyBufferData, LegacyBufferObject, normalizeBufferData, toLegacyBufferObject } from "../common.types";
import { validateDecryptIdTokenOrThrow } from "./decrypt.validation";
import { B64String, B64UrlString } from "../../utils/arweave/arweaveUtils";

/**
 * @deprecated
 */
export interface LegacyDecryptIdTokenData extends LegacyBaseOperationIdTokenData {
  ciphertext: LegacyBufferData | string;
}

export interface DecryptIdTokenData extends BaseOperationIdTokenData<Route.DECRYPT> {
  ciphertext: B64String | B64UrlString;
}

export interface DecryptResponseData {
  data: LegacyBufferObject;
};

export function decryptHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<DecryptIdTokenData | LegacyDecryptIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;

    validateDecryptIdTokenOrThrow(idToken);

    const { data } = idToken;
    const isLegacyData = !data.hasOwnProperty("path");
    const treatStringAsB64 = !isLegacyData;

    logRequestStart(Route.DECRYPT, idToken);

    const ciphertextBuffer = normalizeBufferData(data.ciphertext, treatStringAsB64);
    const plaintext = await decrypt(idToken, ciphertextBuffer);

    logRequestSuccess(Route.DECRYPT, idToken);

    // TODO: Return new version directly as B64:
    res.send({ data: toLegacyBufferObject(plaintext) } satisfies DecryptResponseData);
  };
}
