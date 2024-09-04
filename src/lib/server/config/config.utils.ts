import * as dotEnv from "dotenv";
import type { GoogleAuthOptions } from "google-auth-library";
import { google } from "@google-cloud/kms/build/protos/protos";

// TODO: Not needed in Node.js 20:
dotEnv.config();

type KMSEnvironment = "DEVELOPMENT_SERVER" | "PRODUCTION_SERVER" | "LOCAL_MOCK" | "";

export class Config {

  static KMS_DEV_PROJECT_ID = "othent-kms-dev";

  // NON-ENV:

  AUTH_SYSTEM = "KMS";
  UPLOAD_LIMIT = "100mb";

  // NODE / SERVER ENV:

  PORT = -1;
  IS_PROD = false;
  IS_DEV = false;
  IS_TEST = false;

  // AUTH0:

  AUTH0_CLIENT_DOMAIN = "";
  AUTH0_CLIENT_ID = "";
  AUTH0_CLIENT_SECRET = "";

  // GOOGLE KMS:

  GOOGLE_CREDENTIALS: NonNullable<GoogleAuthOptions["credentials"]> = {};
  KMS_ENVIRONMENT: KMSEnvironment = "";

  // Paths:
  // Changing these will prevent all users from accessing their keys!
  KMS_PROJECT_ID = "";
  KMS_PROJECT_LOCATION = "";
  KMS_IMPORT_JOB_ID = "importJob";
  KMS_SIGN_KEY_ID = "sign";
  KMS_SIGN_KEY_VERSION = "";
  KMS_ENCRYPT_DECRYPT_KEY_ID = "encryptDecrypt";
  KMS_ENCRYPT_DECRYPT_KEY_VERSION = ""; // TODO: This one not used. Why?

  // Algorithms:
  KMS_SIGN_KEY_ALGORITHM = google.cloud.kms.v1.CryptoKeyVersion.CryptoKeyVersionAlgorithm.RSA_SIGN_PSS_4096_SHA256;
  KMS_ENCRYPT_DECRYPT_KEY_ALGORITHM = google.cloud.kms.v1.CryptoKeyVersion.CryptoKeyVersionAlgorithm.GOOGLE_SYMMETRIC_ENCRYPTION;

  // MONGO DB:

  MONGODB_USERNAME = "";
  MONGODB_PASSWORD = "";
  MONGODB_HOST = "";
  MONGODB_DB_NAME = "";
  MONGODB_ENABLED = false;

  // SLACK:

  SLACK_CHANNEL_ID = "";
  SLACK_TOKEN = "";
  SLACK_ENABLED = false;

  // VALIDATION:

  constructor() {
    this.init();
  }

  init() {
    // NODE / SERVER ENV:

    this.PORT = parseInt(process.env.PORT || "") || -1;
    this.IS_PROD = process.env.NODE_ENV === "production";
    this.IS_DEV = process.env.NODE_ENV === "development";
    this.IS_TEST = process.env.NODE_ENV === "test";

    // AUTH0:

    this.AUTH0_CLIENT_DOMAIN = process.env.auth0ClientDomain || "";
    this.AUTH0_CLIENT_ID = process.env.auth0ClientId || "";
    this.AUTH0_CLIENT_SECRET = process.env.auth0ClientSecret || "";

    // GOOGLE KMS:

    // Credentials:

    let googleCredentials: GoogleAuthOptions["credentials"];

    try {
      googleCredentials = JSON.parse(
        process.env.googleCredentials || "",
      ) as GoogleAuthOptions["credentials"];

      if (!googleCredentials || typeof googleCredentials !== "object") {
        throw new Error("`process.env.googleCredentials` should be an object.");
      }
    } catch (err) {
      console.log("Cannot parse `process.env.googleCredentials`: ", err);

      process.exit(1);
    }

    this.GOOGLE_CREDENTIALS = googleCredentials || {};

    // Other KMS properties:

    this.KMS_PROJECT_ID = process.env.kmsProjectId || "";
    this.KMS_PROJECT_LOCATION = process.env.kmsProjectLocation || "";
    this.KMS_SIGN_KEY_VERSION = process.env.signKeyVersion || "";
    this.KMS_ENCRYPT_DECRYPT_KEY_VERSION = process.env.encryptDecryptKeyVersion || "";

    // Environment:

    const isGoogleKMSValidForLocal = (
      (this.IS_DEV || this.IS_TEST)
        && (this.KMS_PROJECT_ID === "")
        && (Object.keys(this.GOOGLE_CREDENTIALS).length === 0)
    );

    const isGoogleKMSValidForDev = (
      (this.IS_DEV || this.IS_TEST)
        && (this.KMS_PROJECT_ID === Config.KMS_DEV_PROJECT_ID)
        && (this.GOOGLE_CREDENTIALS.project_id === Config.KMS_DEV_PROJECT_ID)
    );

    const isGoogleKMSValidForProd = (
      this.IS_PROD
        && Object.keys(this.GOOGLE_CREDENTIALS).length > 0
        && this.GOOGLE_CREDENTIALS.project_id !== Config.KMS_DEV_PROJECT_ID
    );

    let kmsEnvironment: KMSEnvironment = "";

    if (isGoogleKMSValidForProd) {
      kmsEnvironment = "PRODUCTION_SERVER";
    } else if (isGoogleKMSValidForDev) {
      kmsEnvironment = "DEVELOPMENT_SERVER";
    } else if (isGoogleKMSValidForLocal) {
      kmsEnvironment = "LOCAL_MOCK";
    }

    this.KMS_ENVIRONMENT = kmsEnvironment;

    // MONGO DB:

    this.MONGODB_USERNAME = process.env.mongoDBUsername || "";
    this.MONGODB_PASSWORD = process.env.mongoDBPassword || "";
    this.MONGODB_HOST = process.env.mongoDBHost || "";
    this.MONGODB_DB_NAME = process.env.mongoDBName || "";

    this.MONGODB_ENABLED = !!(
      this.MONGODB_USERNAME &&
      this.MONGODB_PASSWORD &&
      this.MONGODB_HOST &&
      this.MONGODB_DB_NAME
    );

    // SLACK:

    this.SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID || "";
    this.SLACK_TOKEN = process.env.SLACK_TOKEN || "";

    this.SLACK_ENABLED = !!(this.SLACK_CHANNEL_ID && this.SLACK_TOKEN);
  }

  validate() {
    const { PORT, IS_PROD, IS_DEV, IS_TEST } = this;

    // NODE / SERVER ENV:

    const isProductionPort = PORT === 80;
    const isPortValid = PORT > 0;
    const isNodeEnvValid =
      (isProductionPort ? IS_PROD : IS_DEV || IS_TEST) && isPortValid;

    // AUTH0:

    const isAuth0Valid = !!(
      this.AUTH0_CLIENT_DOMAIN &&
      this.AUTH0_CLIENT_ID &&
      this.AUTH0_CLIENT_SECRET
    );

    // GOOGLE KMS:

    const isGoogleKMSValid = !!(
      this.KMS_ENVIRONMENT &&
      this.KMS_PROJECT_ID &&
      this.KMS_PROJECT_LOCATION &&
      this.KMS_IMPORT_JOB_ID &&
      this.KMS_SIGN_KEY_ID &&
      this.KMS_SIGN_KEY_VERSION &&
      this.KMS_ENCRYPT_DECRYPT_KEY_ID &&
      this.KMS_ENCRYPT_DECRYPT_KEY_VERSION &&
      this.KMS_SIGN_KEY_ALGORITHM &&
      this.KMS_ENCRYPT_DECRYPT_KEY_ALGORITHM
    );

    // MONGODB & SLACK:

    const isMongoDBValid = IS_PROD ? this.MONGODB_ENABLED : true;
    const isSlackValid = IS_PROD ? this.SLACK_ENABLED : true;

    return {
      isNodeEnvValid,
      isAuth0Valid,
      isGoogleKMSValid,
      isMongoDBValid,
      isSlackValid,
    };
  }

  get isValid() {
    return Object.values(this.validate()).every((isValid) => isValid);
  }

  log() {
    const { PORT, IS_PROD, IS_DEV, IS_TEST, KMS_ENVIRONMENT } = this;

    const {
      isNodeEnvValid,
      isAuth0Valid,
      isGoogleKMSValid,
      isMongoDBValid,
      isSlackValid,
    } = this.validate();

    console.log("");
    console.log(
      `${isNodeEnvValid ? "✅" : "❌"}  NODE / SERVER ENV${isNodeEnvValid ? ":" : " - Invalid environment"}`,
    );
    console.log(" ╷");
    console.log(` ├ PORT = ${PORT}`);
    console.log(` ├ NODE_ENV = ${process.env.NODE_ENV}`);
    console.log(` ├ IS_PROD = ${IS_PROD}`);
    console.log(` ├ IS_DEV = ${IS_DEV}`);
    console.log(` └ IS_TEST = ${IS_TEST}`);
    console.log("");
    console.log(
      `${isAuth0Valid ? "✅" : "❌"}  AUTH0${isAuth0Valid ? ":" : " - Auth0 must always be configured"}`,
    );
    console.log(" ╷");
    console.log(` ├ AUTH0_CLIENT_DOMAIN = ${this.AUTH0_CLIENT_DOMAIN}`);
    console.log(` ├ AUTH0_CLIENT_ID = ${this.AUTH0_CLIENT_ID}`);
    console.log(
      ` └ AUTH0_CLIENT_SECRET = ${this.AUTH0_CLIENT_SECRET ? "****" : ""}  `,
    );
    console.log("");
    console.log(
      `${isGoogleKMSValid ? "✅" : "❌"}  GOOGLE KMS (${ KMS_ENVIRONMENT })${isGoogleKMSValid ? ":" : " - GoogleKMS must be configured in production"}`,
    );
    console.log(" ╷");
    console.log(` ├ GOOGLE_CREDENTIALS = ${Object.keys(this.GOOGLE_CREDENTIALS).length > 0 ? "{ **** }" : "{}"}`);
    console.log(` ├ KMS_PROJECT_ID = ${!!this.KMS_PROJECT_ID ? "****" : ""}`);
    console.log(` ├ KMS_PROJECT_LOCATION = ${!!this.KMS_PROJECT_LOCATION ? "****" : ""}`);
    console.log(` ├ KMS_IMPORT_JOB_ID = ${!!this.KMS_IMPORT_JOB_ID ? "****" : ""}`);
    console.log(` ├ KMS_SIGN_KEY_ID = ${!!this.KMS_SIGN_KEY_ID ? "****" : ""}`);
    console.log(` ├ KMS_SIGN_KEY_VERSION = ${!!this.KMS_SIGN_KEY_VERSION ? "****" : ""}`);
    console.log(` ├ KMS_SIGN_KEY_ALGORITHM = ${!!this.KMS_SIGN_KEY_ALGORITHM ? "****" : ""}`);
    console.log(` ├ KMS_ENCRYPT_DECRYPT_KEY_ID = ${!!this.KMS_ENCRYPT_DECRYPT_KEY_ID ? "****" : ""}`);
    console.log(` ├ KMS_ENCRYPT_DECRYPT_KEY_VERSION = ${!!this.KMS_ENCRYPT_DECRYPT_KEY_VERSION ? "****" : ""}`);
    console.log(` └ KMS_ENCRYPT_DECRYPT_KEY_ALGORITHM = ${!!this.KMS_ENCRYPT_DECRYPT_KEY_ALGORITHM ? "****" : ""}`);
    console.log("");
    console.log(
      `${isMongoDBValid ? "✅" : "❌"}  MONGO DB${isMongoDBValid ? ":" : " - MongoDB must be configured in production"}`,
    );
    console.log(" ╷");
    console.log(
      ` ├ MONGODB_USERNAME = ${!!this.MONGODB_USERNAME ? "****" : ""}`,
    );
    console.log(
      ` ├ MONGODB_PASSWORD = ${!!this.MONGODB_PASSWORD ? "****" : ""}`,
    );
    console.log(` ├ MONGODB_HOST = ${!!this.MONGODB_HOST ? "****" : ""}`);
    console.log(` └ MONGODB_DB_NAME = ${!!this.MONGODB_DB_NAME ? "****" : ""}`);
    console.log("");
    console.log(
      `${isSlackValid ? "✅" : "❌"}  SLACK${isSlackValid ? ":" : " - Slack must be configured in production"}`,
    );
    console.log(" ╷");
    console.log(
      ` ├ SLACK_CHANNEL_ID = ${!!process.env.SLACK_CHANNEL_ID ? "****" : ""}`,
    );
    console.log(` └ SLACK_TOKEN = ${!!process.env.SLACK_TOKEN ? "****" : ""}`);
    console.log("");
  }
}

export const CONFIG = new Config();
