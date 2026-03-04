import kanban from "../../shared.old/core";
import { AuthPayloadSchema } from "../../shared.old/schema/auth-payload.schema";
import { GlobalResponse } from "../../shared.old/schema/global.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateColumnBody,
  CreateColumnParams,
  DeleteColumnParams,
  GetColumnParams,
  GetColumnQuery,
  GetColumnResponse,
  UpdateColumnNameBody,
  UpdateColumnParams,
  UpdateColumnPositionBody,
} from "./column.schema";
import { pgBoardMemberPolicy } from "../../interfaces.old/policy/board-member.policy";
import { pgColumnRepo } from "../../interfaces.old/repo/column.repo";

export class ColumnHandler {
  static getColumnsInBoard = async (
    req: FastifyRequest<{
      Params: GetColumnParams;
      Querystring: GetColumnQuery;
    }>,
    reply: FastifyReply,
  ): Promise<GetColumnResponse> => {
    const q = req.query,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await pgBoardMemberPolicy.ensureMember(user.id, p.boardId);
    const columns = await pgColumnRepo.getInBoard(p.boardId, q.page);

    reply.status(200);
    return { message: "Columns fetched.", data: { columns } };
  };

  static addColumn = async (
    req: FastifyRequest<{ Body: CreateColumnBody; Params: CreateColumnParams }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.addColumn.execute(b.name, p.boardId, user.id);

    reply.status(201);
    return { message: "Column added." };
  };

  static updateColumnName = async (
    req: FastifyRequest<{
      Body: UpdateColumnNameBody;
      Params: UpdateColumnParams;
    }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.renameColumn.execute(p.id, b.name, p.boardId, user.id);

    reply.status(200);
    return { message: "Column renamed." };
  };

  static updateColumnPosition = async (
    req: FastifyRequest<{
      Body: UpdateColumnPositionBody;
      Params: UpdateColumnParams;
    }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.reorderColumn.execute(p.id, b.id, p.boardId, user.id);

    reply.status(200);
    return { message: "Column reordered." };
  };

  static deleteColumn = async (
    req: FastifyRequest<{ Params: DeleteColumnParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.removeColumn.execute(p.id, p.boardId, user.id);

    reply.status(204);
  };
}
