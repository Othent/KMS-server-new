import express from "express";
import { encrypt } from "./encrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";

export interface EncryptIdTokenData {
  keyName: string;
  plaintext: string;
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

    const ciphertext = await encrypt(data.plaintext, data.keyName);

    logRequestSuccess(Route.ENCRYPT, idToken);

    res.send(ciphertext);
  };
}
