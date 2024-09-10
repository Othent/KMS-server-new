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
) {
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
