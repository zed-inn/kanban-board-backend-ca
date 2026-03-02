import { Server } from "socket.io";
import app from "./app";

export const io = new Server(app.server, { cors: { credentials: true } });

