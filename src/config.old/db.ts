import { PostgresDatabaseConn } from "../pg/postgresdb.service";
import { env } from "./env";

const db = new PostgresDatabaseConn(
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

export default db;
