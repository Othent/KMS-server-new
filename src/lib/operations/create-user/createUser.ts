import { createKMSUser } from "../../utils/kms/createKMSUser";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { updateAuth0User } from "../../utils/auth/updateAuth0User";

export async function createUser(sub: string, importOnly = false) {
  try {
    await createKMSUser(sub, importOnly);
  } catch (err) {
    throw createOrPropagateError(
      OthentErrorID.UserCreation,
      500,
      "Error creating KMS user",
      err,
    );
  }

  if (!importOnly) {
    await updateAuth0User(sub);
  }

  // TODO: Return the created user and keys status?
  return true;
}
