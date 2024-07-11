export function getErrorResponse(error: string) {
  return { error, success: false };
}

// export enum OthentErrorMessage {};

export class OthentError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
