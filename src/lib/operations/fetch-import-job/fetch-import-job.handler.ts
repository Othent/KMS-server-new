import express from "express";
import { ExpressRequestWithToken } from "../../utils/auth/auth0.utils";
import { logRequestSuccess, logRequestStart } from "../../utils/log/log.utils";
import { Route } from "../../server/server.constants";
import { createOrPropagateError } from "../../server/errors/errors.utils";
import { OthentErrorID } from "../../server/errors/error";
import { fetchImportJob } from "./fetch-import-job";
import { ImportJob } from "../../utils/kms/google-kms.utils";
import { BaseOperationIdTokenData } from "../common.types";

export type FetchImportJobIdTokenData = BaseOperationIdTokenData<Route.FETCH_IMPORT_JOB>;

export interface FetchImportJobResponseData {
  importJob: ImportJob;
};

export function fetchImportJobHandlerFactory() {
  return async (req: ExpressRequestWithToken<FetchImportJobIdTokenData>, res: express.Response) => {
    const { idToken } = req;
    const { data } = idToken;

    // TODO: Replace with Joi.
    if (!idToken || !idToken.sub || !data || data.path !== Route.FETCH_IMPORT_JOB) {
      throw createOrPropagateError(
        OthentErrorID.Validation,
        400,
        "Invalid token data for fetchImportJob()",
      );
    }

    logRequestStart(Route.FETCH_IMPORT_JOB, idToken);

    const importJob = await fetchImportJob(idToken);

    logRequestSuccess(Route.FETCH_IMPORT_JOB, idToken);

    res.json({
      importJob: {
        state: importJob.state,
        publicKey: importJob.publicKey,
      },
    } satisfies FetchImportJobResponseData);
  };
}
