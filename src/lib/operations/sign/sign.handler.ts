import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { sign } from "./sign";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";

export interface SignIdTokenData {
  keyName: string;
  data: string;
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

    const signature = await sign(data.data, data.keyName);

    logRequestSuccess(Route.SIGN, idToken);

    res.send(signature);
  };
}
