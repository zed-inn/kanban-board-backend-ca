import { z } from "zod";
import { pgBoardRepo } from "@interfaces/repo/board.repo";
import { pgUserRepo } from "@interfaces/repo/user.repo";

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
