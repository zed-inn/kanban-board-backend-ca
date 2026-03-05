import { z } from "zod";
import { PostgresRepository } from "../../pg/postgres-repo.service";
import { Board, BoardRepository, NoBoardError } from "kanban";

export const BoardModel = z.object({
  id: z.uuidv7("Board id is required."),
  name: z
    .string("Board name is required.")
    .min(1, "Valid board name must not be empty."),
  ownerId: z.uuidv7("Owner id is required."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PostgresBoardRepository
  extends PostgresRepository<{ page: number }>
  implements BoardRepository
{
  protected readonly model = BoardModel;
  protected readonly PER_PAGE: number = 30;
  protected readonly repoSchema: string = `CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUIDV7(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
);`;

  private readonly parseRow = (r: any) =>
    this.model.parse(this.utils.camelize(r));

  private readonly offsetPage = this.utils.createOffsetFn(this.PER_PAGE);

  async exists(id: string): Promise<boolean> {
    return !(
      await this.client.query("SELECT * FROM boards WHERE id = $1;", [id])
    ).none;
  }

  async getById(id: string): Promise<Board> {
    const res = await this.client.query("SELECT * FROM boards WHERE id = $1;", [
      id,
    ]);
    if (res.none) throw new NoBoardError();

    const board = this.parseRow(res.top);
    return new Board(board);
  }

  async getByIds(ids: string[]): Promise<Board[]> {
    const res = await this.client.query(
      "SELECT * FROM boards WHERE id = ANY($1) ORDER BY updated_at OFFSET $2 LIMIT $3;",
      [ids, this.offsetPage(this.ctx.page), this.PER_PAGE],
    );

    const boards = res.rows.map(this.parseRow);
    return boards.map((b) => new Board(b));
  }

  async getByOwnerId(userId: string): Promise<Board[]> {
    const res = await this.client.query(
      "SELECT * FROM boards WHERE owner_id = $1 ORDER BY updated_at OFFSET $2 LIMIT $3;",
      [userId, this.offsetPage(this.ctx.page), this.PER_PAGE],
    );

    const boards = res.rows.map(this.parseRow);
    return boards.map((b) => new Board(b));
  }

  async save(board: Board): Promise<void> {
    const exists = await this.exists(board.id);
    if (!exists)
      await this.client.query(
        "INSERT INTO boards(id, name, owner_id) VALUES($1, $2, $3) RETURNING *;",
        [board.id, board.attrbs.name, board.attrbs.ownerId],
      );
    else
      await this.client.query(
        "UPDATE boards SET name = $1, owner_id = $2, updated_at = NOW() WHERE id = $3 RETURNING *;",
        [board.attrbs.name, board.attrbs.ownerId, board.id],
      );
  }

  async remove(board: Board): Promise<void> {
    const exists = await this.exists(board.id);
    if (!exists) throw new NoBoardError();

    await this.client.query("DELETE FROM boards WHERE id = $1 RETURNING *;", [
      board.id,
    ]);
  }
}
