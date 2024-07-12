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
import { logRequestError } from "../utils/log/log.utils";
import { getErrorResponse, OthentError } from "./errors/errors.utils";
import { wrap } from "async-middleware";

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

    const jwtValidator = wrap(
      jwtValidatorFactory(),
    ) as unknown as express.Handler;
    const jwtUnused = wrap(jwtUnusedFactory()) as unknown as express.Handler;

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
      wrap(createUserHandlerFactory()) as unknown as express.Handler,
    );

    // TODO: Data from multer doesn't seem to be used at all, as that's coming from the JWT token:

    app.post(
      Route.DECRYPT,
      jwtValidator,
      jwtUnused,
      // upload.single("ciphertext"),
      wrap(decryptHandlerFactory()) as unknown as express.Handler,
    );

    app.post(
      Route.ENCRYPT,
      jwtValidator,
      jwtUnused,
      // upload.single("plaintext"),
      wrap(encryptHandlerFactory()) as unknown as express.Handler,
    );

    // TODO: These should also use multer rather than relaying on body:

    app.post(
      Route.SIGN,
      jwtValidator,
      jwtUnused,
      wrap(signHandlerFactory()) as unknown as express.Handler,
    );

    app.post(
      Route.CREATE_BUNDLE_AND_SIGN,
      jwtValidator,
      jwtUnused,
      wrap(createBundleAndSignHandlerFactory()) as unknown as express.Handler,
    );

    // See https://expressjs.com/en/guide/error-handling.html

    app.use(
      (
        err: Error | OthentError,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        logRequestError(req.path as Route, err);

        if (res.headersSent) {
          return next(err);
        }

        res.status(500).json(getErrorResponse(err));
      },
    );

    this.app = app;
  }

  listen() {
    const { PORT } = this.config;

    this.app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}...\n`);
    });
  }
}
