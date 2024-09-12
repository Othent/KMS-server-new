import { CONFIG } from "../../server/config/config.utils";
import { OthentServerError } from "../../server/errors/error";
import { Route } from "../../server/server.constants";
import { IdTokenWithData } from "../auth/auth0.utils";

export function getDevelopmentOnlyTokenID<D>(
  idToken: IdTokenWithData<D> | null,
) {
  // Just in case...
  if (CONFIG.IS_PROD) return "<DEVELOPMENT_ONLY_ID_USED_IN_PRODUCTION>";

  if (!idToken) return "ANONYMOUS";

  const {
    email,
    sub, // subject
    iat, // issues at
    jti, // JWT ID
  } = idToken;

  return `${email || sub} (${jti || iat})${ idToken.data ? ` | data = ${ Object.keys(idToken.data).join(", ") }` : "" }`;
}

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

export function logRequestStart<D>(route: Route, idToken: IdTokenWithData<D>) {
  // TODO: This logger is for development only. Replace with Winston / Morgan in production.
  if (CONFIG.IS_PROD || CONFIG.IS_TEST || !CONFIG.IS_DEV) return;

  console.log(
    `├ ${CYAN}REQ ${route} ${getDevelopmentOnlyTokenID(idToken)}${RESET}`,
  );
}

export function logRequestSuccess<D>(
  route: Route,
  idToken: IdTokenWithData<D>,
) {
  // TODO: This logger is for development only. Replace with Winston / Morgan in production.
  if (CONFIG.IS_PROD || CONFIG.IS_TEST || !CONFIG.IS_DEV) return;

  console.log(
    `└ ${GREEN}RES ${route} ${getDevelopmentOnlyTokenID(idToken)}${RESET}\n`,
  );
}

export function logRequestError<D>(
  route: Route,
  idToken: IdTokenWithData<D> | null,
  error: unknown,
) {
  // TODO: This logger is for development only. Replace with Winston / Morgan in production.
  if (CONFIG.IS_PROD || CONFIG.IS_TEST || !CONFIG.IS_DEV) return;

  console.error(
    `└ ${RED}ERR ${route} ${getDevelopmentOnlyTokenID(idToken)} => ${error instanceof OthentServerError ? error.getLog() : `${error}`}${RESET}\n`,
  );
}
