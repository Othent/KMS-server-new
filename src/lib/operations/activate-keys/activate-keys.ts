import { kmsClient } from "../../utils/kms/kmsClient";
import { CONFIG } from "../../server/config/config.utils";
import { IdTokenWithData } from "../../utils/auth/auth0.types";
import { CryptoKeyVersionState, getEncryptDecryptKeyPath, getEncryptDecryptKeyVersionPath, getSignKeyPath, getSignKeyVersionPath, normalizeCryptoKeyVersionState } from "../../utils/kms/google-kms.utils";

export const ACTIVATE_KEYS_INTERVALS = [1000, 1000, 3000, 7000, 17000]; // 1s, 2s, 5s, 12s, 29s

export async function activateKeys<T>(
  idToken: IdTokenWithData<T>,
) {
  const { signKeyPath } = getSignKeyPath(idToken);
  const { signKeyVersionPath } = getSignKeyVersionPath(idToken);
  const { encryptDecryptKeyPath } = getEncryptDecryptKeyPath(idToken);
  const { encryptDecryptKeyVersionPath } = getEncryptDecryptKeyVersionPath(idToken);

  const signKeyVersionPromise = kmsClient.getCryptoKeyVersion({
    name: signKeyVersionPath,
  });

  const encryptDecryptKeyVersionPromise = kmsClient.getCryptoKeyVersion({
    name: encryptDecryptKeyVersionPath,
  });

  const [
    [signKeyVersion],
    [encryptDecryptKeyVersion]
  ] = await Promise.all([
    signKeyVersionPromise,
    encryptDecryptKeyVersionPromise,
  ]);

  const signKeyState = normalizeCryptoKeyVersionState(signKeyVersion);
  const encryptDecryptKeyState = normalizeCryptoKeyVersionState(encryptDecryptKeyVersion);

  // Only symmetric keys need to be activated:

  if (encryptDecryptKeyState === CryptoKeyVersionState.ENABLED) {
    // See https://cloud.google.com/kms/docs/importing-a-key#importing_a_manually-wrapped_key
    // See https://cloud.google.com/kms/docs/samples/kms-update-key-set-primary

    await kmsClient.updateCryptoKeyPrimaryVersion({
      name: encryptDecryptKeyPath,
      cryptoKeyVersionId: CONFIG.KMS_ENCRYPT_DECRYPT_KEY_VERSION,
    });
  }

  const signCryptoKeyPromise = await kmsClient.getCryptoKey({
    name: signKeyPath,
  });

  const encryptDecryptCryptoKeyPromise = await kmsClient.getCryptoKey({
    name: encryptDecryptKeyPath,
  });

  const [
    [signKey],
    [encryptDecryptKey]
  ] = await Promise.all([
    signCryptoKeyPromise,
    encryptDecryptCryptoKeyPromise,
  ]);

  // Once both keys are set, we can add the public key and wallet address to the user:
  // const userDetails = await updateAuth0User(idToken);

  return {
    // State:
    signKeyState,
    encryptDecryptKeyState,

    // Versions (TODO: can be improved with more/better info):
    signKeyVersion: signKey.primary?.name || `${ signKey.name || "" } (default)`.trim(),
    encryptDecryptKeyVersion: encryptDecryptKey.primary?.name || `${ encryptDecryptKey.name || "" } (default)`.trim(),

    // User:
    userDetails: null,
  };
}
