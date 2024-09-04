import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { fetchImportJob } from "./fetch-import-job";
import { ImportJob } from "../../utils/kms/google-kms.types";

export interface FetchImportJobResponseData {
  importJob: ImportJob;
};

export function fetchImportJobHandlerFactory() {
  return async (req: ExpressRequestWithToken, res: express.Response) => {
    const { idToken } = req;

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data",
      );
    }

    logRequestStart(Route.FETCH_IMPORT_JOB, idToken);

    const importJob = await fetchImportJob(idToken.sub);

    logRequestSuccess(Route.FETCH_IMPORT_JOB, idToken);

    res.json({
      importJob: {
        state: importJob.state,
        publicKey: importJob.publicKey,
      },
    } satisfies FetchImportJobResponseData);
  };
}
