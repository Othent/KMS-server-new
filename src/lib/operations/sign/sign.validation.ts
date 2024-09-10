import { z } from "zod";
import { extendLegacyBaseOperationIdTokenDataSchema, extendBaseOperationIdTokenDataSchema, LegacyBufferDataOrStringSchema } from "../common.validation";
import { Route } from "../../server/server.constants";
import { IdTokenWithData } from "../../utils/auth/auth0";
import { SignIdTokenData, LegacySignIdTokenData } from "./sign.handler";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";

const LegacySignIdTokenDataSchema = extendLegacyBaseOperationIdTokenDataSchema({
  data: LegacyBufferDataOrStringSchema,
});

const SignIdTokenDataSchema = extendBaseOperationIdTokenDataSchema(Route.SIGN, {
  data: z.string().trim().min(1),
});

const SignIdTokenDataSchemas = z.union([
  LegacySignIdTokenDataSchema,
  SignIdTokenDataSchema,
]);

export function validateSignIdTokenOrThrow(
  idToken?: IdTokenWithData<SignIdTokenData | LegacySignIdTokenData>,
) {
  const isValid = !!idToken && SignIdTokenDataSchemas.safeParse(idToken).success;

  if (!isValid) {
    throw createOrPropagateError(
      OthentErrorID.Validation,
      400,
      "Invalid token data for sign()",
    );
  }

  return true;
}
