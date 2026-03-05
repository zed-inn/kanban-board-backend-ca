import {
  PostgresDatabasePoolConn as pgPool,
  PostgresDatabaseClientConn as pgClient,
} from "./postgresdb.service";

export abstract class PostgresPolicy {
  constructor(protected readonly client: pgPool | pgClient) {}
}
