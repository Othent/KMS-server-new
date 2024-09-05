import express from "express";
import { decrypt } from "./decrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { LegacyBufferData, LegacyBufferObject, normalizeBufferData, toLegacyBufferObject } from "../common.types";

export interface DecryptIdTokenData {
  /**
   * @deprecated
   */
  keyName: string;
  fn: "decrypt";
  // ciphertext: B64UrlString | LegacyBufferData;
  ciphertext: LegacyBufferData;
}

export interface DecryptResponseData {
  data: LegacyBufferObject;
};

export function decryptHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<DecryptIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;
    const { data } = idToken;

    // TODO: Only in the new version (old one didn't have fn in data, but had keyName):
    // || data.fn !== "decrypt"

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub || !data || !data.ciphertext) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data for decrypt()",
      );
    }

    logRequestStart(Route.DECRYPT, idToken);

    const ciphertextBuffer = normalizeBufferData(data.ciphertext);

    console.log(data.ciphertext);
    console.log(ciphertextBuffer);

    const plaintext = await decrypt(idToken, ciphertextBuffer);

    logRequestSuccess(Route.DECRYPT, idToken);

    res.send({ data: toLegacyBufferObject(plaintext) } satisfies DecryptResponseData);
  };
}
