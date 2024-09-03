import { CONFIG } from "../../server/config/config.utils";
import { changeId } from "../tools/changeId";
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
  wrappedSignKey: string | Uint8Array,
  wrappedEncryptDecryptKey: string | Uint8Array,
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

  const signKeyImportPromise = kmsClient.importCryptoKeyVersion({
    parent: signCryptoKeyName,
    importJob: importJobName,
    algorithm: CONFIG.KMS_SIGN_KEY_ALGORITHM,
    wrappedKey: wrappedSignKey,
  });

  const encryptDecryptKeyImportPromise = kmsClient.importCryptoKeyVersion({
    parent: encryptDecryptCryptoKeyName,
    importJob: importJobName,
    algorithm: CONFIG.KMS_ENCRYPT_DECRYPT_KEY_ALGORITHM,
    wrappedKey: wrappedEncryptDecryptKey,
  });

  const [
    [signKeyVersion],
    [encryptDecryptVersion]
  ] = await Promise.all([
    signKeyImportPromise,
    encryptDecryptKeyImportPromise,
  ]);

  return {
    signKeyVersion,
    encryptDecryptVersion,
  };
}
