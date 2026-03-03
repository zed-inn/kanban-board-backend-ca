import { z } from "zod";
import { CardRepository } from "kanban";
import db from "@config/db";
import { Card } from "kanban/src/core/entities/card";
import { NoCardError } from "kanban/src/core/errors/card.error";
import { snakeToCamel } from "@shared/utils/snake-to-camel";
import { PostgresDatabaseConn } from "@shared/libs/postgresdb-conn";
import { PoolClient } from "pg";
import { getOffset } from "@shared/utils/get-offset";
import { CARDS_PER_PAGE } from "@config/constants/pagination";

export class PostgresCardRepository implements CardRepository {
  private schema = `CREATE TABLE IF NOT EXISTS cards (
        id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUIDV7(),
        title TEXT NOT NULL,
        content TEXT DEFAULT NULL,
        position NUMERIC NOT NULL DEFAULT 0,
        column_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        FOREIGN KEY(column_id) REFERENCES columns(id) ON DELETE CASCADE
    );`;

  public model = z.object({
    id: z.uuidv7("Card id is required."),
    title: z
      .string("Card title is required.")
      .min(1, "Valid Card title must not be empty."),
    content: z
      .string("Valid card content is required")
      .nullable()
      .default(null),
    position: z.number("Valid position is required."),
    columnId: z.uuidv7("Column id is required."),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

  constructor(private client: PostgresDatabaseConn | PoolClient) {}

  init = async () => {
    await this.client.query(this.schema);
  };

  exists = async (id: string): Promise<boolean> => {
    const res = await this.client.query("SELECT * FROM cards WHERE id = $1;", [
      id,
    ]);
    return res.rowCount === 0 ? false : true;
  };

  getInColumn = async (columnId: string, page: number) => {
    page = isNaN(page) ? 1 : 0;

    const res = await this.client.query(
      "SELECT * FROM cards WHERE column_id = $1 ORDER BY position DESC OFFSET $2 LIMIT $3;",
      [columnId, getOffset(CARDS_PER_PAGE, page), CARDS_PER_PAGE],
    );
    return res.rows.map((r) => this.model.parse(snakeToCamel(r)));
  };

  getById = async (id: string): Promise<Card> => {
    const res = await this.client.query("SELECT * FROM cards WHERE id = $1;", [
      id,
    ]);
    if (res.rowCount === 0) throw new NoCardError();

    const card = this.model.parse(snakeToCamel(res.rows[0]));
    return new Card({
      id: card.id,
      title: card.title,
      content: card.content,
      position: card.position,
      columnId: card.columnId,
    });
  };

  getTopInColumn = async (columnId: string): Promise<Card | null> => {
    const res = await this.client.query(
      "SELECT * FROM cards WHERE column_id = $1 ORDER BY position DESC LIMIT 1;",
      [columnId],
    );
    if (res.rowCount === 0) return null;

    const card = this.model.parse(snakeToCamel(res.rows[0]));
    return new Card({
      id: card.id,
      title: card.title,
      content: card.content,
      position: card.position,
      columnId: card.columnId,
    });
  };

  getTopCardBelowPositionInColumn = async (
    position: number,
    columnId: string,
  ): Promise<Card | null> => {
    const res = await this.client.query(
      "SELECT * FROM cards WHERE column_id = $1 AND position > $2 ORDER BY position ASC LIMIT 1;",
      [columnId, position],
    );
    if (res.rowCount === 0) return null;

    const card = this.model.parse(snakeToCamel(res.rows[0]));
    return new Card({
      id: card.id,
      title: card.title,
      content: card.content,
      position: card.position,
      columnId: card.columnId,
    });
  };

  save = async (card: Card): Promise<void> => {
    const cardAttrbs = card.attrbs;

    const exists = await this.exists(card.id);
    if (!exists)
      await this.client.query(
        "INSERT INTO cards(id, title, content, position, column_id) VALUES($1, $2, $3, $4, $5) RETURNING *;",
        [
          cardAttrbs.id,
          cardAttrbs.title,
          cardAttrbs.content,
          cardAttrbs.position,
          cardAttrbs.columnId,
        ],
      );
    else
      await this.client.query(
        "UPDATE cards SET title = $1, content = $2, position = $3, column_id = $4, updated_at = NOW() WHERE id = $5 RETURNING *;",
        [
          cardAttrbs.title,
          cardAttrbs.content,
          cardAttrbs.position,
          cardAttrbs.columnId,
          cardAttrbs.id,
        ],
      );
  };

  remove = async (card: Card): Promise<void> => {
    const exists = await this.exists(card.id);
    if (!exists) throw new NoCardError();

    await this.client.query("DELETE FROM cards WHERE id = $1 RETURNING *;", [
      card.id,
    ]);
  };
}

export const pgCardRepo = new PostgresCardRepository(db);
