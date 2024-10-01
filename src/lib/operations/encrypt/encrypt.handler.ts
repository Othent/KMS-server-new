import express from "express";
import { encrypt } from "./encrypt";
import { ExpressRequestWithToken } from "../../utils/auth/auth0.types";
import { Route } from "../../server/server.constants";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { BaseOperationIdTokenData, LegacyBaseOperationIdTokenData } from "../common.types";
import { validateEncryptIdTokenOrThrow } from "./encrypt.validation";
import { B64String, B64UrlString } from "../../utils/lib/binary-data-types/binary-data-types.types";
import { LegacyBufferData, LegacyBufferObject } from "../../utils/lib/legacy-serialized-buffers/legacy-serialized-buffer.types";
import { normalizeLegacyBufferDataOrB64, toLegacyBufferObject } from "../../utils/lib/legacy-serialized-buffers/legacy-serialized-buffer.utils";
import { B64 } from "../../utils/lib/binary-data-types/binary-data-types.utils";

/**
 * @deprecated
 */
export interface LegacyEncryptIdTokenData extends LegacyBaseOperationIdTokenData {
  plaintext: LegacyBufferData | string;
}

export interface EncryptIdTokenData extends BaseOperationIdTokenData<Route.ENCRYPT> {
  plaintext: B64String | B64UrlString;
}

export interface LegacyEncryptResponseData {
  data: LegacyBufferObject;
};

export interface EncryptResponseData {
  encryptedData: B64String;
};

export function encryptHandlerFactory() {
  return async (
    req: ExpressRequestWithToken<EncryptIdTokenData | LegacyEncryptIdTokenData>,
    res: express.Response,
  ) => {
    const { idToken } = req;

    logRequestStart(Route.ENCRYPT, idToken);

    validateEncryptIdTokenOrThrow(idToken);

    const { data } = idToken;
    const isLegacyData = !data.hasOwnProperty("path");
    const treatStringAsB64 = !isLegacyData;

    const plaintextBuffer = normalizeLegacyBufferDataOrB64(data.plaintext, treatStringAsB64);
    const ciphertext = await encrypt(idToken, plaintextBuffer);

    logRequestSuccess(Route.ENCRYPT, idToken);

    res.send(
      isLegacyData
        ? { data: toLegacyBufferObject(ciphertext) } satisfies LegacyEncryptResponseData
        : { encryptedData: B64.from(ciphertext) } satisfies EncryptResponseData
    );
  };
}
