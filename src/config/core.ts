import { PostgresUnitOfWork } from "@postgres/services/pg-uow.service";
import { UUIDGenerator } from "@uuid/id-generator";
import { Kanban } from "kanban";
import { db } from "./db";
import { PostgresBoardRepository } from "@postgres/repo/board.repository";
import { PostgresBoardMemberRepository } from "@postgres/repo/member.repository";
import { PostgresColumnRepository } from "@postgres/repo/column.repository";
import { PostgresCardRepository } from "@postgres/repo/card.repository";
import { PostgresBoardQuery } from "@postgres/queries/board.query";
import { PostgresColumnQuery } from "@postgres/queries/column.query";
import { PostgresCardQuery } from "@postgres/queries/card.query";
import { SocketIoEventTargetFactory } from "@socket-io/event-target-factory.service";
import { SocketIoEventDispatcher } from "@socket-io/event-dispatcher.service";
import { io } from "./io-server";
import { PostgresUserRepository } from "@postgres/repo/user.repository";

export const idGenerator = new UUIDGenerator();

export const unitOfWork = new PostgresUnitOfWork(db);
export const userRepo = new PostgresUserRepository(db);
export const boardRepo = new PostgresBoardRepository(db);
export const memberRepo = new PostgresBoardMemberRepository(db);
export const columnRepo = new PostgresColumnRepository(db);
export const cardRepo = new PostgresCardRepository(db);
export const boardQuery = new PostgresBoardQuery(db);
export const columnQuery = new PostgresColumnQuery(db);
export const cardQuery = new PostgresCardQuery(db);

export const eventTargetFactory = new SocketIoEventTargetFactory();
export const eventDispatcher = new SocketIoEventDispatcher(io);

export const kanban = new Kanban(
  idGenerator,
  unitOfWork,
  boardRepo,
  memberRepo,
  columnRepo,
  cardRepo,
  boardQuery,
  columnQuery,
  cardQuery,
  eventTargetFactory,
  eventDispatcher,
);
