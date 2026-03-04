import { z } from "zod";
import { pgUserRepo } from "../../interfaces.old/repo/user.repo";

export const UserModel = pgUserRepo.model;
export const PasswordModel = z.string().min(8);

export const LoginBodySchema = UserModel.pick({ email: true }).extend({
  password: PasswordModel,
});
export type LoginBody = z.infer<typeof LoginBodySchema>;

export const SignupBodySchema = UserModel.pick({ email: true }).extend({
  password: PasswordModel,
});
export type SignupBody = z.infer<typeof SignupBodySchema>;
