import app from "./fastify-app";
import { SocketData } from "@shared/types/socket";
import { IoServer } from "@shared/services/io-server.service";
import { authenticate } from "@shared/middlewares/socket-authenticate.middleware";

const ioServer = IoServer<SocketData>(app.server, {
  cors: { credentials: true },
});

ioServer.use(authenticate);

export const io = ioServer;
