import { PostgresDatabasePoolConn } from "@shared/services/postgres/postgresdb.service";
import { env } from "./env";

export const db = new PostgresDatabasePoolConn(
  {
    host: env.PG_HOST,
    port: env.PG_PORT,
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    database: env.PG_DATABASE,
  },
  {
    queryParameter: 5000,
    connectionTimeoutMiliseconds: 2000,
  },
);
