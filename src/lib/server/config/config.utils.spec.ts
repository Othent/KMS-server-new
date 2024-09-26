import {describe, expect, test} from '@jest/globals';
import { Config, CONFIG, KMSEnvironment } from './config.utils';
import crypto from "node:crypto";

describe('Config', () => {

  describe('CONFIG', () => {
    test("data hasn't changed", () => {
      const staticConfigProps = {
        ...CONFIG,
        pgkVersion: "<pgkVersion>",
        buildDate: "<pgkVersion>",
      };

      const hash = crypto.createHash('sha256');

      hash.update(JSON.stringify(staticConfigProps));

      const digest = hash.digest('hex');

      expect(digest).toBe("5606eac24084a7a615d28a265e17c7e8db4b2f39857fed3afe86ae0906cd32ce");
    });

    test("log hasn't changed", () => {
      let aggregatedConsoleLogOutput = "";

      console.log = jest.fn((...args) => {
        aggregatedConsoleLogOutput += `${ args.join(" ").trimEnd() }\n`;
      });

      CONFIG.log();

     expect(aggregatedConsoleLogOutput).toBe(`
✅  NODE / SERVER ENV:
 ╷
 ├ PORT = 3010
 ├ NODE_ENV = test
 ├ IS_PROD = false
 ├ IS_DEV = false
 └ IS_TEST = true

✅  AUTH0:
 ╷
 ├ AUTH0_CUSTOM_DOMAIN = auth.othent.io
 ├ AUTH0_M2M_CLIENT_DOMAIN = othent.us.auth0.com
 ├ AUTH0_M2M_CLIENT_ID = 75EEYxya0AyLPao5TuSLJRGgNrhbba3A
 └ AUTH0_M2M_CLIENT_SECRET = ****

✅  GOOGLE KMS (LOCAL_MOCK):
 ╷
 ├ GOOGLE_CREDENTIALS = {}
 ├ KMS_PROJECT_ID = ****
 ├ KMS_PROJECT_LOCATION = ****
 ├ KMS_IMPORT_JOB_ID = ****
 ├ KMS_SIGN_KEY_ID = ****
 ├ KMS_SIGN_KEY_VERSION = ****
 ├ KMS_SIGN_KEY_ALGORITHM = ****
 ├ KMS_ENCRYPT_DECRYPT_KEY_ID = ****
 ├ KMS_ENCRYPT_DECRYPT_KEY_VERSION = ****
 └ KMS_ENCRYPT_DECRYPT_KEY_ALGORITHM = ****

⚫  MONGO DB:
 ╷
 ├ MONGODB_USERNAME =
 ├ MONGODB_PASSWORD =
 ├ MONGODB_HOST =
 └ MONGODB_DB_NAME =

⚫  SLACK:
 ╷
 ├ SLACK_CHANNEL_ID =
 └ SLACK_TOKEN =

`);

    });
  });

  describe('validation', () => {

    test('requires PORT > 0', async () => {
      const config = new Config();

      config.PORT = -1;
      expect(config.validate().isNodeEnvValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.PORT = 0;
      expect(config.validate().isNodeEnvValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.PORT = CONFIG.PORT;
      expect(config.validate().isNodeEnvValid).toBe(true);
      expect(config.isValid).toBe(true);
    });

    test('requires a valid NODE_ENV', async () => {
      const config = new Config();

      config.IS_PROD = false;
      config.IS_DEV = false;
      config.IS_TEST = false;

      expect(config.validate().isNodeEnvValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.IS_PROD = true;
      expect(config.validate().isNodeEnvValid).toBe(true);
      config.IS_PROD = false;

      config.IS_DEV = true;
      expect(config.validate().isNodeEnvValid).toBe(true);
      config.IS_DEV = false;

      config.IS_TEST = true;
      expect(config.validate().isNodeEnvValid).toBe(true);
      config.IS_DEV = false;

      config.IS_PROD = true;
      config.IS_DEV = true;
      config.IS_TEST = true;

      expect(config.validate().isNodeEnvValid).toBe(false);
    });

    test('requires a valid Auth0 config', async () => {
      const config = new Config();

      config.AUTH0_CUSTOM_DOMAIN = "";
      config.AUTH0_M2M_CLIENT_DOMAIN = "";
      config.AUTH0_M2M_CLIENT_ID = "";
      config.AUTH0_M2M_CLIENT_SECRET = "";

      expect(config.validate().isAuth0Valid).toBe(false);
      expect(config.isValid).toBe(false);

      config.AUTH0_CUSTOM_DOMAIN = CONFIG.AUTH0_CUSTOM_DOMAIN;
      expect(config.validate().isAuth0Valid).toBe(false);
      expect(config.isValid).toBe(false);

      config.AUTH0_M2M_CLIENT_DOMAIN = CONFIG.AUTH0_M2M_CLIENT_DOMAIN;
      expect(config.validate().isAuth0Valid).toBe(false);
      expect(config.isValid).toBe(false);

      config.AUTH0_M2M_CLIENT_ID = CONFIG.AUTH0_M2M_CLIENT_ID;
      expect(config.validate().isAuth0Valid).toBe(false);
      expect(config.isValid).toBe(false);

      config.AUTH0_M2M_CLIENT_SECRET = CONFIG.AUTH0_M2M_CLIENT_SECRET;
      expect(config.validate().isAuth0Valid).toBe(true);
      expect(config.isValid).toBe(true);
    });

    test('requires a valid Google KMS config', async () => {
      const config = new Config();

      config.KMS_ENVIRONMENT = "";
      config.KMS_PROJECT_ID = "";
      config.KMS_PROJECT_LOCATION = "";
      config.KMS_IMPORT_JOB_ID = "";
      config.KMS_SIGN_KEY_ID = "";
      config.KMS_SIGN_KEY_VERSION = "";
      config.KMS_ENCRYPT_DECRYPT_KEY_ID = "";
      config.KMS_ENCRYPT_DECRYPT_KEY_VERSION = "";
      config.KMS_SIGN_KEY_ALGORITHM = 0;
      config.KMS_ENCRYPT_DECRYPT_KEY_ALGORITHM = 0;

      expect(config.validate().isGoogleKMSValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.KMS_ENVIRONMENT = CONFIG.KMS_ENVIRONMENT;
      expect(config.validate().isGoogleKMSValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.KMS_PROJECT_ID = CONFIG.KMS_PROJECT_ID;
      expect(config.validate().isGoogleKMSValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.KMS_PROJECT_LOCATION = CONFIG.KMS_PROJECT_LOCATION;
      expect(config.validate().isGoogleKMSValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.KMS_IMPORT_JOB_ID = CONFIG.KMS_IMPORT_JOB_ID;
      expect(config.validate().isGoogleKMSValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.KMS_SIGN_KEY_ID = CONFIG.KMS_SIGN_KEY_ID;
      expect(config.validate().isGoogleKMSValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.KMS_SIGN_KEY_VERSION = CONFIG.KMS_SIGN_KEY_VERSION;
      expect(config.validate().isGoogleKMSValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.KMS_ENCRYPT_DECRYPT_KEY_ID = CONFIG.KMS_ENCRYPT_DECRYPT_KEY_ID;
      expect(config.validate().isGoogleKMSValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.KMS_ENCRYPT_DECRYPT_KEY_VERSION = CONFIG.KMS_ENCRYPT_DECRYPT_KEY_VERSION;
      expect(config.validate().isGoogleKMSValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.KMS_SIGN_KEY_ALGORITHM = CONFIG.KMS_SIGN_KEY_ALGORITHM;
      expect(config.validate().isGoogleKMSValid).toBe(false);
      expect(config.isValid).toBe(false);

      config.KMS_ENCRYPT_DECRYPT_KEY_ALGORITHM = CONFIG.KMS_ENCRYPT_DECRYPT_KEY_ALGORITHM;
      expect(config.validate().isGoogleKMSValid).toBe(true);
      expect(config.isValid).toBe(true);
    });

    test('requires the Google KMS config to match the environment', async () => {
      const config = new Config();

      expect(config.validate().isGoogleKMSValid).toBe(true);
      expect(config.isValid).toBe(true);

      const envAndGoogleKMSCombinations = [
        ["PRODUCTION_SERVER", true, false, false, true],
        ["PRODUCTION_SERVER", false, true, false, false],
        ["PRODUCTION_SERVER", false, false, true, false],
        ["DEVELOPMENT_SERVER", true, false, false, false],
        ["DEVELOPMENT_SERVER", false, true, false, true],
        ["DEVELOPMENT_SERVER", false, false, true, true],
        ["LOCAL_MOCK", true, false, false, false],
        ["LOCAL_MOCK", false, true, false, true],
        ["LOCAL_MOCK", false, false, true, true],
      ] satisfies [KMSEnvironment, boolean, boolean, boolean, boolean][];

      envAndGoogleKMSCombinations.forEach(([KMS_ENVIRONMENT, IS_PROD, IS_DEV, IS_TEST, isValid]) => {
        config.KMS_ENVIRONMENT = KMS_ENVIRONMENT;
        config.IS_PROD = IS_PROD;
        config.IS_DEV = IS_DEV;
        config.IS_TEST = IS_TEST;

        expect(config.validate().isGoogleKMSValid).toBe(isValid);
      });
    });

    test('requires MongoDB and Slack to be enabled in production', async () => {
      const config = new Config();

      expect(config.validate().isMongoDBValid).toBe(true);
      expect(config.validate().isSlackValid).toBe(true);
      expect(config.isValid).toBe(true);

      config.IS_PROD = true;

      expect(config.validate().isMongoDBValid).toBe(false);
      expect(config.validate().isSlackValid).toBe(false);
      expect(config.isValid).toBe(false);
    });

  });

});
