import * as dotEnv from "dotenv";

dotEnv.config();

const isProductionPort = process.env.PORT === "80";
const isProd = process.env.NODE_ENV === "production";
const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";
const isNodeEnvValid = isProductionPort ? isProd : isDev || isTest;

export const hasRequiredEnvVars = !!(
  process.env.auth0ClientDomain &&
  process.env.auth0ClientId &&
  process.env.auth0ClientSecret &&
  process.env.kmsProjectId &&
  process.env.googleCredentials &&
  process.env.signKeyVersion
);

export const useMongoDB = !!(
  process.env.mongoDBUsername &&
  process.env.mongoDBPassword &&
  process.env.mongoDBHost &&
  process.env.mongoDBName
);

export const useSlack = !!(
  process.env.SLACK_CHANNEL_ID && process.env.SLACK_TOKEN
);

const hasRequiredMongoDB = isProd ? useMongoDB : true;
const hasRequiredSlack = isProd ? useSlack : true;

// TODO: Validate port is number and googleCredentials is valid JSON / valid shape.

export function verifyEnvironmentVariables() {
  console.log("");
  console.log("NODE / SERVER ENV:");
  console.log("");
  console.log(`PORT = ${process.env.PORT}`);
  console.log(`process.env.NODE_ENV = ${process.env.NODE_ENV}`);
  console.log(`isProd = ${isProd}`);
  console.log(`isDev = ${isDev}`);
  console.log(`isTest = ${isTest}`);
  console.log("");
  console.log(
    `${isNodeEnvValid ? "✅  Valid environment." : "❌  Invalid environment."}`,
  );
  console.log("");
  console.log("REQUIRED ENV VARIABLES:");
  console.log("");
  console.log(
    `${!!process.env.auth0ClientDomain ? "✅" : "❌"}  auth0ClientDomain`,
  );
  console.log(`${!!process.env.auth0ClientId ? "✅" : "❌"}  auth0ClientId`);
  console.log(
    `${!!process.env.auth0ClientSecret ? "✅" : "❌"}  auth0ClientSecret`,
  );
  console.log(`${!!process.env.kmsProjectId ? "✅" : "❌"}  kmsProjectId`);
  console.log(
    `${!!process.env.googleCredentials ? "✅" : "❌"}  googleCredentials`,
  );
  console.log(`${!!process.env.signKeyVersion ? "✅" : "❌"}  signKeyVersion`);
  console.log("");
  console.log("MONGO DB:");
  console.log("");
  console.log(
    `${!!process.env.mongoDBUsername ? "✅" : "❌"}  mongoDBUsername`,
  );
  console.log(
    `${!!process.env.mongoDBPassword ? "✅" : "❌"}  mongoDBPassword`,
  );
  console.log(`${!!process.env.mongoDBHost ? "✅" : "❌"}  mongoDBHost`);
  console.log(`${!!process.env.mongoDBName ? "✅" : "❌"}  mongoDBName`);
  console.log("");
  console.log(
    `${hasRequiredMongoDB ? "✅  Valid MongoDB config." : "❌  MongoDB must be configured in production."}`,
  );
  console.log("");
  console.log("SLACK:");
  console.log("");
  console.log(
    `${!!process.env.SLACK_CHANNEL_ID ? "✅" : "❌"}  SLACK_CHANNEL_ID`,
  );
  console.log(`${!!process.env.SLACK_TOKEN ? "✅" : "❌"}  SLACK_TOKEN`);
  console.log("");
  console.log(
    `${hasRequiredSlack ? "✅  Valid Slack config." : "❌  Slack must be configured in production."}`,
  );
  console.log("");

  if (
    !isNodeEnvValid ||
    !hasRequiredEnvVars ||
    !hasRequiredMongoDB ||
    !hasRequiredSlack
  ) {
    process.exit(1);
  }
}
