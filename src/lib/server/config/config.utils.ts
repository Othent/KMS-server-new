import * as dotEnv from "dotenv";
import { GoogleAuthOptions } from "google-auth-library";

// TODO: Not needed in Node.js 20:
dotEnv.config();

export class Config {
  // NON-ENV:

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

  KMS_PROJECT_ID = "";
  GOOGLE_CREDENTIALS: NonNullable<GoogleAuthOptions["credentials"]> = {};
  SIGN_KEY_VERSION = "";

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

    this.KMS_PROJECT_ID = process.env.kmsProjectId || "";
    this.GOOGLE_CREDENTIALS = googleCredentials || {};
    this.SIGN_KEY_VERSION = process.env.signKeyVersion || "";

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

    const isGoogleKMSValid = IS_PROD
      ? !!(
          this.KMS_PROJECT_ID &&
          Object.keys(this.GOOGLE_CREDENTIALS).length > 0 &&
          this.SIGN_KEY_VERSION
        )
      : true;

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
    const { PORT, IS_PROD, IS_DEV, IS_TEST } = this;

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
      `${isGoogleKMSValid ? "✅" : "❌"}  GOOGLE KMS${isGoogleKMSValid ? ":" : " - GoogleKMS must be configured in production"}`,
    );
    console.log(" ╷");
    console.log(` ├ KMS_PROJECT_ID = ${!!this.KMS_PROJECT_ID ? "****" : ""}`);
    console.log(
      ` ├ GOOGLE_CREDENTIALS = ${!!this.GOOGLE_CREDENTIALS ? "****" : ""}`,
    );
    console.log(
      ` └ SIGN_KEY_VERSION = ${!!this.SIGN_KEY_VERSION ? "****" : ""}`,
    );
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
