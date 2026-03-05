import { EventEmitter } from "kanban";
import { Server } from "socket.io";

export class IoEventEmitter implements EventEmitter {
  constructor(private readonly io: Server) {}

  async emit(event: {
    name: string;
    detail: unknown;
    userIds: string[];
  }): Promise<void> {
    this.io
      .to(event.userIds.map((uid) => `user: ${uid}`))
      .emit(event.name, event.detail);
  }
}
