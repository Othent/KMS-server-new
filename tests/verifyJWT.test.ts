import { verifyJWT } from "../src/lib/utils/auth/verifyJWT";
import { OTHENT_PUBLIC_KEY } from "../src/lib/utils/auth/verifyJWT";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

test("if verifyJWT() works", async () => {
  if (!process.env.auth0ClientId || !process.env.auth0ClientSecret) {
    console.log("Please specify a auth0ClientId/auth0ClientSecret in the env.");
    throw new Error(
      "Please specify a auth0ClientId/auth0ClientSecret in the env.",
    );
  }

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

  const test = await verifyJWT(accessToken, OTHENT_PUBLIC_KEY);

  // @ts-ignore
  expect(test.sub).toEqual("75EEYxya0AyLPao5TuSLJRGgNrhbba3A@clients");
}, 10000);
