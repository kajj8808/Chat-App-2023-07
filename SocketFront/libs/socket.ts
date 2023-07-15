import { io } from "socket.io-client";

const URL = process.env.SOCKET_SERVER_URL ?? "http://localhost:5000";

export const socket = io(URL, {
  autoConnect: true,
});
