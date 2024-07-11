import { kmsClient } from "../../utils/kms/kmsClient";
import { changeId } from "../../utils/tools/changeId";

export async function decrypt(
  ciphertext: string | Uint8Array,
  keyName: string,
) {
  if (!ciphertext || !keyName || !process.env.kmsProjectId) {
    console.log(ciphertext, keyName, process.env.kmsProjectId);
    console.log(
      "Please specify both ciphertextData/keyName/process.env.kmsProjectId",
    );
    throw new Error(
      "Please specify both ciphertextData/keyName/process.env.kmsProjectId",
    );
  }

  const safeId = changeId(keyName);

  const name = kmsClient.cryptoKeyPath(
    process.env.kmsProjectId,
    "global",
    safeId,
    "encryptDecrypt",
  );

  try {
    const [decryptResponse] = await kmsClient.decrypt({
      name,
      ciphertext,
    });

    if (!decryptResponse || !decryptResponse.plaintext) {
      console.log("Decryption failed or returned null/undefined plaintext");
      throw new Error("Decryption failed or returned null/undefined plaintext");
    }

    return decryptResponse.plaintext.toString();
  } catch (e) {
    throw new Error(`Error decrypting data. ${e}`);
  }
}
