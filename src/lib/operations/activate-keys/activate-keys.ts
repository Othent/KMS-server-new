import { fetchKMSKeysState } from "../../utils/kms/importKey";
import { kmsClient } from "../../utils/kms/kmsClient";
import { CONFIG } from "../../server/config/config.utils";
import { CryptoKeyVersionState } from "../../utils/kms/google-kms.types";

export async function activateKeys(
  sub: string,
) {
  const {
    signCryptoKeyName,
    encryptDecryptCryptoKeyName,
    signKeyState,
    encryptDecryptKeyState,
  } = await fetchKMSKeysState(sub);

  // Only symmetric keys need to be activated:

  if (encryptDecryptKeyState === CryptoKeyVersionState.ENABLED) {
    // See https://cloud.google.com/kms/docs/importing-a-key#importing_a_manually-wrapped_key
    // See https://cloud.google.com/kms/docs/samples/kms-update-key-set-primary

    await kmsClient.updateCryptoKeyPrimaryVersion({
      name: encryptDecryptCryptoKeyName,
      cryptoKeyVersionId: CONFIG.KMS_ENCRYPT_DECRYPT_KEY_VERSION,
    });

    // TODO: What if a malicious dApp tries to upload their own key?
  }

  const signCryptoKeyPromise = await kmsClient.getCryptoKey({
    name: signCryptoKeyName,
  });

  const encryptDecryptCryptoKeyPromise = await kmsClient.getCryptoKey({
    name: encryptDecryptCryptoKeyName,
  });

  const [
    [signKey],
    [encryptDecryptKey]
  ] = await Promise.all([
    signCryptoKeyPromise,
    encryptDecryptCryptoKeyPromise,
  ]);

  // Once both keys are set, we can add the public key and wallet address to the user:
  // const userDetails = await updateAuth0User(sub);

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
