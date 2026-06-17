import { recommendProducts } from "./../services/recommendationService";
import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";

export const getRecommendedProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const userAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId },
      select: { actions: true, recommendations: true, lastTrained: true },
    });

    const now = new Date();

    if (!userAnalytics) {
      const fallback = await prisma.products.findMany({
        where: { isDeleted: false },
        include: { images: true, Shop: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      return res.status(200).json({ success: true, recommendations: fallback });
    }

    const actions = Array.isArray(userAnalytics.actions)
      ? (userAnalytics.actions as any[])
      : [];

    const recommendations = Array.isArray(userAnalytics.recommendations)
      ? (userAnalytics.recommendations as string[])
      : [];

    const lastTrainedTime = userAnalytics.lastTrained
      ? new Date(userAnalytics.lastTrained)
      : null;

    const hoursDiff = lastTrainedTime
      ? (now.getTime() - lastTrainedTime.getTime()) / (1000 * 60 * 60)
      : Infinity;

    if (hoursDiff < 3 && recommendations.length > 0) {
      const cached = await prisma.products.findMany({
        where: { id: { in: recommendations }, isDeleted: false },
        include: { images: true, Shop: true },
      });
      return res.status(200).json({ success: true, recommendations: cached });
    }

    if (actions.length < 10) {
      const fallback = await prisma.products.findMany({
        where: { isDeleted: false },
        include: { images: true, Shop: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      return res.status(200).json({ success: true, recommendations: fallback });
    }

    const allProducts = await prisma.products.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        shopId: true,
        categories: true,
        ratings: true,
        isDeleted: true,
      },
    });

    const recommendedIds = await recommendProducts(userId, allProducts);

    const recommended = await prisma.products.findMany({
      where: { id: { in: recommendedIds }, isDeleted: false },
      include: { images: true, Shop: true },
    });

    await prisma.userAnalytics.update({
      where: { userId },
      data: {
        recommendations: recommendedIds,
        lastTrained: now,
      },
    });

    return res.status(200).json({ success: true, recommendations: recommended });
  } catch (error) {
    return next(error);
  }
};
