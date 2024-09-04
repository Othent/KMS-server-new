import express from "express";
import { decrypt } from "./decrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { JSONSerializedBuffer } from "../common.types";

export interface DecryptIdTokenData {
  /**
   * @deprecated
   */
  keyName: string;
  fn: "decrypt";
  // ciphertext: B64UrlString;
  ciphertext: string | JSONSerializedBuffer;
}

export interface DecryptResponseData {
  data: Uint8Array;
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
        "Invalid token data",
      );
    }

    logRequestStart(Route.DECRYPT, idToken);

    const { ciphertext } = data;
    const ciphertextParam = typeof ciphertext === 'string' ? ciphertext : new Uint8Array(Object.values(ciphertext));

    const plaintext = await decrypt(idToken, ciphertextParam);

    logRequestSuccess(Route.DECRYPT, idToken);

    res.send({ data: plaintext } satisfies DecryptResponseData);
  };
}
