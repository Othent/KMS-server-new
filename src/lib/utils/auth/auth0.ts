import { JwtPayload } from "jsonwebtoken";
import express from "express";
import { CONFIG } from "../../server/config/config.utils";

export interface IdTokenWithData<D = void> extends JwtPayload {
  // TODO: This is missing user_metadata's authSystem, owner and walletAddress (except in createUserHandlerFactory)

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
  data: void extends D ? never : D;
}

export interface ExpressRequestWithToken<D = void> extends express.Request {
  idToken: IdTokenWithData<D>;
}

export type ValidAuth0Pathnames =
  | "/oauth/token/"
  | "/api/v2/"
  | `/api/v2/users/${string}/`
  | `/.well-known/jwks.json/`;

export function getAuth0URL(pathname: ValidAuth0Pathnames) {
  return `https://${CONFIG.AUTH0_CLIENT_DOMAIN}${pathname}` as const;
}

export function getAuth0Issuer() {
  return `https://${CONFIG.AUTH0_CLIENT_DOMAIN}/` as const;
}
