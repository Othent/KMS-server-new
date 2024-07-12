import { kmsClient } from "./kmsClient";
import { changeId } from "../tools/changeId";
import { pem2jwk } from "pem-jwk";
import { OthentError, OthentErrorID } from "../../server/errors/errors.utils";
import { CONFIG } from "../../server/config/config.utils";

export async function getPublicKey(sub: string) {
  const safeId = changeId(sub);

  // TODO: Create util function to get the key names:
  const fullKeyName = kmsClient.cryptoKeyVersionPath(
    CONFIG.KMS_PROJECT_ID,
    "global",
    safeId,
    "sign",
    CONFIG.SIGN_KEY_VERSION,
  );

  let pem = "";

  try {
    const [publicKeyResponse] = await kmsClient.getPublicKey({
      name: fullKeyName,
    });

    pem = publicKeyResponse.pem || "";
  } catch (err) {
    throw new OthentError(
      OthentErrorID.PublicKey,
      "Error calling KMS getPublicKey",
      err,
    );
  }

  if (!pem) {
    throw new OthentError(OthentErrorID.PublicKey, "No PEM");
  }

  return pem2jwk(pem).n;
}
