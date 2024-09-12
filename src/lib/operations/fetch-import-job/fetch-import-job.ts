import { IdTokenWithData } from "../../utils/auth/auth0.types";
import { kmsClient } from "../../utils/kms/kmsClient";
import { getImportJobPath } from "../../utils/kms/google-kms.utils";
import { FetchImportJobIdTokenData } from "./fetch-import-job.handler";

export async function fetchImportJob(idToken: IdTokenWithData<FetchImportJobIdTokenData>) {
  const { importJobPath } = getImportJobPath(idToken);

  const [importJob] = await kmsClient.getImportJob({
    name: importJobPath,
  });

  return importJob;
}
