import { CONFIG } from "../../server/config/config.utils";
import { changeId } from "../tools/changeId";
import { delay } from "../tools/delay";
import { kmsClient, PROJECT_LOCATION, PROJECT_NAME } from "./kmsClient";
import axios from "axios";

async function createKeyRing(safeId: string) {
  const parent = kmsClient.locationPath(PROJECT_NAME, PROJECT_LOCATION);

  const [keyRing] = await kmsClient.createKeyRing({
    parent: parent,
    keyRingId: safeId,
  });

  // TODO: Better this way?
  // const keyRingName = kmsClient.keyRingPath(PROJECT_NAME, PROJECT_LOCATION, safeId);

  return keyRing;
}

async function createSignKey(safeId: string) {
  const [key] = await kmsClient.createCryptoKey({
    parent: `projects/${ PROJECT_NAME }/locations/${ PROJECT_LOCATION }/keyRings/${safeId}`,
    cryptoKeyId: "sign",
    cryptoKey: {
      purpose: "ASYMMETRIC_SIGN",
      versionTemplate: {
        algorithm: "RSA_SIGN_PSS_4096_SHA256",
      },
      importOnly: true,
    },
    skipInitialVersionCreation: true,
  });

  return key;
}

async function createEncryptDecryptKey(safeId: string) {
  const [key] = await kmsClient.createCryptoKey({
    parent: `projects/${ PROJECT_NAME }/locations/${ PROJECT_LOCATION }/keyRings/${safeId}`,
    cryptoKeyId: "encryptDecrypt",
    cryptoKey: {
      purpose: "ENCRYPT_DECRYPT",
      versionTemplate: {
        algorithm: "GOOGLE_SYMMETRIC_ENCRYPTION",
      },
      importOnly: true,
    },
    skipInitialVersionCreation: true,
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
  const [importJob] = await kmsClient.createImportJob({
    parent: `projects/${ PROJECT_NAME }/locations/${ PROJECT_LOCATION }/keyRings/${safeId}`,
    importJobId: "importJob",
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

export async function createKMSUser(sub: string) {
  const safeId = changeId(sub);

  await createKeyRing(safeId);

  await Promise.all([
    createSignKey(safeId),
    createEncryptDecryptKey(safeId),
    createImportJob(safeId),
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
