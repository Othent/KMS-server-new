import { kmsClient } from "../../utils/kms/kmsClient";
import { changeId } from "../../utils/tools/changeId";

export async function sign(data: string | Uint8Array, keyName: string) {
  if (
    !data ||
    !keyName ||
    !process.env.kmsProjectId ||
    !process.env.signKeyVersion
  ) {
    console.log(data, keyName, process.env.kmsProjectId);
    console.log(
      "Please specify both data/keyName/process.env.kmsProjectId/process.env.signKeyVersion",
    );
    throw new Error(
      "Please specify both data/keyName/process.env.kmsProjectId/process.env.signKeyVersion",
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
    const [signResponse] = await kmsClient.asymmetricSign({
      name: fullKeyName,
      data,
    });

    if (!signResponse || !signResponse.signature) {
      console.log("Signature failed or returned null/undefined signature");
      throw new Error("Signature failed or returned null/undefined signature");
    }

    return signResponse.signature.toString();
  } catch (e) {
    throw new Error(`Error signing data. ${e}`);
  }
}
