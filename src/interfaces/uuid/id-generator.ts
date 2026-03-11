import { v7 } from "uuid";
import { IdGenerator } from "kanban";

export class UUIDGenerator implements IdGenerator {
  async generate(): Promise<string> {
    return v7();
  }
}
