import {
  CardNotInColumnError,
  CardPolicy,
  InvalidCardPositionError,
} from "kanban";
import { PostgresPolicy } from "@shared/services/postgres-policy.service";

export class PostgresCardPolicy extends PostgresPolicy implements CardPolicy {
  async ensureCardInColumn(id: string, columnId: string): Promise<void> {
    const res = await this.client.query(
      "SELECT * FROM cards WHERE id = $1 AND column_id = $2;",
      [id, columnId],
    );
    if (res.none) throw new CardNotInColumnError();
  }

  async ensureEmptyPositionInColumn(
    position: number,
    columnId: string,
  ): Promise<void> {
    const res = await this.client.query(
      "SELECT * FROM cards WHERE position = $1 AND column_id = $2;",
      [position, columnId],
    );
    if (!res.none) throw new InvalidCardPositionError();
  }
}
