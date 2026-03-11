import bcrypt from "bcryptjs";
import { FastifyReply, FastifyRequest } from "fastify";
import { LoginBody, SignupBody } from "./auth.schema";
import { GlobalResponseMessage } from "@shared/schema/global-response.schema";
import { idGenerator, userRepo } from "@config/core";
import { EmailAlreadyUsedError, PasswordNotMatchedError } from "./auth.error";
import { AuthTokenService } from "@shared/services/auth/auth-token.service";
import { CookieSerializeOptions } from "@fastify/cookie";
import { env } from "@config/env";

export class AuthHandler {
  private static AUTH_KEY = "access_token";

  static async login(
    req: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body;

    const user = await userRepo.getByEmail(b.email);

    const passwordMatch = await bcrypt.compare(b.password, user.passwordHash);
    if (!passwordMatch) throw new PasswordNotMatchedError();

    const cs = AuthService.getCookieSetup(user.id);
    reply.setCookie(this.AUTH_KEY, cs.accessToken, cs.cookieOptions);

    reply.status(200);
    return { message: "Log in successful, cookies set and returned." };
  }

  static async signup(
    req: FastifyRequest<{ Body: SignupBody }>,
    reply: FastifyReply,
  ): Promise<GlobalResponseMessage> {
    const b = req.body;

    const userExists = await userRepo.existsByEmail(b.email);
    if (userExists) throw new EmailAlreadyUsedError();

    const userId = await idGenerator.generate();
    const passwordHash = await bcrypt.hash(b.password, 10);
    await userRepo.save(userId, b.email, passwordHash);

    const cs = AuthService.getCookieSetup(userId);
    reply.setCookie(this.AUTH_KEY, cs.accessToken, cs.cookieOptions);

    reply.status(201);
    return { message: "Sign up successful, cookies set and returned." };
  }

  static async logout(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.clearCookie(this.AUTH_KEY);
    reply.status(204);
  }
}

export class AuthService {
  static getCookieSetup(id: string) {
    const accessToken = AuthTokenService.createAccessToken({ id });
    const cookieOptions: CookieSerializeOptions = {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: env.NODE_ENV === "prod",
      maxAge: AuthTokenService.ACCESS_TOKEN_MAX_AGE,
    };
    return { accessToken, cookieOptions };
  }
}
