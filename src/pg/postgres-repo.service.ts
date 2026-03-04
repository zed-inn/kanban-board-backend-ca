import {
  PostgresDatabasePoolConn as pgPool,
  PostgresDatabaseClientConn as pgClient,
  PostgresDatabaseQueryResult,
} from "./postgresdb.service";

export abstract class PostgresRepository<T extends unknown = void> {
  protected abstract readonly model?: unknown;
  protected abstract readonly PER_PAGE: number;
  protected abstract readonly repoSchema: string;
  protected readonly utils = new RepoUtils();

  constructor(
    protected readonly client: pgPool | pgClient,
    protected readonly ctx: T,
  ) {}

  // Must be initiated only once
  public readonly initRepo = async () => {
    await this.client.query(this.repoSchema);
  };

  protected readonly offsetPage = (page: number) => {
    if (typeof page !== "number" || isNaN(page)) page = 1;
    return (page - 1) * this.PER_PAGE;
  };

  protected readonly _select?: <T extends unknown, Z extends unknown>(
    data: T,
  ) => Promise<PostgresDatabaseQueryResult<Z>>;

  protected readonly _insert?: <T extends unknown, Z extends unknown>(
    data: T,
  ) => Promise<PostgresDatabaseQueryResult<Z>>;

  protected readonly _update?: <T extends unknown, Z extends unknown>(
    data: T,
  ) => Promise<PostgresDatabaseQueryResult<Z>>;

  protected readonly _delete?: <T extends unknown, Z extends unknown>(
    data: T,
  ) => Promise<PostgresDatabaseQueryResult<Z>>;
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
}
