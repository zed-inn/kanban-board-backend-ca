import { IdGenerator } from "kanban";
import { v7 as uuidv7 } from "uuid";

export class UUIDGenerator implements IdGenerator {
  generateUnique = async (): Promise<string> => uuidv7();
}
