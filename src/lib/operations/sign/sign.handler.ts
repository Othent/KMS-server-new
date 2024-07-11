import express from "express";
import {
  ExpressRequestWithToken,
  IdTokenWithData,
} from "../../utils/auth/auth0";
import { sign } from "./sign";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";

export interface SignIdTokenData {
  keyName: string;
  data: string;
}

export function signHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<SignIdTokenData>,
    res: express.Response,
  ) => {
    try {
      const { idToken } = req;
      const { data } = idToken;

      // TODO: Replace with Joi.
      if (!idToken || !data || !data.keyName || !data.data) {
        throw new Error("Invalid JWT");
      }

      logRequestStart(Route.SIGN, idToken);

      const signature = await sign(data.data, data.keyName);

      logRequestSuccess(Route.SIGN, idToken);

      res.send(signature);
    } catch (error) {
      if (error instanceof Error) {
        res.json({ success: false, error: error.message });
      } else {
        res.json({ success: false, error: "An unknown error occurred" });
      }
    }
  };
}
