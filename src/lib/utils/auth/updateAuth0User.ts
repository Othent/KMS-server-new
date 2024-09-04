import axios from "axios";
import { getPublicKey } from "../kms/getPublicKey";
import { ownerToAddress } from "../arweave/arweaveUtils";
import { getAuth0URL } from "./auth0";
import { CONFIG } from "../../server/config/config.utils";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";

export async function updateAuth0User(sub: string) {
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
}
