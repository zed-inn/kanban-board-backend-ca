import { BoardRouter } from "@routes/board/board.route";
import { ZodFastifyInstance } from "@shared/types/zod-fastify";

const routes: Record<string, (router: ZodFastifyInstance) => Promise<void>> = {
  "/board": BoardRouter,
};

const router = async (app: ZodFastifyInstance) => {
  for (const [prefix, route] of Object.entries(routes))
    app.register(route, { prefix });
};

export const AppRouter = router;
