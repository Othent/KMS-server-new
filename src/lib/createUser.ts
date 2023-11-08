import axios from "axios";
import verifyJWT, { OTHENT_PUBLIC_KEY } from "./utils/auth/verifyJWT";
// @ts-ignore
// import importKey from './utils/importKey.js'

export default async function createUser(accessToken: string): Promise<any> {
  const JWT = await verifyJWT(accessToken, OTHENT_PUBLIC_KEY);
  if (!JWT) {
    return { error: "invalid JWT" };
  }

  // @ts-ignore
  const { mnemonic, walletAddress } = await importKey();

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
          wallet_address: walletAddress,
          initJWT: JWT,
          authSystem: "KMS",
        },
      },
    };

    const userResponse = await axios.request(options);
    return { user: userResponse.data, mnemonic: mnemonic };
  } catch (error) {
    console.error(error);
    return { error: error };
  }
}
