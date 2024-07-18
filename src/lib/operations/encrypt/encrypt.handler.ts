import express from "express";
import { encrypt } from "./encrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { b64ToUint8Array, B64UrlString } from "../../utils/arweave/arweaveUtils";

export interface EncryptIdTokenData {
  keyName: string;
  plaintext: B64UrlString;
}

export function encryptHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<EncryptIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;
    const { data } = idToken;

    // TODO: Replace with Joi.
    if (!idToken || !data || !data.keyName || !data.plaintext) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    logRequestStart(Route.ENCRYPT, idToken);

    const ciphertext = await encrypt(b64ToUint8Array(data.plaintext), data.keyName);

    logRequestSuccess(Route.ENCRYPT, idToken);

    // TODO: Ideally, we would just send the binary data back, but the old version of the server was sending strings, so
    // we need to keep doing that until we the new API version:
    res.send(ciphertext.toString());
  };
}
