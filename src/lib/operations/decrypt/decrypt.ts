import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { IdTokenWithData } from "../../utils/auth/auth0.types";
import { kmsClient } from "../../utils/kms/kmsClient";
import { getEncryptDecryptKeyPath } from "../../utils/kms/google-kms.utils";
import { DecryptIdTokenData, LegacyDecryptIdTokenData } from "./decrypt.handler";
import { UI8A } from "../../utils/lib/binary-data-types/binary-data-types.utils";

export async function decrypt(
  idToken: IdTokenWithData<DecryptIdTokenData | LegacyDecryptIdTokenData>,
  ciphertext: Uint8Array,
) {
  const { encryptDecryptKeyPath } = getEncryptDecryptKeyPath(idToken);

  let plaintext: string | Uint8Array | null | undefined;

  try {
    const [decryptResponse] = await kmsClient.decrypt({
      name: encryptDecryptKeyPath,
      ciphertext,
    });

    plaintext = decryptResponse.plaintext;
  } catch (err) {
    throw createOrPropagateError(
      OthentErrorID.Decryption,
      500,
      "Error calling KMS decrypt",
      err,
    );
  }

  if (!plaintext) {
    throw createOrPropagateError(OthentErrorID.Decryption, 500, "No plaintext");
  }

  return UI8A.from(plaintext, "string");
}
