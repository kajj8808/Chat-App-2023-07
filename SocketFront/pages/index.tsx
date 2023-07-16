import type { NextPage } from "next";
import { socket } from "@libs/socket";
import { ChangeEvent, useEffect, useRef, useState } from "react";
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
  const [showMediaBox, setShowMediaBox] = useState(false);
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

  const goBackHome = () => {
    setRoomId(null);
  };

  const toggleShowMediaBox = () => {
    setShowMediaBox((prev) => !prev);
  };

  const handleChangeFile = (input: ChangeEvent<HTMLInputElement>) => {
    if (input.target.files) {
      const payload = JSON.stringify({
        data: input.target.files[0].name,
        avatar,
        nickName,
      });
      socket.emit("new_message", payload, roomId);
      toggleShowMediaBox();
    }
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
    <div className="flex w-full select-none">
      {roomId ? (
        <div className="w-full">
          <div className="fixed top-0 z-10 flex w-full items-center justify-between bg-[#F7F9FC] py-4 px-4 backdrop-blur-lg">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold hover:bg-[#aebbd4]">
              <span
                className="absolute top-0 cursor-pointer"
                onClick={goBackHome}
              >
                &larr;
              </span>
            </div>
            <span className="text-xl">{roomId}</span>
            <div></div>
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
            <div className="relative mx-auto flex w-full max-w-md items-center sm:max-w-xl">
              <div className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg hover:shadow-xl">
                <span
                  className="absolute -top-[2px] left-[8px] cursor-pointer text-2xl font-bold "
                  onClick={toggleShowMediaBox}
                >
                  +
                </span>
                <div
                  className={cls(
                    "-top-24 left-0 w-28 rounded-md bg-white py-2 px-2 shadow-lg",
                    showMediaBox ? "absolute" : "hidden"
                  )}
                >
                  <div className="py-1">
                    <input
                      type="file"
                      id="file_upload"
                      className="hidden"
                      onChange={handleChangeFile}
                    />
                    <label htmlFor="file_upload" className="text-sm">
                      파일 업로드
                    </label>
                  </div>
                  <div className="border-t py-1">
                    <span className="text-sm">이모지</span>
                  </div>
                </div>
              </div>
              <input
                type="text"
                className="h-12 w-full cursor-pointer break-words rounded-full bg-[#EDF2FC] bg-opacity-70 pl-14 pr-5 placeholder-[#1F1F1F] focus:border-gray-400 focus:bg-white focus:text-black focus:shadow-xl focus:outline-none"
                placeholder={`#${roomId}에 메세지 보내기`}
                {...register("message")}
                autoFocus
                autoComplete="off"
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
