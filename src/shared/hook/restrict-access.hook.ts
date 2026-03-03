import { UserNotLoggedInError } from "@shared/errors/auth.error";
import { FastifyRequest } from "fastify";

export class RestrictTo {
  static loggedInUser = async <T extends FastifyRequest>(req: T) => {
    if (!req.user) throw new UserNotLoggedInError();
  };
}
