import { ID } from "@config/constants/db-schema";
import { DefaultEventsMap, ExtendedError, Socket } from "socket.io";

export type SocketData = {
  user?: { id: ID };
};

export type IoSocket<T extends unknown> = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  T
>;

export type SocketNextHandler = (err?: ExtendedError | undefined) => void;
