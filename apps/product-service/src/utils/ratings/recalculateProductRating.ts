export const recalculateProductRating = async (
  prisma: any,
  productsId: string
): Promise<number> => {
  const allReviews = await prisma.productReviews.findMany({
    where: { productsId },
  });

  const averageRating =
    allReviews.length > 0
      ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        allReviews.length
      : 0;

  await prisma.products.update({
    where: { id: productsId },
    data: { ratings: averageRating },
  });

  return averageRating;
};
