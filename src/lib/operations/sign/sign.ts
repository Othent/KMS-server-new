import { CONFIG } from "../../server/config/config.utils";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { kmsClient } from "../../utils/kms/kmsClient";
import { changeId } from "../../utils/tools/changeId";

export async function sign(data: string | Uint8Array, keyName: string) {
  const safeId = changeId(keyName);

  const fullKeyName = kmsClient.cryptoKeyVersionPath(
    CONFIG.KMS_PROJECT_ID,
    "global",
    safeId,
    "sign",
    CONFIG.SIGN_KEY_VERSION,
  );

  let signature: string | Uint8Array | null | undefined;

  try {
    const [signResponse] = await kmsClient.asymmetricSign({
      name: fullKeyName,
      data,
    });

    signature = signResponse.signature;
  } catch (err) {
    throw createOrPropagateError(
      OthentErrorID.Signing,
      500,
      "Error calling KMS asymmetricSign",
      err,
    );
  }

  if (!signature) {
    throw createOrPropagateError(OthentErrorID.Decryption, 500, "No signature");
  }

  return signature.toString();
}
