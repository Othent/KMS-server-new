import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { importKeys } from "./import-keys";
import { google } from "@google-cloud/kms/build/protos/protos";
import { JSONSerializedBuffer } from "../common.types";

export interface ImportKeysIdTokenData {
  keyName: string;
  wrappedSignKey: string | JSONSerializedBuffer;
  wrappedEncryptDecryptKey: string | JSONSerializedBuffer;
}

export interface ImportKeysResponseData {
  data: {
    signKeyVersion: google.cloud.kms.v1.ICryptoKeyVersion;
    encryptDecryptVersion: google.cloud.kms.v1.ICryptoKeyVersion;
  };
};

export function importKeysHandlerFactory() {
  return async (req: ExpressRequestWithToken<ImportKeysIdTokenData>, res: express.Response) => {
    const { idToken } = req;
    const { data } = idToken;

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub || !data.wrappedSignKey || !data.wrappedEncryptDecryptKey) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    logRequestStart(Route.IMPORT_KEYS, idToken);

    const { wrappedSignKey, wrappedEncryptDecryptKey } = data;
    const wrappedSignKeyParam = typeof wrappedSignKey === 'string' ? wrappedSignKey : new Uint8Array(Object.values(wrappedSignKey));
    const wrappedEncryptDecryptKeyParam = typeof wrappedEncryptDecryptKey === 'string' ? wrappedEncryptDecryptKey : new Uint8Array(Object.values(wrappedEncryptDecryptKey));

    const importKeysResult = await importKeys(
      idToken.sub,
      wrappedSignKeyParam,
      wrappedEncryptDecryptKeyParam,
    );

    logRequestSuccess(Route.IMPORT_KEYS, idToken);

    res.json({ data: importKeysResult } satisfies ImportKeysResponseData);
  };
}
