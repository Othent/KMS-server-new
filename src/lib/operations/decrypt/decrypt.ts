import { CONFIG } from "../../server/config/config.utils";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { stringOrUint8ArrayToUint8Array } from "../../utils/arweave/arweaveUtils";
import { kmsClient } from "../../utils/kms/kmsClient";
import { changeId } from "../../utils/tools/changeId";

export async function decrypt(
  ciphertext: string | Uint8Array,
  keyName: string,
) {
  const safeId = changeId(keyName);

  // TODO: Create util function to get the key names:
  const name = kmsClient.cryptoKeyPath(
    CONFIG.KMS_PROJECT_ID,
    "global",
    safeId,
    "encryptDecrypt",
  );

  let plaintext: string | Uint8Array | null | undefined;

  try {
    const [decryptResponse] = await kmsClient.decrypt({
      name,
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

  return stringOrUint8ArrayToUint8Array(plaintext);
}
