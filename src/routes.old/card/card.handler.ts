import { GlobalResponse } from "../../shared.old/schema/global.schema";
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
import { AuthPayloadSchema } from "../../shared.old/schema/auth-payload.schema";
import kanban from "../../shared.old/core";
import { pgCardRepo } from "../../interfaces.old/repo/card.repo";
import { pgBoardMemberPolicy } from "../../interfaces.old/policy/board-member.policy";
import { pgColumnPolicy } from "../../interfaces.old/policy/column.policy";

export class CardHandler {
  static getCardsInColumn = async (
    req: FastifyRequest<{ Params: GetCardsParams; Querystring: GetCardsQuery }>,
    reply: FastifyReply,
  ): Promise<GetCardsResponse> => {
    const q = req.query,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await pgBoardMemberPolicy.ensureMember(user.id, p.boardId);
    await pgColumnPolicy.ensureColumnInBoard(p.columnId, p.boardId);
    const cards = await pgCardRepo.getInColumn(p.columnId, q.page);

    reply.status(200);
    return { message: "Cards fetched.", data: { cards } };
  };

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
