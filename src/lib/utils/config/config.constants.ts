import * as dotEnv from "dotenv";
import { GoogleAuthOptions } from "google-auth-library";

dotEnv.config();

export const PORT = parseInt(process.env.PORT || "") || -1;

let googleCredentials: GoogleAuthOptions["credentials"] | null = null;

try {
  googleCredentials = JSON.parse(
    process.env.googleCredentials || "",
  ) as GoogleAuthOptions["credentials"];

  if (!googleCredentials || typeof googleCredentials !== "object") {
    throw new Error("`process.env.googleCredentials` should be an object.");
  } else if (Object.keys(googleCredentials).length === 0) {
    googleCredentials = null;
  }
} catch (err) {
  console.log("Cannot parse `process.env.googleCredentials`: ", err);

  process.exit(1);
}

export const GOOGLE_CREDENTIALS = googleCredentials;
