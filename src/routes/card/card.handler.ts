import { GlobalResponse } from "@shared/schema/global.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateCardBody,
  CreateCardParams,
  DeleteCardParams,
  UpdateCardBodyBody,
  UpdateCardLocationBody,
  UpdateCardParams,
} from "./card.schema";
import { AuthPayloadSchema } from "@shared/schema/auth-payload.schema";
import kanban from "@shared/core";

export class CardHandler {
  static addCard = async (
    req: FastifyRequest<{ Body: CreateCardBody; Params: CreateCardParams }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.addCard.execute(
      b.title,
      b.content,
      p.columnId,
      p.boardId,
      user.id,
    );

    reply.status(201);
    return { message: "Card added." };
  };

  static updateCardBody = async (
    req: FastifyRequest<{ Body: UpdateCardBodyBody; Params: UpdateCardParams }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.updateCardBody.execute(
      p.id,
      { title: b.title, ...(b.content ? { content: b.content } : {}) },
      p.columnId,
      p.boardId,
      user.id,
    );

    reply.status(200);
    return { message: "Card body updated." };
  };

  static updateCardLocation = async (
    req: FastifyRequest<{
      Body: UpdateCardLocationBody;
      Params: UpdateCardParams;
    }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.reorderCard.execute(
      p.id,
      b.id,
      p.columnId,
      p.boardId,
      user.id,
    );

    reply.status(200);
    return { message: "Card reordered." };
  };

  static deleteCard = async (
    req: FastifyRequest<{
      Params: DeleteCardParams;
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.removeCard.execute(p.id, p.columnId, p.boardId, user.id);

    reply.status(204);
  };
}
