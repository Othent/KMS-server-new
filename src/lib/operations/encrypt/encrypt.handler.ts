import express from "express";
import { encrypt } from "./encrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { JSONSerializedBuffer } from "../common.types";

export interface EncryptIdTokenData {
  keyName: string;
  // plaintext: B64UrlString;
  plaintext: string | JSONSerializedBuffer;
}

export interface EncryptResponseData {
  data: Uint8Array;
};

export function encryptHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<EncryptIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;
    const { data } = idToken;

    // TODO: Replace with Joi.
    if (!idToken || !data || !data.keyName || !data.plaintext) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    logRequestStart(Route.ENCRYPT, idToken);

    const { plaintext } = data;
    const plaintextParam = typeof plaintext === 'string' ? plaintext : new Uint8Array(Object.values(plaintext));

    const ciphertext = await encrypt(plaintextParam, data.keyName);

    logRequestSuccess(Route.ENCRYPT, idToken);

    res.send({ data: ciphertext } satisfies EncryptResponseData);
  };
}
