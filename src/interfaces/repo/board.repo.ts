import { z } from "zod";
import db from "@config/db";
import { BoardRepository } from "kanban";
import { Board } from "kanban/src/core/entities/board";
import { NoBoardError } from "kanban/src/core/errors/board.error";
import { snakeToCamel } from "@shared/utils/snake-to-camel";
import { PostgresDatabaseConn } from "@shared/libs/postgresdb-conn";
import { PoolClient } from "pg";

export class PostgresBoardRepository implements BoardRepository {
  private schema = `CREATE TABLE IF NOT EXISTS boards (
        id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUIDV7(),
        name TEXT NOT NULL,
        owner_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
    );`;

  private model = z.object({
    id: z.uuidv7("Board id is required."),
    name: z
      .string("Board name is required.")
      .min(1, "Valid board name must not be empty."),
    ownerId: z.uuidv7("Owner id is required."),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

  constructor(private client: PostgresDatabaseConn | PoolClient) {}

  init = async () => {
    await this.client.query(this.schema);
  };

  exists = async (id: string): Promise<boolean> => {
    const res = await this.client.query("SELECT * FROM boards WHERE id = $1;", [
      id,
    ]);
    return res.rowCount === 0 ? false : true;
  };

  getById = async (id: string): Promise<Board> => {
    const res = await this.client.query("SELECT * FROM boards WHERE id = $1;", [
      id,
    ]);
    if (res.rowCount == 0) throw new NoBoardError();

    const board = this.model.parse(snakeToCamel(res.rows[0]));
    return new Board({
      id: board.id,
      name: board.name,
      ownerId: board.ownerId,
    });
  };

  save = async (board: Board): Promise<void> => {
    const boardAttrbs = board.attrbs;

    const exists = await this.exists(board.id);
    if (!exists)
      await this.client.query(
        "INSERT INTO boards(id, name, owner_id) VALUES($1, $2, $3) RETURNING *;",
        [boardAttrbs.id, boardAttrbs.name, boardAttrbs.ownerId],
      );
    else
      await this.client.query(
        "UPDATE boards SET name = $1, owner_id = $2, updated_at = NOW() WHERE id = $3 RETURNING *;",
        [boardAttrbs.name, boardAttrbs.ownerId, boardAttrbs.id],
      );
  };

  remove = async (board: Board): Promise<void> => {
    const exists = await this.exists(board.id);
    if (!exists) throw new NoBoardError();

    await this.client.query("DELETE FROM boards WHERE id = $1 RETURNING *;", [
      board.id,
    ]);
  };
}

export const pgBoardRepo = new PostgresBoardRepository(db);
