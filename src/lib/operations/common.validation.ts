import { z, ZodRawShape } from "zod";
import { Route } from "../server/server.constants";

export function extendLegacyBaseOperationIdTokenDataSchema<T extends ZodRawShape>(
  data: T
) {
  return z.object({
    sub: z.string().trim().min(1),
    data: z.object({
      keyName: z.string().trim().min(1),
      path: z.never().optional(),
      ...data,
    }),
  });
}

export function extendBaseOperationIdTokenDataSchema<T extends ZodRawShape>(
  path: Route,
  data: T
) {
  return z.object({
    sub: z.string().trim().min(1),
    data: z.object({
      keyName: z.never().optional(),
      path: z.literal(path),
      ...data,
    }),
  });
}

// Do not use z.record() or try to validate the shape of the object as that would be slow:
export const LegacyBufferRecordSchema = z.object({}).passthrough().superRefine((val, ctx) => {
  if (Object.keys(val).length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Empty LegacyBufferRecord",
    });
  }

  if (val.hasOwnProperty("type") || val.hasOwnProperty("data")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Object is LegacyBufferObject, not LegacyBufferRecord",
    });
  }
});

// type a = z.infer<typeof LegacyBufferRecordSchema> satisfies LegacyBufferRecord;

// Do not use z.array(z.number()) as that would be slow:
export const LegacyBufferObjectSchema = z.object({
  type: z.literal("Buffer"),
  data: z.array(z.any()).nonempty(),
});

export const LegacyBufferDataOrStringSchema = z.union([
  LegacyBufferRecordSchema,
  LegacyBufferObjectSchema,
  z.string().trim().min(1),
]);
