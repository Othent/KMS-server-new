import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { IdTokenWithData } from "../../utils/auth/auth0.utils";
import { kmsClient } from "../../utils/kms/kmsClient";
import { getSignKeyVersionPath } from "../../utils/kms/google-kms.utils";
import { LegacySignIdTokenData, SignIdTokenData } from "./sign.handler";
import { normalizeKMSResponseData } from "../common.types";

export async function sign(
  idToken: IdTokenWithData<SignIdTokenData | LegacySignIdTokenData>,
  data: Uint8Array,
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

  return normalizeKMSResponseData(signature);
}
