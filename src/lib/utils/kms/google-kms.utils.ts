import { CONFIG } from "../../server/config/config.utils";
import { IdTokenWithData } from "../auth/auth0.types";
import { kmsClient } from "./kmsClient";
import { google } from "@google-cloud/kms/build/protos/protos";

export import CryptoKeyVersionState = google.cloud.kms.v1.CryptoKeyVersion.CryptoKeyVersionState;

export type ImportJob = Pick<google.cloud.kms.v1.IImportJob, "state" | "publicKey">;

export function normalizeCryptoKeyVersionState(keyVersion: google.cloud.kms.v1.ICryptoKeyVersion) {
  return (
    keyVersion.state ? (
      typeof keyVersion.state === "string" ? CryptoKeyVersionState[keyVersion.state] : keyVersion.state
    ) : CryptoKeyVersionState.CRYPTO_KEY_VERSION_STATE_UNSPECIFIED
  ) satisfies CryptoKeyVersionState;
}

export function getKeyRingIdFromIdToken(idToken: IdTokenWithData<any>): string {
  if (!idToken.sub) throw new Error("Cannot retrieve KeyRing ID.");

  return idToken.sub.replace("|", "0");
}

export function getLocationPath() {
  const locationPath = kmsClient.locationPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
  );

  return { locationPath };
}

export function getKeyRingPath<T>(idToken: IdTokenWithData<T>) {
  const keyRingPath = kmsClient.keyRingPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    getKeyRingIdFromIdToken(idToken),
  );

  return { keyRingPath };
}

export function getImportJobPath<T>(idToken: IdTokenWithData<T>) {
  const importJobPath = kmsClient.importJobPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    getKeyRingIdFromIdToken(idToken),
    CONFIG.KMS_IMPORT_JOB_ID
  );

  return { importJobPath };
}

export function getEncryptDecryptKeyPath<T>(idToken: IdTokenWithData<T>) {
  // TODO: Why cryptoKeyPath and not cryptoKeyVersionPath?
  const encryptDecryptKeyPath = kmsClient.cryptoKeyPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    getKeyRingIdFromIdToken(idToken),
    CONFIG.KMS_ENCRYPT_DECRYPT_KEY_ID,
  );

  return { encryptDecryptKeyPath };
}

export function getEncryptDecryptKeyVersionPath<T>(idToken: IdTokenWithData<T>) {
  // TODO: Related to the comment above. This is only used when importing the keys.
  const encryptDecryptKeyVersionPath = kmsClient.cryptoKeyVersionPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    getKeyRingIdFromIdToken(idToken),
    CONFIG.KMS_ENCRYPT_DECRYPT_KEY_ID,
    CONFIG.KMS_ENCRYPT_DECRYPT_KEY_VERSION,
  );

  return { encryptDecryptKeyVersionPath };
}

export function getSignKeyPath<T>(idToken: IdTokenWithData<T>) {
  const signKeyPath = kmsClient.cryptoKeyPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    getKeyRingIdFromIdToken(idToken),
    CONFIG.KMS_SIGN_KEY_ID,
  );

  return { signKeyPath };
}

export function getSignKeyVersionPath<T>(idToken: IdTokenWithData<T>) {
  const signKeyVersionPath = kmsClient.cryptoKeyVersionPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    getKeyRingIdFromIdToken(idToken),
    CONFIG.KMS_SIGN_KEY_ID,
    CONFIG.KMS_SIGN_KEY_VERSION,
  );

  return { signKeyVersionPath };
}
