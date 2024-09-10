import { z } from "zod";
import { extendLegacyBaseOperationIdTokenDataSchema, extendBaseOperationIdTokenDataSchema, LegacyBufferDataOrStringSchema } from "../common.validation";
import { Route } from "../../server/server.constants";
import { IdTokenWithData } from "../../utils/auth/auth0";
import { DecryptIdTokenData, LegacyDecryptIdTokenData } from "./decrypt.handler";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";

const LegacyDecryptIdTokenDataSchema = extendLegacyBaseOperationIdTokenDataSchema({
  ciphertext: LegacyBufferDataOrStringSchema,
});

const DecryptIdTokenDataSchema = extendBaseOperationIdTokenDataSchema(Route.DECRYPT, {
  ciphertext: z.string().trim().min(1),
});

const DecryptIdTokenDataSchemas = z.union([
  LegacyDecryptIdTokenDataSchema,
  DecryptIdTokenDataSchema,
]);

export function validateDecryptIdTokenOrThrow(
  idToken?: IdTokenWithData<DecryptIdTokenData | LegacyDecryptIdTokenData>,
) {
  const isValid = !!idToken && DecryptIdTokenDataSchemas.safeParse(idToken).success;

  if (!isValid) {
    throw createOrPropagateError(
      OthentErrorID.Validation,
      400,
      "Invalid token data for decrypt()",
    );
  }

  return true;
}
