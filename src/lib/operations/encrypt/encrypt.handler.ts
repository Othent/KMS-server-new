import express from "express";
import { encrypt } from "./encrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { LegacyBufferData, normalizeBufferData } from "../common.types";

export interface EncryptIdTokenData {
  /**
   * @deprecated
   */
  keyName: string;
  fn: "encrypt";
  // plaintext: B64UrlString | LegacyBufferData;
  plaintext: LegacyBufferData;
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

    // TODO: Only in the new version (old one didn't have fn in data, but had keyName):
    // || data.fn !== "encrypt"

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub || !data || !data.plaintext) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data for encrypt()",
      );
    }

    logRequestStart(Route.ENCRYPT, idToken);

    const plaintextBuffer = normalizeBufferData(data.plaintext);

    console.log(data.plaintext);
    console.log(plaintextBuffer);

    const ciphertext = await encrypt(idToken, plaintextBuffer);

    logRequestSuccess(Route.ENCRYPT, idToken);

    res.send({ data: ciphertext } satisfies EncryptResponseData);
  };
}
