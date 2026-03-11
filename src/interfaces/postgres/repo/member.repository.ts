import { z } from "zod";
import {
  BoardId,
  BoardMembership,
  MemberRepository,
  NotBoardMemberError,
} from "kanban";
import { DatabaseParamContext } from "@postgres/schema/db-context.schema";
import { PostgresRepository } from "@shared/services/postgres/postgres-repo.service";

export const PostgresBoardMemberModel = z.object({
  boardId: z.uuidv7("Board id is required."),
  memberId: z.uuidv7("Member id is required."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PostgresBoardMemberRepository
  extends PostgresRepository
  implements MemberRepository
{
  protected readonly model = PostgresBoardMemberModel;

  async exists(
    membership: BoardMembership,
    ctx?: DatabaseParamContext,
  ): Promise<boolean> {
    const client = ctx ? ctx.client : this.client;
    return !(
      await client.query(
        "SELECT * FROM board_members WHERE board_id = $1 and member_id = $2;",
        [membership.boardId.v, membership.memberId.v],
      )
    ).none;
  }

  async save(
    membership: BoardMembership,
    ctx?: DatabaseParamContext,
  ): Promise<void> {
    const client = ctx ? ctx.client : this.client;
    const exists = await this.exists(membership, ctx);

    if (!exists)
      await client.query(
        "INSERT INTO board_members(board_id, member_id) VALUES($1, $2) RETURNING *;",
        [membership.boardId.v, membership.memberId.v],
      );
    else
      await client.query(
        "UPDATE board_members SET updated_at = NOW() WHERE board_id = $1 AND member_id = $2 RETURNING *;",
        [membership.boardId.v, membership.memberId.v],
      );
  }

  async remove(
    membership: BoardMembership,
    ctx?: DatabaseParamContext,
  ): Promise<void> {
    const client = ctx ? ctx.client : this.client;
    const exists = await this.exists(membership);
    if (!exists) throw new NotBoardMemberError();

    await client.query(
      "DELETE FROM board_members WHERE board_id = $1 AND member_id = $2 RETURNING *;",
      [membership.boardId.v, membership.memberId.v],
    );
  }

  async removeAll(boardId: BoardId, ctx?: DatabaseParamContext): Promise<void> {
    const client = ctx ? ctx.client : this.client;
    await client.query(
      "DELETE FROM board_members WHERE board_id = $1 RETURNING *;",
      [boardId.v],
    );
  }
}
