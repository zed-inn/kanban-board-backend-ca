import { ZodFastifyInstance } from "@shared/types/zod-fastify";
import { AuthHandler } from "./auth.handler";
import { LoginBodySchema, SignupBodySchema } from "./auth.schema";
import { GlobalResponseMessageSchema } from "@shared/schema/global-response.schema";
import { RestrictTo } from "@shared/hooks/restrict-to.hook";

export const AuthRouter = async (router: ZodFastifyInstance) => {
  router.post(
    "/login",
    {
      schema: {
        body: LoginBodySchema,
        response: { 200: GlobalResponseMessageSchema },
      },
    },
    AuthHandler.login,
  );

  router.post(
    "/signup",
    {
      schema: {
        body: SignupBodySchema,
        response: { 201: GlobalResponseMessageSchema },
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
