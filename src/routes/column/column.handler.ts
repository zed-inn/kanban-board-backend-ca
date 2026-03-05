import { AuthPayloadSchema } from "@shared/schema/auth-payload.schema";
import { GlobalResponse } from "@shared/schema/global.schema";
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
import {
  AddColumn,
  GetBoardColumns,
  RemoveColumn,
  RenameColumn,
  ReorderColumn,
} from "kanban";
import { db } from "@config/db";
import { PostgresColumnRepository } from "@interfaces/repo/column.repository";
import { PostgresBoardMemberPolicy } from "@interfaces/policies/board-member.policy";
import { PostgresBoardMemberRepository } from "@interfaces/repo/board-member.repository";
import { UUIDGenerator } from "@interfaces/utils/id-generator.util";
import { IoEventEmitter } from "@interfaces/emitter/event.emitter";
import { io } from "@config/io-server";
import { PostgresColumnPolicy } from "@interfaces/policies/column.policy";

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

    const columnRepo = new PostgresColumnRepository(db, { page: q.page });
    const memberPolicy = new PostgresBoardMemberPolicy(db);

    const getBoardColumns = new GetBoardColumns(columnRepo, memberPolicy);
    const columns = await getBoardColumns.execute(p.boardId, user.id);

    reply.status(200);
    return {
      message: "Columns fetched.",
      data: { columns: columns.map((c) => c.attrbs) },
    };
  };

  static addColumn = async (
    req: FastifyRequest<{ Body: CreateColumnBody; Params: CreateColumnParams }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body,
      p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const columnRepo = new PostgresColumnRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const idGenerator = new UUIDGenerator();
    const eventEmitter = new IoEventEmitter(io);

    const addColumn = new AddColumn(
      idGenerator,
      memberRepo,
      columnRepo,
      memberPolicy,
      eventEmitter,
    );
    await addColumn.execute(b.name, p.boardId, user.id);

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

    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const columnRepo = new PostgresColumnRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const eventEmitter = new IoEventEmitter(io);

    const renameColumn = new RenameColumn(
      memberRepo,
      columnRepo,
      memberPolicy,
      eventEmitter,
    );
    await renameColumn.execute(p.id, b.name, p.boardId, user.id);

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

    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const columnRepo = new PostgresColumnRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const columnPolicy = new PostgresColumnPolicy(db);
    const eventEmitter = new IoEventEmitter(io);

    const reorderColumn = new ReorderColumn(
      memberRepo,
      columnRepo,
      memberPolicy,
      columnPolicy,
      eventEmitter,
    );
    await reorderColumn.execute(p.id, b.id, p.boardId, user.id);

    reply.status(200);
    return { message: "Column reordered." };
  };

  static deleteColumn = async (
    req: FastifyRequest<{ Params: DeleteColumnParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const columnRepo = new PostgresColumnRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const eventEmitter = new IoEventEmitter(io);

    const removeColumn = new RemoveColumn(
      memberRepo,
      columnRepo,
      memberPolicy,
      eventEmitter,
    );
    await removeColumn.execute(p.id, p.boardId, user.id);

    reply.status(204);
  };
}
