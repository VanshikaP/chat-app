"use client";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { FC, useEffect, useState } from "react";
import FriendChat from "./FriendChat";

interface FriendChatListProps {
  sessionId: string;
  friends: ExtendedFriend[];
}

interface ExtendedFriend extends User {
  lastMessage: Message;
  unseenMessage: boolean;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
  senderEmail: string;
}

const FriendChatList: FC<FriendChatListProps> = ({ sessionId, friends }) => {
  const [friendsWithActiveChats, setFriendsWithActiveChats] =
    useState<ExtendedFriend[]>(friends);
  useEffect(() => {
    const newChatHandler = (message: ExtendedMessage) => {
      const friendIds = friendsWithActiveChats.map((friend) => friend.id);
      const messageFromExistingFriend = friendIds.includes(message.senderId);

      if (!messageFromExistingFriend) {
        const newFriend = {
          id: message.senderId,
          name: message.senderName,
          image: message.senderImg,
          email: message.senderEmail,
          lastMessage: message,
          unseenMessage: true,
        };
        setFriendsWithActiveChats((prev) => [newFriend, ...prev]);
      }
    };

    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.bind("new_message", newChatHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));

      pusherClient.unbind("new_message", newChatHandler);
    };
  }, [sessionId]);
  return (
    <>
      {friendsWithActiveChats.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        <div id="check">
          {friendsWithActiveChats.map((friend) => (
            <FriendChat key={friend.id} friend={friend} sessionId={sessionId} />
          ))}
        </div>
      )}
    </>
  );
};

export default FriendChatList;
