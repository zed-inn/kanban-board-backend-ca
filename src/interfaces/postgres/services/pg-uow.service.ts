import { DatabaseParamContext } from "@postgres/schema/db-context.schema";
import { PostgresDatabasePoolConn } from "@shared/services/postgres/postgresdb.service";
import { UnitOfWork } from "kanban";

export class PostgresUnitOfWork implements UnitOfWork {
  constructor(private dbconn: PostgresDatabasePoolConn) {}

  async atomic<T>(
    work: (ctx?: DatabaseParamContext) => Promise<T>,
  ): Promise<T> {
    const client = await this.dbconn.tclient();

    try {
      await client.transaction.begin();
      const res = await work({ client });
      await client.transaction.commit();
      return res;
    } catch (error) {
      await client.transaction.rollback();
      throw error;
    } finally {
      await client.close();
    }
  }
}
