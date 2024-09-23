import {
  ErrorResponse,
  ErrorStatusCode,
  OthentErrorID,
  OthentServerError,
} from "./error";

export function getErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof OthentServerError) {
    return error.getErrorResponse();
  }

  const unexpectedError: OthentServerError = new OthentServerError(
    OthentErrorID.Unexpected,
    500,
    "",
    error,
  );

  return unexpectedError.getErrorResponse();
}

export function createOrPropagateError(
  id: OthentErrorID,
  statusCode: ErrorStatusCode,
  developerMessage: string,
  error?: unknown,
): OthentServerError {
  if (error instanceof OthentServerError) {
    return error;
  }

  // Invalid JWT - This error came from jwt-validator.middleware.ts / express-jwt:
  // See https://www.npmjs.com/package/express-jwt#error-handling

  if (error instanceof Error && error.name === "UnauthorizedError") {
    return new OthentServerError(id, 401, developerMessage, error);
  }

  return new OthentServerError(id, statusCode, developerMessage, error);
}
