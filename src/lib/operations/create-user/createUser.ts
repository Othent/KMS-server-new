import axios from "axios";
import { createKMSUser } from "../../utils/kms/createKMSUser";
import { getPublicKey } from "../../utils/kms/getPublicKey";
import { ownerToAddress } from "../../utils/arweave/arweaveUtils";
import { getAuth0URL } from "../../utils/auth/auth0";
import { OthentError, OthentErrorID } from "../../server/errors/errors.utils";
import { CONFIG } from "../../server/config/config.utils";

export async function createUser(sub: string) {
  try {
    await createKMSUser(sub);
  } catch (err) {
    throw new OthentError(
      OthentErrorID.UserCreation,
      "Error creating KMS user",
      err,
    );
  }

  const owner = await getPublicKey(sub);
  const walletAddress = await ownerToAddress(owner);

  let accessToken = "";

  try {
    const tokenResponse = await axios.post(getAuth0URL("/oauth/token/"), {
      grant_type: "client_credentials",
      client_id: CONFIG.AUTH0_CLIENT_ID,
      client_secret: CONFIG.AUTH0_CLIENT_SECRET,
      audience: getAuth0URL("/api/v2/"),
    });

    accessToken = tokenResponse.data.access_token;
  } catch (err) {
    throw new OthentError(
      OthentErrorID.UserCreation,
      "Error requesting client_credentials",
      err,
    );
  }

  if (!accessToken) {
    throw new OthentError(OthentErrorID.UserCreation, "No accessToken");
  }

  try {
    await axios.request({
      method: "PATCH",
      url: getAuth0URL(`/api/v2/users/${sub}/`),
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      data: {
        user_metadata: {
          authSystem: "KMS",
          owner,
          walletAddress,
        },
      },
    });
  } catch (err) {
    throw new OthentError(
      OthentErrorID.UserCreation,
      "Error patching user_metadata",
      err,
    );
  }

  // TODO: Return the created user?
  return true;
}
