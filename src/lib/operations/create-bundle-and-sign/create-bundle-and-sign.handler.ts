import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { createBundleAndSign } from "./createBundleAndSign";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Tag } from "arbundles";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";

export interface CreateBundleAndSignIdTokenData {
  data: string;
  keyName: string;
  owner: string;
  tags: Tag[];
}

export function createBundleAndSignHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<CreateBundleAndSignIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;
    const { data } = idToken;

    // TODO: Replace with Joi.
    if (
      !idToken ||
      !data ||
      !data.data ||
      !data.keyName ||
      !data.owner ||
      !data.tags
    ) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    logRequestStart(Route.CREATE_BUNDLE_AND_SIGN, idToken);

    const response = await createBundleAndSign(
      data.data,
      data.keyName,
      data.owner,
      data.tags,
    );

    logRequestSuccess(Route.CREATE_BUNDLE_AND_SIGN, idToken);

    res.send(response);
  };
}
