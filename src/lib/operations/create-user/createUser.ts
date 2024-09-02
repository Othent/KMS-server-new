import axios from "axios";
import { createKMSUser } from "../../utils/kms/createKMSUser";
import { getPublicKey } from "../../utils/kms/getPublicKey";
import { ownerToAddress } from "../../utils/arweave/arweaveUtils";
import { getAuth0URL } from "../../utils/auth/auth0";
import { CONFIG } from "../../server/config/config.utils";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";

export async function createUser(sub: string) {
  try {
    await createKMSUser(sub);
  } catch (err) {
    throw createOrPropagateError(
      OthentErrorID.UserCreation,
      500,
      "Error creating KMS user",
      err,
    );
  }

  // TODO: In the import version, this cannot be done here. Auth0's user must
  // be updated AFTER the keys have been imported. Move all this to a separated
  // updateAuth0User function:
  const owner = await getPublicKey(sub);
  const walletAddress = await ownerToAddress(owner);

  let accessToken = "";

  try {
    // TODO: M2M token limit is rather low and they are rather expensive, so this might be worth caching at some point:
    //
    // - Free / Essential = 1000 / month = 33 / day
    // - Professional / Enterprise = 5000 / month = 167 / day
    //
    // If once we are in Professional due to active users our M2M token usage exceeds the limits, it would be worth
    // considering caching them in Redis. However, it would be really important to protect that Redis DB / cluster and
    // the key stored in it. It might be worth also using Google KMS to store that key encrypted.

    const tokenResponse = await axios.post(getAuth0URL("/oauth/token/"), {
      grant_type: "client_credentials",
      client_id: CONFIG.AUTH0_CLIENT_ID,
      client_secret: CONFIG.AUTH0_CLIENT_SECRET,
      audience: getAuth0URL("/api/v2/"),
    });

    accessToken = tokenResponse.data.access_token;
  } catch (err) {
    // TODO: Include data.error, data.error_description and data.error_uri

    throw createOrPropagateError(
      OthentErrorID.UserCreation,
      500,
      "Error requesting client_credentials",
      err,
    );
  }

  if (!accessToken) {
    throw createOrPropagateError(
      OthentErrorID.UserCreation,
      500,
      "No accessToken",
    );
  }

  try {
    await axios.request({
      method: "PATCH",
      url: getAuth0URL(`/api/v2/users/${sub}`),
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      data: {
        user_metadata: {
          authSystem: CONFIG.AUTH_SYSTEM,
          owner,
          walletAddress,
        },
      },
    });
  } catch (err) {
    throw createOrPropagateError(
      OthentErrorID.UserCreation,
      500,
      "Error patching user_metadata",
      err,
    );
  }

  // TODO: Return the created user?
  return true;
}
