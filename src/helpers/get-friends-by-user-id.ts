import { fetchRedis } from "./redis";

export async function getFriendsByUserId(userId:string){
    // retrieve friends for current user
    const friendsIds = await fetchRedis('smembers', `user:${userId}:friends`) as string[]

    const friends =  await Promise.all(
        friendsIds.map(async (friendId) => {
            const friend = await fetchRedis('get', `user:${friendId}`) as string

            return JSON.parse(friend)
        })
    )
    return friends
}