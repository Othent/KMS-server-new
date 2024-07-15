import { Route } from "../../server/server.constants";
import { IdTokenWithData } from "../auth/auth0";

export function anonymiseIdToken<D>(idToken: IdTokenWithData<D>) {
  const {
    // Default
    iss, // issuer
    sub, // subject
    aud, // audience
    exp, // expiration
    nbf, // not before
    iat, // issues at
    jti, // JWT ID

    // Custom:
    sid, // session ID
    nonce,
  } = idToken;

  // With the old version, these were deleted:
  // delete idToken.iss;
  // delete idToken.aud;
  // delete idToken.sid;
  // delete idToken.nonce;
  // delete idToken.exp;

  return {
    //iss,
    sub,
    //aud,
    //exp,
    nbf,
    iat,
    jti,
    //sid,
    //nonce,
  };
}

// TODO: Replace with winston / morgan

const CYAN = "\x1b[36m%s\x1b[0m";
const GREEN = "\x1b[32m%s\x1b[0m";
const RED = "\x1b[31m%s\x1b[0m";

export function logRequestStart<D>(route: Route, idToken: IdTokenWithData<D>) {
  console.log(
    CYAN,
    `REQ ${route} => ${JSON.stringify(anonymiseIdToken(idToken))}`,
  );
}

export function logRequestSuccess<D>(
  route: Route,
  idToken: IdTokenWithData<D>,
) {
  console.log(
    GREEN,
    `RES: ${route} => ${JSON.stringify(anonymiseIdToken(idToken))}`,
  );
}

export function logRequestError<R>(route: Route, error: Error | string) {
  // TODO: Update to properly log OthentError

  console.log(
    RED,
    `RES: ${route} => ${typeof error === "string" ? error : `${error.name}: ${error.message}`}`,
  );

  if (typeof error !== "string") console.log(error.stack);
}
