import { BoardId, EventTarget, EventTargetFactory, UserId } from "kanban";

export class SocketIoEventTargetFactory implements EventTargetFactory {
  viaBoardId(boardId: BoardId): EventTarget {
    return { type: "room", name: `board:${boardId.v}` };
  }

  viaUserId(userId: UserId): EventTarget {
    return { type: "user", id: userId };
  }

  viaBoardIdExcluding(boardId: BoardId, userIds: UserId[]): EventTarget {
    return { type: "room", name: `board:${boardId.v}`, exclude: userIds };
  }
}
