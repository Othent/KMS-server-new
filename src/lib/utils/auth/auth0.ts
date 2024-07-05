export type ValidAuth0Pathnames =
  | "/oauth/token/"
  | "/api/v2/"
  | `/api/v2/users/${string}/`;

export function getAuth0URL(pathname: ValidAuth0Pathnames) {
  return `https://${process.env.auth0ClientDomain}${pathname}` as const;
}
