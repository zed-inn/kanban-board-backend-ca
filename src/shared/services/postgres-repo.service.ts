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
  public readonly camelize = (snakeCasedObj: Record<string, unknown>) => {
    const camelCasedObj: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(snakeCasedObj)) {
      const keyWords = key.split("_");
      const newKey = keyWords
        .map((w, i) =>
          i === 0 || w.length < 1
            ? w
            : `${w.at(0)?.toUpperCase()}${w.slice(1)}`,
        )
        .join("");
      camelCasedObj[newKey] = value;
    }

    return camelCasedObj;
  };

  public readonly createOffsetFn = (perPage: number) => (page: number) =>
    (page - 1) * perPage;
}
