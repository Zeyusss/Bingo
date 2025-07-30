import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();
    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            "Clothing & Fashion",
            "Jewelry & Accessories",
            "Home Decor",
            "Art & Collectibles",
          ],
          subCategories: {
            "Clothing & Fashion": [
              "Men's Clothing",
              "Women's Clothing",
              "Kids & Baby Clothing",
            ],
            "Jewelry & Accessories": [
              "Necklaces",
              "Bracelets",
              "Rings",
              "Earrings",
            ],
            "Home Decor": [
              "Wall Art",
              "Throw Pillows",
              "Candles & Holders",
              "Vases & Planters",
            ],
            "Art & Collectibles": [
              "Paintings",
              "Prints & Posters",
              "Photography",
              "Sculpture",
            ],
          },
          logo: "https://res.cloudinary.com/dxxzqzq9z/image/upload/v1722361800/logo_qzq9z.png",
          banner:
            "https://res.cloudinary.com/dxxzqzq9z/image/upload/v1722361800/banner_qzq9z.png",
        },
      });
    }
  } catch (error) {
    console.log("Error initializing site config:", error);
  }
};

export default initializeConfig;
