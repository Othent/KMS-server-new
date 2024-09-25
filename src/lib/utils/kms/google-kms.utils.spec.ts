import {describe, expect, test} from '@jest/globals';
import { normalizeCryptoKeyVersionState, getKeyRingIdFromIdToken, getLocationPath, getKeyRingPath, getImportJobPath, getEncryptDecryptKeyPath, getEncryptDecryptKeyVersionPath, getSignKeyPath, getSignKeyVersionPath, CryptoKeyVersionState } from './google-kms.utils';
import { IdTokenWithData } from '../auth/auth0.types';

describe('google-kms.utils', () => {
  const TEST_ID_TOKEN = { sub: "google-oauth2|47990404257262015781" } as IdTokenWithData;
  const ID_TOKEN_SUB_AS_KEYRING_ID = "google0oauth2047990404257262015781";

  test("normalizeCryptoKeyVersionState() returns the right value", () => {
    const keyVersions: CryptoKeyVersionState[] = [
      CryptoKeyVersionState.CRYPTO_KEY_VERSION_STATE_UNSPECIFIED,
      CryptoKeyVersionState.ENABLED,
      CryptoKeyVersionState.DISABLED,
      CryptoKeyVersionState.DESTROYED,
      CryptoKeyVersionState.DESTROY_SCHEDULED,
      CryptoKeyVersionState.PENDING_GENERATION,
      CryptoKeyVersionState.PENDING_IMPORT,
      CryptoKeyVersionState.IMPORT_FAILED,
      CryptoKeyVersionState.GENERATION_FAILED,
      CryptoKeyVersionState.PENDING_EXTERNAL_DESTRUCTION,
      CryptoKeyVersionState.EXTERNAL_DESTRUCTION_FAILED,
    ];

    keyVersions.forEach((keyVersionAsNumber) => {
      const keyVersionAsString = CryptoKeyVersionState[keyVersionAsNumber] as keyof typeof CryptoKeyVersionState;
      const resultFromNumber = normalizeCryptoKeyVersionState({ state: keyVersionAsNumber });
      const resultFromString = normalizeCryptoKeyVersionState({ state: keyVersionAsString });

      expect(resultFromNumber).toBe(keyVersionAsNumber);
      expect(resultFromString).toBe(keyVersionAsNumber);
    });

    [
      -1,
      11,
      "0",
      "5",
      Number.MIN_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER - 1,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER + 1,
    ].forEach((invalidState) => {
      const keyVersionFromInvalidState = normalizeCryptoKeyVersionState({ state: invalidState } as any);

      expect(keyVersionFromInvalidState).toBe(CryptoKeyVersionState.CRYPTO_KEY_VERSION_STATE_UNSPECIFIED);
    });
  });

  describe("getKeyRingIdFromIdToken()", () => {
    test("throws if `sub` is missing", () => {
      expect(() => {
        getKeyRingIdFromIdToken({} as IdTokenWithData)
      }).toThrow("Cannot retrieve KeyRing ID");
    });

    test("replaces all invalid params for a key ring ID/name", () => {
      const resultGoogle = getKeyRingIdFromIdToken({ sub: "google-oauth2|47990404257262015781"} as IdTokenWithData);
      const resultGitHub = getKeyRingIdFromIdToken({ sub: "github|1422573" } as IdTokenWithData);
      const resultEmail = getKeyRingIdFromIdToken({ sub: "auth0|6cfc78eb937ceb1f25b1b357" } as IdTokenWithData);
      const resultMadeUp = getKeyRingIdFromIdToken({ sub: "made-up-auth0|auth0|6cfc78eb937ceb1f25b1b357" } as IdTokenWithData);

      expect(resultGoogle).toBe("google0oauth2047990404257262015781");
      expect(resultGitHub).toBe("github01422573");
      expect(resultEmail).toBe("auth006cfc78eb937ceb1f25b1b357");
      expect(resultMadeUp).toBe("made0up0auth00auth006cfc78eb937ceb1f25b1b357");
    });
  });

  test("getLocationPath() returns the right value", () => {
    const result = getLocationPath();

    expect(result.locationPath).toBe("othent-kms-local#global");
  });

  test("getKeyRingPath() returns the right value", () => {
    const result = getKeyRingPath(TEST_ID_TOKEN);

    expect(result.keyRingPath).toBe(`othent-kms-local#global#${ ID_TOKEN_SUB_AS_KEYRING_ID }`);
  });

  test("getImportJobPath() returns the right value", () => {
    const result = getImportJobPath(TEST_ID_TOKEN);

    expect(result.importJobPath).toBe(`othent-kms-local#global#${ ID_TOKEN_SUB_AS_KEYRING_ID }#importJob`);
  });

  test("getEncryptDecryptKeyPath() returns the right value", () => {
    const result = getEncryptDecryptKeyPath(TEST_ID_TOKEN);

    expect(result.encryptDecryptKeyPath).toBe(`othent-kms-local#global#${ ID_TOKEN_SUB_AS_KEYRING_ID }#encryptDecrypt`);
  });

  test("getEncryptDecryptKeyVersionPath() returns the right value", () => {
    const result = getEncryptDecryptKeyVersionPath(TEST_ID_TOKEN);

    expect(result.encryptDecryptKeyVersionPath).toBe(`othent-kms-local#global#${ ID_TOKEN_SUB_AS_KEYRING_ID }#encryptDecrypt#1`);
  });

  test("getSignKeyPath() returns the right value", () => {
    const result = getSignKeyPath(TEST_ID_TOKEN);

    expect(result.signKeyPath).toBe(`othent-kms-local#global#${ ID_TOKEN_SUB_AS_KEYRING_ID }#sign`);
  });

  test("getSignKeyVersionPath() returns the right value", () => {
    const result = getSignKeyVersionPath(TEST_ID_TOKEN);

    expect(result.signKeyVersionPath).toBe(`othent-kms-local#global#${ ID_TOKEN_SUB_AS_KEYRING_ID }#sign#1`);
  });

});
