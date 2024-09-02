import { CONFIG } from "../../server/config/config.utils";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { stringOrUint8ArrayToUint8Array } from "../../utils/arweave/arweaveUtils";
import { kmsClient } from "../../utils/kms/kmsClient";
import { changeId } from "../../utils/tools/changeId";

export async function encrypt(
  plaintext: string | Uint8Array,
  keyName: string
) {
  const safeId = changeId(keyName);

  // TODO: Create util function to get the key names:
  const name = kmsClient.cryptoKeyPath(
    CONFIG.KMS_PROJECT_ID,
    "global",
    safeId,
    "encryptDecrypt",
  );

  let ciphertext: string | Uint8Array | null | undefined;

  try {
    const [encryptResponse] = await kmsClient.encrypt({
      name,
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

  return stringOrUint8ArrayToUint8Array(ciphertext);
}
