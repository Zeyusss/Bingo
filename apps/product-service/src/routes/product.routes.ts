import express, { Router } from "express";
import {
  getCategoriesWithCount,
  getBestSellersByCategory,
  getBrandsShowcase,
  getThreeProducts,
  getNewProducts,
  getColorsWithCount,
  createDiscountCodes,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getAllEvents,
  getAllProducts,
  getCategories,
  getDiscountCodes,
  getFilteredEvents,
  getFilteredProducts,
  getFilteredShops,
  getTodaysDeals,
  getProductDetails,
  getShopProducts,
  restoreProduct,
  searchProducts,
  topShops,
  updateProduct,
  uploadProductImage,
  searchAdvanced,
  getSearchSuggestions,
  getPopularSearches,
  getSearchFilters,
  getTrendingProducts,
} from "../controllers/product.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import {
  searchRateLimiter,
  suggestionsRateLimiter,
  filtersRateLimiter,
} from "../middleware/rateLimiter";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCodes);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);
router.post("/upload-product-image", isAuthenticated, uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, deleteProductImage);
router.post("/create-product", isAuthenticated, createProduct);
router.get("/get-shop-products", isAuthenticated, getShopProducts);
router.delete("/delete-product/:productId", isAuthenticated, deleteProduct);
router.put("/update-product/:productId", isAuthenticated, updateProduct);
router.put("/restore-product/:productId", isAuthenticated, restoreProduct);
router.get("/get-all-products", getAllProducts);
router.get("/get-all-events", getAllEvents);
router.get("/get-product/:slug", getProductDetails);
router.get("/get-filtered-products", getFilteredProducts);
router.get("/get-filtered-offers", getFilteredEvents);
router.get("/get-todays-deals", getTodaysDeals);
router.get("/get-trending-products", getTrendingProducts);
router.get("/get-filtered-shops", getFilteredShops);
router.get("/search-products", searchProducts);
router.get("/search-advanced", searchRateLimiter, searchAdvanced);
router.get("/search-suggestions", suggestionsRateLimiter, getSearchSuggestions);
router.get("/search-popular", filtersRateLimiter, getPopularSearches);
router.get("/search-filters", filtersRateLimiter, getSearchFilters);
router.get("/top-shops", topShops);
router.get("/categories-with-count", getCategoriesWithCount);
router.get("/colors-with-count", getColorsWithCount);
router.get("/best-sellers", getBestSellersByCategory);
router.get("/brands/showcase", getBrandsShowcase);
router.get("/get-three-products", getThreeProducts);
router.get("/get-new-products", getNewProducts);
export default router;
