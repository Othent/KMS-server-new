import { OthentError, OthentErrorID } from "../../server/errors/errors.utils";
import { kmsClient } from "../../utils/kms/kmsClient";
import { changeId } from "../../utils/tools/changeId";

export async function sign(data: string | Uint8Array, keyName: string) {
  // TODO: Pass as param:
  if (!process.env.kmsProjectId) {
    throw new OthentError(OthentErrorID.Signing, "No kmsProjectId");
  }

  if (!process.env.signKeyVersion) {
    throw new OthentError(OthentErrorID.Signing, "No signKeyVersion");
  }

  const safeId = changeId(keyName);

  const fullKeyName = kmsClient.cryptoKeyVersionPath(
    process.env.kmsProjectId,
    "global",
    safeId,
    "sign",
    process.env.signKeyVersion,
  );

  let signature: string | Uint8Array | null | undefined;

  try {
    const [signResponse] = await kmsClient.asymmetricSign({
      name: fullKeyName,
      data,
    });

    signature = signResponse.signature;
  } catch (err) {
    throw new OthentError(
      OthentErrorID.Signing,
      "Error calling KMS asymmetricSign",
      err,
    );
  }

  if (!signature) {
    throw new OthentError(OthentErrorID.Decryption, "No signature");
  }

  return signature.toString();
}
