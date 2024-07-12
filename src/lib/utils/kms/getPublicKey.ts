import { kmsClient } from "./kmsClient";
import { changeId } from "../tools/changeId";
import { pem2jwk } from "pem-jwk";
import { OthentError, OthentErrorID } from "../../server/errors/errors.utils";

export async function getPublicKey(sub: string) {
  // TODO: Pass as param:
  if (!process.env.kmsProjectId) {
    throw new OthentError(OthentErrorID.PublicKey, "No kmsProjectId");
  }

  // TODO: Pass as param:
  if (!process.env.signKeyVersion) {
    throw new OthentError(OthentErrorID.PublicKey, "No signKeyVersion");
  }

  const safeId = changeId(sub);

  // TODO: Create util function to get the key names:
  const fullKeyName = kmsClient.cryptoKeyVersionPath(
    process.env.kmsProjectId,
    "global",
    safeId,
    "sign",
    process.env.signKeyVersion,
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
