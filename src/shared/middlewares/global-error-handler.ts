import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ApplicationError } from "kanban";

export const globalErrorHandler = (
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if ("validation" in error) {
    request.log.warn(`Validation Error: ${error.message}`);
    return reply.status(400).send({
      error: "bad_request",
      code: "VALIDATION_ERROR",
      message: error.message,
      details: error.validation,
    });
  }

  const isDomainError =
    error instanceof ApplicationError ||
    (typeof error === "object" && error !== null && "error" in error);

  if (isDomainError) {
    const err = error as any;
    const category = err.error as string;
    const code = err.code || "UNKNOWN_DOMAIN_ERROR";
    const message = err.message || "An application error occurred.";

    let statusCode = 400;

    switch (category) {
      case "not_found":
        statusCode = 404;
        break;
      case "forbidden":
      case "authentication_error":
        statusCode = 403;
        break;
      case "conflict":
        statusCode = 409;
        break;
      case "validation_error":
      case "invalid_action":
        statusCode = 400;
        break;
      case "database_error":
        statusCode = 500;
        break;
    }

    if (statusCode >= 500) {
      request.log.error(error, `[${code}] ${message}`);
    } else {
      request.log.warn(`[${code}] ${message}`);
    }

    return reply.status(statusCode).send({
      error: category,
      code: code,
      message: message,
    });
  }

  request.log.error(error);
  return reply.status(500).send({
    error: "internal_server_error",
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
  });
};
