import type { IdToken } from "@auth0/auth0-spa-js";
import express from "express";
import { B64UrlString } from "../lib/binary-data-types/binary-data-types.types";

export interface UserMetadata {
  // Custom from Auth0's Add User Metadata action:
  owner: B64UrlString; // Public key derived from `sub`.
  walletAddress: B64UrlString; // Wallet address derived from `owner`.
  authSystem: "KMS";
}

export interface IdTokenWithData<D = void> extends IdToken, UserMetadata {
  sub: string;

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
