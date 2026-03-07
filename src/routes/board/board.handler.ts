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
import { PostgresBoardRepository } from "@interfaces/repo/board.repository";
import { db } from "@config/db";
import { PostgresBoardMemberRepository } from "@interfaces/repo/board-member.repository";
import {
  AddMember,
  ChangeOwner,
  CreateBoard,
  DeleteBoard,
  GetMemberBoards,
  GetOwnedBoards,
  RemoveMember,
  RenameBoard,
} from "kanban";
import { GlobalResponse } from "@shared/schema/global.schema";
import { UUIDGenerator } from "@interfaces/utils/id-generator.util";
import { PostgresUnitOfWork } from "@interfaces/utils/unit-of-work.util";
import { PostgresBoardMemberPolicy } from "@interfaces/policies/board-member.policy";
import { IoEventEmitter } from "@interfaces/emitter/event.emitter";
import { io } from "@config/io-server";
import { PostgresUserRepository } from "@interfaces/repo/user.repository";

export class BoardHandler {
  static getBoardsMemberOf = async (
    req: FastifyRequest<{ Querystring: GetBoardsQuery }>,
    reply: FastifyReply,
  ): Promise<GetBoardsResponse> => {
    const q = req.query;
    const user = AuthPayloadSchema.parse(req.user);

    const boardRepo = new PostgresBoardRepository(db, {});
    const memberRepo = new PostgresBoardMemberRepository(db, { page: q.page });

    const getMemberBoards = new GetMemberBoards(boardRepo, memberRepo);
    const boards = await getMemberBoards.execute(user.id);

    reply.status(200);
    return {
      message: "Boards fetched.",
      data: { boards: boards.map((b) => b.attrbs) },
    };
  };

  static getOwnedBoards = async (
    req: FastifyRequest<{ Querystring: GetBoardsQuery }>,
    reply: FastifyReply,
  ): Promise<GetBoardsResponse> => {
    const q = req.query;
    const user = AuthPayloadSchema.parse(req.user);

    const boardRepo = new PostgresBoardRepository(db, { page: q.page });

    const getOwnedBoards = new GetOwnedBoards(boardRepo);
    const boards = await getOwnedBoards.execute(user.id);

    reply.status(200);
    return {
      message: "Boards fetched.",
      data: { boards: boards.map((b) => b.attrbs) },
    };
  };

  static createBoard = async (
    req: FastifyRequest<{ Body: CreateBoardBody }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body;
    const user = AuthPayloadSchema.parse(req.user);

    const boardRepo = new PostgresBoardRepository(db, {});
    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const idGenerator = new UUIDGenerator();
    const unitOfWork = new PostgresUnitOfWork(db, [boardRepo, memberRepo], []);

    const createBoard = new CreateBoard(
      unitOfWork,
      idGenerator,
      boardRepo,
      memberRepo,
    );
    await createBoard.execute(b.name, user.id);

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

    const boardRepo = new PostgresBoardRepository(db, {});
    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const eventemitter = new IoEventEmitter(io);

    const renameBoard = new RenameBoard(
      boardRepo,
      memberRepo,
      memberPolicy,
      eventemitter,
    );
    await renameBoard.execute(p.id, user.id, b.name);

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

    const boardRepo = new PostgresBoardRepository(db, {});
    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const eventemitter = new IoEventEmitter(io);

    const changeOwner = new ChangeOwner(
      boardRepo,
      memberRepo,
      memberPolicy,
      eventemitter,
    );
    await changeOwner.execute(p.id, user.id, b.id);

    reply.status(200);
    return { message: "Board owner changed." };
  };

  static deleteBoard = async (
    req: FastifyRequest<{ Params: DeleteBoardParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    const boardRepo = new PostgresBoardRepository(db, {});
    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const eventemitter = new IoEventEmitter(io);
    const unitOfWork = new PostgresUnitOfWork(db, [boardRepo, memberRepo], []);

    const deleteBoard = new DeleteBoard(
      unitOfWork,
      boardRepo,
      memberRepo,
      eventemitter,
    );
    await deleteBoard.execute(p.id, user.id);

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

    const userRepo = new PostgresUserRepository(db);
    const boardRepo = new PostgresBoardRepository(db, {});
    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const eventEmitter = new IoEventEmitter(io);

    const userToBeJoined = await userRepo.getByEmail(b.email);
    const addMember = new AddMember(
      boardRepo,
      memberRepo,
      memberPolicy,
      eventEmitter,
    );
    await addMember.execute(p.id, user.id, userToBeJoined.id);

    reply.status(201);
    return { message: "Member added." };
  };

  static removeMember = async (
    req: FastifyRequest<{ Params: MemberParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const p = req.params;
    const user = AuthPayloadSchema.parse(req.user);

    const boardRepo = new PostgresBoardRepository(db, {});
    const memberRepo = new PostgresBoardMemberRepository(db, {});
    const memberPolicy = new PostgresBoardMemberPolicy(db);
    const eventEmitter = new IoEventEmitter(io);

    const removeMember = new RemoveMember(
      boardRepo,
      memberRepo,
      memberPolicy,
      eventEmitter,
    );
    await removeMember.execute(p.id, user.id);

    reply.status(204);
  };
}
