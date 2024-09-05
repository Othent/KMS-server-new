import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { stringOrUint8ArrayToUint8Array } from "../../utils/arweave/arweaveUtils";
import { IdTokenWithData } from "../../utils/auth/auth0";
import { kmsClient } from "../../utils/kms/kmsClient";
import { getEncryptDecryptKeyPath } from "../../utils/kms/google-kms.utils";
import { EncryptIdTokenData } from "./encrypt.handler";

export async function encrypt(
  idToken: IdTokenWithData<EncryptIdTokenData>,
  plaintext: string | Uint8Array,
) {
  const { encryptDecryptKeyPath } = getEncryptDecryptKeyPath(idToken);

  let ciphertext: string | Uint8Array | null | undefined;

  console.log("plaintext =", plaintext);

  try {
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

  console.log(
    "ciphertext =",
    typeof ciphertext,
    ciphertext,
    stringOrUint8ArrayToUint8Array(ciphertext),
  );

  return stringOrUint8ArrayToUint8Array(ciphertext);
}
