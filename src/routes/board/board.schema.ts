import { z } from "zod";
import { PostgresBoardModel as BoardModel } from "@postgres/repo/board.repository";
import { PostgresUserModel as UserModel } from "@postgres/repo/user.repository";
import { GlobalResponseSchemaWithData } from "@shared/schema/global-response.schema";
import { BoardReadModel } from "kanban";

export const CreateBoardBodySchema = BoardModel.pick({ name: true });
export type CreateBoardBody = z.infer<typeof CreateBoardBodySchema>;

export const UpdateBoardNameBodySchema = BoardModel.pick({ name: true });
export type UpdateBoardNameBody = z.infer<typeof UpdateBoardNameBodySchema>;

export const UpdateBoardOwnerBodySchema = UserModel.pick({ id: true });
export type UpdateBoardOwnerBody = z.infer<typeof UpdateBoardOwnerBodySchema>;

export const UpdateBoardParamsSchema = BoardModel.pick({ id: true });
export type UpdateBoardParams = z.infer<typeof UpdateBoardParamsSchema>;

export const DeleteBoardParamsSchema = BoardModel.pick({ id: true });
export type DeleteBoardParams = z.infer<typeof DeleteBoardParamsSchema>;

export const AddMemberBodySchema = UserModel.pick({ email: true });
export type AddMemberBody = z.infer<typeof AddMemberBodySchema>;

export const MemberParamsSchema = BoardModel.pick({ id: true });
export type MemberParams = z.infer<typeof MemberParamsSchema>;

export const GetBoardsQuerySchema = BoardModel.pick({
  updatedAt: true,
}).partial();
export type GetBoardsQuery = z.infer<typeof GetBoardsQuerySchema>;

export const GetBoardsResponseSchema = GlobalResponseSchemaWithData({
  boards: z.array(BoardModel),
  nextCursor: BoardModel.shape.updatedAt,
});
export type GetBoardsResponse = z.infer<typeof GetBoardsResponseSchema>;
