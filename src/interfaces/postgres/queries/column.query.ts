import { PostgresColumnModel } from "@postgres/repo/column.repository";
import { PostgresRepository } from "@shared/services/postgres/postgres-repo.service";
import {
  BoardId,
  ColumnReadModel,
  ColumnQuery,
  KeysetPagination,
  PaginatedResult,
} from "kanban";

export class PostgresColumnQuery
  extends PostgresRepository
  implements ColumnQuery
{
  protected readonly model = PostgresColumnModel;

  private readonly parseRow = (r: any) =>
    this.model.parse(this.utils.camelize(r));

  async getByBoardId(
    boardId: BoardId,
    pagination: KeysetPagination<string>,
  ): Promise<PaginatedResult<ColumnReadModel>> {
    const res = await this.client.query(
      `SELECT * FROM columns WHERE board_id = $1 ${pagination.cursor ? ", position < $2" : ""} ORDER BY position DESC LIMIT $${pagination.cursor ? "3" : "2"};`,
      pagination.cursor
        ? [boardId.v, pagination.cursor, pagination.limit]
        : [boardId.v, pagination.limit],
    );

    const columns = res.rows.map(this.parseRow);
    const minPosition = columns.reduce<string | undefined>((mn, item) => {
      if (!mn) return item.position;
      return item.position < mn ? item.position : mn;
    }, pagination.cursor);

    return { data: columns, nextCursor: minPosition };
  }
}
