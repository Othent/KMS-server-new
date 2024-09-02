import express from "express";
import { createUser } from "./createUser";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";

export interface CreateUserResponseData {
  data: boolean;
};

export function createUserHandlerFactory() {
  return async (req: ExpressRequestWithToken, res: express.Response) => {
    const { idToken } = req;

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    logRequestStart(Route.CREATE_USER, idToken);

    const success = await createUser(idToken.sub);

    logRequestSuccess(Route.CREATE_USER, idToken);

    res.json({ data: success } satisfies CreateUserResponseData);
  };
}
