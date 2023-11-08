import { kmsClient } from "./utils/kms/kmsClient";
import { changeId } from "./utils/tools/changeId";

export default async function sign(data: any, keyName: string): Promise<any> {
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

  const uint8Array = new Uint8Array(Object.values(data));

  try {
    const [signResponse] = await kmsClient.asymmetricSign({
      name: fullKeyName,
      data: uint8Array,
    });

    const safeRes = signResponse.signature;

    return { data: safeRes };
  } catch (e) {
    console.log(e);
  }
}
