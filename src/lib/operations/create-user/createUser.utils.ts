import { CONFIG } from "../../server/config/config.utils";
import { kmsClient } from "../../utils/kms/kmsClient";
import { getKeyRingIdFromIdToken, getKeyRingPath, getLocationPath } from "../../utils/kms/google-kms.utils";
import { IdTokenWithData } from "../../utils/auth/auth0.types";
import { CreateUserIdTokenData, LegacyCreateUserIdTokenData } from "./create-user.handler";
import { logRequestInfo } from "../../utils/log/log.utils";

export async function createKeyRing(
  idToken: IdTokenWithData<CreateUserIdTokenData | LegacyCreateUserIdTokenData>,
) {
  const { locationPath } = getLocationPath();
  const keyRingId = getKeyRingIdFromIdToken(idToken);

  const [keyRing] = await kmsClient.createKeyRing({
    parent: locationPath,
    keyRingId,
  }).catch((err) => {
    if (err?.code === 6) {
      logRequestInfo(`KeyRing already exists.`);

      return [null];
    }

    throw err;
  });

  logRequestInfo(`KeyRing created.`);

  return keyRing;
}

export async function createSignKey(
  idToken: IdTokenWithData<CreateUserIdTokenData | LegacyCreateUserIdTokenData>,
  importOnly = false
) {
  const { keyRingPath } = getKeyRingPath(idToken);

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
  }).catch((err) => {
    if (err?.code === 6) {
      logRequestInfo(`SignKey already exists.`);

      return [null];
    }

    throw err;
  });

  logRequestInfo(`SignKey created.`);

  return key;
}

export async function createEncryptDecryptKey(
  idToken: IdTokenWithData<CreateUserIdTokenData | LegacyCreateUserIdTokenData>,
  importOnly = false,
) {
  const { keyRingPath } = getKeyRingPath(idToken);

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
  }).catch((err) => {
    if (err?.code === 6) {
      logRequestInfo(`EncryptDecryptKey already exists.`);

      return [null];
    }

    throw err;
  });

  logRequestInfo(`EncryptDecryptKey created.`);

  return key;
}

// Previous PoC:
// export async function createImportJob(importJobId: string) {
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
export async function createImportJob(
  idToken: IdTokenWithData<CreateUserIdTokenData | LegacyCreateUserIdTokenData>,
) {
  const { keyRingPath } = getKeyRingPath(idToken);

  const [importJob] = await kmsClient.createImportJob({
    parent: keyRingPath,
    importJobId: CONFIG.KMS_IMPORT_JOB_ID,
    importJob: {
      protectionLevel: 'HSM',
      importMethod: 'RSA_OAEP_3072_SHA256',
    },
  }).catch((err) => {
    if (err?.code === 6) {
      logRequestInfo(`ImportJob already exists.`);

      return [null];
    }

    throw err;
  });

  logRequestInfo(`ImportJob created.`);

  return importJob;
}
