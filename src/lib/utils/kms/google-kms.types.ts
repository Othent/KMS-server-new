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
