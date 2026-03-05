import app from "@config/fastify-app";
import { io } from "@config/io-server";

export const setupIo = () => {
  io.on("connection", async (socket) => {
    app.log.info(`Socket connected: ${socket.id}`);

    if (socket.data.user?.id) socket.join(`user:${socket.data.user.id}`);

    socket.on("disconnect", async () => {
      app.log.info(`Socket disconnected: ${socket.id}`);
    });
  });
};
