import { kmsClient } from "./kmsClient";
import { changeId } from "../tools/changeId";
import { pem2jwk } from "pem-jwk";

export async function getPublicKey(keyName: string) {
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

    const { pem } = publicKeyResponse;

    if (!pem) {
      throw new Error("Missing PEM.");
    }

    const publicKey = pem2jwk(pem);

    return publicKey.n;
  } catch (e) {
    throw new Error(`Error getting public key. ${e}`);
  }
}
