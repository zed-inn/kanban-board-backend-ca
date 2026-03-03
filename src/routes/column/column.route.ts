import { ZodFastifyInstance } from "@shared/types/zod-fastify";
import { ColumnHandler } from "./column.handler";
import {
  CreateColumnBodySchema,
  CreateColumnParamsSchema,
  DeleteColumnParamsSchema,
  UpdateColumnNameBodySchema,
  UpdateColumnParamsSchema,
  UpdateColumnPositionBodySchema,
} from "./column.schema";
import { GlobalResponseSchema } from "@shared/schema/global.schema";
import { RestrictTo } from "@shared/hook/restrict-access.hook";

export const ColumnRouter = async (router: ZodFastifyInstance) => {
  router.post(
    "/",
    {
      schema: {
        body: CreateColumnBodySchema,
        params: CreateColumnParamsSchema,
        response: { 201: GlobalResponseSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    ColumnHandler.addColumn,
  );

  router.patch(
    "/:id/rename",
    {
      schema: {
        body: UpdateColumnNameBodySchema,
        params: UpdateColumnParamsSchema,
        response: { 200: GlobalResponseSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    ColumnHandler.updateColumnName,
  );

  router.patch(
    "/:id/reorder",
    {
      schema: {
        body: UpdateColumnPositionBodySchema,
        params: UpdateColumnParamsSchema,
        response: { 200: GlobalResponseSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    ColumnHandler.updateColumnPosition,
  );

  router.delete(
    "/:id",
    {
      schema: {
        params: DeleteColumnParamsSchema,
        response: { 204: {} },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    ColumnHandler.deleteColumn,
  );
};
