import { pgBoardMemberRepo } from "../../interfaces.old/repo/board-members.repo";
import { pgBoardRepo } from "../../interfaces.old/repo/board.repo";
import { pgCardRepo } from "../../interfaces.old/repo/card.repo";
import { pgColumnRepo } from "../../interfaces.old/repo/column.repo";
import { pgUserRepo } from "../../interfaces.old/repo/user.repo";

export const initRepos = async () => {
  await pgUserRepo.init();
  await pgBoardRepo.init();
  await pgBoardMemberRepo.init();
  await pgColumnRepo.init();
  await pgCardRepo.init();
};
