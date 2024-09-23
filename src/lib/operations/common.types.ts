import { Route } from "../server/server.constants";
import { B64String, b64ToUint8Array, B64UrlString, stringToUint8Array } from "../utils/arweave/arweaveUtils";

export interface BaseOperationIdTokenData<P extends Route> {
  path: P;
}

/**
 * @deprecated
 */
export interface LegacyBaseOperationIdTokenData {
  keyName: string;
}

/**
 * @deprecated
 */
export type LegacyBufferRecord = Record<number, number>;

/**
 * @deprecated
 */
export interface LegacyBufferObject {
  type: "Buffer";
  data: number[];
}

// TODO: Move to bufferUtils...

/**
 * JSON-compatible representation of a Buffer.
 * @deprecated This type will soon be removed and the code will be updated to work exclusively with native binary data types (e.g. `Uint8Array`).
 */
export type LegacyBufferData = LegacyBufferRecord | LegacyBufferObject;

export function isLegacyBufferObject(
  legacyBufferData: LegacyBufferData,
): legacyBufferData is LegacyBufferObject {
  return (
    !!legacyBufferData &&
    typeof legacyBufferData === "object" &&
    (legacyBufferData as LegacyBufferObject).type === "Buffer" &&
    Array.isArray((legacyBufferData as LegacyBufferObject).data)
  );
}

export function normalizeBufferData(
  data: LegacyBufferRecord | LegacyBufferObject | string | B64String | B64UrlString,
  treatStringsAsB64 = false,
): Uint8Array {
  if (typeof data === "string") {
    return treatStringsAsB64
      ? b64ToUint8Array(data as B64String | B64UrlString)
      : stringToUint8Array(data);
  }

  if (isLegacyBufferObject(data)) {
    return new Uint8Array(data.data);
  }

  return new Uint8Array(Object.values(data));
}

export function toLegacyBufferObject(buffer: Uint8Array): LegacyBufferObject {
  return {
    type: "Buffer",
    data: Array.from(buffer),
  }
}

export function normalizeKMSResponseData(str: string | Uint8Array): Uint8Array {
  return typeof str === 'string' ? stringToUint8Array(str) : new Uint8Array(str);
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
