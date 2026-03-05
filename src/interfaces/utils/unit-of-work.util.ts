import { UnitOfWork } from "kanban";
import { PostgresRepository as pgRepo } from "@shared/services/postgres-repo.service";
import { PostgresPolicy as pgPolicy } from "@shared/services/postgres-policy.service";
import {
  PgConnection,
  PostgresDatabasePoolConn,
} from "@shared/services/postgresdb.service";

export class PostgresUnitOfWork implements UnitOfWork {
  private readonly repoConn: { repo: pgRepo; conn: PgConnection }[] = [];
  private readonly policyConn: { policy: pgPolicy; conn: PgConnection }[] = [];

  constructor(
    private dbconn: PostgresDatabasePoolConn,
    repos: pgRepo[],
    policies: pgPolicy[],
  ) {
    for (const r of repos) this.repoConn.push({ repo: r, conn: r.client });
    for (const p of policies)
      this.policyConn.push({ policy: p, conn: p.client });
  }

  async atomic<T>(work: () => Promise<T>): Promise<T> {
    const client = await this.dbconn.tclient();

    try {
      for (const r of this.repoConn) r.repo.client = client;
      for (const p of this.policyConn) p.policy.client = client;

      await client.transaction.begin();
      const res = await work();
      await client.transaction.commit();

      return res;
    } catch (error) {
      await client.transaction.rollback();
      throw error;
    } finally {
      for (const r of this.repoConn) r.repo.client = r.conn;
      for (const p of this.policyConn) p.policy.client = p.conn;

      await client.close();
    }
  }
}
