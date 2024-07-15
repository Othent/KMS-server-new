# KMS Server (New)

Node.js/Express.js server to interact with Auth0 and Google KMS.

<br />

## Running It Locally:

First, you need to update `.env` with a valid `auth0ClientDomain`, `auth0ClientId` and `auth0ClientSecret` values pointing to an Auth0 application with the following params:

- Type: `Machine to Machine`.
- Permissions / Scopes: `read:client_credentials` and `update:users` (this cannot be change after creating the Application).
- Credentials: `Client Secret (Post)`.
- Grant Types: `Client Credentials`.

Also, the tenant both this Machine to Machine application and the Single Page application used the KMS SDK (`KeyManagementService`) you are using should have at least the `actions/add-user-metadata.ts` action configured in its Login flow.

Then, simply run:

```
  pnpm install
  pnpm start
```

You don't need to configure the remaining 3 services:

- Google KMS will be replaced by a local mocked implementation (which uses the same keys for all users).
- MongoDB database won't be used (this logic is skipped).
- Slack integration won't be used (this logic is skipped).

<br />

## Running It In Production:

Remember you need to set the different variables in `.env` or your Cloud provider's secrets to enable the following services:

- Auth0's Machine to Machine and Single Page Applications applications, with the right actions configured in their tenant's Login flow
- Google KMS.
- MongoDB database.
- Slack integration.
