import { z } from "zod";
import { UserRepository } from "kanban";
import db from "@config/db";
import { NoUserError } from "@shared/errors/user.error";
import { PostgresDatabaseConn } from "@shared/libs/postgresdb-conn";
import { PoolClient } from "pg";
import { snakeToCamel } from "@shared/utils/snake-to-camel";

export class PostgresUserRepository implements UserRepository {
  private schema = `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUIDV7(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );`;

  public model = z.object({
    id: z.uuidv7("User Id is required."),
    email: z.email("Valid email is required."),
    passwordHash: z.string("Password is required."),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

  constructor(private client: PostgresDatabaseConn | PoolClient) {}

  init = async () => {
    await this.client.query(this.schema);
  };

  existsByEmail = async (email: string) => {
    const res = await this.client.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1;",
      [email],
    );
    return res.rowCount === 0 ? false : true;
  };

  getByEmail = async (email: string) => {
    const res = await this.client.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1;",
      [email],
    );
    if (res.rowCount === 0) throw new NoUserError();

    return this.model.parse(snakeToCamel(res.rows[0]));
  };

  createNew = async (
    id: string,
    email: string,
    passwordHash: string,
  ): Promise<void> => {
    const userAttrbs = this.model
      .pick({ id: true, email: true, passwordHash: true })
      .parse({ id, email, passwordHash });

    await this.client.query(
      "INSERT INTO users(id, email, password_hash) VALUES($1, $2, $3) RETURNING *;",
      [userAttrbs.id, userAttrbs.email, userAttrbs.passwordHash],
    );
  };
}

export const pgUserRepo = new PostgresUserRepository(db);
