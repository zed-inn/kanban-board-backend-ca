import bcrypt from "bcryptjs";
import { pgUserRepo } from "@interfaces/repo/user.repo";
import { GlobalResponse } from "@shared/schema/global.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import { LoginBody, SignupBody } from "./auth.schema";
import { EmailAlreadyUserError, PasswordNotMatchedError } from "./auth.error";
import { uuidv7Gen } from "@interfaces/utils/uuidv7-generator";
import { AuthPayloadSchema } from "@shared/schema/auth-payload.schema";

export class AuthHandler {
  static login = async (
    req: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body;

    const user = await pgUserRepo.getByEmail(b.email);
    const passwordMatch = await bcrypt.compare(b.password, user.passwordHash);

    if (!passwordMatch) throw new PasswordNotMatchedError();

    // Create token and set in cookies

    reply.status(200);
    return { message: "Log in successfull, cookies set and returned." };
  };

  static signup = async (
    req: FastifyRequest<{ Body: SignupBody }>,
    reply: FastifyReply,
  ): Promise<GlobalResponse> => {
    const b = req.body;

    const userExists = await pgUserRepo.existsByEmail(b.email);
    if (userExists) throw new EmailAlreadyUserError();

    const passwordHash = await bcrypt.hash(b.password, 10);

    const userId = await uuidv7Gen.generateUnique();
    await pgUserRepo.createNew(userId, b.email, passwordHash);

    // Create token and set in cookies

    reply.status(201);
    return { message: "Sign up successfull, cookies set and returned." };
  };

  static logout = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const user = AuthPayloadSchema.parse(req.user);

    // Delete token and remove from cookies

    reply.status(204);
  };
}
