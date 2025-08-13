import prisma from "@packages/libs/prisma";
import cron from "node-cron";



console.log("Shop deletion service: SOFT DELETE ONLY mode - No permanent deletions will occur");


cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();
        console.log("Checking for shops whose deletion time has passed...");
        

        const shopsToProcess = await prisma.shops.findMany({
            where: {
                deletedAt: { 
                    not: null,
                    lte: now 
                },
                sellers: {
                    isDeleted: false
                }
            },
            include: {
                sellers: true
            }
        });

        if (shopsToProcess.length > 0) {
            console.log(`Found ${shopsToProcess.length} shops whose deletion time has passed - blocking associated sellers`);

            for (const shop of shopsToProcess) {
                try {
                 
                    await prisma.sellers.update({
                        where: { id: shop.sellerId },
                        data: {
                            isDeleted: true,
                            deletedAt: now
                        }
                    });

             
                    await prisma.shops.update({
                        where: { id: shop.id },
                        data: {
                            isDeleted: true
                        }
                    });

                    console.log(`Successfully blocked seller ${shop.sellerId} for shop ${shop.name} (ID: ${shop.id})`);
                } catch (error) {
                    console.error(`Error blocking seller for shop ${shop.id}:`, error);
                }
            }

            console.log(`Completed seller blocking process. Blocked ${shopsToProcess.length} sellers.`);
        } else {
            console.log("No shops found whose deletion time has passed.");
        }
        

        const softDeletedShops = await prisma.shops.count({
            where: {
                OR: [
                    { isDeleted: true },
                    { deletedAt: { not: null } }
                ]
            }
        });
        
        const softDeletedSellers = await prisma.sellers.count({
            where: { isDeleted: true }
        });
        
        console.log(`Monitoring: ${softDeletedShops} shops soft-deleted, ${softDeletedSellers} sellers blocked (all data retained)`);
        
    } catch (error) {
        console.error("Error in seller blocking job:", error);
    }
});

console.log("Shop maintenance service initialized - SOFT DELETE ONLY policy active");
