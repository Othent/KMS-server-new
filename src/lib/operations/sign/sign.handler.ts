import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { sign } from "./sign";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { BaseOperationIdTokenData, LegacyBaseOperationIdTokenData, LegacyBufferData, LegacyBufferObject, LegacyBufferRecord, normalizeBufferData, toLegacyBufferObject } from "../common.types";
import { validateSignIdTokenOrThrow } from "./sign.validation";
import { B64String, B64UrlString } from "../../utils/arweave/arweaveUtils";

/**
 * @deprecated
 */
export interface LegacySignIdTokenData extends LegacyBaseOperationIdTokenData {
  data: LegacyBufferRecord;
}

export interface SignIdTokenData extends BaseOperationIdTokenData<Route.SIGN> {
  data: B64String | B64UrlString;
}

export interface SignResponseData {
  data: LegacyBufferObject;
};

export function signHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<SignIdTokenData | LegacySignIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;

    validateSignIdTokenOrThrow(idToken);

    const { data } = idToken;
    const isLegacyData = !data.hasOwnProperty("path");
    const treatStringAsB64 = !isLegacyData;

    logRequestStart(Route.SIGN, idToken);

    const dataToSignBuffer = normalizeBufferData(data.data, treatStringAsB64);
    const signature = await sign(idToken, dataToSignBuffer);

    logRequestSuccess(Route.SIGN, idToken);

    // TODO: Return new version directly as B64:
    res.send({ data: toLegacyBufferObject(signature) } satisfies SignResponseData);
  };
}
