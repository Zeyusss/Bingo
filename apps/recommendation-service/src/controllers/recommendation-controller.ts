import { recommendProducts } from "./../services/recommendationService";
import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";

//get recomended products
export const getRecommendedProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const products = await prisma.products.findMany({
      include: { images: true, Shop: true },
    });

    let userAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId },
      select: { actions: true, recommendations: true, lastTrained: true },
    });
    const now = new Date();
    let recommendedProducts = [];

    if (!userAnalytics) {
      recommendedProducts = products.slice(-10);
    } else {
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

      if (actions.length < 10) {
        recommendedProducts = products.slice(-10);
      } else if (hoursDiff < 3 && recommendations.length > 0) {
        recommendedProducts = products.filter((product:any) =>
          recommendations.includes(product.id)
        );
      } else {
        const recommendedProductsIds = await recommendProducts(
          userId,
          products
        );
        recommendedProducts = products.filter((product:any) =>
          recommendedProductsIds.includes(product.id)
        );
        await prisma.userAnalytics.update({
            where: {userId},
            data:{
                recommendations : recommendedProductsIds,
                lastTrained: now,
            }
        });
    }
    }
    res.status(200).json({
        success:true,
        recommendations: recommendedProducts,
    })
  } catch (error) {
    return next(error);
  }
};

