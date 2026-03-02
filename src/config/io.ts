import app from "./app";
import { IoServer } from "@shared/initializer/io.initializer";
import { SocketData } from "@shared/types/socket";

export const io = IoServer<SocketData>(app.server, {
  cors: { credentials: true },
});
