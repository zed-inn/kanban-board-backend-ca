import { PostgresBoardModel } from "@postgres/repo/board.repository";
import { PostgresRepository } from "@shared/services/postgres/postgres-repo.service";
import {
  BoardReadModel,
  BoardQuery,
  KeysetPagination,
  PaginatedResult,
  UserId,
} from "kanban";

export class PostgresBoardQuery
  extends PostgresRepository
  implements BoardQuery
{
  protected readonly model = PostgresBoardModel;

  private readonly parseRow = (r: any) =>
    this.model.parse(this.utils.camelize(r));

  async getByMemberId(
    userId: UserId,
    pagination: KeysetPagination<Date>,
  ): Promise<PaginatedResult<BoardReadModel>> {
    const res = await this.client.query(
      `SELECT boards.* FROM boards JOIN board_members ON board_members.board_id = boards.id WHERE board_members.member_id = $1 ${pagination.cursor ? ", board_members.updated_at < $2" : ""} ORDER BY board_members.updated_at DESC LIMIT $${pagination.cursor ? "3" : "2"};`,
      pagination.cursor
        ? [userId.v, pagination.cursor, pagination.limit]
        : [userId.v, pagination.limit],
    );

    const boards = res.rows.map(this.parseRow);
    const minUpdatedAt = boards.reduce<Date | undefined>((mn, item) => {
      if (!mn) return item.updatedAt;
      return item.updatedAt < mn ? item.updatedAt : mn;
    }, pagination.cursor);

    return {
      data: boards,
      nextCursor: minUpdatedAt,
    };
  }

  async getByOwnerId(
    ownerId: UserId,
    pagination: KeysetPagination<Date>,
  ): Promise<PaginatedResult<BoardReadModel>> {
    const res = await this.client.query(
      `SELECT * FROM boards WHERE owner_id = $1 ${pagination.cursor ? ", updated_at < $2" : ""} ORDER BY updated_at DESC LIMIT $${pagination.cursor ? "3" : "2"};`,
      pagination.cursor
        ? [ownerId.v, pagination.cursor, pagination.limit]
        : [ownerId.v, pagination.limit],
    );

    const boards = res.rows.map(this.parseRow);
    const minUpdatedAt = boards.reduce<Date | undefined>((mn, item) => {
      if (!mn) return item.updatedAt;
      return item.updatedAt < mn ? item.updatedAt : mn;
    }, pagination.cursor);

    return {
      data: boards,
      nextCursor: minUpdatedAt,
    };
  }
}
