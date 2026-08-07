import { Types } from "mongoose";

function isObjectId(value: unknown): value is Types.ObjectId {
  return (
    value instanceof Types.ObjectId ||
    (typeof value === "object" &&
      value !== null &&
      (value as { _bsontype?: string })._bsontype === "ObjectId")
  );
}

function isMongooseDoc(value: unknown): value is {
  toObject: (options?: object) => Record<string, unknown>;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    !isObjectId(value) &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    typeof (value as { toObject?: unknown }).toObject === "function" &&
    "$__" in (value as object)
  );
}

/** Convertit un document Mongoose en objet plain avec `id` string. */
export function serialize<T>(value: unknown): T {
  if (value == null) {
    return value as T;
  }

  if (isMongooseDoc(value)) {
    return serialize(value.toObject({ virtuals: true }));
  }

  if (Array.isArray(value)) {
    return value.map((item) => serialize(item)) as T;
  }

  if (value instanceof Date) {
    return value as T;
  }

  if (isObjectId(value)) {
    return value.toString() as T;
  }

  if (typeof value !== "object") {
    return value as T;
  }

  const input = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(input)) {
    if (key === "__v") continue;

    if (key === "_id") {
      result.id = isObjectId(entry) ? entry.toString() : serialize(entry);
      continue;
    }

    result[key] = serialize(entry);
  }

  return result as T;
}
