import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserRepository } from "kanban";
import db from "@config/db";
import { InvalidPasswordError } from "@shared/errors/user.error";

class PostgresUserRepository implements UserRepository {
  private schema = `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUIDV7(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );`;

  private model = z.object({
    id: z.uuidv7("User Id is required."),
    email: z.email("Valid email is required."),
    passwordHash: z.string("Password is required."),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

  init = async () => {
    await db.query(this.schema);
  };

  createNew = async (
    id: string,
    email: string,
    password: string,
  ): Promise<void> => {
    if (typeof password !== "string" || password.length < 8)
      throw new InvalidPasswordError();

    const passwordHash = await bcrypt.hash(password, 10);

    const userAttrbs = this.model
      .pick({ id: true, email: true, passwordHash: true })
      .parse({ id, email, passwordHash });

    await db.query(
      "INSERT INTO users(id, email, password_hash) VALUES($1, $2, $3) RETURNING *;",
      [userAttrbs.id, userAttrbs.email, userAttrbs.passwordHash],
    );
  };
}

export const pgUserRepo = new PostgresUserRepository();
