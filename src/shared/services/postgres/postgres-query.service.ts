import { QueryResult } from "pg";

export class PostgresDatabaseQueryResult {
  protected readonly rowCount: number;

  constructor(protected readonly res: QueryResult<any>) {
    this.rowCount = this.res.rowCount ?? 0;
  }

  public get rows() {
    return this.res.rows;
  }

  public get none() {
    return this.rowCount === 0;
  }

  public get top() {
    return this.rows[0];
  }

  public get bottom() {
    return this.rows[this.rowCount - 1];
  }
}
