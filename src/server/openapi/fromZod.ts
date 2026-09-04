import type { z } from "zod";

type JsonSchema = Record<string, unknown>;

function unwrap(schema: z.ZodTypeAny): {
  inner: z.ZodTypeAny;
  optional: boolean;
  nullable: boolean;
} {
  let inner: z.ZodTypeAny = schema;
  let optional = false;
  let nullable = false;
  for (let i = 0; i < 8; i++) {
    const typeName = inner._def.typeName as string;
    if (typeName === "ZodOptional" || typeName === "ZodDefault") {
      optional = true;
      inner = inner._def.innerType as z.ZodTypeAny;
      continue;
    }
    if (typeName === "ZodNullable") {
      nullable = true;
      inner = inner._def.innerType as z.ZodTypeAny;
      continue;
    }
    if (typeName === "ZodEffects") {
      inner = inner._def.schema as z.ZodTypeAny;
      continue;
    }
    break;
  }
  return { inner, optional, nullable };
}

export function zodToOpenApiSchema(schema: z.ZodTypeAny): JsonSchema {
  const { inner, nullable } = unwrap(schema);
  const typeName = inner._def.typeName as string;
  const base = zodNode(inner, typeName);
  if (nullable) {
    return { anyOf: [base, { type: "null" }] };
  }
  return base;
}

function zodNode(inner: z.ZodTypeAny, typeName: string): JsonSchema {
  switch (typeName) {
    case "ZodString":
      return { type: "string" };
    case "ZodNumber":
      return { type: "number" };
    case "ZodBoolean":
      return { type: "boolean" };
    case "ZodLiteral":
      return { type: typeof inner._def.value, enum: [inner._def.value] };
    case "ZodEnum":
      return { type: "string", enum: [...(inner._def.values as string[])] };
    case "ZodUnknown":
      return {};
    case "ZodArray":
      return { type: "array", items: zodToOpenApiSchema(inner._def.type as z.ZodTypeAny) };
    case "ZodTuple": {
      const items = (inner._def.items as z.ZodTypeAny[]).map(zodToOpenApiSchema);
      return { type: "array", items: items[0] ?? { type: "number" }, minItems: items.length };
    }
    case "ZodObject": {
      const rawShape = inner._def.shape as
        Record<string, z.ZodTypeAny> | (() => Record<string, z.ZodTypeAny>);
      const shape = typeof rawShape === "function" ? rawShape() : rawShape;
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      for (const key of Object.keys(shape).sort()) {
        const field = shape[key]!;
        const meta = unwrap(field);
        properties[key] = zodToOpenApiSchema(field);
        if (!meta.optional) required.push(key);
      }
      return {
        type: "object",
        properties,
        ...(required.length > 0 ? { required } : {}),
        additionalProperties: false,
      };
    }
    default:
      return { type: "object" };
  }
}
