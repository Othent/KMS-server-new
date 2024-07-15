import { CONFIG } from "../config/config.utils";

export interface BasicErrorData {
  name: string;
  message: string;
  stack?: string;
}

export interface OthentClientErrorData {
  error: true;
  id: OthentErrorID;
  developerMessage?: string;
  cause?: BasicErrorData;
}

export type ErrorStatusCode = 400 | 401 | 403 | 500;

export interface ErrorResponse {
  statusCode: ErrorStatusCode;
  errorData: OthentClientErrorData;
}

export enum OthentErrorID {
  Unexpected = "Unexpected",
  Validation = "Validation",
  UserCreation = "UserCreation",
  Encryption = "Encryption",
  Decryption = "Decryption",
  Signing = "Signing",
  PublicKey = "PublicKey",
}

export class OthentServerError extends Error {
  id: OthentErrorID;
  statusCode: ErrorStatusCode;
  developerMessage: string;
  cause?: Error;

  constructor(
    id: OthentErrorID,
    statusCode: ErrorStatusCode,
    developerMessage: string,
    error?: unknown,
  ) {
    super();

    // Native error props:
    this.name = id;
    this.message = developerMessage || "";
    Error.captureStackTrace(this); // Sets this.stack

    // Custom OthentServerError props:
    this.id = id;
    this.statusCode = statusCode;
    this.developerMessage = developerMessage;

    if (error instanceof Error) {
      this.cause = error;
    } else if (typeof error === "string" || typeof error === "number") {
      this.cause = new Error(`${error}`);
    }
  }

  getErrorResponse(): ErrorResponse {
    const errorResponse: ErrorResponse = {
      statusCode: this.statusCode,
      errorData: {
        error: true,
        id: this.id,
      },
    };

    if (!CONFIG.IS_PROD) {
      errorResponse.errorData.developerMessage = this.developerMessage;

      if (this.cause) {
        errorResponse.errorData.cause = {
          name: this.cause.name,
          message: this.cause.message,
          stack: this.cause.stack,
        };
      }
    }

    return errorResponse;
  }

  getLog() {
    const { id, developerMessage, stack } = this;
    const errorHeader = `${id}: ${developerMessage}`;

    if (!stack) return errorHeader;

    return stack.startsWith(errorHeader) ? stack : `${errorHeader} / ${stack}`;
  }
}
