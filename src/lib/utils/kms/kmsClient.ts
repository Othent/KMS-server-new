import { KeyManagementServiceClient } from "@google-cloud/kms";
import { LocalKeyManagementServiceClient } from "./localKeyManagementServiceClient";
import { CONFIG } from "../../server/config/config.utils";

export const kmsClient = CONFIG.IS_PROD
  ? new KeyManagementServiceClient({
      credentials: CONFIG.GOOGLE_CREDENTIALS,
    })
  : new LocalKeyManagementServiceClient() as unknown as KeyManagementServiceClient;
