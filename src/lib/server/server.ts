import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Route } from "./server.constants";
import { pingHandlerFactory } from "../operations/ping/ping.handler";
import { createUserHandlerFactory } from "../operations/create-user/create-user.handler";
import { decryptHandlerFactory } from "../operations/decrypt/decrypt.handler";
import { encryptHandlerFactory } from "../operations/encrypt/encrypt.handler";
import { signHandlerFactory } from "../operations/sign/sign.handler";
import { CONFIG } from "./config/config.utils";
import { jwtValidatorFactory } from "../middleware/jwt-validator/jwt-validator.middleware";
import { jwtUnusedFactory } from "../middleware/jwt-unused/jwt-unused.middleware";
import { asyncHandler } from "../middleware/async-handler/async-handler.middleware";
import { errorHandlerFactory } from "../middleware/error-handler/error-handler.middleware";

export class OthentApp {
  app: express.Application = express();

  constructor() {
    this.addRouteHandlers();
  }

  getExpressApp() {
    return this.app;
  }

  addRouteHandlers() {
    const { app } = this;

    // TODO: Take a look at Multer's options:
    // const upload = multer({});

    const jwtValidator = asyncHandler(
      jwtValidatorFactory(),
    ) as unknown as express.Handler;

    const jwtUnused = asyncHandler(
      jwtUnusedFactory(),
    ) as unknown as express.Handler;

    app.use(cors({ origin: "*" }));

    app.use(bodyParser.json({ limit: CONFIG.UPLOAD_LIMIT }));

    app.use(
      bodyParser.urlencoded({ limit: CONFIG.UPLOAD_LIMIT, extended: true }),
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
      asyncHandler(createUserHandlerFactory()) as unknown as express.Handler,
    );

    // TODO: Data from multer doesn't seem to be used at all, as that's coming from the JWT token:

    app.post(
      Route.DECRYPT,
      jwtValidator,
      jwtUnused,
      // upload.single("ciphertext"),
      asyncHandler(decryptHandlerFactory()) as unknown as express.Handler,
    );

    app.post(
      Route.ENCRYPT,
      jwtValidator,
      jwtUnused,
      // upload.single("plaintext"),
      asyncHandler(encryptHandlerFactory()) as unknown as express.Handler,
    );

    // TODO: These should also use multer rather than relaying on body:

    app.post(
      Route.SIGN,
      jwtValidator,
      jwtUnused,
      asyncHandler(signHandlerFactory()) as unknown as express.Handler,
    );

    // See https://expressjs.com/en/guide/error-handling.html

    app.use(errorHandlerFactory() as unknown as express.Handler);

    this.app = app;
  }

  listen() {
    const { PORT } = CONFIG;

    this.app.listen(PORT, () => {
      console.log(`🤖  Server listening on port ${PORT}...\n`);
    });
  }
}
