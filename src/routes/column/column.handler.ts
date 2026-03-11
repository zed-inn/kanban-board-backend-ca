import { AuthPayloadSchema } from "@shared/schema/auth-payload.schema";
import { GlobalResponseMessage } from "@shared/schema/global-response.schema";
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
import { kanban } from "@config/core";
import { PER_PAGE } from "@constants/pagination";

export class ColumnHandler {
  static async getColumnsInBoard(
    req: FastifyRequest<{
      Params: GetColumnParams;
      Querystring: GetColumnQuery;
    }>,
    reply: FastifyReply,
  ): Promise<GetColumnResponse> {
    const q = req.query,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    const res = await kanban.getBoardColumns.execute({
      boardId: p.boardId,
      memberId: user.id,
      pagination: { cursor: q.position, limit: PER_PAGE.columns },
    });

    reply.status(200);
    return {
      message: "Columns fetched.",
      data: { columns: res.data, nextCursor: res.nextCursor as any },
    };
  }

  static async addColumn(
    req: FastifyRequest<{ Body: CreateColumnBody; Params: CreateColumnParams }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.addColumn.execute({
      boardId: p.boardId,
      memberId: user.id,
      name: b.name,
    });

    reply.status(201);
    return { message: "Column added." };
  }

  static async updateColumnName(
    req: FastifyRequest<{
      Body: UpdateColumnNameBody;
      Params: UpdateColumnParams;
    }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.renameColumn.execute({
      boardId: p.boardId,
      columnId: p.id,
      memberId: user.id,
      name: b.name,
    });

    reply.status(200);
    return { message: "Column renamed." };
  }

  static async updateColumnPosition(
    req: FastifyRequest<{
      Body: UpdateColumnPositionBody;
      Params: UpdateColumnParams;
    }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.reorderColumn.execute({
      boardId: p.boardId,
      columnId: p.id,
      memberId: user.id,
      targetColumnId: b.id,
    });

    reply.status(200);
    return { message: "Column reordered." };
  }

  static async deleteColumn(
    req: FastifyRequest<{ Params: DeleteColumnParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    await kanban.removeColumn.execute({
      boardId: p.boardId,
      columnId: p.id,
      memberId: user.id,
    });

    reply.status(204);
  }
}
