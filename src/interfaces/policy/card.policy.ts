import db from "@config/db";
import { CardPolicy } from "kanban";
import {
  CardNotInColumnError,
  InvalidCardPositionError,
} from "kanban/src/core/errors/card.error";

class PostgresCardPolicy implements CardPolicy {
  ensureCardInColumn = async (id: string, columnId: string): Promise<void> => {
    const res = await db.query(
      "SELECT * FROM cards WHERE id = $1 AND column_id = $2;",
      [id, columnId],
    );
    if (res.rowCount === 0) throw new CardNotInColumnError();
  };

  ensureEmptyPositionInColumn = async (
    position: number,
    columnId: string,
  ): Promise<void> => {
    const res = await db.query(
      "SELECT * FROM cards WHERE position = $1 AND column_id = $2;",
      [position, columnId],
    );
    if (res.rowCount !== 0) throw new InvalidCardPositionError();
  };
}

export const pgCardPolicy = new PostgresCardPolicy();
