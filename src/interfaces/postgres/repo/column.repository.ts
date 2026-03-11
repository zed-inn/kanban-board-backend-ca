import { z } from "zod";
import {
  BoardId,
  Column,
  ColumnId,
  ColumnPosition,
  ColumnRepository,
  NoColumnError,
} from "kanban";
import { PostgresRepository } from "@shared/services/postgres/postgres-repo.service";
import { DatabaseParamContext } from "@postgres/schema/db-context.schema";

export const PostgresColumnModel = z.object({
  id: z.uuidv7("Column id is required."),
  name: z
    .string("Column name is required.")
    .min(1, "Valid column name must not be empty."),
  position: z
    .string("Valid position is required.")
    .min(1, "Position must not be empty."),
  boardId: z.uuidv7("Board id is required."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PostgresColumnRepository
  extends PostgresRepository
  implements ColumnRepository
{
  protected readonly model = PostgresColumnModel;

  private readonly parseRow = (r: any) =>
    this.model.parse(this.utils.camelize(r));

  async existsInBoard(
    columnId: ColumnId,
    boardId: BoardId,
    ctx?: DatabaseParamContext,
  ): Promise<boolean> {
    const client = ctx ? ctx.client : this.client;
    const res = await client.query(
      "SELECT * FROM columns WHERE id = $1 AND board_id = $2;",
      [columnId.v, boardId.v],
    );
    return !res.none;
  }

  async exists(id: ColumnId, ctx?: DatabaseParamContext): Promise<boolean> {
    const client = ctx ? ctx.client : this.client;
    return !(await client.query("SELECT * FROM columns WHERE id = $1;", [id.v]))
      .none;
  }

  async getById(id: ColumnId, ctx?: DatabaseParamContext): Promise<Column> {
    const client = ctx ? ctx.client : this.client;
    const res = await client.query("SELECT * FROM columns WHERE id = $1;", [
      id.v,
    ]);
    if (res.none) throw new NoColumnError();

    const column = this.parseRow(res.top);
    return new Column(column);
  }

  async getTopInBoard(
    boardId: BoardId,
    ctx?: DatabaseParamContext,
  ): Promise<Column | null> {
    const client = ctx ? ctx.client : this.client;
    const res = await client.query(
      "SELECT * FROM columns WHERE board_id = $1 ORDER BY position DESC LIMIT 1;",
      [boardId.v],
    );
    if (res.none) return null;

    const column = this.parseRow(res.top);
    return new Column(column);
  }

  async getTopBelowPositionInBoard(
    position: ColumnPosition,
    boardId: BoardId,
    ctx?: DatabaseParamContext,
  ): Promise<Column | null> {
    const client = ctx ? ctx.client : this.client;
    const res = await client.query(
      "SELECT * FROM columns WHERE board_id = $1 AND position > $2 ORDER BY position ASC LIMIT 1;",
      [boardId.v, position.v],
    );
    if (res.none) return null;

    const column = this.parseRow(res.top);
    return new Column(column);
  }

  async getBottomAbovePositionInBoard(
    position: ColumnPosition,
    boardId: BoardId,
    ctx?: DatabaseParamContext,
  ): Promise<Column | null> {
    const client = ctx ? ctx.client : this.client;
    const res = await client.query(
      "SELECT * FROM columns WHERE board_id = $1 AND position < $2 ORDER BY position DESC LIMIT 1;",
      [boardId.v, position.v],
    );
    if (res.none) return null;

    const column = this.parseRow(res.top);
    return new Column(column);
  }

  async save(column: Column, ctx?: DatabaseParamContext): Promise<void> {
    const client = ctx ? ctx.client : this.client;
    const exists = await this.exists(column.id, ctx);

    if (!exists)
      await client.query(
        "INSERT INTO columns(id, name, position, board_id) VALUES($1, $2, $3, $4) RETURNING *;",
        [column.id.v, column.name.v, column.position.v, column.boardId.v],
      );
    else
      await client.query(
        "UPDATE columns SET name = $1, position = $2, updated_at = NOW() WHERE id = $3 RETURNING *;",
        [column.name.v, column.position.v, column.id.v],
      );
  }

  async remove(column: Column, ctx?: DatabaseParamContext): Promise<void> {
    const client = ctx ? ctx.client : this.client;
    const exists = await this.exists(column.id);
    if (!exists) throw new NoColumnError();

    await client.query("DELETE FROM columns WHERE id = $1 RETURNING *;", [
      column.id.v,
    ]);
  }
}
