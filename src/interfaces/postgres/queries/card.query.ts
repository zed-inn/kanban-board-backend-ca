import { PostgresCardModel } from "@postgres/repo/card.repository";
import { PostgresRepository } from "@shared/services/postgres/postgres-repo.service";
import {
  CardReadModel,
  CardQuery,
  ColumnId,
  KeysetPagination,
  PaginatedResult,
} from "kanban";

export class PostgresCardQuery extends PostgresRepository implements CardQuery {
  protected readonly model = PostgresCardModel;

  private readonly parseRow = (r: any) =>
    this.model.parse(this.utils.camelize(r));

  async getByColumnId(
    columnId: ColumnId,
    pagination: KeysetPagination<string>,
  ): Promise<PaginatedResult<CardReadModel>> {
    const res = await this.client.query(
      `SELECT * FROM cards WHERE column_id = $1 ${pagination.cursor ? ", position < $2" : ""} ORDER BY position DESC LIMIT $${pagination.cursor ? "3" : "2"};`,
      pagination.cursor
        ? [columnId.v, pagination.cursor, pagination.limit]
        : [columnId.v, pagination.limit],
    );

    const cards = res.rows.map(this.parseRow);
    const minPosition = cards.reduce<string | undefined>((mn, item) => {
      if (!mn) return item.position;
      return item.position < mn ? item.position : mn;
    }, pagination.cursor);

    return { data: cards, nextCursor: minPosition };
  }
}
