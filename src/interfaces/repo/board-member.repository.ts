import { z } from "zod";
import {
  Board,
  BoardMembership,
  MemberRepository,
  NotBoardMemberError,
} from "kanban";
import { PostgresRepository } from "@shared/services/postgres-repo.service";

export const BoardMemberModel = z.object({
  boardId: z.uuidv7("Board id is required."),
  memberId: z.uuidv7("Member id is required."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PostgresBoardMemberRepository
  extends PostgresRepository<{ page?: number }>
  implements MemberRepository
{
  protected readonly PER_PAGE: number = 30;
  protected readonly model = BoardMemberModel;
  protected readonly repoSchema: string = `CREATE TABLE IF NOT EXISTS board_members (
    board_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(board_id, user_id),
    FOREIGN KEY(board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);`;

  private readonly parseRow = (r: any) =>
    this.model.parse(this.utils.camelize(r));

  private readonly offsetPage = this.utils.createOffsetFn(this.PER_PAGE);

  async exists(membership: BoardMembership): Promise<boolean> {
    return !(
      await this.client.query(
        "SELECT * FROM board_members WHERE board_id = $1 and member_id = $2;",
        [membership.attrbs.boardId, membership.attrbs.memberId],
      )
    ).none;
  }

  async getByUserId(userId: string): Promise<BoardMembership[]> {
    const res = await this.client.query(
      "SELECT * FROM board_members WHERE member_id = $1 ORDER BY updated_at OFFSET $2 LIMIT $3;",
      [userId, this.offsetPage(this.ctx.page ?? 1), this.PER_PAGE],
    );
    const memberships = res.rows.map(this.parseRow);
    return memberships.map((m) => new BoardMembership(m));
  }

  async getAllBoardMemberIdsById(boardId: string): Promise<string[]> {
    const res = await this.client.query(
      "SELECT * FROM board_members WHERE board_id = $1;",
      [boardId],
    );
    const members = res.rows.map(this.parseRow);
    return members.map((m) => m.memberId);
  }

  async save(membership: BoardMembership): Promise<void> {
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
  }

  async remove(membership: BoardMembership): Promise<void> {
    const exists = await this.exists(membership);
    if (!exists) throw new NotBoardMemberError();

    await this.client.query(
      "DELETE FROM board_members WHERE board_id = $1 AND member_id = $2 RETURNING *;",
      [membership.attrbs.boardId, membership.attrbs.memberId],
    );
  }

  async removeAllBoardMembers(board: Board): Promise<void> {
    await this.client.query(
      "DELETE FROM board_members WHERE board_id = $1 RETURNING *;",
      [board.id],
    );
  }
}
