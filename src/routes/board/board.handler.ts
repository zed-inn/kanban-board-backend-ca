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
import { AuthPayloadSchema } from "@shared/schema/auth-payload.schema";
import { GlobalResponseMessage } from "@shared/schema/global-response.schema";
import { kanban, userRepo } from "@config/core";
import { PER_PAGE } from "@constants/pagination";

export class BoardHandler {
  static async getMemberBoards(
    req: FastifyRequest<{ Querystring: GetBoardsQuery }>,
    reply: FastifyReply,
  ): Promise<GetBoardsResponse> {
    const q = req.query;
    const user = AuthPayloadSchema.parse(req.user);

    const res = await kanban.getMemberBoards.execute({
      memberId: user.id,
      pagination: { cursor: q.updatedAt, limit: PER_PAGE.boards },
    });

    reply.status(200);
    return {
      message: "Boards fetched.",
      data: { boards: res.data, nextCursor: res.nextCursor as any },
    };
  }

  static async getOwnedBoards(
    req: FastifyRequest<{ Querystring: GetBoardsQuery }>,
    reply: FastifyReply,
  ): Promise<GetBoardsResponse> {
    const q = req.query;
    const user = AuthPayloadSchema.parse(req.user);

    const res = await kanban.getOwnerBoards.execute({
      ownerId: user.id,
      pagination: { limit: PER_PAGE.boards },
    });

    reply.status(200);
    return {
      message: "Boards fetched.",
      data: { boards: res.data, nextCursor: res.nextCursor as any },
    };
  }

  static async createBoard(
    req: FastifyRequest<{ Body: CreateBoardBody }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.createBoard.execute({ name: b.name, userId: user.id });

    reply.status(201);
    return { message: "Board created." };
  }

  static async updateBoardName(
    req: FastifyRequest<{
      Body: UpdateBoardNameBody;
      Params: UpdateBoardParams;
    }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.renameBoard.execute({
      boardId: p.id,
      memberId: user.id,
      name: b.name,
    });

    reply.status(200);
    return { message: "Board renamed." };
  }

  static async updateBoardOwner(
    req: FastifyRequest<{
      Body: UpdateBoardOwnerBody;
      Params: UpdateBoardParams;
    }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.changeOwnerOfBoard.execute({
      boardId: p.id,
      memberId: b.id,
      ownerId: user.id,
    });

    reply.status(200);
    return { message: "Board owner changed." };
  }

  static async deleteBoard(
    req: FastifyRequest<{ Params: DeleteBoardParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.deleteBoard.execute({ boardId: p.id, userId: user.id });

    reply.status(204);
  }
}

export class BoardMemberHandler {
  static async addMember(
    req: FastifyRequest<{ Body: AddMemberBody; Params: MemberParams }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    const foundUser = await userRepo.getByEmail(b.email);
    await kanban.addMember.execute({
      boardId: p.id,
      memberId: user.id,
      userId: foundUser.id,
    });

    reply.status(201);
    return { message: "Member added." };
  }

  static async removeMember(
    req: FastifyRequest<{ Params: MemberParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.removeMember.execute({ boardId: p.id, memberId: user.id });

    reply.status(204);
  }
}
