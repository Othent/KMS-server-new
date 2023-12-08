import { verifyJWT } from "../../src/lib/utils/auth/verifyJWT";
import {
  verifyJWTTest,
  testAccountID,
  verifyJWTTestResponse,
} from "../testValues";
import { OTHENT_PUBLIC_KEY } from "../../src/lib/utils/auth/verifyJWT";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

test("if verifyJWT() works", async () => {
  if (!process.env.auth0ClientId || !process.env.auth0ClientSecret) {
    console.log(
      "Please specify a auth0ClientId and auth0ClientSecret in the env.",
    );
    throw new Error(
      "Please specify a auth0ClientId and auth0ClientSecret in the env.",
    );
  }

  // update test account nonce
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
  await axios.request({
    method: "PATCH",
    url: `https://othent.us.auth0.com/api/v2/users/${testAccountID}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    data: { user_metadata: { lastNonce: 1 } },
  });

  const test = await verifyJWT(verifyJWTTest, OTHENT_PUBLIC_KEY);

  expect(test).toEqual(verifyJWTTestResponse);
}, 10000);
