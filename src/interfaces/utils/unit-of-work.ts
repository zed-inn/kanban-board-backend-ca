import db from "@config/db";
import { PostgresBoardMemberPolicy } from "@interfaces/policy/board-member.policy";
import { PostgresCardPolicy } from "@interfaces/policy/card.policy";
import { PostgresColumnPolicy } from "@interfaces/policy/column.policy";
import { PostgresBoardMembersRepository } from "@interfaces/repo/board-members.repo";
import { PostgresBoardRepository } from "@interfaces/repo/board.repo";
import { PostgresCardRepository } from "@interfaces/repo/card.repo";
import { PostgresColumnRepository } from "@interfaces/repo/column.repo";
import { PostgresUserRepository } from "@interfaces/repo/user.repo";
import { UnitOfWork } from "kanban";
import {
  RepositoryProvider,
  PolicyProvider,
} from "kanban/src/core/interfaces/utils/unit-of-work.interface";

export class PostgresUnitOfWork implements UnitOfWork {
  withTransaction = async <T>(
    work: (repos: RepositoryProvider, policies: PolicyProvider) => Promise<T>,
  ): Promise<T> => {
    const client = await db.client();

    try {
      const repos: RepositoryProvider = {
        boardRepo: new PostgresBoardRepository(client),
        userRepo: new PostgresUserRepository(client),
        memberRepo: new PostgresBoardMembersRepository(client),
        columnRepo: new PostgresColumnRepository(client),
        cardRepo: new PostgresCardRepository(client),
      };
      const policies: PolicyProvider = {
        cardPolicy: new PostgresCardPolicy(client),
        columnPolicy: new PostgresColumnPolicy(client),
        memberPolicy: new PostgresBoardMemberPolicy(client),
      };

      await client.query("BEGIN;");
      const res = await work(repos, policies);
      await client.query("COMMIT;");

      return res;
    } catch (error) {
      await client.query("ROLLBACK;");
      throw error;
    }
  };
}

export const pgUow = new PostgresUnitOfWork();
