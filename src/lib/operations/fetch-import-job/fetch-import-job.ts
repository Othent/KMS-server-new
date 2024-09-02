import axios from "axios";
import { getPublicKey } from "../../utils/kms/getPublicKey";
import { ownerToAddress } from "../../utils/arweave/arweaveUtils";
import { getAuth0URL } from "../../utils/auth/auth0";
import { CONFIG } from "../../server/config/config.utils";
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
