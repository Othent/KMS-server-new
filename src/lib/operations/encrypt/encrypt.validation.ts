import { z } from "zod";
import { extendLegacyBaseOperationIdTokenDataSchema, extendBaseOperationIdTokenDataSchema, LegacyBufferDataOrStringSchema } from "../common.validation";
import { Route } from "../../server/server.constants";
import { IdTokenWithData } from "../../utils/auth/auth0";
import { EncryptIdTokenData, LegacyEncryptIdTokenData } from "./encrypt.handler";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";

const LegacyEncryptIdTokenDataSchema = extendLegacyBaseOperationIdTokenDataSchema({
  plaintext: LegacyBufferDataOrStringSchema,
});

const EncryptIdTokenDataSchema = extendBaseOperationIdTokenDataSchema(Route.ENCRYPT, {
  plaintext: z.string(),
});

const EncryptIdTokenDataSchemas = z.union([
  LegacyEncryptIdTokenDataSchema,
  EncryptIdTokenDataSchema,
]);

export function validateEncryptIdTokenOrThrow(
  idToken?: IdTokenWithData<EncryptIdTokenData | LegacyEncryptIdTokenData>,
) {
  const isValid = !!idToken && EncryptIdTokenDataSchemas.safeParse(idToken).success;

  if (!isValid) {
    throw createOrPropagateError(
      OthentErrorID.Validation,
      400,
      "Invalid token data for encrypt()",
    );
  }

  return true;
}
