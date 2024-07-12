import express from "express";
import { getLastNonce, updateJWTNonce } from "../../utils/database/DB";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { OthentError, OthentErrorID } from "../../server/errors/errors.utils";
import { CONFIG } from "../../server/config/config.utils";

export function jwtUnusedFactory() {
  return async (
    req: ExpressRequestWithToken,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (!CONFIG.MONGODB_ENABLED) {
      // Skip the nonce check when running locally:
      return next();
    }

    const { idToken } = req;

    if (!idToken || !idToken.iat || !idToken.sub) {
      throw new OthentError(OthentErrorID.Validation);
    }

    const lastNonce = await getLastNonce(idToken.sub);

    if (idToken.iat <= lastNonce) {
      throw new OthentError(OthentErrorID.Validation);
    }

    const updateNonce = await updateJWTNonce(idToken.sub, idToken.iat);

    if (updateNonce !== idToken.iat) {
      throw new OthentError(OthentErrorID.Validation);
    }

    next();
  };
}
