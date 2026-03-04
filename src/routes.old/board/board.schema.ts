import { z } from "zod";
import { pgBoardRepo } from "../../interfaces.old/repo/board.repo";
import { pgUserRepo } from "../../interfaces.old/repo/user.repo";
import {
  GlobalQuerySchema,
  GlobalResponseSchema,
} from "../../shared.old/schema/global.schema";

export const BoardModel = pgBoardRepo.model;
export const UserModel = pgUserRepo.model;

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

export const AddMemberBodySchema = UserModel.pick({ id: true });
export type AddMemberBody = z.infer<typeof AddMemberBodySchema>;

export const MemberParamsSchema = BoardModel.pick({ id: true });
export type MemberParams = z.infer<typeof MemberParamsSchema>;

export const GetBoardsQuerySchema = GlobalQuerySchema.pick({
  page: true,
});
export type GetBoardsQuery = z.infer<typeof GetBoardsQuerySchema>;

export const GetBoardsResponseSchema = GlobalResponseSchema({
  boards: z.array(BoardModel),
});
export type GetBoardsResponse = z.infer<typeof GetBoardsResponseSchema>;
