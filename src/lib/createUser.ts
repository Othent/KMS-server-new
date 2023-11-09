import axios from "axios";
import { createKMSUser } from "./utils/kms/createKMSUser";
import { changeId } from "./utils/tools/changeId";

export default async function createUser(JWT: any): Promise<any> {
  if (!JWT || !JWT.sub) {
    return { error: "invalid JWT" };
  }

  const safeId = changeId(JWT.sub);

  const initKMSUser = await createKMSUser(safeId);

  if (!initKMSUser) {
    throw new Error("Error initializing users KMS.");
  }

  const tokenParams = {
    grant_type: "client_credentials",
    client_id: process.env.auth0ClientId,
    client_secret: process.env.auth0ClientSecret,
    audience: "https://othent.us.auth0.com/api/v2/",
  };

  try {
    const tokenResponse = await axios.post(
      "https://othent.us.auth0.com/oauth/token",
      tokenParams,
    );
    const accessToken = tokenResponse.data.access_token;

    const options = {
      method: "PATCH",
      url: `https://othent.us.auth0.com/api/v2/users/${JWT.sub}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      data: {
        user_metadata: {
          authSystem: "KMS",
        },
      },
    };

    const userResponse = await axios.request(options);
    return { data: userResponse.data };
  } catch (e) {
    throw new Error(`Error creating new user. ${e}`);
  }
}
