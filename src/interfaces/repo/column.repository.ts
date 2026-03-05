import { z } from "zod";
import { Column, ColumnRepository, NoColumnError } from "kanban";
import { PostgresRepository } from "@shared/services/postgres-repo.service";

export const ColumnModel = z.object({
  id: z.uuidv7("Column id is required."),
  name: z
    .string("Column name is required.")
    .min(1, "Valid column name must not be empty."),
  position: z.number("Valid position is required."),
  boardId: z.uuidv7("Board id is required."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PostgresColumnRepository
  extends PostgresRepository<{ page: number }>
  implements ColumnRepository
{
  protected readonly PER_PAGE: number = 10;
  protected readonly model = ColumnModel;
  protected readonly repoSchema: string = `CREATE TABLE IF NOT EXISTS columns (
        id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUIDV7(),
        name TEXT NOT NULL,
        position NUMERIC NOT NULL DEFAULT 0,
        board_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        FOREIGN KEY(board_id) REFERENCES boards(id) ON DELETE CASCADE
    );`;

  private readonly parseRow = (r: any) =>
    this.model.parse(this.utils.camelize(r));

  private readonly offsetPage = this.utils.createOffsetFn(this.PER_PAGE);

  async exists(id: string): Promise<boolean> {
    return !(
      await this.client.query("SELECT * FROM columns WHERE id = $1;", [id])
    ).none;
  }

  async getById(id: string): Promise<Column> {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE id = $1;",
      [id],
    );
    if (res.none) throw new NoColumnError();

    const column = this.parseRow(res.top);
    return new Column(column);
  }

  async getByBoardId(boardId: string): Promise<Column[]> {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE board_id = $1 ORDER BY position DESC OFFSET $2 LIMIT $3;",
      [boardId, this.offsetPage(this.ctx.page), this.PER_PAGE],
    );

    const columns = res.rows.map(this.parseRow);
    return columns.map((c) => new Column(c));
  }

  async getTopInBoard(boardId: string): Promise<Column | null> {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE board_id = $1 ORDER BY position DESC LIMIT 1;",
      [boardId],
    );
    if (res.none) return null;

    const column = this.parseRow(res.top);
    return new Column(column);
  }

  async getTopColumnBelowPositionInBoard(
    position: number,
    boardId: string,
  ): Promise<Column | null> {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE board_id = $1 AND position > $2 ORDER BY position ASC LIMIT 1;",
      [boardId, position],
    );
    if (res.none) return null;

    const column = this.parseRow(res.top);
    return new Column(column);
  }

  async save(column: Column): Promise<void> {
    const exists = this.exists(column.id);
    if (!exists)
      await this.client.query(
        "INSERT INTO columns(id, name, position, board_id) VALUES($1, $2, $3, $4) RETURNING *;",
        [
          column.id,
          column.attrbs.name,
          column.attrbs.position,
          column.attrbs.boardId,
        ],
      );
    else
      await this.client.query(
        "UPDATE columns SET name = $1, position = $2, updated_at = NOW() WHERE id = $3 RETURNING *;",
        [column.attrbs.name, column.attrbs.position, column.id],
      );
  }

  async remove(column: Column): Promise<void> {
    const exists = this.exists(column.id);
    if (!exists) throw new NoColumnError();

    await this.client.query("DELETE FROM columns WHERE id = $1 RETURNING *;", [
      column.id,
    ]);
  }
}
