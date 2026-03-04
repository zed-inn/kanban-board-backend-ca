export const snakeToCamel = <T extends Record<string, any>>(obj: T): T => {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return obj;

  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
    const val = (obj as any)[key];

    if (val && typeof val === "object" && !Array.isArray(val)) {
      result[camelKey] = snakeToCamel(val);
    } else if (Array.isArray(val)) {
      result[camelKey] = val.map((item) =>
        item && typeof item === "object" && !Array.isArray(item)
          ? snakeToCamel(item)
          : item,
      );
    } else {
      result[camelKey] = val;
    }
  }

  return result as T;
};
