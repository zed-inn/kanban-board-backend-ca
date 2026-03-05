import { GlobalResponse } from "../../shared/schema/global.schema";
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
import { AuthPayloadSchema } from "../../shared/schema/auth-payload.schema";
import {
  AddCard,
  GetColumnCards,
  RemoveCard,
  ReorderCard,
  UpdateCardBody,
} from "kanban";
import { PostgresCardRepository } from "@interfaces/repo/card.repository";
import { db } from "@config/db";
import { PostgresBoardMemberPolicy } from "@interfaces/policies/board-member.policy";
import { PostgresColumnPolicy } from "@interfaces/policies/column.policy";
import { UUIDGenerator } from "@interfaces/utils/id-generator.util";
import { PostgresBoardMemberRepository } from "@interfaces/repo/board-member.repository";
import { IoEventEmitter } from "@interfaces/emitter/event.emitter";
import { io } from "@config/io-server";
import { PostgresCardPolicy } from "@interfaces/policies/card.policy";

export class CardHandler {
  static getCardsInColumn = async (
    req: FastifyRequest<{ Params: GetCardsParams; Querystring: GetCardsQuery }>,
    reply: FastifyReply,
  ): Promise<GetCardsResponse> => {
    const q = req.query,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    const cardRepo = new PostgresCardRepository(db, { page: q.page });
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const columnPolicy = new PostgresColumnPolicy(db);

    const getCardInColumn = new GetColumnCards(
      cardRepo,
      memberPolicy,
      columnPolicy,
    );
    const cards = await getCardInColumn.execute(p.boardId, p.columnId, user.id);

    reply.status(200);
    return {
      message: "Cards fetched.",
      data: { cards: cards.map((c) => c.attrbs) },
    };
  };

  static addCard = async (
    req: FastifyRequest<{ Body: CreateCardBody; Params: CreateCardParams }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    const idGenerator = new UUIDGenerator();
    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const cardRepo = new PostgresCardRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const columnPolicy = new PostgresColumnPolicy(db);
    const eventEmitter = new IoEventEmitter(io);

    const addCard = new AddCard(
      idGenerator,
      memberRepo,
      cardRepo,
      memberPolicy,
      columnPolicy,
      eventEmitter,
    );
    await addCard.execute(b.title, b.content, p.columnId, p.boardId, user.id);

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

    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const cardRepo = new PostgresCardRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const columnPolicy = new PostgresColumnPolicy(db);
    const eventEmitter = new IoEventEmitter(io);

    const updateCardBody = new UpdateCardBody(
      memberRepo,
      cardRepo,
      memberPolicy,
      columnPolicy,
      eventEmitter,
    );
    await updateCardBody.execute(
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

    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const cardRepo = new PostgresCardRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const columnPolicy = new PostgresColumnPolicy(db);
    const cardPolicy = new PostgresCardPolicy(db);
    const eventEmitter = new IoEventEmitter(io);

    const reorderCard = new ReorderCard(
      memberRepo,
      cardRepo,
      memberPolicy,
      columnPolicy,
      cardPolicy,
      eventEmitter,
    );
    await reorderCard.execute(p.id, b.id, p.columnId, p.boardId, user.id);

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

    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const cardRepo = new PostgresCardRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const columnPolicy = new PostgresColumnPolicy(db);
    const eventEmitter = new IoEventEmitter(io);

    const removeCard = new RemoveCard(
      memberRepo,
      cardRepo,
      memberPolicy,
      columnPolicy,
      eventEmitter,
    );
    await removeCard.execute(p.id, p.columnId, p.boardId, user.id);

    reply.status(204);
  };
}
