import app from "./app";
import { IoServer } from "../shared.old/initializer/io.initializer";
import { authenticate } from "../shared.old/io-middleware/authenticate.middleware";
import { SocketData } from "../shared.old/types/socket";

const ioServer = IoServer<SocketData>(app.server, {
  cors: { credentials: true },
});

ioServer.use(authenticate);

export const io = ioServer;
