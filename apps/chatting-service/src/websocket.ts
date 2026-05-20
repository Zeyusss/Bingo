import redis from "@packages/libs/redis";
import { Server as HttpServer } from "http";
import { kafka } from "@packages/utils/kafka";
import prisma from "@packages/libs/prisma";
import { verifyAccessToken } from "@packages/middleware/verify-access-token";
import { WebSocketServer, WebSocket } from "ws";

const producer = kafka.producer();
const connectedUsers: Map<string, WebSocket> = new Map();
const unseenCounts: Map<string, number> = new Map();

type IncomingMessage = {
  type?: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
};

export async function createWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });
  await producer.connect();
  console.log("kafka producer connected");
  wss.on("connection", (ws: WebSocket, request) => {
    console.log("New Websocket connection");

    let decoded;
    try {
      decoded = verifyAccessToken(
        request.headers.cookie,
        request.headers.authorization as string
      );
    } catch {
      ws.close(4001, "Unauthorized");
      return;
    }

    const rawUserId = decoded.id;
    const registeredUserId =
      decoded.role === "seller"
        ? `seller_${decoded.id}`
        : `user_${decoded.id}`;

    connectedUsers.set(registeredUserId, ws);
    console.log(`registered websocket for userId:${registeredUserId}`);

    const isSeller = decoded.role === "seller";
    const redisKey = isSeller
      ? `online:seller:${rawUserId}`
      : `online:user:${rawUserId}`;
    void (async () => {
      await redis.set(redisKey, "1");
      await redis.expire(redisKey, 300);

      const statusMessage = JSON.stringify({
        type: isSeller ? "SELLER_ONLINE_STATUS" : "USER_ONLINE_STATUS",
        payload: {
          userId: rawUserId,
          isOnline: true,
        },
      });

      connectedUsers.forEach((socket, userId) => {
        if (socket.readyState === WebSocket.OPEN && userId !== registeredUserId) {
          socket.send(statusMessage);
        }
      });
    })();

    const ttlInterval = setInterval(async () => {
      try {
        await redis.expire(redisKey, 300);
      } catch {
        // ignore — socket close will clean up
      }
    }, 60000);

    ws.on("message", async (rawMessage) => {
      try {
        const messageStr = rawMessage.toString();
        const data: IncomingMessage = JSON.parse(messageStr);

        if (data.type === "MARK_AS_SEEN") {
          if (!data.conversationId) return;

          const conversation = await prisma.conversationGroup.findUnique({
            where: { id: data.conversationId },
          });
          if (!conversation) return;
          if (!conversation.participantIds.includes(rawUserId)) return;

          const seenKey = `${registeredUserId}_${data.conversationId}`;
          unseenCounts.set(seenKey, 0);

          // Also clear from Redis permanently
          const receiverType = isSeller ? "seller" : "user";
          const redisKey = `unseen:${receiverType}_${data.conversationId}`;
          await redis.del(redisKey);

          return;
        }

        const { toUserId, messageBody, conversationId } = data;
        const senderType = decoded.role;
        if (!data || !toUserId || !messageBody || !conversationId) {
          console.warn("Invalid message format :", data);
          return;
        }
        const now = new Date().toISOString();
        const messagePayload = {
          conversationId,
          senderId: rawUserId,
          senderType,
          content: messageBody,
          createdAt: now,
        };

        const messageEvent = JSON.stringify({
          type: "NEW_MESSAGE",
          payload: messagePayload,
        });

        const receiverKey =
          senderType === "user" ? `seller_${toUserId}` : `user_${toUserId}`;
        const senderKey =
          senderType === "user" ? `user_${rawUserId}` : `seller_${rawUserId}`;

        const unseenKey = `${receiverKey}_${conversationId}`;
        const prevCount = unseenCounts.get(unseenKey) || 0;
        unseenCounts.set(unseenKey, prevCount + 1);

        // Also increment in Redis
        const receiverType = senderType === "user" ? "seller" : "user";
        const redisKey = `unseen:${receiverType}_${conversationId}`;
        await redis.incr(redisKey);

        const receiverSocket = connectedUsers.get(receiverKey);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(messageEvent);

          receiverSocket.send(
            JSON.stringify({
              type: "UNSEEN_COUNT_UPDATE",
              payload: {
                conversationId,
                count: prevCount + 1,
              },
            })
          );

          console.log(`Delivered message + unseen count to ${receiverKey}`);
        } else {
          console.log(`User ${receiverKey} is offline. Message queued.`);
        }

        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          console.log(`Echoed message to sender ${senderKey}`);
        }

        await producer.send({
          topic: "chat.new_message",
          messages: [
            {
              key: conversationId,
              value: JSON.stringify(messagePayload),
            },
          ],
        });
        console.log(`message queued to kafka: ${conversationId}`);
      } catch (error) {
        console.error("Error processing WebSocket message :", error);
      }
    });

    ws.on("close", async () => {
      clearInterval(ttlInterval);
      connectedUsers.delete(registeredUserId);
      console.log(`Disconnected user ${registeredUserId}`);
      await redis.del(redisKey);

      if (decoded.role === "seller") {
        await prisma.participant.updateMany({
          where: { sellerId: rawUserId },
          data: { lastSeenAt: new Date() },
        });
      } else {
        await prisma.participant.updateMany({
          where: { userId: rawUserId },
          data: { lastSeenAt: new Date() },
        });
      }

      // Broadcast offline status to all connected users
      const statusMessage = JSON.stringify({
        type: isSeller ? "SELLER_ONLINE_STATUS" : "USER_ONLINE_STATUS",
        payload: {
          userId: rawUserId,
          isOnline: false,
        },
      });

      connectedUsers.forEach((socket, userId) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(statusMessage);
        }
      });
    });
    ws.on("error", (err) => {
      console.error("WebSocket error :", err);
    });
  });
  console.log("WebSocket server ready");
}
