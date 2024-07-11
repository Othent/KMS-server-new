import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { createBundleAndSign } from "./createBundleAndSign";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";

export interface CreateBundleAndSignIdTokenData {
  data: string;
  keyName: string;
  owner: string;
  tags: string[];
}

export function createBundleAndSignHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<CreateBundleAndSignIdTokenData>,
    res: express.Response,
  ) => {
    try {
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
        throw new Error("Invalid JWT");
      }

      logRequestStart(Route.CREATE_BUNDLE_AND_SIGN, idToken);

      const response = await createBundleAndSign(
        data.data,
        data.keyName,
        data.owner,
        data.tags,
      );

      logRequestSuccess(Route.CREATE_BUNDLE_AND_SIGN);

      res.send(response);
    } catch (error) {
      if (error instanceof Error) {
        res.json({ success: false, error: error.message });
      } else {
        res.json({ success: false, error: "An unknown error occurred" });
      }
    }
  };
}
