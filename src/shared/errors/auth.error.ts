import { ApplicationError } from "kanban";

export class UserNotLoggedInError extends ApplicationError {
  readonly error = "authentication_error";
  readonly code = "NOT_LOGGED_IN";
  constructor() {
    super("Access is not available until requested from a valid account.");
  }
}
