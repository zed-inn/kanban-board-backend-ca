import db from "@config/db";
import { PostgresDatabaseConn } from "@shared/libs/postgresdb-conn";
import { snakeToCamel } from "@shared/utils/snake-to-camel";
import { ColumnRepository } from "kanban";
import { Column } from "kanban/src/core/entities/column";
import { NoColumnError } from "kanban/src/core/errors/column.error";
import { PoolClient } from "pg";
import { z } from "zod";

export class PostgresColumnRepository implements ColumnRepository {
  private schema = `CREATE TABLE IF NOT EXISTS columns (
        id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUIDV7(),
        name TEXT NOT NULL,
        position NUMERIC NOT NULL DEFAULT 0,
        board_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        FOREIGN KEY(board_id) REFERENCES boards(id) ON DELETE CASCADE
    );`;

  private model = z.object({
    id: z.uuidv7("Column id is required."),
    name: z
      .string("Column name is required.")
      .min(1, "Valid column name must not be empty."),
    position: z.number("Valid position is required."),
    boardId: z.uuidv7("Board id is required."),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

  constructor(private client: PostgresDatabaseConn | PoolClient) {}

  init = async () => {
    await this.client.query(this.schema);
  };

  exists = async (id: string): Promise<boolean> => {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE id = $1;",
      [id],
    );
    return res.rowCount === 0 ? false : true;
  };

  getById = async (id: string): Promise<Column> => {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE id = $1;",
      [id],
    );
    if (res.rowCount === 0) throw new NoColumnError();

    const col = this.model.parse(snakeToCamel(res.rows[0]));
    return new Column({
      id: col.id,
      name: col.name,
      position: col.position,
      boardId: col.boardId,
    });
  };

  getTopInBoard = async (boardId: string): Promise<Column | null> => {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE board_id = $1 ORDER BY position DESC LIMIT 1;",
      [boardId],
    );
    if (res.rowCount === 0) return null;

    const col = this.model.parse(snakeToCamel(res.rows[0]));
    return new Column({
      id: col.id,
      name: col.name,
      position: col.position,
      boardId: col.boardId,
    });
  };

  getTopColumnBelowPositionInBoard = async (
    position: number,
    boardId: string,
  ): Promise<Column | null> => {
    const res = await this.client.query(
      "SELECT * FROM columns WHERE board_id = $1 AND position > $2 ORDER BY position ASC LIMIT 1;",
      [boardId, position],
    );
    if (res.rowCount === 0) return null;

    const col = this.model.parse(snakeToCamel(res.rows[0]));
    return new Column({
      id: col.id,
      name: col.name,
      position: col.position,
      boardId: col.boardId,
    });
  };

  save = async (column: Column): Promise<void> => {
    const colAttrbs = column.attrbs;

    const exists = this.exists(column.id);
    if (!exists)
      await this.client.query(
        "INSERT INTO columns(id, name, position, board_id) VALUES($1, $2, $3, $4) RETURNING *;",
        [colAttrbs.id, colAttrbs.name, colAttrbs.position, colAttrbs.boardId],
      );
    else
      await this.client.query(
        "UPDATE columns SET name = $1, position = $2, updated_at = NOW() WHERE id = $3 RETURNING *;",
        [colAttrbs.name, colAttrbs.position, colAttrbs.id],
      );
  };

  remove = async (column: Column): Promise<void> => {
    const exists = this.exists(column.id);
    if (!exists) throw new NoColumnError();

    await this.client.query("DELETE FROM columns WHERE id = $1 RETURNING *;", [
      column.id,
    ]);
  };
}

export const pgColumnRepo = new PostgresColumnRepository(db);
