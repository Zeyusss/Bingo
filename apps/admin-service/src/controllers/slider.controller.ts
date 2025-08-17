import { NextFunction, Request, Response } from "express";
import prisma from "@packages/libs/prisma";

// Get active sliders for home page (public endpoint)
export const getActiveSliders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sliders = await prisma.sliders.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        linkUrl: true,
        position: true,
        textColor: true,
        textPosition: true,
        overlayOpacity: true,
        buttonText: true,
        buttonColor: true,
        buttonUrl: true,
        autoplaySpeed: true,
      },
    });

    res.status(200).json({
      success: true,
      data: sliders,
    });
  } catch (error) {
    return next(error);
  }
};
