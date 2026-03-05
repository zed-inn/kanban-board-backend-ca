import { z } from "zod";
import { NoUserError, UserRepository } from "kanban";
import { PostgresRepository } from "@shared/services/postgres-repo.service";

export const UserModel = z.object({
  id: z.uuidv7("User Id is required."),
  email: z.email("Valid email is required."),
  passwordHash: z.string("Password is required."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PostgresUserRepository
  extends PostgresRepository
  implements UserRepository
{
  protected readonly model = UserModel;
  protected readonly repoSchema: string = `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY UNIQUE NOT NULL DEFAULT UUIDV7(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);`;

  private readonly parseRow = (r: any) =>
    this.model.parse(this.utils.camelize(r));

  async existsByEmail(email: string) {
    return !(
      await this.client.query("SELECT * FROM users WHERE email = $1 LIMIT 1;", [
        email,
      ])
    ).none;
  }

  async getByEmail(email: string) {
    const res = await this.client.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1;",
      [email],
    );
    if (res.none) throw new NoUserError();

    return this.parseRow(res.top);
  }

  async save(id: string, email: string, passwordHash: string): Promise<void> {
    const userAttrbs = this.model
      .pick({ id: true, email: true, passwordHash: true })
      .parse({ id, email, passwordHash });

    await this.client.query(
      "INSERT INTO users(id, email, password_hash) VALUES($1, $2, $3) RETURNING *;",
      [userAttrbs.id, userAttrbs.email, userAttrbs.passwordHash],
    );
  }
}
