import db from "@config/db";
import { ColumnPolicy } from "kanban";
import {
  ColumnNotInBoardError,
  InvalidColumnPositionError,
} from "kanban/src/core/errors/column.error";

class PostgresColumnPolicy implements ColumnPolicy {
  ensureColumnInBoard = async (
    columnId: string,
    boardId: string,
  ): Promise<void> => {
    const res = await db.query(
      "SELECT * FROM columns WHERE id = $1 AND board_id = $2;",
      [columnId, boardId],
    );
    if (res.rowCount === 0) throw new ColumnNotInBoardError();
  };

  ensureEmptyPositionInBoard = async (
    position: number,
    boardId: string,
  ): Promise<void> => {
    const res = await db.query(
      "SELECT * FROM columns WHERE position = $1 AND board_id = $2;",
      [position, boardId],
    );
    if (res.rowCount !== 0) throw new InvalidColumnPositionError();
  };
}

export const pgColumnPolicy = new PostgresColumnPolicy();
