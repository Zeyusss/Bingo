import express, { Router } from "express";
import {
  deleteShop,
  editSellerProfile,
  followShop,
  getSellerEvents,
  getSellerInfo,
  getSellerProducts,
  isFollowing,
  restoreShop,
  unfollowShop,
  updateProfilePictures,
  uploadImage,
  createShopReview,
  getShopReviews,
  deleteShopReview,
  getUserReview,
  getShopAnalytics,
  getShopRevenue,
  getShopStats,
  getShopRecentOrders,
  getShopDeviceUsage,
  getShopWorldActivity,
  getShopVisitorAnalytics,
  getShopTopSellingProducts,
  trackShopVisitor,
  createEvent,
  updateEvent,
  removeEvent,
} from "../controllers/seller.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.delete("/delete", isAuthenticated, deleteShop);
router.put("/restore", isAuthenticated, restoreShop);
router.post("/upload-image", isAuthenticated, uploadImage);
router.put("/update-image", isAuthenticated, updateProfilePictures);
router.put("/edit-profile", isAuthenticated, editSellerProfile);
router.get("/get-seller/:id", getSellerInfo);
router.get("/get-seller-products/:id", getSellerProducts);
router.get("/get-seller-events/:id", getSellerEvents);
router.post("/create-event/:id", isAuthenticated, isSeller, createEvent);
router.put("/update-event/:id", isAuthenticated, isSeller, updateEvent);
router.delete("/remove-event/:id", isAuthenticated, isSeller, removeEvent);
router.post("/follow-shop", isAuthenticated, followShop);
router.post("/unfollow-shop", isAuthenticated, unfollowShop);
router.get("/is-following/:id", isAuthenticated, isFollowing);
router.post("/create-review", isAuthenticated, createShopReview);
router.get("/get-reviews/:id", getShopReviews);
router.delete("/delete-review", isAuthenticated, deleteShopReview);
router.get("/get-user-review/:id", isAuthenticated, getUserReview);
router.get("/analytics", isAuthenticated, isSeller, getShopAnalytics);

router.get("/dashboard/revenue", isAuthenticated, isSeller, getShopRevenue);
router.get("/dashboard/shop-stats", isAuthenticated, isSeller, getShopStats);
router.get(
  "/dashboard/recent-orders",
  isAuthenticated,
  isSeller,
  getShopRecentOrders
);
router.get(
  "/dashboard/device-usage",
  isAuthenticated,
  isSeller,
  getShopDeviceUsage
);
router.get(
  "/dashboard/world-activity",
  isAuthenticated,
  isSeller,
  getShopWorldActivity
);
router.get(
  "/dashboard/visitor-analytics",
  isAuthenticated,
  isSeller,
  getShopVisitorAnalytics
);
router.get(
  "/dashboard/top-selling-products",
  isAuthenticated,
  isSeller,
  getShopTopSellingProducts
);

router.post("/track-visitor", trackShopVisitor);

export default router;
