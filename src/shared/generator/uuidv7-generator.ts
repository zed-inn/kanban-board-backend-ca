import { IdGenerator } from "kanban";
import { v7 as uuidv7 } from "uuid";

export class UUIDV7Generator implements IdGenerator {
  generateUnique = async (): Promise<string> => uuidv7();
}

export const uuidv7Gen = new UUIDV7Generator();
