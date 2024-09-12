import { CONFIG } from "../../server/config/config.utils";
import { IdTokenWithData } from "../../utils/auth/auth0.types";
import { kmsClient } from "../../utils/kms/kmsClient";
import { getImportJobPath, getSignKeyPath, getEncryptDecryptKeyPath, normalizeCryptoKeyVersionState } from "../../utils/kms/google-kms.utils";
import { ImportKeysIdTokenData } from "./import-keys.handler";

// TODO: What if a malicious dApp tries to upload their own key?

export async function importKeys(
  idToken: IdTokenWithData<ImportKeysIdTokenData>,
  wrappedSignKey: null | string | Uint8Array,
  wrappedEncryptDecryptKey: null | string | Uint8Array,
) {
  const { importJobPath } = getImportJobPath(idToken);
  const { signKeyPath } = getSignKeyPath(idToken);
  const { encryptDecryptKeyPath  } = getEncryptDecryptKeyPath(idToken);

  const signKeyImportPromise = wrappedSignKey ? kmsClient.importCryptoKeyVersion({
    parent: signKeyPath,
    importJob: importJobPath,
    algorithm: CONFIG.KMS_SIGN_KEY_ALGORITHM,
    wrappedKey: wrappedSignKey,
  }) : [null];

  const encryptDecryptKeyImportPromise = wrappedEncryptDecryptKey ? kmsClient.importCryptoKeyVersion({
    parent: encryptDecryptKeyPath,
    importJob: importJobPath,
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
