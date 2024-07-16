import type { JwtPayload } from "jsonwebtoken";
import express from "express";
import { CONFIG } from "../../server/config/config.utils";

export interface IdTokenWithData<D = void> extends JwtPayload {
  // Default from Auth0:
  given_name: string;
  family_name: string;
  nickname: string;
  picture: string;
  locale: string;
  updated_at: string;
  email: string;
  email_verified: string;
  nonce: string;
  name: string;
  sid: string;

  // Custom from Auth0's Add User Metadata action:
  owner: string; // Public key derived from `sub`.
  walletAddress: string; // Wallet address derived from `owner`.
  authSystem: "KMS";

  // Extra data also added to the token in Add User Metadata action when calling functions other than createUser:
  data: void extends D ? never : D;
}

export interface ExpressRequestWithToken<D = void> extends express.Request {
  idToken: IdTokenWithData<D>;
}

export function isExpressRequestWithToken(
  req: express.Request | ExpressRequestWithToken,
): req is ExpressRequestWithToken {
  return (
    req.hasOwnProperty("idToken") && !!(req as ExpressRequestWithToken).idToken
  );
}

export type ValidAuth0Pathnames =
  | "/oauth/token/"
  | "/api/v2/"
  | `/api/v2/users/${string}`
  | `/.well-known/jwks.json/`;

export function getAuth0URL(pathname: ValidAuth0Pathnames) {
  return `https://${CONFIG.AUTH0_CLIENT_DOMAIN}${pathname}` as const;
}

export function getAuth0Issuer() {
  return `https://${CONFIG.AUTH0_CLIENT_DOMAIN}/` as const;
}
