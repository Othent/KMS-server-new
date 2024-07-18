import express from "express";
import { decrypt } from "./decrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { b64ToUint8Array, B64UrlString } from "../../utils/arweave/arweaveUtils";

export interface DecryptIdTokenData {
  keyName: string;
  ciphertext: B64UrlString;
}

export function decryptHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<DecryptIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;
    const { data } = idToken;

    // TODO: Replace with Joi.
    if (!idToken || !data || !data.keyName || !data.ciphertext) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    logRequestStart(Route.DECRYPT, idToken);

    const plaintext = await decrypt(b64ToUint8Array(data.ciphertext), data.keyName);

    logRequestSuccess(Route.DECRYPT, idToken);

    // TODO: Ideally, we would just send the binary data back, but the old version of the server was sending strings, so
    // we need to keep doing that until we the new API version:
    res.send(plaintext.toString());
  };
}
