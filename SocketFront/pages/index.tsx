import type { NextPage } from "next";
import { socket } from "@libs/socket";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface IMessage {
  avatar?: string;
  nickName: string;
  data: string;
}

const Home: NextPage = () => {
  const [nickName, setNickName] = useState(1689239904972);
  const [openRooms, setOpenRooms] = useState<number[]>([]);
  const [roomId, setRoomId] = useState<number | null>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [avatar, setAvatar] = useState(" avatar url... ");

  const addMessage = (newMessage: IMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const sendMessage = (message: string) => {
    const payload = JSON.stringify({ data: message, avatar, nickName });
    socket.emit("new_message", payload, roomId);
  };

  const joinRoom = (roomName: number) => {
    socket.emit("join_room", roomName, () => setRoomId(roomName));
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("on Connection");
    });
    socket.on("room_change", (rooms: number[]) => {
      setOpenRooms(rooms);
    });
    socket.on("new_message", (message) => {
      // text message to message object
      const json: IMessage = JSON.parse(message);
      addMessage(json);
    });
    socket.on("welcome", (user) => {
      console.log(user);
    });
    return () => {
      socket.off("connect");
      socket.off("room_change");
      socket.off("welcome");
    };
  }, []);

  return (
    <div className="flex h-screen w-full ">
      {roomId ? (
        <div>
          <span>Hello @{nickName}</span>
          <ul className="">
            {messages?.map((message, index) => (
              <li key={index}>{message.data}</li>
            ))}
          </ul>
          <form className=" fixed w-full ring-4">
            {/*     <input type="text" />
            <button onClick={() => sendMessage("new message")}>
              <button onClick={() => sendMessage("new message")}>
                <Image
                  src={"http://localhost:3000/sendIcon.png"}
                  width={120}
                  height={120}
                  alt="send btn"
                  className="grayscale"
                />
              </button>
            </button> */}
          </form>
        </div>
      ) : (
        <div>
          <button onClick={() => joinRoom(new Date().getTime())}>
            Create Room
          </button>
          <ul>
            {openRooms.map((openRoom, index) => (
              <li key={index}>
                <span>Room. {openRoom}</span>
                <button onClick={() => joinRoom(openRoom)}> join Room </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
