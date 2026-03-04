import db from "../../config.old/db";
import { PostgresBoardMemberPolicy } from "../policy/board-member.policy";
import { PostgresCardPolicy } from "../policy/card.policy";
import { PostgresColumnPolicy } from "../policy/column.policy";
import { PostgresBoardMembersRepository } from "../repo/board-members.repo";
import { PostgresBoardRepository } from "../repo/board.repo";
import { PostgresCardRepository } from "../repo/card.repo";
import { PostgresColumnRepository } from "../repo/column.repo";
import { PostgresUserRepository } from "../repo/user.repo";
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
