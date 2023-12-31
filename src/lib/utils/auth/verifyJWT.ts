import { verify } from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { getLastNonce, updateJWTNonce } from "../database/DB";

interface accessToken extends JwtPayload {
  data: {
    ciphertext: string;
    plaintext: string;
    keyName: string;
    data: string;
  };
}

export const OTHENT_PUBLIC_KEY = `-----BEGIN CERTIFICATE-----
MIIDATCCAemgAwIBAgIJCASZzYUxA3ZaMA0GCSqGSIb3DQEBCwUAMB4xHDAaBgNV
BAMTE290aGVudC51cy5hdXRoMC5jb20wHhcNMjMwMzI3MTUwMTQ1WhcNMzYxMjAz
MTUwMTQ1WjAeMRwwGgYDVQQDExNvdGhlbnQudXMuYXV0aDAuY29tMIIBIjANBgkq
hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuMfe7y1WRZNruqTF4tIxgkN/Z5POJPVH
7He1ykzbO+zTVmbb6yhTMsw5wXOqXEner7o/RB4iaY9HWZCeUqQ++keVJmrOmGyW
k8Z3zH/6+i7BmRFJ/JZKLHQA2f4QTGHnV4x38Qo5YdkXyBmepXlspHLwmt6ZnusR
r2dKdXs31BLkviHgKiYdGjJHgBB/nHHceOMbqu96OxtfnK6Tof72Fv1slfrd0wg4
2INHTDL7X1uTLiG8rAQJmoL8CFaqiEOBQXPB56d4ZrLudWOxOgnq5nvaJWhgS73g
ciSQ8ep7dekkXz5SxORELHO+zf4P8mH+6suJawGJm2BdKFBoz4zkcQIDAQABo0Iw
QDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTjozrzbwQ0004hmoRdkNw/RfZS
pDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBACD3YaG9S8m93ikv
B679JndGDcQ1QKXJX2yqAtLwUaJlRhHEbRtXym3J+kIHo1OOK8JAftcbbZq34p+v
p2YZm2gUDTiMQz1QQdKVmjB9TnNYP9jI7b4lupfuDeMntAVAo8b8WCrRQV4voN88
+XvagZ9H3sv7fdPHp1mKGjbpz9uBkXsujdQrdvfjIS5DzYDagyTlNboHQBbbS2bG
czxVhbQzxSOJlvug/pN3uUuyGo8DB4WDtBpb3fSnNAiox1n33E93P6zhyPg5QVSQ
lY/ACXm3UhY5UsRZXEzjoAL/ymM68b6B/85N4Xypve+bUk+Zwb9Ojmwb0pU9azQE
XxRWPy8=
-----END CERTIFICATE-----`;

export async function verifyJWT(JWT: string, OTHENT_PUBLIC_KEY: string) {
  try {
    const JWT_decoded = verify(JWT, OTHENT_PUBLIC_KEY, {
      algorithms: ["RS256"],
    }) as JwtPayload;

    // @ts-ignore, there is always a sub on the jwt
    const lastNonce = await getLastNonce(JWT_decoded.sub, JWT_decoded.iat);

    if (JWT_decoded.iat) {
      if (JWT_decoded.iat <= lastNonce) {
        return false;
      } else {
        // @ts-ignore, there is always a sub on the jwt
        const updateNonce = await updateJWTNonce(
          // @ts-ignore
          JWT_decoded.sub,
          JWT_decoded.iat,
        );
        if (!updateNonce) {
          return false;
        }
      }
    } else {
      console.log("Invalid token structure");
      throw new Error("Invalid token structure");
    }

    delete JWT_decoded.given_name;
    delete JWT_decoded.family_name;
    delete JWT_decoded.nickname;
    delete JWT_decoded.picture;
    delete JWT_decoded.locale;
    delete JWT_decoded.updated_at;
    delete JWT_decoded.email;
    delete JWT_decoded.email_verified;
    delete JWT_decoded.iss;
    delete JWT_decoded.aud;
    delete JWT_decoded.sid;
    delete JWT_decoded.nonce;
    delete JWT_decoded.exp;
    delete JWT_decoded.name;

    if (typeof JWT_decoded === "object") {
      return JWT_decoded as accessToken;
    }

    throw new Error("Invalid token structure");
  } catch (error) {
    return false;
  }
}
