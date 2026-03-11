import { ZodFastifyInstance } from "@shared/types/zod-fastify";
import { AuthRouter } from "./auth/auth.route";
import { BoardRouter } from "./board/board.route";
import { ColumnRouter } from "./column/column.route";
import { CardRouter } from "./card/card.route";

const routes: Record<string, (router: ZodFastifyInstance) => Promise<void>> = {
  "/auth": AuthRouter,
  "/board": BoardRouter,
  "/board/:boardId/column": ColumnRouter,
  "/board/:boardId/column/:columnId/card": CardRouter,
};

const router = async (app: ZodFastifyInstance) => {
  for (const [prefix, route] of Object.entries(routes))
    app.register(route, { prefix });
};

export const AppRouter = router;
