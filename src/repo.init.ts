import { db } from "@config/db";
import { PostgresBoardMemberRepository } from "@interfaces/repo/board-member.repository";
import { PostgresBoardRepository } from "@interfaces/repo/board.repository";
import { PostgresCardRepository } from "@interfaces/repo/card.repository";
import { PostgresColumnRepository } from "@interfaces/repo/column.repository";
import { PostgresUserRepository } from "@interfaces/repo/user.repository";

export const initRepo = async () => {
  const userRepo = new PostgresUserRepository(db);
  const boardRepo = new PostgresBoardRepository(db, {});
  const memberRepo = new PostgresBoardMemberRepository(db, {});
  const columnRepo = new PostgresColumnRepository(db, {});
  const cardRepo = new PostgresCardRepository(db, {});

  await userRepo.initRepo();
  await boardRepo.initRepo();
  await memberRepo.initRepo();
  await columnRepo.initRepo();
  await cardRepo.initRepo();
};
