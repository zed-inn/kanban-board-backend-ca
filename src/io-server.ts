import app from "@config/app";
import { io } from "@config/io";

export const setupIo = () => {
  io.on("connection", async (socket) => {
    app.log.info(`Socket connected: ${socket.id}`);

    socket.join(`user:${socket.data.uid}`);

    socket.on("disconnect", async () => {
      app.log.info(`Socket disconnected: ${socket.id}`);
    });
  });
};
