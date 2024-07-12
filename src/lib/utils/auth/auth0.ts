import { JwtPayload } from "jsonwebtoken";
import express from "express";

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
  return `https://${process.env.auth0ClientDomain}${pathname}` as const;
}
