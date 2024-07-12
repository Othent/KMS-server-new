import { OthentApp } from "./lib/server/server";
import { CONFIG } from "./lib/server/config/config.utils";
import express from "express";

let app: express.Application | null = null;

try {
  CONFIG.log();

  if (!CONFIG.isValid) throw new Error("Invalid config.");

  const othentApp = new OthentApp();

  othentApp.listen();

  app = othentApp.getExpressApp();
} catch (err) {
  console.log("The server could not be started:", err);

  process.exit(1);
}

export default app;
