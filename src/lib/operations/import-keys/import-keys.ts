import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { importKMSKeys } from "../../utils/kms/importKey";

export async function importKeys(
  sub: string,
  wrappedSignKey: null | string | Uint8Array,
  wrappedEncryptDecryptKey: null | string | Uint8Array,
) {
  try {
    return importKMSKeys(sub, wrappedSignKey, wrappedEncryptDecryptKey);
  } catch (err) {
    throw createOrPropagateError(
      OthentErrorID.UserCreation,
      500,
      "Error creating KMS user",
      err,
    );
  }
}
