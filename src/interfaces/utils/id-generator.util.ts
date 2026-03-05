import { v7 } from "uuid";
import { IdGenerator } from "kanban";

export class UUIDGenerator implements IdGenerator {
  async generateUnique(): Promise<string> {
    return v7();
  }
}
