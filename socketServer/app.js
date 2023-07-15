import express from "express";
import SocketIO from "socket.io";
import http from "http";

const PORT = 3000;

const app = express();

app.get("/", (_, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.get("/*", (_, res) => {
  res.redirect("/");
});

const httpServer = http.createServer(app);
const ioServer = SocketIO(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const publicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = ioServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

ioServer.on("connection", (socket) => {
  socket.emit("room_change", publicRooms());
  socket.on("join_room", (roomName, func) => {
    socket.join(roomName);
    ioServer
      .to(roomName)
      .emit("welcome", socket.nickname ? socket.nickname : "Anon");
    ioServer.sockets.emit("room_change", publicRooms());
    func();
  });
  socket.on("new_message", (payload, roomName) => {
    ioServer.to(roomName).emit("new_message", payload);
  });
  socket.on("disconnect", () =>
    ioServer.sockets.emit("room_change", publicRooms())
  );
});

const handleListen = () => {
  console.log(`Server is Ready http://localhost:${PORT}`);
};

httpServer.listen(5000, handleListen);
