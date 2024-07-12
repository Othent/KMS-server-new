import express from "express";
import { decrypt } from "./decrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { OthentError, OthentErrorID } from "../../server/errors/errors.utils";

export interface DecryptIdTokenData {
  keyName: string;
  ciphertext: string;
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
      throw new OthentError(OthentErrorID.Validation);
    }

    logRequestStart(Route.DECRYPT, idToken);

    const plaintext = await decrypt(data.ciphertext, data.keyName);

    logRequestSuccess(Route.DECRYPT, idToken);

    res.send(plaintext);
  };
}
