import { kmsClient } from "../../utils/kms/kmsClient";
import { changeId } from "../../utils/tools/changeId";

export async function encrypt(plaintext: string | Uint8Array, keyName: string) {
  if (!plaintext || !keyName || !process.env.kmsProjectId) {
    console.log(
      "Please specify both plaintextData/keyName/process.env.kmsProjectId",
    );
    throw new Error(
      "Please specify both plaintextData/keyName/process.env.kmsProjectId",
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
    const [encryptResponse] = await kmsClient.encrypt({
      name,
      plaintext,
    });

    if (!encryptResponse || !encryptResponse.ciphertext) {
      console.log("Encryption failed or returned null/undefined ciphertext");
      throw new Error(
        "Encryption failed or returned null/undefined ciphertext",
      );
    }

    return encryptResponse.ciphertext.toString();
  } catch (e) {
    throw new Error(`Error encrypting data. ${e}`);
  }
}
