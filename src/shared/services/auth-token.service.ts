import { env } from "@config/env";
import { AuthPayload, AuthPayloadSchema } from "../schema/auth-payload.schema";
import jwt from "jsonwebtoken";

export class AuthTokenService {
  static ACCESS_TOKEN_MAX_AGE = 1 * 24 * 60 * 60 * 1000; // 1 day

  static createAccessToken = (data: AuthPayload) => {
    return jwt.sign(data, env.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_MAX_AGE,
    });
  };

  static verifyAccessToken = (token: string) => {
    return AuthPayloadSchema.parse(jwt.verify(token, env.JWT_SECRET));
  };
}
