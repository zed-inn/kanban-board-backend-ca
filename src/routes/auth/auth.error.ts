export class PasswordNotMatchedError extends Error {
  message: string = "PASSWORD_NOT_MATCHED";
}

export class EmailAlreadyUsedError extends Error {
  message: string = "EMAIL_ALREADY_USED";
}
