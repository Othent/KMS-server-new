import express from "express";
import { getLastNonce, updateJWTNonce } from "../../utils/database/DB";
import { ExpressRequestWithToken } from "../../utils/auth/auth0.types";
import { CONFIG } from "../../server/config/config.utils";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";

// TODO: This logic could be added to the `isRevoked` function / property of `express-jwt`:

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
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    const lastNonce = await getLastNonce(idToken.sub);

    if (idToken.iat <= lastNonce) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        403,
        "Token already used",
      );
    }

    const updateNonce = await updateJWTNonce(idToken.sub, idToken.iat);

    if (updateNonce !== idToken.iat) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        500,
        "Token nonce update error",
      );
    }

    next();
  };
}
