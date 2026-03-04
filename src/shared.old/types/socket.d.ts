import { DefaultEventsMap, ExtendedError, Socket } from "socket.io";

export type SocketData = {
  user?: { id: string };
};

export type IoSocket<T extends unknown> = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  T
>;

export type SocketNextHandler = (err?: ExtendedError | undefined) => void;
