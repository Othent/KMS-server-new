import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { sign } from "./sign";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { b64ToUint8Array, B64UrlString } from "../../utils/arweave/arweaveUtils";

export interface SignIdTokenData {
  keyName: string;
  data: B64UrlString;
}

export function signHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<SignIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;
    const { data } = idToken;

    // TODO: Replace with Joi.
    if (!idToken || !data || !data.keyName || !data.data) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    logRequestStart(Route.SIGN, idToken);

    const signature = await sign(b64ToUint8Array(data.data), data.keyName);

    logRequestSuccess(Route.SIGN, idToken);

    // TODO: Ideally, we would just send the binary data back, but the old version of the server was sending strings, so
    // we need to keep doing that until we the new API version:
    res.send(signature.toString());
  };
}
