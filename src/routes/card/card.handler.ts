import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateCardBody,
  CreateCardParams,
  DeleteCardParams,
  GetCardsParams,
  GetCardsQuery,
  GetCardsResponse,
  UpdateCardBodyBody,
  UpdateCardLocationBody,
  UpdateCardParams,
} from "./card.schema";
import { AuthPayloadSchema } from "@shared/schema/auth-payload.schema";
import { kanban } from "@config/core";
import { PER_PAGE } from "@constants/pagination";
import { GlobalResponseMessage } from "@shared/schema/global-response.schema";

export class CardHandler {
  static async getCardsInColumn(
    req: FastifyRequest<{ Params: GetCardsParams; Querystring: GetCardsQuery }>,
    reply: FastifyReply,
  ): Promise<GetCardsResponse> {
    const q = req.query,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    const res = await kanban.getColumnCards.execute({
      boardId: p.boardId,
      columnId: p.columnId,
      memberId: user.id,
      pagination: { cursor: q.position, limit: PER_PAGE.cards },
    });

    reply.status(200);
    return {
      message: "Cards fetched.",
      data: { cards: res.data, nextCursor: res.nextCursor as any },
    };
  }

  static async addCard(
    req: FastifyRequest<{ Body: CreateCardBody; Params: CreateCardParams }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.addCard.execute({
      boardId: p.boardId,
      columnId: p.columnId,
      content: b.content,
      title: b.title,
      memberId: user.id,
    });

    reply.status(201);
    return { message: "Card added." };
  }

  static async updateCardBody(
    req: FastifyRequest<{ Body: UpdateCardBodyBody; Params: UpdateCardParams }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.updateCardBody.execute({
      boardId: p.boardId,
      cardId: p.id,
      columnId: p.columnId,
      memberId: user.id,
      ...(b.title ? { title: b.title } : {}),
      ...(b.content ? { content: b.content } : {}),
    });

    reply.status(200);
    return { message: "Card body updated." };
  }

  static async updateCardLocation(
    req: FastifyRequest<{
      Body: UpdateCardLocationBody;
      Params: UpdateCardParams;
    }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.reorderCard.execute({
      boardId: p.boardId,
      cardId: p.id,
      columnId: p.columnId,
      memberId: user.id,
      ...(b.id ? { targetCardId: b.id } : {}),
      ...(b.columnId ? { targetColumnId: b.columnId } : {}),
    });

    reply.status(200);
    return { message: "Card reordered." };
  }

  static async deleteCard(
    req: FastifyRequest<{
      Params: DeleteCardParams;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.removeCard.execute({
      boardId: p.boardId,
      cardId: p.id,
      columnId: p.columnId,
      memberId: user.id,
    });

    reply.status(204);
  }
}
