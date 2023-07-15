import type { NextPage } from "next";
import { socket } from "@libs/socket";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cls } from "@libs/utiles";
import { useForm } from "react-hook-form";
import Message from "@components/Message";

interface IMessage {
  avatar?: string;
  nickName: string;
  data: string;
}

interface EnterForm {
  message: string;
}

const Home: NextPage = () => {
  const [nickName, setNickName] = useState(new Date().getTime());
  const [openRooms, setOpenRooms] = useState<number[]>([]);
  const [roomId, setRoomId] = useState<number | null>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [avatar, setAvatar] = useState(" avatar url... ");
  const { register, handleSubmit, reset } = useForm<EnterForm>();

  const messageBoxScrollRef = useRef<HTMLUListElement>(null);

  const addMessage = (newMessage: IMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const sendMessage = (message: string) => {
    const payload = JSON.stringify({ data: message, avatar, nickName });
    socket.emit("new_message", payload, roomId);
  };

  const onValid = (validFormData: EnterForm) => {
    const { message } = validFormData;
    sendMessage(message);
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
    socket.disconnect();
    socket.connect();
    return () => {
      socket.off("connect");
      socket.off("room_change");
      socket.off("new_message");
      socket.off("welcome");
    };
  }, []);

  useEffect(() => {
    if (messages.length) {
      messageBoxScrollRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages.length]);

  return (
    <div className="flex w-full">
      {roomId ? (
        <div className="w-full">
          <div className="fixed top-0 z-10 w-full bg-[#F7F9FC] py-6 px-6 backdrop-blur-lg">
            <span className="text-xl">🏠{roomId}</span>
            <span></span>
          </div>
          <ul
            className="relative mt-24 mb-6 flex h-full w-full flex-col gap-5 overflow-y-scroll px-5 scrollbar-hide "
            ref={messageBoxScrollRef}
          >
            {messages?.map((message, index) => (
              <Message
                key={index}
                msg={message.data}
                nickName={message.nickName}
                reversed={nickName + "" == message.nickName}
              />
            ))}
          </ul>
          <form
            className="fixed inset-x-0 bottom-0 bg-[#F7F9FC] py-8"
            onSubmit={handleSubmit(onValid)}
          >
            <div className="relative mx-auto flex w-full max-w-lg items-center">
              <span></span>
              <input
                type="text"
                className="h-12 w-full rounded-full bg-[#EDF2FC] bg-opacity-70 pl-6 placeholder-[#1F1F1F] focus:border-gray-400 focus:bg-white focus:text-black focus:shadow-xl focus:outline-none"
                placeholder={`#${roomId}에 메세지 보내기`}
                {...register("message")}
              />
            </div>
          </form>
        </div>
      ) : (
        <div className="px-6 py-5">
          <button
            onClick={() => joinRoom(new Date().getTime())}
            className="absolute bottom-6 right-5 rounded-md bg-blue-700 px-4 py-2 text-white"
          >
            Create Room
          </button>
          <h2 className="mb-2 text-lg font-bold">Open Rooms</h2>
          <ul className="">
            {openRooms.map((openRoom, index) => (
              <li
                key={index}
                className="flex flex-col items-center gap-5 rounded-lg bg-[#EDF2FC] px-6 py-4"
              >
                <h3 className="text-center text-sm">🏠 {openRoom}</h3>
                <button
                  onClick={() => joinRoom(openRoom)}
                  className="w-auto rounded-md bg-yellow-200 px-6 py-1.5 text-sm font-bold"
                >
                  join Room
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
