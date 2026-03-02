import { io } from "@config/io";
import { EventEmitter } from "kanban";
import { Server } from "socket.io";

export class SocketEventEmitter implements EventEmitter {
  constructor(private io: Server) {}

  emit = async (event: {
    name: string;
    detail: unknown;
    userIds: string[];
  }): Promise<void> => {
    const uIdRooms = event.userIds.map((u) => `user:${u}`);
    this.io.to(uIdRooms).emit(event.name, event.detail);
  };
}

export const socketEventEmitter = new SocketEventEmitter(io);
