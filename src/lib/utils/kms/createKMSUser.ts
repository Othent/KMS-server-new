import { kmsClient } from "./kmsClient";
import axios from "axios";

async function createKeyRing(keyRingName: string) {
  const parent = kmsClient.locationPath("auth-custom-try", "global");
  const [keyRing] = await kmsClient.createKeyRing({
    parent: parent,
    keyRingId: keyRingName,
  });
  return keyRing;
}

async function createSignKey(keyRingName: string) {
  const [key] = await kmsClient.createCryptoKey({
    parent: `projects/auth-custom-try/locations/global/keyRings/${keyRingName}`,
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

async function createEncryptDecryptKey(keyRingName: string) {
  const [key] = await kmsClient.createCryptoKey({
    parent: `projects/auth-custom-try/locations/global/keyRings/${keyRingName}`,
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

async function ping(user: string) {
  const message = `New account generated on Othent 2.0 ${user}`;
  await axios
    .post(
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
    )
    .catch((error) => console.error(error));
}

export async function createKMSUser(userName: string) {
  try {
    await createKeyRing(userName);
  } catch (e) {
    console.log(e);
    return false;
  }
  try {
    await createSignKey(userName);
  } catch (e) {
    console.log(e);
    return false;
  }
  try {
    await createEncryptDecryptKey(userName);
  } catch (e) {
    console.log(e);
    return false;
  }
  try {
    await ping(userName);
  } catch (e) {
    console.log(e);
    return false;
  }
  return true;
}
