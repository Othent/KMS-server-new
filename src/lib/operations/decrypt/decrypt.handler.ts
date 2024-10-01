import express from "express";
import { decrypt } from "./decrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0.types";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { BaseOperationIdTokenData, LegacyBaseOperationIdTokenData } from "../common.types";
import { validateDecryptIdTokenOrThrow } from "./decrypt.validation";
import { LegacyBufferData, LegacyBufferObject } from "../../utils/lib/legacy-serialized-buffers/legacy-serialized-buffer.types";
import { B64String, B64UrlString } from "../../utils/lib/binary-data-types/binary-data-types.types";
import { normalizeLegacyBufferDataOrB64, toLegacyBufferObject } from "../../utils/lib/legacy-serialized-buffers/legacy-serialized-buffer.utils";
import { B64 } from "../../utils/lib/binary-data-types/binary-data-types.utils";

/**
 * @deprecated
 */
export interface LegacyDecryptIdTokenData extends LegacyBaseOperationIdTokenData {
  ciphertext: LegacyBufferData | string;
}

export interface DecryptIdTokenData extends BaseOperationIdTokenData<Route.DECRYPT> {
  ciphertext: B64String | B64UrlString;
}

export interface LegacyDecryptResponseData {
  data: LegacyBufferObject;
};

export interface DecryptResponseData {
  decryptedData: B64String;
};

export function decryptHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<DecryptIdTokenData | LegacyDecryptIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;

    logRequestStart(Route.DECRYPT, idToken);

    validateDecryptIdTokenOrThrow(idToken);

    const { data } = idToken;
    const isLegacyData = !data.hasOwnProperty("path");
    const treatStringAsB64 = !isLegacyData;

    const ciphertextBuffer = normalizeLegacyBufferDataOrB64(data.ciphertext, treatStringAsB64);
    const plaintext = await decrypt(idToken, ciphertextBuffer);

    logRequestSuccess(Route.DECRYPT, idToken);

    res.send(
      isLegacyData
        ? { data: toLegacyBufferObject(plaintext) } satisfies LegacyDecryptResponseData
        : { decryptedData: B64.from(plaintext) } satisfies DecryptResponseData
    );
  };
}
