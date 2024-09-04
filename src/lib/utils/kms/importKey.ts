import { CONFIG } from "../../server/config/config.utils";
import { changeId } from "../tools/changeId";
import { normalizeCryptoKeyVersionState } from "./google-kms.types";
import { kmsClient } from "./kmsClient";

export async function fetchKMSImportJob(sub: string) {
  const safeId = changeId(sub);

  const importJobName = kmsClient.importJobPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    safeId,
    CONFIG.KMS_IMPORT_JOB_ID,
  );

  const [importJob] = await kmsClient.getImportJob({
    name: importJobName,
  });

  return importJob;
}

export async function importKMSKeys(
  sub: string,
  wrappedSignKey: null | string | Uint8Array,
  wrappedEncryptDecryptKey: null | string | Uint8Array,
) {
  const safeId = changeId(sub);

  const importJobName = kmsClient.importJobPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    safeId,
    CONFIG.KMS_IMPORT_JOB_ID
  );

  const signCryptoKeyName = kmsClient.cryptoKeyPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    safeId,
    CONFIG.KMS_SIGN_KEY_ID,
  );

  const encryptDecryptCryptoKeyName = kmsClient.cryptoKeyPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    safeId,
    CONFIG.KMS_ENCRYPT_DECRYPT_KEY_ID,
  );

  // const kmsClient = new KeyManagementServiceClient();
  // return await kmsClient.importCryptoKeyVersion({
  //   parent: `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/${cryptoKeyId}`,
  //   algorithm: 'RSA_SIGN_PSS_4096_SHA256',
  //   importJob: `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/importJobs/${importJobId}`,
  //   // wrappedKey: rsaAesWrappedKey
  // });

  const signKeyImportPromise = wrappedSignKey ? kmsClient.importCryptoKeyVersion({
    parent: signCryptoKeyName,
    importJob: importJobName,
    algorithm: CONFIG.KMS_SIGN_KEY_ALGORITHM,
    wrappedKey: wrappedSignKey,
  }) : [null];

  const encryptDecryptKeyImportPromise = wrappedEncryptDecryptKey ? kmsClient.importCryptoKeyVersion({
    parent: encryptDecryptCryptoKeyName,
    importJob: importJobName,
    algorithm: CONFIG.KMS_ENCRYPT_DECRYPT_KEY_ALGORITHM,
    wrappedKey: wrappedEncryptDecryptKey,
  }) : [null];

  const [
    [signKeyVersion],
    [encryptDecryptKeyVersion]
  ] = await Promise.all([
    signKeyImportPromise,
    encryptDecryptKeyImportPromise,
  ]);

  return {
    signKeyState: signKeyVersion ? normalizeCryptoKeyVersionState(signKeyVersion) : null,
    encryptDecryptKeyState: encryptDecryptKeyVersion ? normalizeCryptoKeyVersionState(encryptDecryptKeyVersion) : null,
  };
}

export async function fetchKMSKeysState(sub: string) {
  const signCryptoKeyName = kmsClient.cryptoKeyVersionPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    changeId(sub),
    CONFIG.KMS_SIGN_KEY_ID,
    CONFIG.KMS_SIGN_KEY_VERSION,
  );

  const encryptDecryptCryptoKeyName = kmsClient.cryptoKeyVersionPath(
    CONFIG.KMS_PROJECT_ID,
    CONFIG.KMS_PROJECT_LOCATION,
    changeId(sub),
    CONFIG.KMS_ENCRYPT_DECRYPT_KEY_ID,
    CONFIG.KMS_ENCRYPT_DECRYPT_KEY_VERSION,
  );

  const signKeyVersionPromise = kmsClient.getCryptoKeyVersion({
    name: signCryptoKeyName,
  });

  const encryptDecryptKeyVersionPromise = kmsClient.getCryptoKeyVersion({
    name: encryptDecryptCryptoKeyName,
  });

  const [
    [signKeyVersion],
    [encryptDecryptKeyVersion]
  ] = await Promise.all([
    signKeyVersionPromise,
    encryptDecryptKeyVersionPromise,
  ]);

  return {
    signCryptoKeyName,
    encryptDecryptCryptoKeyName,
    signKeyState: normalizeCryptoKeyVersionState(signKeyVersion),
    encryptDecryptKeyState: normalizeCryptoKeyVersionState(encryptDecryptKeyVersion),
  };
}
