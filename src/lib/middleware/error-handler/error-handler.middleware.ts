import { getErrorResponse } from "../../server/errors/errors.utils";
import { Route } from "../../server/server.constants";
import {
  ExpressRequestWithToken,
  isExpressRequestWithToken,
} from "../../utils/auth/auth0.utils";
import express from "express";
import { logRequestError } from "../../utils/log/log.utils";

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

    if (res.headersSent) {
      return next(err);
    }

    const { statusCode, errorData } = getErrorResponse(err);

    res.status(statusCode).json(errorData);
  };
}
