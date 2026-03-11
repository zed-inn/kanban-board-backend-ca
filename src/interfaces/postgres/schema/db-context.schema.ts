import { PgConnection } from "@shared/services/postgres/postgresdb.service";

export type DatabaseParamContext = {
  client: PgConnection;
};
