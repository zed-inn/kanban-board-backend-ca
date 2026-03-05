import {
  ColumnNotInBoardError,
  ColumnPolicy,
  InvalidColumnPositionError,
} from "kanban";
import { PostgresPolicy } from "../../pg/postgres-policy.service";

export class PostgresColumnPolicy
  extends PostgresPolicy
  implements ColumnPolicy
{
  async ensureColumnInBoard(columnId: string, boardId: string): Promise<void> {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE id = $1 AND board_id = $2;",
      [columnId, boardId],
    );
    if (res.none) throw new ColumnNotInBoardError();
  }

  async ensureEmptyPositionInBoard(
    position: number,
    boardId: string,
  ): Promise<void> {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE position = $1 AND board_id = $2;",
      [position, boardId],
    );
    if (!res.none) throw new InvalidColumnPositionError();
  }
}
