import { KeyManagementServiceClient } from "@google-cloud/kms";
import { LocalKeyManagementServiceClient } from "./localKeyManagementServiceClient";
import { CONFIG } from "../../server/config/config.utils";

const { KMS_ENVIRONMENT } = CONFIG;

let kmsClient: KeyManagementServiceClient | LocalKeyManagementServiceClient;

if (KMS_ENVIRONMENT === "DEVELOPMENT_SERVER" || KMS_ENVIRONMENT === "PRODUCTION_SERVER") {
  kmsClient = new KeyManagementServiceClient({
    credentials: CONFIG.GOOGLE_CREDENTIALS,
  });

  if (process.env.NODE_ENV !== "test") {
    setTimeout(() => {
      const warningMessage = `!!  ⚠️  Using a real (${ KMS_ENVIRONMENT }) Google KMS server!  !!`;
      const warningMessageSeparators = "!".repeat(warningMessage.length - 1);
      const YELLOW = "\x1b[33m";
      const RED = "\x1b[31m";
      const RESET = "\x1b[0m";
      const WARNING_COLOR = KMS_ENVIRONMENT.startsWith("DEVELOPMENT") ? YELLOW : RED;

      console.log(`${ WARNING_COLOR }${ warningMessageSeparators }`);
      console.log(warningMessage);
      console.log(`${ warningMessageSeparators }${ RESET }`);
      console.log();
    }, 1000);
  }
} else if (KMS_ENVIRONMENT === "LOCAL_MOCK") {
  try {
    const localKeyManagementServiceClient = new LocalKeyManagementServiceClient();

    kmsClient = localKeyManagementServiceClient;

    if (process.env.NODE_ENV !== "test") {
      setTimeout(() => {
        localKeyManagementServiceClient.testLocalKeyManagementServiceClient();
      }, 1000);
    }
  } catch (err) {
    // For some weird reason, while running `localKeyManagementServiceClass.spec.ts`, the
    // `new LocalKeyManagementServiceClient()` above throws:
    //
    // > TypeError: localKeyManagementServiceClient_1.LocalKeyManagementServiceClient is not a constructor
    //
    // Despite this file (`kmsClient.ts`) not being part of that test.

    if (process.env.NODE_ENV !== "test") throw err;
  }
} else {
  throw new Error("Cannot initialize `kmsClient`.");
}

export { kmsClient };
