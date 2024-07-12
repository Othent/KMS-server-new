import express from "express";
import { encrypt } from "./encrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { OthentError, OthentErrorID } from "../../server/errors/errors.utils";

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
      throw new OthentError(OthentErrorID.Validation);
    }

    logRequestStart(Route.ENCRYPT, idToken);

    const ciphertext = await encrypt(data.plaintext, data.keyName);

    logRequestSuccess(Route.ENCRYPT, idToken);

    res.send(ciphertext);
  };
}
