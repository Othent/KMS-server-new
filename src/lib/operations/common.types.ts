import { Route } from "../server/server.constants";
import { B64String, B64UrlString } from "../utils/lib/binary-data-types/binary-data-types.types";
import { LegacyBufferObject, LegacyBufferRecord } from "../utils/lib/legacy-serialized-buffers/legacy-serialized-buffer.types";

export interface BaseOperationIdTokenData<P extends Route> {
  path: P;
}

/**
 * @deprecated
 */
export interface LegacyBaseOperationIdTokenData {
  keyName: string;
}

export type LegacyTokenDataFormat = "LegacyBufferObject" | "LegacyBufferRecord" | "string";

export const LEGACY_TOKEN_DATA_FORMATS = ["LegacyBufferObject", "LegacyBufferRecord", "string"] as const satisfies LegacyTokenDataFormat[];

export type TokenDataFormat = "B64String" | "B64UrlString";

export const TOKEN_DATA_FORMATS = ["B64String", "B64UrlString"] as const satisfies TokenDataFormat[];

export const EMPTY_VALUES = {
  LegacyBufferObject: { type: "Buffer", data: [] } as LegacyBufferObject,
  LegacyBufferRecord: {} as LegacyBufferRecord,
  string: "",
  B64String: "" as B64String,
  B64UrlString: "" as B64UrlString,
} as const;
