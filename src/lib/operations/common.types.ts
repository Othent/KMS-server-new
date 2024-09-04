import { B64String, b64ToUint8Array, B64UrlString } from "../utils/arweave/arweaveUtils";

/**
 * @deprecated
 */
type LegacyBufferRecord = Record<number, number>;

/**
 * @deprecated
 */
interface LegacyBufferObject {
  type: "Buffer";
  data: number[];
}

/**
 * JSON-compatible representation of a Buffer.
 * @deprecated This type will soon be removed and the code will be updated to work exclusively with native binary data types (e.g. `Uint8Array`).
 */
export type LegacyBufferData = LegacyBufferRecord | LegacyBufferObject;

function isLegacyBufferObject(legacyBufferData: LegacyBufferData): legacyBufferData is LegacyBufferObject {
  return legacyBufferData.hasOwnProperty("type");

  /*
  obj.type === "Buffer" &&
  Array.isArray(obj.data) &&
  typeof obj[0] === "number"
  */
}

// TODO: Check if the old server version can receive `string` directly.

export function normalizeBufferData(
  data: LegacyBufferRecord | LegacyBufferObject | B64String | B64UrlString,
) {
  if (typeof data === "string") {
    return b64ToUint8Array(data);
  }

  if (isLegacyBufferObject(data)) {
    return new Uint8Array(data.data);
  }

  return new Uint8Array(Object.values(data));
}
