import axios from "axios";
import { createKMSUser } from "../../utils/kms/createKMSUser";
import { changeId } from "../../utils/tools/changeId";
import { delay } from "../../utils/tools/delay";
import { getPublicKey } from "../../utils/kms/getPublicKey";
import { ownerToAddress } from "../../utils/arweave/arweaveUtils";
import { getAuth0URL } from "../../utils/auth/auth0";

// TODO: Return the created user?
export async function createUser(sub: string) {
  const safeId = changeId(sub);

  const initKMSUser = await createKMSUser(safeId);

  if (!initKMSUser) {
    throw new Error("Error creating users KMS keys.");
  }

  // allow for the key to be generated
  await delay(2000);

  const owner = await getPublicKey(sub);
  const walletAddress = await ownerToAddress(owner);

  try {
    const tokenResponse = await axios.post(getAuth0URL("/oauth/token/"), {
      grant_type: "client_credentials",
      client_id: process.env.auth0ClientId,
      client_secret: process.env.auth0ClientSecret,
      audience: getAuth0URL("/api/v2/"),
    });

    const accessToken = tokenResponse.data.access_token;

    const options = {
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
    };

    await axios.request(options); // check

    return { data: true };
  } catch (e) {
    throw new Error(`Error creating new user. ${e}`);
  }
}
