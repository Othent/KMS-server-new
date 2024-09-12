import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0.utils";
import { sign } from "./sign";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { BaseOperationIdTokenData, LegacyBaseOperationIdTokenData, LegacyBufferData, LegacyBufferObject, LegacyBufferRecord, normalizeBufferData, toLegacyBufferObject } from "../common.types";
import { validateSignIdTokenOrThrow } from "./sign.validation";
import { B64String, B64UrlString, uint8ArrayTob64 } from "../../utils/arweave/arweaveUtils";

/**
 * @deprecated
 */
export interface LegacySignIdTokenData extends LegacyBaseOperationIdTokenData {
  data: LegacyBufferRecord;
}

export interface SignIdTokenData extends BaseOperationIdTokenData<Route.SIGN> {
  data: B64String | B64UrlString;
}

export interface LegacySignResponseData {
  data: LegacyBufferObject;
};

export interface SignResponseData {
  signature: B64String;
};

export function signHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<SignIdTokenData | LegacySignIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;

    logRequestStart(Route.SIGN, idToken);

    validateSignIdTokenOrThrow(idToken);

    const { data } = idToken;
    const isLegacyData = !data.hasOwnProperty("path");
    const treatStringAsB64 = !isLegacyData;

    const dataToSignBuffer = normalizeBufferData(data.data, treatStringAsB64);
    const signature = await sign(idToken, dataToSignBuffer);

    logRequestSuccess(Route.SIGN, idToken);

    res.send(
      isLegacyData
        ? { data: toLegacyBufferObject(signature) } satisfies LegacySignResponseData
        : { signature: uint8ArrayTob64(signature) } satisfies SignResponseData
    );
  };
}
