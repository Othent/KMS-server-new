import { OthentError, OthentErrorID } from "../../server/errors/errors.utils";
import { kmsClient } from "../../utils/kms/kmsClient";
import { changeId } from "../../utils/tools/changeId";

export async function decrypt(
  ciphertext: string | Uint8Array,
  keyName: string,
) {
  // TODO: Pass as param:
  if (!process.env.kmsProjectId) {
    throw new OthentError(OthentErrorID.Encryption, "No kmsProjectId");
  }

  const safeId = changeId(keyName);

  // TODO: Create util function to get the key names:
  const name = kmsClient.cryptoKeyPath(
    process.env.kmsProjectId,
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
    throw new OthentError(
      OthentErrorID.Decryption,
      "Error calling KMS decrypt",
      err,
    );
  }

  if (!plaintext) {
    throw new OthentError(OthentErrorID.Decryption, "No plaintext");
  }

  return plaintext.toString();
}
