import { z } from "zod";
import { Board, BoardId, BoardRepository, NoBoardError } from "kanban";
import { DatabaseParamContext } from "@postgres/schema/db-context.schema";
import { PostgresRepository } from "@shared/services/postgres/postgres-repo.service";

export const PostgresBoardModel = z.object({
  id: z.uuidv7("Board id is required."),
  name: z
    .string("Board name is required.")
    .min(1, "Valid board name must not be empty."),
  ownerId: z.uuidv7("Owner id is required."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PostgresBoardRepository
  extends PostgresRepository
  implements BoardRepository
{
  protected readonly model = PostgresBoardModel;

  private readonly parseRow = (r: any) =>
    this.model.parse(this.utils.camelize(r));

  async exists(id: BoardId, ctx?: DatabaseParamContext): Promise<boolean> {
    const client = ctx ? ctx.client : this.client;
    return !(await client.query("SELECT * FROM boards WHERE id = $1;", [id.v]))
      .none;
  }

  async getById(id: BoardId, ctx?: DatabaseParamContext): Promise<Board> {
    const client = ctx ? ctx.client : this.client;
    const res = await client.query("SELECT * FROM boards WHERE id = $1;", [
      id.v,
    ]);
    if (res.none) throw new NoBoardError();

    const board = this.parseRow(res.top);
    return new Board(board);
  }

  async save(board: Board, ctx?: DatabaseParamContext): Promise<void> {
    const client = ctx ? ctx.client : this.client;
    const exists = await this.exists(board.id, ctx);

    if (!exists)
      await client.query(
        "INSERT INTO boards(id, name, owner_id) VALUES($1, $2, $3) RETURNING *;",
        [board.id.v, board.name.v, board.ownerId.v],
      );
    else
      await client.query(
        "UPDATE boards SET name = $1, owner_id = $2, updated_at = NOW() WHERE id = $3 RETURNING *;",
        [board.name.v, board.ownerId.v, board.id.v],
      );
  }

  async remove(board: Board, ctx?: DatabaseParamContext): Promise<void> {
    const client = ctx ? ctx.client : this.client;
    const exists = await this.exists(board.id, ctx);
    if (!exists) throw new NoBoardError();

    await client.query("DELETE FROM boards WHERE id = $1 RETURNING *;", [
      board.id.v,
    ]);
  }
}
