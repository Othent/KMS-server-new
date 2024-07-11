import express from "express";
import { decrypt } from "./decrypt";
import {
  ExpressRequestWithToken,
  IdTokenWithData,
} from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";

export interface DecryptIdTokenData {
  keyName: string;
  ciphertext: string;
}

export function decryptHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<DecryptIdTokenData>,
    res: express.Response,
  ) => {
    // TODO: Verify there's an upload.

    try {
      const { idToken } = req;
      const { data } = idToken;

      // TODO: Replace with Joi.
      if (!idToken || !data || !data.keyName || !data.ciphertext) {
        throw new Error("Invalid JWT");
      }

      logRequestStart(Route.DECRYPT, idToken);

      const plaintext = await decrypt(data.ciphertext, data.keyName);

      logRequestSuccess(Route.DECRYPT, idToken);

      res.send(plaintext);
    } catch (error) {
      if (error instanceof Error) {
        res.json({ success: false, error: error.message });
      } else {
        res.json({ success: false, error: "An unknown error occurred" });
      }
    }
  };
}
