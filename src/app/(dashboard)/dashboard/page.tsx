import FriendChatList from "@/components/FriendChatList";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

const page = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const friends = await getFriendsByUserId(session.user.id);

  const friendsWithLastMessage =
    friends.length > 0
      ? await Promise.all(
          friends.map(async (friend) => {
            const [lastMessageRaw] = (await fetchRedis(
              "zrange",
              `chat:${chatHrefConstructor(
                session.user.id,
                friend.id
              )}:messages`,
              -1,
              -1
            )) as string[];

            if (lastMessageRaw === undefined) {
              return {
                ...friend,
                lastMessage: null,
              };
            }

            const lastMessage = JSON.parse(lastMessageRaw) as Message;

            return {
              ...friend,
              unseenMessage: false,
              lastMessage,
            };
          })
        )
      : [];

  const friendsWithActiveChats = friendsWithLastMessage.filter(
    (friend) => friend.lastMessage !== null
  );

  return (
    <div className="container py-12">
      <h1 className="font-bold text-5xl mb-8">Recent chats</h1>
      <FriendChatList
        sessionId={session.user.id}
        friends={friendsWithActiveChats}
      />
    </div>
  );
};

export default page;
