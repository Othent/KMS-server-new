import express from "express";
import { createUser } from "./createUser";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { OthentError, OthentErrorID } from "../../server/errors/errors.utils";

export function createUserHandlerFactory() {
  return async (req: ExpressRequestWithToken, res: express.Response) => {
    const { idToken } = req;

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub) {
      throw new OthentError(OthentErrorID.Validation);
    }

    logRequestStart(Route.CREATE_USER, idToken);

    const response = await createUser(idToken.sub);

    logRequestSuccess(Route.CREATE_USER, idToken);

    res.json(response);
  };
}
