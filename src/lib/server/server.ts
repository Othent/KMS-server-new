import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as dotEnv from "dotenv";
import { Route } from "./server.constants";
import { pingHandlerFactory } from "../operations/ping/ping.handler";
import { createUserHandlerFactory } from "../operations/create-user/create-user.handler";
import { decryptHandlerFactory } from "../operations/decrypt/decrypt.handler";
import { encryptHandlerFactory } from "../operations/encrypt/encrypt.handler";
import { signHandlerFactory } from "../operations/sign/sign.handler";
import { createBundleAndSignHandlerFactory } from "../operations/create-bundle-and-sign/create-bundle-and-sign.handler";
import { Config } from "./config/config.utils";
import { jwtValidatorFactory } from "../middleware/jwt-validator/jwt-validator.middleware";
import { jwtUnusedFactory } from "../middleware/jwt-unused/jwt-unused.middleware";

// TODO: Not needed in Node.js 20:
dotEnv.config();

export class OthentApp {
  app: express.Application = express();

  config: Config;

  constructor(config: Config) {
    this.config = config;

    this.addRouteHandlers();
  }

  getExpressApp() {
    return this.app;
  }

  addRouteHandlers() {
    const { app, config } = this;

    // TODO: Take a look at Multer's options:
    // const upload = multer({});

    const jwtValidator = jwtValidatorFactory() as unknown as express.Handler;
    const jwtUnused = jwtUnusedFactory() as unknown as express.Handler;

    app.use(cors({ origin: "*" }));

    app.use(bodyParser.json({ limit: config.UPLOAD_LIMIT }));

    app.use(
      bodyParser.urlencoded({ limit: config.UPLOAD_LIMIT, extended: true }),
    );

    app.use((req, res, next) => {
      console.log(req.method, req.path);

      next();
    });

    app.get(Route.HOME, jwtValidator, jwtUnused, pingHandlerFactory());

    app.post(
      Route.CREATE_USER,
      jwtValidator,
      jwtUnused,
      createUserHandlerFactory() as unknown as express.Handler,
    );

    // TODO: Data from multer doesn't seem to be used at all, as that's coming from the JWT token:

    app.post(
      Route.DECRYPT,
      jwtValidator,
      jwtUnused,
      // upload.single("ciphertext"),
      decryptHandlerFactory() as unknown as express.Handler,
    );
    app.post(
      Route.ENCRYPT,
      jwtValidator,
      jwtUnused,
      // upload.single("plaintext"),
      encryptHandlerFactory() as unknown as express.Handler,
    );

    // TODO: These should also use multer rather than relaying on body:

    app.post(
      Route.SIGN,
      jwtValidator,
      jwtUnused,
      signHandlerFactory() as unknown as express.Handler,
    );

    app.post(
      Route.CREATE_BUNDLE_AND_SIGN,
      jwtValidator,
      jwtUnused,
      createBundleAndSignHandlerFactory() as unknown as express.Handler,
    );

    this.app = app;

    // TODO: Add generic error handler:
  }

  listen() {
    const { PORT } = this.config;

    this.app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}...\n`);
    });
  }
}
