import { FastifyReply, FastifyRequest } from "fastify";
import {
  AddMemberBody,
  CreateBoardBody,
  DeleteBoardParams,
  GetBoardsQuery,
  GetBoardsResponse,
  MemberParams,
  UpdateBoardNameBody,
  UpdateBoardOwnerBody,
  UpdateBoardParams,
} from "./board.schema";
import { AuthPayloadSchema } from "../../shared.old/schema/auth-payload.schema";
import kanban from "../../shared.old/core";
import { GlobalResponse } from "../../shared.old/schema/global.schema";
import { pgBoardRepo } from "../../interfaces.old/repo/board.repo";

export class BoardHandler {
  static getBoardsMemberOf = async (
    req: FastifyRequest<{ Querystring: GetBoardsQuery }>,
    reply: FastifyReply,
  ): Promise<GetBoardsResponse> => {
    const q = req.query;
    const user = AuthPayloadSchema.parse(req.user);

    const boards = await pgBoardRepo.getMemberBoards(user.id, q.page);

    reply.status(200);
    return { message: "Boards fetched.", data: { boards } };
  };

  static getOwnedBoards = async (
    req: FastifyRequest<{ Querystring: GetBoardsQuery }>,
    reply: FastifyReply,
  ): Promise<GetBoardsResponse> => {
    const q = req.query;
    const user = AuthPayloadSchema.parse(req.user);

    const boards = await pgBoardRepo.getOwnerBoards(user.id, q.page);

    reply.status(200);
    return { message: "Boards fetched.", data: { boards } };
  };

  static createBoard = async (
    req: FastifyRequest<{ Body: CreateBoardBody }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.createBoard.execute(b.name, user.id);

    reply.status(201);
    return { message: "Board created." };
  };

  static updateBoardName = async (
    req: FastifyRequest<{
      Body: UpdateBoardNameBody;
      Params: UpdateBoardParams;
    }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.renameBoard.execute(p.id, user.id, b.name);

    reply.status(200);
    return { message: "Board renamed." };
  };

  static updateBoardOwner = async (
    req: FastifyRequest<{
      Body: UpdateBoardOwnerBody;
      Params: UpdateBoardParams;
    }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.changeOwnerOfBoard.execute(p.id, user.id, b.id);

    reply.status(200);
    return { message: "Board owner changed." };
  };

  static deleteBoard = async (
    req: FastifyRequest<{ Params: DeleteBoardParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.deleteBoard.execute(p.id, user.id);

    reply.status(204);
  };
}

export class BoardMemberHandler {
  static addMember = async (
    req: FastifyRequest<{ Body: AddMemberBody; Params: MemberParams }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.addMember.execute(p.id, user.id, b.id);

    reply.status(201);
    return { message: "Member added." };
  };

  static removeMember = async (
    req: FastifyRequest<{ Params: MemberParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.removeMember.execute(p.id, user.id);

    reply.status(204);
  };
}
