import prisma from "@packages/libs/prisma";
import cron from "node-cron";


cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();
        

        const shopsToDelete = await prisma.shops.findMany({
            where: {
                deletedAt: { 
                    lte: now 
                },
            },
            include: {
                sellers: true,
                products: true,
                images: true,
            }
        });

        if (shopsToDelete.length > 0) {
            console.log(`Found ${shopsToDelete.length} shops scheduled for permanent deletion`);

            for (const shop of shopsToDelete) {
                try {
                    await prisma.$transaction(async (tx) => {
                        const productsCount = Array.isArray(shop.products) ? shop.products.length : (shop.products ? 1 : 0);
                        if (productsCount > 0) {
                            await tx.products.deleteMany({
                                where: { shopId: shop.id }
                            });
                            console.log(`Deleted ${productsCount} products for shop ${shop.id}`);
                        }


                        if (shop.sellerId) {
                            await tx.sellers.delete({
                                where: { id: shop.sellerId }
                            });
                            console.log(`Deleted seller ${shop.sellerId} for shop ${shop.id}`);
                        }

                        const imagesCount = Array.isArray(shop.images) ? shop.images.length : (shop.images ? 1 : 0);
                        if (imagesCount > 0) {
                            await tx.images.deleteMany({
                                where: { shopId: shop.id }
                            });
                            console.log(`Deleted ${imagesCount} images for shop ${shop.id}`);
                        }

                        await tx.shops.delete({
                            where: { id: shop.id }
                        });

                        console.log(`Successfully deleted shop: ${shop.name} (ID: ${shop.id})`);
                    });

                } catch (error) {
                    console.error(`Error deleting shop ${shop.id}:`, error);
                }
            }

            console.log(`Completed shop deletion process. Deleted ${shopsToDelete.length} shops.`);
        }

    } catch (error) {
        console.error("Error in shop deletion cron job:", error);
    }
});

console.log("Shop deletion cron job initialized - runs every hour");
