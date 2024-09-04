import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { activateKeys } from "./activate-keys";
import { CryptoKeyVersionState } from "../../utils/kms/google-kms.types";

export interface ActivateKeysResult {
  signKeyState: CryptoKeyVersionState;
  encryptDecryptKeyState: CryptoKeyVersionState;
  signKeyVersion: string;
  encryptDecryptKeyVersion: string;
  userDetails: null /* | UserDetails */;
}

export interface ImportKeysResponseData {
  activateKeysResult: ActivateKeysResult;
};

export function activateKeysHandlerFactory() {
  return async (req: ExpressRequestWithToken, res: express.Response) => {
    const { idToken } = req;

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    logRequestStart(Route.ACTIVATE_KEYS, idToken);

    const activateKeysResult = await activateKeys(idToken.sub);

    logRequestSuccess(Route.ACTIVATE_KEYS, idToken);

    res.json({ activateKeysResult } satisfies ImportKeysResponseData);
  };
}
