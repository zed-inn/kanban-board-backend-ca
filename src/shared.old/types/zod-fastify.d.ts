import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyRequest,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface,
} from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifySchema } from "fastify/types/schema";
import { ResolveFastifyRequestType } from "fastify/types/type-provider";
import { IncomingMessage } from "node:http";

export type ZodFastifyInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export type ZodFastifyRequest<T extends FastifySchema> = FastifyRequest<
  RouteGenericInterface,
  RawServerDefault,
  IncomingMessage,
  T,
  ZodTypeProvider,
  unknown,
  FastifyBaseLogger,
  ResolveFastifyRequestType<ZodTypeProvider, T, RouteGenericInterface>
>;
