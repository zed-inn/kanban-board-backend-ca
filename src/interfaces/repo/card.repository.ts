import { z } from "zod";
import { Card, CardRepository, NoCardError } from "kanban";
import { PostgresRepository } from "@shared/services/postgres-repo.service";
import { CardConstant } from "kanban/src/core/interfaces/constants/card.constant";

export const CardModel = z.object({
  id: z.uuidv7("Card id is required."),
  title: z
    .string("Card title is required.")
    .min(1, "Valid Card title must not be empty."),
  content: z.string("Valid card content is required").nullable().default(null),
  position: z
    .number("Valid position is required.")
    .or(z.coerce.number("Valid position is required.")),
  columnId: z.uuidv7("Column id is required."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PostgresCardRepository
  extends PostgresRepository<{ page?: number }>
  implements CardRepository, CardConstant
{
  readonly POSITION_GAP: number = 100;
  protected readonly PER_PAGE: number = 50;
  protected readonly model = CardModel;
  protected readonly repoSchema: string = `CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUIDV7(),
    title TEXT NOT NULL,
    content TEXT DEFAULT NULL,
    position NUMERIC NOT NULL DEFAULT 0,
    column_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY(column_id) REFERENCES columns(id) ON DELETE CASCADE
);`;

  private readonly parseRow = (r: any) =>
    this.model.parse(this.utils.camelize(r));

  private readonly offsetPage = this.utils.createOffsetFn(this.PER_PAGE);

  async exists(id: string): Promise<boolean> {
    return !(
      await this.client.query("SELECT * FROM cards WHERE id = $1;", [id])
    ).none;
  }

  async getById(id: string): Promise<Card> {
    const res = await this.client.query("SELECT * FROM cards WHERE id = $1;", [
      id,
    ]);
    if (res.none) throw new NoCardError();

    const card = this.parseRow(res.top);
    return new Card(card);
  }

  async getByColumnId(columnId: string): Promise<Card[]> {
    const res = await this.client.query(
      "SELECT * FROM cards WHERE column_id = $1 ORDER BY position ASC OFFSET $2 LIMIT $3;",
      [columnId, this.offsetPage(this.ctx.page ?? 1), this.PER_PAGE],
    );

    const cards = res.rows.map(this.parseRow);
    return cards.map((c) => new Card(c));
  }

  async getTopInColumn(columnId: string): Promise<Card | null> {
    const res = await this.client.query(
      "SELECT * FROM cards WHERE column_id = $1 ORDER BY position DESC LIMIT 1;",
      [columnId],
    );
    if (res.none) return null;

    const card = this.parseRow(res.top);
    return new Card(card);
  }

  async getTopCardBelowPositionInColumn(
    position: number,
    columnId: string,
  ): Promise<Card | null> {
    const res = await this.client.query(
      "SELECT * FROM cards WHERE column_id = $1 AND position > $2 ORDER BY position ASC LIMIT 1;",
      [columnId, position],
    );
    if (res.none) return null;

    const card = this.parseRow(res.top);
    return new Card(card);
  }

  async getBottomCardAbovePositionInColumn(
    position: number,
    columnId: string,
  ): Promise<Card | null> {
    const res = await this.client.query(
      "SELECT * FROM cards WHERE column_id = $1 AND position < $2 ORDER BY position DESC LIMIT 1;",
      [columnId, position],
    );
    if (res.none) return null;

    const card = this.parseRow(res.top);
    return new Card(card);
  }

  async save(card: Card): Promise<void> {
    const exists = await this.exists(card.id);
    if (!exists)
      await this.client.query(
        "INSERT INTO cards(id, title, content, position, column_id) VALUES($1, $2, $3, $4, $5) RETURNING *;",
        [
          card.id,
          card.attrbs.title,
          card.attrbs.content,
          card.attrbs.position,
          card.attrbs.columnId,
        ],
      );
    else
      await this.client.query(
        "UPDATE cards SET title = $1, content = $2, position = $3, column_id = $4, updated_at = NOW() WHERE id = $5 RETURNING *;",
        [
          card.attrbs.title,
          card.attrbs.content,
          card.attrbs.position,
          card.attrbs.columnId,
          card.id,
        ],
      );
  }

  async remove(card: Card): Promise<void> {
    const exists = await this.exists(card.id);
    if (!exists) throw new NoCardError();

    await this.client.query("DELETE FROM cards WHERE id = $1 RETURNING *;", [
      card.id,
    ]);
  }
}
