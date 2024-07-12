import express from "express";

// Re-implemented with inspiration from:
// - https://www.npmjs.com/package/async-middleware
// - https://www.npmjs.com/package/express-async-handler
// As these 2 packages haven't been maintained in quite a while and their TS types are incompatible with the current Express version.

export interface Handler<T, U> {
  (req: T, res: U, next: express.NextFunction): any;
}

export interface ErrorHandler<T, U> {
  (err: Error, req: T, res: U, next: express.NextFunction): any;
}

export function asyncHandler<T, U>(fn: Handler<T, U>): Handler<T, U>;
export function asyncHandler<T, U>(fn: ErrorHandler<T, U>): ErrorHandler<T, U>;
export function asyncHandler<T, U>(
  fn: Handler<T, U> | ErrorHandler<T, U>,
): Handler<T, U> | ErrorHandler<T, U> {
  if (fn.length === 4) {
    return function (
      err: Error,
      req: T,
      res: U,
      next: express.NextFunction,
    ): any {
      const fnReturn = (fn as ErrorHandler<T, U>)(err, req, res, next);

      return Promise.resolve(fnReturn).catch(next);
    };
  }

  return function (req: T, res: U, next: express.NextFunction): any {
    const fnReturn = (fn as Handler<T, U>)(req, res, next);

    return Promise.resolve(fnReturn).catch(next);
  };
}
