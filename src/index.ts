import { OthentApp } from "./lib/server/server";
import {
  Config,
  verifyEnvironmentVariables,
} from "./lib/server/config/config.utils";
import express from "express";

verifyEnvironmentVariables();

let app: express.Application | null = null;

try {
  const config = new Config();

  config.log();

  if (!config.isValid) throw new Error("Invalid config.");

  const othentApp = new OthentApp(config);

  othentApp.listen();

  app = othentApp.getExpressApp();
} catch (err) {
  console.log("The server could not be started:", err);

  process.exit(1);
}

export default app;
