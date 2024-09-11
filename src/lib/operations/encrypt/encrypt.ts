import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { IdTokenWithData } from "../../utils/auth/auth0";
import { kmsClient } from "../../utils/kms/kmsClient";
import { getEncryptDecryptKeyPath } from "../../utils/kms/google-kms.utils";
import { EncryptIdTokenData, LegacyEncryptIdTokenData } from "./encrypt.handler";
import { normalizeKMSResponseData } from "../common.types";

export async function encrypt(
  idToken: IdTokenWithData<EncryptIdTokenData | LegacyEncryptIdTokenData>,
  plaintext: Uint8Array,
) {
  const { encryptDecryptKeyPath } = getEncryptDecryptKeyPath(idToken);

  let ciphertext: string | Uint8Array | null | undefined;

  try {
    // TODO: Does Google KMS actually return string or is it always a buffer? What encoding?
    const [encryptResponse] = await kmsClient.encrypt({
      name: encryptDecryptKeyPath,
      plaintext,
    });

    ciphertext = encryptResponse.ciphertext;
  } catch (err) {
    throw createOrPropagateError(
      OthentErrorID.Encryption,
      500,
      "Error calling KMS encrypt",
      err,
    );
  }

  if (!ciphertext) {
    throw createOrPropagateError(
      OthentErrorID.Encryption,
      500,
      "No ciphertext",
    );
  }

  return normalizeKMSResponseData(ciphertext);
}
