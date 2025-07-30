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
} from "../controllers/admin.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.get("/dashboard/revenue", isAuthenticated, isAdmin, getRevenue);
router.get("/dashboard/device-usage", isAuthenticated, isAdmin, getDeviceUsage);
router.get(
  "/dashboard/world-activity",
  isAuthenticated,
  isAdmin,
  getWorldActivity
);
router.get("/dashboard/system-stats", isAuthenticated, isAdmin, getSystemStats);
router.get(
  "/dashboard/resource-monitor",
  isAuthenticated,
  isAdmin,
  getResourceMonitor
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
  demoteSellerToUser
);
router.post(
  "/sellers/:sellerId/promote-to-admin",
  isAuthenticated,
  isAdmin,
  promoteSellerToAdmin
);
router.delete("/sellers/:sellerId", isAuthenticated, isAdmin, deleteSeller);
router.put("/sellers/:sellerId", isAuthenticated, isAdmin, updateSeller);
router.patch(
  "/sellers/:sellerId/restore",
  isAuthenticated,
  isAdmin,
  restoreSeller
);
router.get("/get-all", getAllCustomizations);
router.post("/users/:userId/block", isAuthenticated, isAdmin, blockUser);
router.delete("/users/:userId", isAuthenticated, isAdmin, deleteUser);
router.put("/users/:userId", isAuthenticated, isAdmin, updateUser);
router.post(
  "/users/:userId/promote-to-seller",
  isAuthenticated,
  isAdmin,
  promoteUserToSeller
);
router.patch("/users/:userId/restore", isAuthenticated, isAdmin, restoreUser);
router.get("/users/:userId/details", isAuthenticated, isAdmin, getUserDetails);
router.get(
  "/sellers/:sellerId/details",
  isAuthenticated,
  isAdmin,
  getSellerDetails
);

// Category & Subcategory Config Endpoints
router.get("/config", getConfig);
router.post("/config/category", addCategory);
router.post("/config/subcategory", addSubcategory);
router.delete("/config/category/:name", deleteCategory);
router.delete("/config/subcategory/:category/:name", deleteSubcategory);
router.put("/config/categories/reorder", reorderCategories);
router.put("/config/subcategories/reorder", reorderSubcategories);
router.put("/config/subcategories/move", moveSubcategory);

export default router;
