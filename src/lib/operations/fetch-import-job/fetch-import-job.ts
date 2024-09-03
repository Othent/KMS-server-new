import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { fetchKMSImportJob } from "../../utils/kms/importKey";

export async function fetchImportJob(sub: string) {
  try {
    return fetchKMSImportJob(sub);
  } catch (err) {
    throw createOrPropagateError(
      OthentErrorID.UserCreation,
      500,
      "Error creating KMS user",
      err,
    );
  }
}
