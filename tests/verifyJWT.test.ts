import { verifyJWT } from "../src/lib/utils/auth/verifyJWT";
import { OTHENT_PUBLIC_KEY } from "../src/lib/utils/auth/verifyJWT";
import { getAuth0URL } from "../src/lib/utils/auth/auth0";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

test("if verifyJWT() works", async () => {
  // TODO: These checks should run before starting the server in index.ts too. Also, the shape of some of these (e.g. auth0ClientDomain) should be validated too.
  // Also, type the environment variables.

  if (
    !process.env.auth0ClientDomain ||
    !process.env.auth0ClientId ||
    !process.env.auth0ClientSecret
  ) {
    console.log(
      "Please specify a auth0ClientDomain, auth0ClientId, and auth0ClientSecret in the ENV file / secrets.",
    );

    throw new Error(
      "Please specify a auth0ClientDomain, auth0ClientId, and auth0ClientSecret in the ENV file / secrets.",
    );
  }

  const tokenResponse = await axios.post(getAuth0URL("/oauth/token/"), {
    grant_type: "client_credentials",
    client_id: process.env.auth0ClientId,
    client_secret: process.env.auth0ClientSecret,
    audience: getAuth0URL("/api/v2/"),
  });
  const accessToken = tokenResponse.data.access_token;

  const test = await verifyJWT(accessToken, OTHENT_PUBLIC_KEY);

  // @ts-ignore
  expect(test.sub).toEqual("75EEYxya0AyLPao5TuSLJRGgNrhbba3A@clients");
}, 10000);
