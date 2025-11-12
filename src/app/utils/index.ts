export function snakeToCamel<T>(obj: T): T {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    // ถ้า obj เป็น array, map element ของ array ด้วย snakeToCamel
    return obj.map(item => snakeToCamel(item)) as unknown as T;
  }

  const result = Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      snakeToCamel(value),
    ])
  );

  return result as T;
}


export * from "./utils";
