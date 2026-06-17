import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import {
  clearUnseenCount,
  getUnseenCount,
} from "@packages/libs/redis/message.redis";
import { NextFunction, Response } from "express";

// creating new conv
export const newConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    const userId = req.user.id;

    if (!sellerId) {
      return next(new ValidationError("Seller Id is required!"));
    }

    const existingGroup = await prisma.conversationGroup.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, sellerId],
        },
      },
    });

    if (existingGroup) {
      return res
        .status(200)
        .json({ conversation: existingGroup, isNew: false });
    }

    const newGroup = await prisma.conversationGroup.create({
      data: {
        isGroup: false,
        creatorId: userId,
        participantIds: [userId, sellerId],
      },
    });

    await prisma.participant.createMany({
      data: [
        {
          conversationId: newGroup.id,
          userId,
        },
        {
          conversationId: newGroup.id,
          sellerId,
        },
      ],
    });

    return res.status(201).json({ conversation: newGroup, isNew: true });
  } catch (error) {
    return next(error);
  }
};

// get user conv
export const getUserConversations = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: { participantIds: { has: userId } },
      orderBy: { updatedAt: "desc" },
    });

    const conversationIds = conversations.map((c) => c.id);

    const [allParticipants, lastMessages] = await Promise.all([
      prisma.participant.findMany({
        where: { conversationId: { in: conversationIds }, sellerId: { not: null } },
      }),
      prisma.message.findMany({
        where: { conversationId: { in: conversationIds } },
        orderBy: { createdAt: "desc" },
        distinct: ["conversationId"],
      }),
    ]);

    const sellerIds = allParticipants.map((p) => p.sellerId).filter(Boolean) as string[];
    const sellers = await prisma.sellers.findMany({
      where: { id: { in: sellerIds } },
      include: { shop: { include: { avatar: true } } },
    });

    const participantMap = new Map(allParticipants.map((p) => [p.conversationId, p]));
    const sellerMap = new Map(sellers.map((s) => [s.id, s]));
    const lastMessageMap = new Map(lastMessages.map((m) => [m.conversationId, m]));

    const onlineChecks = await Promise.all(
      allParticipants.map((p) => p.sellerId ? redis.get(`online:seller:${p.sellerId}`) : Promise.resolve(null))
    );
    const onlineMap = new Map(allParticipants.map((p, i) => [p.sellerId, !!onlineChecks[i]]));

    const responseData = await Promise.all(
      conversations.map(async (group) => {
        const participant = participantMap.get(group.id);
        const seller = participant?.sellerId ? sellerMap.get(participant.sellerId) : null;
        const lastMessage = lastMessageMap.get(group.id);
        const isOnline = participant?.sellerId ? (onlineMap.get(participant.sellerId) ?? false) : false;
        const unreadCount = await getUnseenCount("user", group.id);

        return {
          conversationId: group.id,
          seller: {
            id: seller?.id || null,
            name: seller?.shop?.name || "Unknown",
            isOnline,
            lastSeenAt: participant?.lastSeenAt ?? null,
            avatar: seller?.shop?.avatar?.url || "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756",
          },
          lastMessage: lastMessage?.content || "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      })
    );

    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

// get seller conv

export const getSellerConversations = async (req: any, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.seller.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: { participantIds: { has: sellerId } },
      orderBy: { updatedAt: "desc" },
    });

    const conversationIds = conversations.map((c) => c.id);

    const [allParticipants, lastMessages] = await Promise.all([
      prisma.participant.findMany({
        where: { conversationId: { in: conversationIds }, userId: { not: null } },
      }),
      prisma.message.findMany({
        where: { conversationId: { in: conversationIds } },
        orderBy: { createdAt: "desc" },
        distinct: ["conversationId"],
      }),
    ]);

    const userIds = allParticipants.map((p) => p.userId).filter(Boolean) as string[];
    const users = await prisma.users.findMany({
      where: { id: { in: userIds } },
      include: { avatar: true },
    });

    const participantMap = new Map(allParticipants.map((p) => [p.conversationId, p]));
    const userMap = new Map(users.map((u) => [u.id, u]));
    const lastMessageMap = new Map(lastMessages.map((m) => [m.conversationId, m]));

    const onlineChecks = await Promise.all(
      allParticipants.map((p) => p.userId ? redis.get(`online:user:${p.userId}`) : Promise.resolve(null))
    );
    const onlineMap = new Map(allParticipants.map((p, i) => [p.userId, !!onlineChecks[i]]));

    const responseData = await Promise.all(
      conversations.map(async (group) => {
        const participant = participantMap.get(group.id);
        const user = participant?.userId ? userMap.get(participant.userId) : null;
        const lastMessage = lastMessageMap.get(group.id);
        const isOnline = participant?.userId ? (onlineMap.get(participant.userId) ?? false) : false;
        const unreadCount = await getUnseenCount("seller", group.id);

        return {
          conversationId: group.id,
          user: {
            id: user?.id || null,
            name: user?.name || "Unknown",
            isOnline,
            lastSeenAt: participant?.lastSeenAt ?? null,
            avatar: user?.avatar?.url || "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756",
          },
          lastMessage: lastMessage?.content || "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      })
    );

    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

//fetch user messages
export const fetchMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(conversationId)) {
      return res.status(400).json({ status: "error", message: "Invalid conversationId format" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError("Conversation ID is required"));
    }

    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError("Conversation not found"));
    }

    const hasAccess = conversation.participantIds.includes(userId);
    if (!hasAccess) {
      return next(new AuthError("Access denied to this conversation"));
    }

    const sellerParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        sellerId: { not: null },
      },
    });

    let seller = null;
    let isOnline = false;

    if (sellerParticipant?.sellerId) {
      seller = await prisma.sellers.findUnique({
        where: { id: sellerParticipant.sellerId },
        include: {
          shop: {
            include: {
              avatar: true,
            },
          },
        },
      });

      const redisKey = `online:seller:${sellerParticipant.sellerId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize + 1,
    });

    const hasMore = messages.length > pageSize;
    if (hasMore) messages.pop();

    await clearUnseenCount("user", conversationId);

    return res.status(200).json({
      messages,
      seller: {
        id: seller?.id || null,
        name: seller?.shop?.name || "Unknowm",
        avatar: seller?.shop?.avatar?.url || "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756",
        isOnline,
        lastSeenAt: sellerParticipant?.lastSeenAt ?? null,
      },
      currentPage: page,
      hasMore,
    });
  } catch (error) {
    return next(error);
  }
};

//fetch seller messages
export const fetchSellerMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;
    const { conversationId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(conversationId)) {
      return res.status(400).json({ status: "error", message: "Invalid conversationId format" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError("Conversation ID is required"));
    }

    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError("Conversation not found"));
    }

    if (!conversation.participantIds.includes(sellerId)) {
      return next(new AuthError("Access denied to this conversation"));
    }

    const userParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: { not: null },
      },
    });

    let user = null;
    let isOnline = false;
    if (userParticipant?.userId) {
      user = await prisma.users.findUnique({
        where: { id: userParticipant.userId },
        include: {
          avatar: true,
        },
      });

      const redisKey = `online:user:${userParticipant.userId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize + 1,
    });

    const hasMore = messages.length > pageSize;
    if (hasMore) messages.pop();

    await clearUnseenCount("seller", conversationId);

    return res.status(200).json({
      messages,
      user: {
        id: user?.id || null,
        name: user?.name || "Unknowm",
        avatar: user?.avatar?.url || "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756",
        isOnline,
        lastSeenAt: userParticipant?.lastSeenAt ?? null,
      },
      currentPage: page,
      hasMore,
    });
  } catch (error) {
    return next(error);
  }
};
