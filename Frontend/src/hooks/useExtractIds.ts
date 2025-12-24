export type FieldType = "num" | "string";
export type FieldTypeMap = Record<string, FieldType>;

function parseValue(raw: any, type: FieldType): number | string | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  if (type === "num") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  return String(raw);
}

export function extractIds<T extends Record<string, any>>(
  data: T,
  fieldTypeMap: FieldTypeMap
): T {
  const result: Record<string, any> = { ...data };
  for (const [field, type] of Object.entries(fieldTypeMap)) {
    let raw = result[field];
    if (raw && typeof raw === "object" && "value" in raw) raw = raw.value;
    const parsed = parseValue(raw, type);
    if (parsed === undefined) delete result[field];
    else result[field] = parsed;
  }
  return result as T;
}
