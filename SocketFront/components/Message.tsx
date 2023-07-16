import { cls } from "@libs/utiles";

interface IMessage {
  nickName: string;
  msg: string;
  reversed?: boolean;
  avatar?: string;
}

export default function Message({ nickName, msg, reversed, avatar }: IMessage) {
  return (
    <li
      className={cls(
        "flex items-start gap-4",
        reversed ? "flex-row-reverse space-x-reverse" : ""
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
        <span>{avatar ? "" : "🍿"}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className={cls("text-sm font-bold", reversed ? "text-right" : "")}>
          {nickName}
        </h3>
        <div className={cls("flex", reversed ? "flex-row-reverse" : "")}>
          <span
            className={cls(
              "max-w-lg break-words bg-[#EDF2FC] py-2 px-3",
              reversed
                ? "rounded-l-xl rounded-br-2xl text-right"
                : "rounded-r-xl rounded-bl-xl text-left"
            )}
          >
            {msg}
          </span>
        </div>
      </div>
    </li>
  );
}
