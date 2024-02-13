import axios from "axios";
import { createKMSUser } from "./utils/kms/createKMSUser";
import { changeId } from "./utils/tools/changeId";
import { delay } from "./utils/tools/delay";
import { getPublicKey } from "./getPublicKey";
import { ownerToAddress } from "./utils/arweave/arweaveUtils";

export default async function createUser(decoded_JWT: any, importedKey: any): Promise<any> {
  if (!decoded_JWT || !decoded_JWT.sub) {
    return { error: "invalid JWT" };
  }

  const safeId = changeId(decoded_JWT.sub);

  const initKMSUser = await createKMSUser(safeId, importedKey);

  if (!initKMSUser) {
    throw new Error("Error creating users KMS keys.");
  }

  // allow for the key to be generated
  await delay(2000);

  const owner = (await getPublicKey(decoded_JWT.sub)).data;
  const walletAddress = await ownerToAddress(owner);

  try {
    const tokenResponse = await axios.post(
      "https://othent.us.auth0.com/oauth/token",
      {
        grant_type: "client_credentials",
        client_id: process.env.auth0ClientId,
        client_secret: process.env.auth0ClientSecret,
        audience: "https://othent.us.auth0.com/api/v2/",
      },
    );
    const accessToken = tokenResponse.data.access_token;

    const options = {
      method: "PATCH",
      url: `https://othent.us.auth0.com/api/v2/users/${decoded_JWT.sub}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      data: {
        user_metadata: {
          authSystem: "KMS",
          owner: owner,
          walletAddress: walletAddress,
        },
      },
    };

    await axios.request(options); // check

    return { data: true };
  } catch (e) {
    throw new Error(`Error creating new user. ${e}`);
  }
}
