import fastifyCookie from "@fastify/cookie";
import { UserNotLoggedInError } from "@shared/errors/auth.error";
import { AuthPayloadSchema } from "@shared/schema/auth-payload.schema";
import { AuthTokenService } from "@shared/services/auth/auth-token.service";
import { IoSocket, SocketData, SocketNextHandler } from "@shared/types/socket";

export const authenticate = (
  socket: IoSocket<SocketData>,
  next: SocketNextHandler,
) => {
  try {
    const cookies = socket.request.headers.cookie;
    if (!cookies) throw new Error();

    const token = fastifyCookie.parse(cookies).access_token;
    const user = token ? AuthTokenService.verifyAccessToken(token) : null;

    socket.data.user = AuthPayloadSchema.parse(user);
    next();
  } catch {
    next(new UserNotLoggedInError());
  }
};
