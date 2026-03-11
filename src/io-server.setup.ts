import { memberRepo } from "@config/core";
import app from "@config/fastify-app";
import { io } from "@config/io-server";
import { BoardMembership } from "kanban";

export const setupIo = () => {
  io.on("connection", async (socket) => {
    app.log.info(`Socket connected: ${socket.id}`);

    if (socket.data.user?.id) socket.join(`user:${socket.data.user.id}`);

    socket.on("join_board", async (boardId: string) => {
      if (socket.data.user?.id) {
        const isMember = await memberRepo.exists(
          new BoardMembership({ boardId, memberId: socket.data.user.id }),
        );

        if (isMember) socket.join(`board:${boardId.trim()}`);
      }
    });

    socket.on("disconnect", async () => {
      app.log.info(`Socket disconnected: ${socket.id}`);
    });
  });
};
