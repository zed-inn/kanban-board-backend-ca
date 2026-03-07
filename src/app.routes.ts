import { ZodFastifyInstance } from "@shared/types/zod-fastify";
import { AuthRouter } from "./routes/auth/auth.route";
import { BoardRouter } from "./routes/board/board.route";
import { ColumnRouter } from "./routes/column/column.route";
import { CardRouter } from "./routes/card/card.route";

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
