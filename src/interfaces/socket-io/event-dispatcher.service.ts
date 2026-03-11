import { BaseEvent, EventDispatcher } from "kanban";
import { Server } from "socket.io";

export class SocketIoEventDispatcher implements EventDispatcher {
  constructor(private ioServer: Server) {}

  async emit(event: BaseEvent<any>): Promise<void> {
    const eventJson = event.toJSON();
  }
}
