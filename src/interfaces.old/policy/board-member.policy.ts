import db from "../../config.old/db";
import { PostgresDatabaseConn } from "../../pg/postgresdb.service";
import { MemberPolicy } from "kanban";
import {
  NotBoardMemberError,
  NotBoardOwnerError,
} from "kanban/src/core/errors/board.error";
import { PoolClient } from "pg";

export class PostgresBoardMemberPolicy implements MemberPolicy {
  constructor(private client: PostgresDatabaseConn | PoolClient) {}

  ensureMember = async (memberId: string, boardId: string): Promise<void> => {
    const res = await this.client.query(
      "SELECT * FROM board_members WHERE board_id = $1 AND member_id = $2;",
      [boardId, memberId],
    );
    if (res.rowCount === 0) throw new NotBoardMemberError();
  };

  ensureOwner = async (boardId: string, ownerId: string): Promise<void> => {
    const res = await this.client.query(
      "SELECT * FROM boards WHERE id = $1 AND owner_id = $2;",
      [boardId, ownerId],
    );
    if (res.rowCount === 0) throw new NotBoardOwnerError();
  };
}

export const pgBoardMemberPolicy = new PostgresBoardMemberPolicy(db);
