import { PgConnection } from "./postgresdb.service";

export abstract class PostgresPolicy {
  constructor(protected _client: PgConnection) {}

  public set client(client: PgConnection) {
    this._client = client;
  }

  public get client() {
    return this._client;
  }
}
