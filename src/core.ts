import { Application } from "kanban";
import { pgBoardRepo } from "@interfaces/repo/board.repo";
import { pgBoardMemberRepo } from "@interfaces/repo/board-members.repo";
import { pgColumnRepo } from "@interfaces/repo/column.repo";
import { pgCardRepo } from "@interfaces/repo/card.repo";
import { pgBoardMemberPolicy } from "@interfaces/policy/board-member.policy";
import { pgCardPolicy } from "@interfaces/policy/card.policy";
import { pgUow } from "@interfaces/utils/unit-of-work";
import { uuidv7Gen } from "@shared/generator/uuidv7-generator";
import { socketEventEmitter } from "@interfaces/emitter/event-emitter";
import { pgColumnPolicy } from "@interfaces/policy/column.policy";

const kanban = new Application(
  uuidv7Gen,
  pgUow,
  pgBoardRepo,
  pgBoardMemberRepo,
  pgColumnRepo,
  pgCardRepo,
  pgBoardMemberPolicy,
  pgColumnPolicy,
  pgCardPolicy,
  socketEventEmitter,
);

export default kanban;
