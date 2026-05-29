import express, { Router } from "express";
import {
  getRevenue,
  getDeviceUsage,
  getWorldActivity,
  getSystemStats,
  getResourceMonitor,
  getAllProducts,
  getAllEvents,
  getAllAdmins,
  addNewAdmin,
  getAllCustomizations,
  getAllUsers,
  getAllSellers,
  blockUser,
  deleteUser,
  updateUser,
  blockSeller,
  deleteSeller,
  updateSeller,
  demoteSellerToUser,
  promoteUserToSeller,
  restoreUser,
  restoreSeller,
  getUserDetails,
  getSellerDetails,
  promoteSellerToAdmin,
  getConfig,
  addCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory,
  reorderCategories,
  reorderSubcategories,
  moveSubcategory,
  getPendingVerifications,
  getVerificationDetails,
  reviewVerification,
  getVerificationStats,
  getVerificationHistory,
  getAllNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  markUserNotificationAsRead,
  markAllUserNotificationsAsRead,
  deleteUserNotification,
  deleteAllReadUserNotifications,
  deleteAllReadAdminNotifications,
  getAllSliders,
  createSlider,
  updateSlider,
  deleteSlider,
  reorderSliders,
  uploadSliderImage,
} from "../controllers/admin.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin } from "@packages/middleware/authorizeRoles";
import cronJobsRouter from "./cronJobs.routes";

const router: Router = express.Router();

router.get("/dashboard/revenue", isAuthenticated, isAdmin, getRevenue);
router.get("/dashboard/device-usage", isAuthenticated, isAdmin, getDeviceUsage);
router.get(
  "/dashboard/world-activity",
  isAuthenticated,
  isAdmin,
  getWorldActivity,
);
router.get("/dashboard/system-stats", isAuthenticated, isAdmin, getSystemStats);
router.get(
  "/dashboard/resource-monitor",
  isAuthenticated,
  isAdmin,
  getResourceMonitor,
);
router.get("/get-all-products", isAuthenticated, isAdmin, getAllProducts);
router.get("/get-all-events", isAuthenticated, isAdmin, getAllEvents);
router.get("/get-all-admins", isAuthenticated, isAdmin, getAllAdmins);
router.get("/get-new-admin", isAuthenticated, isAdmin, addNewAdmin);
router.get("/get-all-users", isAuthenticated, isAdmin, getAllUsers);
router.get("/get-all-sellers", isAuthenticated, isAdmin, getAllSellers);
router.post("/sellers/:sellerId/block", isAuthenticated, isAdmin, blockSeller);
router.post(
  "/sellers/:sellerId/demote-to-user",
  isAuthenticated,
  isAdmin,
  demoteSellerToUser,
);
router.post(
  "/sellers/:sellerId/promote-to-admin",
  isAuthenticated,
  isAdmin,
  promoteSellerToAdmin,
);
router.delete("/sellers/:sellerId", isAuthenticated, isAdmin, deleteSeller);
router.put("/sellers/:sellerId", isAuthenticated, isAdmin, updateSeller);
router.patch(
  "/sellers/:sellerId/restore",
  isAuthenticated,
  isAdmin,
  restoreSeller,
);
router.get("/get-all", getAllCustomizations);
// Admin Notification routes
router.get(
  "/get-all-notifications",
  isAuthenticated,
  isAdmin,
  getAllNotifications,
);
router.patch(
  "/notifications/mark-all-read",
  isAuthenticated,
  isAdmin,
  markAllNotificationsAsRead,
);
router.delete(
  "/notifications/delete-all-read",
  isAuthenticated,
  isAdmin,
  deleteAllReadAdminNotifications,
);
router.patch(
  "/notifications/:notificationId/read",
  isAuthenticated,
  isAdmin,
  markNotificationAsRead,
);
router.delete(
  "/notifications/:notificationId",
  isAuthenticated,
  isAdmin,
  deleteNotification,
);

// User Notification routes
router.get("/get-user-notifications", isAuthenticated, getUserNotifications);
router.patch(
  "/user-notifications/mark-all-read",
  isAuthenticated,
  markAllUserNotificationsAsRead,
);
router.delete(
  "/user-notifications/delete-all-read",
  isAuthenticated,
  deleteAllReadUserNotifications,
);
router.patch(
  "/user-notifications/:id/read",
  isAuthenticated,
  markUserNotificationAsRead,
);
router.delete(
  "/user-notifications/:id",
  isAuthenticated,
  deleteUserNotification,
);
router.post("/users/:userId/block", isAuthenticated, isAdmin, blockUser);
router.delete("/users/:userId", isAuthenticated, isAdmin, deleteUser);
router.put("/users/:userId", isAuthenticated, isAdmin, updateUser);
router.post(
  "/users/:userId/promote-to-seller",
  isAuthenticated,
  isAdmin,
  promoteUserToSeller,
);
router.patch("/users/:userId/restore", isAuthenticated, isAdmin, restoreUser);
router.get("/users/:userId/details", isAuthenticated, isAdmin, getUserDetails);
router.get(
  "/sellers/:sellerId/details",
  isAuthenticated,
  isAdmin,
  getSellerDetails,
);
router.get("/config", isAuthenticated, isAdmin, getConfig);
router.post("/config/category", isAuthenticated, isAdmin, addCategory);
router.post("/config/subcategory", isAuthenticated, isAdmin, addSubcategory);
router.delete(
  "/config/category/:name",
  isAuthenticated,
  isAdmin,
  deleteCategory,
);
router.delete(
  "/config/subcategory/:category/:name",
  isAuthenticated,
  isAdmin,
  deleteSubcategory,
);
router.put(
  "/config/categories/reorder",
  isAuthenticated,
  isAdmin,
  reorderCategories,
);
router.put(
  "/config/subcategories/reorder",
  isAuthenticated,
  isAdmin,
  reorderSubcategories,
);
router.put(
  "/config/subcategories/move",
  isAuthenticated,
  isAdmin,
  moveSubcategory,
);

// Verification Management Routes
router.get(
  "/verifications/pending",
  isAuthenticated,
  isAdmin,
  getPendingVerifications,
);
router.get(
  "/verifications/:sellerId",
  isAuthenticated,
  isAdmin,
  getVerificationDetails,
);
router.post(
  "/verifications/:sellerId/review",
  isAuthenticated,
  isAdmin,
  reviewVerification,
);
router.get(
  "/verifications/stats",
  isAuthenticated,
  isAdmin,
  getVerificationStats,
);
router.get(
  "/verifications/history",
  isAuthenticated,
  isAdmin,
  getVerificationHistory,
);

// Slider Management Routes
router.get("/sliders", isAuthenticated, isAdmin, getAllSliders);
router.post("/sliders", isAuthenticated, isAdmin, createSlider);
router.put("/sliders/:sliderId", isAuthenticated, isAdmin, updateSlider);
router.delete("/sliders/:sliderId", isAuthenticated, isAdmin, deleteSlider);
router.put("/sliders/reorder", isAuthenticated, isAdmin, reorderSliders);
router.post(
  "/sliders/upload-image",
  isAuthenticated,
  isAdmin,
  uploadSliderImage,
);

// Cron Jobs Management Routes
router.use("/cron-jobs", cronJobsRouter);

export default router;
