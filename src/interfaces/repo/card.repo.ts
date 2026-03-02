import { z } from "zod";
import { CardRepository } from "kanban";
import db from "@config/db";
import { Card } from "kanban/src/core/entities/card";
import { NoCardError } from "kanban/src/core/errors/card.error";
import { snakeToCamel } from "@shared/utils/snake-to-camel";

class PostgresCardRepository implements CardRepository {
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

  private model = z.object({
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

  init = async () => {
    await db.query(this.schema);
  };

  exists = async (id: string): Promise<boolean> => {
    const res = await db.query("SELECT * FROM cards WHERE id = $1;", [id]);
    return res.rowCount === 0 ? false : true;
  };

  getById = async (id: string): Promise<Card> => {
    const res = await db.query("SELECT * FROM cards WHERE id = $1;", [id]);
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
    const res = await db.query(
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
    const res = await db.query(
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
      await db.query(
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
      await db.query(
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

    await db.query("DELETE FROM cards WHERE id = $1 RETURNING *;", [card.id]);
  };
}

export const pgCardRepo = new PostgresCardRepository();
