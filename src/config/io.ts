import app from "./app";
import { IoServer } from "@shared/initializer/io.initializer";
import { authenticate } from "@shared/io-middleware/authenticate.middleware";
import { SocketData } from "@shared/types/socket";

const ioServer = IoServer<SocketData>(app.server, {
  cors: { credentials: true },
});

ioServer.use(authenticate);

export const io = ioServer;
