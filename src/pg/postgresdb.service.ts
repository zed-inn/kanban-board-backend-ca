import { Pool, PoolClient, QueryResult } from "pg";
import { DatabaseConnError } from "../shared.old/errors/db.error";

export class PostgresDatabasePoolConn {
  protected readonly pool: Pool;

  constructor(
    connectionParams: {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
    },
    cTimeoutParams?: {
      queryParameter?: number;
      connectionTimeoutMiliseconds?: number;
    },
  ) {
    if (
      typeof connectionParams.host !== "string" ||
      connectionParams.host.length < 1
    )
      throw new DatabaseConnError("Invalid Host");
    else if (
      typeof connectionParams.port !== "number" ||
      isNaN(connectionParams.port)
    )
      throw new DatabaseConnError("Invalid Port");
    else if (
      typeof connectionParams.user !== "string" ||
      connectionParams.user.length < 1
    )
      throw new DatabaseConnError("Invalid User");
    else if (
      typeof connectionParams.password !== "string" ||
      connectionParams.password.length < 1
    )
      throw new DatabaseConnError("Invalid Password");
    else if (
      typeof connectionParams.database !== "string" ||
      connectionParams.database.length < 1
    )
      throw new DatabaseConnError("Invalid Database");

    if (cTimeoutParams) {
      if (
        cTimeoutParams.queryParameter &&
        (typeof cTimeoutParams.queryParameter !== "number" ||
          isNaN(cTimeoutParams.queryParameter))
      )
        throw new DatabaseConnError("Invalid Query Parameters Limit");
      else if (
        cTimeoutParams.connectionTimeoutMiliseconds &&
        (typeof cTimeoutParams.connectionTimeoutMiliseconds !== "number" ||
          isNaN(cTimeoutParams.connectionTimeoutMiliseconds))
      )
        throw new DatabaseConnError("Invalid Connection Timeout Limit");
    }

    this.pool = new Pool({
      host: connectionParams.host,
      port: connectionParams.port,
      user: connectionParams.user,
      password: connectionParams.password,
      database: connectionParams.database,
      query_timeout: cTimeoutParams?.queryParameter,
      connectionTimeoutMillis: cTimeoutParams?.connectionTimeoutMiliseconds,
    });
  }

  public readonly transaction = async () => {
    return new PostgresDatabaseClientConn(await this.pool.connect());
  };

  public readonly query = async (query: string, values?: unknown[]) => {
    const res = await this.pool.query(query, values);
    return new PostgresDatabaseQueryResult(res);
  };

  public readonly connect = async () => {
    await this.pool.query("SELECT 1+1 AS RESULT;");
  };

  public readonly close = async () => {
    await this.pool.end();
  };
}

export class PostgresDatabaseClientConn {
  constructor(protected readonly client: PoolClient) {}

  public readonly query = async (query: string, values?: unknown[]) => {
    const res = await this.client.query(query, values);
    return new PostgresDatabaseQueryResult(res);
  };

  public readonly close = async () => {
    this.client.release();
  };

  public readonly transaction = {
    begin: async () => this.client.query("BEGIN;"),
    commit: async () => this.client.query("COMMIT;"),
    rollback: async () => this.client.query("ROLLBACK;"),
  };
}

export class PostgresDatabaseQueryResult {
  protected readonly rowCount: number;

  constructor(protected readonly res: QueryResult<any>) {
    this.rowCount = this.res.rowCount ?? 0;
  }

  public get rows() {
    return this.res.rows;
  }

  public get none() {
    return this.rowCount === 0;
  }

  public get top() {
    return this.rows[0];
  }

  public get bottom() {
    return this.rows[this.rowCount - 1];
  }
}
