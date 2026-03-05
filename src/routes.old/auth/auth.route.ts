import { ZodFastifyInstance } from "../../shared/types/zod-fastify";
import { AuthHandler } from "./auth.handler";
import { LoginBodySchema, SignupBodySchema } from "./auth.schema";
import { GlobalResponseSchema } from "../../shared/schema/global.schema";
import { RestrictTo } from "../../shared.old/hook/restrict-access.hook";

export const AuthRouter = async (router: ZodFastifyInstance) => {
  router.post(
    "/login",
    {
      schema: {
        body: LoginBodySchema,
        response: { 200: GlobalResponseSchema },
      },
    },
    AuthHandler.login,
  );

  router.post(
    "/signup",
    {
      schema: {
        body: SignupBodySchema,
        response: { 201: GlobalResponseSchema },
      },
    },
    AuthHandler.signup,
  );

  router.delete(
    "/",
    {
      schema: { response: { 204: {} } },
      preHandler: [RestrictTo.loggedInUser],
    },
    AuthHandler.logout,
  );
};
