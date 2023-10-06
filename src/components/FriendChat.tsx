"use client";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey, chatHrefConstructor, cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { FC, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ExtendedFriend extends User {
  lastMessage: Message;
  unseenMessage: boolean;
}
interface FriendChatProps {
  friend: ExtendedFriend;
  sessionId: string;
}

const FriendChat: FC<FriendChatProps> = ({ friend, sessionId }) => {
  const [lastMessage, setLastMessage] = useState<Message>(friend.lastMessage);
  const [unseenMessage, setUnseenMessage] = useState<boolean>(
    friend.unseenMessage
  );

  useEffect(() => {
    const chatId = chatHrefConstructor(sessionId, friend.id);

    const newMessageHandler = (message: Message) => {
      setLastMessage(message);
      setUnseenMessage(true);
    };
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));
    pusherClient.bind("incoming_message", newMessageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));

      pusherClient.unbind("incoming_message", newMessageHandler);
    };
  }, [sessionId, friend]);

  return (
    <div
      key={friend.id}
      className={cn("relative border border-zinc-200 p-3 rounded-md", {
        "bg-zinc-50": !unseenMessage,
        "bg-indigo-50": unseenMessage,
      })}
    >
      <div className="absolute right-4 inset-y-0 flex items-center">
        <ChevronRight className="h-7 w-7 text-zinc-400" />
      </div>

      <Link
        href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
        className="relative sm:flex"
      >
        <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
          <div className="relative h-6 w-6">
            <Image
              referrerPolicy="no-referrer"
              className="rounded-full"
              alt={`${friend.name} profile picture`}
              src={friend.image}
              fill
            />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold">{friend.name}</h4>
          <p className="mt-1 max-w-md">
            <span className="text-zinc-400">
              {lastMessage.senderId === sessionId ? "You: " : ""}
            </span>
            {lastMessage.text}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default FriendChat;
