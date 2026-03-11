import { ApplicationError } from "kanban";

export class PasswordNotMatchedError extends ApplicationError {
  readonly error = "forbidden";
  readonly code = "PASSWORD_NOT_MATCHED";
  constructor() {
    super("Wrong password.");
  }
}

export class EmailAlreadyUsedError extends ApplicationError {
  readonly error = "conflict";
  readonly code = "EMAIL_ALREADY_USED";
  constructor() {
    super("This email is already used in another account.");
  }
}
