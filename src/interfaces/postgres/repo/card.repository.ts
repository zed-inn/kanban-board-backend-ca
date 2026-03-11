import { z } from "zod";
import {
  Card,
  CardId,
  CardPosition,
  CardRepository,
  ColumnId,
  NoCardError,
} from "kanban";
import { PostgresRepository } from "@shared/services/postgres/postgres-repo.service";
import { DatabaseParamContext } from "@postgres/schema/db-context.schema";

export const PostgresCardModel = z.object({
  id: z.uuidv7("Card id is required."),
  title: z
    .string("Card title is required.")
    .min(1, "Valid Card title must not be empty."),
  content: z.string("Valid card content is required").nullable().default(null),
  position: z
    .string("Valid position is required.")
    .min(1, "Position must not be empty."),
  columnId: z.uuidv7("Column id is required."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PostgresCardRepository
  extends PostgresRepository
  implements CardRepository
{
  protected readonly model = PostgresCardModel;

  private readonly parseRow = (r: any) =>
    this.model.parse(this.utils.camelize(r));

  async exists(id: CardId, ctx?: DatabaseParamContext): Promise<boolean> {
    const client = ctx ? ctx.client : this.client;
    return !(await client.query("SELECT * FROM cards WHERE id = $1;", [id.v]))
      .none;
  }

  async getById(id: CardId, ctx?: DatabaseParamContext): Promise<Card> {
    const client = ctx ? ctx.client : this.client;
    const res = await client.query("SELECT * FROM cards WHERE id = $1;", [
      id.v,
    ]);
    if (res.none) throw new NoCardError();

    const card = this.parseRow(res.top);
    return new Card(card);
  }

  async getTopInColumn(
    columnId: ColumnId,
    ctx?: DatabaseParamContext,
  ): Promise<Card | null> {
    const client = ctx ? ctx.client : this.client;
    const res = await client.query(
      "SELECT * FROM cards WHERE column_id = $1 ORDER BY position DESC LIMIT 1;",
      [columnId.v],
    );
    if (res.none) return null;

    const card = this.parseRow(res.top);
    return new Card(card);
  }

  async getTopBelowPositionInColumn(
    position: CardPosition,
    columnId: ColumnId,
    ctx?: DatabaseParamContext,
  ): Promise<Card | null> {
    const client = ctx ? ctx.client : this.client;
    const res = await client.query(
      "SELECT * FROM cards WHERE column_id = $1 AND position > $2 ORDER BY position ASC LIMIT 1;",
      [columnId.v, position.v],
    );
    if (res.none) return null;

    const card = this.parseRow(res.top);
    return new Card(card);
  }

  async getBottomAbovePositionInColumn(
    position: CardPosition,
    columnId: ColumnId,
    ctx?: DatabaseParamContext,
  ): Promise<Card | null> {
    const client = ctx ? ctx.client : this.client;
    const res = await client.query(
      "SELECT * FROM cards WHERE column_id = $1 AND position < $2 ORDER BY position DESC LIMIT 1;",
      [columnId.v, position.v],
    );
    if (res.none) return null;

    const card = this.parseRow(res.top);
    return new Card(card);
  }

  async save(card: Card, ctx?: DatabaseParamContext): Promise<void> {
    const client = ctx ? ctx.client : this.client;
    const exists = await this.exists(card.id);

    if (!exists)
      await client.query(
        "INSERT INTO cards(id, title, content, position, column_id) VALUES($1, $2, $3, $4, $5) RETURNING *;",
        [
          card.id.v,
          card.title.v,
          card.content.v,
          card.position.v,
          card.columnId.v,
        ],
      );
    else
      await client.query(
        "UPDATE cards SET title = $1, content = $2, position = $3, column_id = $4, updated_at = NOW() WHERE id = $5 RETURNING *;",
        [
          card.title.v,
          card.content.v,
          card.position.v,
          card.columnId.v,
          card.id.v,
        ],
      );
  }

  async remove(card: Card, ctx?: DatabaseParamContext): Promise<void> {
    const client = ctx ? ctx.client : this.client;
    const exists = await this.exists(card.id);
    if (!exists) throw new NoCardError();

    await client.query("DELETE FROM cards WHERE id = $1 RETURNING *;", [
      card.id.v,
    ]);
  }
}
