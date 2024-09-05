import express from "express";
import { createUser } from "./createUser";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";

export interface CreateUserIdTokenData {
  fn: "createUser";
  importOnly?: boolean;
}

export interface CreateUserResponseData {
  data: boolean;
};

export function createUserHandlerFactory() {
  return async (req: ExpressRequestWithToken<CreateUserIdTokenData>, res: express.Response) => {
    const { idToken } = req;

    // TODO: Only in the new version (old one didn't have data for createUser):
    // const { data } = idToken; // || !data || data.fn !== "createUser"

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data for createUser()",
      );
    }

    logRequestStart(Route.CREATE_USER, idToken);

    const success = await createUser(idToken, !!idToken.data?.importOnly);

    logRequestSuccess(Route.CREATE_USER, idToken);

    res.json({ data: success } satisfies CreateUserResponseData);
  };
}
