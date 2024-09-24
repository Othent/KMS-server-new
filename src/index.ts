import { OthentApp } from "./lib/server/server";
import { CONFIG } from "./lib/server/config/config.utils";
import express from "express";

interface ServerArgs {
  onlyCheck?: boolean;
}

const args = process.argv.slice(2).reduce((acc, cur) => {
  const parts = cur.split("=");
  const key = parts[0].replace(/^-+/, "");
  const value = parts[1] === undefined ? true : parts[1];

  acc[key] = value;

  return acc;
}, {} as Record<string, string | boolean>) as ServerArgs;

let app: express.Application | null = null;

try {
  CONFIG.log();

  if (!CONFIG.isValid) throw new Error("Invalid config.");

  const othentApp = new OthentApp();

  if (!args.onlyCheck) {
    othentApp.listen();
  }

  app = othentApp.getExpressApp();
} catch (err) {
  console.log("The server could not be started:", err);

  process.exit(1);
}

export default app;
