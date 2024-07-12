import { OthentError, OthentErrorID } from "../../server/errors/errors.utils";
import { kmsClient } from "../../utils/kms/kmsClient";
import { changeId } from "../../utils/tools/changeId";

export async function encrypt(plaintext: string | Uint8Array, keyName: string) {
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

  let ciphertext: string | Uint8Array | null | undefined;

  try {
    const [encryptResponse] = await kmsClient.encrypt({
      name,
      plaintext,
    });

    ciphertext = encryptResponse.ciphertext;
  } catch (err) {
    throw new OthentError(
      OthentErrorID.Encryption,
      "Error calling KMS encrypt",
      err,
    );
  }

  if (!ciphertext) {
    throw new OthentError(OthentErrorID.Encryption, "No ciphertext");
  }

  return ciphertext.toString();
}
