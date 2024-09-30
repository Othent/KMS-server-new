import { getErrorResponse } from "../../server/errors/errors.utils";
import { Route } from "../../server/server.constants";
import {
  ExpressRequestWithToken,
  isExpressRequestWithToken,
} from "../../utils/auth/auth0.types";
import express from "express";
import { logRequestError } from "../../utils/log/log.utils";
import { OthentErrorID, OthentServerError } from "../../server/errors/error";
import { notifyErrorOnSlack } from "../../utils/slack/slack.utils";

export function errorHandlerFactory() {
  return (
    err: unknown,
    req: express.Request | ExpressRequestWithToken,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logRequestError(
      req.path as Route,
      isExpressRequestWithToken(req) ? req.idToken : null,
      err,
    );

    notifyErrorOnSlack(req.path as Route, err);

    if (res.headersSent) {
      return next(err);
    }

    const { statusCode, errorData } = getErrorResponse(err);

    res.status(statusCode).json(errorData);
  };
}
