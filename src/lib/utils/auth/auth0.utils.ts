import { CONFIG } from "../../server/config/config.utils";
import { B64UrlString, ownerToAddress } from "../arweave/arweaveUtils";
import axios from "axios";
import { CreateUserIdTokenData, LegacyCreateUserIdTokenData } from "../../operations/create-user/create-user.handler";
import { OthentErrorID } from "../../server/errors/error";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { pem2jwk } from "pem-jwk";
import { getSignKeyVersionPath } from "../kms/google-kms.utils";
import { kmsClient } from "../kms/kmsClient";
import { ActivateKeysIdTokenData } from "../../operations/activate-keys/activate-keys.handler";
import { IdTokenWithData, UserMetadata } from "./auth0.types";

export function getAuth0IssuerURL() {
  return `https://${CONFIG.AUTH0_CUSTOM_DOMAIN}/` as const;
}

export type ValidAuth0CustomDomainPathnames =
  | "/oauth/token/"
  | "/.well-known/jwks.json/"
  | "/.well-known/openid-configuration/";

/**
 * @returns Returns an Auth0 URL. Available URls are listed at https://auth.othent.io/.well-known/openid-configuration.
 */
export function getAuth0CustomDomainURL(pathname: ValidAuth0CustomDomainPathnames) {
  return `https://${CONFIG.AUTH0_CUSTOM_DOMAIN}${pathname}` as const;
}

export type ValidAuth0MachineToMachinePathnames =
  | "/api/v2/"
  | `/api/v2/users/${string}`;

/**
 * @returns Returns a URL of an Auth0 resource.
 */
export function getAuth0MachineToMachineURL(pathname: ValidAuth0MachineToMachinePathnames) {
  // TODO: We should be able to use the custom domain here too. See https://community.auth0.com/t/using-machine-to-machine-authentication-with-a-custom-domain/50461/3

  return `https://${CONFIG.AUTH0_M2M_CLIENT_DOMAIN}${pathname}` as const;
}

async function getPublicKey(idToken: IdTokenWithData<any>) {
  const { signKeyVersionPath } = getSignKeyVersionPath(idToken);

  let pem = "";

  try {
    const [publicKeyResponse] = await kmsClient.getPublicKey({
      name: signKeyVersionPath,
    });

    pem = publicKeyResponse.pem || "";
  } catch (err) {
    throw createOrPropagateError(
      OthentErrorID.PublicKey,
      500,
      "Error calling KMS getPublicKey",
      err,
    );
  }

  if (!pem) {
    throw createOrPropagateError(OthentErrorID.PublicKey, 500, "No PEM");
  }

  return pem2jwk(pem).n as B64UrlString;
}

export async function updateAuth0User(
  idToken: IdTokenWithData<CreateUserIdTokenData | LegacyCreateUserIdTokenData> | IdTokenWithData<ActivateKeysIdTokenData>,
): Promise<UserMetadata> {
  console.log("PREV TOKEN =", idToken);

  const { sub } = idToken;

  if (!sub) throw new Error("Cannot generate wallet address.");

  const alreadyHasAuthSystem = idToken.authSystem !== undefined;
  const alreadyHasOwner = idToken.owner !== undefined;
  const alreadyHasWalletAddress = idToken.walletAddress !== undefined;

  if (alreadyHasAuthSystem || alreadyHasOwner || alreadyHasWalletAddress) {
    const properties = [
      alreadyHasAuthSystem ? "`authSystem`" : "",
      alreadyHasOwner ? "`owner`" : "",
      alreadyHasWalletAddress ? "`walletAddress`" : "",
    ].filter(Boolean);

    throw new Error(`Cannot update user with existing ${ properties.join(", ") } properties.`);
  }

  const authSystem = CONFIG.AUTH_SYSTEM;
  const owner = await getPublicKey(idToken);
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

    const tokenResponse = await axios.post(getAuth0MachineToMachineURL("/oauth/token/" as any), {
      grant_type: "client_credentials",
      client_id: CONFIG.AUTH0_M2M_CLIENT_ID,
      client_secret: CONFIG.AUTH0_M2M_CLIENT_SECRET,
      audience: getAuth0MachineToMachineURL("/api/v2/"),
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
    const userMetadata: UserMetadata = {
      authSystem,
      owner,
      walletAddress,
    };

    await axios.request({
      method: "PATCH",
      url: getAuth0MachineToMachineURL(`/api/v2/users/${sub}`),
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      data: {
        user_metadata: userMetadata,
      },
    });

    return userMetadata;
  } catch (err) {
    throw createOrPropagateError(
      OthentErrorID.UserCreation,
      500,
      "Error patching user_metadata",
      err,
    );
  }
}
