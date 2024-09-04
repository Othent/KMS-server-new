import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { activateKeys } from "./activate-keys";
import { CryptoKeyVersionState } from "../../utils/kms/google-kms.utils";

export interface ActivateKeysIdTokenData {
  fn: "activateKeys";
}

export interface ActivateKeysResult {
  signKeyState: CryptoKeyVersionState;
  encryptDecryptKeyState: CryptoKeyVersionState;
  signKeyVersion: string;
  encryptDecryptKeyVersion: string;
  userDetails: null /* | UserDetails */;
}

export interface ActivateKeysResponseData {
  activateKeysResult: ActivateKeysResult;
};

export function activateKeysHandlerFactory() {
  return async (req: ExpressRequestWithToken<ActivateKeysIdTokenData>, res: express.Response) => {
    const { idToken } = req;
    const { data } = idToken;

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub || !data || data.fn !== "activateKeys") {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    logRequestStart(Route.ACTIVATE_KEYS, idToken);

    const activateKeysResult = await activateKeys(idToken);

    logRequestSuccess(Route.ACTIVATE_KEYS, idToken);

    res.json({ activateKeysResult } satisfies ActivateKeysResponseData);
  };
}
