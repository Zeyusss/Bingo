import prisma from "@packages/libs/prisma";

export const updateUserAnalytics = async (event: any) => {
  try {
    const existingData = await prisma.userAnalytics.findUnique({
      where: {
        userId: event.userId,
      },
      select: { actions: true },
    });
    let updatedActions: any = existingData?.actions || [];

    const actionExisits = updatedActions.some(
      (entry: any) =>
        entry.productId === event.productId && entry.action === event.action
    );

    // store 'product_view' for recommendations
    if (event.action === "product_view") {
      updatedActions.push({
        productId: event?.productId,
        shopId: event.shopId,
        action: "product_view",
        timestamp: new Date(),
      });
    } else if (
      ["add_to_cart", "add_to_wishlist"].includes(event.action) &&
      !actionExisits
    ) {
      updatedActions.push({
        productId: event?.productId,
        shopId: event.shopId,
        action: event?.action,
        timestamp: new Date(),
      });
    }
    // remove "add to cart" when "remove from cart" is triggered
    else if (event.action === "remove_from_cart") {
      updatedActions = updatedActions.filter(
        (entry: any) =>
          !(
            entry.productId === event.productId &&
            entry.action === "add_to_cart"
          )
      );
    }

    // remove "add to wishlist" when "remove from wishlist" is triggered
    else if (event.action === "remove_from_wishlist") {
      updatedActions = updatedActions.filter(
        (entry: any) =>
          !(
            entry.productId === event.productId &&
            entry.action === "add_to_wishlist"
          )
      );
    }

    // keep only  the last 100 actions (prevent storage overload)
    if (updatedActions.length > 100) {
      updatedActions.shift();
    }
    const extraFields: Record<string, any> = {};

    if (event.country) {
      extraFields.country = event.country;
    }

    if (event.city) {
      extraFields.city = event.city;
    }

    if (event.device) {
      extraFields.device = event.device;
    }

    // update or create user analytics
    await prisma.userAnalytics.upsert({
      where: { userId: event.userId },
      update: {
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
      create: {
        userId: event?.userId,
        lastVisited: new Date(),
        lastTrained: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
    });

    // update product analytics
    await updateProductAnalytics(event);
  } catch (error) {
    console.log("Error storing user Analytics:", error);
  }
};

export const updateProductAnalytics = async (event: any) => {
  try {
    if (!event.productId) return;

    const updateFields: any = {};

    if (event.action === "product_view") updateFields.views = { increment: 1 };
    if (event.action === "add_to_cart")
      updateFields.cartAdds = { increment: 1 };
    if (event.action === "remove_from_cart")
      updateFields.cartAdds = { decrement: 1 };
    if (event.action === "add_to_wishlist")
      updateFields.wishListAdds = { increment: 1 };
    if (event.action === "remove_from_wishlist")
      updateFields.wishListAdds = { decrement: 1 };
    if (event.action === "purchase") updateFields.purchases = { increment: 1 };

    await prisma.productAnalytics.upsert({
      where: { productId: event.productId },
      update: {
        lastViewedAt: new Date(),
        ...updateFields,
      },
      create: {
        productId: event.productId,
        shopId: event.shopId || null,
        views: event.action === "product_view" ? 1 : 0,
        cartAdds: event.action === "add_to_cart" ? 1 : 0,
        wishListAdds: event.action === " add_to_wishlist" ? 1 : 0,
        purchases: event.action === "purchase" ? 1 : 0,
        lastViewedAt: new Date(),
      },
    });
  } catch (error) {
    console.log("Error updating product analytics:", error);
  }
};

export const updateShopAnalytics = async (event: any) => {
  try {
    if (!event.shopId) return;

    
    const existingAnalytics = await prisma.shopAnalytics.findUnique({
      where: { shopId: event.shopId },
    });

    const updateFields: any = {
      lastVisitedAt: new Date(),
    };

    
    if (event.action === "shop_visit") {
      updateFields.totalVisitors = { increment: 1 };

      
      if (event.userId) {
        try {
          await prisma.uniqueShopVisitors.upsert({
            where: {
              shopId_userId: {
                shopId: event.shopId,
                userId: event.userId,
              },
            },
            update: {
              visitedAt: new Date(),
            },
            create: {
              shopId: event.shopId,
              userId: event.userId,
              visitedAt: new Date(),
            },
          });
        } catch (error) {
          console.log("Error tracking unique visitor:", error);
        }
      }
    }

   
    if (event.country || event.city) {
      const currentCountryStats = existingAnalytics?.countryStats || {};
      const currentCityStats = existingAnalytics?.cityStats || {};

      if (event.country && typeof event.country === 'string') {
        const countryKey = event.country as string;
        (currentCountryStats as Record<string, number>)[countryKey] =
          ((currentCountryStats as Record<string, number>)[countryKey] || 0) + 1;
        updateFields.countryStats = currentCountryStats;
      }

      if (event.city && typeof event.city === 'string') {
        const cityKey = event.city as string;
        (currentCityStats as Record<string, number>)[cityKey] = 
          ((currentCityStats as Record<string, number>)[cityKey] || 0) + 1;
        updateFields.cityStats = currentCityStats;
      }
    }

   
    if (event.device && typeof event.device === 'string') {
      const currentDeviceStats = existingAnalytics?.deviceStats || {};
      const deviceKey = event.device as string;
      (currentDeviceStats as Record<string, number>)[deviceKey] = 
        ((currentDeviceStats as Record<string, number>)[deviceKey] || 0) + 1;
      updateFields.deviceStats = currentDeviceStats;
    }

    await prisma.shopAnalytics.upsert({
      where: { shopId: event.shopId },
      update: updateFields,
      create: {
        shopId: event.shopId,
        totalVisitors: event.action === "shop_visit" ? 1 : 0,
        lastVisitedAt: new Date(),
        countryStats: event.country ? { [event.country]: 1 } : {},
        cityStats: event.city ? { [event.city]: 1 } : {},
        deviceStats: event.device ? { [event.device]: 1 } : {},
      },
    });
  } catch (error) {
    console.log("Error updating shop analytics:", error);
  }
};
