import { Pool } from "pg";
import { DatabaseConnError } from "../errors/db.error";

export class PostgresDatabaseConn {
  private pool: Pool;

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

  public client = async () => {
    return this.pool.connect();
  };

  public query = async (query: string, values?: unknown[]) => {
    const res = await this.pool.query(query, values);
    return res;
  };

  public connect = async () => {
    await this.pool.query("SELECT 1+1 AS RESULT;");
  };

  public close = async () => {
    await this.pool.end();
  };
}
