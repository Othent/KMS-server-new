import { kmsClient } from "./kmsClient";

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
  return true;
}
