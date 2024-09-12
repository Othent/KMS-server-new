import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0.utils";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { importKeys } from "./import-keys";
import { CryptoKeyVersionState } from "../../utils/kms/google-kms.utils";
import { BaseOperationIdTokenData, LegacyBufferData } from "../common.types";

export interface ImportKeysIdTokenData extends BaseOperationIdTokenData<Route.IMPORT_KEYS> {
  wrappedSignKey: string | LegacyBufferData;
  wrappedEncryptDecryptKey: string | LegacyBufferData;
}

interface ImportKeysResult {
  signKeyState: null | CryptoKeyVersionState;
  encryptDecryptKeyState: null | CryptoKeyVersionState;
}

export interface ImportKeysResponseData {
  importKeysResult: ImportKeysResult;
};

export function importKeysHandlerFactory() {
  return async (req: ExpressRequestWithToken<ImportKeysIdTokenData>, res: express.Response) => {
    const { idToken } = req;
    const { data } = idToken;

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub || !data || data.path !== Route.IMPORT_KEYS || (!data.wrappedSignKey && !data.wrappedEncryptDecryptKey)) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data for importKeys()",
      );
    }

    logRequestStart(Route.IMPORT_KEYS, idToken);

    const { wrappedSignKey, wrappedEncryptDecryptKey } = data;
    let wrappedSignKeyParam: null | string | Uint8Array = null;
    let wrappedEncryptDecryptKeyParam: null | string | Uint8Array = null;

    if (wrappedSignKey) {
      wrappedSignKeyParam = typeof wrappedSignKey === 'string' ? wrappedSignKey : new Uint8Array(Object.values(wrappedSignKey));
    }

    if (wrappedEncryptDecryptKey) {
      wrappedEncryptDecryptKeyParam = typeof wrappedEncryptDecryptKey === 'string' ? wrappedEncryptDecryptKey : new Uint8Array(Object.values(wrappedEncryptDecryptKey));
    }

    const importKeysResult = await importKeys(
      idToken,
      wrappedSignKeyParam,
      wrappedEncryptDecryptKeyParam,
    );

    // TODO: Try to activate the key here if it happens in less than X seconds.

    logRequestSuccess(Route.IMPORT_KEYS, idToken);

    res.json({ importKeysResult } satisfies ImportKeysResponseData);
  };
}
