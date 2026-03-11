import { z } from "zod";
import { PostgresUserModel as UserModel } from "@postgres/repo/user.repository";

export const PasswordModel = z.string().min(8);

export const LoginBodySchema = UserModel.pick({ email: true }).extend({
  password: PasswordModel,
});
export type LoginBody = z.infer<typeof LoginBodySchema>;

export const SignupBodySchema = UserModel.pick({ email: true }).extend({
  password: PasswordModel,
});
export type SignupBody = z.infer<typeof SignupBodySchema>;
