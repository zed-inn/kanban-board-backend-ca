import { io } from "../../config.old/io";
import { SocketEventEmitter } from "../../interfaces.old/emitter/event-emitter";

export const socketEventEmitter = new SocketEventEmitter(io);
