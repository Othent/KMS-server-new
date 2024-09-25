import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0.types";
import { extractHandlerResponse } from "../../utils/express/handler-unwrapper.utils";
import { CONFIG } from "../../server/config/config.utils";

export interface StatusHandlerFactoryOptions {
  jwtValidator: express.Handler;
  jwtUnused: express.Handler;
}

export function statusHandlerFactory({
  jwtValidator,
  jwtUnused,
}: StatusHandlerFactoryOptions) {
  return async (req: ExpressRequestWithToken<any>, res: express.Response) => {
    const validatorResponse = await extractHandlerResponse(jwtValidator, req);
    const unusedResponse = await extractHandlerResponse(jwtUnused, req);

    const hasToken = !!req.idToken;
    const hasTokenData = !!req.idToken?.data;
    const isTokenValid = validatorResponse?.nextCalled;
    const isTokenUnused = unusedResponse?.nextCalled;

    res.json({
      version: CONFIG.pgkVersion,
      buildDate: CONFIG.buildDate,
      hasToken,
      hasTokenData,
      isTokenValid,
      isTokenUnused,
    });
  };
}

