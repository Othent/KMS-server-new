import express from "express";
import { createUser } from "./createUser";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { BaseOperationIdTokenData } from "../common.types";
import { validateCreateUserIdTokenOrThrow } from "./create-user.validation";

/**
 * @deprecated
 */
export type LegacyCreateUserIdTokenData = undefined;

export interface CreateUserIdTokenData extends BaseOperationIdTokenData<Route.CREATE_USER> {
  importOnly: boolean;
}

export interface CreateUserResponseData {
  data: boolean;
};

export function createUserHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<CreateUserIdTokenData | LegacyCreateUserIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;
    const { data } = idToken;
    const isLegacyData = !data;

    logRequestStart(Route.CREATE_USER, idToken);

    validateCreateUserIdTokenOrThrow(idToken);

    const importOnly = !!idToken.data?.importOnly;
    const success = await createUser(idToken, importOnly);

    logRequestSuccess(Route.CREATE_USER, idToken);

    // TODO: Return new version directly as B64:
    res.json({ data: success } satisfies CreateUserResponseData);
  };
}
