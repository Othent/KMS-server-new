# KMS-server-new

Server for KMS interactions.

## TODO:

- Use a middleware to verify the JWT token using JWKS. See https://github.com/auth0/express-jwt, https://auth0.com/docs/secure/tokens/json-web-tokens/locate-json-web-key-sets.

- Abstract `kmsClient` and implement a simple mocked version for local development. See https://www.tutorialspoint.com/encrypt-and-decrypt-data-in-nodejs.

- Add dev/watch mode for the server.
