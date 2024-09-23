import { expressJwtSecret, GetVerificationKey } from "jwks-rsa";
import {
  getAuth0IssuerURL,
  getAuth0CustomDomainURL,
} from "../../utils/auth/auth0.utils";
import { expressjwt } from "express-jwt";
import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0.types";

export const getToken = (req: express.Request) => {
  return req.body.encodedData;
};

export type JWTValidatorMiddlewareFn = <D>(
  req: ExpressRequestWithToken<D>,
  res: express.Response,
  next: express.NextFunction,
) => Promise<void | NodeJS.Immediate>;

export function jwtValidatorFactory() {
  // See:
  // - https://auth.othent.io/.well-known/openid-configuration
  // - https://auth.othent.io/.well-known/jwks.json
  // - https://auth0.com/blog/navigating-rs256-and-jwks/
  // - https://github.com/auth0/express-jwt
  // - https://github.com/auth0/node-jwks-rsa
  // - https://github.com/sgmeyer/auth0-node-jwks-rs256

  const secret = expressJwtSecret({
    jwksUri: getAuth0CustomDomainURL("/.well-known/jwks.json/"),
  }) as GetVerificationKey;

  return expressjwt({
    getToken,
    secret,
    requestProperty: "idToken",
    issuer: getAuth0IssuerURL(),
    // audience: "", // Only for machine-to-machine tokens?
    algorithms: ["RS256"],
  }) as JWTValidatorMiddlewareFn;
}
