import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { sign } from "./sign";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { JSONSerializedBuffer } from "../common.types";

export interface SignIdTokenData {
  /**
   * @deprecated
   */
  keyName: string;
  fn: "sign";
  // data: B64UrlString;
  data: string | JSONSerializedBuffer;
}

export interface SignResponseData {
  data: Uint8Array;
};

export function signHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<SignIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;
    const { data } = idToken;

    // TODO: Only in the new version (old one didn't have fn in data, but had keyName):
    // || data.fn !== "sign"

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub || !data || !data.data) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    logRequestStart(Route.SIGN, idToken);

    const { data: dataToSign } = data;
    const dataToSignParam = typeof dataToSign === 'string' ? dataToSign : new Uint8Array(Object.values(dataToSign));

    const signature = await sign(idToken, dataToSignParam);

    logRequestSuccess(Route.SIGN, idToken);

    res.send({ data: signature } satisfies SignResponseData);
  };
}
