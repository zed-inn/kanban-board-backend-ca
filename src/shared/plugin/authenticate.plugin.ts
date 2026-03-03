import { AuthTokenService } from "@shared/services/auth-token.service";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export const authenticate = fp(async (app: FastifyInstance) => {
  app.addHook(
    "preValidation",
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const { access_token } = req.cookies;

        if (access_token) {
          const payload = AuthTokenService.verifyAccessToken(access_token);
          req.user = payload;
          return;
        }
      } catch (error) {
        app.log.error(error);
      }
    },
  );
});
