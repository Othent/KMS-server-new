import express from "express";
import { createUser } from "./createUser";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";

export function createUserHandlerFactory() {
  return async (req: ExpressRequestWithToken, res: express.Response) => {
    try {
      const { idToken } = req;

      // TODO: Replace with Joi.
      if (!idToken || !idToken.sub) {
        throw new Error("Invalid JWT");
      }

      logRequestStart(Route.CREATE_USER, idToken);

      const response = await createUser(idToken.sub);

      logRequestSuccess(Route.CREATE_USER, idToken);

      res.json(response);
    } catch (error) {
      if (error instanceof Error) {
        res.json({ success: false, error: error.message });
      } else {
        res.json({ success: false, error: "An unknown error occurred" });
      }
    }
  };
}
