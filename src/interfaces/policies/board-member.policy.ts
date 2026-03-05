import { MemberPolicy, NotBoardMemberError, NotBoardOwnerError } from "kanban";
import { PostgresPolicy } from "@shared/services/postgres-policy.service";

export class PostgresBoardMemberPolicy
  extends PostgresPolicy
  implements MemberPolicy
{
  async ensureMember(memberId: string, boardId: string): Promise<void> {
    const res = await this.client.query(
      "SELECT * FROM board_members WHERE board_id = $1 AND member_id = $2;",
      [boardId, memberId],
    );
    if (res.none) throw new NotBoardMemberError();
  }

  async ensureOwner(boardId: string, ownerId: string): Promise<void> {
    const res = await this.client.query(
      "SELECT * FROM boards WHERE id = $1 AND owner_id = $2;",
      [boardId, ownerId],
    );
    if (res.none) throw new NotBoardOwnerError();
  }
}
