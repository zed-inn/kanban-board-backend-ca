import { BaseEvent, EventDispatcher } from "kanban";
import { Server } from "socket.io";

export class SocketIoEventDispatcher implements EventDispatcher {
  constructor(private io: Server) {}

  async emit(event: BaseEvent<any>): Promise<void> {
    const eventJson = event.toJSON();

    if (Array.isArray(eventJson.target))
      this.io
        .to(eventJson.target.map((t) => (t.type === "room" ? t.name : t.id.v)))
        .emit(eventJson.name, eventJson.data);
    else
      this.io
        .to(
          eventJson.target.type === "room"
            ? eventJson.target.name
            : eventJson.target.id.v,
        )
        .emit(eventJson.name, eventJson.data);
  }
}
