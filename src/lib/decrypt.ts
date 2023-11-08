import { kmsClient } from "./utils/kms/kmsClient";
import { changeId } from "./utils/tools/changeId";

export default async function decrypt(
  ciphertextData: string,
  keyName: string,
): Promise<any> {
  if (!ciphertextData || !keyName || !process.env.kmsProjectId) {
    console.log(ciphertextData, keyName, process.env.kmsProjectId);
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
      ciphertext: Buffer.from(ciphertextData),
    });

    if (!decryptResponse || !decryptResponse.plaintext) {
      console.log("Decryption failed or returned null/undefined plaintext");
      throw new Error("Decryption failed or returned null/undefined plaintext");
    }

    return { data: decryptResponse.plaintext.toString() };
  } catch (e) {
    console.log(e);
  }
}
