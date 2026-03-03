import kanban from "@shared/core";
import { AuthPayloadSchema } from "@shared/schema/auth-payload.schema";
import { GlobalResponse } from "@shared/schema/global.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateColumnBody,
  CreateColumnParams,
  DeleteColumnParams,
  UpdateColumnNameBody,
  UpdateColumnParams,
  UpdateColumnPositionBody,
} from "./column.schema";

export class ColumnHandler {
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
