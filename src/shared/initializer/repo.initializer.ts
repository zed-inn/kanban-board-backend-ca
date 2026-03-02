import { pgBoardMemberRepo } from "@interfaces/repo/board-members.repo";
import { pgBoardRepo } from "@interfaces/repo/board.repo";
import { pgCardRepo } from "@interfaces/repo/card.repo";
import { pgColumnRepo } from "@interfaces/repo/column.repo";
import { pgUserRepo } from "@interfaces/repo/user.repo";

export const initRepos = async () => {
  await pgUserRepo.init();
  await pgBoardRepo.init();
  await pgBoardMemberRepo.init();
  await pgColumnRepo.init();
  await pgCardRepo.init();
};
