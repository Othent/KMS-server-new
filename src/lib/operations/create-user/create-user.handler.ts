import express from "express";
import { createUser } from "./createUser";
import { ExpressRequestWithToken, IdTokenWithData } from "../../utils/auth/auth0.types";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { BaseOperationIdTokenData } from "../common.types";
import { validateCreateUserIdTokenOrThrow } from "./create-user.validation";

/**
 * @deprecated
 */
export type LegacyCreateUserIdTokenData = undefined;

export interface CreateUserIdTokenData extends BaseOperationIdTokenData<Route.CREATE_USER> {
  importOnly: boolean;
}

export interface LegacyCreateUserResponseData {
  data: boolean;
};

export interface CreateUserResponseData {
  idTokenWithData: IdTokenWithData<null> | null;
}

export function createUserHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<CreateUserIdTokenData | LegacyCreateUserIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;

    logRequestStart(Route.CREATE_USER, idToken);

    validateCreateUserIdTokenOrThrow(idToken);

    const { data } = idToken;
    const isLegacyData = !data?.hasOwnProperty("path");
    // const importOnly = !!idToken.data?.importOnly;
    const importOnly = false;
    const idTokenWithData = await createUser(idToken, importOnly);

    logRequestSuccess(Route.CREATE_USER, idToken);

    res.send(
      isLegacyData
        ? { data: !!idTokenWithData } satisfies LegacyCreateUserResponseData
        : { idTokenWithData } satisfies CreateUserResponseData
    );
  };
}
