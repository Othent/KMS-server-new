import { CONFIG } from "../../server/config/config.utils";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { stringOrUint8ArrayToUint8Array } from "../../utils/arweave/arweaveUtils";
import { IdTokenWithData } from "../../utils/auth/auth0";
import { kmsClient } from "../../utils/kms/kmsClient";
import { getSignKeyVersionPath } from "../../utils/kms/google-kms.utils";
import { SignIdTokenData } from "./sign.handler";

export async function sign(
  idToken: IdTokenWithData<SignIdTokenData>,
  data: string | Uint8Array,
) {
  const { signKeyVersionPath } = getSignKeyVersionPath(idToken);

  let signature: string | Uint8Array | null | undefined;

  try {
    const [signResponse] = await kmsClient.asymmetricSign({
      name: signKeyVersionPath,
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

  return stringOrUint8ArrayToUint8Array(signature);
}
