# Othent KMS Server

Othent's Node.js/Express.js server to manage Arweave wallets/keys stored in Google Key Management Service, secured by
Auth0.

Try our demo at [kms-demo.othent.io](https://kms-demo.othent.io)!

<br />

[![Othent KMS JS SDK NPM page](https://img.shields.io/npm/v/%40othent%2Fkms?style=for-the-badge&color=%23CC3534)](https://www.npmjs.com/package/@othent/kms) [![Othent KMS Server Statements Coverage](https://img.shields.io/badge/Stmts_Coverage-81.55%25-black?style=for-the-badge&color=%23008000)](https://www.npmjs.com/package/@othent/kms)


<br />

[![Othent KMS JS SDK NPM demo](https://kms-demo.othent.io/othent-kms-demo-screenshot.png)](https://kms-demo.othent.io)

<br />

Learn how to set it up at https://docs.othent.io or looking at our demo's code at https://github.com/Othent/KMS-test-repo.

<br />

## Running It Locally:

First, you need to update `.env` with a valid `auth0CustomDomain`, `auth0ClientDomain`, `auth0ClientId` and `auth0ClientSecret` values pointing to an Auth0
application created with the following params:

- Type: `Machine to Machine`.
- Permissions / Scopes: `read:client_credentials` and `update:users` (this cannot be change after creating the Application).
- Credentials: `Client Secret (Post)`.
- Grant Types: `Client Credentials`.

Also, the tenant both this Machine to Machine application and the Single Page application used the KMS SDK (`KeyManagementService`) you are using should have
at least the `actions/add-user-metadata.ts` action configured in its Login flow.

Then, simply run:

```
  pnpm install
  pnpm start
```

You don't need to configure the remaining 3 services:

- Google KMS will be replaced by a local mocked implementation (which uses the same keys for all users).
- MongoDB database won't be used (this logic is skipped).
- Slack integration won't be used (this logic is skipped).

You might also want to install VSCode's CodeQL extension. See https://codeql.github.com/.

<br />


## Running It In Production:

Remember you need to set the different variables in `.env` or your Cloud provider's secrets to enable the following services:

- Auth0's Machine to Machine and Single Page Applications applications, with the right actions configured in their tenant's Login flow
- Google KMS.
- MongoDB database.
- Slack integration.

<br />


## Testing And Backwards Compatibility:

As there's only one production / live version of the server project at a time, tests need to make sure that the current
server can take request and send responses that work with both the latest SDK (`@othent/kms`) version, as well as older
versions.

Below we can see a breakdown of the main server functions and the data types the different SDK versions would send to
them and expect as response.

This repository contains a specific `.spec.ts` for each of these functions, to verify they work as expected and are
backwards-compatible. Alternatively, the [playground project]( https://github.com/Othent/KMS-test-repo) can be run
locally with an older (`v1`) `@othent/kms` by using an adapter (included in the repo, but commented out). However, keep
in mind that won't be as exhaustive as the test in this repo, and not all cases mentioned below will be tested.

<br />


### v1 SDK

- `createUser`

  - The old server expects no data in `createUser`.

  - The old server replies with `true` if the user was successfully created.

- `encrypt`

  - The old SDK (according to the docs) takes `Uint8Array | string`, but in practice the old server only accepts
    `LegacyBufferObject | string`, as the `Uint8Array` would be serialized using `JSON.stringify()` and deserialized
    using `Buffer.from()`, which would not accept the resulting `LegacyBufferRecord`.

    See:

    - https://github.com/Othent/KeyManagementService/pull/18/files#diff-3196ebbd6ec8d2b54d0da4680941db6b502b1c82fa7366c72746e4f1a41a4a96
    - https://github.com/Othent/KMS-server-new/pull/10#discussion_r1682666284

  - The old server would reply with a `LegacyBufferObject` and the old SDK would return that as-is.

    See https://github.com/Othent/KeyManagementService/pull/18/files#r1686770313

- `decrypt`

  - The old SDK (according to the examples) takes `LegacyBufferObject` (as returned from `encrypt`), but as the old
    server deserializes that using `Buffer.form()`, a `string` would also be valid if encoded properly.

    See:

    - https://github.com/Othent/KMS-server-new/pull/10/files#diff-547cb059a26afae3681f1c161d74dedf9c6872fd8ac50a1fbe7dcce6eeb544ec
    - https://github.com/Othent/KeyManagementService/pull/18/files#r1686770313

  - The old server would reply with a plain `string`.

    See https://github.com/Othent/KMS-server-new/pull/10/files#r1745868667

- `sign`

  - The old SKD would only accept binary data that, after being serialized with `JSON.stringify()` would result in a
    `LegacyBufferRecord`, which would then be deserialized by the old server with `new Uint8Array(Object.values(data))`

    See https://github.com/Othent/KMS-server-new/pull/10#discussion_r1682671389

  - The old server would reply with a `LegacyBufferObject` and the old SDK would return that as-is.

    See https://github.com/Othent/KeyManagementService/pull/18/files#r1686770313

<br />


### v2.0.0 SDK

Version `2.0.0` of `@othent/kms` improves and normalizes the data types accepted and returned by the different
functions, but doesn't change the shape in which that data is sent to the server, so that's still `LegacyBufferRecord`
for `sign()` and `LegacyBufferObject` for the other functions. That means that this new version of the SDK works with
the old backend.

The only breaking change is that `decrypt` would not accept `BufferObject` / `LegacyBufferObject` automatically, and
developers upgrading to `2.0.0` would have to convert those manually.

See: https://github.com/Othent/KeyManagementService/pull/18/files#r1686770313

<br />


### v2.1.0 SDK

Version `2.1.0` of `@othent/kms` changes the shape in which that data is sent to the server, getting rid of the legacy
data types. That means that this new version of the SDK doesn't work with the old backend. These are the main changes:

- Remove `data.keyName` and add `data.path` instead.

- Stop using `BufferObject` / `LegacyBufferObject` / `LegacyBufferRecord` and instead serialize/send all data as
  `B64string`.

- The `data.data` construct when extracting the data from the server responses has been replaced to have specific
  property names for each endpoint (e.g. `data.encryptedData`).

<br />


### Server Needs

According to 3 sections above, the server needs to handle both the old format / data types (`keyName` + `BufferObject`
/ `LegacyBufferObject` data) as well as the new ones (`path` + `B64string`), so:

- If `data.keyName` is present, validate the data according to the format / shape required by the old server
  (`BufferObject` / `LegacyBufferObject` / `LegacyBufferRecord`). The exception to this is `createUser`, which would not
  have any `data`.

- If `data.path` is present, validate the data according to the format / shape required by the new server (`B64string`),
  and use a specific property name for each endpoint to return the response's data (e.g. `data.encryptedData`).

<br />


## Deploying A New Release:

1.  Use [`pnpm version`](https://docs.npmjs.com/cli/v7/commands/npm-version) to bump the version, which will also make sure
    the next commit has the right tags.

    ```
    npm version patch
    npm version minor
    npm version major
    ```

    The `preversion`, `version` and `postversion` scripts defined in `package.json` will test, format, build, tag and
    push all the changes automatically. See https://docs.npmjs.com/cli/v10/commands/npm-version.

2.  As soon as the new branch gets merged, a new up-to-date server will be deployed. You can verify the current live
    version with a `GET` request to https://kms-server.othent.io:

  	```
    {
      "version": "2.0.0",
      "hasToken": false,
      "hasTokenData": false,
      "isTokenValid": false,
      "isTokenUnused": true
    }
    ```

<br />


### Troubleshooting

If you added / pushed an incorrect tag, you can delete it from the server with:

    git push origin :refs/tags/v0.1.0

And locally with:

    git tag -d v0.1.0
