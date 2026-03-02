import { DefaultEventsMap, Server } from "socket.io";

export const IoServer = <T extends unknown>(
  ...args: ConstructorParameters<typeof Server>
) => {
  return new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, T>(
    ...args,
  );
};
