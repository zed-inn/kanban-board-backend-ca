import { z } from "zod";
import { MemberRepository } from "kanban";
import { BoardMembership } from "kanban/src/core/entities/board_membership";
import db from "@config/db";
import { snakeToCamel } from "@shared/utils/snake-to-camel";
import { NotBoardMemberError } from "kanban/src/core/errors/board.error";
import { Board } from "kanban/src/core/entities/board";
import { PostgresDatabaseConn } from "@shared/libs/postgresdb-conn";
import { PoolClient } from "pg";

export class PostgresBoardMembersRepository implements MemberRepository {
  private schema = `CREATE TABLE IF NOT EXISTS board_members (
        board_id UUID NOT NULL,
        user_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(board_id, user_id),
        FOREIGN KEY(board_id) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );`;

  public model = z.object({
    boardId: z.uuidv7("Board id is required."),
    memberId: z.uuidv7("Member id is required."),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

  constructor(private client: PostgresDatabaseConn | PoolClient) {}

  init = async () => {
    await this.client.query(this.schema);
  };

  exists = async (membership: BoardMembership): Promise<boolean> => {
    const res = await this.client.query(
      "SELECT * FROM board_members WHERE board_id = $1 and member_id = $2;",
      [membership.attrbs.boardId, membership.attrbs.memberId],
    );
    return res.rowCount === 0 ? false : true;
  };

  getAllBoardMemberIdsById = async (boardId: string): Promise<string[]> => {
    const res = await this.client.query(
      "SELECT * FROM board_members WHERE board_id = $1;",
      [boardId],
    );
    const members = res.rows.map((r) => this.model.parse(snakeToCamel(r)));
    return members.map((m) => m.memberId);
  };

  save = async (membership: BoardMembership): Promise<void> => {
    const exists = await this.exists(membership);

    if (!exists)
      await this.client.query(
        "INSERT INTO board_members(board_id, member_id) VALUES($1, $2) RETURNING *;",
        [membership.attrbs.boardId, membership.attrbs.memberId],
      );
    else
      await this.client.query(
        "UPDATE board_members SET updated_at = NOW() WHERE board_id = $1 AND member_id = $2 RETURNING *;",
        [membership.attrbs.boardId, membership.attrbs.memberId],
      );
  };

  remove = async (membership: BoardMembership): Promise<void> => {
    const exists = await this.exists(membership);
    if (!exists) throw new NotBoardMemberError();

    await this.client.query(
      "DELETE FROM board_members WHERE board_id = $1 AND member_id = $2 RETURNING *;",
      [membership.attrbs.boardId, membership.attrbs.memberId],
    );
  };

  removeAllBoardMembers = async (board: Board): Promise<void> => {
    await db.query(
      "DELETE FROM board_members WHERE board_id = $1 RETURNING *;",
      [board.id],
    );
  };
}

export const pgBoardMemberRepo = new PostgresBoardMembersRepository(db);
