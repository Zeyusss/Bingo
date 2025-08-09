import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();
    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            "Craft Supplies & Tools",
            "Jewelry & Accessories",
            "Clothing & Fashion",
            "Art & Collectibles",
            "Bags & Purses",
            "Bath & Beauty",
            "Pet Supplies",
            "Home Decor",
            "Toys & Games",
            "Wedding",
          ],
          subCategories: {
            "Clothing & Fashion": [
              "Kids & Baby Clothing",
              "Women's Clothing",
              "Men's Clothing",
            ],
            "Jewelry & Accessories": [
              "Necklaces",
              "Bracelets",
              "Earrings",
              "Rings",
            ],
            "Home Decor": [
              "Candles & Holders",
              "Vases & Planters",
              "Throw Pillows",
              "Wall Art",
            ],
            "Art & Collectibles": [
              "Prints & Posters",
              "Photography",
              "Paintings",
              "Sculpture",
            ],
            "Bags & Purses": [
              "Backpacks",
              "Handbags",
              "Wallets",
              "Totes",
              "Belts",
              "Hats",
            ],
            "Craft Supplies & Tools": [
              "Sewing & Fiber",
              "Jewelry Making",
              "Art Supplies",
              "Metalworking",
              "Crafting",
              "DIY Kits",
            ],
            "Bath & Beauty": [
              "Makeup & Cosmetics",
              "Personal Care",
              "Fragrance",
              "Skincare",
              "Perfume",
              "Soaps",
            ],
            "Wedding": [
              "Invitations & Paper",
              "Gifts & Mementos",
              "Decorations",
              "Accessories",
              "Clothing",
              "Jewelry",
              "Shoes",
              "Bags",
            ],
            "Pet Supplies": [
              "Pet Clothing, Accessories & Shoes",
              "Pet Collars & Leashes",
              "Riding & Farm Animals",
              "Pet Health & Wellness",
              "Pet Furniture",
              "Pet Grooming",
              "Pet Toys",
            ],
            "Toys Games":[
              "Sports & Outdoor Recreation",
              "Games & Puzzles",
              "Toys",
            ]

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
