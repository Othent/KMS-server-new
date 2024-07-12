import { useSlack } from "../../server/config/config.utils";
import { changeId } from "../tools/changeId";
import { delay } from "../tools/delay";
import { kmsClient } from "./kmsClient";
import axios from "axios";

async function createKeyRing(safeId: string) {
  const parent = kmsClient.locationPath("auth-custom-try", "global");
  const [keyRing] = await kmsClient.createKeyRing({
    parent: parent,
    keyRingId: safeId,
  });

  return keyRing;
}

async function createSignKey(safeId: string) {
  const [key] = await kmsClient.createCryptoKey({
    parent: `projects/auth-custom-try/locations/global/keyRings/${safeId}`,
    cryptoKeyId: "sign",
    cryptoKey: {
      purpose: "ASYMMETRIC_SIGN",
      versionTemplate: {
        algorithm: "RSA_SIGN_PSS_4096_SHA256",
      },
    },
  });

  return key;
}

async function createEncryptDecryptKey(safeId: string) {
  const [key] = await kmsClient.createCryptoKey({
    parent: `projects/auth-custom-try/locations/global/keyRings/${safeId}`,
    cryptoKeyId: "encryptDecrypt",
    cryptoKey: {
      purpose: "ENCRYPT_DECRYPT",
      versionTemplate: {
        algorithm: "GOOGLE_SYMMETRIC_ENCRYPTION",
      },
    },
  });

  return key;
}

async function ping(safeId: string) {
  const message = `New account generated on Othent 2.0 ${safeId}`;

  return axios.post(
    "https://slack.com/api/chat.postMessage",
    {
      channel: process.env.SLACK_CHANNEL_ID,
      text: message,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );
}

export async function createKMSUser(sub: string) {
  const safeId = changeId(sub);

  await createKeyRing(safeId);

  await Promise.all([createSignKey(safeId), createEncryptDecryptKey(safeId)]);

  // Skip the Slack ping when running locally:
  if (useSlack) {
    try {
      await ping(safeId);
    } catch (err) {
      console.log("Ping failed silently:", err);
    }
  }

  // Wait for the key to be generated...
  await delay(2000);
}
