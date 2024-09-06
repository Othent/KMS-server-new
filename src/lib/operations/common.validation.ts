import { z, ZodRawShape } from "zod";
import { Route } from "../server/server.constants";

export function extendLegacyBaseOperationIdTokenDataSchema<T extends ZodRawShape>(
  data: T
) {
  return z.object({
    sub: z.string(),
    keyName: z.string(),
    ...data,
  });
}

export function extendBaseOperationIdTokenDataSchema<T extends ZodRawShape>(
  path: Route,
  data: T
) {
  return z.object({
    sub: z.string(),
    path: z.literal(path),
    ...data,
  });
}

// Do not use z.record() or try to validate the shape of the object as that would be slow:
export const LegacyBufferRecordSchema = z.object({});

// type a = z.infer<typeof LegacyBufferRecordSchema> satisfies LegacyBufferRecord;

// Do not use z.array(z.number()) as that would be slow:
export const LegacyBufferObjectSchema = z.object({
  type: z.literal("Buffer"),
  data: z.array(z.any()).nonempty(),
});

export const LegacyBufferDataOrStringSchema = z.union([
  LegacyBufferRecordSchema,
  LegacyBufferObjectSchema,
  z.string()
]);
