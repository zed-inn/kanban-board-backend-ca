import { GlobalResponse } from "@shared/schema/global.schema";
import bcrypt from "bcryptjs";
import { FastifyReply, FastifyRequest } from "fastify";
import { LoginBody, SignupBody } from "./auth.schema";
import { PostgresUserRepository } from "@interfaces/repo/user.repository";
import { db } from "@config/db";
import { EmailAlreadyUsedError, PasswordNotMatchedError } from "./auth.error";
import { AuthTokenService } from "@shared/services/auth-token.service";
import { env } from "@config/env";
import { UUIDGenerator } from "@interfaces/utils/id-generator.util";

export class AuthHandler {
  private static AUTH_KEY = "access_token";

  static login = async (
    req: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body;

    const userRepo = new PostgresUserRepository(db);

    const user = await userRepo.getByEmail(b.email);

    const passwordMatch = await bcrypt.compare(b.password, user.passwordHash);
    if (!passwordMatch) throw new PasswordNotMatchedError();

    const accessToken = AuthTokenService.createAccessToken({ id: user.id });
    reply.setCookie(this.AUTH_KEY, accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: env.NODE_ENV === "prod",
      maxAge: AuthTokenService.ACCESS_TOKEN_MAX_AGE,
    });

    reply.status(200);
    return { message: "Log in successful, cookies set and returned." };
  };

  static signup = async (
    req: FastifyRequest<{ Body: SignupBody }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body;

    const userRepo = new PostgresUserRepository(db);
    const idGenerator = new UUIDGenerator();

    const userExists = await userRepo.existsByEmail(b.email);
    if (userExists) throw new EmailAlreadyUsedError();

    const userId = await idGenerator.generateUnique();
    const passwordHash = await bcrypt.hash(b.password, 10);
    await userRepo.save(userId, b.email, passwordHash);

    const accessToken = AuthTokenService.createAccessToken({ id: userId });
    reply.setCookie(this.AUTH_KEY, accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: env.NODE_ENV === "prod",
      maxAge: AuthTokenService.ACCESS_TOKEN_MAX_AGE,
    });

    reply.status(201);
    return { message: "Sign up successful, cookies set and returned." };
  };

  static logout = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    reply.clearCookie(this.AUTH_KEY);
    reply.status(204);
  };
}
