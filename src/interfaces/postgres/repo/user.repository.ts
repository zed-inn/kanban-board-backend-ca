import { z } from "zod";
import { PostgresRepository } from "../../../shared/services/postgres/postgres-repo.service";

export const PostgresUserModel = z.object({
  id: z.uuidv7("User Id is required."),
  email: z.email("Valid email is required."),
  passwordHash: z.string("Password is required."),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class PostgresUserRepository extends PostgresRepository {
  protected readonly model = PostgresUserModel;

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
    if (res.none) throw new Error("No user found.");

    return this.parseRow(res.top);
  }

  async save(id: string, email: string, passwordHash: string): Promise<void> {
    const user = this.model
      .pick({ id: true, email: true, passwordHash: true })
      .parse({ id, email, passwordHash });

    await this.client.query(
      "INSERT INTO users(id, email, password_hash) VALUES($1, $2, $3) RETURNING *;",
      [user.id, user.email, user.passwordHash],
    );
  }
}
