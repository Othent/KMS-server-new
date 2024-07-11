import express from "express";
import { encrypt } from "./encrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";

export interface EncryptIdTokenData {
  keyName: string;
  plaintext: string;
}

export function encryptHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<EncryptIdTokenData>,
    res: express.Response,
  ) => {
    try {
      const { idToken } = req;
      const { data } = idToken;

      // TODO: Replace with Joi.
      if (!idToken || !data || !data.keyName || !data.plaintext) {
        throw new Error("Invalid JWT");
      }

      logRequestStart(Route.ENCRYPT, idToken);

      const ciphertext = await encrypt(data.plaintext, data.keyName);

      // TODO: Do not log this!
      logRequestSuccess(Route.ENCRYPT);

      res.send(ciphertext);
    } catch (error) {
      if (error instanceof Error) {
        res.json({ success: false, error: error.message });
      } else {
        res.json({ success: false, error: "An unknown error occurred" });
      }
    }
  };
}
