import { z } from "zod";
import { extendLegacyBaseOperationIdTokenDataSchema, extendBaseOperationIdTokenDataSchema, LegacyBufferDataOrStringSchema } from "../common.validation";
import { Route } from "../../server/server.constants";
import { IdTokenWithData } from "../../utils/auth/auth0.utils";
import { CreateUserIdTokenData, LegacyCreateUserIdTokenData } from "./create-user.handler";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";

const LegacyCreateUserIdTokenDataSchema = z.object({
  sub: z.string(),
  data: z.never(),
});

const CreateUserIdTokenDataSchema = extendBaseOperationIdTokenDataSchema(Route.CREATE_USER, {
  importOnly: z.boolean(),
});

const CreateUserIdTokenDataSchemas = z.union([
  LegacyCreateUserIdTokenDataSchema,
  CreateUserIdTokenDataSchema,
]);

export function validateCreateUserIdTokenOrThrow(
  idToken?: IdTokenWithData<CreateUserIdTokenData | LegacyCreateUserIdTokenData>,
) {
  const isValid = !!idToken && CreateUserIdTokenDataSchemas.safeParse(idToken).success;

  if (!isValid) {
    throw createOrPropagateError(
      OthentErrorID.Validation,
      400,
      "Invalid token data for createUser()",
    );
  }

  return true;
}
