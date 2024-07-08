import { KeyManagementServiceClient } from "@google-cloud/kms";
import * as dotEnv from "dotenv";
import { GOOGLE_CREDENTIALS } from "../config/config.constants";
import { LocalKeyManagementServiceClient } from "./localKeyManagementServiceClient";

dotEnv.config();

function createKMSClient() {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    return new LocalKeyManagementServiceClient();
  }

  if (!GOOGLE_CREDENTIALS) {
    console.log("Please specify a googleCredentials file in the .env");
    throw new Error("Please specify a googleCredentials file in the .env");
  }

  return new KeyManagementServiceClient({
    credentials: GOOGLE_CREDENTIALS,
  });
}

export const kmsClient = createKMSClient();
