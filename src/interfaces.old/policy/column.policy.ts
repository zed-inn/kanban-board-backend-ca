import db from "../../config.old/db";
import { PostgresDatabaseConn } from "../../pg/postgresdb.service";
import { ColumnPolicy } from "kanban";
import {
  ColumnNotInBoardError,
  InvalidColumnPositionError,
} from "kanban/src/core/errors/column.error";
import { PoolClient } from "pg";

export class PostgresColumnPolicy implements ColumnPolicy {
  constructor(private client: PostgresDatabaseConn | PoolClient) {}

  ensureColumnInBoard = async (
    columnId: string,
    boardId: string,
  ): Promise<void> => {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE id = $1 AND board_id = $2;",
      [columnId, boardId],
    );
    if (res.rowCount === 0) throw new ColumnNotInBoardError();
  };

  ensureEmptyPositionInBoard = async (
    position: number,
    boardId: string,
  ): Promise<void> => {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE position = $1 AND board_id = $2;",
      [position, boardId],
    );
    if (res.rowCount !== 0) throw new InvalidColumnPositionError();
  };
}

export const pgColumnPolicy = new PostgresColumnPolicy(db);
