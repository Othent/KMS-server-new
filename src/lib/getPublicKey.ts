import { kmsClient } from "./utils/kms/kmsClient";
import { changeId } from "./utils/tools/changeId";
import { pem2jwk } from "pem-jwk";

export async function getPublicKey(keyName: string): Promise<any> {
  if (!keyName || !process.env.kmsProjectId || !process.env.signKeyVersion) {
    console.log(keyName, process.env.kmsProjectId);
    console.log(
      "Please specify both keyName/process.env.kmsProjectId/process.env.signKeyVersion",
    );
    throw new Error(
      "Please specify both keyName/process.env.kmsProjectId/process.env.signKeyVersion",
    );
  }

  const safeId = changeId(keyName);

  const fullKeyName = kmsClient.cryptoKeyVersionPath(
    process.env.kmsProjectId,
    "global",
    safeId,
    "sign",
    process.env.signKeyVersion,
  );

  try {
    const [publicKeyResponse] = await kmsClient.getPublicKey({
      name: fullKeyName,
    });

    const pem = publicKeyResponse.pem;
    // @ts-ignore, ignore types for pem file
    const publicKey = pem2jwk(pem);

    return { data: publicKey.n };
  } catch (e) {
    throw new Error(`Error getting public key. ${e}`);
  }
}
