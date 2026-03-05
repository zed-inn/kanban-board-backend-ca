import { PgConnection } from "./postgresdb.service";

export abstract class PostgresRepository<T extends unknown = void> {
  protected readonly model?: unknown;
  protected readonly PER_PAGE?: number;
  protected abstract readonly repoSchema: string;
  protected readonly utils = new RepoUtils();

  constructor(
    protected _client: PgConnection,
    protected readonly ctx: T,
  ) {}

  // Must be initiated only once
  public readonly initRepo = async () => {
    await this._client.query(this.repoSchema);
  };

  public set client(client: PgConnection) {
    this._client = client;
  }

  public get client() {
    return this._client;
  }
}

class RepoUtils {
  public readonly camelize = <T extends Record<string, any>>(obj: T): T => {
    if (obj === null || typeof obj !== "object" || Array.isArray(obj))
      return obj;

    const result: Record<string, any> = {};

    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/_([a-zA-Z0-9])/g, (_, c) =>
        c.toUpperCase(),
      );
      const val = (obj as any)[key];

      if (val && typeof val === "object" && !Array.isArray(val)) {
        result[camelKey] = this.camelize(val);
      } else if (Array.isArray(val)) {
        result[camelKey] = val.map((item) =>
          item && typeof item === "object" && !Array.isArray(item)
            ? this.camelize(item)
            : item,
        );
      } else {
        result[camelKey] = val;
      }
    }

    return result as T;
  };

  public readonly createOffsetFn = (perPage: number) => (page: number) =>
    (page - 1) * perPage;
}
