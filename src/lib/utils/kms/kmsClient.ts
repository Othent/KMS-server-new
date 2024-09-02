import { KeyManagementServiceClient } from "@google-cloud/kms";
import { LocalKeyManagementServiceClient } from "./localKeyManagementServiceClient";
import { CONFIG } from "../../server/config/config.utils";

// TODO: Replace with config.constants.ts:
export const PROJECT_NAME = "dani-experiments";
export const PROJECT_LOCATION = "global";

export const kmsClient = CONFIG.IS_PROD
  ? new KeyManagementServiceClient({
      credentials: CONFIG.GOOGLE_CREDENTIALS,
    })
  : new LocalKeyManagementServiceClient() as unknown as KeyManagementServiceClient;
