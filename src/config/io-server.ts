import app from "@config/fastify-app";
import { SocketData } from "@shared/types/socket";
import { IoServer } from "@socket-io/io-server.service";
import { authenticate } from "@shared/middlewares/authenticate-socket";

const ioServer = IoServer<SocketData>(app.server, {
  cors: { credentials: true },
});

ioServer.use(authenticate);

export const io = ioServer;
