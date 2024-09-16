# KMS Server (New)

Node.js/Express.js server to interact with Auth0 and Google KMS.

<br />

## Running It Locally:

First, you need to update `.env` with a valid `auth0CustomDomain`, `auth0ClientDomain`, `auth0ClientId` and `auth0ClientSecret` values pointing to an Auth0
application with the following params:

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

<br />

## Running It In Production:

Remember you need to set the different variables in `.env` or your Cloud provider's secrets to enable the following services:

- Auth0's Machine to Machine and Single Page Applications applications, with the right actions configured in their tenant's Login flow
- Google KMS.
- MongoDB database.
- Slack integration.

## Testing And Backwards Compatibility:

As there's only one production / live version of the server project at a time, tests need to make sure that the current
server can take request and send responses that work with both the old SDK and the new SDK.

Below we can see a breakdown of the main server functions and the data types the different SDK versions would send to
them and expect as response.

Also note that, right now the request data types mentioned below are the ones included as `data` in Auth0's ID token.
- The response data types mentioned below are sent directly, mea

### Old SDK (v1)

To verify that the server is backwards-compatible with the old SDK you should run `sdk-v1-compatibility.e2e.ts`.
Alternatively, you can also run the playground locally with an old `v1` SDK plus an adapter, but that won't be as
exhaustive as the test and some of the param types mentioned below won't be tested:

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


### New SDK (v2.0.0)

Version `2.0.0` of `@othent/kms` improves and normalizes the data types accepted and returned by the different
functions, but doesn't change the shape in which that data is sent to the server, so that's still `LegacyBufferRecord`
for `sign()` and `LegacyBufferObject` for the other functions. That means that this new version of the SDK works with
the old backend.

The only breaking change is that `decrypt` would not accept `BufferObject` / `LegacyBufferObject` automatically, and
developers upgrading to `2.0.0` would have to convert those manually.

See: https://github.com/Othent/KeyManagementService/pull/18/files#r1686770313

### New / Upcoming Server & SDK (v2.1.0)

For the server, particularly:

- If `data.keyName` is present, validate the data according to the format / shape required by the old server. The
  exception to this is `createUser`, which would not have any `data`.

- If `data.path` is present, validate the data according to the format / shape required by the new server, and unwrap it
  (remove that unnecessary `data` (`data.data`) property in the response).

For the SDK, particularly:

- Remove `data.keyName`.
- Add `data.path` and validate this on the server as well.
- Stop using `BufferObject` / `LegacyBufferObject` / `LegacyBufferRecord` and instead serialize/send the data as
  `B64string`.
- Also update the parsing of the responses after the server stops sending that unnecessary `data` property.
