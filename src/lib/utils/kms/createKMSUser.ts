import { CONFIG } from "../../server/config/config.utils";
import { changeId } from "../tools/changeId";
import { delay } from "../tools/delay";
import { kmsClient } from "./kmsClient";
import axios from "axios";

async function createKeyRing(safeId: string) {
  const locationPath = kmsClient.locationPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
  );

  const [keyRing] = await kmsClient.createKeyRing({
    parent: locationPath,
    keyRingId: safeId,
  });

  return keyRing;
}

async function createSignKey(safeId: string, importOnly = false) {
  const keyRingPath = kmsClient.keyRingPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    safeId
  );

  const [key] = await kmsClient.createCryptoKey({
    parent: keyRingPath,
    cryptoKeyId: CONFIG.KMS_SIGN_KEY_ID,
    cryptoKey: {
      purpose: "ASYMMETRIC_SIGN",
      versionTemplate: {
        algorithm: CONFIG.KMS_SIGN_KEY_ALGORITHM,
      },
      importOnly,
    },
    skipInitialVersionCreation: importOnly,
  });

  return key;
}

async function createEncryptDecryptKey(safeId: string, importOnly = false) {
  const keyRingPath = kmsClient.keyRingPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    safeId
  );

  const [key] = await kmsClient.createCryptoKey({
    parent: keyRingPath,
    cryptoKeyId: CONFIG.KMS_ENCRYPT_DECRYPT_KEY_ID,
    cryptoKey: {
      purpose: "ENCRYPT_DECRYPT",
      versionTemplate: {
        algorithm: CONFIG.KMS_ENCRYPT_DECRYPT_KEY_ALGORITHM,
      },
      importOnly,
    },
    skipInitialVersionCreation: importOnly,
  });

  return key;
}

// Previous PoC:
// async function createImportJob(importJobId: string) {
//   return await kmsClient.createImportJob({
//     parent: "projects/auth-custom-try/locations/global/keyRings/Canada-Dry",
//     importJobId: importJobId,
//     importJob: {
//       importMethod: "RSA_OAEP_4096_SHA1_AES_256",
//       protectionLevel: "SOFTWARE",
//       // publicKey: { pem: PublicPemJWK }
//     },
//   });
// }

// New PoC:
async function createImportJob(safeId: string) {
  const keyRingPath = kmsClient.keyRingPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    safeId
  );

  const [importJob] = await kmsClient.createImportJob({
    parent: keyRingPath,
    importJobId: CONFIG.KMS_IMPORT_JOB_ID,
    importJob: {
      protectionLevel: 'HSM',
      importMethod: 'RSA_OAEP_3072_SHA256',
    },
  });

  return importJob;

}

async function ping(safeId: string) {
  const message = `New account generated on Othent 2.0 ${safeId}`;

  return axios.post(
    "https://slack.com/api/chat.postMessage",
    {
      channel: CONFIG.SLACK_CHANNEL_ID,
      text: message,
    },
    {
      headers: {
        Authorization: `Bearer ${CONFIG.SLACK_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );
}

export async function createKMSUser(sub: string, importOnly = false) {
  const safeId = changeId(sub);

  await createKeyRing(safeId);

  await Promise.all([
    createSignKey(safeId, importOnly),
    createEncryptDecryptKey(safeId, importOnly),
    importOnly ? createImportJob(safeId) : undefined,
  ]);

  // Skip the Slack ping when running locally:
  if (CONFIG.SLACK_ENABLED) {
    try {
      await ping(safeId);
    } catch (err) {
      console.log("Ping failed silently:", err);
    }
  }

  // Wait for the key to be generated...
  await delay(2000);
}
